"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

const countConnect = () => {
  const numberConnect = mongoose.connections.length;
  console.log(`Number of connections::${numberConnect}`);
};

const checkOverLoad = () => {
  setInterval(() => {
    const numberConnect = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCores * 5;
    console.log(`Active connections:: ${numberConnect}`);
    console.log(`Memory usage:: ${memoryUsage / 1024 / 2024}`);
    if (numberConnect > maxConnections) {
      console.log("Connection overload dêtcted");
    }
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverLoad,
};
