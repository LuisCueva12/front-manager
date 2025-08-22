// src/services/api.js
import axios from "axios";

/**
 * Resolución de BASE_URL:
 * 1) window.__API_BASE_URL__ (permite override en runtime)
 * 2) import.meta.env.VITE_API_BASE_URL | VITE_APP_API_URL (Vite)
 * 3) process.env.VITE_API_BASE_URL | VITE_APP_API_URL (fallback)
 * 4) http://127.0.0.1:8000/api (default local)
 */
const runtimeOverride =
  typeof window !== "undefined" ? window.__API_BASE_URL__ : undefined;

const envVite =
  typeof import.meta !== "undefined"
    ? (import.meta.env?.VITE_API_BASE_URL ||
       import.meta.env?.VITE_APP_API_URL)
    : undefined;

const envNode =
  typeof process !== "undefined"
    ? (process.env?.VITE_API_BASE_URL ||
       process.env?.VITE_APP_API_URL)
    : undefined;

const rawBase =
  runtimeOverride || envVite || envNode || "http://127.0.0.1:8000/api";

// Quita "/" extra al final y normaliza
const cleanBaseUrl = String(rawBase).replace(/\/+$/, "");

// Permite activar cookies si cambias a Sanctum por cookies.
// En .env del front: VITE_API_WITH_CREDENTIALS=true
const withCredsRaw =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_WITH_CREDENTIALS) ||
  (typeof process !== "undefined" && process.env?.VITE_API_WITH_CREDENTIALS) ||
  "";
const WITH_CREDENTIALS = /^(true|1|yes)$/i.test(String(withCredsRaw));

const api = axios.create({
  baseURL: cleanBaseUrl,
  timeout: 20000,
  withCredentials: WITH_CREDENTIALS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // Evita índices en arrays (?dias=lun&dias=mar en lugar de dias[0]=lun)
  paramsSerializer: { indexes: false },
});

// ---------- Helpers de auth ----------
export const getAuthToken = () => {
  try {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem("token", token);
  } catch {}
};

export const clearAuth = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    sessionStorage.removeItem("token");
  } catch {}
};

// ---------- Interceptors ----------
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      const hasBearer = /^Bearer\s/i.test(token);
      config.headers.Authorization = hasBearer ? token : `Bearer ${token}`;
    }
    // Asegura Accept (por si algún request lo sobreescribe)
    config.headers.Accept = "application/json";

    // Puedes enviar zona horaria/idioma si lo necesitas en el backend
    if (!config.headers["Accept-Language"]) {
      config.headers["Accept-Language"] = "es";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Error de red / CORS: no hay response
    if (!error.response) {
      const netErr = new Error("No hay conexión con el servidor o CORS bloqueado.");
      netErr.response = { status: 0, data: { message: "Network Error" } };
      return Promise.reject(netErr);
    }

    // Sesión expirada / no autenticado
    if (status === 401 || status === 419) {
      clearAuth();
      if (typeof window !== "undefined") {
        const isLogin = window.location.pathname.includes("/login");
        if (!isLogin) {
          // Redirige conservando a dónde volver
          const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?redirect=${redirectTo}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export const API_BASE_URL = cleanBaseUrl;
