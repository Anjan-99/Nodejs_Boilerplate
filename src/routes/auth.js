const express = require("express");
const authController = require("../Controllers/authController");
const { verifyAccessToken } = require("../utils/jwt/jwt_helper");
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.put("/update_password",verifyAccessToken, authController.update_Password);
router.post("/refresh-token", authController.refreshToken);
router.delete("/logout", authController.logout);
router.delete("/delete_user", authController.deleteUser);

module.exports = router;
