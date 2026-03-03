import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from "../controllers/departmentController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public/Protected routes - Mọi user đã login đều xem được
router.get("/", verifyToken, getAllDepartments);
router.get("/:id", verifyToken, getDepartmentById);

// Admin routes - Chỉ admin trở lên mới được tạo/sửa/xóa
router.post("/", verifyToken, isAdmin, createDepartment);
router.put("/:id", verifyToken, isAdmin, updateDepartment);
router.delete("/:id", verifyToken, isAdmin, deleteDepartment);
router.patch(
  "/:id/toggle-status",
  verifyToken,
  isAdmin,
  toggleDepartmentStatus,
);

export default router;
