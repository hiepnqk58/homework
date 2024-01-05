const Joi = require("joi");
const { macAddress } = require("./customize.validation");

const addSchema = {
  body: Joi.array().items(
    Joi.object()
      .keys({
        mac: Joi.string().required().custom(macAddress),
        unit_code: Joi.string().required(""),
        type: Joi.string().required(),
        manager_name: Joi.string().required(),
      })
      .options({ allowUnknown: true })
  ),
};

const editSchema = {
  body: Joi.object()
    .keys({
      mac: Joi.string().required().custom(macAddress),
      unique: Joi.string().required(""),
      unit_code: Joi.string().required(""),
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
