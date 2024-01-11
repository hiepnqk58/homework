const Joi = require("joi");

const { password } = require("./customize.validation");

const addSchema = {
  body: Joi.object()
    .keys({
      username: Joi.string().required(),
      // password: Joi.string().required().custom(password),
      role: Joi.string().required(),
      full_name: Joi.string().allow(""),
    })
    .options({ allowUnknown: true }),
};

const editSchema = {
  body: Joi.object()
    .keys({
      username: Joi.string().required(),
      // password: Joi.string().required().custom(password),
      role: Joi.string().required(),
      full_name: Joi.string().allow(""),
    })
    .options({ allowUnknown: true }),
};

const deleteSchema = {
  body: Joi.object()
    .keys({
      id: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

const detailSchema = {
  body: Joi.object()
    .keys({
      id: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

module.exports = {
  detailSchema,
  deleteSchema,
  editSchema,
  addSchema,
};
