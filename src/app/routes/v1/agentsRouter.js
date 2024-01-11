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
  "/all-paginate",
  [authenticate, roleUser],
  agentsController.getAllPaginate
);
router.get("/detail", [authenticate, roleUser], agentsController.getDetail);
router.post("/insert", [authenticate, roleUser], agentsController.insert);
router.post("/edit", [authenticate, roleUser], agentsController.edit);
router.post("/delete", [authenticate, roleSuperAdmin], agentsController.delete);
router.get("/search", [authenticate, roleUser], agentsController.search);
module.exports = router;
