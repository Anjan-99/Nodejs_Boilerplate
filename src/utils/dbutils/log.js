const log = require("../../models/logs");

// get all logs
const getLogs = async () => {
  return await log.find();
};


module.exports = {
  getLogs,
};
