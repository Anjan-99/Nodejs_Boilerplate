const User = require("../../models/user");
const log = require("../../models/logs");
const Admin = require("../../models/admin");

// Find a single user by query
const findUser = async (query) => {
  return await User.findOne(query);
};

// Find multiple users by query
const findUsers = async (query) => {
  return await User.find(query);
};

// Create or save a new user
const saveUser = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

// Update a user
const updateUser = async (query, updateData) => {
  return await User.findOneAndUpdate(
    query,
    { $set: updateData },
    { new: true }
  );
};

// Delete a user
const deleteUser = async (query) => {
  return await User.findOneAndDelete(query);
};

// Save a log entry
const saveLog = async (logData) => {
  const newLog = new log(logData);
  return await newLog.save();
};

// Find an admin by query
const findAdmin = async (query) => {
  return await Admin.findOne(query);
};

module.exports = {
  findUser,
  findUsers,
  saveUser,
  updateUser,
  deleteUser,
  saveLog,
  findAdmin,
};
