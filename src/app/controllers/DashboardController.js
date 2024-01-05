const alertModel = require("../models/Alert");
const identDeviceModel = require("../models/IdentDevice");
const settingModel = require("../models/Setting");
const activeDeviceModel = require("../models/ActiveDevice");
const softwareManagerModel = require("../models/SoftwareManager");
const unitsModel = require("../models/Unit");
const { successResponse, errorResponse } = require("../../helper/responseJson");
const { getUserCurrent } = require("../../helper/authTokenJWT");

let conditionCheck = [{ is_deleted: { $exists: false } }, { is_deleted: false }]

let typeSoftware = "";
async function type_Software() {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let type = setting?.type_software || "";
  return type;
}
async function checkTypeSoftware() {
  typeSoftware = await type_Software();
}
checkTypeSoftware();
//Bieu do thong ke so may nhiem ma doc theo don vi
module.exports.thongKeNhiemMaDoc = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let unit_code = req.body.unit_code;
  let startDate = req.body.start_date;
  let endDate = req.body.end_date;
  if (unit_code == "") {
    return successResponse(res, [], 200, "Success");
  }
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: {$regex:"Malware.*",$options:"$i"} },
              {$or:[{alert_level_id:"2"},{alert_level_id:"3"}]}
            ],
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll1 = await alertModel.aggregate(queryAll1);
      return successResponse(res, dataAll1, 200, "Success");
    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: {$regex:"Malware.*",$options:"$i"} },
              {$or:[{alert_level_id:"2"},{alert_level_id:"3"}]}
            ],
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll2 = await alertModel.aggregate(queryAll2);

      return successResponse(res, dataAll2, 200, "Success");

    }
  }

  if (unit_code != "" && unit_code != "all") {
    let unit = await unitsModel.findOne({ unit_code: unit_code });
    if (unit == [] || unit == null) {
      return successResponse(res, [], 200, "Success");
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: {$regex:"Malware.*",$options:"$i"} },
              {$or:[{alert_level_id:"2"},{alert_level_id:"3"}]}
            ],
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data1 = await alertModel.aggregate(query1);

      return successResponse(res, data1, 200, "Success");

    }
    if (unit.level == "2") {
      let query2 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: {$regex:"Malware.*",$options:"$i"} },
              {$or:[{alert_level_id:"2"},{alert_level_id:"3"}]}
            ],
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data2 = await alertModel.aggregate(query2);

      return successResponse(res, data2, 200, "Success");

    }
  }
};
//Bieu do thong ke so may truy van C&C theo don vi
module.exports.thongKeKetNoiCandC = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let unit_code = req.body.unit_code;
  let startDate = req.body.start_date;
  let endDate = req.body.end_date;
  if (unit_code == "") {
    return successResponse(res, [], 200, "Success");
  }
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) }},
              { updated_at: { $lte: new Date(endDate) } },
              { $or: [{ alert_type: {$regex:"Black_domain.*",$options:"$i"}}, { alert_type: {$regex:"Black_ip.*",$options:"$i"}}] }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll1 = await alertModel.aggregate(queryAll1);

      return successResponse(res, dataAll1, 200, "Success");

    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) }, },
              { updated_at: { $lte: new Date(endDate) } },
              { $or: [{ alert_type: {$regex:"Black_domain.*",$options:"$i"}}, { alert_type: {$regex:"Black_ip.*",$options:"$i"}}] }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll2 = await alertModel.aggregate(queryAll2);

      return successResponse(res, dataAll2, 200, "Success");

    }
  }

  if (unit_code != "" && unit_code != "all") {
    let unit = await unitsModel.findOne({ unit_code: unit_code });
    if (unit == [] || unit == null) {
      return successResponse(res, [], 200, "Success");
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match: {
            $and: [
              { "idParent.unit_code": unit_code },
              { $or: [{ alert_type: {$regex:"Black_domain.*",$options:"$i"}}, { alert_type: {$regex:"Black_ip.*",$options:"$i"}}] },
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data1 = await alertModel.aggregate(query1);

      return successResponse(res, data1, 200, "Success");

    }
    if (unit.level == "2") {
      let query2 = [
        {
          $match: {
            $and: [
              { "idParent.unit_code": unit_code },
              { $or: [{ alert_type: {$regex:"Black_domain.*",$options:"$i"}}, { alert_type: {$regex:"Black_ip.*",$options:"$i"}}] },
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data2 = await alertModel.aggregate(query2);

      return successResponse(res, data2, 200, "Success");

    }
  }
};
//Bieu do thong ke so may vi pham quy dinh theo don vi
module.exports.thongKeViolent = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let unit_code = req.body.unit_code;
  let startDate = req.body.start_date;
  let endDate = req.body.end_date;

  if (unit_code == "") {
    return successResponse(res, [], 200, "Success");
  }
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: {$regex:"USB.*",$options:"$i"} },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: {$regex:"Internet.*",$options:"$i"} },
                  { alert_type: "Ket noi quan su" },
                ]
              }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll1 = await alertModel.aggregate(queryAll1);

      return successResponse(res, dataAll1, 200, "Success");

    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: {$regex:"USB.*",$options:"$i"} },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: {$regex:"Internet.*",$options:"$i"} },
                  { alert_type: "Ket noi quan su" },
                ]
              }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let dataAll2 = await alertModel.aggregate(queryAll2);

      return successResponse(res, dataAll2, 200, "Success");

    }
  }

  if (unit_code != "" && unit_code != "all") {
    let unit = await unitsModel.findOne({ unit_code: unit_code }).lean();
    if (unit == [] || unit == null) {
      return successResponse(res, [], 200, "Success");
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: {$regex:"USB.*",$options:"$i"} },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: {$regex:"Internet.*",$options:"$i"} },
                  { alert_type: "Ket noi quan su" },
                ]
              },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data1 = await alertModel.aggregate(query1);

      return successResponse(res, data1, 200, "Success");

    }

    if (unit.level == "2") {
      let query2 = [
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: {$regex:"USB.*",$options:"$i"} },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: {$regex:"Internet.*",$options:"$i"} },
                  { alert_type: "Ket noi quan su" },
                ]
              },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          },
        },
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        { $project: { mac: 1, dvc2: { $arrayElemAt: ["$DVC2", 0] } } },
        {
          $addFields: {
            unitcode_dvc2: "$dvc2.unit_code",
            fullname_dvc2: "$dvc2.full_name",
          },
        },
        { $project: { dvc2: 0 } },
        {
          $group: {
            _id: { mac: "$mac", dv: "$fullname_dvc2" },
            data: { $push: "$mac" },
          },
        },
        {
          $group: {
            // for each age group, create an array of positions
            _id: "$_id.dv",
            macs: { $push: { mac: "$_id.mac", data: "$data" } },
          },
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: { $size: "$macs" } },
          },
        },
      ];
      let data2 = await alertModel.aggregate(query2);
      return successResponse(res, data2, 200, "Success");
    }
  }
};

