import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Building2,
  Phone,
  Shield,
  Key,
  Edit2,
  Save,
  X,
  Calendar,
  CheckCircle,
} from "lucide-react";

const ProfilePage = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    displayName: "",
    department: "",
    phone: "",
    avatrUrl: "",
    role: "",
    createdAt: "",
  });

  const [editFormData, setEditFormData] = useState({
    displayName: "",
    email: "",
    department: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.GET_PROFILE);
      setProfileData(response.data);
      setEditFormData({
        displayName: response.data.displayName,
        email: response.data.email,
        department: response.data.department || "",
        phone: response.data.phone || "",
      });
    } catch {
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      displayName: profileData.displayName,
      email: profileData.email,
      department: profileData.department || "",
      phone: profileData.phone || "",
    });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({
      displayName: profileData.displayName,
      email: profileData.email,
      department: profileData.department || "",
      phone: profileData.phone || "",
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put(API_PATHS.UPDATE_PROFILE, editFormData);
      toast.success("Cập nhật profile thành công");
      await fetchProfile();
      setIsEditMode(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Đổi password thành công");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể đổi password");
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "superadmin":
        return "bg-linear-to-r from-red-500 to-red-600 text-white";
      case "admin":
        return "bg-linear-to-r from-purple-500 to-purple-600 text-white";
      case "moderator":
        return "bg-linear-to-r from-blue-500 to-blue-600 text-white";
      default:
        return "bg-linear-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý và cập nhật thông tin profile của bạn
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover & Avatar Section */}
          <div className="relative">
            <div className="h-32 bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
                {!isEditMode && (
                  <button
                    onClick={handleEditClick}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-8">
            {/* Name and Role */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {profileData.displayName}
                </h2>
                <p className="text-gray-500 text-sm mb-3">
                  @{profileData.username}
                </p>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md ${getRoleBadgeColor()}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {profileData.role?.toUpperCase()}
                </span>
              </div>
              {!isEditMode && (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </button>
              )}
            </div>

            {/* View Mode */}
            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Số điện thoại</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.phone || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Department */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>Phòng ban</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.department || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Created Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Ngày tạo tài khoản</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {formatDate(profileData.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {isEditMode && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Tên hiển thị *
                    </label>
                    <input
                      type="text"
                      value={editFormData.displayName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          displayName: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên hiển thị"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Phòng ban
                    </label>
                    <input
                      type="text"
                      value={editFormData.department}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập phòng ban"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info Cards */}
        {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Trạng thái tài khoản
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Hoạt động
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quyền truy cập</span>
                  <span className="text-gray-800 font-medium capitalize">
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Bảo mật
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">Thay đổi mật khẩu</span>
                  <Key className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Đổi mật khẩu
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md font-medium"
                >
                  Đổi mật khẩu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
