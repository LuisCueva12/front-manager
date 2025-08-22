// src/services/rolService.js
import api from '@/services/api'

/**
 * Trae todos los roles.
 * Soporta respuestas: [ ... ], {data:[ ... ]}, {data:{data:[ ... ]}}
 */
export async function fetchRoles(params = {}) {
  const { data } = await api.get('/roles', {
    params: { per_page: -1, ...params } // -1 => sin paginar (lo manejamos en el backend)
  })

  const list =
    Array.isArray(data)         ? data :
    Array.isArray(data?.data)   ? data.data :
    Array.isArray(data?.data?.data) ? data.data.data :
    []

  // normaliza a {id, nombre}
  return list.map(r => ({ id: r.id, nombre: r.nombre }))
}
