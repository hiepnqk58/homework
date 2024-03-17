const express = require("express");
const router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "uploads/temp" });
const toolsController = require("../../controllers/ToolsController");

router.post("/upload", [upload.single("file")], toolsController.upFile);
router.get("/download/:date/:macCom/:filename", toolsController.downFile);
router.get("/allFile", toolsController.getFiles);

module.exports = router;
