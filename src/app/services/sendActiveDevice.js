const activeDeviceModel = require("../models/ActiveDevice");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.sendActiveDevice = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let dateObj = setting.config;
    let timeActiveDevice = dateObj.time_active_device;
    let curentDate = Date.now()

    let numberService = setting.number_service.active_device_send
    
    let urlSend = setting.url_send;
    let urlDeviceSend = urlSend + "/api/v1/active-devices/insert";
    let checkUrl = await common.checkUrl(urlSend);
    if (checkUrl) {
      if (!timeActiveDevice) {
        let queryFirst = [
          {$project:{_id:0}},
          { $sort: { updated_at: 1 } },
          { $limit: numberService },
        ];
        let deviceFirst = await activeDeviceModel.aggregate(queryFirst, { "allowDiskUse" : true });
        if (deviceFirst.length > 0) {
          let timeReceive =
            deviceFirst.length > numberService
              ? numberService
              : deviceFirst.length;
          let timeSend = deviceFirst[timeReceive - 1].updated_at;
          let result = await common.send(urlDeviceSend, deviceFirst);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.time_active_device": new Date(timeSend),
                },
              }
            );
          }
        }

        return true;
      } else {
        let checkDayFomat = new Date(timeActiveDevice)
        let timeCompare = checkDayFomat > curentDate ? curentDate : checkDayFomat
        let query = [
          {$project:{_id:0}},
          { $sort: { updated_at: 1 } },  
          {
            $match: {
              $or: [
                { updated_at: { $gte:  timeCompare } },
                { created_at: { $gte:  timeCompare } },
              ],
            },
          },
          { $limit: numberService },
        ];

        let device = await activeDeviceModel.aggregate(query, { "allowDiskUse" : true });
        if (device.length > 0) {
          let timeReceive =
            device.length > numberService
              ? numberService
              : device.length;
          let timeSend = device[timeReceive - 1].updated_at;
          let result = await common.send(urlDeviceSend, device);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.time_active_device": new Date(timeSend),
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
