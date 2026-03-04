import { useRef, useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, Upload, Download } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";

const ComputerManagement = () => {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    employeeNo: "",
    email: "",
    phone: "",
    userName: "",
    position: "",
    department: "",
    ipAddress: "",
    macAddress: "",
    computerName: "",
    userNamePc: "",
    categories: "Laptop",
    manufacturer: "",
    serviceTag: "",
    systemModel: "",
    cpu: "",
    ram: "",
    hdd: "",
    ssd: "",
    vga: "",
    other: "",
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    fetchComputers();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter, statusFilter]);

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_WITH_FILTERS(departmentFilter, statusFilter),
      );
      setComputers(response.data);
    } catch {
      toast.error("Không thể tải danh sách máy tính");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DEPARTMENTS);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchComputers();
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_SEARCH(searchTerm),
      );
      setComputers(response.data);
    } catch {
      toast.error("Lỗi khi tìm kiếm");
    }
  };

  const handleOpenModal = (computer = null) => {
    if (computer) {
      setEditingComputer(computer);
      setFormData(computer);
    } else {
      setEditingComputer(null);
      setFormData({
        employeeNo: "",
        email: "",
        phone: "",
        userName: "",
        position: "",
        department: "",
        ipAddress: "",
        macAddress: "",
        computerName: "",
        userNamePc: "",
        categories: "Laptop",
        manufacturer: "",
        serviceTag: "",
        systemModel: "",
        cpu: "",
        ram: "",
        hdd: "",
        ssd: "",
        vga: "",
        other: "",
        status: "Active",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingComputer) {
        await axiosInstance.put(
          API_PATHS.COMPUTER_BY_ID(editingComputer._id),
          formData,
        );
        toast.success("Cập nhật thông tin máy tính thành công");
      } else {
        await axiosInstance.post(API_PATHS.COMPUTERS, formData);
        toast.success("Tạo thông tin máy tính thành công");
      }
      setShowModal(false);
      fetchComputers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi lưu thông tin máy tính",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa máy tính này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.COMPUTER_BY_ID(id));
      toast.success("Xóa máy tính thành công");
      fetchComputers();
    } catch {
      toast.error("Lỗi khi xóa máy tính");
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_EXPORT(departmentFilter, statusFilter),
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const date = new Date().toISOString().slice(0, 10);
      anchor.download = `computers-${date}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export Excel thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi export Excel");
    }
  };

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COMPUTERS_TEMPLATE, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const date = new Date().toISOString().slice(0, 10);
      anchor.download = `computers-template-${date}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Tải file mẫu Excel thành công");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi tải file mẫu Excel",
      );
    }
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportExcel = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "xlsx" && extension !== "xls") {
      toast.error("Chỉ hỗ trợ file Excel .xlsx hoặc .xls");
      event.target.value = "";
      return;
    }

    try {
      const formDataFile = new FormData();
      formDataFile.append("file", selectedFile);

      const response = await axiosInstance.post(
        API_PATHS.COMPUTERS_IMPORT,
        formDataFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const result = response.data?.result;
      if (result) {
        toast.success(
          `Import xong: thêm ${result.createdCount}, cập nhật ${result.updatedCount}, bỏ qua ${result.skippedCount}`,
        );
      } else {
        toast.success("Import Excel thành công");
      }

      await fetchComputers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi import Excel");
    } finally {
      event.target.value = "";
    }
  };

  const filteredComputers = computers.filter((computer) =>
    [
      computer.employeeNo,
      computer.computerName,
      computer.email,
      computer.ipAddress,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Máy Tính</h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin máy tính theo bộ phận
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm theo nhân viên, máy tính, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Tìm
            </button>
          </form>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả bộ phận</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.name} value={dept.name || dept}>
                {dept.name || dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Under Maintenance">Bảo hành</option>
            <option value="Retired">Ngừng sử dụng</option>
          </select>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Máy
          </button>

          <button
            onClick={triggerImportFile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplateExcel}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tải mẫu Excel
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Nhân viên
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Bộ phận
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Máy tính
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredComputers.map((computer) => (
                <tr key={computer._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {computer.employeeNo}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {computer.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {computer.department}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {computer.computerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {computer.ipAddress || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        computer.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : computer.status === "Inactive"
                            ? "bg-gray-100 text-gray-800"
                            : computer.status === "Under Maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {computer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleOpenModal(computer)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(computer._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredComputers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy máy tính nào
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingComputer ? "Cập nhật Máy Tính" : "Thêm Máy Tính Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Row 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số nhân viên *
                  </label>
                  <input
                    type="text"
                    name="employeeNo"
                    value={formData.employeeNo}
                    onChange={handleChangeForm}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChangeForm}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên nhân viên *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChangeForm}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bộ phận *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChangeForm}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 4 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    name="macAddress"
                    value={formData.macAddress}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 5 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên máy tính *
                  </label>
                  <input
                    type="text"
                    name="computerName"
                    value={formData.computerName}
                    onChange={handleChangeForm}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên user PC
                  </label>
                  <input
                    type="text"
                    name="userNamePc"
                    value={formData.userNamePc}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 6 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại
                  </label>
                  <select
                    name="categories"
                    value={formData.categories}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Workstation">Workstation</option>
                    <option value="Server">Server</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhà sản xuất
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 7 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Tag / Serial
                  </label>
                  <input
                    type="text"
                    name="serviceTag"
                    value={formData.serviceTag}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    name="systemModel"
                    value={formData.systemModel}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 8 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPU
                  </label>
                  <input
                    type="text"
                    name="cpu"
                    value={formData.cpu}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RAM
                  </label>
                  <input
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 9 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HDD
                  </label>
                  <input
                    type="text"
                    name="hdd"
                    value={formData.hdd}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SSD
                  </label>
                  <input
                    type="text"
                    name="ssd"
                    value={formData.ssd}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Row 10 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VGA
                  </label>
                  <input
                    type="text"
                    name="vga"
                    value={formData.vga}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChangeForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Không hoạt động</option>
                    <option value="Under Maintenance">Bảo hành</option>
                    <option value="Retired">Ngừng sử dụng</option>
                  </select>
                </div>
              </div>

              {/* Full width fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khác
                </label>
                <input
                  type="text"
                  name="other"
                  value={formData.other}
                  onChange={handleChangeForm}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChangeForm}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingComputer ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

export default ComputerManagement;