// Cac ham phuc vu dashboard
//May tinh quan su ket noi Internet
async function deviceConnectInternet(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Internet.*",$options:"$i"} },
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Internet.*",$options:"$i"} },
          ],
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}

//May khong ket noi mang
async function deviceNotRegisterNetwork(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { "ident_info.network_type": "Không kết nối mạng" },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { "ident_info.network_type": "Không kết nối mạng" },
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

//May Internet ket noi quan su
async function deviceConnectTSLqs(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { "ident_info.network_type": "Internet" },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { "ident_info.network_type": "Internet" },
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

//Cam USB khong an toan
async function devicePlugInUSB(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"USB.*",$options:"$i"} },
            { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [{
            $or: conditionCheck
          },
          { "idParent.unit_code": unit_code },
          { updated_at: { $gte: new Date(startDate) } },
          { updated_at: { $lte: new Date(endDate) } },
          { alert_type: {$regex:"USB.*",$options:"$i"} },
          { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}

//Thiet bị truy cap C&C Domain
async function deviceCandCDomain(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Black_domain.*",$options:"$i"} },
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Black_domain.*",$options:"$i"} },
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}
//Thiet bị truy cap C&C IP
async function deviceCandCIP(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Black_ip.*",$options:"$i"} },
          ]
        }
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Black_ip.*",$options:"$i"} },
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}
//Thiet Bi nhiem ma doc (Muc cao)
async function deviceMalwareLV1(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Malware.*",$options:"$i"} },
            { alert_level_id: "3" }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Malware.*",$options:"$i"} },
            { alert_level_id: "3" }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}

//Thiert bi nhiem ma doc muc TB
async function deviceMalwareLV2(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Malware.*",$options:"$i"} },
            { alert_level_id: "2" }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { updated_at: { $gte: new Date(startDate) } },
            { updated_at: { $lte: new Date(endDate) } },
            { alert_type: {$regex:"Malware.*",$options:"$i"} },
            { alert_level_id: "3" }
          ]
        },
      },

      {
        $group: {
          _id: "$mac",
          count: { $sum: 1 },
        },
      },
      {
        $count: "total",
      },
    ];
    let countalert = await alertModel.aggregate(query);
    if (countalert.length == 0) {
      return 0;
    } else {
      return countalert[0].total;
    }
  }
}

