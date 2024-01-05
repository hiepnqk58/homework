const express = require("express");
const router = express.Router();
const passport = require("passport");
const settingsController = require("../../controllers/SettingsController");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { unitValidation } = require("../../validations");
const validate = require("../../../middlewares/validate.middleware");
var multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");

router.post("/reset",[authenticate, roleSuperAdmin], settingsController.resetSoftware);
router.get("/detail", [authenticate, roleAdmin], settingsController.getDetail);
router.post("/add", [authenticate, roleAdmin], settingsController.add);
router.post("/edit", [authenticate, roleAdmin], settingsController.edit);

module.exports = router;
