const { Location, User } = require("../models");

const getUserLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { user_id: req.userId },
      order: [["created_at", "DESC"]],
      attributes: ["id", "name", "latitude", "longitude", "created_at"],
    });

    res.json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
};

const addLocation = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    // Validate input
    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, latitude, and longitude",
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates format",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    // Check if user exists
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create location
    const location = await Location.create({
      user_id: req.userId,
      name: name.trim(),
      latitude: lat,
      longitude: lng,
    });

    res.status(201).json({
      success: true,
      message: "Location added successfully",
      location: {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        created_at: location.created_at,
      },
    });
  } catch (error) {
    console.error("Add location error:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add location",
    });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findOne({
      where: {
        id,
        user_id: req.userId, // Ensure user can only delete their own locations
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    await location.destroy();

    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete location",
    });
  }
};

module.exports = { getUserLocations, addLocation, deleteLocation };
