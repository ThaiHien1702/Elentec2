import jwt from "jsonwebtoken";

// Middleware kiểm tra user đã login
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Middleware chỉ cho phép moderator trở lên
export const isModerator = (req, res, next) => {
  const allowedRoles = ["moderator", "admin"];
  if (!allowedRoles.includes(req.userRole)) {
    return res
      .status(403)
      .json({ message: "Chỉ moderator trở lên mới có quyền truy cập" });
  }
  next();
};

// Middleware chỉ cho phép admin
export const isAdmin = (req, res, next) => {
  const allowedRoles = ["admin"];
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};
