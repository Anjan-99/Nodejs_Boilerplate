const joi = require("joi");

const Register_schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const Login_schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

module.exports = { Register_schema , Login_schema };
