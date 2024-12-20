const jwt = require("jsonwebtoken");
require("dotenv").config();
const redisClient = require("../init_redis");
const customError = require("../customError");
const logger = require("../logger");

module.exports = {
  signAccessToken: (id) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        issuer: process.env.ACCESS_TOKEN_ISSUER,
        audience: id,
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          process.env.NODE_ENV === "development"
            ? reject(new customError(err.message, 500))
            : reject(new customError("Internal Server Error", 500));
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError"
            ? "Unauthorized"
            : err.message === "TokenExpiredError"
            ? "Token Expired"
            : "Internal Server Error";
        process.env.NODE_ENV === "development"
          ? next(new customError(message, 401))
          : next(new customError("Unauthorized", 401));
      }
      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (id) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        issuer: process.env.REFRESH_TOKEN_ISSUER,
        audience: id,
      };
      logger.info("userId", id);
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          reject(new customError("Internal Server Error", 500));
        }
        redisClient.set(id, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            reject(new customError("Internal Server Error", 500));
          } else {
            resolve(token);
          }
        });
      });
    });
  },
  verifyRefreshToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          logger.error(`Error occurred: ${err.message}`);
          reject(new customError("Unauthorized", 401));
        }
        const id = payload.aud;
        redisClient.get(id, (redisErr, result) => {
          if (redisErr) {
            logger.error("Redis error occurred : ", redisErr.message);
            reject(new customError("Internal Server Error", 500));
          }
          if (result === token) {
            return resolve(id); // Successfully resolved
          } else {
            reject(new customError("Unauthorized", 401));
          }
        });
      });
    });
  },
};
