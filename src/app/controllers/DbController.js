const dbModel = require("./../models/Db");
const { successResponse, errorResponse } = require("../../helper/responseJson");

module.exports.getAll = async (req, res) => {
  let data = await dbModel.find().lean();
  return successResponse(res, data, 200, "Get all data db success");
};

module.exports.getByDate = async (req, res) => {
  let startDate = req.query.start_date;
  let db = await dbModel
    .find({ updated_at: { $gte: new Date(startDate) } })
    .lean();
  return successResponse(res, db, 200, "Get data by date success");
};

module.exports.getByRangerDate = async (req, res) => {
  let startDate = req.query.start_date;
  let endDate = req.query.end_date;
  let condition = [{}];
  if (startDate && endDate) {
    condition = [
      { updated_at: { $lte: new Date(endDate) } },
      { updated_at: { $gte: new Date(startDate) } },
    ];
  }
  let data = await dbModel.find({ $and: condition }).lean();
  return successResponse(res, data, 200, "Get data db success");
};

module.exports.getAllPaginate = async (req, res) => {
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let startDate = req.query.start_date;
  let endDate = req.query.end_date;
  let condition = [{}];
  if (startDate && endDate) {
    condition = [
      { updated_at: { $lte: new Date(endDate) } },
      { updated_at: { $gte: new Date(startDate) } },
    ];
  }
  let totalCount = req.query.requireTotalCount
    ? (await dbModel.find({ $and: condition })).length
    : 0;
  let db = await dbModel
    .find({ $and: condition })
    .sort({ created_at: -1 })
    .skip(index)
    .limit(limit)
    .lean();
  return successResponse(
    res,
    { db, totalCount },
    200,
    "Get data paginate db success"
  );
};

module.exports.getDetail = async (req, res) => {
  try {
    let id = req.query.id;
    if (id) {
      let data = await dbModel.findById(id);
      return successResponse(res, data, 200, "Get detail success");
    }
    return errorResponse(res, 404, "Db not found.");
  } catch (error) {
    return errorResponse(res, 500, "Db get detail error");
  }
};

module.exports.auditDB = async (req, res) => {
  try {
    let arrDB = req.body;
    if (Array.isArray(arrDB) && arrDB.length > 0) {
      for (let index in arrDB) {
        const c2Server = arrDB[index];
        let checkDB = await dbModel.find({
          name: c2Server.name,
          status: 1,
        });
        if (checkDB.length > 0) {
          return successResponse(res, checkDB, 200, "DB already exists");
        }
        return successResponse(res, "", 200, "DB not exists");
      }
    }
    return errorResponse(res, 500, "DB audit error.");
  } catch (error) {
    return errorResponse(res, 500, "DB audit error.");
  }
};

module.exports.insert = async (req, res) => {
  try {
    let arrDb = req.body;
    if (Array.isArray(arrDb) && arrDb.length > 0) {
      for (let index in arrDb) {
        const db = arrDb[index];
        const checkDb = await dbModel.checkExistingField("name", db.name);

        if (checkDb) {
          const option = { new: true, upsert: true };
          let query = { name: db.name };
          await dbModel.findOneAndUpdate(query, db, option);
          return successResponse(res, "", 200, "DB exists");
        }
        await dbModel.create(db);
        return successResponse(res, "", 200, "DB add Success");
      }
    }
    return errorResponse(res, 500, "DB insert error.");
  } catch (error) {
    return errorResponse(res, 500, "DB insert error.");
  }
};

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
          name: {
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
      ? await dbModel.find(conditions).count()
      : 0;

    let data = await dbModel
      .find(conditions)
      .sort({ created_at: -1 })
      .skip(index)
      .limit(limit)
      .lean();
    return successResponse(res, { data, totalCount }, 200, "Success");
  } catch (error) {
    return errorResponse(res, 500, "Db search error");
  }
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
    await dbModel.aggregate(query),
    req.query.requireTotalCount
      ? dbModel.aggregate([
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

module.exports.add = async (req, res) => {
  try {
    let db = { ...req.body };
    let dbExists = await dbModel.checkExistingField("name", db.name);
    if (dbExists) {
      return successResponse(res, "", 200, "Db exists");
    }
    let dbNew = await dbModel.create([db]);
    return successResponse(res, dbNew, 200, "Db add Success");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "Db add error");
  }
};

module.exports.edit = async (req, res) => {
  try {
    let db = req.body;
    let dbExists = await dbModel.checkExistingField("name", db.name);
    const option = { new: true, upsert: true };
    const query = { name: db.name };
    const update = { ...db };
    if (dbExists) {
      let dbSave = await dbModel.findOneAndUpdate(query, update, option);
      return successResponse(res, dbSave, 200, "Db edit success");
    }
    return successResponse(res, {}, 200, "Db not found");
  } catch (error) {
    console.log(error);
    return errorResponse(res, 500, "Db edit error.");
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
    let db = await dbModel.findById(id);
    if (db) {
      await dbModel.findByIdAndUpdate(
        id,
        { is_deleted: true },
        { new: true, upsert: true }
      );
      return successResponse(res, "", 200, "Db delete success");
    }
    return errorResponse(res, 404, "Db not found.");
  } catch (error) {
    return errorResponse(res, 500, "Db delete error");
  }
};

module.exports.import = async (req, res) => {
  try {
    let filePath = req.file.path;
    readXlsxFile(filePath).then(async (rows, errors) => {
      rows.shift();
      let length = rows.length;
      for (let i = 0; i < length; i++) {
        newDb = {
          name: rows[i][1],
          type: rows[i][2],
          description: rows[i][3],
          condition: rows[i][4],
          is_deleted: false,
        };
        if (newDb.name) {
          const query = { name: newDb.name };
          const update = { ...newDb };
          const option = { new: true, upsert: true };
          await dbModel.findOneAndUpdate(query, update, option);
        }
      }
      return successResponse(res, "", 200, "Db insert success");
    });
  } catch (error) {
    const result = {
      newToken: req.newToken,
      status: "fail",
      filename: req.file.originalname,
      message: "Upload Error! message = " + error.message,
    };
    return res.json(result);
  }
};
