import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const DepartmentPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.DEPARTMENTS);
      setDepartments(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách phòng ban");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || "",
        status: department.status,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tên phòng ban không được để trống");
      return;
    }

    try {
      if (editingDepartment) {
        // Update
        await axiosInstance.put(
          API_PATHS.DEPARTMENT_BY_ID(editingDepartment._id),
          formData,
        );
        toast.success("Cập nhật phòng ban thành công");
      } else {
        // Create
        await axiosInstance.post(API_PATHS.DEPARTMENTS, formData);
        toast.success("Tạo phòng ban thành công");
      }
      fetchDepartments();
      handleCloseModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại",
      );
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng ban "${name}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.DEPARTMENT_BY_ID(id));
      toast.success("Xóa phòng ban thành công");
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa phòng ban");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(API_PATHS.DEPARTMENT_TOGGLE_STATUS(id));
      toast.success("Đã thay đổi trạng thái phòng ban");
      fetchDepartments();
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Phòng Ban
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý các phòng ban trong hệ thống
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Thêm phòng ban
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Tổng phòng ban</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {departments.length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {departments.filter((d) => d.status === "active").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Vô hiệu hóa</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {departments.filter((d) => d.status === "inactive").length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên phòng ban
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Chưa có phòng ban nào
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {dept.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {dept.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        dept.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dept.status === "active" ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(dept._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title={
                            dept.status === "active"
                              ? "Vô hiệu hóa"
                              : "Kích hoạt"
                          }
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id, dept.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDepartment ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phòng ban <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên phòng ban"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mô tả"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDepartment ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
