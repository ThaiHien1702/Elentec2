const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const API_PATHS = {
  // Auth endpoints
  SIGNIN: `${BASE_URL}/auth/signin`,
  SIGNOUT: `${BASE_URL}/auth/signout`,

  // Profile endpoints
  GET_PROFILE: `${BASE_URL}/auth/profile`,
  UPDATE_PROFILE: `${BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,

  // Moderator endpoints
  MODERATOR_USERS: `${BASE_URL}/auth/moderator/users`,
  MODERATOR_USER_BY_ID: (userId) => `${BASE_URL}/auth/moderator/users/${userId}`,
  MODERATOR_USERS_BY_ROLE: (role) => `${BASE_URL}/auth/moderator/users/role/${role}`,

  // Admin endpoints
  ADMIN_ASSIGN_ROLE: `${BASE_URL}/auth/admin/assign-role`,
  ADMIN_REMOVE_ROLE: `${BASE_URL}/auth/admin/remove-role`,
  ADMIN_ALL_USERS: `${BASE_URL}/auth/admin/all-users`,
  ADMIN_USER_BY_ID: (userId) => `${BASE_URL}/auth/admin/users/${userId}`,
  ADMIN_USERS_BY_ROLE: (role) => `${BASE_URL}/auth/admin/users/role/${role}`,

  // SuperAdmin endpoints
  SUPERADMIN_CREATE_USER: `${BASE_URL}/auth/superadmin/create-user`,
  SUPERADMIN_DELETE_USER: `${BASE_URL}/auth/superadmin/delete-user`,
  SUPERADMIN_ASSIGN_ROLE: `${BASE_URL}/auth/superadmin/assign-role`,
  SUPERADMIN_REMOVE_ROLE: `${BASE_URL}/auth/superadmin/remove-role`,

  // Department endpoints
  DEPARTMENTS: `${BASE_URL}/departments`,
  DEPARTMENT_BY_ID: (id) => `${BASE_URL}/departments/${id}`,
  DEPARTMENT_TOGGLE_STATUS: (id) => `${BASE_URL}/departments/${id}/toggle-status`,
};

export default API_PATHS;
