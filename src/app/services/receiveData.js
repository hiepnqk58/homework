var { receiveHash } = require("./receiveHash");
var { receiveC2Server } = require("./receiveC2server");
var { receiveUnit } = require("./receiveUnit");
var { receiveUnitRegion } = require("./receiveUnitRegion");
const settingModel = require("../models/Setting");
const schedule = require("node-schedule");

const c2server = async () => {
  receiveC2Server();
};

const hash = async () => {
  receiveHash();
};

const unit = async () => {
  receiveUnit();
};

const unitRegion = async () => {
  receiveUnitRegion();
};

let receive = async () => {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let time_send= setting.time_receive_schedule;
  const job = schedule.scheduleJob(time_send, async function () {
    let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
    let type = setting?.type_software || "";
    let urlShareService = setting?.url_share_service || "";
    if (urlShareService && type) {
      switch (type) {
        case "FMS2":
          unitRegion();
          break;
        case "FMS3":
          c2server();
          hash();
          unit();
          break;
        default:
          unit();
          break;
      }
    }
  });
};

module.exports = receive;
