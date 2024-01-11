const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/UsersController");
const { apiLimiter } = require("../../../middlewares/rateLimit.middleware");
const { roleSuperAdmin } = require("../../../middlewares/role.middleware");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { userValidation } = require("../../validations");
const validate = require("../../../middlewares/validate.middleware");

router.get(
  "/all",
  [authenticate, apiLimiter, roleSuperAdmin],
  usersController.getAll
);
router.get(
  "/detail",
  [authenticate, apiLimiter, roleSuperAdmin],
  usersController.getDetail
);
router.post(
  "/add",
  [
    authenticate,
    apiLimiter,
    roleSuperAdmin,
    validate(userValidation.addSchema),
  ],
  usersController.add
);
router.post(
  "/edit",
  [
    authenticate,
    apiLimiter,
    roleSuperAdmin,
    validate(userValidation.editSchema),
  ],
  usersController.edit
);
router.post(
  "/delete",
  [
    authenticate,
    apiLimiter,
    roleSuperAdmin,
    validate(userValidation.deleteSchema),
  ],
  usersController.delete
);

module.exports = router;
