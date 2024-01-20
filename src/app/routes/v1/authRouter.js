const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../../controllers/AuthController");
const { apiLimiter } = require("../../../middlewares/rateLimit.middleware");
const { userPermission } = require("../../../middlewares/role.middleware");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { authValidation } = require("../../validations");
const validate = require("../../../middlewares/validate.middleware");

router.post(
  "/register",
  [apiLimiter, validate(authValidation.registerSchema)],
  authController.register
);
router.post(
  "/login",
  [apiLimiter, validate(authValidation.loginSchema)],
  authController.login
);
router.post(
  "/information",
  [apiLimiter, authenticate, userPermission],
  authController.getInformation
);
router.post(
  "/changePassword",
  [apiLimiter, authenticate, userPermission],
  authController.changePassword
);
router.post(
  "/changeInformation",
  [apiLimiter, authenticate, userPermission],
  authController.changeInformation
);

router.post(
  "/logout",
  [authenticate, apiLimiter, validate(authValidation.logoutSchema)],
  authController.logout
);

router.post("/checkToken", authController.checkTokenResponseMsg);
router.post(
  "/refreshToken",
  [apiLimiter, authenticate, userPermission],
  authController.refreshToken
);

module.exports = router;
