import ComputerInfo from "../models/ComputerInfo.js";
import XLSX from "xlsx";
import ExcelJS from "exceljs";
import { hasPermission } from "../utils/positionHierarchy.js";
import {
  encryptComputerKeys,
  decryptComputerKeys,
} from "../utils/encryption.js";

const FIELD_ALIASES = {
  stt: ["STT", "stt"],
  assetCode: ["Asset Code", "assetCode"],
  employeeNo: ["Employee No.", "Employee No", "ID", "employeeNo"],
  email: ["Email Address", "Email", "email"],
  phone: ["Phone No.", "Phone No", "Phone", "phone"],
  userName: ["User Name", "Full Name", "userName"],
  position: ["Position", "position"],
  department: ["Dept", "Department", "department"],
  ipAddress: ["IP Address", "ipAddress"],
  macAddress: ["MAC Address", "Mac Address", "macAddress"],
  computerName: ["Computer Name", "computerName"],
  userNamePc: ["User Name Pc", "Username PC", "userNamePc"],
  categories: ["Categories", "Category", "Desktop / Laptop", "categories"],
  manufacturer: ["Manufacturer", "manufacturer"],
  serviceTag: [
    "Service tag/Serial number",
    "Service tag",
    "Serial number",
    "serviceTag",
  ],
  systemModel: ["System Model", "Model", "systemModel"],
  cpu: ["CPU", "cpu"],
  ram: ["RAM", "ram"],
  hdd: ["HDD", "hdd"],
  ssd: ["SSD", "ssd"],
  vga: ["VGA", "vga"],
  other: ["Other", "other"],
  status: ["Status", "status"],
  notes: ["Notes", "Ghi chú", "notes"],
  // OS fields
  osVersion: ["OS Version", "Version OS", "osVersion"],
  osLicense: ["OS License", "osLicense"],
  osKey: ["OS Key", "osKey"],
  osNote: ["OS Note", "osNote"],
  // Office fields
  officeVersion: ["Office Version", "Version Office", "officeVersion"],
  officeLicense: ["Office License", "MS License", "officeLicense"],
  officeKey: ["Office Key", "officeKey"],
  officeNote: ["Office Note", "officeNote"],
};

// Software list for Excel import/export
const SOFTWARE_LIST = [
  "AutoCAD",
  "NX",
  "PowerMill",
  "Mastercam",
  "ZWCAD",
  "Symantec",
];

const normalizeCellValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const pickFieldValue = (row, aliases) => {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return normalizeCellValue(row[alias]);
    }
  }
  return "";
};

const mapExcelRowToComputerPayload = (row) => {
  const payload = {};

  // Map basic fields
  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    payload[field] = pickFieldValue(row, aliases);
  });

  // Parse installed software from Excel columns
  const installedSoftware = [];
  SOFTWARE_LIST.forEach((softwareName) => {
    const version = pickFieldValue(row, [
      `${softwareName}_Version`,
      `${softwareName} Version`,
    ]);
    const license = pickFieldValue(row, [
      `${softwareName}_License`,
      `${softwareName} License`,
    ]);
    const key = pickFieldValue(row, [
      `${softwareName}_Key`,
      `${softwareName} Key`,
    ]);
    const note = pickFieldValue(row, [
      `${softwareName}_Note`,
      `${softwareName} Note`,
    ]);

    // If any field has value, consider software as installed
    if (version || license || key || note) {
      installedSoftware.push({
        name: softwareName,
        version: version || "",
        license: license || "",
        key: key || "",
        note: note || "",
      });
    }
  });

  if (installedSoftware.length > 0) {
    payload.installedSoftware = installedSoftware;
  }

  // Set defaults
  if (!payload.status) {
    payload.status = "Active";
  }
  if (!payload.categories) {
    payload.categories = "Laptop";
  }

  return payload;
};

