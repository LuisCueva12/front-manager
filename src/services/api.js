// src/services/api.js
import axios from "axios"

/**
 * BASE_URL priority:
 * 1) window.__API_BASE_URL__ (runtime override)
 * 2) import.meta.env.VITE_API_BASE_URL | VITE_APP_API_URL (Vite)
 * 3) process.env.VITE_API_BASE_URL | VITE_APP_API_URL (fallback)
 * 4) http://127.0.0.1:8000/api (default local)
 */
const runtimeOverride =
  typeof window !== "undefined" ? window.__API_BASE_URL__ : undefined

const envVite =
  typeof import.meta !== "undefined"
    ? (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_APP_API_URL)
    : undefined

const envNode =
  typeof process !== "undefined"
    ? (process.env?.VITE_API_BASE_URL || process.env?.VITE_APP_API_URL)
    : undefined

const rawBase = runtimeOverride || envVite || envNode || "http://127.0.0.1:8000/api"
const API_BASE_URL = String(rawBase).replace(/\/+$/, "")

// Cookies (si usas Sanctum por cookies)
const withCredsRaw =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_WITH_CREDENTIALS) ||
  (typeof process !== "undefined" && process.env?.VITE_API_WITH_CREDENTIALS) ||
  ""
const WITH_CREDENTIALS = /^(true|1|yes)$/i.test(String(withCredsRaw))

/* ============================
   Claves y helpers de Auth
   ============================ */
const TOKEN_KEY = "auth:token" // clave canónica

export function getAuthToken() {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem("token") ||           // compat
      sessionStorage.getItem("token") || null
    )
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      // compat:
      localStorage.setItem("token", token)
      // setea header default para TODAS las requests desde ya
      api.defaults.headers.common.Authorization = /^Bearer\s/i.test(token)
        ? token
        : `Bearer ${token}`
    }
  } catch {}
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("token")
    localStorage.removeItem("auth:user")
    localStorage.removeItem("auth")
    sessionStorage.removeItem("token")
    // MUY IMPORTANTE: quitar el header global
    delete api.defaults.headers.common.Authorization
  } catch {}
}

/* ============================
   Cliente Axios
   ============================ */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: WITH_CREDENTIALS,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  paramsSerializer: { indexes: false }, // ?dias=lu&dias=ma
})

const isFormData = (v) =>
  typeof FormData !== "undefined" && v instanceof FormData

/* ============================
   Interceptors
   ============================ */
api.interceptors.request.use(
  (config) => {
    // Asegura Authorization en cada request (por si recargaste la página)
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = /^Bearer\s/i.test(token)
        ? token
        : `Bearer ${token}`
    }

    // Idioma por defecto
    config.headers.Accept = "application/json"
    if (!config.headers["Accept-Language"]) {
      config.headers["Accept-Language"] = "es"
    }

    // Content-Type: respeta FormData
    if (isFormData(config.data)) {
      delete config.headers["Content-Type"]
      delete config.headers["content-type"]
    } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json"
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    // Sin respuesta (red/CORS)
    if (!error.response) {
      const netErr = new Error("No hay conexión con el servidor o CORS bloqueado.")
      netErr.response = { status: 0, data: { message: "Network Error" } }
      return Promise.reject(netErr)
    }

    // 401 / 419 → sesión inválida o expirada
    if (status === 401 || status === 419) {
      // solo limpiamos credenciales; el guard del router hará la redirección
      clearAuth()
    }

    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
