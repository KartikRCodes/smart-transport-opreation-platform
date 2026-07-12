const express = require("express");
const cors = require("cors");
const config = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

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

module.exports = app;