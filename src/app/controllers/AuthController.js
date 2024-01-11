const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../configs/app");
const mongoose = require("mongoose");
const userModel = require("../models/User");
const secretKey = process.env.SECRET;
// const { client } = require("../../helper/connectRedis");
const { successResponse, errorResponse } = require("../../helper/responseJson");

/**
 * Đăng ký tài khoản.
 * @param {*} req
 * @param {*} res
 * @returns
 */ module.exports.register = async (req, res) => {
  var newUser = {
    username: req.body.username,
    password_hash: req.body.password,
    role: config.role.superAdmin,
    condition: {},
  };
  const checkUserName = await userModel.checkExistingField(
    "username",
    req.body.username
  );

  if (checkUserName) {
    return errorResponse(res, 409, "User already exist");
  }

  try {
    let user = await userModel.create(newUser);
    return successResponse(res, user, 200, "Register success");
  } catch (error) {
    return errorResponse(res, 500, "Register false");
  }
};

/**
 * Đăng nhập hệ thống.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.login = async (req, res) => {
  let user = await userModel.findOne({ username: req.body.username });
  let isValidPassword = user
    ? await user.comparePassword(req.body.password)
    : false;
  console.log(req.body.password);
  try {
    if (user && isValidPassword) {
      const { _id, username, role, condition } = user;
      var token = jwt.sign({ _id, username, role, condition }, config.secret, {
        expiresIn: config.expiresIn,
      });

      // await client.set(_id.toString(), token, "EX", 60 * 60);
      data = {
        id: user._id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
        token: token,
        condition,
      };
      return successResponse(res, data, 200, "Success");
    }
  } catch (err) {
    return errorResponse(res, 401, "Token is fail");
  }

  return errorResponse(res, 401, "Authentication failed. User not found.");
};

/**
 * Xem thông tin người dùng.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getInformation = async (req, res) => {
  let userID = req.body.user_id;
  if (userID) {
    let data = await userModel.findById(userID);
    return successResponse(res, data, 200, "Success");
  }
  return errorResponse(res, 409, "UserID not found.");
};

/**
 * Thay đổi mật khẩu.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.changePassword = async (req, res) => {
  let id = req.body.user_id;
  let jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  if (id) {
    let user = await userModel.findById(id);
    let isValidPassword = user
      ? await user.comparePassword(req.body.old_password)
      : false;
    if (!isValidPassword) {
      return errorResponse(res, 201, "Old password not match!");
    }
    try {
      let newActions = {
        password: await bcrypt.hash(req.body.new_password, 10),
      };
      let data = await userModel.findByIdAndUpdate(id, newActions, {
        new: true,
      });

      // await client.del(user._id.toString());
      return successResponse(res, data, 200, "Change password success");
    } catch (error) {
      return errorResponse(res, 201, "Change password error");
    }
  }
  return errorResponse(res, 201, "User not found!");
};

/**
 * Cập nhật thông tin người dùng.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.changeInformation = async (req, res) => {
  let id = req.body.user_id;
  let userData = { ...req.body };
  let existsUser = await userModel.findOne({
    username: { $regex: `^${userData.username}$`, $options: "i" },
    _id: { $eq: new mongoose.mongo.ObjectId(id) },
  });
  if (existsUser) {
    userData = { ...userData, password_hash: existsUser.password };
    let data = await userModel.findByIdAndUpdate(id, userData, { new: true });
    return successResponse(res, data, 200, "Change information success!");
  } else {
    return errorResponse(res, 404, "User not found!");
  }
};

/**
 * Đăng xuất hệ thống.
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.logout = async (req, res) => {
  let userId = req.body.user_id;
  let user = await userModel.findById(userId);
  try {
    if (user) {
      // await client.del(user._id.toString());
      return successResponse(res, "", 200, "Logout success");
    }
  } catch (err) {
    return errorResponse(res, 401, err);
  }

  return errorResponse(res, 401, "Authentication failed. User not found.");
};

module.exports.checkToken = async (req, res) => {
  let token = req.body.token;
  if (token) {
    try {
      let data = jwt.verify(token, secretKey);
      return res.status(200).send({
        result: true,
        data: data,
      });
    } catch (err) {
      var decoded = jwt.decode(token);
      if (decoded && Date.now() >= decoded.exp * 1000) {
        return res.status(401).send({
          result: false,
          message: "token is expired",
        });
      }
      return res.status(401).send({
        result: false,
        message: "token error verify",
      });
    }
  }
  return res.status(401).send({
    result: false,
    message: "token is required",
  });
};
