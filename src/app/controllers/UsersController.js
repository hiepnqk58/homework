const config = require("./../../configs/app");
const userModel = require("./../models/User");
const {
  successResponse,
  errorResponse,
} = require("./../../helper/responseJson");
const bcrypt = require("bcryptjs/dist/bcrypt");

module.exports.getAllPaginate = async (req, res) => {
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let totalCount = req.query.requireTotalCount
    ? (await userModel.find({})).length
    : 0;
  let user = await userModel
    .find({})
    .sort({ created_at: -1 })
    .skip(index)
    .limit(limit)
    .lean();
  return successResponse(res, { user, totalCount }, 200, "Success");
};

/**
 * Lấy danh sách tất cả người dùng
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getAll = async (req, res) => {
  let users = await userModel.find({});
  return successResponse(res, users, 200, "Success");
};

/**
 * Xem thông tin chi tiết một người dùng.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getDetail = async (req, res) => {
  let userID = req.query.id;
  if (userID) {
    let data = await userModel.findById(userID);
    return successResponse(res, data, 200, "Success");
  }
  return errorResponse(res, 409, "UserID not found.");
};

/**
 * Thêm mới người dùng.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.add = async (req, res) => {
  try {
    // let conditionRole = JSON.parse(req.body.conditions_role);
    //let condition = JSON.parse(req.body.condition);
    let newUser = {
      ...req.body,
      password_hash: await bcrypt.hash("Abcd@1234", 10),
      // conditions_role: conditionRole,
      //conditions: condition,
    };
    const checkUserName = await userModel.checkExistingField(
      "username",
      req.body.username
    );
    if (checkUserName) {
      return errorResponse(res, 409, "User already exist");
    }
    let user = await userModel.create(newUser);
    return successResponse(res, user, 200, "User add Success");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "User add error");
  }
};

/**
 * Cập nhật thông tin người dùng.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.edit = async (req, res) => {
  let userID = req.body.id;
  try {
    let user = await userModel.findById(userID).lean();
    // let conditionRole = JSON.parse(req.body.conditions_role);
    if (user) {
      let editUser = {
        username: req.body.username,
        full_name: req.body.full_name,
        role: req.body.role,
        //conditions: req.body.condition,
        // conditions_role: conditionRole,
      };
      // const checkUserName = await userModel.checkExistingField(
      //   "username",
      //   req.body.username
      // );
      let checkUserName = await userModel.findOne({
        username: username,
        _id: { $ne: new mongoose.mongo.ObjectId(userID) },
      });
      if (checkUserName) {
        return errorResponse(res, 409, "User already exist");
      }
      const userUpdate = await userModel.findOneAndUpdate(
        { _id: userID },
        editUser,
        { new: true }
      );
      return successResponse(res, userUpdate, 200, "User edit success");
    }
    return errorResponse(res, 404, "User not found.");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "User edit error.");
  }
};

/**
 * Xoá người dùng
 * @param {*} req
 * @param {*} res
 * @returns
 */

module.exports.delete = async (req, res) => {
  try {
    let id = req.body.id;
    let user = await userModel.findById(id);
    if (user) {
      await userModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true, upsert: true }
      );
      return successResponse(res, "", 200, "User delete success");
    }
    return errorResponse(res, 404, "User not found.");
  } catch (error) {
    return errorResponse(res, 500, "User delete error");
  }
};

module.exports.search = async (req, res) => {
  try {
    let queryValueSearch = [];
    let limit = req.query.take || 12;
    let index = req.query.skip || 0;
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;
    let filter = req.query.filter;
    let conditions = [
      { created_at: { $lte: new Date(endDate) } },
      { created_at: { $gte: new Date(startDate) } },
    ];
    if (filter) {
      queryValueSearch = [
        {
          name: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
      ];
    }
    conditions =
      queryValueSearch.length > 0
        ? {
            $and: [
              {
                $or: queryValueSearch,
              },
              {
                $and: conditions,
              },
            ],
          }
        : {
            $and: [
              {
                $and: conditions,
              },
            ],
          };
    let totalCount = req.query.requireTotalCount
      ? await userModel.find(conditions).count()
      : 0;

    let data = await userModel
      .find(conditions)
      .sort({ created_at: -1 })
      .skip(index)
      .limit(limit)
      .lean();
    return successResponse(res, { user: data, totalCount }, 200, "Success");
  } catch (error) {
    return errorResponse(res, 500, "User search error");
  }
};
