import Department from "../models/Department.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Lấy tất cả departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.status(200).json(departments);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách departments", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy department theo ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    return res.status(200).json(department);
  } catch (error) {
    console.error("Lỗi khi lấy department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tạo department mới
export const createDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Tên department không được để trống" });
    }

    // Kiểm tra trùng tên
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Department đã tồn tại" });
    }

    const department = await Department.create({
      name,
      description,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Tạo department thành công",
      department,
    });
  } catch (error) {
    console.error("Lỗi khi tạo department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    // Kiểm tra trùng tên với department khác
    if (name) {
      const existing = await Department.findOne({
        name,
        _id: { $ne: id },
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Tên department đã được sử dụng" });
      }
    }

    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const oldName = existingDepartment.name;

    if (typeof name === "string") {
      existingDepartment.name = name;
    }
    if (typeof description !== "undefined") {
      existingDepartment.description = description;
    }
    if (typeof status !== "undefined") {
      existingDepartment.status = status;
    }

    await existingDepartment.save();

    if (name && name !== oldName) {
      await User.updateMany({ department: oldName }, { department: name });
    }

    return res.status(200).json({
      message: "Cập nhật department thành công",
      department: existingDepartment,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    await User.updateMany(
      { department: department.name },
      { department: null },
    );

    return res.status(200).json({
      message: "Xóa department thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Toggle status
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    department.status = department.status === "active" ? "inactive" : "active";
    await department.save();

    return res.status(200).json({
      message: `Department đã được ${department.status === "active" ? "kích hoạt" : "vô hiệu hóa"}`,
      department,
    });
  } catch (error) {
    console.error("Lỗi khi toggle status", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy users của một department
export const getDepartmentUsers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    const department = await Department.findById(id).populate(
      "users",
      "idCompanny displayName email position",
    );

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    return res.status(200).json({
      message: "Lấy danh sách users thành công",
      users: department.users || [],
    });
  } catch (error) {
    console.error("Lỗi khi lấy users của department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thêm user vào department
export const addUserToDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    // Kiểm tra department tồn tại
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const currentUsers = Array.isArray(department.users)
      ? department.users
      : [];

    // Kiểm tra user đã có trong department chưa
    if (currentUsers.some((uid) => uid.toString() === userId)) {
      return res
        .status(409)
        .json({ message: "User đã có trong department này" });
    }

    // Thêm user vào department
    department.users = [...currentUsers, userId];
    await department.save();

    // Cập nhật department field của user
    user.department = department.name;
    await user.save();

    return res.status(200).json({
      message: "Thêm user vào department thành công",
      department: await department.populate(
        "users",
        "idCompanny displayName email position",
      ),
    });
  } catch (error) {
    console.error("Lỗi khi thêm user vào department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa user khỏi department
export const removeUserFromDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Department ID không hợp lệ" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ" });
    }

    // Kiểm tra department tồn tại
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    const currentUsers = Array.isArray(department.users)
      ? department.users
      : [];

    // Kiểm tra user có trong department không
    if (!currentUsers.some((uid) => uid.toString() === userId)) {
      return res
        .status(404)
        .json({ message: "User không có trong department này" });
    }

    // Xóa user khỏi department
    department.users = currentUsers.filter((uid) => uid.toString() !== userId);
    await department.save();

    // Xóa department field của user
    const user = await User.findById(userId);
    if (user) {
      user.department = null;
      await user.save();
    }

    return res.status(200).json({
      message: "Xóa user khỏi department thành công",
      department: await department.populate(
        "users",
        "idCompanny displayName email position",
      ),
    });
  } catch (error) {
    console.error("Lỗi khi xóa user khỏi department", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
