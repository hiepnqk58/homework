var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const { toJSON, paginate } = require("./plugins");
const moment = require("moment");
var dbSchema = new Schema(
  {
    name: { type: String, unique: true },
    type: { type: String },
    description: { type: String },
    condition: { type: Object }, 
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

dbSchema.pre(["find", "findOne"], function (next) {
  // Add soft delete condition to the query
  this.where({
    $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
  });
  next();
});

dbSchema.post(["find", "findOne", "findOneAndUpdate"], function (res) {
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
dbSchema.plugin(toJSON);
dbSchema.plugin(paginate);

dbSchema.statics.checkExistingField = async (field, value) => {
  const checkField = await c2ServersModel.findOne({ [`${field}`]: value });

  return checkField;
};

var dbModel = mongoose.model("db", dbSchema, "db");
module.exports = dbModel;
