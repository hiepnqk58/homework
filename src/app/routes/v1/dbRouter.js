const express = require("express");
const router = express.Router();
const dbController = require("../../controllers/DbController");
const { authenticate } = require("../../../middlewares/auth.middleware");
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");

router.get("/all", [authenticate, roleUser], dbController.getAll);
router.get("/detail", [authenticate, roleUser], dbController.getDetail);
router.post("/add", [authenticate, roleUser], dbController.add);
router.post("/edit", [authenticate, roleUser], dbController.edit);
router.post("/delete", [authenticate, roleSuperAdmin], dbController.delete);
router.post("/insert", dbController.insert);
router.get("/search", [authenticate, roleUser], dbController.search);
router.post("/audit-db", dbController.auditDB);
router.get("/getByDate", dbController.getByDate);
module.exports = router;
