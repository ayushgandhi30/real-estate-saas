const express = require("express")
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authMiddleware = require("../middlewares/auth-middleware")
const roleMiddleware = require("../middlewares/role-middleware")
const demoMiddleware = require("../middlewares/demo-middleware")

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", authMiddleware, authController.user)
router.get("/all-users", authMiddleware, roleMiddleware("SUPER_ADMIN", "OWNER", "MANAGER"), authController.getAllUsers)
router.put("/change-password", authMiddleware, demoMiddleware, authController.changePassword)
router.put("/profile", authMiddleware, demoMiddleware, authController.updateProfile)


router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router
