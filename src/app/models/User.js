var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const { bool, boolean } = require("joi");
const moment = require("moment");
var Schema = mongoose.Schema;

var usersSchema = new Schema(
  {
    display_name: { type: String },
    username: { type: String },
    password_hash: { type: String },
    condition: { type: Object },    
    role: { type: String },
    is_deleted: { type: Boolean, default: false },
    deleted_by: { type: String },
  },
  {
    minimize: false,
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
      deletedAt: "deleted_at",
    },
  }
);

usersSchema.pre(["find", "findOne"], function (next) {
  // Add soft delete condition to the query
  this.where({
    $or: [{ is_deleted: { $exists: false } }, { is_deleted: false }],
  });
  next();
});

usersSchema.post(["find", "findOne", "findOneAndUpdate"], function (res) {
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

usersSchema.plugin(toJSON);
usersSchema.plugin(paginate);

usersSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password_hash, 10);
  this.password_hash = hash;
  this.is_deleted = false;
  next();
});

usersSchema.pre(
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

usersSchema.statics.checkExistingField = async (field, value) => {
  const checkField = await usersModel.findOne({ [`${field}`]: value });

  return checkField;
};

usersSchema.methods.comparePassword = async function (password) {
  try {
    console.log(password)
    return await bcrypt.compare(password, this.password_hash);
  } catch (error) {
    return false;
  }
};

var usersModel = mongoose.model("users", usersSchema, "users");
module.exports = usersModel;
