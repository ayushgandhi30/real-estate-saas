const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware");
const roleMiddleware = require("../middlewares/role-middleware");

const { registerOwner } = require("../controllers/owner/owner-controller.js");
const PropertyController = require("../controllers/owner/property-controller.js");
const FloorController = require("../controllers/owner/floore-controller.js")
const UnitController = require("../controllers/owner/unit-controller.js")
const RevenueController = require("../controllers/owner/revenue-controller.js")
const authController = require("../controllers/auth-controller.js");
const DashboardController = require("../controllers/owner/dashboard-controller.js");

// Owner registration
router.post("/register", authMiddleware, roleMiddleware("OWNER"), registerOwner);

// Get available managers for assignment
router.get("/managers", authMiddleware, roleMiddleware("OWNER"), authController.getManagers);

// Revenue Analytics
router.get("/revenue-stats", authMiddleware, roleMiddleware("OWNER"), RevenueController.getRevenueStats);

// Owner Dashboard Analytics
router.get("/dashboard-stats", authMiddleware, roleMiddleware("OWNER"), DashboardController.getOwnerDashboardData);

// Property Management (Allow OWNER and MANAGER only for create/update/delete)
router.post("/properties", authMiddleware, roleMiddleware("OWNER", "MANAGER"), PropertyController.createProperty);
router.get("/properties", authMiddleware, roleMiddleware("OWNER", "SUPER_ADMIN", "MANAGER"), PropertyController.getProperties);
router.put("/property/:id", authMiddleware, roleMiddleware("OWNER", "MANAGER"), PropertyController.updateProperty);
router.delete("/property/:id", authMiddleware, roleMiddleware("OWNER", "MANAGER"), PropertyController.deleteProperty);


// Floore Management
router.post("/floor", authMiddleware, roleMiddleware("OWNER"), FloorController.createFloor)
router.put("/floor/:id", authMiddleware, roleMiddleware("OWNER"), FloorController.updateFloor)
router.delete("/floor/:id", authMiddleware, roleMiddleware("OWNER"), FloorController.deleteFloor)
router.get("/floors", authMiddleware, roleMiddleware("OWNER", "SUPER_ADMIN", "MANAGER"), FloorController.getFloors)


// Unit Management
router.post("/unit", authMiddleware, roleMiddleware("OWNER"), UnitController.createUnit)
router.put("/unit/:id", authMiddleware, roleMiddleware("OWNER"), UnitController.updateUnit)
router.delete("/unit/:id", authMiddleware, roleMiddleware("OWNER"), UnitController.deleteUnit)
router.get("/units", authMiddleware, roleMiddleware("OWNER", "SUPER_ADMIN", "MANAGER"), UnitController.getUnits)

module.exports = router;
