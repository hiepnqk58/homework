const unitModel = require("../models/Unit");
const settingModel = require("../models/Setting");
const identDeviceModel = require("../models/IdentDevice");
const softwareManagerModel = require("../models/SoftwareManager");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");
module.exports.receiveUnit = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let unitCode = setting.unit_code;
    let urlReceive = setting.url_share_service;
    let urlUnitReceive = urlReceive + "/api/v1/units/all-child/";
    let checkUrl = await common.checkUrl(urlReceive);
    if (checkUrl) {
      let params = { unit_code: unitCode };
      let result = await common.receive(urlUnitReceive, params);
      if (result.data.message == "Success send unit") {
        let arrUnit = result.data.data;
        if (Array.isArray(arrUnit) && arrUnit.length > 0) {
          await unitModel.deleteMany({});
          let data = await unitModel.insertMany(arrUnit);
        }
        let identDeviceArray = await identDeviceModel.find({
          "idParent.unit_code": unitCode,
        });
        if (Array.isArray(identDeviceArray) && identDeviceArray.length > 0) {
          for (let index in identDeviceArray) {
            let identDevice = identDeviceArray[index];
            let unitNew = await unitModel.checkExistingField(
              "unit_code",
              identDevice.unit_code
            );
            let idParentNew = await common.getArrayUnit(identDevice.unit_code);
            let regionNew = unitNew.region[0];
            const query = { unique: identDevice.unique };
            identDevice = identDevice.toObject();
            let update = {};
            update = {
              ...identDevice,
              idParent: idParentNew,
              unit: unitNew,
              region: regionNew,
            };
            const option = { new: true, upsert: true };
            await identDeviceModel.findOneAndUpdate(query, update, option);
          }
        }
      }
    }
    return true;
  } catch (error) {
    const stack = stackTrace.parse(error);
    const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
    log.error(error, [lineNumber]);
    return false;
  }
};
