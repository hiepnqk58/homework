var express = require("express");
var router = express.Router();

/* GET home page. */
router.use("/v1", require("./v1/apiRouter"));

module.exports = router;
