const c2ServerModel = require("../models/C2Server");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const moment = require("moment");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.receiveC2Server = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let dateObj = setting.config;
    let dateCheck = dateObj.time_c2server;
    let urlReceive = setting.url_share_service;
    let urlC2ServerReceive = urlReceive + "/api/v1/c2-server/by-date/";
    let checkUrl = await common.checkUrl(urlReceive);
    if (checkUrl) {
      let params = { start_date: new Date(dateCheck) };
      let result = await common.receive(urlC2ServerReceive, params);
      let arrC2Server = result.data.data;
      if (Array.isArray(arrC2Server) && arrC2Server.length > 0) {
        for (let index in arrC2Server) {
          const c2Server = arrC2Server[index];
          delete c2Server._id;
          let query = { name: c2Server.name };
          const option = { new: true, upsert: true };
          await c2ServerModel.findOneAndUpdate(query, c2Server, option);
        }
        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              "config.time_c2server": new Date(
                arrC2Server[arrC2Server.length - 1].updated_at
              ),
            },
          }
        );
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
