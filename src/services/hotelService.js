// src/services/hotelService.js
import api from './api'

// ---------------- Helpers ----------------
const normEstado = (v) => {
  if (v === undefined || v === null || v === '') return undefined
  if (v === 'mantenimiento') return 'mantenimiento'
  const on = ['activo', '1', 1, true, 'Activo']
  return on.includes(v) ? 'activo' : 'inactivo'
}

// número robusto (acepta "10,000.50", etc.)
const num = (v) => {
  if (v === '' || v === null || v === undefined) return 0
  const n = Number(String(v).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

// Busca un precio dentro de objetos/arrays hasta cierta profundidad
const pickPrice = (o, depth = 0) => {
  if (!o || typeof o !== 'object' || depth > 3) return 0

  // 1) claves directas más comunes
  const direct = [
    'tarifa','precio_base','tarifa_base','precio_habitacion','precio_habitacion_base',
    'precio_base_habitacion','precio_base_hotel','precio_noche','precio_por_persona',
    'precio','monto'
  ]
  for (const k of direct) {
    if (k in o) {
      const v = num(o[k])
      if (v > 0) return v
    }
  }

  // 2) nombres que sugieren precio/tarifa
  for (const [k, v] of Object.entries(o)) {
    if (typeof v !== 'object') continue
    if (/(precio|tarifa|monto|cost|rate|amount)/i.test(k)) {
      const candidate = Array.isArray(v)
        ? v.reduce((acc, it) => Math.max(acc, pickPrice(it, depth + 1)), 0)
        : pickPrice(v, depth + 1)
      if (candidate > 0) return candidate
    }
  }

  // 3) búsqueda general
  for (const v of Object.values(o)) {
    if (typeof v === 'object') {
      const candidate = Array.isArray(v)
        ? v.reduce((acc, it) => Math.max(acc, pickPrice(it, depth + 1)), 0)
        : pickPrice(v, depth + 1)
      if (candidate > 0) return candidate
    }
  }
  return 0
}

// Desempaqueta formatos comunes de listado (sin/paginado)
const unwrapList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

/**
 * Normaliza un hotel para la Calculadora:
 * -> { id: string, nombre: string, tarifa: number }
 */
export const normalizeHotel = (raw = {}) => {
  const id =
    raw.id ??
    raw._id ??
    raw.uuid ??
    String(raw.nombre ?? raw.name ?? raw.nombre_hotel ?? raw.razon_social ?? raw.nombre_comercial ?? Math.random().toString(36).slice(2, 9))

  // AMPLIAMOS las claves posibles de nombre
  const nombre =
    raw.nombre ??
    raw.nombre_hotel ??
    raw.razon_social ??
    raw.nombre_comercial ??
    raw.name ??
    'Hotel'

  // 1) intenta claves planas típicas
  let tarifa = num(
    raw.tarifa ??
    raw.precio_base ??
    raw.tarifa_base ??
    raw.precio_habitacion ??
    raw.precio_habitacion_base ??
    raw.precio_base_habitacion ??
    raw.precio_base_hotel ??
    raw.precio_noche ??
    raw.precio_por_persona ??
    raw.precio ??
    raw.monto ??
    0
  )

  // 2) si no encontró un valor > 0, busca anidado
  if (tarifa <= 0) tarifa = pickPrice(raw)

  return { id: String(id), nombre, tarifa }
}

// --------------- CRUD base ---------------
export const getHoteles   = () => api.get('/hoteles')
export const getHotel     = (id) => api.get(`/hoteles/${id}`)
export const updateHotel  = (id, payload = {}) => api.put(`/hoteles/${id}`, payload)
export const deleteHotel  = (id) => api.delete(`/hoteles/${id}`)

export const createHotel = (payload = {}) => {
  const estado = normEstado(payload.estado) ?? 'activo'
  return api.post('/hoteles', { ...payload, estado })
}

export const toggleEstadoHotel = (id, estadoActual) => {
  const next = normEstado(estadoActual) === 'activo' ? 'inactivo' : 'activo'
  return updateHotel(id, { estado: next })
}

// --------------- Listado “Lite” para Calculadora ---------------
// Devuelve Array<{ id, nombre, tarifa }>
export const getHotelesLite = async () => {
  const { data } = await api.get('/hoteles', { params: { per_page: 1000 } })
  const list = unwrapList(data)
  return list.map(normalizeHotel)
}
