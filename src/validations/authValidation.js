const Joi = require("joi");

const Register_schema = Joi.object({
  username: Joi.string().min(3).required().messages({
    "string.min": "Username must be at least 3 characters long.",
    "any.required": "Username is required.",
    "string.empty": "Username cannot be empty.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
    "string.empty": "Email cannot be empty.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
  }),
  role: Joi.string()
    .valid("Admin", "SuperAdmin")
    .required()
    .messages({
      "any.required": "Role is required.",
      "any.only": "Role must be either Admin or SuperAdmin.",
      "string.empty": "Role cannot be empty.",
    }),
  users: Joi.array().items(
    Joi.object({
      userId: Joi.string().required().messages({
        "any.required": "User ID is required.",
        "string.empty": "User ID cannot be empty.",
      }),
    })
  ),
});

const Login_schema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
  }),
});

const update_Details = Joi.object({
  adminId : Joi.string().required().messages({
    "any.required": "Admin ID is required.",
    "string.empty": "Admin ID cannot be empty.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
  username: Joi.string().min(3).required().messages({
    "string.min": "Username must be at least 3 characters long.",
    "any.required": "Username is required.",
    "string.empty": "Username cannot be empty.",
  }),
});

const update_Password = Joi.object({
  adminId: Joi.string().required().messages({
    "any.required": "Admin ID is required.",
    "string.empty": "Admin ID cannot be empty.",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password cannot be empty.",
    "any.required": "Password is required.",
  }),
  newPassword: Joi.string().min(1).required().messages({
    "string.empty": "New password cannot be empty.",
    "any.required": "New password is required.",
  }),
});

const enable2fa = Joi.object({
  adminId: Joi.string().required().messages({
    "any.required": "Admin ID is required.",
    "string.empty": "Admin ID cannot be empty.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password cannot be empty.",
  }),
  twofa: Joi.boolean().required().messages({
    "any.required": "2FA is required.",
    "boolean.base": "2FA must be a boolean.",
  }),
});

const verify2fa = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.",
    "any.required": "Email is required.",
  }),
  otp: Joi.number().required().messages({
    "any.required": "OTP is required.",
    "number.base": "OTP must be a number.",
    "number.length": "OTP must be 6 digits long.",
  }),
});

module.exports = {
  Register_schema,
  Login_schema,
  update_Details,
  update_Password,
  enable2fa,
  verify2fa,
};