//Tong so may cai MiAV
async function MiAVTotal(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

//Tong so chua cai MiAV
async function MiAVNotInstall(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { last_seen_miav: "" },
                { last_seen_miav: null },
                { last_seen_miav: [] },
                { miav_version: {$exists:false} },
              ]
            },
            {$or:[{ "ident_info.type": "Máy Tính" },{ "ident_info.type": "Máy Chủ" }]},
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { last_seen_miav: "" },
                { last_seen_miav: null },
                { last_seen_miav: [] },
                { miav_version: {$exists:false} },
              ]
            },
            {$or:[{ "ident_info.type": "Máy Tính" },{ "ident_info.type": "Máy Chủ" }]},
            { "idParent.unit_code": unit_code },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}
//So luong MiAV hoat dong
async function MiAVActive(unit_code, startDate, endDate, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_miav_connect;
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $project:
        {
          last_time_receive: { $dateFromString: { dateString: "$last_time_receive" } },
          last_seen_miav: { $dateFromString: { dateString: "$last_seen_miav" } }
        }
      },
      {
        $addFields: { time_check: { $subtract: ["$last_time_receive", 60 * 1000 * 60 * 24 * parseInt(checkDay)] } }
      },
      {
        $project:
        {
          last_seen_miav: 1,
          last_time_receive: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$last_seen_miav", "$time_check"] }, 1, 0] }
        }
      },
      {
        $match: { eq: 1 }
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } },
            { "idParent.unit_code": unit_code },
          ]
        },
      },

      {
        $project:
        {
          last_time_receive: { $dateFromString: { dateString: "$last_time_receive" } },
          last_seen_miav: { $dateFromString: { dateString: "$last_seen_miav" } }
        }
      },
      {
        $addFields: { time_check: { $subtract: ["$last_time_receive", 60 * 1000 * 60 * 24 * parseInt(checkDay)] } }
      },
      {
        $project:
        {
          last_seen_miav: 1,
          last_time_receive: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$last_seen_miav", "$time_check"] }, 1, 0] }
        }
      },
      {
        $match: { eq: 1 }
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

// So luong MiAV mat ket noi
async function MiAVNotConnect(unit_code, startDate, endDate, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_miav_connect;
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $project:
        {
          last_time_receive: { $dateFromString: { dateString: "$last_time_receive" } },
          last_seen_miav: { $dateFromString: { dateString: "$last_seen_miav" } }
        }
      },
      {
        $addFields: { time_check: { $subtract: ["$last_time_receive", 60 * 1000 * 60 * 24 * parseInt(checkDay)] } }
      },
      {
        $project:
        {
          last_seen_miav: 1,
          last_time_receive: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$last_seen_miav", "$time_check"] }, 1, 0] }
        }
      },
      {
        $match: { eq: 0 }
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { last_seen_miav: { $ne: "" } },
            { last_seen_miav: { $ne: null } },
            { last_seen_miav: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } },
            { "idParent.unit_code": unit_code },
          ],

        },
      },
      {
        $project:
        {
          last_time_receive: { $dateFromString: { dateString: "$last_time_receive" } },
          last_seen_miav: { $dateFromString: { dateString: "$last_seen_miav" } }
        }
      },
      {
        $addFields: { time_check: { $subtract: ["$last_time_receive", 60 * 1000 * 60 * 24 * parseInt(checkDay)] } }
      },
      {
        $project:
        {
          last_seen_miav: 1,
          last_time_receive: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$last_seen_miav", "$time_check"] }, 1, 0] }
        }
      },
      {
        $match: { eq: 0 }
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

//Tong so thiet bi
async function DeviceTotal(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        }
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        }
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

