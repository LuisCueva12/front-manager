// src/services/destinoService.js
import api from '@/services/api'   // <- tu wrapper axios (ya maneja token)

function pick(d) {
  // normaliza por si el backend trae más campos
  return {
    id: d.id,
    nombre: d.nombre || '',
    departamento: d.departamento || '',
    provincia: d.provincia || '',
    codigo_postal: d.codigo_postal || '',
    descripcion: d.descripcion || '',
    estado: d.estado || 'activo',
    created_at: d.created_at,
    updated_at: d.updated_at,
  };
}

export default {
  // GET /api/destinos  (con o sin paginación)
  async listar() {
    const res = await api.get('/destinos');
    // Si usas Resources/paginación: { data: [...] }
    const rows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return rows.map(pick);
  },

  // GET /api/destinos/:id
  async obtener(id) {
    const res = await api.get(`/destinos/${id}`);
    const row = res.data?.data ?? res.data;
    return row ? pick(row) : null;
  },

  // POST /api/destinos
  async crear(payload) {
    const body = {
      nombre: payload.nombre,
      departamento: payload.departamento || '',
      provincia: payload.provincia || '',
      codigo_postal: payload.codigo_postal || '',
      descripcion: payload.descripcion || '',
      estado: payload.estado || 'activo',
    };
    const res = await api.post('/destinos', body);
    const row = res.data?.data ?? res.data;
    return pick(row);
  },

  // PUT /api/destinos/:id   (o PATCH si tu backend lo prefiere)
  async actualizar(id, payload) {
    const body = {
      nombre: payload.nombre,
      departamento: payload.departamento || '',
      provincia: payload.provincia || '',
      codigo_postal: payload.codigo_postal || '',
      descripcion: payload.descripcion || '',
      estado: payload.estado || 'activo',
    };
    const res = await api.put(`/destinos/${id}`, body);
    const row = res.data?.data ?? res.data;
    return pick(row);
  },

  // DELETE /api/destinos/:id
  async eliminar(id) {
    await api.delete(`/destinos/${id}`);
    return true;
  },
};
