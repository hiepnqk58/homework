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
        unit_code: Joi.string().allow(""),
        unit_name: Joi.string().allow(""),
        region: Joi.string().allow(""),
        alert_info: Joi.object().allow({}),
        alert_description: Joi.string().allow(""),
        alert_type: Joi.string().required(),
        alert_source: Joi.string().required(),
        event_time: Joi.string().allow(""),
        time_send: Joi.string().allow(""),
        time_receive: Joi.string().allow(""),
      })
      .options({ allowUnknown: true })
  ),
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
  addSchema,
};
