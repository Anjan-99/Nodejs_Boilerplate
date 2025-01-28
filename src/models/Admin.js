const mongoose = require("mongoose");
const moment = require("moment");
const { Schema } = mongoose;

const AdminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "SuperAdmin"],
      default: "user",
      required: true,
    },
    users: [
      {
        userId: {
          type: String,
          required: true,
        },
      },
    ],
    twofaEnabled: {
      type: Boolean,
      default: false,
    },
    twofaSecret: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
      default: () => moment().format("YYYY-MM-DD HH:mm:ss"),
    },
  },
  {
    timestamps: false,
  }
);

// Middleware to update the `updatedAt` field before saving
AdminSchema.pre("save", function (next) {
  this.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
  next();
});

// Explicitly define all indexes
AdminSchema.index({ email: 1 }, { unique: true });

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
