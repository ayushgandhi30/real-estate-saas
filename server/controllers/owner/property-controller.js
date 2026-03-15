const Owner = require("../../models/Owner-model");
const Property = require("../../models/Property-Model");
const Invoice = require("../../models/Invoice-model");
const Unit = require("../../models/Unit-model");

const createProperty = async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            propertyName,
            propertyType,
            description,
            location,
            address,
            city,
            state,
            zipCode,
            country,
            isActive,
            manager
        } = req.body;

        let owner = await Owner.findOne({ user: userId });

        if (!owner) {
            if (req.user.role === "OWNER" || req.user.role === "MANAGER") {
                owner = await Owner.create({
                    user: userId,
                    ownerType: "INDIVIDUAL",
                    contactNumber: req.user.phone || "0000000000",
                    isApproved: true,
                    approvedBy: userId
                });
            } else {
                return res.status(400).json({ message: "Owner profile not found" });
            }
        }

        if (!owner.isApproved) {
            return res.status(403).json({
                message: "Owner not approved by admin"
            });
        }

        const property = await Property.create({
            owner: owner._id,
            propertyName,
            propertyType,
            description,
            location,
            address,
            city,
            state,
            zipCode,
            country,
            isActive: isActive !== undefined ? isActive : true,
            manager: manager || null
        });

        res.status(201).json({
            message: "Property created successfully",
            property
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProperties = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {};

        if (role === "OWNER") {
            let owner = await Owner.findOne({ user: userId });

            if (!owner) {
                owner = await Owner.create({
                    user: userId,
                    ownerType: "INDIVIDUAL",
                    contactNumber: req.user.phone || "0000000000",
                    isApproved: true
                });
            }
            query = { owner: owner._id };
        } else if (role === "MANAGER") {
            // Managers can only see properties assigned to them
            query = { manager: userId };
        } else if (role === "SUPER_ADMIN") {
            query = {};
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const properties = await Property.find(query)
            .populate({
                path: "owner",
                select: "companyName ownerType",
                populate: {
                    path: "user",
                    select: "name"
                }
            })
            .populate("manager", "name email phone")
            .lean();

        // Calculate total revenue for each property
        const propertiesWithRevenue = await Promise.all(properties.map(async (property) => {
            const revenueResult = await Invoice.aggregate([
                {
                    $match: {
                        propertyId: property._id,
                        status: "Paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                }
            ]);

            const vacantUnits = await Unit.countDocuments({
                propertyId: property._id,
                status: "Vacant"
            });

            return {
                ...property,
                totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
                vacantUnits: vacantUnits || 0
            };
        }));

        res.status(200).json({
            message: "Properties fetched successfully",
            properties: propertiesWithRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProperty = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const propertyId = req.params.id;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Logic check: only owner or super admin should be able to update manager? 
        // Or owner of the property
        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner || property.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "You are not allowed to update this property" });
            }
        } else if (role === "MANAGER") {
            // A manager could update details of their assigned property if permitted, 
            // but normally assigning a manager is an OWNER action.
            if (property.manager?.toString() !== userId.toString()) {
                return res.status(403).json({ message: "You are not the assigned manager for this property" });
            }
        } else if (role !== "SUPER_ADMIN") {
            return res.status(403).json({ message: "Unauthorized role" });
        }

        const allowedFields = [
            "propertyName",
            "propertyType",
            "description",
            "location",
            "address",
            "city",
            "state",
            "zipCode",
            "country",
            "isActive",
            "manager"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                property[field] = req.body[field];
            }
        });

        await property.save();

        res.status(200).json({
            message: "Property updated successfully",
            property
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProperty = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const propertyId = req.params.id;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (role === "OWNER") {
            const owner = await Owner.findOne({ user: userId });
            if (!owner || property.owner.toString() !== owner._id.toString()) {
                return res.status(403).json({ message: "You are not allowed to delete this property" });
            }
        } else if (role === "SUPER_ADMIN") {
            // Allow super admin to delete
        } else {
            return res.status(403).json({ message: "Unauthorized to delete property" });
        }

        await property.deleteOne();

        res.status(200).json({
            message: "Property deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProperty, updateProperty, deleteProperty, getProperties };