// Thiet bi da dinh danh
async function DeviceIdent(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { ident_info: { $ne: "" } },
            { ident_info: { $ne: null } },
            { ident_info: { $ne: [] } },
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { ident_info: { $ne: "" } },
            { ident_info: { $ne: null } },
            { ident_info: { $ne: [] } },
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

// Thiet bi chua dinh danh
async function DeviceNotIdent(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ]
        },
      },

      {
        $match: {
          $or: [{ ident_info: "" }, { ident_info: null }, { ident_info: [] }],
        }
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { last_time_receive: { $gte: startDate } },
            { last_time_receive: { $lte: endDate } }
          ],
        },
      },

      {
        $match: {
          $or: [{ ident_info: "" }, { ident_info: null }, { ident_info: [] }],
        },
      },
      {
        $count: "total",
      },
    ];
    let countMiAV = await activeDeviceModel.aggregate(query);
    if (countMiAV.length == 0) {
      return 0;
    } else {
      return countMiAV[0].total;
    }
  }
}

//FMC online
async function FMCOnline(unit_code, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_day_online;
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { type_software: "FMC" }
          ],
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 1 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { type_software: "FMC" }
          ]
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 1 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  }
}
//FMC offline
async function FMCOffline(unit_code, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_day_online
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { type_software: "FMC" }
          ],
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 0 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            { type_software: "FMC" }
          ],
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 0 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  }
}
//FMS online
async function FMSOnline(unit_code, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_day_online
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            {
              $or: [
                { type_software: "FMS1" },
                { type_software: "FMS2" },
                { type_software: "FMS3" },
              ]
            }
          ]
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 1 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            {
              $or: [
                { type_software: "FMS1" },
                { type_software: "FMS2" },
                { type_software: "FMS3" },
              ]
            }
          ]
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 1 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  }
}
//FMS offline
async function FMSOffline(unit_code, conditionsUser) {
  let setting = await settingModel.findOne().sort({ updated_at: 1 }).lean();
  let checkDay = setting.check_day_online
  if (unit_code == "all") {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            {
              $or: [
                { type_software: "FMS1" },
                { type_software: "FMS2" },
                { type_software: "FMS3" },
              ]
            }
          ]
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 0 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  } else {
    let query = [
      {
        $match:
          conditionsUser
      },
      {
        $match: {
          $and: [
            { $or: conditionCheck },
            { "idParent.unit_code": unit_code },
            {
              $or: [
                { type_software: "FMS1" },
                { type_software: "FMS2" },
                { type_software: "FMS3" },
              ]
            }
          ]
        },
      },

      {
        $project: {
          last_time: { $dateFromString: { dateString: "$last_time" } },
        },
      },
      {
        $addFields: {
          time_check: { $add: ["$last_time", 60 * 1000 * 60 * 24 * parseInt(checkDay)] },
        },
      },
      {
        $project: {
          last_time: 1,
          time_check: 1,
          eq: { $cond: [{ $gte: ["$time_check", "$$NOW"] }, 1, 0] },
        },
      },
      {
        $match: { eq: 0 },
      },
      {
        $count: "total",
      },
    ];
    let countFMCOnline = await softwareManagerModel.aggregate(query);
    if (countFMCOnline.length == 0) {
      return 0;
    } else {
      return countFMCOnline[0].total;
    }
  }
}
//SL don vi nhiem ma doc
async function unitMalware(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: "Malware" },
              { $or: [{ alert_level_id: "3" }, { alert_level_id: "2" }]}
            ],
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll1 = await alertModel.aggregate(queryAll1);
      if (countUnitALertAll1.length == 0) {
        return 0;
      } else {
        return countUnitALertAll1[0].total;
      }
    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: "Malware" },
              { $or: [{ alert_level_id: "3" }, { alert_level_id: "2" }]}
            ],
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll2 = await alertModel.aggregate(queryAll2);
      if (countUnitALertAll2.length == 0) {
        return 0;
      } else {
        return countUnitALertAll2[0].total;
      }
    }
  } else {
    let unit = await unitsModel.findOne({ unit_code: unit_code });
    if (unit == null) {
      return 0;
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: "Malware" },
              { $or: [{ alert_level_id: "3" }, { alert_level_id: "2" }]}
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert1 = await alertModel.aggregate(query1);
      if (countUnitALert1.length == 0) {
        return 0;
      } else {
        return countUnitALert1[0].total;
      }
    }
    if (unit.level == "2") {
      let query2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { alert_type: "Malware" },
              { $or: [{ alert_level_id: "3" }, { alert_level_id: "2" }]}
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert2 = await alertModel.aggregate(query2);
      if (countUnitALert2.length == 0) {
        return 0;
      } else {
        return countUnitALert2[0].total;
      }
    }
  }
}
//SL don vi ket noi C&C
async function unitCandC(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { $or: [{ alert_type: "Black_domain" }, { alert_type: "Black_ip" }] }
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll1 = await alertModel.aggregate(queryAll1);
      if (countUnitALertAll1.length == 0) {
        return 0;
      } else {
        return countUnitALertAll1[0].total;
      }
    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              { $or: [{ alert_type: "Black_domain" }, { alert_type: "Black_ip" }] }
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll2 = await alertModel.aggregate(queryAll2);
      if (countUnitALertAll2.length == 0) {
        return 0;
      } else {
        return countUnitALertAll2[0].total;
      }
    }
  } else {
    let unit = await unitsModel.findOne({ unit_code: unit_code });
    if (unit == null) {
      return 0;
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { "idParent.unit_code": unit_code },
              { $or: [{ alert_type: "Black_domain" }, { alert_type: "Black_ip" }] },
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ],
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert1 = await alertModel.aggregate(query1);
      if (countUnitALert1.length == 0) {
        return 0;
      } else {
        return countUnitALert1[0].total;
      }
    }
    if (unit.level == "2") {
      let query2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { "idParent.unit_code": unit_code },
              { $or: [{ alert_type: "Black_domain" }, { alert_type: "Black_ip" }] },
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ],
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert2 = await alertModel.aggregate(query2);
      if (countUnitALert2.length == 0) {
        return 0;
      } else {
        return countUnitALert2[0].total;
      }
    }
  }
}
//SL don vi vi pham quy dinh
async function unitViolate(unit_code, startDate, endDate, conditionsUser) {
  if (unit_code == "all") {
    if (typeSoftware == "FMS1" || typeSoftware == "FMS2") {
      let queryAll1 = [
        {
          $match:
            conditionsUser
        },
        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "1"] },
              },
            },
          },
        },

        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: "USB" },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: "Internet" },
                ]
              }
            ]
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll1 = await alertModel.aggregate(queryAll1);
      if (countUnitALertAll1.length == 0) {
        return 0;
      } else {
        return countUnitALertAll1[0].total;
      }
    }
    if (typeSoftware == "FMS3") {
      let queryAll2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: "USB" },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: "Internet" },
                ]
              }
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALertAll2 = await alertModel.aggregate(queryAll2);
      if (countUnitALertAll2.length == 0) {
        return 0;
      } else {
        return countUnitALertAll2[0].total;
      }
    }
  } else {
    let unit = await unitsModel.findOne({ unit_code: unit_code });
    if (unit == null) {
      return 0;
    }
    if (unit.level == "1") {
      let query1 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: "USB" },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: "Internet" },
                ]
              },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          },
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$ident_info.idParent",
                cond: { $eq: ["$$this.level", "2"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert1 = await alertModel.aggregate(query1);
      if (countUnitALert1.length == 0) {
        return 0;
      } else {
        return countUnitALert1[0].total;
      }
    }
    if (unit.level == "2") {
      let query2 = [
        {
          $match:
            conditionsUser
        },
        {
          $match: {
            $and: [
              { $or: conditionCheck },
              { "idParent.unit_code": unit_code },
              {
                $or: [
                  {
                    $and: [
                      { alert_type: "USB" },
                      { "alert_info.diskinfo": { $regex: "(Khong an toan).*" } },
                    ],
                  },
                  { alert_type: "Internet" },
                ]
              },
              { updated_at: { $gte: new Date(startDate) } },
              { updated_at: { $lte: new Date(endDate) } }
            ]
          }
        },

        {
          $addFields: {
            DVC2: {
              $filter: {
                input: "$idParent",
                cond: { $eq: ["$$this.level", "3"] },
              },
            },
          },
        },
        {
          $addFields: {
            dvc2: { $arrayElemAt: ["$DVC2", 0] }
          }
        },
        {
          $group: {
            _id: "$dvc2.full_name",
            count: { $sum: 1 },
          },
        },
        {
          $count: "total",
        },
      ];
      let countUnitALert2 = await alertModel.aggregate(query2);
      if (countUnitALert2.length == 0) {
        return 0;
      } else {
        return countUnitALert2[0].total;
      }
    }
  }
}

