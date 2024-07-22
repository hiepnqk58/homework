var mongoose = require("mongoose");
const moment = require("moment");
const { boolean } = require("joi");
const { Integer } = require("read-excel-file");
var Schema = mongoose.Schema;
var settingsSchema = new Schema(
  {
    id: { type: String, default: 1 },
    is_deleted: { type: Boolean, default: false },
    is_send: { type: Boolean, default: true },
    name_software: { type: String },
    unit_code: { type: String },
    unit_name: { type: String },
    id_software: { type: String },
    type_software: { type: String },
    serial_software: { type: String },
    check_day_online: { type: String, default: 5 },
    check_miav_connect: { type: String, default: 7 },
    time_send_schedule: { type: String },
    time_receive_schedule: { type: String },
    number_service: {
      type: Object,
      default: {
        active_device_send: 2000,
        ident_device_send: 2000,
        alerts_send: 2000,
        events_send: 2000,
        software_manager_send: 1000,
      },
    },
    region1: {
      type: Object,
      default: {
        active: { type: Boolean, default: 0 },
        time_ident_device: new Date("2023-01-01 00:00:00"),
        time_active_device: new Date("2023-01-01 00:00:00"),
        index_event: 0,
        index_alert: 0,
      },
    },
    region2: {
      type: Object,
      default: {
        active: { type: Boolean, default: 0 },
        time_ident_device: new Date("2023-01-01 00:00:00"),
        time_active_device: new Date("2023-01-01 00:00:00"),
        index_event: 0,
        index_alert: 0,
      },
    },
    region3: {
      type: Object,
      default: {
        active: { type: Boolean, default: 0 },
        time_ident_device: new Date("2023-01-01 00:00:00"),
        time_active_device: new Date("2023-01-01 00:00:00"),
        index_event: 0,
        index_alert: 0,
      },
    },
    config: {
      type: Object,
      default: {
        time_ident_device: new Date("2023-01-01 00:00:00"),
        time_active_device: new Date("2023-01-01 00:00:00"),
        time_unit: new Date("2023-01-01 00:00:00"),
        time_fms: new Date("2023-01-01 00:00:00"),
        time_c2server: new Date("2023-01-01 00:00:00"),
        time_hash: new Date("2023-01-01 00:00:00"),
        index_event: 0,
        index_alert: 0,
      },
    },
    url_send: { type: String },
    url_v1: { type: String },
    url_v2: { type: String },
    url_v3: { type: String },
    url_share_service: { type: String },
    is_deleted: { type: Boolean },
    deleted_by: { type: String },
  },
  {
    minimize: false,
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

settingsSchema.statics.checkExistingField = async (field, value) => {
  const checkField = await settingsModel.findOne({ [`${field}`]: value });

  return checkField;
};

settingsSchema.pre(["find", "findOne"], function (next) {
  // Add soft delete condition to the query
  this.where({
    $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
  });
  next();
});

settingsSchema.post(["find", "findOne", "findOneAndUpdate"], function (res) {
  if (!res || !this.mongooseOptions().lean) {
    return;
  }
  if (Array.isArray(res)) {
    res.forEach(transformDoc);
    return;
  }
  transformDoc(res);
});

function transformDoc(doc) {
  doc.created_at = moment(doc.created_at).format("YYYY-MM-DD HH:mm:ss");
  doc.updated_at = moment(doc.updated_at).format("YYYY-MM-DD HH:mm:ss");
  delete doc._id;
  delete doc.__v;
}

var settingsModel = mongoose.model("settings", settingsSchema, "settings");
module.exports = settingsModel;
