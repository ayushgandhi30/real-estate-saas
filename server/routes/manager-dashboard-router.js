const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const roleMiddleware = require("../middlewares/role-middleware");
const DashboardController = require("../controllers/manager/Dashboard-controller");

router.get("/stats", authMiddleware, roleMiddleware("MANAGER"), DashboardController.getManagerDashboardStats);

module.exports = router;