var countResult = new Object();
module.exports.tk = async (req, res) => {
  let authUser = req.authUser;
  let conditionsUser = authUser.conditions_role
  let startDate = req.body.start_date;
  let endDate = req.body.end_date;
  let unitCode = req.body.unit_code;

  var promises = [
    deviceConnectInternet(unitCode, startDate, endDate, conditionsUser),
    deviceCandCIP(unitCode, startDate, endDate, conditionsUser),
    devicePlugInUSB(unitCode, startDate, endDate, conditionsUser),
    deviceCandCDomain(unitCode, startDate, endDate, conditionsUser),
    deviceMalwareLV1(unitCode, startDate, endDate, conditionsUser),
    MiAVTotal(unitCode, startDate, endDate, conditionsUser),
    MiAVActive(unitCode, startDate, endDate, conditionsUser),
    MiAVNotConnect(unitCode, startDate, endDate, conditionsUser),
    DeviceTotal(unitCode, startDate, endDate, conditionsUser),
    DeviceIdent(unitCode, startDate, endDate, conditionsUser),
    DeviceNotIdent(unitCode, startDate, endDate, conditionsUser),
    FMCOnline(unitCode, conditionsUser),
    FMSOnline(unitCode, conditionsUser),
    unitViolate(unitCode, startDate, endDate, conditionsUser),
    unitCandC(unitCode, startDate, endDate, conditionsUser),
    unitMalware(unitCode, startDate, endDate, conditionsUser),
    deviceMalwareLV2(unitCode, startDate, endDate, conditionsUser),
    FMCOffline(unitCode, conditionsUser),
    FMSOffline(unitCode, conditionsUser),
    deviceConnectTSLqs(unitCode, startDate, endDate, conditionsUser),
    MiAVNotInstall(unitCode,startDate, endDate, conditionsUser),
    deviceNotRegisterNetwork(unitCode,startDate,endDate,conditionsUser)
  ];

  Promise.all(promises)
    .then(function (results) {
      countResult.countDeviceConnectInternet = results[0];
      countResult.countdeviceCandCIP = results[1];
      countResult.countdevicePlugInUSB = results[2];
      countResult.countdeviceCandCDomain = results[3];
      countResult.countdeviceMalwareLV2 = results[4];
      countResult.countMiAVTotal = results[5];
      countResult.countMiAVActive = results[6];
      countResult.countMiAVNotConnect = results[7];
      countResult.countDeviceTotal = results[8];
      countResult.countDeviceIdent = results[9];
      countResult.countDeviceNotIdent = results[10];
      countResult.countFMCOnline = results[11];
      countResult.countFMSOnline = results[12];
      countResult.countUnitViolate = results[13];
      countResult.countUnitCandC = results[14];
      countResult.countUnitMalware = results[15];
      countResult.countdeviceMalwareLV1 = results[16];
      countResult.countFMCOffline = results[17];
      countResult.countFMSOffline = results[18];
      countResult.countdeviceConnectTSLqs = results[19];
      countResult.countMiAVNotInstall=results[20]
      countResult.countDeviceNotRegisterNetwork = results[21]
      // res.send(countResult);
      return successResponse(res, countResult, 200, "Success");
    })
    .catch(function (err) {
      console.log(err);
    });
};
