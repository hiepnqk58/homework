const express = require("express");
const router = express.Router();
const dashBoardController = require("../../controllers/DashboardController");
const { authenticate } = require("../../../middlewares/auth.middleware");
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");

router.post("/statis", [authenticate, roleUser], dashBoardController.tk);
router.post(
  "/statisticalMalware",
  [authenticate, roleUser],
  dashBoardController.thongKeNhiemMaDoc
);
router.post(
  "/statisticalCandC",
  [authenticate, roleUser],
  dashBoardController.thongKeKetNoiCandC
);
router.post(
  "/statisticalViolent",
  [authenticate, roleUser],
  dashBoardController.thongKeViolent
);
module.exports = router;
