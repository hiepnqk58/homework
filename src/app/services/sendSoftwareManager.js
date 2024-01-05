const softwareManagerModel = require("../models/SoftwareManager");
const settingModel = require("../models/Setting");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");
const common = require("../../helper/common");

module.exports.sendSoftwareManager = async (req, res) => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let urlSend = setting.url_send;
    let urlSoftManagerSend = urlSend + "/api/v1/softwares/insert";
    let checkUrlSoftware = await common.checkUrl(urlSend);
    if (checkUrlSoftware) {
      if(setting.type_software == "FMS3") {
        let software = await softwareManagerModel.find().lean();
        if (software.length > 0) {
          common.send(urlSoftManagerSend, software);
        }
      }
      if(setting.type_software == "FMS2") {
        let software = await softwareManagerModel.find({type_software:"FMS2"}).lean();
        if (software.length > 0) {
          common.send(urlSoftManagerSend, software);
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
