const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  exchange: {
    type: String,
    required: true,
    enum: ["Zerodha"], // Supported exchanges
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  twofaEnabled: {
    type: Boolean,
    default: false,
  },
  twofaSecret: {
    type: Object,
    default: {},
  },
  zerodhaDetails: {
    api_key: String,
    api_secret: String,
    access_token: String,
    public_token: String,
    refresh_token: String,
    error: String,
  },
});

userSchema.index({ email: 1 }, { unique: true });

// Middleware to validate required fields based on the exchange
userSchema.pre("validate", function (next) {
  if (this.exchange === "zerodha") {
    const requiredFields = [
      "api_key",
      "api_secret",
      "access_token",
      "public_token",
      "refresh_token",
    ];

    const missingFields = requiredFields.filter(
      (field) => !this.zerodhaDetails || !this.zerodhaDetails[field]
    );

    if (missingFields.length > 0) {
      return next(
        new Error(
          `Missing required fields for Zerodha: ${missingFields.join(", ")}`
        )
      );
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
