import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    email: "",
    displayName: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN_ALL_USERS);
      setUsers(response.data);
    } catch {
      toast.error("Không thể tải danh sách users");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      const endpoint = isSuperAdmin()
        ? API_PATHS.SUPERADMIN_ASSIGN_ROLE
        : API_PATHS.ADMIN_ASSIGN_ROLE;

      await axiosInstance.post(endpoint, { userId, role });
      toast.success(`Đã gán role ${role} thành công`);
      fetchUsers();
      setSelectedUser(null);
      setNewRole("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gán role");
    }
  };

  const handleRemoveRole = async (userId) => {
    try {
      const endpoint = isSuperAdmin()
        ? API_PATHS.SUPERADMIN_REMOVE_ROLE
        : API_PATHS.ADMIN_REMOVE_ROLE;

      await axiosInstance.post(endpoint, { userId });
      toast.success("Đã xóa role thành công");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperAdmin()) {
      toast.error("Chỉ SuperAdmin mới có thể xóa user");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.SUPERADMIN_DELETE_USER, {
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

    if (!isSuperAdmin()) {
      toast.error("Chỉ SuperAdmin mới có thể tạo user");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.SUPERADMIN_CREATE_USER, newUserData);
      toast.success("Tạo user thành công");
      setShowCreateModal(false);
      setNewUserData({
        username: "",
        password: "",
        email: "",
        displayName: "",
        role: "user",
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo user");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800";
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
        {isSuperAdmin() && (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
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
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Chỉnh sửa
                  </button>
                  {isAdmin() && (
                    <button
                      onClick={() => handleRemoveRole(user._id)}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Reset Role
                    </button>
                  )}
                  {isSuperAdmin() && user.role !== "superadmin" && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              Chỉnh sửa role cho {selectedUser.displayName}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn role mới
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                {isSuperAdmin() && (
                  <option value="superadmin">SuperAdmin</option>
                )}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAssignRole(selectedUser._id, newRole)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && isSuperAdmin() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Tạo User Mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, username: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập username"
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email"
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
                  Role
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
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
                      username: "",
                      password: "",
                      email: "",
                      displayName: "",
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
