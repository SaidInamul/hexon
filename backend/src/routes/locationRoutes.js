const express = require("express");
const router = express.Router();
const {
  getUserLocations,
  addLocation,
  deleteLocation,
} = require("../controllers/locationController");
const { authMiddleware } = require("../config/jwt");

// All routes require authentication
router.use(authMiddleware);

// GET /api/locations - Get all locations for the user
router.get("/", getUserLocations);

// POST /api/locations - Add a new location
router.post("/", addLocation);

// DELETE /api/locations/:id - Delete a location
router.delete("/:id", deleteLocation);

module.exports = router;
