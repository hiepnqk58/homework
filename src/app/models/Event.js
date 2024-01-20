var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON, paginate } = require("./plugins");
const moment = require("moment");
autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);
var eventsSchema = new Schema(
  {
    agent_id: { type: String },
    computer_name: { type: String },
    db_name: { type: String },
    local_ip: { type: String },
    mac: { type: String },
    event_type: { type: String },
    event_info: { type: String },
    level: { type: String },
    receive_time: { type: Array },
  },
  {
    minimize: false,
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);
eventsSchema.index({ updated_at: 1 });
eventsSchema.index({ "idParent.unit_code": 1 });
eventsSchema.index({ auto_increment: 1 });
eventsSchema.index({ time_receive: 1 });
eventsSchema.pre(["find", "findOne"], function (next) {
  // Add soft delete condition to the query
  this.where({
    $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
  });
  next();
});

eventsSchema.post(["find", "findOne", "findOneAndUpdate"], function (res) {
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
  doc.id = doc._id;
  doc.created_at = moment(doc.created_at).format("YYYY-MM-DD HH:mm:ss");
  doc.updated_at = moment(doc.updated_at).format("YYYY-MM-DD HH:mm:ss");
  delete doc._id;
  delete doc.__v;
}

eventsSchema.plugin(toJSON);
eventsSchema.plugin(paginate);
eventsSchema.plugin(autoIncrement.plugin, {
  model: "events",
  field: "auto_increment",
  startAt: 1,
});

var eventsModel = mongoose.model("events", eventsSchema, "events");
module.exports = eventsModel;
