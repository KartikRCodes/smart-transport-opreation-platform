const express = require("express");

const {
  createMaintenance,
  getMaintenanceLogs,
  completeMaintenance,
} = require("../controllers/maintenanceController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All maintenance routes require authentication
router.use(authenticate);

// View all maintenance logs
router.get("/", getMaintenanceLogs);

// Start maintenance
router.post(
  "/",
  authorizeRoles("Fleet Manager"),
  createMaintenance
);

// Complete maintenance
router.patch(
  "/:id/complete",
  authorizeRoles("Fleet Manager"),
  completeMaintenance
);

module.exports = router;