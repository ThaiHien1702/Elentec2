const normalizeBaseUrl = (value) => value?.trim().replace(/\/$/, "");

// Priority: explicit env var > Vite dev proxy > auto-detect current host.
export const getApiBaseUrl = () => {
  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Trong dev mode, Vite proxy /api -> backend nên dùng relative path.
  // Điều này giúp HTTPS dev server giao tiếp đúng với backend HTTP.
  if (import.meta.env.DEV) {
    return "/api";
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const host = window.location.hostname || "localhost";
    return `${protocol}://${host}:5001/api`;
  }

  return "http://localhost:5001/api";
};

export default getApiBaseUrl;
