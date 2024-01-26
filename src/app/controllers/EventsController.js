const eventModel = require("../models/Event");
const dbModel = require("../models/Db");
const {
  successResponse,
  errorResponse,
} = require("./../../helper/responseJson");
const moment = require("moment");
const common = require("./../../helper/common");
const { getUserCurrent } = require("./../../helper/authTokenJWT");
const agentsModel = require("../models/Agents");
let conditionCheck = [
  { is_deleted: { $exists: false } },
  { is_deleted: false },
];
/**
 * Lấy danh sách toàn bộ các Events
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getAll = async (req, res) => {
  let data = await eventModel.find().sort({ time_receive: -1 }).lean();
  return successResponse(res, data, 200, "Success");
};

function parseCondition(filter) {
  if (filter[0] == "!") {
    let sub_filter = parseCondition(filter[1]);
    return { $nor: [sub_filter] };
  }
  if (filter[1] == "=") {
    let current_filter = {};
    current_filter[filter[0]] = filter[2];
    return current_filter;
  }
  if (filter[1] == "contains") {
    let current_filter = {};
    current_filter[filter[0]] = { $regex: new RegExp(filter[2], "i") };
    return current_filter;
  }
  if (filter[1] == "notcontains") {
    let current_filter = {};
    current_filter[filter[0]] = {
      $not: { $regex: new RegExp(filter[2], "i") },
    };
    return current_filter;
  }
  if (filter[1] == "startswith") {
    let current_filter = {};
    current_filter[filter[0]] = { $regex: new RegExp(`^${filter[2]}`, "i") };
    return current_filter;
  }
  if (filter[1] == "endswith") {
    let current_filter = {};
    current_filter[filter[0]] = { $regex: new RegExp(`${filter[2]}$`, "i") };
    return current_filter;
  }
  if (filter[1] == "<>") {
    let current_filter = {};
    current_filter[filter[0]] = { $ne: filter[2] };
    return current_filter;
  }
  if (filter[1] == "and") {
    let even_item = filter.filter((item, index, arr) => {
      return index % 2 === 0;
    });

    let sub_filter = even_item.map((item) => parseCondition(item));
    return { $and: sub_filter };
  }
  if (filter[1] == "or") {
    let even_item = filter.filter((item, index, arr) => {
      return index % 2 === 0;
    });

    let sub_filter = even_item.map((item) => parseCondition(item));
    return { $or: sub_filter };
  }
  return {};
}

module.exports.getAllPaginate = async (req, res) => {
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let filter = req.query.filter;
  let startDate = req.query.start_date;
  let endDate = req.query.end_date;
  let conditions = [{}];
  let conditionFilter;
  if (startDate && endDate) {
    conditions = [
      { updated_at: { $lte: new Date(endDate) } },
      { updated_at: { $gte: new Date(startDate) } },
    ];
  }
  if (filter) {
    filter = JSON.parse(filter);
  }
  conditionFilter = filter.length > 0 ? { $and: filter } : { $and: [{}] };
  console.log(conditionFilter);
  let query = [
    {
      $match: { $and: [{ $and: conditions }, { $or: conditionCheck }] },
    },
    {
      $match: conditionFilter,
    },
    {
      $addFields: {
        id: "$_id", // Add a new field 'id' with the value of '_id'
        created_at: {
          $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$created_at" },
        },
        updated_at: {
          $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updated_at" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        is_deleted: 0,
      },
    },
    { $sort: { time_receive: -1 } },
    { $limit: parseInt(limit) + parseInt(index) },
    { $skip: parseInt(index) },
  ];
  const [data, totalCountResult] = await Promise.all([
    eventModel.aggregate(query),
    req.query.requireTotalCount
      ? eventModel.aggregate([
          ...query.slice(0, -3), // Loại bỏ $limit và $skip từ truy vấn tính totalCount
          {
            $count: "total",
          },
        ])
      : null,
  ]);

  const totalCount =
    totalCountResult && totalCountResult.length > 0
      ? totalCountResult[0].total
      : 0;

  return successResponse(res, { totalCount, data }, 200, "Success");
};

/**
 * Xem thông tin chi tiết một Events
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.getDetail = async (req, res) => {
  try {
    let id = req.query.id;
    if (id) {
      let data = await eventModel.findById(id);
      return successResponse(res, data, 200, "Success");
    }
    return errorResponse(res, 404, "Event not found.");
  } catch (e) {
    return errorResponse(res, 500, "Get event  error.");
  }
};

/**
 * Tìm kiếm Events
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.search = async (req, res) => {
  try {
    let queryValueSearch = [];
    let limit = req.query.take || 12;
    let index = req.query.skip || 0;
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;
    let filter = req.query.filter;
    let conditions = [{}];
    if (startDate && endDate) {
      conditions = [
        { updated_at: { $lte: new Date(endDate) } },
        { updated_at: { $gte: new Date(startDate) } },
      ];
    }

    if (filter) {
      queryValueSearch = [
        {
          mac: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
        {
          ip: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
        {
          event_type: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
        {
          event_info: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
        {
          time_receive: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
      ];
    }
    conditions =
      queryValueSearch.length > 0
        ? {
            $and: [
              {
                $or: queryValueSearch,
              },
              {
                $and: conditions,
              },
            ],
          }
        : {
            $and: [
              {
                $and: conditions,
              },
            ],
          };
    let totalCount = req.query.requireTotalCount
      ? await eventModel.find(conditions).count()
      : 0;

    let data = await eventModel
      .find(conditions)
      .sort({ created_at: -1 })
      .skip(index)
      .limit(limit)
      .lean();
    return successResponse(
      res,
      { data, totalCount },
      200,
      " Event search Success"
    );
  } catch (error) {
    return errorResponse(res, 500, "Event search error");
  }
};

module.exports.getByMAC = async (req, res) => {
  try {
    let mac = req.query.mac;
    if (mac) {
      let query = [
        {
          $match: { mac: mac },
        },
        { $sort: { time_receive: -1 } },
        { $limit: 1000 },
      ];
      let event = await eventModel.aggregate(query);
      query.splice(query.length - 1);
      query.push({
        $count: "total",
      });
      let totalCount = req.query.requireTotalCount
        ? (await eventModel.aggregate(query)).length > 0
          ? (await eventModel.aggregate(query))[0].total
          : 0
        : 0;
      return successResponse(res, { totalCount, data }, 200, "Success");
    }
  } catch (e) {
    return errorResponse(res, 500, "Get event  error.");
  }
};

/**
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.delete = async (req, res) => {
  try {
    let id = req.body.id;
    let db = await eventModel.findById(id);
    if (db) {
      await eventModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true, upsert: true }
      );
      return successResponse(res, "", 200, "Event delete success");
    }
    return errorResponse(res, 404, "Event not found.");
  } catch (error) {
    return errorResponse(res, 500, "Event delete error");
  }
};

module.exports.insert = async (req, res) => {
  try {
    let arrEvent = req.body;
    if (Array.isArray(arrEvent) && arrEvent.length > 0) {
      let checkAlert = false;
      for (let index in arrEvent) {
        let event = arrEvent[index];
        let timeReceive = moment().format("YYYY-MM-DD HH:mm:ss");
        let checkAgentExists = await agentsModel
          .findOne({ mac: event.mac })
          .lean();
        let agent_id = checkAgentExists?.id || "";
        event = { ...event, receive_time: timeReceive, agent_id };
        let eventType = event.event_type;
        let eventInfo = event.event_info;
        // check event in DB
        if (["web", "mail", "video", "audio", "youtube"].includes(eventType)) {
          let arrDB = await dbModel.find({}).lean();
          for (let i in arrDB) {
            if (eventInfo.indexOf(arrDB[i].name) !== -1) {
              checkAlert = true;
              let alert = {
                ...event,
                event_type: arrDB[i].type,
                level: 3,
                agent_id,
                db_name: arrDB[i].name,
              };
              await eventModel.create(alert);
            }
          }
        }
        let level = checkAlert ? 3 : 1;
        event = { ...event, level };
        await eventModel.create(event);
      }
      return successResponse(res, "", 200, "Event insert Success");
    }
    return errorResponse(res, 500, "Event insert not array.");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "Event insert error.");
  }
};

module.exports.deleteMulti = async (req, res) => {
  try {
    let arrEventId = req.body;
    if (Array.isArray(arrEventId) && arrEventId.length > 0) {
      for (let index in arrEventId) {
        const event = arrEventId[index];
        const checkEvent = await eventModel.checkExistingField("_id", event.id);

        if (checkEvent) {
          const option = { new: true, upsert: true };
          let query = { _id: event.id };
          await eventModel.findOneAndUpdate(
            query,
            { is_deleted: true },
            option
          );
          return successResponse(res, "", 200, "Event exists");
        }
      }
    }
    return errorResponse(res, 500, "Event insert error.");
  } catch (error) {
    return errorResponse(res, 500, "Event insert error.");
  }
};

module.exports.getByType = async (req, res) => {
  try {
    let agentId = req.query.agent_id;
    let type = req.query.type;
    let level = req.query.level;
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;
    let event = await eventModel
      .find({
        agent_id: agentId,
        event_type: type,
        level,
        updated_at: { $lte: new Date(endDate) },
        updated_at: { $gte: new Date(startDate) },
      })
      .sort({ time_receive: -1 })
      .lean();
    return successResponse(res, event, 200, " Event get by success");
  } catch (e) {
    return errorResponse(res, 500, "Event get by type error");
  }
};
