const express = require("express");
const router = express.Router();
const agentsController = require("../../controllers/AgentsController");
const { authenticate } = require("../../../middlewares/auth.middleware");
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");
var multer = require("multer");
const upload = multer({ dest: "uploads/" });
const validate = require("../../../middlewares/validate.middleware");

router.get("/all", [authenticate, roleUser], agentsController.getAll);
router.get(
  "/paginate",
  [authenticate, roleUser],
  agentsController.getAllPaginate
);
module.exports = router;
