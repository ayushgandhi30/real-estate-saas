const express = require("express")
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authMiddleware = require("../middlewares/auth-middleware")
const roleMiddleware = require("../middlewares/role-middleware")

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", authMiddleware, authController.user)
router.get("/all-users", authMiddleware, roleMiddleware("SUPER_ADMIN", "OWNER", "MANAGER"), authController.getAllUsers)
router.put("/change-password", authMiddleware, authController.changePassword)
router.put("/profile", authMiddleware, authController.updateProfile)

module.exports = router
