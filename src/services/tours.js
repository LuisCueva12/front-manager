// src/services/tours.js
import api from './api' // ruta relativa

// -------------------- Helpers --------------------
const toArray = (v) => {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    return v.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}
const toId  = (val) => (val == null ? null : typeof val === 'object' ? (val.id ?? null) : val)
const hhmm  = (v) => (v ? String(v).slice(0, 5) : null)

// Normalizador de número robusto
const num = (v) => {
  if (v === '' || v === null || v === undefined) return 0
  // soporta cadenas con coma de miles "10,000.50"
  const n = Number(String(v).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

const DAY_MAP = {
  lunes: 'lun', martes: 'mar', miercoles: 'mie', miércoles: 'mie',
  jueves: 'jue', viernes: 'vie', sabado: 'sab', sábado: 'sab', domingo: 'dom',
  lun: 'lun', mar: 'mar', mie: 'mie', jue: 'jue', vie: 'vie', sab: 'sab', dom: 'dom',
}
const normDias = (arr) => toArray(arr).map((d) => DAY_MAP[String(d).toLowerCase()] || d).filter(Boolean)

// Detecta si ya es un payload “completo”
const isAlreadyPayload = (o) =>
  !!o &&
  (Object.prototype.hasOwnProperty.call(o, 'nombre_tour') ||
   Object.prototype.hasOwnProperty.call(o, 'destino_id') ||
   Object.prototype.hasOwnProperty.call(o, 'precio_base'))

// --- Normaliza SIEMPRE arrays clave ---
const normalizeArrays = (p) => {
  p.dias_operativos = Array.isArray(p.dias_operativos) ? p.dias_operativos : []
  p.incluye         = Array.isArray(p.incluye) ? p.incluye : []
  p.no_incluye      = Array.isArray(p.no_incluye) ? p.no_incluye : []
  p.itinerario      = Array.isArray(p.itinerario) ? p.itinerario : []
  p.imagenes        = Array.isArray(p.imagenes) ? p.imagenes : []
  return p
}

// Campos patch-only
const PATCHABLE_ONLY = new Set(['imagenes','dias_operativos','incluye','no_incluye','itinerario','estado'])

// -------------------- Payload completo (para POST/PUT) --------------------
const buildPayload = (form = {}) => {
  const dd = form.duracion_dias ?? form.duracionDias
  const dh = form.duracion_horas ?? form.duracionHoras
  const em = form.edad_minima ?? form.edadMinima

  const normalizeEstado = (v) => (v == null || v === '' ? 'activo' : String(v).toLowerCase())

  const payload = {
    nombre_tour: String((form.nombre_tour ?? form.nombre ?? '')).trim(),
    codigo_tour: form.codigo_tour == null && form.codigo == null ? '' : String(form.codigo_tour ?? form.codigo ?? '').trim(),

    destino_id: toId(form.destino_id ?? form.destino ?? form.destinoId),
    proveedor_id: toId(form.proveedor_id ?? form.proveedor ?? form.proveedorId),

    hora_inicio: hhmm(form.hora_inicio ?? form.horaInicio),
    hora_fin:    hhmm(form.hora_fin ?? form.horaFin),

    tipo_tour: String(form.tipo_tour ?? form.tipo ?? 'full_day').toLowerCase(),

    duracion_dias:  dd == null || dd === '' ? 0 : Number(dd),
    duracion_horas: dh == null || dh === '' ? 0 : Number(dh),

    precio_base:        form.precio_base != null ? num(form.precio_base)
                        : form.precioBase != null ? num(form.precioBase)
                        : form.precio != null ? num(form.precio)
                        : null,

    precio_por_persona: form.precio_por_persona != null ? num(form.precio_por_persona) : null,

    observaciones: form.observaciones ?? form.descripcion ?? '',

    dias_operativos: (() => {
      if (Array.isArray(form.dias_operativos)) return normDias(form.dias_operativos)
      if (Array.isArray(form.dias)) return normDias(form.dias)
      const checks = ['lun','mar','mie','jue','vie','sab','dom'].filter((d) => !!form[d])
      return checks.length ? checks : normDias(form.diasOperacion || [])
    })(),

    incluye:     toArray(form.incluye),
    no_incluye:  toArray(form.no_incluye ?? form.noIncluye),
    itinerario:  Array.isArray(form.itinerario) ? form.itinerario : toArray(form.itinerario),
    imagenes:    toArray(form.imagenes),

    dificultad: form.dificultad ? String(form.dificultad).toLowerCase() : 'facil',

    capacidad_minima: form.capacidad_minima != null ? Number(form.capacidad_minima)
                      : form.capacidadMin != null ? Number(form.capacidadMin) : 1,

    capacidad_maxima: form.capacidad_maxima != null ? Number(form.capacidad_maxima)
                      : form.capacidad != null ? Number(form.capacidad) : null,

    edad_minima: em == null || em === '' ? 0 : Number(em),

    estado: normalizeEstado(form.estado),
  }

  return normalizeArrays(payload)
}

const unwrapError = (err, fallback = 'Error') => {
  const status = err?.response?.status
  const msg = err?.response?.data?.message || err?.message || fallback
  const errs = err?.response?.data?.errors
  if (errs) {
    const flat = Object.values(errs).flat().join(' | ')
    return `${msg} (HTTP ${status}): ${flat}`
  }
  return `${msg} (HTTP ${status || '?'})`
}

// -------------------- Normalizador para Calculadora --------------------
export const normalizeTour = (raw = {}) => {
  const id =
    raw.id ?? raw._id ?? raw.uuid ??
    String(raw.nombre_tour ?? raw.nombre ?? Math.random().toString(36).slice(2, 9))

  const nombre = raw.nombre_tour ?? raw.nombre ?? 'Tour'

  // Intentamos muchas llaves posibles para el precio
  const tarifa = num(
    raw.tarifa ??
    raw.precio_base ??
    raw.tarifa_base ??
    raw.precio_por_persona ??
    raw.precio ??
    // algunos backends anidan
    raw?.precio?.base ??
    raw?.precio?.monto ??
    raw?.precios?.[0]?.monto ??
    raw?.costos?.[0]?.precio ??
    0
  )

  return { id: String(id), nombre, tarifa }
}

// Desempaqueta posibles formatos de listado
const unwrapList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.data)) return data.data.data
  return []
}

