const Tenant = require("../../models/Tenant-model");
const Property = require("../../models/Property-Model");
const Unit = require("../../models/Unit-model");
const Floor = require("../../models/Floor-model");
const User = require("../../models/User-model");
const Owner = require("../../models/Owner-model");

const bcrypt = require("bcryptjs");

const createTenant = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            propertyId,
            unitId,
            floorId,
            managerId,
            leaseStart,
            leaseEnd,
            leaseStatus,
            rent,
            deposit,
            paymentStatus,
            totalCollected,
            pending,
            maintenanceCost,
            lateFees,
            maintenanceRequests,
            openRequests,
            avatar,
            isActive
        } = req.body;

        const loggedInUserId = req.user._id;
        const role = req.user.role;

        if (role !== "MANAGER") {
            return res.status(403).json({ message: "Only managers can add tenants" });
        }

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Validate unit and floor
        const unit = await Unit.findOne({ _id: unitId, propertyId });
        if (!unit) {
            return res.status(404).json({ message: "Unit not found for this property" });
        }

        const floor = await Floor.findOne({ _id: floorId, propertyId });
        if (!floor) {
            return res.status(404).json({ message: "Floor not found for this property" });
        }

        // Find or Create User
        let user = await User.findOne({ email });
        if (!user) {
            // Create a new tenant user
            const hashedPassword = await bcrypt.hash("Tenant@123", 10);
            user = await User.create({
                name,
                email,
                phone,
                password: hashedPassword,
                role: "TENANT",
                isActive: true,
                createdBy: loggedInUserId
            });
        } else {
            // If user exists, ensure they are marked as TENANT (optional update) or just use them
            if (user.role !== "TENANT") {
                user.role = "TENANT";
                await user.save();
            }
        }

        // Create Tenant
        const tenant = await Tenant.create({
            userId: user._id,
            propertyId,
            unitId,
            floorId,
            managerId: managerId || loggedInUserId, // Use provided managerId or logged-in user
            leaseStart,
            leaseEnd,
            leaseStatus,
            rent,
            deposit,
            paymentStatus,
            totalCollected,
            pending,
            maintenanceCost,
            lateFees,
            maintenanceRequests,
            openRequests,
            avatar: avatar || name.split(' ').map(n => n[0]).join(''),
            isActive
        });

        // Update Unit status to Occupied
        await Unit.findByIdAndUpdate(unitId, { status: "Occupied" });

        res.status(201).json({ message: "Tenant created successfully", tenant });
    } catch (error) {
        console.error("Error in createTenant:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Duplicate tenant record for this unit/user" });
        }
        res.status(500).json({ message: "Failed to create tenant", error: error.message });
    }
};

const getTenants = async (req, res) => {
    try {
        // Auto-update statuses based on dates before fetching
        await Tenant.autoUpdateStatuses();

        const { propertyId, leaseStatus, paymentStatus } = req.query;
        const role = req.user.role;
        const userId = req.user._id;
        let query = {};

        if (propertyId) query.propertyId = propertyId;
        if (leaseStatus) query.leaseStatus = leaseStatus;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner) return res.status(403).json({ message: "Owner profile not found" });

            // Ensure propertyId belongs to owner if provided
            if (propertyId) {
                const property = await Property.findById(propertyId);
                if (!property || property.owner.toString() !== owner._id.toString()) {
                    return res.status(403).json({ message: "Access denied to this property" });
                }
            } else {
                // Fetch all tenants for all properties owned by this owner
                const properties = await Property.find({ owner: owner._id }).select("_id");
                const propertyIds = properties.map(p => p._id);
                query.propertyId = { $in: propertyIds };
            }
        } else if (role === "MANAGER") {
            query.managerId = userId;
        } else if (role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const tenants = await Tenant.find(query)
            .populate("userId", "name email phone")
            .populate("propertyId", "propertyName address")
            .populate("unitId", "unitNumber")
            .populate("floorId", "name floorNumber")
            .populate("managerId", "name email");

        res.status(200).json({ message: "Tenants fetched successfully", tenants });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tenants", error: error.message });
    }
};

