const unitModel = require("../models/Unit");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");
module.exports.receiveUnitRegion = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let urlReceive = setting.url_share_service;
    let urlUnitReceive = urlReceive + "/api/v1/units/all-child/";
    let checkUrl = await common.checkUrl(urlReceive);
    if (checkUrl) {
      let activeRegion1 = setting.region1.active ? "1" : "";
      let activeRegion2 = setting.region2.active ? "2" : "";
      let activeRegion3 = setting.region3.active ? "3" : "";
      receiveByRegion(activeRegion1, urlUnitReceive);
      receiveByRegion(activeRegion2, urlUnitReceive);
      receiveByRegion(activeRegion3, urlUnitReceive);
    }

    return true;
  } catch (error) {
    const stack = stackTrace.parse(error);
    const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
    log.error(error, [lineNumber]);
    return false;
  }
};

let receiveByRegion = async (activeRegion, urlUnitReceive) => {
  if (activeRegion) {
    let params = { region: activeRegion };
    let result = await common.receive(urlUnitReceive, params);
    let arrUnit = result.data.data;
    if (Array.isArray(arrUnit) && arrUnit.length > 0) {
      await unitModel.deleteMany({});
      let data = await unitModel.insertMany(arrUnit);
    }
    return true;
  }
  return false;
};
