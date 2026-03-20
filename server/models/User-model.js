const mongoose = require('mongoose')

const user_Schema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
        unique: true,
    },
    password: {
        required: true,
        type: String,
    },
    phone: {
        required: false,
        type: String,
    },
    role: {
        type: String,
        enum: [
            "SUPER_ADMIN",
            "OWNER",
            "MANAGER",
            "TENANT",
            "MAINTENANCE_STAFF",
        ],
        default: "TENANT",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    lastLoginAt: {
        type: Date,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },


    resetToken: String,
    resetTokenExpiry: Date,
}, { timestamps: true })

const User = mongoose.model("User", user_Schema)
module.exports = User