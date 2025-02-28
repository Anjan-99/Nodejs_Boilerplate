const fs = require("fs");
const path = require("path");

const getCombineLogs = (req, res) => {
  //"http://localhost:3000/api/server-logs/combined?password=@Darkluffy3310"
  const password = req.query.password;
  const days = req.query.days || 1;
  if (password !== "@Darkluffy3310") {
    return res.status(401).json({ message: "HEHE Nubs" });
  }
  const logFilePath = path.join(__dirname, "../../logs/combined.log");

  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Unable to read log file", error: err.message });
    }
    res.setHeader("Content-Type", "text/plain");
    // only return logs from the last {days} days (default: 1 day) log example 2025-02-28 12:55:10 info: Server is running on port 3000
    const logs = data
      .split("\n")
      .filter((line) => {
        if (line.length === 0) {
          return false;
        }
        const logDate = line.split(" ")[0];
        const logDateTime = new Date(logDate + "Z");
        const today = new Date();
        const diffTime = Math.abs(today - logDateTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      })
      .join("\n");
    if(logs.length === 0) {
      return res.status(404).json({ message: "No logs found" });
    }
    res.send(logs);
  });
};

const getErrorLogs = (req, res) => {
  //"http://localhost:3000/api/server-logs/errors?password=@Darkluffy3310"
  const password = req.query.password;
  const days = req.query.days || 1;
  if (password !== "@Darkluffy3310") {
    return res.status(401).json({ message: "HEHE Nubs" });
  }
  const logFilePath = path.join(__dirname, "../../logs/error.log");

  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Unable to read log file", error: err.message });
    }
    res.setHeader("Content-Type", "text/plain");
    // only return logs from the last {days} days (default: 1 day) log example 2025-02-28 12:55:10 info: Server is running on port 3000
    const logs = data
      .split("\n")
      .filter((line) => {
        if (line.length === 0) {
          return false;
        }
        const logDate = line.split(" ")[0];
        const logDateTime = new Date(logDate + "Z");
        const today = new Date();
        const diffTime = Math.abs(today - logDateTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      })
      .join("\n");
    if(logs.length === 0) {
      return res.status(404).json({ message: "No logs found" });
    }
    res.send(logs);
  });
};

module.exports = {
  getCombineLogs,
  getErrorLogs,
};
