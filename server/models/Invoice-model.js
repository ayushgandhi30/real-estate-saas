const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
    {
        // ── Parties ───────────────────────────────────────────
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        // ── Property / Unit ───────────────────────────────────
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
            index: true,
        },

        // ── Invoice Meta ──────────────────────────────────────
        invoiceNumber: {
            type: String,
            unique: true,
        },
        month: {
            type: String, // e.g. "Mar 2026"
            required: true,
        },

        // ── Charges ──────────────────────────────────────────
        rent: {
            type: Number,
            required: true,
            min: 0,
        },
        utilityCharges: {
            type: Number,
            default: 0,
            min: 0,
        },
        maintenanceCharges: {
            type: Number,
            default: 0,
            min: 0,
        },
        lateFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            min: 0,
        },

        // ── Dates ─────────────────────────────────────────────
        dueDate: {
            type: Date,
            required: true,
        },
        paidAt: {
            type: Date,
        },

        // ── Status ────────────────────────────────────────────
        status: {
            type: String,
            enum: ["Unpaid", "Paid", "Overdue"],
            default: "Unpaid",
        },

        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

// Auto-calculate totalAmount before save
InvoiceSchema.pre("save", function () {
    this.totalAmount =
        (this.rent || 0) +
        (this.utilityCharges || 0) +
        (this.maintenanceCharges || 0) +
        (this.lateFee || 0);
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;
