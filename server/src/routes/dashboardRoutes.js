const express = require("express");

const {
  getDashboardKPIs,
} = require("../controllers/dashboardController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard KPI summary
router.get("/kpis", getDashboardKPIs);

module.exports = router;