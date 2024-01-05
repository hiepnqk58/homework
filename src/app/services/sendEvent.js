const eventModel = require("../models/Event");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.sendEvent = async (req, res) => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let numberService = setting.number_service.events_send
    let urlSend = setting.url_send;
    let urlEventSend = urlSend + "/api/v1/events/insert"; // api insert array events

    let checkUrl = await common.checkUrl(urlSend);
    if (checkUrl) {
      let indexAlert = setting.config.index_event;
      if (!indexAlert) {
        let queryFirst = [{ $sort: { auto_increment: 1 } },{ $limit: numberService }];
        let queryFirstNotAuto = [{ $sort: { auto_increment: 1 } },{ $limit: numberService }, { $project: { auto_increment: 0 } }];
        let alertsFirst = await eventModel.aggregate(queryFirst, { "allowDiskUse" : true });
        let alertsFirstNotAuto = await eventModel.aggregate(queryFirstNotAuto, { "allowDiskUse" : true });
        if (alertsFirst.length > 0) {
          let indexReceive =
            alertsFirst.length ==numberService
              ? numberService
              : alertsFirst.length;
          let result = await common.send(urlEventSend, alertsFirstNotAuto);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.index_event":
                    alertsFirst[indexReceive - 1].auto_increment
                },
              }
            );
          }
        }
        return true;
      } else {
        let query = [
          {
            $match:{auto_increment:{$gt:indexAlert}}
          },
          { $sort: { auto_increment: 1 } },
          { $limit: numberService },    
        ];
        let queryNotAuto = [
          {
            $match:{auto_increment:{$gt:indexAlert}}
          },
          { $sort: { auto_increment: 1 } },
          { $limit: numberService },   
          { $project: { auto_increment: 0 } },
        ];
        let alerts = await eventModel.aggregate(query, { "allowDiskUse" : true });
        let alertsNotAuto = await eventModel.aggregate(queryNotAuto, { "allowDiskUse" : true });
        if (alerts.length > 0) {
          let indexReceive =
            alerts.length == numberService ? numberService : alerts.length;
          let result = await common.send(urlEventSend, alertsNotAuto);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.index_event": alerts[indexReceive - 1].auto_increment
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
