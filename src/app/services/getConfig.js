const settingModel = require("../models/Setting");
const softwareManagerModel = require("../models/SoftwareManager");
const unitModel = require("../models/Unit");
const moment = require("moment");
var si = require("systeminformation");
const common = require("../../helper/common");
const Logger = require("../../libs/logger");
const log = new Logger(__filename);
const stackTrace = require("stack-trace");
const env = require("../../../src/configs/env");

module.exports.getConfig = async (req, res) => {
  try {
    let setting = await settingModel.findOne({}).sort({ update_at: 1 }).lean();
    let idSoftware = setting.id_software;
    let softwareName = setting.name_software;
    let softwaretype = setting.type_software;
    let unitCode = setting.unit_code;
    let idParent = await common.getArrayUnit(unitCode);

    let unit = await unitModel.findOne({ unit_code: unitCode });
    let region = unit?.region || [];

    let netWork = await si.networkInterfaces();
    let uuid = await si.uuid();
    const cpu = await si.cpu();
    const disk = (await si.diskLayout())[0];
    const os = await si.osInfo();
    const versions = await si.versions();
    const ram = await si.mem();

    const diskInfo = await si.fsSize(); 
 
    // Lấy thông tin về dung lượng đã sử dụng từ ổ đĩa đầu tiên (index 0) 
    const usedSpace = diskInfo[0].used; 
    // RAM Info
    const totalRam = Math.round(ram.total / 1024 / 1024 / 1024);
    let ramUse = Math.round(ram.used / 1024 / 1024 / 1024);
    // Disk Info
    const size = Math.round(disk.size / 1024 / 1024 / 1024);
    const diskUse = Math.round(usedSpace / (1024 * 1024 * 1024));
    //OS Info

    let hardware = {
      cpu: {
        name: cpu.manufacturer + cpu.brand,
        speed: cpu.speed.toString() + "GHz",
      },
      ram: {
        ram_total: totalRam.toString() + " GB",
        ram_use: ramUse.toString() + " GB",
        ram_free: (totalRam - ramUse).toString() + " GB",
      },
      disk: {
        name: disk.vendor + disk.name + " "+ disk.type,
        disk_total: size.toString() + " GB",
        disk_use : diskUse.toString() + " GB",
      },
      os: os.distro + os.codename + os.platform,
      Kernel: os.kernel + os.arch,
    };
    const option = { new: true, upsert: true };
    if (idSoftware) {
      let macAddress = uuid.macs[0].toUpperCase();
      macAddress = macAddress.toString().replace(/:/g, "-");
      await softwareManagerModel.findOneAndUpdate(
        { id_software: idSoftware },
        {
          software_version: env.app.version,
          system_info: hardware,
          last_time: moment().format("YYYY-MM-DD HH:mm:ss"),
          name_software: softwareName,
          type_software: softwaretype,
          ip: netWork[1].ip4,
          mac: macAddress,
          unit_code: unitCode,
          region: region[0],
          idParent:idParent
        },
        option
      );
    }

    return true;
  } catch (error) {
    const stack = stackTrace.parse(error);
    const lineNumber = stack[0].lineNumber; // lấy số dòng bị lỗi
    log.error(error, [lineNumber]);
    return false;
  }
};
