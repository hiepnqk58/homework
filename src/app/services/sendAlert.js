const alertModel = require("../models/Alert");
const settingModel = require("../models/Setting");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");

module.exports.sendAlert = async (req, res) => {
  try {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let urlSend = setting.url_send;
    let numberService = setting.number_service.alerts_send
    let urlAlertSend = urlSend + "/api/v1/alerts/insert"; // api insert array alerts
    let checkUrl = await common.checkUrl(urlSend);
    if (checkUrl) {
      let indexAlert = setting.config.index_alert;
      if (!indexAlert) {
        let queryFirst = [{ $sort: { auto_increment: 1 } },{ $limit: numberService }];
        let queryFirstNotAuto = [{ $sort: { auto_increment: 1 } },{ $limit: numberService }, { $project: { auto_increment: 0 } }];
        let alertsFirst = await alertModel.aggregate(queryFirst, { "allowDiskUse" : true });
        let alertsFirstNotAuto = await alertModel.aggregate(queryFirstNotAuto, { "allowDiskUse" : true })
        if (alertsFirst.length > 0) {
          let indexReceive =
            alertsFirst.length == numberService ? numberService : alertsFirst.length;
          let result = await common.send(urlAlertSend, alertsFirstNotAuto);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.index_alert":
                    alertsFirst[indexReceive - 1].auto_increment,
                },
              }
            );
          }
        }
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
        ]
        let alerts = await alertModel.aggregate(query, { "allowDiskUse" : true });
        let alertsNotAuto = await alertModel.aggregate(queryNotAuto, { "allowDiskUse" : true });
        if (alerts.length > 0) {
          let indexReceive =
            alerts.length == numberService ? numberService : alerts.length;
          let result = await common.send(urlAlertSend, alertsNotAuto);
          if (result.status == "200") {
            await settingModel.findOneAndUpdate(
              {},
              {
                $set: {
                  "config.index_alert": alerts[indexReceive - 1].auto_increment,
                },
              }
            );
          }
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
