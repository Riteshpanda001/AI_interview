/**
 * Centralized API configuration forPrepNova AI Frontend
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${import.meta.env.VITE_WS_HOST || "localhost:8000"}`;

export const getApiEndpoint = (path) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
