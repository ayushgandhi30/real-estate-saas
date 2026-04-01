require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const connectDb = require("./utils/db.js");

// Routes
const authRoutes = require("./routes/auth-router");
const adminRoutes = require("./routes/admin-router.js");
const ownerRoutes = require("./routes/owner-router.js");
const tenantRoutes = require("./routes/tenant-router.js");
const maintenanceRoutes = require("./routes/maintenance-router.js");
const invoiceRoutes = require("./routes/invoice-router.js");
const managerDashboardRoutes = require("./routes/manager-dashboard-router.js");


// ✅ Allowed origins (IMPORTANT)
const allowedOrigins = [
  "https://estatepilot-app.netlify.app",
  "http://localhost:3000"
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman / mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  credentials: true,
};

// ✅ Apply CORS BEFORE routes
app.use(cors(corsOptions));

// ✅ Handle preflight requests
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/manager/dashboard", managerDashboardRoutes);


// ✅ Server start
const PORT = process.env.PORT || 7000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});