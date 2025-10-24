// src/services/proveedorService.js
import api from "@/services/api";

/* ========= Helpers ========= */
const unwrapError = (err, fallback = "Error") => {
  const st = err?.response?.status;
  const msg = err?.response?.data?.message || err?.message || fallback;
  const errs = err?.response?.data?.errors;
  if (errs) {
    const flat = Object.values(errs).flat().join(" | ");
    return `${msg} (HTTP ${st}): ${flat}`;
  }
  return `${msg} (HTTP ${st ?? "?"})`;
};

const normalizePagination = (raw, { page = 1, perPage = 10 } = {}) => {
  // raw puede ser:
  // { data: { data:[...], total, per_page, current_page, last_page } }  (Laravel)
  // ó { data:[...], total, per_page, current_page, last_page }
  // ó un arreglo simple (sin paginación)
  const p = raw?.data || raw;
  return {
    total: Number(p?.total ?? (Array.isArray(p?.data) ? p.data.length : 0)),
    per_page: Number(p?.per_page ?? perPage),
    current_page: Number(p?.current_page ?? page),
    last_page: Number(p?.last_page ?? 1),
  };
};

const mapRow = (p) => ({
  id: p.id,
  nombre: p.razon_social || p.nombre_comercial || "",
  tipo: p.tipo_proveedor || "",
  ruc: p.ruc || "",
  correo: p.correo ?? "",
  telefono: p.telefono ?? "",
  direccion: p.direccion ?? "",
  cuentaBancaria: p.cuenta_bancaria ?? "",
  cci: p.cci ?? "",
  banco: p.banco ?? "",
  tipo_cuenta: p.tipo_cuenta ?? "ahorros",
  representante: p.contacto_nombre ?? "",
  contacto_cargo: p.contacto_cargo ?? "",
  contacto_telefono: p.contacto_telefono ?? "",
  contacto_email: p.contacto_email ?? "",
  comision_porcentaje: p.comision_porcentaje ?? 0,
  estado: p.estado ?? "activo",
  acuerdos: p.observaciones ?? "",
  _raw: p,
});

/* ========= API ========= */

// LISTAR + BUSCAR
export async function listProveedores({ q = "", page = 1, perPage = 10 } = {}) {
  try {
    const { data } = await api.get("/proveedores", {
      params: { q, page, per_page: perPage },
    });

    const payload = data?.data || data;
    const itemsRaw = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const items = itemsRaw.map(mapRow);
    const pagination = normalizePagination(data, { page, perPage });

    return { items, pagination };
  } catch (err) {
    throw new Error(unwrapError(err, "Error al listar proveedores"));
  }
}

// CREAR
export async function createProveedor(view) {
  try {
    const payload = {
      ruc: view.ruc || null,
      razon_social: view.nombre ?? null,
      nombre_comercial: view.nombre ?? null,
      tipo_proveedor: view.tipo ?? null,
      correo: view.correo || null,
      telefono: view.telefono || null,
      direccion: view.direccion || null,
      cuenta_bancaria: view.cuentaBancaria || null,
      cci: view.cci || null,
      banco: view.banco || null,
      tipo_cuenta: view.tipo_cuenta || null,
      contacto_nombre: view.representante || null,
      contacto_cargo: view.contacto_cargo || null,
      contacto_telefono: view.contacto_telefono || null,
      contacto_email: view.contacto_email || null,
      comision_porcentaje: view.comision_porcentaje ?? null,
      observaciones: view.acuerdos || null,
      estado: (view.estado || "activo").toLowerCase(),
    };
    const { data } = await api.post("/proveedores", payload);
    return data;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al crear el proveedor"));
  }
}

// DETALLE
export async function getProveedor(id) {
  try {
    const { data } = await api.get(`/proveedores/${id}`);
    const p = data?.data || data;
    return mapRow(p);
  } catch (err) {
    throw new Error(unwrapError(err, "Error al obtener el proveedor"));
  }
}

// ACTUALIZAR
export async function updateProveedor(id, view) {
  try {
    // Usamos "undefined" para no sobreescribir campos no enviados
    const payload = {
      ruc: view.ruc ?? null,
      razon_social: view.nombre ?? undefined,
      nombre_comercial: view.nombre ?? undefined,
      tipo_proveedor: view.tipo ?? undefined,
      correo: view.correo ?? null,
      telefono: view.telefono ?? null,
      direccion: view.direccion ?? null,
      cuenta_bancaria: view.cuentaBancaria ?? null,
      cci: view.cci ?? null,
      banco: view.banco ?? null,
      tipo_cuenta: view.tipo_cuenta ?? null,
      contacto_nombre: view.representante ?? null,
      contacto_cargo: view.contacto_cargo ?? null,
      contacto_telefono: view.contacto_telefono ?? null,
      contacto_email: view.contacto_email ?? null,
      comision_porcentaje: view.comision_porcentaje ?? null,
      observaciones: view.acuerdos ?? null,
      estado: view.estado ?? undefined, // no sobrescribe si no viene
    };
    const { data } = await api.put(`/proveedores/${id}`, payload);
    return data;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al actualizar el proveedor"));
  }
}

// ELIMINAR
export async function deleteProveedor(id) {
  try {
    const { data } = await api.delete(`/proveedores/${id}`);
    return data;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al eliminar el proveedor"));
  }
}
