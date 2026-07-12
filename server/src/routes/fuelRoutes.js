const express = require("express");

const {
  createFuelLog,
  getFuelLogs,
} = require("../controllers/fuelController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All fuel routes require authentication
router.use(authenticate);

// Get all fuel logs
router.get("/", getFuelLogs);

// Create fuel log
router.post(
  "/",
  authorizeRoles("Fleet Manager", "Driver"),
  createFuelLog
);

module.exports = router;