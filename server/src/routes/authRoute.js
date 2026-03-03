import express from "express";
import { signUp, signIn, signOut } from "../controllers/authController.js";
import {
  assignRole,
  removeRole,
  getAllUsers,
  getUsersByRole,
  getUserById,
  deleteUser,
} from "../controllers/adminController.js";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/profileController.js";
import { verifyToken, isModerator, isAdmin, isSuperAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

//Public routes
router.post("/signin", signIn);

//Protected routes
router.post("/signout", verifyToken, signOut);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword);

//Moderator routes (moderator, admin, superadmin)
router.get("/moderator/users", verifyToken, isModerator, getAllUsers);
router.get("/moderator/users/:userId", verifyToken, isModerator, getUserById);
router.get("/moderator/users/role/:role", verifyToken, isModerator, getUsersByRole);

//Admin routes (admin, superadmin)
router.post("/admin/assign-role", verifyToken, isAdmin, assignRole);
router.post("/admin/remove-role", verifyToken, isAdmin, removeRole);
router.get("/admin/all-users", verifyToken, isAdmin, getAllUsers);
router.get("/admin/users/:userId", verifyToken, isAdmin, getUserById);
router.get("/admin/users/role/:role", verifyToken, isAdmin, getUsersByRole);

//SuperAdmin routes (superadmin only)
router.post("/superadmin/create-user", verifyToken, isSuperAdmin, signUp);
router.delete("/superadmin/delete-user", verifyToken, isSuperAdmin, deleteUser);
router.post("/superadmin/assign-role", verifyToken, isSuperAdmin, assignRole);
router.post("/superadmin/remove-role", verifyToken, isSuperAdmin, removeRole);

export default router;
