const activeDeviceModel = require("../models/ActiveDevice");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.sendActiveDeviceRegion = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let numberService = setting.number_service.active_device_send
    let dateCheckV1 = setting.region1.time_active_device;
    let dateCheckV2 = setting.region2.time_active_device;
    let dateCheckV3 = setting.region3.time_active_device;

    let urlV1 = setting?.url_v1 || "";
    let urlV2 = setting?.url_v2 || "";
    let urlV3 = setting?.url_v3 || "";

    let urlDeviceSendV1 = urlV1 + "/api/v1/active-devices/insert";
    let urlDeviceSendV2 = urlV2 + "/api/v1/active-devices/insert";
    let urlDeviceSendV3 = urlV3 + "/api/v1/active-devices/insert";
    if (urlV1) {
      let checkUrlV1 = await common.checkUrl(urlV1);
      if (checkUrlV1) {
        let sendActiveDeviceV1 = sendActiveDeviceByRegion(
          dateCheckV1,
          urlDeviceSendV1,
          "1",
          numberService
        );
      }
    }
    if (urlV2) {
      let checkUrlV2 = await common.checkUrl(urlV2);
      if (checkUrlV2) {
        let sendActiveDeviceV2 = sendActiveDeviceByRegion(
          dateCheckV2,
          urlDeviceSendV2,
          "2",
          numberService
        );
      }
    }
    if (urlV3) {
      let checkUrlV3 = await common.checkUrl(urlV3);
      if (checkUrlV3) {
        let sendActiveDeviceV3 = sendActiveDeviceByRegion(
          dateCheckV3,
          urlDeviceSendV3,
          "3",
          numberService
        );
      }
    }
  } catch (error) {
    const stack = stackTrace.parse(error);
    const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
    log.error(error, [lineNumber]);
    return false;
  }
};

let sendActiveDeviceByRegion = async (dateCheck, urlDeviceSend, region,numberSend) => {
  let curentDate = Date.now()
  let fieldUpdate = `region${region}.time_active_device`;
  if (!dateCheck) {
    let queryFirst = [
      {$project:{_id:0}},
      { $match: { region: region } },
      { $sort: { updated_at: 1 } },  
      { $limit: numberSend },
    ];
    let deviceFirst = await activeDeviceModel.aggregate(queryFirst, { "allowDiskUse" : true });
    if (deviceFirst.length > 0) {
      let timeReceive =
        deviceFirst.length > numberSend
          ? numberSend
          : deviceFirst.length;
      let timeSend = deviceFirst[timeReceive - 1].updated_at;
      let result = await common.send(urlDeviceSend, deviceFirst);
      if (result.status == "200") {
        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              [fieldUpdate]: new Date(timeSend),
            },
          }
        );
      }
    }

    return true;
  } else {
    let checkDayFomat = new Date(dateCheck)
    let timeCompare = checkDayFomat > curentDate ? curentDate : checkDayFomat
    let query = [
      {$project:{_id:0}},
      { $match: { region: region } },
      { $sort: { updated_at: 1 } },
      {
        $match: {
          $or: [
            { updated_at: { $gte: timeCompare } },
            { created_at: { $gte: timeCompare } },
          ],
        },
      },
      { $limit: numberSend },
    ];

    let device = await activeDeviceModel.aggregate(query, { "allowDiskUse" : true });
    if (device.length > 0) {
      let timeReceive =
        device.length > numberSend ? numberSend : device.length;
      let timeSend = device[timeReceive - 1].updated_at;
      let result = await common.send(urlDeviceSend, device);
      if (result.status == "200") {
        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              [fieldUpdate]: new Date(timeSend),
            },
          }
        );
      }
    }

    return true;
  }
};