const getTenantById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;

        // Auto-update statuses based on dates before fetching
        await Tenant.autoUpdateStatuses();

        const tenant = await Tenant.findById(id)
            .populate("userId", "name email phone")
            .populate("propertyId", "propertyName owner address")
            .populate("unitId", "unitNumber")
            .populate("floorId", "name floorNumber")
            .populate("managerId", "name email");

        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner || tenant.propertyId.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        } else if (role === "MANAGER") {
            if (tenant.managerId?.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        } else if (role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ message: "Tenant fetched successfully", tenant });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tenant", error: error.message });
    }
};

const updateTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;

        const tenant = await Tenant.findById(id).populate("propertyId");
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        if (role !== "MANAGER") {
            return res.status(403).json({ message: "Only managers can update tenants" });
        }

        // Ensure manager can only update their own tenants (existing check)
        if (tenant.managerId?.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this tenant" });
        }

        const { name, email, phone, propertyId, unitId, floorId } = req.body;

        // Update User info if changed
        if (name || email || phone) {
            const userUpdate = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email;
            if (phone) userUpdate.phone = phone;
            await User.findByIdAndUpdate(tenant.userId, userUpdate);
        }

        // Handle property/unit change
        if (unitId && unitId.toString() !== tenant.unitId.toString()) {
            // Check if new unit exists and is vacant
            const newUnit = await Unit.findById(unitId);
            if (!newUnit) {
                return res.status(404).json({ message: "New unit not found" });
            }
            if (newUnit.status !== "Vacant") {
                return res.status(400).json({ message: "New unit is already occupied" });
            }

            // Update old unit to Vacant
            await Unit.findByIdAndUpdate(tenant.unitId, { status: "Vacant" });
            // Update new unit to Occupied
            await Unit.findByIdAndUpdate(unitId, { status: "Occupied" });

            tenant.unitId = unitId;
            if (propertyId) tenant.propertyId = propertyId;
            if (floorId) tenant.floorId = floorId;
        } else {
            // Even if unitId hasn't changed, we might want to update property/floor for accuracy if they were passed
            if (propertyId) tenant.propertyId = propertyId;
            if (floorId) tenant.floorId = floorId;
        }

        const allowedFields = [
            "leaseStart",
            "leaseEnd",
            "leaseStatus",
            "rent",
            "deposit",
            "paymentStatus",
            "totalCollected",
            "pending",
            "maintenanceCost",
            "lateFees",
            "maintenanceRequests",
            "openRequests",
            "avatar",
            "isActive"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                tenant[field] = req.body[field];
            }
        });

        await tenant.save();
        res.status(200).json({ message: "Tenant updated successfully", tenant });
    } catch (error) {
        res.status(500).json({ message: "Failed to update tenant", error: error.message });
    }
};

const deleteTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;

        const tenant = await Tenant.findById(id).populate("propertyId");
        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" });
        }

        if (role !== "MANAGER") {
            return res.status(403).json({ message: "Only managers can delete tenants" });
        }

        // Ensure manager can only delete their own tenants
        if (tenant.managerId?.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this tenant" });
        }

        const unitId = tenant.unitId;
        await tenant.deleteOne();

        // Update Unit status to Vacant
        await Unit.findByIdAndUpdate(unitId, { status: "Vacant" });

        res.status(200).json({ message: "Tenant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete tenant", error: error.message });
    }
};

const getLeaseByTenant = async (req, res) => {
    try {
        const userId = req.user._id;

        // Auto-update statuses based on dates before fetching
        await Tenant.autoUpdateStatuses();

        const tenant = await Tenant.findOne({ userId })
            .populate("userId", "name email phone")
            .populate("propertyId", "propertyName address")
            .populate("unitId", "unitNumber")
            .populate("floorId", "name floorNumber")
            .populate("managerId", "name email");

        if (!tenant) {
            return res.status(404).json({ message: "Lease not found for this user" });
        }

        res.status(200).json({ message: "Lease details fetched successfully", lease: tenant });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lease details", error: error.message });
    }
};

module.exports = {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
    getLeaseByTenant
};
