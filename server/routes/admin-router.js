const express = require("express")
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware.js");
const roleMiddleware = require("../middlewares/role-middleware.js");

const locationController = require("../controllers/admin/location-controller.js");
const OwnerController = require("../controllers/admin/Owner-controller.js")
const UserController = require("../controllers/admin/User-controller.js")
const planController = require("../controllers/admin/Plan-controller.js")

// Create locations
router.post("/locations", authMiddleware, roleMiddleware("SUPER_ADMIN"), locationController.createLocation);

// Get all locations
router.get("/locations", authMiddleware, roleMiddleware("SUPER_ADMIN"), locationController.getAllLocations);

// Update location
router.put("/locations/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), locationController.updateLocation);

// Enable / Disable location
router.patch("/locations/:id/toggle", authMiddleware, roleMiddleware("SUPER_ADMIN"), locationController.toggleLocationStatus);

// Delete location
router.delete("/locations/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), locationController.deleteLocation);


// Approve Owner
router.patch("/owner/:ownerId/approve", authMiddleware, roleMiddleware("SUPER_ADMIN"), OwnerController.approveOwner)

// Get Owner
router.get("/getOwners", authMiddleware, roleMiddleware("SUPER_ADMIN", "OWNER", "MANAGER"), OwnerController.getOwner)


// create user
router.post("/user", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER"), UserController.addUser)

// update user
router.put("/user/:userId", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER"), UserController.updateUser)

// delete user
router.delete("/user/:userId", authMiddleware, roleMiddleware("SUPER_ADMIN", "MANAGER"), UserController.deleteUser)


// get all plans
router.get("/plans", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.getAllPlans)

// create plan
router.post("/plan", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.createPlan)

// update plan
router.post("/plan/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.updatePlan)

// delete plan
router.delete("/plan/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), planController.deletePlan)

module.exports = router; 