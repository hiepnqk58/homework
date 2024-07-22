const mongoose = require("mongoose");

const env = require("../configs/env");
const Logger = require("../libs/logger");

const log = new Logger(__filename);
const config = require("../configs/app");
const userModel = require("../app/models/User");

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    mongoose.set("strictQuery", false);
    try {
      await mongoose.connect(env.database.connection, {
        maxPoolSize: 50,
      });
      log.info("Successfully connected to MongoDB!");

      // Thêm dữ liệu vào collection user
      let newUser = {
        display_name: "admin",
        username: "admin",
        password_hash: "123456",
        role: config.role.superAdmin,
        conditions: {},
      };
      const checkUserName = await userModel.checkExistingField(
        "username",
        "admin"
      );
      if (!checkUserName) {
        await userModel.create(newUser);
        log.info("Create user success!!");
      }

      this.isConnected = true;
    } catch (err) {
      log.error(`Failed to connect to MongoDB - ${err.message}`);
      throw new Error(`Failed to connect to MongoDB`);
    }
  }

  static async getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.connect();
    }
    return Database.instance;
  }
}

module.exports = Database;
