// require("dotenv").config();
// const server = require("./app.js");
// const logger = require("morgan");
// const { log } = require("mercedlogger");
// const { APP_PORT = 3000 } = process.env;

// server.listen(APP_PORT, () => {
//   log.green("SERVER STATUS", `Listening on port ${APP_PORT}`);
// });

const initApp = require("./src/app");
const Logger = require("./src/libs/logger");
const env = require("./src/configs/env");
const bannerLogger = require("./src/libs/banner");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const sslKey = fs.readFileSync(
  process.cwd() + "/src/certs/ssl-key.pem",
  "utf8"
);
const sslCert = fs.readFileSync(
  process.cwd() + "/src/certs/ssl-cert.pem",
  "utf8"
);

const options = {
  key: sslKey,
  cert: sslCert,
  rejectUnauthorized: true,
  ciphers: "ALL",
  secureProtocol: "TLS_method",
  // requestCert: true,
};
const log = new Logger(__filename);

(async () => {
  try {
    const appLoad = await initApp();
    const port = env.app.port || 5000;
    //var server = https.createServer(options, appLoad);
    var server = http.createServer(appLoad);
    server.listen(port, () => {
      bannerLogger(log);
    });
  } catch (error) {
    log.error("Application is crashed: " + error);
  }
})();
