const jwt = require("jsonwebtoken");
require("dotenv").config();
const redisClient = require("../init_redis");
const customError = require("../customError");
const logger = require("../logger");
const bcrypt = require("bcrypt");

const generateDeviceId = async () => {
  const timestamp = Date.now().toString();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(timestamp, salt);
  return hash.replace(/[^a-zA-Z0-9]/g, ""); // Clean the hash for use as ID
};

module.exports = {
  signAccessToken: (id,role) => {
    return new Promise((resolve, reject) => {
      const payload = { role: role };
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
  signRefreshToken: async (id) => {
    const deviceId = await generateDeviceId();
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      // if token already exists in redis, then update that with same key and new token
      redisClient.get(id, (err, result) => {
        if (err) {
          reject(new customError("Internal Server Error", 500));
        }
        if (result) {
          const options = {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
            issuer: process.env.REFRESH_TOKEN_ISSUER,
            audience: id,
          };
          jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET,
            options,
            (err, token) => {
              if (err) {
                reject(new customError("Internal Server Error", 500));
              }
              redisClient.set(
                id,
                token,
                "EX",
                365 * 24 * 60 * 60,
                (err, reply) => {
                  if (err) {
                    reject(new customError("Internal Server Error", 500));
                  } else {
                    return resolve(token);
                  }
                }
              );
            }
          );
        } else {
          const options = {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
            issuer: process.env.REFRESH_TOKEN_ISSUER,
            audience: `${id}-${deviceId}`,
          };
          jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
              reject(new customError("Internal Server Error", 500));
            }
            //check if the token is already in the redis
            const Redis_key = `${id}-${deviceId}`;
            redisClient.set(
              Redis_key,
              token,
              "EX",
              365 * 24 * 60 * 60,
              (err, reply) => {
                if (err) {
                  reject(new customError("Internal Server Error", 500));
                } else {
                  resolve(token);
                }
              }
            );
          });
        }
      });
    });
  },
  verifyRefreshToken: async (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          logger.error(`Error occurred: ${err.message}`);
          reject(new customError("Unauthorized", 401));
        }
        console.log("Payload: ", payload);
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
