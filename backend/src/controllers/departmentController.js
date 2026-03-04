import Department from "../models/Department.js";

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
      return res.status(400).json({ message: "Tên department không được để trống" });
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

    // Kiểm tra trùng tên với department khác
    if (name) {
      const existing = await Department.findOne({
        name,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({ message: "Tên department đã được sử dụng" });
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

    return res.status(200).json({
      message: "Cập nhật department thành công",
      department,
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

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department không tồn tại" });
    }

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
