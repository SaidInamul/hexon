const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { sequelize } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// 🔧 FIX: Configure Helmet with less restrictive settings for development
app.use(
  helmet({
    // Disable contentSecurityPolicy which often blocks requests
    contentSecurityPolicy: false,

    // Allow cross-origin requests for development
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // Disable other strict policies that might block API access
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,

    // Allow iframes for development
    frameguard: false,

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // Enable HSTS for security
    hsts: false, // Disable in development to avoid HTTPS requirement

    // Disable IE-specific restrictions
    ieNoOpen: false,

    // Don't force noSniff for development
    noSniff: false,

    // Allow referrer policy
    referrerPolicy: { policy: "no-referrer-when-downgrade" },

    // Disable XSS filter for modern browsers
    xssFilter: false,
  }),
);

// CORS configuration - Make it more permissive for testing
app.use(
  cors({
    origin: "*", // Use wildcard for testing, or specific URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/upload", uploadRoutes);

// Health check endpoint - Make sure this is accessible
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Location Management API",
    timestamp: new Date().toISOString(),
    database: "Connected",
    environment: process.env.NODE_ENV,
  });
});

// API documentation
app.get("/api", (req, res) => {
  res.json({
    message: "Location Management API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile",
      },
      locations: {
        list: "GET /api/locations",
        create: "POST /api/locations",
        delete: "DELETE /api/locations/:id",
      },
      upload: {
        upload: "POST /api/upload",
      },
    },
  });
});

// Simple 404 handler - Remove the problematic middleware
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `API endpoint ${req.originalUrl} does not exist`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: "Server Error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Database sync function
const syncDatabase = async () => {
  try {
    const syncOption =
      process.env.NODE_ENV === "development" ? { alter: true } : {};
    await sequelize.sync(syncOption);
    console.log("✅ Database models synchronized successfully");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
    throw error;
  }
};

module.exports = { app, syncDatabase };
