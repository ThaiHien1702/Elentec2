import ComputerInfo from "../models/ComputerInfo.js";
import XLSX from "xlsx";
import { hasPermission } from "../utils/positionHierarchy.js";

const FIELD_ALIASES = {
  employeeNo: ["Employee No.", "Employee No", "employeeNo"],
  email: ["Email Address", "Email", "email"],
  phone: ["Phone No.", "Phone No", "Phone", "phone"],
  userName: ["User Name", "userName"],
  position: ["Position", "position"],
  department: ["Dept", "Department", "department"],
  ipAddress: ["IP Address", "ipAddress"],
  macAddress: ["MAC Address", "macAddress"],
  computerName: ["Computer Name", "computerName"],
  userNamePc: ["User Name Pc", "Username PC", "userNamePc"],
  categories: ["Categories", "Category", "categories"],
  manufacturer: ["Manufacturer", "manufacturer"],
  serviceTag: [
    "Service tag/Serial number",
    "Service tag",
    "Serial number",
    "serviceTag",
  ],
  systemModel: ["System Model", "systemModel"],
  cpu: ["CPU", "cpu"],
  ram: ["RAM", "ram"],
  hdd: ["HDD", "hdd"],
  ssd: ["SSD", "ssd"],
  vga: ["VGA", "vga"],
  other: ["Other", "other"],
  status: ["Status", "status"],
  notes: ["Notes", "Ghi chú", "notes"],
};

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

  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    payload[field] = pickFieldValue(row, aliases);
  });

  if (!payload.status) {
    payload.status = "Active";
  }
  if (!payload.categories) {
    payload.categories = "Laptop";
  }

  return payload;
};

const EXCEL_HEADERS = [
  "Employee No.",
  "Email Address",
  "Phone No.",
  "User Name",
  "Position",
  "Dept",
  "IP Address",
  "MAC Address",
  "Computer Name",
  "User Name Pc",
  "Categories",
  "Manufacturer",
  "Service tag/Serial number",
  "System Model",
  "CPU",
  "RAM",
  "HDD",
  "SSD",
  "VGA",
  "Other",
  "Status",
  "Notes",
];

const EXCEL_COL_WIDTHS = [
  { wch: 14 },
  { wch: 28 },
  { wch: 16 },
  { wch: 20 },
  { wch: 18 },
  { wch: 12 },
  { wch: 16 },
  { wch: 20 },
  { wch: 24 },
  { wch: 16 },
  { wch: 14 },
  { wch: 16 },
  { wch: 24 },
  { wch: 22 },
  { wch: 22 },
  { wch: 12 },
  { wch: 12 },
  { wch: 12 },
  { wch: 18 },
  { wch: 20 },
  { wch: 18 },
  { wch: 28 },
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

    res.status(200).json(computers);
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

    res.status(200).json(computer);
  } catch (error) {
    console.error("Error getting computer:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin máy tính" });
  }
};

// Create new computer
export const createComputer = async (req, res) => {
  try {
    const {
      employeeNo,
      email,
      phone,
      userName,
      position,
      department,
      ipAddress,
      macAddress,
      computerName,
      userNamePc,
      categories,
      manufacturer,
      serviceTag,
      systemModel,
      cpu,
      ram,
      hdd,
      ssd,
      vga,
      other,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (!employeeNo || !email || !userName || !department || !computerName) {
      return res.status(400).json({
        message:
          "Thiếu trường bắt buộc (employeeNo, email, userName, department, computerName)",
      });
    }

    const computer = new ComputerInfo({
      employeeNo,
      email,
      phone,
      userName,
      position,
      department,
      ipAddress,
      macAddress,
      computerName,
      userNamePc,
      categories,
      manufacturer,
      serviceTag,
      systemModel,
      cpu,
      ram,
      hdd,
      ssd,
      vga,
      other,
      status: status || "Active",
      notes,
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

    // Add lastUpdatedBy
    updateData.lastUpdatedBy = req.userId;

    const computer = await ComputerInfo.findByIdAndUpdate(id, updateData, {
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

    res.status(200).json(computers);
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

    const rows = computers.map((item) => ({
      "Employee No.": item.employeeNo || "",
      "Email Address": item.email || "",
      "Phone No.": item.phone || "",
      "User Name": item.userName || "",
      Position: item.position || "",
      Dept: item.department || "",
      "IP Address": item.ipAddress || "",
      "MAC Address": item.macAddress || "",
      "Computer Name": item.computerName || "",
      "User Name Pc": item.userNamePc || "",
      Categories: item.categories || "",
      Manufacturer: item.manufacturer || "",
      "Service tag/Serial number": item.serviceTag || "",
      "System Model": item.systemModel || "",
      CPU: item.cpu || "",
      RAM: item.ram || "",
      HDD: item.hdd || "",
      SSD: item.ssd || "",
      VGA: item.vga || "",
      Other: item.other || "",
      Status: item.status || "",
      Notes: item.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Computers");

    worksheet["!cols"] = EXCEL_COL_WIDTHS;

    const fileBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

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
    const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Computers Template");

    worksheet["!cols"] = EXCEL_COL_WIDTHS;

    const fileBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

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

        const findConditions = [];
        if (payload.serviceTag) {
          findConditions.push({ serviceTag: payload.serviceTag });
        }
        findConditions.push({
          employeeNo: payload.employeeNo,
          computerName: payload.computerName,
        });

        const existing = await ComputerInfo.findOne({ $or: findConditions });

        if (existing) {
          await ComputerInfo.findByIdAndUpdate(existing._id, {
            ...payload,
            lastUpdatedBy: req.userId,
          });
          updatedCount += 1;
        } else {
          await ComputerInfo.create({
            ...payload,
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
