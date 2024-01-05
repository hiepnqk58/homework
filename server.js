require("dotenv").config();
const server = require("./app.js");
const logger = require("morgan");
const { log } = require("mercedlogger");
const { APP_PORT = 3000 } = process.env;

server.listen(APP_PORT, () => {
  log.green("SERVER STATUS", `Listening on port ${APP_PORT}`);
});
