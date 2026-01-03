require("dotenv").config();
const { app, syncDatabase } = require("./app");
const { testConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🚀 Starting Location Management API...");
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);

    // Test database connection
    await testConnection();

    // Sync database models
    await syncDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   🔐 Auth:      http://localhost:${PORT}/api/auth`);
      console.log(`   📍 Locations: http://localhost:${PORT}/api/locations`);
      console.log(`   📤 Upload:    http://localhost:${PORT}/api/upload`);
      console.log(`   ❤️  Health:    http://localhost:${PORT}/api/health`);
      console.log("\n✨ Ready to receive requests!");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
