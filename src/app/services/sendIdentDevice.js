const identDeviceModel = require("../models/IdentDevice");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.sendIdentDevice = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let numberService = setting.number_service.ident_device_send
    let dateObj = setting.config;
    let timeIdentDevice = dateObj.time_ident_device;
    let curentDate = Date.now()
    let urlSend = setting.url_send;
    let urlDeviceSend = urlSend + "/api/v1/ident-devices/insert";
    let checkUrl = await common.checkUrl(urlSend);
    if (checkUrl) {
      if (!timeIdentDevice) {
        let queryFirst = [
          {$project:{_id:0}},
          { $sort: { updated_at: 1 } },
          { $limit: numberService },   
        ];
        let deviceFirst = await identDeviceModel.aggregate(queryFirst, { "allowDiskUse" : true });
        if (deviceFirst.length > 0) {
          let timeReceive =
            deviceFirst.length > numberService
              ? numberService
              : deviceFirst.length;
          let result = await common.send(urlDeviceSend, deviceFirst);
          let timeSend = deviceFirst[timeReceive - 1].updated_at;
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.time_ident_device": new Date(timeSend),
                },
              }
            );
          }
        }

        return true;
      } else {
        let checkDayFomat = new Date(timeIdentDevice)
        let timeCompare = checkDayFomat > curentDate ? curentDate : checkDayFomat
        let query = [
          {$project:{_id:0}},
          { $sort: { updated_at: 1 } },
          {
            $match: {
              $or: [
                { updated_at: { $gte: timeCompare } },
                { created_at: { $gte: timeCompare } },
              ],
            },
          },
          { $limit: numberService }, 
        ];

        let device = await identDeviceModel.aggregate(query, { "allowDiskUse" : true });
        if (device.length > 0) {
          let timeReceive =
            device.length > numberService
              ? numberService
              : device.length;
          let result = await common.send(urlDeviceSend, device);
          let timeSend = device[timeReceive - 1].updated_at;
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.time_ident_device": new Date(timeSend),
                },
              }
            );
          }
        }
      }
      return true;
    }
  } catch (error) {
    const stack = stackTrace.parse(error);
    const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
    log.error(error, [lineNumber]);
    return false;
  }
};
