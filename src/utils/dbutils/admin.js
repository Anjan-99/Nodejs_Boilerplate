const Admin = require("../../models/admin");
const log = require("../../models/logs");

// Find an admin by query
const findAdmin = async (query) => {
  return await Admin.findOne(query);
};

// Find all admins by query
const findAllAdmins = async (query) => {
  return await Admin.find(query);
};

// Save a new admin
const saveAdmin = async (adminData) => {
  const admin = new Admin(adminData);
  return await admin.save();
};

// Update an admin by query
const updateAdmin = async (query, update) => {
  return await Admin.findOneAndUpdate(query, update, { new: true });
};

// Delete admin by query
const deleteAdmin = async (query) => {
  return await Admin.deleteOne(query);
};

// Save a log entry
const saveLog = async (logData) => {
  const newLog = new log(logData);
  return await newLog.save();
};

module.exports = {
  findAdmin,
  findAllAdmins,
  saveAdmin,
  updateAdmin,
  deleteAdmin,
  saveLog,
};
