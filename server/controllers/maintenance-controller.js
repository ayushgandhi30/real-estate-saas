const Maintenance = require("../models/Maintenance-model");
const Tenant = require("../models/Tenant-model");
const Property = require("../models/Property-Model");

// 🛠️ Create Request (Tenant or Manager)
const createRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const { title, description, category, priority, propertyId, unitId, tenantId } = req.body;

        let finalPropertyId, finalUnitId, finalManagerId, finalTenantId, finalOwnerId;

        if (role === "TENANT") {
            // Find tenant record to get property and unit info
            const tenantRecord = await Tenant.findOne({ userId });
            if (!tenantRecord) {
                return res.status(404).json({ message: "Tenant record not found" });
            }
            finalPropertyId = tenantRecord.propertyId;
            finalUnitId = tenantRecord.unitId;
            finalTenantId = userId;
        } else if (role === "MANAGER") {
            // Managers can create requests for properties they manage
            finalPropertyId = propertyId;
            finalUnitId = unitId;
            finalTenantId = tenantId; // Can be null if for common area
        } else {
            return res.status(403).json({ message: "Unauthorized to create maintenance requests" });
        }

        if (!finalPropertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // Fetch property to get current owner and assigned manager
        const property = await Property.findById(finalPropertyId).populate("owner");
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Only the assigned manager should be able to create requests if the role is MANAGER
        if (role === "MANAGER" && property.manager?.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not the assigned manager for this property" });
        }

        // property.owner is a reference to Owner model, which has a user field
        finalOwnerId = property.owner.user;
        finalManagerId = property.manager; // Use the manager currently assigned to the property

        const newRequest = await Maintenance.create({
            tenantId: finalTenantId,
            propertyId: finalPropertyId,
            unitId: finalUnitId,
            managerId: finalManagerId,
            ownerId: finalOwnerId,
            title,
            description,
            category,
            priority,
            status: "Pending"
        });

        res.status(201).json({ message: "Maintenance request created successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Failed to create request", error: error.message });
    }
};

// 📋 Get All Requests (Role-based)
const getRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        let query = {};

        if (role === "TENANT") {
            query.tenantId = userId;
        } else if (role === "MANAGER") {
            // Managers see requests for all properties they are currently assigned to
            const managedProperties = await Property.find({ manager: userId }).select("_id");
            const propertyIds = managedProperties.map(p => p._id);
            query.propertyId = { $in: propertyIds };
        } else if (role === "OWNER") {
            // Owners see requests for all their properties via ownerId field
            query.ownerId = userId;
        } else if (role === "SUPER_ADMIN") {
            query = {}; // Super Admin sees everything
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const requests = await Maintenance.find(query)
            .populate("tenantId", "name email phone")
            .populate("propertyId", "propertyName address")
            .populate("unitId", "unitNumber")
            .populate("managerId", "name email")
            .populate("ownerId", "name email")
            .populate("technicianId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ requests });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch requests", error: error.message });
    }
};

// ✏️ Update Request Status/Assignment (Manager/Technician)
const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, technicianId, priority, notes } = req.body;
        const role = req.user.role;

        if (role === "TENANT" && (status || technicianId)) {
            return res.status(403).json({ message: "Tenants cannot update status or assign technicians" });
        }

        const request = await Maintenance.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (status) request.status = status;
        if (technicianId) request.technicianId = technicianId;
        if (priority) request.priority = priority;

        if (notes) {
            request.notes.push({
                user: req.user._id,
                text: notes,
                date: new Date()
            });
        }

        await request.save();
        res.status(200).json({ message: "Request updated successfully", request });
    } catch (error) {
        res.status(500).json({ message: "Failed to update request", error: error.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateRequest
};
