const hashModel = require("../models/Hash");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const moment = require("moment");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.receiveHash = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let dateObj = setting.config;
    let dateCheck = dateObj.time_hash;
    let urlReceive = setting.url_share_service;
    let urlHashReceive = urlReceive + "/api/v1/hashs/by-date/";
    let checkUrl = await common.checkUrl(urlReceive);
    if (checkUrl) {
      let params = { start_date: new Date(dateCheck) };
      let result = await common.receive(urlHashReceive, params);
      let arrHash = result.data.data;
      if (Array.isArray(arrHash) && arrHash.length > 0) {
        for (let index in arrHash) {
          let objectHash = arrHash[index];
          delete objectHash._id;
          let query = { hash: objectHash.hash };
          let option = { new: true, upsert: true };
          await hashModel.findOneAndUpdate(query, objectHash, option);
        }

        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              "config.time_hash": new Date(
                arrHash[arrHash.length - 1].updated_at
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
