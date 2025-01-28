const mongoose = require("mongoose");
const moment = require("moment");

const logSchema = mongoose.Schema({
  logname: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  datetime: {
    type: String,
    default: () => moment().format("YYYY-MM-DD HH:mm:ss"),
  },
  logstatus: {
    type: String,
    required: true,
  },
  logmsg: {
    type: String,
    required: true,
  },
});

// Create a model for logs
const Log = mongoose.model("Log", logSchema);

module.exports = Log;
