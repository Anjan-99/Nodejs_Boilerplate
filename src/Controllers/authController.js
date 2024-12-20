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
  const { email, password, role } = req.body;
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
  var payload = {};
  if (role === "admin") {
    // Create a new user
    payload = {
      email,
      password: hashedPassword,
      Role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } else {
    // Create a new user
    payload = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  console.log(payload);
  // Create a new user
  const newUser = new User(payload);
  console.log(newUser);
  const savedUser = await newUser.save();
  if (!savedUser) {
    throw new customError("User not saved", 500);
  }
  const id = savedUser.id.toString();
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

  // Run validation and DB query in parallel
  const [validationResult, user] = await Promise.all([
    Promise.resolve(Login_schema.validate({ email, password })),
    User.findOne({
      where: { email },
    }),
  ]);

  if (validationResult.error) {
    throw customError.validationError("Invalid email or password");
  }

  if (!user) {
    throw customError.notFoundError("User not found");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }

  const id = user.id.toString();
  const role = user.Role

  // Generate tokens in parallel
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(id,role),
    signRefreshToken(id),
  ]);

  res
    .status(200)
    .json({ "access-token": accessToken, "refresh-token": refreshToken });
});

// Optional: Add index on email field if not already present
// await queryInterface.addIndex('Users', ['email']);

// Logout a user
// POST /api/auth/logout
// Private
const logout = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw customError.notFoundError("Token not found");
  const userId = await verifyRefreshToken(refreshToken);
  redisClient.del(userId, (err, val) => {
    if (err) {
      new customError("Internal Server Error", 500);
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Update a user's password
// POST /api/auth/update_password
// Private
const update_Password = asyncErrorHandler(async (req, res, next) => {
  const { email, password, newPassword } = req.body;
  const result = Login_schema.validate({ email, password });
  if (result.error) {
    throw customError.validationError("Invalid email");
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw customError.notFoundError("User not found");
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }
  const hashedPassword = await passwordHash(newPassword);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

// Delete a user
// DELETE /api/auth/delete_user
// Private
const deleteUser = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw customError.notFoundError("Token not found");
  const id = await verifyRefreshToken(refreshToken);
  // split the token and get the user id from - id as we are storing the token in redis like this [6-2b10HOtjcvbPhZBxnCte0RCuuBhLUZlWwxdoHhwx6h29S6Kj1o49q]
  const userID = id.split("-")[0];
  const user = await User.findByPk(userID);
  if (!user) throw customError.notFoundError("User not found");
  await user.destroy();
  redisClient.del(id, (err, val) => {
    if (err) {
      new customError("Internal Server Error", 500);
    }
    res.status(200).json({ message: "User deleted successfully" });
  });
});

// Refresh a token
// POST /api/auth/refresh-token
// Public
const refreshToken = asyncErrorHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError.BadRequest();
  const userId = await verifyRefreshToken(refreshToken);
  // split the token and get the user id from - id as we are storing the token in redis like this [6-2b10HOtjcvbPhZBxnCte0RCuuBhLUZlWwxdoHhwx6h29S6Kj1o49q]
  const id = userId.split("-")[0];
  const user = await User.findByPk(id);
  if (!user) {
    redisClient.del(userId, (err, val) => {
      if (err) {
        new customError("Internal Server Error", 500);
      }
    });
    throw customError.notFoundError("User not found");
  }
  const accessToken = await signAccessToken(userId);
  const refToken = await signRefreshToken(userId);
  res
    .status(200)
    .json({ "access-token": accessToken, "refresh-token": refToken });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  deleteUser,
  update_Password,
};
