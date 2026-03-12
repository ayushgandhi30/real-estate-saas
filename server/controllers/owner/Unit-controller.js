const Unit = require("../../models/Unit-model.js");
const Floor = require("../../models/Floor-model.js");
const Owner = require("../../models/Owner-model.js");
const Property = require("../../models/Property-Model.js");

const createUnit = async (req, res) => {
    try {
        const {
            propertyId,
            floorId,
            unitNumber,
            unitType,
            area,
            bedrooms,
            bathrooms,
            balcony,
            rentAmount,
            securityDeposit,
            utilityIncluded,
            status,
            tenantId,
            leaseId,
            images,
            floorPlan,
            isActive
        } = req.body;

        const ownerUserId = req.user._id;
        const role = req.user.role;

        if (role !== "OWNER" && role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: ownerUserId });
            if (!owner || property.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "Unauthorized to add unit in this property" });
            }
        }

        const floor = await Floor.findOne({ _id: floorId, propertyId });
        if (!floor) {
            return res.status(404).json({ message: "Floor not found for this property" });
        }

        const unit = await Unit.create({
            propertyId,
            floorId,
            unitNumber,
            unitType,
            area,
            bedrooms,
            bathrooms,
            balcony,
            rentAmount,
            securityDeposit,
            utilityIncluded,
            status,
            images,
            floorPlan,
            isActive
        });

        // Update Property totalUnits
        await Property.findByIdAndUpdate(propertyId, { $inc: { totalUnits: 1 } });

        res.status(201).json({ message: "Unit created successfully", unit });
    } catch (error) {
        res.status(500).json({ message: "Failed to create unit", error: error.message });
    }
};

const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;

        if (role !== "OWNER" && role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const unit = await Unit.findById(id);
        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        const propertyId = req.body.propertyId || unit.propertyId;
        const floorId = req.body.floorId || unit.floorId;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner || property.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "Unauthorized to update unit in this property" });
            }
        }

        const floor = await Floor.findOne({ _id: floorId, propertyId });
        if (!floor) {
            return res.status(404).json({ message: "Floor not found for this property" });
        }

        const allowedFields = [
            "propertyId",
            "floorId",
            "unitNumber",
            "unitType",
            "area",
            "bedrooms",
            "bathrooms",
            "balcony",
            "rentAmount",
            "securityDeposit",
            "utilityIncluded",
            "status",
            "images",
            "floorPlan",
            "isActive"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                unit[field] = req.body[field];
            }
        });

        await unit.save();

        return res.status(200).json({ message: "Unit updated successfully", unit });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Unit number already exists in this property" });
        }
        return res.status(500).json({ message: "Failed to update unit", error: error.message });
    }
};

const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user.role;
        const userId = req.user._id;

        if (role !== "OWNER" && role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const unit = await Unit.findById(id);
        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        const property = await Property.findById(unit.propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner || property.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "Unauthorized to delete unit in this property" });
            }
        }

        await unit.deleteOne();
        await Property.findByIdAndUpdate(unit.propertyId, { $inc: { totalUnits: -1 } });

        return res.status(200).json({ message: "Unit deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete unit", error: error.message });
    }
};

const getUnits = async (req, res) => {
    try {
        const { propertyId, floorId } = req.query;
        const role = req.user.role;
        const userId = req.user._id;
        const query = {};

        if (propertyId) query.propertyId = propertyId;
        if (floorId) query.floorId = floorId;

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner) return res.status(403).json({ message: "Owner profile not found" });

            // Filter units through properties owned by this owner
            const properties = await Property.find({ owner: owner._id }).select("_id");
            const propertyIds = properties.map(p => p._id);
            query.propertyId = { $in: propertyIds };

            // If propertyId was in query, ensure it belongs to this owner
            if (propertyId) {
                if (!propertyIds.map(id => id.toString()).includes(propertyId)) {
                    return res.status(403).json({ message: "Access denied to this property" });
                }
                query.propertyId = propertyId;
            }
        } else if (role !== "SUPER_ADMIN" && role !== "MANAGER") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const units = await Unit.find(query)
            .populate("propertyId", "propertyName")
            .populate("floorId", "name floorNumber");

        res.status(200).json({ message: "Units fetched successfully", units });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch units", error: error.message });
    }
};

module.exports = { createUnit, updateUnit, deleteUnit, getUnits };
