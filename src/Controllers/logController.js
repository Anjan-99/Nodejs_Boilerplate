const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { getLogs } = require("../utils/dbutils/log");

const get_logs = asyncErrorHandler(async (req, res, next) => {
  const logs = await getLogs();
  res.status(200).json({ logs });
});

module.exports = {
  get_logs
};
