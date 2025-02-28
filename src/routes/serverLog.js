const express = require("express");
const router = express.Router();
const LogController = require("../Controllers/serverLog");

router.get("/combined", LogController.getCombineLogs);
router.get("/errors", LogController.getErrorLogs);

module.exports = router;
