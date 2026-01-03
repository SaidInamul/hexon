const User = require("./User");
const Location = require("./Location");
const UploadLog = require("./UploadLog");

// User has many Locations (one-to-many)
User.hasMany(Location, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  as: "locations",
});
Location.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// User has many UploadLogs (one-to-many)
User.hasMany(UploadLog, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  as: "uploadLogs",
});
UploadLog.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  User,
  Location,
  UploadLog,
};
