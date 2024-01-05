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
        public_ip: Joi.string()
          .ip({
            version: ["ipv4", "ipv6"],
          })
          .allow(""),
        mac: Joi.string().required().custom(macAddress),
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
        public_ip: Joi.string()
          .ip({
            version: ["ipv4", "ipv6"],
          })
          .allow(""),
          mac: Joi.string().required().custom(macAddress),
      })
      .options({ allowUnknown: true })
  ),
};

const deleteSchema = {
  body: Joi.array().items(
    Joi.object()
      .keys({
        id: Joi.string().required(),
      })
      .options({ allowUnknown: true })
  ),
};

const detailSchema = {
  body: Joi.array().items(
    Joi.object()
      .keys({
        id: Joi.string().required(),
      })
      .options({ allowUnknown: true })
  ),
};

module.exports = {
  detailSchema,
  deleteSchema,
  editSchema,
  addSchema,
};
