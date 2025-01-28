const asyncErrorHandler = require("../utils/asyncErrorHandler");
const customError = require("../utils/customError");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { GenerateUniqueId } = require("../utils/UniqueId");
const { signAccessToken } = require("../utils/jwt/jwt_helper");
const {
  findAdmin,
  saveAdmin,
  findAllAdmins,
  updateAdmin,
  deleteAdmin,
  saveLog,
} = require("../utils/dbutils/admin");
const { generate2FASecret, verify2FA } = require("../utils/twoFactorUtils");
const moment = require("moment");

// Register a new user
const register = asyncErrorHandler(async (req, res, next) => {
  const { username, email, password, role, users } = req.body;
  console.log(req.body);

  const existingAdmin = await findAdmin({ email });
  if (existingAdmin) {
    throw customError.validationError("Admin already exists");
  }

  const hashedPassword = await hashPassword(password);
  const adminId = GenerateUniqueId(username);
  const newAdmin = {
    username,
    adminId,
    email,
    password: hashedPassword,
    role,
    users: users || [],
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  };

  const savedAdmin = await saveAdmin(newAdmin);
  if (!savedAdmin) {
    throw customError("User not saved", 500);
  }

  const accessToken = await signAccessToken(adminId, role);

  await saveLog({
    logname: "Admin",
    user: username,
    role,
    logstatus: "Success",
    logmsg: "Admin Registered Successfully",
  });

  res.status(200).json({ "access-token": accessToken });
});

// Login a user
const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await findAdmin({ email });
  //remove password from response

  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }

  const validPassword = await comparePassword(password, admin.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }
  admin.password = undefined;
  const accessToken = await signAccessToken(admin.adminId, admin.role);

  await saveLog({
    logname: "Admin",
    user: admin.username,
    role: admin.role,
    logstatus: "Success",
    logmsg: "Admin Logged in Successfully",
  });

  res.status(200).json({ token: accessToken, user: admin, status: true });
});

// get admin details
const getAdminDetails = asyncErrorHandler(async (req, res, next) => {
  const { adminId } = req.query;
  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }
  res.status(200).json({ admin });
});

// Get all Admins Details
const getAdmins = asyncErrorHandler(async (req, res, next) => {
  const admins = await findAllAdmins({});
  if (!admins) {
    throw customError.notFoundError("No Admins found");
  }
  res.status(200).json({ admins });
});

// Update a user's Details
const updateAdminDetails = asyncErrorHandler(async (req, res, next) => {
  const { adminId, email, username, role, users } = req.body;

  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }

  // check other admins for the same email address
  const checkEmailAlreadyExists = await findAdmin({ email });
  if (checkEmailAlreadyExists && checkEmailAlreadyExists.adminId !== adminId) {
    throw customError.validationError("Email already exists");
  }

  const updatedAdmin = await updateAdmin(
    { adminId },
    { email, username, role, users }
  );

  if (updatedAdmin) {
    await saveLog({
      logname: "Admin",
      user: admin.username,
      role: admin.role,
      logstatus: "Success",
      logmsg: "Admin Details Updated Successfully",
    });
  }

  res.status(200).json({
    message: "Admin details updated successfully",
    user: updatedAdmin,
  });
});

// Update a user's password
const updatePassword = asyncErrorHandler(async (req, res, next) => {
  const { adminId, password, newPassword } = req.body;

  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.notFoundError("User not found");
  }

  const validPassword = await comparePassword(password, admin.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }

  admin.password = await hashPassword(newPassword);
  const updatedAdmin = await updateAdmin(
    { adminId },
    { password: admin.password }
  );

  if (updatedAdmin) {
    await saveLog({
      logname: "Admin",
      user: admin.username,
      role: admin.role,
      logstatus: "Success",
      logmsg: "Password Updated Successfully",
    });
  }

  res.status(200).json({ message: "Password updated successfully" });
});

// Delete admins
const delete_Admin = asyncErrorHandler(async (req, res, next) => {
  const { adminId } = req.body;
  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }
  await deleteAdmin({ adminId });
  await saveLog({
    logname: "Admin",
    user: admin.username,
    role: admin.role,
    logstatus: "Success",
    logmsg: "Admin Deleted Successfully",
  });
  res.status(200).json({ message: "Admin deleted successfully", logout: true });
});

// Update 2FA
const update2fa = asyncErrorHandler(async (req, res, next) => {
  const { adminId, password, twofa } = req.body;
  console.log(req.body);
  const admin = await findAdmin({ adminId });
  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }

  const validPassword = await comparePassword(password, admin.password);
  if (!validPassword) {
    throw customError.unauthorizedError("Invalid password");
  }

  let secret, url;
  if (twofa) {
    if (admin.twofaEnabled) {
      throw customError.validationError("2FA is already enabled");
    }

    const options = { name: "ProfitFolio", issuer: "ProfitFolio" };
    secret = generate2FASecret(options);
    url = secret.otpauth_url;
    admin.twofaEnabled = true;
    admin.twofaSecret = secret;
  } else {
    if (!admin.twofaEnabled) {
      throw customError.validationError("2FA is already disabled");
    }
    admin.twofaEnabled = false;
    admin.twofaSecret = null;
  }

  await updateAdmin({ adminId }, admin);

  await saveLog({
    logname: "Admin",
    user: admin.username,
    role: admin.role,
    logstatus: "Success",
    logmsg: "2FA Updated Successfully",
  });

  res.status(200).json({
    message: "2FA updated successfully",
    twofa: url,
    disabled: !twofa,
  });
});

// verify2fa
// POST /api/auth/verify2fa
// Private
const verify2fa = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const admin = await findAdmin({ email });
  if (!admin) {
    throw customError.notFoundError("Admin not found");
  }

  if (!admin.twofaEnabled) {
    throw customError.validationError("2FA is not enabled");
  }

  const isValid = verify2FA(admin.twofaSecret.base32, otp);
  if (!isValid) {
    throw customError.validationError("Invalid OTP");
  }
  res.status(200).json({
    message: "OTP verified successfully",
    verified: true,
    admin: admin,
  });
});

module.exports = {
  register,
  login,
  getAdminDetails,
  getAdmins,
  updateAdminDetails,
  updatePassword,
  delete_Admin,
  update2fa,
  verify2fa,
};
