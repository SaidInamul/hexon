const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UploadLog = sequelize.define(
  "UploadLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    error_message: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "upload_logs",
    timestamps: true,
    createdAt: "uploaded_at",
    updatedAt: false,
  },
);

module.exports = UploadLog;
