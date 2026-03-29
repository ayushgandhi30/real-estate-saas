const User = require("../models/User-model.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { seedDemoData } = require("../utils/seedDemoData");



// *-----------------------
// * Register Logic
// *-----------------------
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password, // Hashing handled by User model pre-save hook
            role: "TENANT", // All public signups are tenants by default
            phone
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isBlocked: user.isBlocked,
            },
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// *-----------------------
// * Login Logic
// *-----------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email);
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        console.log("User found:", user ? "Yes" : "No");
        
        // Special logic for demo accounts
        const demoAccounts = {
            "superadmin@demo.com": "SUPER_ADMIN",
            "owner@demo.com": "OWNER",
            "manager@demo.com": "MANAGER"
        };
        
        const isDemoCredentials = demoAccounts[email] && password === "demo123";
        
        if (!user && !isDemoCredentials) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let demoUser = user;
        if (isDemoCredentials && !user) {
            // Create demo user if it doesn't exist
            demoUser = await User.create({
                name: `Demo ${demoAccounts[email].replace("_", " ")}`,
                email,
                password: "demo123", // Will be hashed by pre-save hook
                role: demoAccounts[email],
                isDemoAccount: true,
                isActive: true
            });
        } else if (isDemoCredentials && user) {
             // Ensure existing demo user has the flag and correct role
             let updated = false;
             if (!user.isDemoAccount) {
                user.isDemoAccount = true;
                updated = true;
             }
             if (user.role !== demoAccounts[email]) {
                user.role = demoAccounts[email];
                updated = true;
             }
             if (!user.isActive) {
                user.isActive = true;
                updated = true;
             }
             if (updated) await user.save();
             demoUser = user;
        }

        // SEED DEMO DATA
        if (isDemoCredentials && demoUser) {
           console.log("Seeding demo data for:", demoUser.email);
           await seedDemoData(demoUser);
        }

        if (demoUser && demoUser.isBlocked) {
            return res.status(403).json({ message: "Your account has been blocked." });
        }

        if (demoUser && !demoUser.isActive) {
            return res.status(403).json({ message: "Your account is inactive." });
        }

        const isMatch = isDemoCredentials ? (password === "demo123") : await bcrypt.compare(password, user.password)
        console.log("Password match:", isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update last login timestamp
        demoUser.lastLoginAt = new Date();
        console.log("Saving user last login...");
        await demoUser.save();
        console.log("User saved.");

        const token = jwt.sign(
            { id: demoUser._id, role: demoUser.role, isDemoAccount: demoUser.isDemoAccount },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: demoUser._id,
                name: demoUser.name,
                email: demoUser.email,
                role: demoUser.role,
                isDemoAccount: demoUser.isDemoAccount
            },
        });
    } catch (error) {
        console.error("Login Error Details:", error);
        res.status(500).json({ message: error.message });
    }
}


// *-----------------------
// * User Logic
// *-----------------------
const user = async (req, res) => {
    try {
        const userData = req.user
        return res.status(200).json({ userData })
    } catch (error) {
        console.log("Error from the user root")
    }
}



const getAllUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        let query = {};

        if (role === "MANAGER" || role === "OWNER") {
            // Managers and Owners only see users they created
            query.createdBy = userId;
        } else if (role === "SUPER_ADMIN") {
            query = {};
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const users = await User.find(query).select("-password");

        res.status(200).json({
            msg: users
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All password fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        const existingUser = await User.findById(req.user._id);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const isSamePassword = await bcrypt.compare(newPassword, existingUser.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password must be different from current password" });
        }

        existingUser.password = newPassword; // Model pre-save hook handles hashing
        await existingUser.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const existingUser = await User.findOne({
            email,
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getManagers = async (req, res) => {
    try {
        const managers = await User.find({ role: "MANAGER", isActive: true }).select("name email phone");
        res.status(200).json({ managers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        // For security, don't confirm if user exists or not
        if (!user) {
            return res.status(200).json({ message: "If your email is registered, you will receive a reset link shortly." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password/${token}`;

        try {
            await sendEmail(user.email, resetLink);
            res.status(200).json({ message: "Reset link sent to your email" });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            console.log("\x1b[33m%s\x1b[0m", "--- DEV MODE: Password Reset Link ---");
            console.log("\x1b[36m%s\x1b[0m", resetLink);
            console.log("\x1b[33m%s\x1b[0m", "--------------------------------------");
            
            // Still allow the process to work in development by showing the link in terminal
            res.status(200).json({ 
                message: "Reset link generated. (Email service error: Please check your EMAIL and EMAIL_PASS in .env. Note: Gmail requires an 'App Password' if 2FA is enabled.)" 
            });
        }
    } catch (error) {
        console.error("Forgot password internal error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        user.password = password; // Model pre-save hook handles hashing
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, user, getAllUsers, getManagers, changePassword, updateProfile, forgotPassword, resetPassword }
