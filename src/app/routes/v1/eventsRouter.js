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
router.get(
  "/all-paginate",
  [authenticate, roleUser],
  eventsController.getAllPaginate
);
router.get("/detail", [authenticate, roleUser], eventsController.getDetail);
router.post("/insert", [authenticate, roleUser], eventsController.insert);
router.post("/delete", [authenticate, roleSuperAdmin], eventsController.delete);
router.get("/search", [authenticate, roleUser], eventsController.search);

module.exports = router;
