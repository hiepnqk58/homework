const softwareManagerModel = require("../models/SoftwareManager");
const settingModel = require("../models/Setting");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");
const common = require("../../helper/common");

module.exports.sendSoftwareManagerRegion = async (req, res) => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let urlSendV1 = setting.url_v1;
    let urlSendV2 = setting.url_v2;
    let urlSendV3 = setting.url_v3;

    let urlSoftManagerSendV1 = urlSendV1 + "/api/v1/softwares/insert";
    let urlSoftManagerSendV2 = urlSendV2 + "/api/v1/softwares/insert";
    let urlSoftManagerSendV3 = urlSendV3 + "/api/v1/softwares/insert";
    if (urlSendV1) {
      let checkUrlV1 = await common.checkUrl(urlSendV1);
      if (checkUrlV1) {
        let softWareManagerV1 = await softwareManagerModel
          .find({$and:[{region: "1"},{type_software:{$ne:"FMS1"}},{type_software:{$ne:"FMS2"}}] })
          .lean();
        common.send(urlSoftManagerSendV1, softWareManagerV1);
      }
    }
    if (urlSendV2) {
      let checkUrlV2 = await common.checkUrl(urlSendV2);
      if (checkUrlV2) {
        softWareManagerV2 = await softwareManagerModel
        .find({$and:[{region: "2"},{type_software:{$ne:"FMS1"}},{type_software:{$ne:"FMS2"}}] })
          .lean();
        common.send(urlSoftManagerSendV2, softWareManagerV2);
      }
    }
    if (urlSendV3) {
      let checkUrlV3 = await common.checkUrl(urlSendV3);
      if (checkUrlV3) {
        let softWareManagerV3 = await softwareManagerModel
        .find({$and:[{region: "3"},{type_software:{$ne:"FMS1"}},{type_software:{$ne:"FMS2"}}] })
          .lean();
        common.send(urlSoftManagerSendV3, softWareManagerV3);
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
