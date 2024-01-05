const express = require("express");
const router = express.Router();
const eventsController = require("../../controllers/EventsController");
const { apiLimiter } = require("../../../middlewares/rateLimit.middleware");
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { eventValidation } = require("../../validations");
const validate = require("../../../middlewares/validate.middleware");

router.get("/all", [authenticate, roleUser], eventsController.getAll);


router.get("/search", [authenticate, roleUser], eventsController.search);

module.exports = router;