const EXCEL_HEADERS = [
  // Part 1: Information
  "STT",
  "Asset Code",
  "ID",
  "Full Name",
  "Email Address",
  "Phone No.",
  "Position",
  "Dept",
  "IP Address",
  "Mac Address",
  "Computer Name",
  "User Name Pc",
  "Desktop / Laptop",
  "Manufacturer",
  "Model",
  "Service tag/Serial number",
  "CPU",
  "RAM",
  "HDD",
  "SSD",
  "VGA",
  "Other",
  "Status",
  "Notes",
  // Part 2: OS
  "Version OS",
  "OS License",
  "OS Key",
  "OS Note",
  // Part 3: MS Office
  "Version Office",
  "MS License",
  "Office Key",
  "Office Note",
  // Part 4: Software - AutoCAD
  "AutoCAD_Version",
  "AutoCAD_License",
  "AutoCAD_Key",
  "AutoCAD_Note",
  // NX
  "NX_Version",
  "NX_License",
  "NX_Key",
  "NX_Note",
  // PowerMill
  "PowerMill_Version",
  "PowerMill_License",
  "PowerMill_Key",
  "PowerMill_Note",
  // Mastercam
  "Mastercam_Version",
  "Mastercam_License",
  "Mastercam_Key",
  "Mastercam_Note",
  // ZWCAD
  "ZWCAD_Version",
  "ZWCAD_License",
  "ZWCAD_Key",
  "ZWCAD_Note",
  // Symantec
  "Symantec_Version",
  "Symantec_License",
  "Symantec_Key",
  "Symantec_Note",
];

const EXCEL_COL_WIDTHS = [
  // Information columns
  { wch: 6 }, // STT
  { wch: 16 }, // Asset Code
  { wch: 14 }, // ID
  { wch: 20 }, // Full Name
  { wch: 28 }, // Email
  { wch: 16 }, // Phone
  { wch: 18 }, // Position
  { wch: 12 }, // Dept
  { wch: 16 }, // IP
  { wch: 20 }, // MAC
  { wch: 20 }, // Computer Name
  { wch: 16 }, // User Name PC
  { wch: 16 }, // Desktop/Laptop
  { wch: 16 }, // Manufacturer
  { wch: 20 }, // Model
  { wch: 24 }, // Service Tag
  { wch: 24 }, // CPU
  { wch: 12 }, // RAM
  { wch: 12 }, // HDD
  { wch: 12 }, // SSD
  { wch: 18 }, // VGA
  { wch: 20 }, // Other
  { wch: 14 }, // Status
  { wch: 30 }, // Notes
  // OS columns
  { wch: 20 }, // Version OS
  { wch: 16 }, // OS License
  { wch: 30 }, // OS Key
  { wch: 20 }, // OS Note
  // Office columns
  { wch: 24 }, // Version Office
  { wch: 18 }, // MS License
  { wch: 30 }, // Office Key
  { wch: 20 }, // Office Note
  // Software columns (4 per software × 6 software = 24 columns)
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // AutoCAD
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // NX
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // PowerMill
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // Mastercam
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // ZWCAD
  { wch: 16 },
  { wch: 16 },
  { wch: 30 },
  { wch: 20 }, // Symantec
];

// Get all computers
export const getAllComputers = async (req, res) => {
  try {
    const { department, status } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }
    if (status) {
      filter.status = status;
    }

    const computers = await ComputerInfo.find(filter)
      .populate("lastUpdatedBy", "displayName idCompanny")
      .sort({ createdAt: -1 });

    // Mask product keys for list view (security)
    const maskedComputers = computers.map((comp) =>
      decryptComputerKeys(comp.toObject(), true),
    );

    res.status(200).json(maskedComputers);
  } catch (error) {
    console.error("Error getting computers:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách máy tính" });
  }
};

// Get computer by ID
export const getComputerById = async (req, res) => {
  try {
    const { id } = req.params;

    const computer = await ComputerInfo.findById(id).populate(
      "lastUpdatedBy",
      "displayName idCompanny",
    );

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    // Decrypt keys for detail view (show full keys)
    const decryptedComputer = decryptComputerKeys(computer.toObject(), false);

    res.status(200).json(decryptedComputer);
  } catch (error) {
    console.error("Error getting computer:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin máy tính" });
  }
};

// Create new computer
export const createComputer = async (req, res) => {
  try {
    const computerData = req.body;

    // Validate required fields
    if (
      !computerData.employeeNo ||
      !computerData.email ||
      !computerData.userName ||
      !computerData.department ||
      !computerData.computerName
    ) {
      return res.status(400).json({
        message:
          "Thiếu trường bắt buộc (employeeNo, email, userName, department, computerName)",
      });
    }

    // Encrypt product keys before saving
    const encryptedData = encryptComputerKeys(computerData);

    const computer = new ComputerInfo({
      ...encryptedData,
      status: computerData.status || "Active",
      lastUpdatedBy: req.userId,
    });

    await computer.save();

    res.status(201).json({
      message: "Tạo thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error creating computer:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Service Tag đã tồn tại trong hệ thống" });
    }
    res.status(500).json({ message: "Lỗi khi tạo thông tin máy tính" });
  }
};

