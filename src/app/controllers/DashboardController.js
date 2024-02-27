// const alertModel = require("./../models/Alert");
// const identDeviceModel = require("./../models/IdentDevice");
// const settingModel = require("./../models/Setting");
// const activeDeviceModel = require("./../models/ActiveDevice");
// const softwareManagerModel = require("./../models/SoftwareManager");
// const unitsModel = require("./../models/Unit");
const agentModel = require("./../models/Agents");
const eventModel = require("./../models/Event");
const dbModel = require("./../models/Db");
const userModel = require("./../models/User");
const {
  successResponse,
  errorResponse,
} = require("./../../helper/responseJson");
const { getUserCurrent } = require("./../../helper/authTokenJWT");
const moment = require("moment");

module.exports.total = async (req, res) => {
  try {
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;
    let tenMinutesAgo = moment().subtract(10, "minutes");
    tenMinutesAgo = tenMinutesAgo.format("YYYY-MM-DD HH:mm:ss");
    const [totalOnline, totalAgent, totalAlert, totalDb, totalUser] =
      await Promise.all([
        agentModel.find({ last_seen: { $gte: tenMinutesAgo } }).count({}),
        agentModel.find({}).count({}),
        eventModel
          .find({
            level: 3,
            created_at: { $lte: new Date(endDate), $gte: new Date(startDate) },
          })
          .count({}),
        dbModel.find({}).count({}),
        userModel.find({}).count({}),
      ]);
    let data = {
      totalOnline,
      totalAgent,
      totalAlert,
      totalDb,
      totalUser,
    };

    return successResponse(res, data, 200, "Success");
  } catch (e) {
    console.log(e);
    return errorResponse(res, 404, "Dashboard  error.");
  }
};