// -------------------- Listado “Lite” para Calculadora --------------------
// Devuelve Array<{ id, nombre, tarifa }>
export async function getToursLite() {
  const { data } = await api.get('/tours', { params: { per_page: 1000 } })
  const list = unwrapList(data)
  return list.map(normalizeTour)
}

// -------------------- API CRUD --------------------
export async function createTour(formOrPayload) {
  try {
    let payload = isAlreadyPayload(formOrPayload) ? { ...formOrPayload } : buildPayload(formOrPayload)
    payload.nombre_tour = String(payload.nombre_tour ?? '').trim()
    payload.codigo_tour = payload.codigo_tour == null ? '' : String(payload.codigo_tour).trim()
    payload = normalizeArrays(payload)

    if (payload.capacidad_minima == null) payload.capacidad_minima = 1
    if (payload.estado == null) payload.estado = 'activo'

    const { data } = await api.post('/tours', payload)
    return data
  } catch (err) {
    throw new Error(unwrapError(err, 'Error al guardar el tour'))
  }
}

export async function updateTour(id, formOrPayload) {
  try {
    const keys = Object.keys(formOrPayload || {})
    if (keys.length === 0) return getTour(id)

    const onlyPatchable = keys.every((k) => PATCHABLE_ONLY.has(k))

    if (onlyPatchable) {
      const patch = { ...formOrPayload }
      if (patch.imagenes)         patch.imagenes = toArray(patch.imagenes)
      if (patch.dias_operativos)  patch.dias_operativos = toArray(patch.dias_operativos)
      if (patch.incluye)          patch.incluye = toArray(patch.incluye)
      if (patch.no_incluye)       patch.no_incluye = toArray(patch.no_incluye)
      if (patch.itinerario)       patch.itinerario = toArray(patch.itinerario)

      try {
        const { data } = await api.patch(`/tours/${id}`, patch)
        return data
      } catch (e) {
        const fd = new FormData()
        Object.entries(patch).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v))
        fd.append('_method', 'PATCH')
        const { data } = await api.post(`/tours/${id}`, fd)
        return data
      }
    }

    let payload = isAlreadyPayload(formOrPayload) ? { ...formOrPayload } : buildPayload(formOrPayload)
    payload.nombre_tour = String(payload.nombre_tour ?? '').trim()
    payload.codigo_tour = payload.codigo_tour == null ? '' : String(payload.codigo_tour).trim()
    payload = normalizeArrays(payload)

    const { data } = await api.put(`/tours/${id}`, payload)
    return data
  } catch (err) {
    throw new Error(unwrapError(err, 'Error al actualizar el tour'))
  }
}

export async function deleteTour(id) {
  try {
    await api.delete(`/tours/${id}`)
    return true
  } catch (err) {
    throw new Error(unwrapError(err, 'Error al eliminar el tour'))
  }
}

export async function getTour(id) {
  const { data } = await api.get(`/tours/${id}`)
  return data?.data ?? data
}

export async function listTours({ q = '', page = 1, perPage = 10 } = {}) {
  const { data } = await api.get('/tours', { params: { q, page, per_page: perPage } })
  const itemsRaw = unwrapList(data)
  const rows = itemsRaw.map((t) => ({
    id: t.id,
    nombre: t.nombre_tour ?? t.nombre,
    codigo: t.codigo_tour,
    destino: t.destino?.nombre || '',
    proveedor: t.proveedor?.razon_social || t.proveedor?.nombre_comercial || '',
    hora_inicio: t.hora_inicio,
    hora_fin: t.hora_fin,
    precio: t.precio_base ?? t.precio_por_persona ?? t.precio ?? 0,
    estado: t.estado,
    _raw: t,
  }))
  const total = num(data?.data?.total ?? data?.total ?? rows.length)
  const last  = num(data?.data?.last_page ?? data?.last_page ?? 1)
  const cur   = num(data?.data?.current_page ?? data?.current_page ?? page)
  const per   = num(data?.data?.per_page ?? data?.per_page ?? perPage)

  return {
    items: rows,
    pagination: { total, per_page: per, current_page: cur, last_page: last },
  }
}

// Útil en tests
export const __buildPayload = buildPayload
