// Các tùy chọn vị trí
export const POSITIONS = [
  "Manager",
  "Assistant Manager",
  "Supervisor",
  "Staff",
];

// Các tùy chọn vai trò
export const ROLES = ["admin", "moderator", "user"];

// Các loại máy tính
export const COMPUTER_TYPES = ["Desktop", "Laptop", "Workstation", "Server"];

// Trạng thái máy tính
export const COMPUTER_STATUS = ["active", "inactive", "maintenance"];

// Trạng thái phòng ban
export const DEPARTMENT_STATUS = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Vô hiệu hóa" },
];

// Các lớp CSS biểu mẫu
export const FORM_CLASSES = {
  input:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  select:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
  label: "block text-sm font-medium text-gray-700 mb-1",
  button: {
    primary:
      "px-3 py-1.5 rounded-md bg-blue-400 text-white hover:bg-blue-500 transition-colors",
    danger:
      "px-3 py-1.5 rounded-md bg-red-400 text-white hover:bg-red-500 transition-colors",
    success:
      "px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors",
  },
};
