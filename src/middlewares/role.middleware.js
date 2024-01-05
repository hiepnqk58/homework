const usersModel = require("../app/models/User");
const { checkToken } = require("../helper/common");

module.exports.userPermission = async (req, res, next) => {
  let jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  let decoded = checkToken(token);
  if (!decoded) return res.sendStatus(401);
  if (decoded == "token is expired" || !decoded) {
    return res.status(401).send({
      message: "Token is expired",
    });
  }
  let id = decoded._id;
  let existsUser = await usersModel.findById(id);
  if (existsUser && existsUser._id == req.body.user_id) {
    next();
  } else {
    res.send("Invalid user id");
  }
};

module.exports.roleSuperAdmin = async (req, res, next) => {
  var jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  var decoded = checkToken(token);
  if (!decoded) return res.sendStatus(401);
  if (decoded == "token is expired") {
    return res.status(401).send({
      message: "Token is expired",
    });
  }
  const userId = decoded._id;
  const user = await usersModel.findById(userId).lean();
  const role = user ? user.role : "";
  if (role.includes("superAdmin")) {
    next();
  } else {
    res.send("User have not permission");
  }
};

module.exports.roleAdmin = async (req, res, next) => {
  var jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  var decoded = checkToken(token);
  if (!decoded) return res.sendStatus(401);
  if (decoded == "token is expired") {
    return res.status(401).send({
      message: "Token is expired",
    });
  }
  const userId = decoded._id;
  const user = await usersModel.findById(userId).lean();
  const role = user ? user.role : "";
  if (["superAdmin", "admin"].includes(role)) {
    next();
  } else {
    res.send("User have not permission");
  }
};

module.exports.roleUser = async (req, res, next) => {
  var jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  var decoded = checkToken(token);
  if (!decoded) return res.sendStatus(401);
  if (decoded == "token is expired") {
    return res.status(401).send({
      message: "Token is expired",
    });
  }
  const userId = decoded._id;
  const user = await usersModel.findById(userId).lean();
  const role = user ? user.role : "";
  if (["superAdmin", "admin", "user"].includes(role)) {
    next();
  } else {
    res.send("User have not permission");
  }
};
