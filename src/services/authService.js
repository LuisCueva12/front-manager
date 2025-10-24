// src/services/authService.js
import api, { setAuthToken, clearAuth } from './api'
import { useAuthStore } from '@/stores/auth'

/* ==========================
   Normalizadores defensivos
   ========================== */
function pickToken(payload) {
  return (
    payload?.token ??
    payload?.access_token ??
    payload?.data?.token ??
    payload?.data?.access_token ??
    null
  )
}

function pickUser(payload) {
  return (
    payload?.user ??
    payload?.usuario ??
    payload?.data?.user ??
    (payload && typeof payload === 'object' && !payload.token && !payload.access_token ? payload : null)
  )
}

/* ==========================
   Helpers
   ========================== */
function env(key) {
  return (typeof import.meta !== 'undefined' && import.meta.env?.[key]) ||
         (typeof process !== 'undefined' && process.env?.[key]) ||
         ''
}

/**
 * Intenta en orden los pares método+endpoint hasta que una variante funcione.
 */
async function adaptiveRequest({ methods, endpoints, body }) {
  let lastErr = null
  for (const m of methods) {
    for (const ep of endpoints) {
      try {
        if (m === 'get') {
          const { data } = await api.get(ep, { params: body })
          return { ok: true, method: m, endpoint: ep, data }
        } else {
          const { data } = await api.post(ep, body)
          return { ok: true, method: m, endpoint: ep, data }
        }
      } catch (e) {
        lastErr = e
        const st = e?.response?.status
        // Si es 404/405 probamos la siguiente variante; otros códigos también los dejamos continuar
        continue
      }
    }
  }
  const msg =
    lastErr?.response?.data?.message ||
    lastErr?.response?.data?.error ||
    lastErr?.message ||
    'Solicitud no procesada.'
  const err = new Error(msg)
  err.cause = lastErr
  throw err
}

/* ==========================
   API pública del servicio
   ========================== */

/** Login */
export async function login(creds) {
  const body = {
    correo: creds.correo ?? creds.email ?? creds.username ?? creds.usuario ?? '',
    password: creds.password,
  }
  const { data } = await api.post('/login', body)
  const token = pickToken(data)
  const user  = pickUser(data)
  if (!token) throw new Error(data?.message || data?.error || 'Credenciales inválidas')

  setAuthToken(token)

  const auth = useAuthStore()
  if (typeof auth.setSession === 'function') {
    auth.setSession({ user, token })
  } else {
    if (typeof auth.setUser === 'function') auth.setUser(user)
    if ('token' in auth) auth.token = token
  }
  return { user, token }
}

/** Perfil */
export async function fetchProfile() {
  const { data } = await api.get('/profile')
  const user = pickUser(data)
  const auth = useAuthStore()

  if (typeof auth.setSession === 'function') {
    const token = auth.token ?? null
    auth.setSession({ user, token })
  } else if (typeof auth.setUser === 'function') {
    auth.setUser(user)
  }
  return user
}

/** Logout */
export async function logout() {
  try { await api.post('/logout') } catch {}
  const auth = useAuthStore()
  if (typeof auth.logout === 'function') await auth.logout()
  else if (typeof auth.reset === 'function') auth.reset()
  else {
    if ('user' in auth) auth.user = null
    if ('role' in auth) auth.role = null
    if ('permissions' in auth) auth.permissions = []
    if ('token' in auth) auth.token = null
  }
  clearAuth()
}

/** Registro público */
export async function register(userData) {
  const body = {
    nombre: userData.nombre || userData.name,
    correo: userData.correo || userData.email,
    password: userData.password,
  }
  
  try {
    // Intenta endpoint público de registro
    const { data } = await api.post('/register', body)
    return { success: true, data }
  } catch (error) {
    // Si no existe /register, intenta con /usuarios (requiere permisos)
    if (error.response?.status === 404) {
      try {
        const { data } = await api.post('/usuarios', {
          ...body,
          rol_id: 2, // Asume rol de Usuario por defecto
          estado: 'activo'
        })
        return { success: true, data }
      } catch (fallbackError) {
        throw fallbackError
      }
    }
    throw error
  }
}

/* ==========================
   Recuperación de contraseña
   ========================== */

/**
 * Envía el correo de recuperación.
 * RUTA PRINCIPAL: POST /password/forgot
 * FALLBACK: GET /password/forgot?email=...
 * Overrides opcionales por .env: VITE_AUTH_FORGOT_ENDPOINT / VITE_APP_FORGOT_ENDPOINT
 */
export async function requestPasswordReset(email) {
  const override = env('VITE_AUTH_FORGOT_ENDPOINT') || env('VITE_APP_FORGOT_ENDPOINT')
  const body = { email, correo: email }

  // Prioriza TU backend actual
  const endpoints = [
    ...(override ? [override] : []),
    '/password/forgot',   // <— Laravel recomendado (agregado en tus rutas)
  ]

  // Intenta POST y si tu hosting devuelve 405/404, prueba GET
  return adaptiveRequest({
    methods: ['post', 'get'],
    endpoints,
    body
  })
}

/**
 * Restablece la contraseña con el token del correo.
 * RUTA: POST /password/reset
 * Campos esperados por Laravel:
 *  - token, email, password, password_confirmation
 * Overrides opcionales por .env: VITE_AUTH_RESET_ENDPOINT / VITE_APP_RESET_ENDPOINT
 */
export async function resetPassword({ token, code, email, password, password_confirmation }) {
  const pwConfirm = password_confirmation ?? password
  const theToken = token || code

  const body = {
    token: theToken,
    email,
    password,
    password_confirmation: pwConfirm,
  }

  const override = env('VITE_AUTH_RESET_ENDPOINT') || env('VITE_APP_RESET_ENDPOINT')

  const endpoints = [
    ...(override ? [override] : []),
    '/password/reset',     // <— Laravel recomendado (agregado en tus rutas)
  ]

  return adaptiveRequest({
    methods: ['post'],
    endpoints,
    body
  })
}
