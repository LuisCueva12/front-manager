import api from "@/services/api";

// LISTAR + BUSCAR
export async function listProveedores({ q = "", page = 1, perPage = 10 } = {}) {
  const { data } = await api.get("/proveedores", {
    params: { q, page, per_page: perPage },
  });

  const rows = (data.data?.data || data.data || []).map((p) => ({
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
  }));

  return { items: rows, pagination: data.data || data };
}

// CREAR
export async function createProveedor(view) {
  const payload = {
    ruc: view.ruc || null,
    razon_social: view.nombre,
    nombre_comercial: view.nombre,
    tipo_proveedor: view.tipo,
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
    estado: view.estado || null,
  };
  const { data } = await api.post("/proveedores", payload);
  return data;
}

// DETALLE
export async function getProveedor(id) {
  const { data } = await api.get(`/proveedores/${id}`);
  const p = data.data || data;

  return {
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
  };
}

// ACTUALIZAR
export async function updateProveedor(id, view) {
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
    estado: view.estado ?? undefined, // undefined = no sobrescribe
  };
  const { data } = await api.put(`/proveedores/${id}`, payload);
  return data;
}

// ELIMINAR
export async function deleteProveedor(id) {
  const { data } = await api.delete(`/proveedores/${id}`);
  return data;
}
