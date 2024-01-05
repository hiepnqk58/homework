const alertModel = require("../models/Alert");
const activeDeviceModel = require("../models/ActiveDevice");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const common = require("../../helper/common");
const settingModel = require("../models/Setting");
const unitModel = require("../models/Unit");
const { getUserCurrent } = require("../../helper/authTokenJWT");
let conditionCheck = [
  { is_deleted: { $exists: false } },
  { is_deleted: false },
];

function parseCondition (filter)  {
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
    current_filter[filter[0]] = {$regex: new RegExp(filter[2], "i")};
    return current_filter;
  }
   if (filter[1] == "notcontains") {
    let current_filter = {};
    current_filter[filter[0]] = {$not: { $regex: new RegExp(filter[2], "i") }};
    return current_filter;
  }
   if (filter[1] == "startswith") {
    let current_filter = {};
    current_filter[filter[0]] = { $regex: new RegExp(`^${filter[2]}`, "i")};
    return current_filter;
  }
   if (filter[1] == "endswith") {
    let current_filter = {};
    current_filter[filter[0]] = { $regex: new RegExp(`${filter[2]}$`, "i")};
    return current_filter;
  }
    if (filter[1] == "<>") {
    let current_filter = {};
    current_filter[filter[0]] = { $ne: filter[2]};
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

//Chi tiet thiet bi vi pham quy dinh
module.exports.detailViolent = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let unitCodeSetting = setting.unit_code;
  let unit = await unitModel.findOne({ unit_code: unitCodeSetting });
  let unitFullName = unit ? unit.full_name : "";
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let unitCode = req.query.unit_code;
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
  if (unitCode !== "all") {
    conditions = [
      ...conditions,
      { "idParent.unit_code": unitCode },
    ];
  }
  if (filter) {
    filter = JSON.parse(filter);
    conditionFilter = parseCondition(filter);   
  }
  conditionFilter = conditionFilter ? conditionFilter : { $and: [{}] };

  let query = [
    {
      $match: {$and:[{$and: conditions},{ $or: conditionCheck },{
        $or: [
          { alert_type: {$regex:"Internet.*",$options:"$i"} },
          {
            $and: [
              { alert_type: {$regex:"USB.*",$options:"$i"} },
              { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
            ],
          },
        ],
      }
]  },
    },    
    {
      $match : 
        conditionsUser   
    },
    {
      $addFields: {
        manager_name: {
          $cond: {
            if: { $ne: ["$ident_info", null] },
            then: "$ident_info.manager_name",
            else: "Chưa định danh",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        created_at: 0,
        updated_at: 0,
        auto_increment:0,
        idParent:0,
        ident_info:0,
        is_deleted: 0,
        time_send:0
      },
    },
    {
      $match: conditionFilter,
    },
    { $sort: { time_receive: -1 } },
    { $limit: parseInt(limit) + parseInt(index) },
    { $skip: parseInt(index) },
  ];
  const [alert, totalCountResult] = await Promise.all([
    await alertModel.aggregate(query),
      req.query.requireTotalCount
        ? alertModel.aggregate([
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
  return successResponse(res, { totalCount, alert }, 200, "Success");
};

//Chi tiet thiet bi ket noi C&C
module.exports.detailCandC = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let unitCodeSetting = setting.unit_code;
  let unit = await unitModel.findOne({ unit_code: unitCodeSetting });
  let unitFullName = unit ? unit.full_name : "";
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let unitCode = req.query.unit_code;
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
  if (unitCode !== "all") {
    conditions = [
      ...conditions,
      { "idParent.unit_code": unitCode },
    ];
  }
  if (filter) {
    filter = JSON.parse(filter);
    conditionFilter = parseCondition(filter);   
  }
  conditionFilter = conditionFilter ? conditionFilter : { $and: [{}] };

  let query = [
    {
      $match: {$and:[{$and: conditions},{ $or: conditionCheck },{
        $or: [{ alert_type: {$regex:"Black_domain.*",$options:"$i"} }, { alert_type: {$regex:"Black_ip.*",$options:"$i"} },],
      },
]  },
    },   
    {
      $match : 
        conditionsUser   
    },
    {
      $addFields: {
        manager_name: {
          $cond: {
            if: { $ne: ["$ident_info", null] },
            then: "$ident_info.manager_name",
            else: "Chưa định danh",
          },
        },
      },
    },
    
    {
      $project: {
        _id: 0,
        __v: 0,
        created_at: 0,
        updated_at: 0,
        auto_increment:0,
        idParent:0,
        ident_info:0,
        is_deleted: 0,
        time_send:0
      },
    },
    {
      $match: conditionFilter,
    },
    { $sort: { time_receive: -1 } },
    { $limit: parseInt(limit) + parseInt(index) },
    { $skip: parseInt(index) },
  ];
  const [alert, totalCountResult] = await Promise.all([
    await alertModel.aggregate(query),
      req.query.requireTotalCount
        ? alertModel.aggregate([
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
  return successResponse(res, { totalCount, alert }, 200, "Success");
};

//Chi tiet canh bao ma doc
module.exports.detailMalware = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let unitCodeSetting = setting.unit_code;
  let unit = await unitModel.findOne({ unit_code: unitCodeSetting });
  let unitFullName = unit ? unit.full_name : "";
  let limit = req.query.take || 12;
  let index = req.query.skip || 0;
  let unitCode = req.query.unit_code;
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
  if (unitCode !== "all") {
    conditions = [
      ...conditions,
      { "idParent.unit_code": unitCode },
    ];
  }
  if (filter) {
    filter = JSON.parse(filter);
    conditionFilter = parseCondition(filter);  
  }
  conditionFilter = conditionFilter ? conditionFilter : { $and: [{}] };

  let query = [
    {
      $match: {$and:[{$and: conditions},{ $or: conditionCheck },{ alert_type: {$regex:"Malware.*",$options:"$i"} },
      { $or: [{ alert_level_id: "3" }, { alert_level_id: "2" }]}
]  },
    },   
    {
      $match : 
        conditionsUser   
    },
    {
      $addFields: {
        manager_name: {
          $cond: {
            if: { $ne: ["$ident_info", null] },
            then: "$ident_info.manager_name",
            else: "Chưa định danh",
          },
        },
      },
    },   
    {
      $project: {
        _id: 0,
        __v: 0,
        created_at: 0,
        updated_at: 0,
        auto_increment:0,
        idParent:0,
        ident_info:0,
        is_deleted: 0,
        time_send:0
      },
    },
    {
      $match: conditionFilter,
    },
    { $sort: { time_receive: -1 } },
    { $limit: parseInt(limit) + parseInt(index) },
    { $skip: parseInt(index) },
  ];
  const [alert, totalCountResult] = await Promise.all([
    await alertModel.aggregate(query),
      req.query.requireTotalCount
        ? alertModel.aggregate([
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
  return successResponse(res, { totalCount, alert }, 200, "Success");
};

