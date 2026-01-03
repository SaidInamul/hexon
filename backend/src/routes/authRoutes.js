const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { authMiddleware } = require("../config/jwt");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
