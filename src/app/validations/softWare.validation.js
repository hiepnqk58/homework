const Joi = require("joi");
const { macAddress } = require("./customize.validation");
const addSchema = {
  body: Joi.array().items(
    Joi.object()
      .keys({
        ip: Joi.string()
          .ip({
            version: ["ipv4", "ipv6"],
          })
          .required(),
        mac: Joi.string().required().custom(macAddress),
        id_software: Joi.string().allow(""),
        name_software: Joi.string().allow(""),
        software_version: Joi.string().allow(""),
        type_software: Joi.string().required(),
        unit_code: Joi.string().allow(""),
        region: Joi.string().allow(""),
        system_info: Joi.object().allow({}),
        idParent: Joi.string().allow(""),
        first_time: Joi.string().allow(""),
        last_time: Joi.string().allow(""),
        local_time: Joi.string().allow(""),
        first_install: Joi.string().allow(""),
      })
      .options({ allowUnknown: true })
  ),
};

const editSchema = {
  body: Joi.array().items(
    Joi.object()
      .keys({
        ip: Joi.string()
          .ip({
            version: ["ipv4", "ipv6"],
          })
          .required(),
        mac: Joi.string().required().custom(macAddress),
        id_software: Joi.string().allow(""),
        name_software: Joi.string().allow(""),
        software_version: Joi.string().allow(""),
        type_software: Joi.string().required(),
        unit_code: Joi.string().allow(""),
        region: Joi.string().allow(""),
        system_info: Joi.object().allow({}),
        idParent: Joi.string().allow(""),
        first_time: Joi.string().allow(""),
        last_time: Joi.string().allow(""),
        local_time: Joi.string().allow(""),
        first_install: Joi.string().allow(""),
      })
      .options({ allowUnknown: true })
  ),
};

const deleteSchema = {
  body: Joi.object()
    .keys({
      id_software: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

const detailSchema = {
  body: Joi.object()
    .keys({
      id_software: Joi.string().required(),
    })
    .options({ allowUnknown: true }),
};

module.exports = {
  detailSchema,
  deleteSchema,
  editSchema,
  addSchema,
};
