import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    idCompanny: "",
    displayName: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    role: "user",
    newPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    idCompanny: "",
    password: "",
    email: "",
    displayName: "",
    position: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortUsersByRolePriority = (usersList) => {
    const rolePriority = {
      admin: 0,
      moderator: 1,
      user: 2,
    };

    return [...usersList].sort((firstUser, secondUser) => {
      const firstPriority = rolePriority[firstUser.role] ?? 99;
      const secondPriority = rolePriority[secondUser.role] ?? 99;

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return (firstUser.displayName || "").localeCompare(
        secondUser.displayName || "",
      );
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN_ALL_USERS);
      setUsers(sortUsersByRolePriority(response.data));
    } catch {
      toast.error("Không thể tải danh sách users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileModal = async (userId) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN_USER_BY_ID(userId),
      );
      const user = response.data;
      setProfileUser(user);
      setProfileFormData({
        idCompanny: user.idCompanny || "",
        displayName: user.displayName || "",
        email: user.email || "",
        department: user.department || "",
        position: user.position || "",
        phone: user.phone || "",
        role: user.role || "user",
        newPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể tải profile user",
      );
    }
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    if (!profileUser?._id) return;

    setSavingProfile(true);
    try {
      await axiosInstance.put(
        API_PATHS.ADMIN_UPDATE_USER_BY_ID(profileUser._id),
        profileFormData,
      );
      toast.success("Cập nhật profile user thành công");
      setProfileUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật profile user",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin()) {
      toast.error("Chỉ Admin mới có thể xóa user");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.ADMIN_DELETE_USER, {
        data: { userId },
      });
      toast.success("Đã xóa user thành công");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!isAdmin()) {
      toast.error("Chỉ Admin mới có thể tạo user");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.ADMIN_CREATE_USER, newUserData);
      toast.success("Tạo user thành công");
      setShowCreateModal(false);
      setNewUserData({
        idCompanny: "",
        password: "",
        email: "",
        displayName: "",
        position: "",
        role: "user",
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo user");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Quản lý users và phân quyền</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Tạo User Mới
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Department
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Position
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                Profile
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {user.idCompanny || user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.displayName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.position || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleOpenProfileModal(user._id)}
                    className="px-3 py-1.5 rounded-md bg-blue-400 text-white hover:bg-blue-500 transition-colors"
                  >
                    Xem
                  </button>
                  {isAdmin() && user.role !== "admin" && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-3 py-1.5 rounded-md bg-red-400 text-white hover:bg-red-500 transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Profile Modal */}
      {profileUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              Chỉnh sửa profile: {profileUser.displayName}
            </h3>
            <form onSubmit={handleUpdateUserProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  value={profileFormData.idCompanny}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      idCompanny: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileFormData.displayName}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      displayName: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={profileFormData.department}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={profileFormData.position}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      position: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileFormData.phone}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={profileFormData.role}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={profileFormData.newPassword}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      newPassword: e.target.value,
                    })
                  }
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Để trống nếu không đổi mật khẩu"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? "Đang lưu..." : "Lưu profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileUser(null)}
                  disabled={savingProfile}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && isAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Tạo User Mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <input
                  type="text"
                  value={newUserData.idCompanny}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      idCompanny: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newUserData.displayName}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      displayName: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên hiển thị"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập password (tối thiểu 6 ký tự)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={newUserData.position}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, position: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập chức vụ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Tạo User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUserData({
                      idCompanny: "",
                      password: "",
                      email: "",
                      displayName: "",
                      position: "",
                      role: "user",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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

export default AdminPanel;
