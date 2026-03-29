const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
    isDemoAccount: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

// Pre-save hook to hash password
user_Schema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", user_Schema)
module.exports = User