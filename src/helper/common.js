const requestIp = require("request-ip");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const readline = require('readline');
const os = require("os");
const axios = require("axios");
const https = require("https");
const config = require("../configs/app");
const Logger = require("../libs/logger");
const log = new Logger(__filename);
const ping = require("ping");
const stackTrace = require("stack-trace");
const serialNumber = require("serial-number");
const { promisify } = require("util");
const getSerialNumber = promisify(serialNumber);



const common = {
  getSerial: async function () {
    try {
      const value = await getSerialNumber();
      return value;
      // Thực hiện các hoạt động khác với serial number
    } catch (err) {
      return null;
    }
  },
  checkTypeOf: (value) => {
    return Object.prototype.toString.call(value).slice(8, -1);
  },
  checkToken: (token) => {
    if (token) {
      try {
        return jwt.verify(token, config.secret);
      } catch (err) {
        var decoded = jwt.decode(token);
        if (Date.now() >= decoded.exp * 1000) {
          return "token is expired";
        }
        return null;
      }
    }
    return null;
  },
  setEnvValue: (key, value) => {
    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(
      ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
      })
    );

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
  },
  checkUrl: async function (url) {
    try {
      const axiosInstance = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });
      let result = await axiosInstance.head(url, { timeout: 5000 });
      if (result && result.status == "200") {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  },
  send: async function (urlSend, dataSend) {
    try {
      return await axios.post(
        urlSend,
        dataSend,
        {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        },
        {
          headers: {
            accept: "application/json",
          },
        }
      );
    } catch (error) {
      const stack = stackTrace.parse(error);
      const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
      log.error(error, [lineNumber]);
      return false;
    }
  },
  receive: async function (urlReceive, dataSend) {
    try {
      return await axios.get(urlReceive, {
        params: dataSend,
        headers: {
          accept: "application/json",
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });
    } catch (error) {
      const stack = stackTrace.parse(error);
      const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
      log.error(error, [lineNumber]);
      return false;
    }
  },
  getPublicIp: async (req) => {
    let publicIP = requestIp.getClientIp(req);
    return publicIP;
  },
  matchingMacVendor: async (mac, pathfile) => {
    let result = ""
    const data = fs.readFileSync(pathfile, 'UTF-8')
    const lines = data.split(/\r?\n/)
    for (let line of lines) {
      if (line.slice(0, 8) == mac.slice(0, 8)) {
        result = line.slice(9)
        break;
      }
    }
    ;
    return result
  },
  // Format a Date as YYYY-MM-DD hh:mm:ss

  formatDate: async (dateObj) => {
    let year = dateObj.getFullYear();

    let month = dateObj.getMonth();
    month = ("0" + (month + 1)).slice(-2);
    // To make sure the month always has 2-character-format. For example, 1 => 01, 2 => 02

    let date = dateObj.getDate();
    date = ("0" + date).slice(-2);
    // To make sure the date always has 2-character-format

    let hour = dateObj.getHours();
    hour = ("0" + hour).slice(-2);
    // To make sure the hour always has 2-character-format

    let minute = dateObj.getMinutes();
    minute = ("0" + minute).slice(-2);
    // To make sure the minute always has 2-character-format

    let second = dateObj.getSeconds();
    second = ("0" + second).slice(-2);
    // To make sure the second always has 2-character-format
    const time = `${year}-${month}-${date} ${hour}:${minute}:${second}`;
    return time;
  },
  macAddress: (value) => {
    if (!value.match(/^([0-9A-Fa-f]{2}-){5}([0-9A-Fa-f]{2})$/)) {
      return false;
    }
    return true;
  },

  parseCondition: (filter) => {
    if (filter[0] == "!") {
      let sub_filter = common.parseCondition(filter[1]);
      return { $nor: [sub_filter] };
    }
    if (filter[1] == "=") {
      let current_filter = {};
      current_filter[filter[0]] = filter[2];
      return current_filter;
    }
     if (filter[1] == "contains") {
      let current_filter = {};
      current_filter[filter[0]] = {$regex: new RegExp(filter[2], "i")};
      return current_filter;
    }
     if (filter[1] == "notcontains") {
      let current_filter = {};
      current_filter[filter[0]] = {$not: { $regex: new RegExp(filter[2], "i") }};
      return current_filter;
    }
     if (filter[1] == "startswith") {
      let current_filter = {};
      current_filter[filter[0]] = { $regex: new RegExp(`^${filter[2]}`, "i")};
      return current_filter;
    }
     if (filter[1] == "endswith") {
      let current_filter = {};
      current_filter[filter[0]] = { $regex: new RegExp(`${filter[2]}$`, "i")};
      return current_filter;
    }
      if (filter[1] == "<>") {
      let current_filter = {};
      current_filter[filter[0]] = { $ne: filter[2]};
      return current_filter;
    }
    if (filter[1] == "and") {
      let even_item = filter.filter((item, index, arr) => {
        return index % 2 === 0;
      });
  
      let sub_filter = even_item.map((item) => common.parseCondition(item));
      return { $and: sub_filter };
    }
    if (filter[1] == "or") {
      let even_item = filter.filter((item, index, arr) => {
        return index % 2 === 0;
      });
  
      let sub_filter = even_item.map((item) =>  common.parseCondition(item));
      return { $or: sub_filter };
    }
    return {};
  }
};

module.exports = common;
