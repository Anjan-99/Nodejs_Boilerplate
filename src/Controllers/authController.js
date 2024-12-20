const asyncErrorHandler = require("../utils/asyncErrorHandler");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt/jwt_helper");
const customError = require("../utils/customError");
const {
  Register_schema,
  Login_schema,
} = require("../validations/auth/authValidation");
const bcrypt = require("bcrypt");
const db = require("../db/models");
const logger = require("../utils/logger");
const redisClient = require("../utils/init_redis");
const { User } = db;

const passwordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Register a new user
// POST /api/auth/register
// Public
const register = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const result = Register_schema.validate({ email, password });

  if (result.error) {
    throw customError.validationError("Invalid email or password");
  }

  // Check if the user already exists
  const alreadyExists = await User.findOne({ where: { email } });
  if (alreadyExists) {
    throw customError.validationError("User already exists");
  }
  // Hash the password
  const hashedPassword = await passwordHash(password);

  // Create a new user
  const newUser = new User({
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const savedUser = await newUser.save();
  if (!savedUser) {
  }
  const id = toString(newUser.dataValues.id);

  // Create a token
  const accessToken = await signAccessToken(id);
  const refreshToken = await signRefreshToken(id);

  res
    .status(200)
    .json({ "access-token": accessToken, "refresh-token": refreshToken });
});

// Login a user
// POST /api/auth/login
// Public
const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const result = Login_schema.validate({ email, password });

  if (result.error) {
    throw customError.validationError("Invalid email or password");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw customError.notFoundError("User not found");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }

  const id = user.id.toString();
  const accessToken = await signAccessToken(id);
  const refreshToken = await signRefreshToken(id);

  res
    .status(200)
    .json({ "access-token": accessToken, "refresh-token": refreshToken });
});

// Logout a user
// POST /api/auth/logout
// Private
const logout = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError.BadRequest();
  const userId = await verifyRefreshToken(refreshToken);
  redisClient.del(userId, (err, val) => {
    if (err) {
      new customError("Internal Server Error", 500);
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Refresh a token
// POST /api/auth/refresh-token
// Public
const refreshToken = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError.BadRequest();
  const userId = await verifyRefreshToken(refreshToken);
  const accessToken = await signAccessToken(userId);
  const refToken = await signRefreshToken(userId);
  res
    .status(200)
    .json({ "access-token": accessToken, "refresh-token": refToken });
});

module.exports = { register, login, refreshToken, logout };
