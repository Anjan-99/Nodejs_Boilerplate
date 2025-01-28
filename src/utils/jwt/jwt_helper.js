const jwt = require("jsonwebtoken");
require("dotenv").config();
const customError = require("../customError");
const {findAdmin} = require("../dbutils/admin");
module.exports = {
  signAccessToken: (id, role) => {
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
    if (!req.headers.authorization) {
      return next(new customError("Unauthorized", 401));
    }
    
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        let message;
        if (err.name === "JsonWebTokenError") {
          message = "Unauthorized";
        } else if (err.name === "TokenExpiredError") {
          message = "Token Expired";
        } else {
          message = "Internal Server Error";
        }
        return next(
          new customError(message, err.name === "TokenExpiredError" ? 403 : 401)
        );
      }
      // take id from audience
      let id = payload.aud;
      await findAdmin({ adminId: id });
      req.payload = payload;
      next();
    });
  },
};
