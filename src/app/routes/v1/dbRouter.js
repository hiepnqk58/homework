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
router.post("/detail", [authenticate, roleUser], dbController.getDetail);
router.post("/paginate", [authenticate, roleUser], dbController.getAllPaginate);
router.get("/detail", [authenticate, roleUser], dbController.getDetail);
router.post("/delete", [authenticate, roleSuperAdmin], dbController.delete);
router.post("/insert", dbController.insert);
router.get("/search", [authenticate, roleUser], dbController.search);
router.post("/audit-db", dbController.auditDB);
router.get("/getByDate", dbController.getByDate);
module.exports = router;
