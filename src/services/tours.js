// src/services/tours.js
import api from "@/services/api";

// Helpers
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};
const toId = (val) => (val == null ? null : typeof val === "object" ? (val.id ?? null) : val);
const hhmm = (v) => (v ? String(v).slice(0, 5) : null);

const DAY_MAP = { lunes:"lun", martes:"mar", miercoles:"mie", miércoles:"mie", jueves:"jue", viernes:"vie", sabado:"sab", sábado:"sab", domingo:"dom", lun:"lun", mar:"mar", mie:"mie", jue:"jue", vie:"vie", sab:"sab", dom:"dom" };
const normDias = (arr) => toArray(arr).map((d) => DAY_MAP[String(d).toLowerCase()] || d).filter(Boolean);

const isAlreadyPayload = (o) =>
  !!o && (o.hasOwnProperty("nombre_tour") || o.hasOwnProperty("destino_id") || o.hasOwnProperty("precio_base"));

const buildPayload = (form = {}) => {
  const dd = form.duracion_dias  ?? form.duracionDias;
  const dh = form.duracion_horas ?? form.duracionHoras;
  const em = form.edad_minima    ?? form.edadMinima;

  return {
    nombre_tour: (form.nombre_tour || form.nombre || "").trim(),
    codigo_tour: form.codigo_tour ?? form.codigo ?? null,

    destino_id:   toId(form.destino_id ?? form.destino ?? form.destinoId),
    proveedor_id: toId(form.proveedor_id ?? form.proveedor ?? form.proveedorId),

    hora_inicio: hhmm(form.hora_inicio ?? form.horaInicio),
    hora_fin:    hhmm(form.hora_fin ?? form.horaFin),

    tipo_tour: (form.tipo_tour || form.tipo || "full_day")?.toLowerCase() || null,

    duracion_dias:  dd == null || dd === "" ? 0 : Number(dd),
    duracion_horas: dh == null || dh === "" ? 0 : Number(dh),

    precio_base:
      form.precio_base != null ? Number(form.precio_base)
      : form.precioBase  != null ? Number(form.precioBase)
      : form.precio      != null ? Number(form.precio)
      : null,

    precio_por_persona:
      form.precio_por_persona != null ? Number(form.precio_por_persona) : null,

    // NO enviamos 'descripcion'; si viene, la ponemos en observaciones
    observaciones: form.observaciones ?? form.descripcion ?? null,

    dias_operativos: (() => {
      if (Array.isArray(form.dias_operativos)) return normDias(form.dias_operativos);
      if (Array.isArray(form.dias)) return normDias(form.dias);
      const checks = ["lun","mar","mie","jue","vie","sab","dom"].filter((d) => !!form[d]);
      return checks.length ? checks : normDias(form.diasOperacion || []);
    })(),

    incluye:    toArray(form.incluye),
    no_incluye: toArray(form.no_incluye ?? form.noIncluye),
    itinerario: Array.isArray(form.itinerario) ? form.itinerario : toArray(form.itinerario),
    imagenes:   toArray(form.imagenes),

    dificultad: form.dificultad ? String(form.dificultad).toLowerCase() : null,

    capacidad_minima:
      form.capacidad_minima != null ? Number(form.capacidad_minima)
      : form.capacidadMin    != null ? Number(form.capacidadMin)
      : null,

    capacidad_maxima:
      form.capacidad_maxima != null ? Number(form.capacidad_maxima)
      : form.capacidad       != null ? Number(form.capacidad)
      : null,

    // 👇 ahora nunca mandamos null
    edad_minima: em == null || em === "" ? 0 : Number(em),

    estado: (form.estado || "activo").toLowerCase(),
  };
};

const unwrapError = (err, fallback = "Error") => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message || err?.message || fallback;
  const errs = err?.response?.data?.errors;
  if (errs) {
    const flat = Object.values(errs).flat().join(" | ");
    return `${msg} (HTTP ${status}): ${flat}`;
  }
  return `${msg} (HTTP ${status || "?"})`;
};

// API
export async function createTour(formOrPayload) {
  try {
    const payload = isAlreadyPayload(formOrPayload) ? { ...formOrPayload } : buildPayload(formOrPayload);
    if (payload.capacidad_minima == null) payload.capacidad_minima = 1; // NOT NULL
    if (!payload.estado) payload.estado = "activo";
    const { data } = await api.post("/tours", payload);
    return data;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al guardar el tour"));
  }
}

export async function updateTour(id, formOrPayload) {
  try {
    const payload = isAlreadyPayload(formOrPayload) ? { ...formOrPayload } : buildPayload(formOrPayload);
    const { data } = await api.put(`/tours/${id}`, payload);
    return data;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al actualizar el tour"));
  }
}

export async function deleteTour(id) {
  try {
    await api.delete(`/tours/${id}`);
    return true;
  } catch (err) {
    throw new Error(unwrapError(err, "Error al eliminar el tour"));
  }
}

export async function getTour(id) {
  const { data } = await api.get(`/tours/${id}`);
  return data?.data ?? data;
}

export async function listTours({ q = "", page = 1, perPage = 10 } = {}) {
  const { data } = await api.get("/tours", { params: { q, page, per_page: perPage } });
  const pagination = data?.data || {};
  const itemsRaw = Array.isArray(pagination?.data) ? pagination.data : [];
  const rows = itemsRaw.map((t) => ({
    id: t.id,
    nombre: t.nombre_tour,
    codigo: t.codigo_tour,
    destino: t.destino?.nombre || "",
    proveedor: t.proveedor?.razon_social || t.proveedor?.nombre_comercial || "",
    hora_inicio: t.hora_inicio,
    hora_fin: t.hora_fin,
    precio: t.precio_base ?? t.precio_por_persona ?? 0,
    estado: t.estado,
    _raw: t,
  }));
  return {
    items: rows,
    pagination: {
      total: pagination.total ?? rows.length,
      per_page: pagination.per_page ?? perPage,
      current_page: pagination.current_page ?? page,
      last_page: pagination.last_page ?? 1,
    },
  };
}

export const __buildPayload = buildPayload;
