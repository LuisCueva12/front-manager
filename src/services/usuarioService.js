// src/services/usuarioService.js
import api from '@/services/api'

// Normaliza una fila para la UI
const normalize = (u = {}) => ({
  id: u.id,
  nombre: u.nombre || '',
  apellido: u.apellido || '',
  dni: u.dni || '',
  correo: u.correo || '',
  telefono: u.telefono || '',
  direccion: u.direccion || '',
  rol: u.rol_nombre ?? u?.rol?.nombre ?? u.rol ?? '',
  fecha_nacimiento: u.fecha_nacimiento ? String(u.fecha_nacimiento).slice(0, 10) : '',
  estado: u.estado ?? 'activo',
  _raw: u,
})

// Extrae items de cualquier forma común del backend
function extractItems(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.data?.data)) return payload.data.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.usuarios)) return payload.usuarios
  return []
}

// Extrae paginación de cualquier forma común
function extractPagination(payload, itemsLen, fallbackPerPage = 10) {
  const meta = payload?.meta || payload?.pagination || payload?.data || {}

  const current_page = Number(
    meta.current_page ??
    payload?.current_page ??
    1
  )

  const per_page = Number(
    meta.per_page ??
    payload?.per_page ??
    (itemsLen || fallbackPerPage)
  )

  const total = Number(
    meta.total ??
    payload?.total ??
    itemsLen ?? 0
  )

  const last_page = Number(
    meta.last_page ??
    payload?.last_page ??
    (per_page ? Math.max(1, Math.ceil(total / per_page)) : 1)
  )

  return { current_page, per_page, total, last_page }
}

/* ================== API ================== */

// LISTAR + BUSCAR
export async function listUsuarios({ q = '', page = 1, perPage = 10 } = {}) {
  const { data } = await api.get('/usuarios', { params: { q, page, per_page: perPage } })

  const root = data ?? {}
  const items = extractItems(root).map(normalize)
  const pagination = extractPagination(root, items.length, perPage)

  return { items, pagination }
}

// OBTENER DETALLE
export async function getUsuario(id) {
  const { data } = await api.get(`/usuarios/${id}`)
  const row = data?.data ?? data ?? {}
  return normalize(row)
}

// CREAR
export async function createUsuario(payload) {
  const { data } = await api.post('/usuarios', payload)
  const row = data?.data ?? data ?? {}
  return normalize(row)
}

// ACTUALIZAR
export async function updateUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}`, payload)
  const row = data?.data ?? data ?? {}
  return normalize(row)
}

// ELIMINAR
export async function deleteUsuario(id) {
  const { data } = await api.delete(`/usuarios/${id}`)
  return data
}
