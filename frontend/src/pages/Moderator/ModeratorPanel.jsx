import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { handleApiError } from "../../utils/apiHandler";
import { ROLES } from "../../utils/constants";
import { SelectField } from "../../components/ui/FormField";

const ModeratorPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let response;
        if (filterRole === "all") {
          response = await axiosInstance.get(API_PATHS.MODERATOR_USERS);
        } else {
          response = await axiosInstance.get(
            API_PATHS.MODERATOR_USERS_BY_ROLE(filterRole),
          );
        }
        setUsers(sortUsersByRolePriority(response.data));
      } catch (error) {
        handleApiError(error, "Không thể tải danh sách users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Moderator Panel</h1>
        <p className="text-gray-600 mt-2">Xem danh sách users</p>
      </div>

      {/* Bộ lọc */}
      <div className="mb-4">
        <SelectField
          label="Lọc theo role"
          name="filterRole"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          options={[
            { value: "all", label: "Tất cả" },
            ...ROLES.map((role) => ({
              value: role.toLowerCase(),
              label: role,
            })),
          ]}
        />
      </div>

      {/* Bảng người dùng */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Không có users nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                        user.role,
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Thống kê */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Tổng Users</div>
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-sm text-purple-600">Moderators</div>
          <div className="text-2xl font-bold text-purple-800">
            {users.filter((u) => u.role === "moderator").length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-sm text-red-600">Admins</div>
          <div className="text-2xl font-bold text-red-800">
            {users.filter((u) => u.role === "admin").length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorPanel;
