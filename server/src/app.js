const express = require("express");
const cors = require("cors");
const config = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TransitOps API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);

module.exports = app;