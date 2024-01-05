const Joi = require("joi");

const { password } = require("./customize.validation");

const loginSchema = {
  body: Joi.object()
    .keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

const logoutSchema = {
  body: Joi.object()
    .keys({
      user_id: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

const registerSchema = {
  body: Joi.object()
    .keys({
      username: Joi.string().required(),
      password: Joi.string().required().custom(password),
      fullName: Joi.string().allow(""),
      role: Joi.string().allow(""),
      unit: Joi.string().allow(""),
    })
    .options({ allowUnknown: true }),
};

module.exports = {
  loginSchema,
  logoutSchema,
  registerSchema,
};
