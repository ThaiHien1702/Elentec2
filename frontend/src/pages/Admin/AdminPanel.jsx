import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useForm } from "../../hooks/useForm";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { POSITIONS, ROLES } from "../../utils/constants";
import { FormField, SelectField } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const profileFormFields = {
    idCompanny: "",
    displayName: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    role: "user",
    newPassword: "",
  };

  const newUserFields = {
    idCompanny: "",
    password: "",
    email: "",
    displayName: "",
    position: "",
    role: "user",
  };

  const {
    formData: profileFormData,
    handleChange: handleProfileChange,
    setMultipleFields: setProfileFields,
  } = useForm(profileFormFields);
  const {
    formData: newUserData,
    handleChange: handleNewUserChange,
    reset: resetNewUserForm,
  } = useForm(newUserFields);

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
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách users");
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
      setProfileFields({
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
      handleApiError(error, "Không thể tải profile user");
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
      handleApiSuccess("Cập nhật profile user thành công");
      setProfileUser(null);
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể cập nhật profile user");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin()) {
      handleApiError(new Error("Chỉ Admin mới có thể xóa user"));
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.ADMIN_DELETE_USER, {
        data: { userId },
      });
      handleApiSuccess("Đã xóa user thành công");
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể xóa user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!isAdmin()) {
      handleApiError(new Error("Chỉ Admin mới có thể tạo user"));
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.ADMIN_CREATE_USER, newUserData);
      handleApiSuccess("Tạo user thành công");
      setShowCreateModal(false);
      resetNewUserForm();
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể tạo user");
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

      {/* Bảng người dùng */}
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
                    Sửa
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

      {/* Modal chỉnh sửa hồ sơ người dùng */}
      <Modal
        isOpen={!!profileUser}
        onClose={() => setProfileUser(null)}
        title={`Chỉnh sửa profile: ${profileUser?.displayName}`}
        maxW="max-w-lg"
      >
        <form onSubmit={handleUpdateUserProfile} className="space-y-4">
          <FormField
            label="ID"
            name="idCompanny"
            value={profileFormData.idCompanny}
            onChange={handleProfileChange}
            required
          />
          <FormField
            label="Display Name"
            name="displayName"
            value={profileFormData.displayName}
            onChange={handleProfileChange}
            required
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={profileFormData.email}
            onChange={handleProfileChange}
          />
          <FormField
            label="Department"
            name="department"
            value={profileFormData.department}
            onChange={handleProfileChange}
          />
          <FormField
            label="Phone"
            type="tel"
            name="phone"
            value={profileFormData.phone}
            onChange={handleProfileChange}
          />
          <SelectField
            label="Position"
            name="position"
            value={profileFormData.position}
            onChange={handleProfileChange}
            options={POSITIONS}
            empty="Chưa cập nhật"
          />
          <SelectField
            label="Role"
            name="role"
            value={profileFormData.role}
            onChange={handleProfileChange}
            options={ROLES}
            required
          />
          <FormField
            label="Mật khẩu mới"
            type="password"
            name="newPassword"
            value={profileFormData.newPassword}
            onChange={handleProfileChange}
            minLength={6}
            placeholder="Để trống nếu không đổi mật khẩu"
          />

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
      </Modal>

      {/* Modal tạo người dùng */}
      <Modal
        isOpen={showCreateModal && isAdmin()}
        onClose={() => {
          setShowCreateModal(false);
          resetNewUserForm();
        }}
        title="Tạo User Mới"
        maxW="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField
            label="ID"
            name="idCompanny"
            value={newUserData.idCompanny}
            onChange={handleNewUserChange}
            placeholder="Nhập ID"
            required
          />
          <FormField
            label="Display Name"
            name="displayName"
            value={newUserData.displayName}
            onChange={handleNewUserChange}
            placeholder="Nhập tên hiển thị"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={newUserData.password}
            onChange={handleNewUserChange}
            placeholder="Nhập password (tối thiểu 6 ký tự)"
            minLength={6}
            required
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={newUserData.email}
            onChange={handleNewUserChange}
            placeholder="Nhập email (không bắt buộc)"
          />
          <SelectField
            label="Position"
            name="position"
            value={newUserData.position}
            onChange={handleNewUserChange}
            options={POSITIONS}
            empty="Chưa cập nhật"
          />
          <SelectField
            label="Role"
            name="role"
            value={newUserData.role}
            onChange={handleNewUserChange}
            options={ROLES}
            required
          />

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Tạo User
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetNewUserForm();
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
