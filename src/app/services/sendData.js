var { sendIdentDevice } = require("../services/sendIdentDevice");
var { sendActiveDevice } = require("../services/sendActiveDevice");
var { sendAlert } = require("../services/sendAlert");
var { sendEvent } = require("../services/sendEvent");
var { sendSoftwareManager } = require("../services/sendSoftwareManager");
var { sendIdentDeviceRegion } = require("./sendIdentDeviceRegion");
var { sendActiveDeviceRegion } = require("../services/sendActiveDeviceRegion");
var { sendAlertRegion } = require("./sendAlertRegion");
var { sendEventRegion } = require("../services/sendEventRegion");
var { sendSoftwareManagerRegion } = require("./sendSoftManagerRegion");
var { getConfig } = require("./getConfig");
const settingModel = require("../models/Setting");
const schedule = require("node-schedule");

const softwareManager = async () => {
  sendSoftwareManager();
};

const identDevice = async () => {
  sendIdentDevice();
};

const activeDevice = async () => {
  sendActiveDevice();
};

const alert = async () => {
  sendAlert();
};

const event = async () => {
  sendEvent();
};
const identDeviceRegion = async () => {
  sendIdentDeviceRegion();
};

const activeDeviceRegion = async () => {
  sendActiveDeviceRegion();
};

const alertRegion = async () => {
  sendAlertRegion();
};

const eventRegion = async () => {
  sendEventRegion();
};
const softwareManagerRegion = async () => {
  sendSoftwareManagerRegion();
};
const config = async () => {
  getConfig();
};
let send = async () => {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let time_send = setting.time_send_schedule;
  let isSend = setting.is_send;
  if (isSend == true) {
    const job = schedule.scheduleJob(time_send, async function () {
      let typeSoftware = setting?.type_software || "";
      let urlSend = setting?.url_send || "";
      let urlRegion1 = setting?.url_v1 || "";
      let urlRegion2 = setting?.url_v2 || "";
      let urlRegion3 = setting?.url_v3 || "";
      config();
      if (urlSend && typeSoftware) {
        switch (typeSoftware) {
          case "FMS3":
            alert();
            event();
            identDevice();
            activeDevice();
            softwareManager();
            break;
          case "FMS2":
            softwareManager();
            break;
          default:
            break;
        }
      }
      if (
        (urlRegion1 && typeSoftware) ||
        (urlRegion2 && typeSoftware) ||
        (urlRegion3 && typeSoftware)
      ) {
        switch (typeSoftware) {
          case "FMS1":
            alertRegion();
            eventRegion();
            identDeviceRegion();
            activeDeviceRegion();
            softwareManagerRegion();
            break;
          default:
            break;
        }
      }
    });
  }
};

module.exports = send;
