const express = require("express");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get currently authenticated user
router.get("/me", authenticate, getCurrentUser);

module.exports = router;