const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null, // Handle empty password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      // For macOS local development, usually no SSL needed
    },
  },
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully!");

    // Test query to verify we can access the database
    const [result] = await sequelize.query("SELECT version()");
    console.log(`📊 PostgreSQL Version: ${result[0].version}`);

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    console.log("\n🔧 Troubleshooting:");
    console.log("1. Is PostgreSQL running?");
    console.log("   brew services start postgresql");
    console.log("2. Check your .env credentials:");
    console.log(`   DB_USER: ${process.env.DB_USER}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log("3. Try connecting manually:");
    console.log(`   psql -d ${process.env.DB_NAME} -U ${process.env.DB_USER}`);

    return false;
  }
};

module.exports = { sequelize, testConnection };
