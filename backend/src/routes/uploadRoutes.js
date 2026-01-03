const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadLocations } = require("../controllers/uploadController");
const { authMiddleware } = require("../config/jwt"); // Ensure this path is correct for your project

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Simple extension check
    if (file.originalname.toLowerCase().endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(
        new Error("Only .zip files are allowed. Please upload a .zip file."),
        false,
      );
    }
  },
});

// POST /api/upload - Upload ZIP file
router.post(
  "/",
  authMiddleware, // 1. SECURITY: Check Auth FIRST
  upload.single("file"), // 2. PERFORMANCE: Process file SECOND (only if auth passes)
  uploadLocations, // 3. LOGIC: Run controller
);

// Error handling for multer
router.use((error, req, res, next) => {
  console.error("Upload route error:", error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
    });
  }

  // Handle fileFilter errors
  if (error.message && error.message.includes("Only .zip files")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
