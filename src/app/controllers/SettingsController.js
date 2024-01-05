const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const config = require("../../configs/app");
const settingModel = require("../models/Setting");
const activeDeviceModel = require("../models/ActiveDevice");
const alertModel = require("../models/Alert");
const c2ServerModel = require("../models/C2Server");
const eventModel = require("../models/Event");
const identDeviceModel = require("../models/IdentDevice");
const softwareManagerModel = require("../models/SoftwareManager");
const unitModel = require("../models/Unit");
const userModel = require("../models/User");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const common = require("../../helper/common");
/**
 * Lấy thông tin cấu hình.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getDetail = async (req, res) => {
  let id = req.query.id;
  if (id) {
    let data = await settingModel.findOne({ id });
    return successResponse(res, data, 200, "Success");
  }
  return errorResponse(res, 404, "Settings not found.");
};

/**
 * Thêm mới thông tin cấu hình
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.add = async (req, res) => {
  try {
    let newSettings = { ...req.body };
    let settings = await settingModel.create(newSettings);
    return successResponse(res, settings, 200, "Settings add Success");
  } catch (error) {
    return errorResponse(res, 500, "Settings add error");
  }
};

/**
 * Cập nhật thông tin cấu hình
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.edit = async (req, res) => {
  let id = req.body.id || config.firstId;
  try {
    let setting = await settingModel.findOne({ id });
    if (setting) {
      let editSetting = {
        ...req.body,
      };
      const settingUpdate = await settingModel.findOneAndUpdate(
        { id },
        editSetting
      );
      return successResponse(res, settingUpdate, 200, "Setting edit success");
    }
    return errorResponse(res, 404, "Setting not found.");
  } catch (error) {
    errorResponse(res, 500, "Setting edit error.");
  }
};

module.exports.resetSoftware = async (req, res) => {
  try {
    let dataDB = req.body.data_DB;
    let config = req.body.config;
    let token = req.body.token;
    if (dataDB.length > 0) {
      for (i in dataDB) {
        if (dataDB[i] != "settings") {
          let model = mongoose.model(dataDB[i]);
          await model.deleteMany({});
        }
      }
    }
    if (config) {
      await settingModel.findOneAndUpdate(
        { id: 1 },
        {
          $set: {
            config: {
              time_ident_device: new Date("2023-01-01 00:00:00"),
              time_active_device: new Date("2023-01-01 00:00:00"),
              time_unit: new Date("2023-01-01 00:00:00"),
              time_software: new Date("2023-01-01 00:00:00"),
              time_c2server: new Date("2023-01-01 00:00:00"),
              time_hash: new Date("2023-01-01 00:00:00"),
              index_alert: "",
              index_event: "",
            },
            id_software: "",
            unit_code: "",
            unit_name: "",
            serial_software: "",
            name_software: config.name_software,
            url_send: config.url_send,
            url_share_service: config.url_share_service,
            type_software: config.type_software,
            region1: {
              time_ident_device: new Date("2023-01-01 00:00:00"),
              time_active_device: new Date("2023-01-01 00:00:00"),
              index_event: "",
              index_alert: "",
              active: 0,
            },
            region2: {
              time_ident_device: new Date("2023-01-01 00:00:00"),
              time_active_device: new Date("2023-01-01 00:00:00"),
              index_event: "",
              index_alert: "",
              active: 0,
            },
            region3: {
              time_ident_device: new Date("2023-01-01 00:00:00"),
              time_active_device: new Date("2023-01-01 00:00:00"),
              index_event: "",
              index_alert: "",
              active: 0,
            },
            url_v1: config.url_region1,
            url_v2: config.url_region2,
            url_v3: config.url_region3,
            number_service: {
              active_device_send: 0,
              ident_device_send: 0,
              alerts_send: 0,
              events_send: 0,
            },
          },
        }
      );
    }
    if (token) {
      fs.writeFileSync(
        path.join(__dirname, "../../", "files/key/token.txt"),
        ""
      );
    }
    return successResponse(res, 200, "Reset success");
  } catch (e) {
    console.log(e);
    errorResponse(res, 500, "Reset error.");
  }
};