// Update computer
export const updateComputer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check permission: must be able to edit computers
    if (!hasPermission(req.userPosition, "canEditAllComputers")) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa máy tính",
      });
    }

    // Encrypt product keys before updating
    const encryptedData = encryptComputerKeys(updateData);

    // Add lastUpdatedBy
    encryptedData.lastUpdatedBy = req.userId;

    const computer = await ComputerInfo.findByIdAndUpdate(id, encryptedData, {
      returnDocument: "after",
      runValidators: true,
    }).populate("lastUpdatedBy", "displayName idCompanny");

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    res.status(200).json({
      message: "Cập nhật thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error updating computer:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Service Tag đã tồn tại trong hệ thống" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin máy tính" });
  }
};

// Delete computer
export const deleteComputer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permission: only managers can delete
    if (!hasPermission(req.userPosition, "canDeleteData")) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa máy tính",
      });
    }

    const computer = await ComputerInfo.findByIdAndDelete(id);

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    res.status(200).json({
      message: "Xóa thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error deleting computer:", error);
    res.status(500).json({ message: "Lỗi khi xóa thông tin máy tính" });
  }
};

// Get computers statistics by department
export const getComputersStatsByDept = async (req, res) => {
  try {
    const stats = await ComputerInfo.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
          maintenance: {
            $sum: {
              $cond: [{ $eq: ["$status", "Under Maintenance"] }, 1, 0],
            },
          },
          retired: {
            $sum: { $cond: [{ $eq: ["$status", "Retired"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê máy tính" });
  }
};

// Search computers
export const searchComputers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const computers = await ComputerInfo.find({
      $or: [
        { employeeNo: { $regex: q, $options: "i" } },
        { computerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { ipAddress: { $regex: q, $options: "i" } },
        { macAddress: { $regex: q, $options: "i" } },
      ],
    });

    // Mask product keys for search results (security)
    const maskedComputers = computers.map((comp) =>
      decryptComputerKeys(comp.toObject(), true),
    );

    res.status(200).json(maskedComputers);
  } catch (error) {
    console.error("Error searching computers:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm máy tính" });
  }
};

// Export computers to Excel
export const exportComputersToExcel = async (req, res) => {
  try {
    // Check permission: Supervisor and above can export
    if (!hasPermission(req.userPosition, "canExportData")) {
      return res.status(403).json({
        message: "Bạn không có quyền xuất dữ liệu ra Excel",
      });
    }

    const { department, status } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }
    if (status) {
      filter.status = status;
    }

    const computers = await ComputerInfo.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Decrypt keys for export (admin gets full data backup)
    const decryptedComputers = computers.map((comp) =>
      decryptComputerKeys(comp, false),
    );

    const rows = decryptedComputers.map((item) => {
      const row = {
        // Part 1: Information
        STT: item.stt || "",
        "Asset Code": item.assetCode || "",
        ID: item.employeeNo || "",
        "Full Name": item.userName || "",
        "Email Address": item.email || "",
        "Phone No.": item.phone || "",
        Position: item.position || "",
        Dept: item.department || "",
        "IP Address": item.ipAddress || "",
        "Mac Address": item.macAddress || "",
        "Computer Name": item.computerName || "",
        "User Name Pc": item.userNamePc || "",
        "Desktop / Laptop": item.categories || "",
        Manufacturer: item.manufacturer || "",
        Model: item.systemModel || "",
        "Service tag/Serial number": item.serviceTag || "",
        CPU: item.cpu || "",
        RAM: item.ram || "",
        HDD: item.hdd || "",
        SSD: item.ssd || "",
        VGA: item.vga || "",
        Other: item.other || "",
        Status: item.status || "",
        Notes: item.notes || "",
        // Part 2: OS
        "Version OS": item.osVersion || "",
        "OS License": item.osLicense || "",
        "OS Key": item.osKey || "",
        "OS Note": item.osNote || "",
        // Part 3: MS Office
        "Version Office": item.officeVersion || "",
        "MS License": item.officeLicense || "",
        "Office Key": item.officeKey || "",
        "Office Note": item.officeNote || "",
      };

      // Part 4: Software - Add columns for each software
      SOFTWARE_LIST.forEach((softwareName) => {
        const software = item.installedSoftware?.find(
          (sw) => sw.name === softwareName,
        );
        row[`${softwareName}_Version`] = software?.version || "";
        row[`${softwareName}_License`] = software?.license || "";
        row[`${softwareName}_Key`] = software?.key || "";
        row[`${softwareName}_Note`] = software?.note || "";
      });

      return row;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Computers");

    // Add header row
    worksheet.addRow(EXCEL_HEADERS);

    // Add data rows
    rows.forEach((rowData) => {
      worksheet.addRow(rowData);
    });

    // Format header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30; // Padding trên dưới
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
      indent: 1,
    };
    // Add border to all header cells
    EXCEL_HEADERS.forEach((_, colIndex) => {
      const headerCell = headerRow.getCell(colIndex + 1);
      headerCell.border = {
        top: { style: "medium", color: { argb: "FF2F5496" } },
        bottom: { style: "medium", color: { argb: "FF2F5496" } },
        left: { style: "medium", color: { argb: "FF2F5496" } },
        right: { style: "medium", color: { argb: "FF2F5496" } },
      };
    });

    // Apply column widths
    worksheet.columns = EXCEL_COL_WIDTHS.map((w) => ({ width: w.wch }));

    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const fileBuffer = await workbook.xlsx.writeBuffer();

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=computers-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Error exporting computers excel:", error);
    return res.status(500).json({ message: "Lỗi khi export Excel" });
  }
};

// Download empty excel template for import
export const downloadComputersTemplateExcel = async (_req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Computers Template");

    // Add header row
    worksheet.addRow(EXCEL_HEADERS);

    // Format header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30; // Padding trên dưới
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
      indent: 1,
    };
    // Add border to all header cells
    EXCEL_HEADERS.forEach((_, colIndex) => {
      const headerCell = headerRow.getCell(colIndex + 1);
      headerCell.border = {
        top: { style: "medium", color: { argb: "FF2F5496" } },
        bottom: { style: "medium", color: { argb: "FF2F5496" } },
        left: { style: "medium", color: { argb: "FF2F5496" } },
        right: { style: "medium", color: { argb: "FF2F5496" } },
      };
    });

    // Apply column widths
    worksheet.columns = EXCEL_COL_WIDTHS.map((w) => ({ width: w.wch }));

    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const fileBuffer = await workbook.xlsx.writeBuffer();

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=computers-template-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Error downloading template excel:", error);
    return res.status(500).json({ message: "Lỗi khi tải file mẫu Excel" });
  }
};

// Import computers from Excel
export const importComputersFromExcel = async (req, res) => {
  try {
    // Check permission: only Assistant Manager and above can import
    if (!hasPermission(req.userPosition, "canImportData")) {
      return res.status(403).json({
        message: "Bạn không có quyền nhập dữ liệu từ Excel",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file Excel để import" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({ message: "File Excel không có dữ liệu" });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rows.length) {
      return res.status(400).json({ message: "File Excel rỗng" });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let index = 0; index < rows.length; index += 1) {
      try {
        const row = rows[index];
        const payload = mapExcelRowToComputerPayload(row);

        if (
          !payload.employeeNo ||
          !payload.email ||
          !payload.userName ||
          !payload.department ||
          !payload.computerName
        ) {
          skippedCount += 1;
          errors.push(`Dòng ${index + 2}: thiếu trường bắt buộc`);
          continue;
        }

        // Encrypt product keys before saving/updating
        const encryptedPayload = encryptComputerKeys(payload);

        const findConditions = [];
        if (encryptedPayload.serviceTag) {
          findConditions.push({ serviceTag: encryptedPayload.serviceTag });
        }
        findConditions.push({
          employeeNo: encryptedPayload.employeeNo,
          computerName: encryptedPayload.computerName,
        });

        const existing = await ComputerInfo.findOne({ $or: findConditions });

        if (existing) {
          await ComputerInfo.findByIdAndUpdate(existing._id, {
            ...encryptedPayload,
            lastUpdatedBy: req.userId,
          });
          updatedCount += 1;
        } else {
          await ComputerInfo.create({
            ...encryptedPayload,
            lastUpdatedBy: req.userId,
          });
          createdCount += 1;
        }
      } catch (error) {
        skippedCount += 1;
        errors.push(`Dòng ${index + 2}: ${error.message}`);
      }
    }

    return res.status(200).json({
      message: "Import Excel hoàn tất",
      result: {
        totalRows: rows.length,
        createdCount,
        updatedCount,
        skippedCount,
        errors: errors.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("Error importing computers excel:", error);
    return res.status(500).json({ message: "Lỗi khi import Excel" });
  }
};
