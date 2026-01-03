const { Location, UploadLog } = require("../models");
const { parseLocationFile } = require("../utils/zipParser");

const uploadLocations = async (req, res) => {
  let uploadLog = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Create upload log FIRST
    uploadLog = await UploadLog.create({
      user_id: req.userId,
      filename: req.file.originalname,
      success: false,
    });

    // Parse ZIP file
    const locations = parseLocationFile(req.file.buffer);

    // Validate we have locations
    if (!locations || locations.length === 0) {
      throw new Error("No valid locations found in the file");
    }

    // Limit batch size for safety
    const MAX_BATCH_SIZE = 1000;
    if (locations.length > MAX_BATCH_SIZE) {
      throw new Error(
        `Too many locations. Maximum allowed is ${MAX_BATCH_SIZE}`,
      );
    }

    // Prepare locations for bulk insert with validation
    const locationData = locations.map((loc, index) => {
      // Explicitly convert to float to catch errors early
      const lat = parseFloat(loc.latitude);
      const lng = parseFloat(loc.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`Invalid coordinates at row ${index + 1}: ${loc.name}`);
      }

      return {
        user_id: req.userId,
        name: loc.name,
        latitude: lat,
        longitude: lng,
      };
    });

    // Insert locations
    const createdLocations = await Location.bulkCreate(locationData, {
      returning: true,
      validate: true,
    });

    // Update upload log with success
    await uploadLog.update({
      success: true,
      location_count: createdLocations.length,
    });

    res.json({
      success: true,
      message: `${createdLocations.length} locations uploaded successfully`,
      count: createdLocations.length,
      // Return first 10 locations for preview
      locations: createdLocations.slice(0, 10).map((loc) => ({
        id: loc.id,
        name: loc.name,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Update upload log with error
    if (uploadLog) {
      await uploadLog.update({
        error_message: error.message.substring(0, 500),
      });
    }

    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = "Upload failed. Please check the file format.";

    if (
      error.message.includes("ZIP") ||
      error.message.includes("file") ||
      error.message.includes("text") ||
      error.message.includes("format") ||
      error.message.includes("Invalid coordinates")
    ) {
      statusCode = 400;
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

module.exports = { uploadLocations };
