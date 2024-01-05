const { checkTypeOf } = require("../helper/common");

const successResponse = async (res, data, code, message) => {
  let type = checkTypeOf(data);
  switch (type) {
    case "Array":
      return res.status(200).json({
        code: code || 200,
        message: message || "success",
        count: data.length,
        data: data || [],
      });
    case "":
      return res.status(200).json({
        code: code || 200,
        message: message || "success",
      });
    case "Object":
      return res.status(200).json({
        code: code || 200,
        message: message || "success",
        data: data,
      });
    default:
      return res.status(200).json({
        code: code || 200,
        message: message || "success",
        data: data,
      });
  }
};

const errorResponse = async (res, code, message) => {
  return res.status(200).json({
    code: code || 400,
    message: message || "error",
  });
};

module.exports = { successResponse, errorResponse };
