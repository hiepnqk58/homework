const express = require("express");
const router = express.Router();
const dashBoardController = require("../../controllers/DashboardController");
const { authenticate } = require("../../../middlewares/auth.middleware");
const {
  roleSuperAdmin,
  roleAdmin,
  roleUser,
} = require("../../../middlewares/role.middleware");

router.get("/totalCard", dashBoardController.total);

module.exports = router;
