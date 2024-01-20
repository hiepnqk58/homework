const passport = require("passport");
require("../configs/passport")(passport);
// const { client } = require("../helper/connectRedis");
const basicAuth = require("express-basic-auth");

module.exports = {
  initialize: function () {
    return passport.initialize();
  },
  authenticate: function (req, res, next) {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).send({ message: "Token is failed" });
      }
      req.authUser = user;
      next();
    })(req, res, next);
  },
  authenticationMiddleware: function (req, res, next) {
    basicAuth({
      users: { supperAdmin: "Zxcqwe@098" }, // replace with your own username and password
      challenge: true, // show login dialog to clients (optional)
      unauthorizedResponse: "Unauthorized", // response to send if authentication fails (optional)
    })(req, res, next);
  },
};
