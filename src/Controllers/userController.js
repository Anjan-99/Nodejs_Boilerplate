const asyncErrorHandler = require("../utils/asyncErrorHandler");
const customError = require("../utils/customError");
const {
  findUser,
  findUsers,
  saveUser,
  deleteUser,
  saveLog,
  findAdmin,
  updateUser,
} = require("../utils/dbutils/user");
const { GenerateUniqueId } = require("../utils/UniqueId");
const { signAccessToken } = require("../utils/jwt/jwt_helper");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");

// Create a new user
const create_user = asyncErrorHandler(async (req, res, next) => {
  const { exchange, username, password, name, email, phone, zerodhaDetails } =
    req.body;
  if (!exchange || !name || !email || !phone) {
    throw customError.validationError("All fields are required");
  }
  const alreadyExists = await findUser({ email });
  if (alreadyExists) {
    throw customError.validationError("User already exists");
  }
  const hashedPassword = await hashPassword(password);
  const userId = GenerateUniqueId(name);
  console.log(userId);
  const newUser = {
    userId,
    exchange,
    name,
    username,
    email,
    password: hashedPassword,
    phone,
    zerodhaDetails,
  };

  const savedUser = await saveUser(newUser);
  if (!savedUser) {
    throw new customError("User not saved", 500);
  }

  if (exchange === "zerodha") {
    // await generateTokenForUser(); // Generate token for Zerodha
  }
  let role = "Client";
  const accessToken = await signAccessToken(userId, role);

  await saveLog({
    logname: "User",
    user: name,
    role: "Client",
    logstatus: "Success",
    logmsg: "User Registered Successfully",
  });

  res.status(200).json({
    message: "User created successfully",
    user: newUser,
    token: accessToken,
  });
});

// Login a user
const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await findUser({ email });
  //remove password from response

  if (!user) {
    throw customError.notFoundError("User not found");
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }
  user.password = undefined;
  const accessToken = await signAccessToken(user.userId, "User");

  await saveLog({
    logname: "User",
    user: user.username,
    role: "User",
    logstatus: "Success",
    logmsg: "User Logged in Successfully",
  });

  res.status(200).json({ token: accessToken, user: user, status: true });
});

// find user by userId
const find_user = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.query;
  const user = await findUser({ userId });
  if (!user) {
    throw customError.notFoundError("User not found");
  }
  res.status(200).json({ user: user });
});

// Get all users only for Admin
const get_users = asyncErrorHandler(async (req, res, next) => {
  const adminId = req.query.adminId;
  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.validationError("Admin not found");
  }
  if (admin.role !== "Admin" && admin.role !== "SuperAdmin") {
    throw customError.validationError("Unauthorized access");
  }
  const users = await findUsers();
  if (!users || users.length === 0) {
    throw customError.validationError("No users found");
  }
  res.status(200).json({ users });
});

// Update a user
const update_user = asyncErrorHandler(async (req, res, next) => {
  const { userId, username, name, email, phone, zerodhaDetails } =
    req.body;

  const user = await findUser({ userId });
  if (!user) {
    throw customError.notFoundError("User not found");
  }

  const updatedUser = await updateUser(
    { userId },
    { name, email, username, phone, zerodhaDetails }
  );

  if (!updatedUser) {
    throw new customError("User not updated", 500);
  }

  await saveLog({
    logname: "User",
    user: user.username,
    role: "User",
    logstatus: "Success",
    logmsg: "User Details Updated Successfully",
  });

  res.status(200).json({ message: "User updated successfully" });
});

// Delete a user
const delete_user = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.query;
  console.log(userId);
  const user = await findUser({ userId });
  if (!user) {
    throw customError.notFoundError("User not found");
  }

  const deletedUser = await deleteUser({ userId });
  if (!deletedUser) {
    throw new customError("User not deleted", 500);
  }

  await saveLog({
    logname: "User",
    user: user.username,
    role: "User",
    logstatus: "Success",
    logmsg: "User Deleted Successfully",
  });

  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
  create_user,
  login,
  find_user,
  get_users,
  update_user,
  delete_user,
};
