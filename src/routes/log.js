const express = require("express");
const logController = require("../Controllers/logController");
const { verifyAccessToken } = require("../utils/jwt/jwt_helper");
const { roleBaseMiddleware } = require("../middlewares/roleBaseMiddleware");
const router = express.Router();

router.get(
  "/get_logs",
  verifyAccessToken,
  roleBaseMiddleware(["Admin", "SuperAdmin"]),
  logController.get_logs
);

module.exports = router;
