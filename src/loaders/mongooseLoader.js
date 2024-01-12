const mongoose = require("mongoose");

const env = require("../configs/env");
const Logger = require("../libs/logger");

const log = new Logger(__filename);
const config = require("../configs/app");
const userModel = require("../app/models/User");
const settingModel = require("../app/models/Setting");

module.exports = async () => {
  try {
    // await mongoose.connect(env.database.connection, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,

    // });
    // log.info("Successfully for MongoDB connected!!");
    mongoose.set("strictQuery", false);
    await mongoose
      .connect(env.database.connection, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        log.info("Successfully for MongoDB connected!!");
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
      })
      .catch((error) => {
        console.log("MongoDB connection error:", error);
      });
  } catch (err) {
    log.error(`Failed to connect to MongoDB - ${err.message}`);
    throw new Error(`Failed to connect to MongoDB`);
  }
};
