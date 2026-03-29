const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware");
const roleMiddleware = require("../middlewares/role-middleware");
const demoMiddleware = require("../middlewares/demo-middleware");

const TenantController = require("../controllers/owner/Tenant-controller");

// Tenant Management
router.post("/tenant", authMiddleware, roleMiddleware("MANAGER"), demoMiddleware, TenantController.createTenant);
router.get("/tenants", authMiddleware, roleMiddleware("OWNER", "SUPER_ADMIN", "MANAGER"), TenantController.getTenants);
router.get("/tenant/:id", authMiddleware, roleMiddleware("OWNER", "SUPER_ADMIN", "MANAGER"), TenantController.getTenantById);
router.put("/tenant/:id", authMiddleware, roleMiddleware("MANAGER"), demoMiddleware, TenantController.updateTenant);
router.delete("/tenant/:id", authMiddleware, roleMiddleware("MANAGER"), demoMiddleware, TenantController.deleteTenant);
router.get("/getmy-lease", authMiddleware, roleMiddleware("TENANT"), TenantController.getLeaseByTenant);

module.exports = router;
