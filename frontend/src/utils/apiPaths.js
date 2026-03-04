const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const API_PATHS = {
  // Auth endpoints
  SIGNUP: `${BASE_URL}/auth/signup`,
  SIGNIN: `${BASE_URL}/auth/signin`,
  SIGNOUT: `${BASE_URL}/auth/signout`,

  // Profile endpoints
  GET_PROFILE: `${BASE_URL}/auth/profile`,
  UPDATE_PROFILE: `${BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,

  // Moderator endpoints
  MODERATOR_USERS: `${BASE_URL}/auth/moderator/users`,
  MODERATOR_USER_BY_ID: (userId) =>
    `${BASE_URL}/auth/moderator/users/${userId}`,
  MODERATOR_USERS_BY_ROLE: (role) =>
    `${BASE_URL}/auth/moderator/users/role/${role}`,

  // Admin endpoints
  ADMIN_ASSIGN_ROLE: `${BASE_URL}/auth/admin/assign-role`,
  ADMIN_REMOVE_ROLE: `${BASE_URL}/auth/admin/remove-role`,
  ADMIN_CREATE_USER: `${BASE_URL}/auth/admin/create-user`,
  ADMIN_DELETE_USER: `${BASE_URL}/auth/admin/delete-user`,
  ADMIN_ALL_USERS: `${BASE_URL}/auth/admin/all-users`,
  ADMIN_USER_BY_ID: (userId) => `${BASE_URL}/auth/admin/users/${userId}`,
  ADMIN_UPDATE_USER_BY_ID: (userId) => `${BASE_URL}/auth/admin/users/${userId}`,
  ADMIN_USERS_BY_ROLE: (role) => `${BASE_URL}/auth/admin/users/role/${role}`,

  // Department endpoints
  DEPARTMENTS: `${BASE_URL}/departments`,
  DEPARTMENT_BY_ID: (id) => `${BASE_URL}/departments/${id}`,
  DEPARTMENT_TOGGLE_STATUS: (id) =>
    `${BASE_URL}/departments/${id}/toggle-status`,

  // Computer management endpoints
  COMPUTERS: `${BASE_URL}/computers`,
  COMPUTER_BY_ID: (id) => `${BASE_URL}/computers/${id}`,
  COMPUTERS_SEARCH: (keyword) => `${BASE_URL}/computers/search?q=${keyword}`,
  COMPUTERS_IMPORT: `${BASE_URL}/computers/import`,
  COMPUTERS_TEMPLATE: `${BASE_URL}/computers/template`,
  COMPUTERS_EXPORT: (department, status) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (status) params.append("status", status);

    const query = params.toString();
    return query
      ? `${BASE_URL}/computers/export?${query}`
      : `${BASE_URL}/computers/export`;
  },
  COMPUTERS_WITH_FILTERS: (department, status) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (status) params.append("status", status);

    const query = params.toString();
    return query ? `${BASE_URL}/computers?${query}` : `${BASE_URL}/computers`;
  },
};

export default API_PATHS;
