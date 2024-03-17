const config = require("../../configs/app");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const fs = require("fs");
const moment = require("moment");
const path = require("path");

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

function getDate() {
  let currentDateTime = new Date();
  let formattedDate =
    currentDateTime.getFullYear() +
    "_" +
    appendLeadingZeroes(currentDateTime.getMonth() + 1) +
    "_" +
    appendLeadingZeroes(currentDateTime.getDate());
  return formattedDate;
}

module.exports.upFile = async (req, res) => {
  let today = getDate();
  let comInfo = JSON.parse(req.body.comInfo);
  let macCom = comInfo.Mac ? comInfo.Mac : Date.now();
  let oldPath = ".\\" + req.file.path;
  let newPath =
    `.\\uploads\\${today}\\${macCom}\\${req.file.originalname}` + ".sc";
  if (!fs.existsSync(`.\\uploads\${today}\\${macCom}`)) {
    fs.mkdirSync(`.\\uploads\\${today}\\${macCom}`, {
      recursive: true,
    });
  }
  await fs.rename(oldPath, newPath, function (err) {
    if (err) return res.end(err);
    return res.end("Upload success");
  });
};

module.exports.downFile = async (req, res) => {
  var date = req.params.date;
  var macCom = req.params.macCom;
  var filename = req.params.filename;
  const dirPath = path.join(__dirname, "../../../uploads/");
  console.log(dirPath);
  var directoryPath = dirPath + `${date}/${macCom}/${filename}`;
  res.download(directoryPath, filename, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports.getFiles = function (req, res) {
  dirPath = "./uploads/";
  const result = getAllFiles(dirPath);
  const data = prePareData(result);

  res.status(200).send({
    data: data, //tree,
    message: "get all file in folder. ",
  });

  // return tree;
};

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (file != "temp") {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
};

const prePareData = function (arr) {
  let dataFiles = [];
  arr.forEach(function (filePath) {
    if (typeof filePath === "string") {
      // let time = new Date(fs.statSync(filePath).mtime).toString();
      let file = {
        key: filePath.replace(/\\/g, "/"),
        modified: fs.statSync(filePath).mtime.getTime(), //time,
        size: fs.statSync(filePath).size,
      };
      dataFiles.push(file);
    }
  });
  return dataFiles;
};
