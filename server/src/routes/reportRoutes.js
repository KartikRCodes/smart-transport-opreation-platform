const express = require("express");

const {
  getVehiclePerformance,
} = require("../controllers/reportController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// Vehicle performance report
router.get(
  "/vehicle-performance",
  authorizeRoles("Fleet Manager", "Financial Analyst"),
  getVehiclePerformance
);

module.exports = router;