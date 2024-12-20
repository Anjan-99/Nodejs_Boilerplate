const express = require("express");
const authController = require("../Controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh-token", authController.refreshToken);
router.delete("/logout", authController.logout);

module.exports = router;
