const Invoice = require("../models/Invoice-model");
const Tenant = require("../models/Tenant-model");
const Property = require("../models/Property-Model");

// ────────────────────────────────────────────────────────────
// Helper: generate invoice number  →  INV-YYYYMM-XXXX
// ────────────────────────────────────────────────────────────
const generateInvoiceNumber = async () => {
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = await Invoice.countDocuments();
    return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

// ────────────────────────────────────────────────────────────
// POST /api/invoice/invoice
// Only MANAGER can create invoices
// Body: { tenantId, month, rent, utilityCharges, maintenanceCharges, lateFee, dueDate, notes }
// ────────────────────────────────────────────────────────────
const createInvoice = async (req, res) => {
    try {
        const managerId = req.user._id;
        const {
            tenantId,
            month,
            rent,
            utilityCharges = 0,
            maintenanceCharges = 0,
            lateFee = 0,
            dueDate,
            notes,
        } = req.body;

        // Validate required fields
        if (!tenantId || !month || !rent || !dueDate) {
            return res.status(400).json({
                message: "tenantId, month, rent, and dueDate are required",
            });
        }

        // Find the tenant record to get property / unit / owner info
        const tenantRecord = await Tenant.findOne({ userId: tenantId });
        if (!tenantRecord) {
            return res.status(404).json({ message: "Tenant record not found" });
        }

        const { propertyId, unitId } = tenantRecord;

        // Fetch property to resolve ownerId
        const property = await Property.findById(propertyId).populate("owner");
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Make sure the requesting manager is actually assigned to this property
        if (property.manager?.toString() !== managerId.toString()) {
            return res.status(403).json({
                message: "You are not the assigned manager for this property",
            });
        }

        const ownerId = property.owner?.user; // Owner model has a 'user' ref
        const invoiceNumber = await generateInvoiceNumber();

        const invoice = await Invoice.create({
            invoiceNumber,
            tenantId,
            managerId,
            ownerId,
            propertyId,
            unitId,
            month,
            rent,
            utilityCharges,
            maintenanceCharges,
            lateFee,
            dueDate: new Date(dueDate),
            notes,
            status: "Unpaid",
        });

        return res.status(201).json({
            message: "Invoice created successfully",
            invoice,
        });
    } catch (error) {
        console.error("CREATE INVOICE ERROR:", error);
        return res.status(500).json({
            message: "Failed to create invoice",
            error: error.message,
        });
    }
};

// ────────────────────────────────────────────────────────────
// GET /api/invoice/invoices
// Role-based visibility:
//   TENANT  → only their own invoices
//   MANAGER → invoices for all properties they manage
// ────────────────────────────────────────────────────────────
const getAllInvoices = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {};

        if (role === "TENANT") {
            // Tenant sees only their invoices
            query.tenantId = userId;
        } else if (role === "MANAGER") {
            // Manager sees invoices for properties they currently manage
            const managedProperties = await Property.find({ manager: userId }).select("_id");
            const propertyIds = managedProperties.map((p) => p._id);

            if (propertyIds.length === 0) {
                return res.status(200).json({ invoices: [] });
            }

            query.propertyId = { $in: propertyIds };
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const invoices = await Invoice.find(query)
            .populate("tenantId", "name email phone")
            .populate("managerId", "name email")
            .populate("propertyId", "propertyName address")
            .populate("unitId", "unitNumber unitType")
            .sort({ createdAt: -1 });

        return res.status(200).json({ invoices });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch invoices",
            error: error.message,
        });
    }
};

module.exports = { createInvoice, getAllInvoices };