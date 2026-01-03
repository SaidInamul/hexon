const { sequelize } = require("../config/database");
require("dotenv").config();

const resetDatabase = async () => {
  try {
    console.log("🔄 Resetting database...");

    // Drop and recreate tables
    await sequelize.query(`
      DROP TABLE IF EXISTS upload_logs, locations, users CASCADE;
    `);

    console.log("✅ Database reset completed");
    console.log("📝 Run `npm run dev` to recreate tables automatically");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  resetDatabase();
}
