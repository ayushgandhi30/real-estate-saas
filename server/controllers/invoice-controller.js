const Invoice = require("../models/Invoice-model");
const Tenant = require("../models/Tenant-model");
const Property = require("../models/Property-Model");
const mongoose = require("mongoose");

// ────────────────────────────────────────────────────────────
// Helper: generate invoice number  →  INV-YYYYMM-XXXX
// ────────────────────────────────────────────────────────────
const generateInvoiceNumber = async () => {
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Find the latest invoice with this prefix
    const lastInvoice = await Invoice.findOne({ 
        invoiceNumber: new RegExp(`^${prefix}-`) 
    }).sort({ invoiceNumber: -1 });

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split("-");
        const lastSerial = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSerial)) {
            nextNumber = lastSerial + 1;
        }
    }

    return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
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
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
            return res.status(400).json({ message: "Invalid tenant ID" });
        }
        const tenantRecord = await Tenant.findOne({ userId: tenantId });
        if (!tenantRecord) {
            return res.status(404).json({ message: "Tenant record not found" });
        }

        const { propertyId, unitId, maintenanceCost } = tenantRecord;

        // Fetch property to resolve ownerId
        const property = await Property.findById(propertyId).populate("owner");
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Authorization: Manager must either be the primary property manager OR the tenant's assigned manager
        const isPropertyManager = property.manager?.toString() === managerId.toString();
        const isTenantManager = tenantRecord.managerId?.toString() === managerId.toString();

        if (!isPropertyManager && !isTenantManager) {
            return res.status(403).json({
                message: "You are not authorized to create invoices for this tenant",
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
            maintenanceCharges: maintenanceCharges !== 0 ? maintenanceCharges : (maintenanceCost || 0),
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
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Invoice number collision. Please try again.",
                error: error.message,
            });
        }
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
            // Manager sees invoices specifically managed by them
            query.managerId = userId;
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

// ────────────────────────────────────────────────────────────
// GET /api/invoice/invoice/:id
// Delete specific invoice
// ────────────────────────────────────────────────────────────

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const role = req.user.role;

        if (role !== "MANAGER") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const property = await Property.findById(invoice.propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (property.manager?.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        await invoice.deleteOne();
        return res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete invoice",
            error: error.message,
        });
    }
}


const payInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Authorization: Only the tenant can pay their invoice
        if (invoice.tenantId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized to pay this invoice" });
        }

        invoice.status = "Paid";
        invoice.paidAt = new Date();
        await invoice.save();

        return res.status(200).json({ message: "Invoice paid successfully", invoice });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to pay invoice",
            error: error.message,
        });
    }
};

module.exports = { createInvoice, getAllInvoices, deleteInvoice, payInvoice };
