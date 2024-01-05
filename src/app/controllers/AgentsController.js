const agentsModel = require("../models/Agents");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const md5 = require("md5");
const readXlsxFile = require("read-excel-file/node");
const common = require("../../helper/common");
const { getUserCurrent } = require("../../helper/authTokenJWT");
module.exports.getAll = async (req, res) => {
  let identDevices = await agentsModel.find().lean();
  return successResponse(res, identDevices, 200, "Success");
};
let conditionCheck = [
  { is_deleted: { $exists: false } },
  { is_deleted: false },
];

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
  let conditionFilter;
  if (filter) {
    filter = JSON.parse(filter);
    conditionFilter = parseCondition(filter);
  }
  conditionFilter = conditionFilter ? conditionFilter : { $and: [{}] };

  let query = [
    {
      $match: { $or: conditionCheck },
    },
    {
      $match: conditionFilter,
    },
    //{ $sort: { created_at: -1 } },
    { $limit: parseInt(limit) + parseInt(index) },
    { $skip: parseInt(index) },
  ];

  const [agent, totalCountResult] = await Promise.all([
    await agentsModel.aggregate(query),
    req.query.requireTotalCount
      ? agentsModel.aggregate([
          ...query.slice(0, -2), // Loại bỏ $limit và $skip từ truy vấn tính totalCount
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
  return successResponse(res, { totalCount, agent }, 200, "Success");
};

module.exports.getDetail = async (req, res) => {
  try {
    let id = req.query.id;
    if (id) {
      let data = await agentsModel.findById(id);
      return successResponse(res, data, 200, "Success");
    }
    return errorResponse(res, 200, "Agent not found.");
  } catch (error) {
    return errorResponse(res, 500, "Agent add error");
  }
};

module.exports.add = async (req, res) => {
  try {
    let agent = { ...req.body };
    let agentNew = await agentsModel.create([agent]);
    return successResponse(res, [agentNew], 200, "Agent add Success");
  } catch (error) {
    return errorResponse(res, 500, "Agent add error");
  }
};

module.exports.edit = async (req, res) => {
  try {
    let agent = req.body;
    let agentExists = await agentsModel.checkExistingField("mac", agent.mac);
    const option = { new: true, upsert: true };
    const query = { mac: agent.mac };
    const update = { ...agent };
    if (agentExists) {
      let agentSave = await agentsModel.findOneAndUpdate(query, update, option);
      return successResponse(res, agentSave, 200, "Agent edit success");
    }
    return successResponse(res, {}, 200, "Agent not found");
  } catch (error) {
    return errorResponse(res, 500, "Agent edit error.");
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
    let agent = await agentsModel.findById(id);
    if (agent) {
      await agentsModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true, upsert: true }
      );
      return successResponse(res, "", 200, "Agent delete success");
    }
    return errorResponse(res, 404, "Agent not found.");
  } catch (error) {
    return errorResponse(res, 500, "Agent delete error");
  }
};

module.exports.insert = async (req, res) => {
  try {
    let arrAgent = req.body;
    if (Array.isArray(arrAgent) && arrAgent.length > 0) {
      for (let index in arrAgent) {
        let agent = arrAgent[index];
        let agentExists = await agentsModel.checkExistingField(
          "mac",
          agent.mac
        );
        if (agentExists) {
          await agentsModel.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true, upsert: true }
          );
        }
        await agentsModel.findOneAndUpdate(query, update, option);
      }
    }
    return successResponse(res, "", 200, "Agent insert success");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "Agent insert error");
  }
};
