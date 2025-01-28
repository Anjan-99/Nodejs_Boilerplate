const Joi = require("joi");

const userValidationSchema = Joi.object({
  payload: Joi.object({
    exchange: Joi.string().valid("Zerodha").required().messages({
      "any.required": "Exchange is required.",
      "any.only": "Exchange must be 'Zerodha'.",
    }),
    name: Joi.string().required().messages({
      "any.required": "Name is required.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address.",
      "any.required": "Email is required.",
    }),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,3}?\s?\d{10}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone must be a valid number with optional country code.",
        "any.required": "Phone is required.",
      }),

    zerodhaDetails: Joi.when("exchange", {
      is: "Zerodha",
      then: Joi.object({
        api_key: Joi.string()
          .required()
          .messages({ "any.required": "API Key is required." }),
        api_secret: Joi.string()
          .required()
          .messages({ "any.required": "API Secret is required." }),
      })
        .required()
        .messages({
          "any.required":
            "Zerodha details are required when exchange is 'Zerodha'.",
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Zerodha details should not be provided for other exchanges.",
      }),
    })
  }),
});

module.exports = { userValidationSchema };
