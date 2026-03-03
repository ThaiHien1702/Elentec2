import User from "../models/User.js";

// Gán role cho user
export const assignRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ message: "userId và role không được để trống" });
    }

    const validRoles = ["user", "moderator", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Role phải là một trong: ${validRoles.join(", ")}`,
      });
    }

    // Chỉ superadmin mới có thể gán role superadmin
    if (role === "superadmin" && req.userRole !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Chỉ superadmin mới có thể gán role superadmin" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json({
      message: `User ${user.displayName} đã được gán role ${role}`,
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gán role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa role từ user (đặt về user bình thường)
export const removeRole = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json({
      message: `User ${user.displayName} đã được đặt lại role user`,
      user,
    });
  } catch (error) {
    console.error("Lỗi khi xóa role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách tất cả users (chỉ admin+)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách users theo role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const validRoles = ["user", "moderator", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Role phải là một trong: ${validRoles.join(", ")}`,
      });
    }

    const users = await User.find({ role }).select("-hashedPassword");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users theo role", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy thông tin user bằng ID (chỉ admin+)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-hashedPassword");

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa user (chỉ superadmin)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId không được để trống" });
    }

    // Không cho xóa superadmin
    const user = await User.findById(userId);
    if (user?.role === "superadmin") {
      return res.status(403).json({ message: "Không thể xóa superadmin" });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User đã được xóa thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa user", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
