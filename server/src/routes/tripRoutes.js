const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// View trips
router.get("/", getTrips);
router.get("/:id", getTripById);

// Create a draft trip
router.post(
  "/",
  authorizeRoles("Fleet Manager", "Driver"),
  createTrip
);

// Update a draft trip
router.put(
  "/:id",
  authorizeRoles("Fleet Manager", "Driver"),
  updateTrip
);

// Dispatch a trip
router.patch(
  "/:id/dispatch",
  authorizeRoles("Fleet Manager", "Driver"),
  dispatchTrip
);

// Complete a trip
router.patch(
  "/:id/complete",
  authorizeRoles("Fleet Manager", "Driver"),
  completeTrip
);

// Cancel a trip
router.patch(
  "/:id/cancel",
  authorizeRoles("Fleet Manager", "Driver"),
  cancelTrip
);

module.exports = router;