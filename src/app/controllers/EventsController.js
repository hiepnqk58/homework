const eventModel = require("../models/Event");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const moment = require("moment");
const common = require("../../helper/common");
const { getUserCurrent } = require("../../helper/authTokenJWT");
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
  let data = await eventModel.find().lean();
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
    conditionFilter = parseCondition(filter);
  }
  conditionFilter = conditionFilter ? conditionFilter : { $and: [{}] };

  let query = [
    {
      $match: { $and: [{ $and: conditions }, { $or: conditionCheck }] },
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        created_at: 0,
        is_deleted: 0,
      },
    },
    {
      $match: conditionFilter,
    },
    { $sort: { updated_at: -1 } },
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
      return successResponse(res, [data], 200, "Success");
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
    let unitCode = req.query.unit_code;
    let filter = req.query.filter;
    let conditions = [{}];
    if (startDate && endDate) {
      conditions = [
        { updated_at: { $lte: new Date(endDate) } },
        { updated_at: { $gte: new Date(startDate) } },
      ];
    }
    if (unitCode !== "all") {
      conditions = [
        ...conditions,
        {
          $or: [
            {
              $and: [
                { ident_info: { $ne: null } },
                { "ident_info.idParent.unit_code": unitCode },
              ],
            },
            { unit_code: unitCode },
          ],
        },
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
          alert_type: {
            $regex: ".*" + filter + ".*",
            $options: "i",
          },
        },
        {
          alert_level_id: {
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
    return successResponse(res, { event: data, totalCount }, 200, "Success");
  } catch (error) {
    return errorResponse(res, 500, "Course search error");
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
      for (let index in arrEvent) {
        const event = arrEvent[index];
        const checkEvent = await eventModel.checkExistingField("name", db.name);

        if (checkEvent) {
          const option = { new: true, upsert: true };
          let query = { mac: event.mac };
          await eventModel.findOneAndUpdate(query, db, option);
          return successResponse(res, "", 200, "Event exists");
        }
        await eventModel.create(event);
        return successResponse(res, "", 200, "Event add Success");
      }
    }
    return errorResponse(res, 500, "Event insert error.");
  } catch (error) {
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
