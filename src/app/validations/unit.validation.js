const Joi = require("joi");

const addSchema = {
  body: Joi.array().items(Joi.object()
    .keys({
      parent_unit_code: Joi.string().required(),
      unit_code: Joi.string().required(),
      name: Joi.string().allow(""),
      full_name: Joi.string().allow(""),
      region: Joi.array().allow(""),
      level: Joi.number().required(),
      active: Joi.string().required(),
      other_unit_code: Joi.array().allow(""),
      created_by: Joi.string().allow(""),
    })
    .options({ allowUnknown: true })),
};

const editSchema = {
  body: Joi.array().items(Joi.object()
    .keys({
      unit_code: Joi.string().required(),
      parent_unit_code: Joi.string().required(),
      name: Joi.string().allow(""),
      full_name: Joi.string().allow(""),
      region: Joi.array().allow(""),
      level: Joi.number().required(),
      active: Joi.string().required(),
      other_unit_code: Joi.array().allow(""),
      created_by: Joi.string().allow(""),
    })
    .options({ allowUnknown: true })),
};

const deleteSchema = {
  body: Joi.array().items(Joi.object()
    .keys({
      unit_code: Joi.string().required(),
    })
    .options({ allowUnknown: true })),
};

const detailSchema = {
  body: Joi.array().items(Joi.object()
    .keys({
      unit_code: Joi.string().required(),
    })
    .options({ allowUnknown: true })),
};

module.exports = {
  detailSchema,
  deleteSchema,
  editSchema,
  addSchema,
};
