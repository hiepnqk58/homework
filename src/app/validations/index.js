const authValidation = require("./auth.validation");
const userValidation = require("./user.validation");
const unitValidation = require("./unit.validation");
const identDeviceValidation = require("./identDevice.validation");
const activeDeviceValidation = require("./activeDevice.validation");
const alertValidation = require("./alert.validation");
const eventValidation = require("./event.validation");
const softWareValidation = require("./softWare.validation");
module.exports = {
  authValidation,
  userValidation,
  unitValidation,
  softWareValidation,
  eventValidation,
  alertValidation,
  activeDeviceValidation,
  identDeviceValidation,
};
