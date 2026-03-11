const mongoose = require('mongoose')

const MaintenanceSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
        index: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        index: true
    },
    managerId: { // Assigned manager for the property
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    ownerId: { // Owner of the property
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    technicianId: { // Person assigned to fix it
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["Plumbing", "Electrical", "Appliance", "Structural", "HVAC", "Other"],
        required: true
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium"
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Cancelled"],
        default: "Pending"
    },
    images: [{
        type: String // URL/Path to images if any
    }],
    notes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Maintenance = mongoose.model("Maintenance", MaintenanceSchema);
module.exports = Maintenance;
