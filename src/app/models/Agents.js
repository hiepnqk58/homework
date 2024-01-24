const { bool } = require("joi");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON, paginate } = require("./plugins");
const moment = require("moment");
var agentsSchema = new Schema(
  {
    local_ip: { type: String },
    public_ip: { type: String },
    mac: { type: String }, // full mac
    computer_name: { type: String }, // md5(mac+serial_number)
    serial_number: { type: String },
    os: { type: String },
    manufacturer: { type: String },
    model: { type: String },
    boot_time: { type: String },
    local_time: { type: String },
    agent_version: { type: String },
    agent_user: { type: String },
    last_seen: { type: String },
    is_deleted: { type: Boolean, default: false },
  },
  {
    minimize: false,
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

agentsSchema.pre(["find", "findOne"], function (next) {
  // Add soft delete condition to the query
  this.where({
    $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
  });
  next();
});

agentsSchema.post(["find", "findOne", "findOneAndUpdate"], function (res) {
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

agentsSchema.plugin(toJSON);
agentsSchema.plugin(paginate);

agentsSchema.statics.checkExistingField = async (field, value) => {
  const checkField = await agentsModel.findOne({ [`${field}`]: value });

  return checkField;
};

agentsSchema.pre("save", function (next) {
  this.is_deleted = false;
  next();
});

agentsSchema.pre(
  ["findOneAndUpdate", "updateOne", "findByIdAndUpdate"],
  async function (next) {
    const data = this.getUpdate();
    if (data.hasOwnProperty("is_deleted") && data.is_deleted) {
      data.is_deleted = true;
    } else {
      data.is_deleted = false;
    }

    next();
  }
);

agentsSchema.post("remove", function (result) {
  // Code to be executed after delete
  console.log("Document deleted: ", result);
});

var agentsModel = mongoose.model("agents", agentsSchema, "agents");
module.exports = agentsModel;
