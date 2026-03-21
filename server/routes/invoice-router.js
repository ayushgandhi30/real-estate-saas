const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const roleMiddleware = require("../middlewares/role-middleware");
const invoiceController = require("../controllers/invoice-controller");

const router = express.Router();

// Create Invoice (MANAGER only)
router.post("/", authMiddleware, roleMiddleware("MANAGER"), invoiceController.createInvoice);

// Get Invoices (MANAGER sees all they manage, TENANT sees their own)
router.get("/invoices", authMiddleware, roleMiddleware("MANAGER", "TENANT"), invoiceController.getAllInvoices);

// Delete specific invoice (MANAGER only)
router.delete("/invoice/:id", authMiddleware, roleMiddleware("MANAGER"), invoiceController.deleteInvoice);

// Pay Invoice (TENANT only)
router.patch("/pay/:id", authMiddleware, roleMiddleware("TENANT"), invoiceController.payInvoice);

module.exports = router;
