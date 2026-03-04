import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "../../hooks/useForm";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { DEPARTMENT_STATUS } from "../../utils/constants";
import {
  FormField,
  SelectField,
  TextAreaField,
} from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";

const DepartmentPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const deptFormFields = {
    name: "",
    description: "",
    status: "active",
  };

  const { formData, handleChange, setMultipleFields, reset } =
    useForm(deptFormFields);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.DEPARTMENTS);
      setDepartments(response.data);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setMultipleFields({
        name: department.name,
        description: department.description || "",
        status: department.status,
      });
    } else {
      setEditingDepartment(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      handleApiError(new Error("Tên phòng ban không được để trống"));
      return;
    }

    try {
      if (editingDepartment) {
        // Cập nhật
        await axiosInstance.put(
          API_PATHS.DEPARTMENT_BY_ID(editingDepartment._id),
          formData,
        );
        handleApiSuccess("Cập nhật phòng ban thành công");
      } else {
        // Tạo
        await axiosInstance.post(API_PATHS.DEPARTMENTS, formData);
        handleApiSuccess("Tạo phòng ban thành công");
      }
      fetchDepartments();
      handleCloseModal();
    } catch (error) {
      handleApiError(error, "Có lỗi xảy ra. Vui lòng thử lại");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng ban "${name}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.DEPARTMENT_BY_ID(id));
      handleApiSuccess("Xóa phòng ban thành công");
      fetchDepartments();
    } catch (error) {
      handleApiError(error, "Không thể xóa phòng ban");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(API_PATHS.DEPARTMENT_TOGGLE_STATUS(id));
      handleApiSuccess("Đã thay đổi trạng thái phòng ban");
      fetchDepartments();
    } catch (error) {
      handleApiError(error, "Không thể thay đổi trạng thái");
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
      {/* Tiêu đề */}
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

      {/* Thống kê */}
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

      {/* Bảng */}
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
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDepartment ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
        maxW="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Tên phòng ban"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên phòng ban"
            required
          />

          <TextAreaField
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả"
          />

          <SelectField
            label="Trạng thái"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={DEPARTMENT_STATUS}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
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
      </Modal>
    </div>
  );
};

export default DepartmentPage;
