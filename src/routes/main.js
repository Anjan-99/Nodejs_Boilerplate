const express = require("express");
const authRouter = require("./auth");
const userRouter = require("./user");
const log = require("./log");
const serverLog = require("./serverLog");

const app = express();

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/logs", log);
app.use("/server-logs", serverLog);

module.exports = app;
