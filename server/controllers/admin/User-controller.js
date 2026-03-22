const User = require("../../models/User-model.js")
const Owner = require("../../models/Owner-model.js")

const addUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" })
        }
        const useExists = await User.findOne({ email })
        if (useExists) {
            return res.status(400).json({ msg: "User is already exists" })
        }
        
        let finalRole = role;
        if (req.user.role === "MANAGER") {
            finalRole = "TENANT"; // Managers can only add tenants
        } else if (req.user.role === "OWNER") {
            // Owners can only add Managers or Tenants
            if (!["MANAGER", "TENANT"].includes(role)) {
                finalRole = "TENANT";
            }
        }

        const newUser = await User.create({
            name,
            email,
            password, // Model pre-save hook handles hashing
            phone,
            role: finalRole || "TENANT", 
            createdBy: req.user._id
        })

        // If the role is OWNER, automatically create an approved Owner profile
        if (role === "OWNER") {
            await Owner.create({
                user: newUser._id,
                ownerType: "INDIVIDUAL", // Default to individual
                contactNumber: phone || "0000000000",
                isApproved: true, // Admin created owners are auto-approved
                approvedBy: req.user._id // The admin who created them
            });
        }

        res.status(201).json({ msg: "User created successfully", newUser })

    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        // Authorization: Managers and Owners can only update users they created
        if (["MANAGER", "OWNER"].includes(req.user.role) && userToUpdate.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to update this user" });
        }

        // Create update object and handle password conditionally
        const updates = { ...req.body };
        
        // If password is empty string, don't update it
        if (updates.password === "" || updates.password === undefined) {
            delete updates.password;
        }

        // We use findById and save() to ensure the pre-save hook for password hashing works
        Object.assign(userToUpdate, updates);
        const updatedUser = await userToUpdate.save();
        
        const userResult = updatedUser.toObject();
        delete userResult.password;

        res.status(200).json({
            message: "User updated successfully",
            user: userResult,
        });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Authorization: Managers and Owners can only delete users they created
        if (["MANAGER", "OWNER"].includes(req.user.role) && userToDelete.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this user" });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addUser, updateUser, deleteUser };