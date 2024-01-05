var jwt = require("jsonwebtoken");
const { checkToken } = require("./common");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const JWTHelper = (token) => {
  if (token != "null") {
    try {
      return jwt.verify(token, secretKey);
    } catch (err) {
      return null;
    }
  }
  return null;
};

getUserCurrent = async (req, res) => {
  var jwtHeader = req.headers.authorization;
  const token =
    jwtHeader && jwtHeader.split(" ")[1] ? jwtHeader.split(" ")[1] : null;
  if (token == null) return false;
  var decoded = checkToken(token);
  if (decoded == "token is expired") {
    return false;
  }
  return decoded;
};

module.exports = { JWTHelper, getUserCurrent };
