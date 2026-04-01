require("dotenv").config();
const express = require('express')
const cors = require('cors')
const app = express();
const connectDb = require('./utils/db.js');
const authRoutes = require("./routes/auth-router");
const adminRoutes = require("./routes/admin-router.js");
const ownerRoutes = require("./routes/owner-router.js");
const tenantRoutes = require("./routes/tenant-router.js");
const maintenanceRoutes = require("./routes/maintenance-router.js");
const invoiceRoutes = require("./routes/invoice-router.js");
const managerDashboardRoutes = require("./routes/manager-dashboard-router.js");

const corsOptions = {
  origin: [
    "*",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/manager/dashboard", managerDashboardRoutes);


const PORT = 7000
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})