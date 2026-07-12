const express = require("express");

const {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  suspendDriver,
} = require("../controllers/driverController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

// Get all drivers
router.get("/", getDrivers);

// Get driver by ID
router.get("/:id", getDriverById);

// Create driver
// Fleet Manager and Safety Officer can create driver records
router.post(
  "/",
  authorizeRoles("Fleet Manager", "Safety Officer"),
  createDriver
);

// Update driver
// Fleet Manager and Safety Officer can update driver records
router.put(
  "/:id",
  authorizeRoles("Fleet Manager", "Safety Officer"),
  updateDriver
);

// Suspend driver
// Fleet Manager and Safety Officer can suspend drivers
router.patch(
  "/:id/suspend",
  authorizeRoles("Fleet Manager", "Safety Officer"),
  suspendDriver
);

module.exports = router;