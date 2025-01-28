const express = require("express");
const userController = require("../Controllers/userController");
const { verifyAccessToken } = require("../utils/jwt/jwt_helper");
const { roleBaseMiddleware } = require("../middlewares/roleBaseMiddleware");
const validateRequest = require("../middlewares/joiMiddleware");
const { userValidationSchema } = require("../validations/userValidation");
const router = express.Router();

router.post(
  "/create_user",
  // validateRequest(userValidationSchema),
  userController.create_user
);

router.post(
  "/login",
  // validateRequest(userValidationSchema),
  userController.login
);

router.get("/find_user", verifyAccessToken, userController.find_user);

router.get(
  "/get_users",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  userController.get_users
);

router.put(
  "/update_user",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin", "User"]),
  userController.update_user
);

router.delete("/delete_user", verifyAccessToken, userController.delete_user);

module.exports = router;
