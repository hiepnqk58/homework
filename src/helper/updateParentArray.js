const alertModel = require("../models/Alert");
const identDeviceModel = require("../app/models/IdentDevice");
const activeDeviceModel = require("../app/models/ActiveDevice");
const settingModel = require("../app/models/Setting");
const common = require("../../helper/common");

async function updateArrayParentDeviceActive() {
  try {
    let deviceActive = await activeDeviceModel.find({});
    if (deviceActive) {
      for (let i of deviceActive) {
        if (i) {
          let parent = await common.getArrayUnit(i.unit_code);
          if (parent) {
            let data = await activeDeviceModel.findOneAndUpdate(
              { mac: i.mac },
              {
                $set: {
                  idParent: parent,
                },
              }
            );
          } else {
          }
        } else {
        }
      }
    } else {
    }
  } catch (error) {
    console.log("error");
  }
}

async function updateArrayParentDevice() {
  try {
    let device = await identDeviceModel.find({});
    if (device) {
      for (let i of device) {
        if (i) {
          let parent = await common.getArrayUnit(i.unit_code);
          if (parent) {
            let data = await identDeviceModel.findOneAndUpdate(
              { mac: i.mac },
              {
                $set: {
                  idParent: parent,
                },
              }
            );
          } else {
          }
        } else {
        }
      }
    } else {
    }
  } catch (error) {
    console.log("error");
  }
}

async function updateArrayParentAlert() {
  try {
    let alert = await alertModel.find({});
    if (alert) {
      for (let i of alert) {
        if (i) {
          let parent = await common.getArrayUnit(i.unit_code);
          if (parent) {
            let data = await alertModel.findOneAndUpdate(
              { mac: i.mac },
              {
                $set: {
                  idParent: parent,
                },
              }
            );
          } else {
          }
        } else {
        }
      }
    } else {
    }
  } catch (error) {
    console.log("error");
  }
}
