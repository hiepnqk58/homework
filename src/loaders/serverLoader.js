require("dotenv").config();
const server = require("./app.js");
const logger = require("morgan");
const { log } = require("mercedlogger");
const { PORT = 3000 } = process.env;

server.listen(PORT, () => {
  log.green("SERVER STATUS", `Listening on port ${PORT}`);
});
