const eventModel = require("../models/Event");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

async function sendEventByRegion(indexCheck, urlAlertSend, region, numberSend) {
  let fieldUpdate = `region${region}.index_event`;
  if (!indexCheck) {
    let queryFirst = [
      { $match: { region: region } },
      { $sort: { auto_increment: 1 } },
      { $limit: numberSend },
    ];
    let queryFirstNotAuto = [
      { $match: { region: region } },
      { $sort: { auto_increment: 1 } },
      { $limit: numberSend },
      { $project: { auto_increment: 0 } },
    ];
    let alertsFirst = await eventModel.aggregate(queryFirst, { "allowDiskUse" : true });
    let alertsFirstNotAuto = await eventModel.aggregate(queryFirstNotAuto, { "allowDiskUse" : true });
    if (alertsFirst.length > 0) {
      let indexReceive =
        alertsFirst.length > numberSend ? numberSend : alertsFirst.length;
      let result = await common.send(urlAlertSend, alertsFirstNotAuto);
      if (result.status == "200") {
        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              [fieldUpdate]: alertsFirst[indexReceive - 1].auto_increment
            },
          }
        );
      }
    }

    return true;
  } else {
    let query = [
      { $match: { region: region } },
      {
        $match:{auto_increment:{$gt:indexCheck}}
      },
      { $sort: { auto_increment: 1 } },
      { $limit: numberSend },
    ];
    let queryNotAuto = [
      { $match: { region: region } },
      {
        $match:{auto_increment:{$gt:indexCheck}}
      },
      { $sort: { auto_increment: 1 } },
      { $limit: numberSend },
      { $project: { auto_increment: 0 } },
    ];
    let alerts = await eventModel.aggregate(query, { "allowDiskUse" : true });
    let alertsNotAuto = await eventModel.aggregate(queryNotAuto, { "allowDiskUse" : true });
    if (alerts.length > 0) {
      let indexReceive =
        alerts.length > numberSend ? numberSend : alerts.length;
      let result = await common.send(urlAlertSend, alertsNotAuto);
      if (result.status == "200") {
        await settingModel.findOneAndUpdate(
          {},
          {
            $set: {
              [fieldUpdate]: alerts[indexReceive - 1].auto_increment
            },
          }
        );
      }
    }

    return true;
  }
}

module.exports.sendEventRegion = async () => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let numberService = setting.number_service.events_send
    let indexCheckV1 = setting.region1.index_event;
    let indexCheckV2 = setting.region2.index_event;
    let indexCheckV3 = setting.region3.index_event;

    let urlV1 = setting?.url_v1 || "";
    let urlV2 = setting?.url_v2 || "";
    let urlV3 = setting?.url_v3 || "";

    let urlAlertSendV1 = setting?.url_v1 + "/api/v1/events/insert";
    let urlAlertSendV2 = setting?.url_v2 + "/api/v1/events/insert";
    let urlAlertSendV3 = setting?.url_v3 + "/api/v1/events/insert";
    if (urlV1) {
      let checkUrlV1 = await common.checkUrl(urlV1);
      if (checkUrlV1) {
        let sendEventV1 = sendEventByRegion(indexCheckV1, urlAlertSendV1, "1",numberService);
      }
    }

    if (urlV2) {
      let checkUrlV2 = await common.checkUrl(urlV2);
      if (checkUrlV2) {
        let sendEventV2 = sendEventByRegion(indexCheckV2, urlAlertSendV2, "2",numberService);
      }
    }

    if (urlV3) {
      let checkUrlV3 = await common.checkUrl(urlV3);
      if (checkUrlV3) {
        let sendEventV3 = sendEventByRegion(indexCheckV3, urlAlertSendV3, "3",numberService);
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
