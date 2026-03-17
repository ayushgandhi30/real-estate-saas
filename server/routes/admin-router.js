const express = require("express")
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware.js");
const roleMiddleware = require("../middlewares/role-middleware.js");

const OwnerController = require("../controllers/admin/Owner-controller.js")
const UserController = require("../controllers/admin/User-controller.js")
const planController = require("../controllers/admin/Plan-controller.js")
const DashboardController = require("../controllers/admin/Dashboard-controller.js")

// Dashboard Stats
router.get("/dashboard-stats", authMiddleware, roleMiddleware("SUPER_ADMIN"), DashboardController.getDashboardStats)
router.get("/revenue-stats", authMiddleware, roleMiddleware("SUPER_ADMIN"), DashboardController.getRevenueStats)




// Approve Owner
router.patch("/owner/:ownerId/approve", authMiddleware, roleMiddleware("SUPER_ADMIN"), OwnerController.approveOwner)

// Get Owner
router.get("/getOwners", authMiddleware, roleMiddleware("SUPER_ADMIN", "OWNER", "MANAGER"), OwnerController.getOwner)


// create user
router.post("/user", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER", "OWNER"), UserController.addUser)

// update user
router.put("/user/:userId", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER", "OWNER"), UserController.updateUser)

// delete user
router.delete("/user/:userId", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER", "OWNER"), UserController.deleteUser)


// get all plans
router.get("/plans", authMiddleware, roleMiddleware("SUPER_ADMIN", "OWNER", "MANAGER"), planController.getAllPlans)

// create plan
router.post("/plan", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.createPlan)

// update plan
router.post("/plan/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.updatePlan)

// delete plan
router.delete("/plan/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.deletePlan)

module.exports = router; 