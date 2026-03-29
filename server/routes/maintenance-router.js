const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const roleMiddleware = require("../middlewares/role-middleware");
const demoMiddleware = require("../middlewares/demo-middleware");
const MaintenanceController = require("../controllers/maintenance-controller");

//  CREATE request (TENANT, MANAGER, OWNER)
router.post("/request", authMiddleware, roleMiddleware("TENANT", "MANAGER", "OWNER"), demoMiddleware, MaintenanceController.createRequest);

//  GET all requests (TENANT sees their own, MANAGER sees all)
router.get("/requests", authMiddleware, roleMiddleware("TENANT", "MANAGER", "OWNER", "SUPER_ADMIN"), MaintenanceController.getRequests);

//  UPDATE/ASSIGN request (MANAGER, OWNER, SUPER_ADMIN)
router.put("/request/:id", authMiddleware, roleMiddleware("MANAGER", "OWNER", "SUPER_ADMIN"), demoMiddleware, MaintenanceController.updateRequest);

module.exports = router;
