// src/services/usuarioService.js
import api from "@/services/api";

const normalize = (u = {}) => ({
  id: u.id,
  nombre: u.nombre || "",
  apellido: u.apellido || "",
  dni: u.dni || "",
  correo: u.correo || "",
  telefono: u.telefono || "",
  direccion: u.direccion || "",
  rol: u.rol_nombre ?? u?.rol?.nombre ?? "",
  fecha_nacimiento: u.fecha_nacimiento ? String(u.fecha_nacimiento).slice(0, 10) : "",
  estado: u.estado || "",
  _raw: u,
});

// LISTAR + BUSCAR
export async function listUsuarios({ q = "", page = 1, perPage = 10 } = {}) {
  const { data } = await api.get("/usuarios", { params: { q, page, per_page: perPage } });
  const pag = data?.data ?? {};
  const items = Array.isArray(pag.data) ? pag.data.map(normalize) : [];
  return {
    items,
    pagination: {
      current_page: pag.current_page ?? 1,
      per_page: pag.per_page ?? perPage,
      total: pag.total ?? items.length,
      last_page: pag.last_page ?? 1,
    },
  };
}

// OBTENER DETALLE
export async function getUsuario(id) {
  const { data } = await api.get(`/usuarios/${id}`);
  return normalize(data?.data);
}

// CREAR
export async function createUsuario(payload) {
  const { data } = await api.post("/usuarios", payload);
  return normalize(data?.data);
}

// ACTUALIZAR
export async function updateUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return normalize(data?.data);
}

// ELIMINAR
export async function deleteUsuario(id) {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
}
