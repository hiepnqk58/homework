const { configure, format, transports } = require("winston");
const { DailyRotateFile } = require("winston-daily-rotate-file");
const moment = require("moment");
const env = require("../configs/env");

const dailyRotateFileTransport = new transports.DailyRotateFile({
  level: "error",
  filename: "./logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: 1,
  zippedArchive: true,
  format: format.combine(
    format.errors({ stack: true }), // lấy thông tin về lỗi stack trace
    format.metadata(), // cho phép thêm thông tin vào trường metadata
    format.timestamp(), // lấy thời gian log
    format.printf((info) => {
      const { timestamp, level, message, stack } = info;
      const lineNumber = info.metadata["0"]
        ? ` at line ${info.metadata["0"]}`
        : "";
      return `[${moment(timestamp).format("YYYY-MM-DD HH:mm:ss")}] ${level}: ${
        message || "No message"
      } - ${lineNumber}\n`;
    })
  ),
});
module.exports = () => {
  configure({
    transports: [
      dailyRotateFileTransport,
      new transports.Console({
        level: "info",
        silent: env.node !== "development" ? true : false,
        format:
          env.node !== "development"
            ? format.combine(format.json())
            : format.combine(format.colorize(), format.simple()),
      }),
    ],
  });
};
