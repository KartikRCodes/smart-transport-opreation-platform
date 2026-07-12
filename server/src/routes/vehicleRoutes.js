const express = require("express");

const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// Get all vehicles
router.get(
  "/",
  getVehicles
);

// Get a single vehicle
router.get(
  "/:id",
  getVehicleById
);

// Create a new vehicle - Fleet Manager only
router.post(
  "/",
  authorizeRoles("Fleet Manager"),
  createVehicle
);

// Update a vehicle - Fleet Manager only
router.put(
  "/:id",
  authorizeRoles("Fleet Manager"),
  updateVehicle
);

// Delete a vehicle - Fleet Manager only
router.delete(
  "/:id",
  authorizeRoles("Fleet Manager"),
  deleteVehicle
);

module.exports = router;