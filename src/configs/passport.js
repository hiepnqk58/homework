var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

// load up the user model
var userModel = require("../app/models/User");
var config = require("./app"); // get db config file

module.exports = function (passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken("Authorization");
  opts.secretOrKey = config.secret;
  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      userModel.findById(jwt_payload._id, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    })
  );
};
