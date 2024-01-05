require("dotenv").config();
const rateLimit = require("express-rate-limit");

module.exports.apiLimiter = rateLimit({
  windowMs: 300 * 1000, // 5 minutes
  max: 10,
  handler: function (req, res) {
    res.status(429).send({
      status: 500,
      message: "Too many requests!",
    });
  },
  skip: (req, res) => {
    if (req.ip === "::ffff:127.0.0.1") return true;
    return false;
  },
});
