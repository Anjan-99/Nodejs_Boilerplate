const express = require("express");
const authController = require("../Controllers/authController");
const { verifyAccessToken } = require("../utils/jwt/jwt_helper");
const { roleBaseMiddleware } = require("../middlewares/roleBaseMiddleware");
const validateRequest = require("../middlewares/joiMiddleware");
const {
  update_Password,
  Register_schema,
  update_Details,
  Login_schema,
  enable2fa,
  verify2fa,
} = require("../validations/authValidation");
const router = express.Router();

router.post("/login", validateRequest(Login_schema), authController.login);

router.post(
  "/register",
  validateRequest(Register_schema),
  authController.register
);

router.get(
  "/get_admin",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  authController.getAdminDetails
);

router.get(
  "/get_admins",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  authController.getAdmins
);
router.put(
  "/update_admin",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  authController.updateAdminDetails
);

router.put(
  "/update_password",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  validateRequest(update_Password),
  authController.updatePassword
);
router.post(
  "/delete_admin",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  authController.delete_Admin
);
router.post(
  "/update2fa",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  validateRequest(enable2fa),
  authController.update2fa
);
router.post(
  "/verify2fa",
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  validateRequest(verify2fa),
  authController.verify2fa
);

module.exports = router;
