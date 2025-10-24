<!-- src/modules/tours/Tours.vue -->
<template>
  <div class="contenedor">
    <!-- Header -->
    <div class="encabezado">
      <h2><i class="bi bi-airplane-engines-fill"></i> Lista de Tours</h2>

      <div class="acciones-top">
        <input
          v-model="busqueda"
          class="buscador"
          placeholder="Buscar tour…"
          @keyup.enter.prevent="irPagina(1)"
        />

        <button type="button" class="btn btn-reload" :disabled="isLoading" @click="cargarTours">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>

        <!-- Nuevo: SOLO si puede crear -->
        <button
          v-if="auth.can('tours.create')"
          type="button"
          class="btn-nuevo"
          @click="irCrear"
        >
          <i class="bi bi-plus-circle"></i> Nuevo Tour
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="tabla-wrap" v-if="toursFiltrados.length">
      <table class="tabla">
        <thead>
          <tr>
            <th style="width:60px">#</th>
            <th>Nombre</th>
            <th>Destino</th>
            <th>Horario</th>
            <th>Precio</th>
            <th style="width:120px">Estado</th>
            <th style="width:200px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tour, index) in toursFiltrados" :key="tour.id ?? index">
            <td>{{ index + 1 + (page - 1) * perPage }}</td>

            <td class="corta">{{ tour.nombre || tour.nombre_tour || '—' }}</td>

            <td class="corta">{{ tour.destino_nombre || tour.destino?.nombre || tour.ciudad || '—' }}</td>

            <td>
              <span v-if="tour.hora_inicio || tour.hora_fin">
                {{ fmtHora(tour.hora_inicio) }}
                <span v-if="tour.hora_inicio && tour.hora_fin"> - </span>
                {{ fmtHora(tour.hora_fin) }}
              </span>
              <span v-else>—</span>
            </td>

            <td>{{ fmtMoneda(tour.precio) }}</td>

            <td>
              <span class="badge" :class="badgeClase(tour.estado)">
                {{ estadoTexto(tour.estado) }}
              </span>
            </td>

            <td class="acciones">
              <!-- Ver -->
              <button
                v-if="auth.can('tours.read')"
                type="button"
                class="ver"
                title="Ver"
                @click.stop="verTour(tour)"
              >
                <i class="bi bi-eye-fill"></i>
              </button>

              <!-- Editar -->
              <button
                v-if="auth.can('tours.update')"
                type="button"
                class="editar"
                title="Editar"
                @click.stop="editarTour(tour)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>

              <!-- Eliminar -->
              <button
                v-if="auth.can('tours.delete')"
                type="button"
                class="eliminar"
                title="Eliminar"
                @click.stop="eliminarTour(tour)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>

              <!-- Toggle estado -->
              <label
                v-if="auth.can('tours.update')"
                class="toggle"
                :title="estadoTexto(tour.estado)==='Activo' ? 'Desactivar' : 'Activar'"
                style="margin-left:6px"
              >
                <input
                  type="checkbox"
                  :checked="estadoTexto(tour.estado)==='Activo'"
                  @change="toggleEstadoFast(tour)"
                />
                <span class="track"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div class="empty" v-else>
      <i class="bi bi-emoji-neutral"></i> No hay tours para mostrar.
    </div>

    <!-- Paginación -->
    <div class="pager" v-if="totalPages > 1">
      <button class="btn-pager" :disabled="page <= 1" @click="irPagina(page - 1)">Anterior</button>
      <span>Página {{ page }} / {{ totalPages }}</span>
      <button class="btn-pager" :disabled="page >= totalPages" @click="irPagina(page + 1)">Siguiente</button>

      <select class="pager-select" :value="perPage" @change="cambiarPerPage($event.target.value)">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>

    <!-- Modal detalle -->
    <div v-if="tourSeleccionado" class="modal-overlay" @click.self="tourSeleccionado = null">
      <div class="modal-contenido">
        <h4><i class="bi bi-card-text"></i> Resumen del Tour</h4>

        <table class="tabla-detalle">
          <tbody>
            <tr><td><strong>Código:</strong></td><td>{{ tourSeleccionado.codigo_tour || '—' }}</td></tr>
            <tr><td><strong>Nombre:</strong></td><td>{{ tourSeleccionado.nombre || tourSeleccionado.nombre_tour || '—' }}</td></tr>
            <tr><td><strong>Tipo de tour:</strong></td><td>{{ fmtTipo(tourSeleccionado.tipo_tour) }}</td></tr>
            <tr><td><strong>Destino:</strong></td><td>{{ tourSeleccionado.destino_nombre || tourSeleccionado.destino?.nombre || '—' }}</td></tr>
            <tr><td><strong>Proveedor:</strong></td><td>{{ tourSeleccionado.proveedor_nombre || '—' }}</td></tr>
            <tr>
              <td><strong>Horario:</strong></td>
              <td>
                <span v-if="tourSeleccionado.hora_inicio || tourSeleccionado.hora_fin">
                  {{ fmtHora(tourSeleccionado.hora_inicio) }}
                  <span v-if="tourSeleccionado.hora_inicio && tourSeleccionado.hora_fin"> - </span>
                  {{ fmtHora(tourSeleccionado.hora_fin) }}
                </span>
                <span v-else>—</span>
              </td>
            </tr>
            <tr><td><strong>Duración:</strong></td><td>{{ (tourSeleccionado.duracion_dias ?? 0) }} día(s) / {{ (tourSeleccionado.duracion_horas ?? 0) }} hora(s)</td></tr>
            <tr><td><strong>Precio base:</strong></td><td>{{ fmtMoneda(tourSeleccionado.precio_base) }}</td></tr>
            <tr><td><strong>Precio por persona:</strong></td><td>{{ fmtMoneda(tourSeleccionado.precio_por_persona ?? tourSeleccionado.precio) }}</td></tr>
            <tr>
              <td><strong>Capacidad:</strong></td>
              <td>
                <span v-if="tourSeleccionado.capacidad_maxima != null">Máx: {{ tourSeleccionado.capacidad_maxima }}</span>
                <span v-if="tourSeleccionado.capacidad_minima != null" style="margin-left:8px">Mín: {{ tourSeleccionado.capacidad_minima }}</span>
                <span v-if="tourSeleccionado.capacidad_maxima == null && tourSeleccionado.capacidad_minima == null">No registrada</span>
              </td>
            </tr>
            <tr><td><strong>Edad mínima:</strong></td><td>{{ tourSeleccionado.edad_minima ?? 0 }}</td></tr>
            <tr><td><strong>Dificultad:</strong></td><td>{{ fmtCap(tourSeleccionado.dificultad) }}</td></tr>
            <tr>
              <td><strong>Días de operación:</strong></td>
              <td>
                <ul v-if="tourSeleccionado.dias_operativos?.length">
                  <li v-for="(d,i) in mapDiasBonitos(tourSeleccionado.dias_operativos)" :key="i">{{ d }}</li>
                </ul>
                <span v-else>No definidos</span>
              </td>
            </tr>
            <tr>
              <td><strong>Incluye:</strong></td>
              <td>
                <ul v-if="tourSeleccionado.incluye?.length"><li v-for="(it,i) in tourSeleccionado.incluye" :key="i">{{ it }}</li></ul>
                <span v-else>No especificado</span>
              </td>
            </tr>
            <tr>
              <td><strong>No incluye:</strong></td>
              <td>
                <ul v-if="tourSeleccionado.no_incluye?.length"><li v-for="(it,i) in tourSeleccionado.no_incluye" :key="i">{{ it }}</li></ul>
                <span v-else>No especificado</span>
              </td>
            </tr>
            <tr>
              <td><strong>Itinerario:</strong></td>
              <td>
                <ol v-if="tourSeleccionado.itinerario?.length"><li v-for="(it,i) in tourSeleccionado.itinerario" :key="i">{{ it }}</li></ol>
                <span v-else>No especificado</span>
              </td>
            </tr>

            <!-- Imágenes -->
            <tr>
              <td><strong>Imágenes:</strong></td>
              <td>
                <div v-if="imagenesResueltas.length" class="thumbs">
                  <img
                    v-for="(src,i) in imagenesResueltas"
                    :key="i"
                    class="thumb"
                    :src="src"
                    alt="Imagen del tour"
                  />
                </div>
                <span v-else>—</span>
              </td>
            </tr>

            <tr><td><strong>Observaciones:</strong></td><td>{{ tourSeleccionado.observaciones || 'Ninguna' }}</td></tr>
            <tr>
              <td><strong>Estado:</strong></td>
              <td>
                <span class="badge" :class="badgeClase(tourSeleccionado.estado)">
                  {{ estadoTexto(tourSeleccionado.estado) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="acciones-modal">
          <button type="button" class="btn" @click="tourSeleccionado = null">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Swal from 'sweetalert2'
import { listTours, deleteTour, updateTour } from '@/services/tours'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const API_ORIGIN = (() => {
  try {
    const u = new URL(api.defaults.baseURL || window.location.origin)
    return `${u.protocol}//${u.hostname}${u.port ? ':' + u.port : ''}`
  } catch {
    return window.location.origin
  }
})()

const asArray = (v) => {
  if (Array.isArray(v)) return v
  if (v == null || v === '') return []
  if (typeof v === 'string') {
    try { const parsed = JSON.parse(v); return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []) }
    catch { return [v] }
  }
  return [v]
}

const DAY_NAMES = { lun:'Lunes', mar:'Martes', mie:'Miércoles', jue:'Jueves', vie:'Viernes', sab:'Sábado', dom:'Domingo' }
const mapDiasBonitos = (arr) => asArray(arr).map(d => DAY_NAMES[String(d).toLowerCase()] || d)

const normalizeItem = (t) => {
  const raw = t._raw || t
  const proveedorNombre = raw.proveedor?.razon_social || raw.proveedor?.nombre_comercial || raw.proveedor?.nombre || t.proveedor || ''
  return {
    id: t.id ?? raw.id,
    nombre: t.nombre || raw.nombre_tour || '',
    nombre_tour: raw.nombre_tour || t.nombre || '',
    codigo_tour: raw.codigo_tour || t.codigo || '',
    destino_nombre: t.destino || raw.destino?.nombre || '',
    destino: raw.destino || null,
    proveedor_nombre: proveedorNombre,
    hora_inicio: t.hora_inicio ?? raw.hora_inicio ?? null,
    hora_fin: t.hora_fin ?? raw.hora_fin ?? null,
    tipo_tour: raw.tipo_tour || t.tipo || 'full_day',
    duracion_dias: raw.duracion_dias ?? 0,
    duracion_horas: raw.duracion_horas ?? 0,
    precio_base: raw.precio_base ?? null,
    precio_por_persona: raw.precio_por_persona ?? null,
    precio: t.precio ?? raw.precio_por_persona ?? raw.precio_base ?? 0,
    capacidad_maxima: raw.capacidad_maxima ?? null,
    capacidad_minima: raw.capacidad_minima ?? null,
    edad_minima: raw.edad_minima ?? 0,
    dificultad: raw.dificultad || 'facil',
    incluye: asArray(raw.incluye),
    no_incluye: asArray(raw.no_incluye),
    dias_operativos: asArray(raw.dias_operativos),
    itinerario: asArray(raw.itinerario),
    imagenes: asArray(raw.imagenes),
    observaciones: raw.observaciones || '',
    estado: raw.estado || t.estado || 'activo',
    _raw: raw
  }
}

export default {
  name: 'Tours',
  setup () {
    const auth = useAuthStore()
    return { auth }
  },
  data () {
    return {
      busqueda: '',
      tours: [],
      tourSeleccionado: null,
      page: 1,
      perPage: 10,
      total: 0,
      isLoading: false,
      _searchTimer: null
    }
  },
  computed: {
    toursFiltrados () {
      const q = this.busqueda.trim().toLowerCase()
      if (!q) return this.tours
      return this.tours.filter(t =>
        (t.nombre || t.nombre_tour || '').toLowerCase().includes(q) ||
        (t.destino_nombre || '').toLowerCase().includes(q) ||
        (t.codigo_tour || '').toLowerCase().includes(q)
      )
    },
    totalPages () { return Math.max(1, Math.ceil(this.total / this.perPage)) },
    imagenesResueltas () {
      const arr = asArray(this.tourSeleccionado?.imagenes)
      return arr.map(this.toPublicUrl).filter(Boolean)
    }
  },
  methods: {
    irCrear () {
      if (!this.auth.can('tours.create')) {
        Swal.fire('Permiso denegado', 'No puedes crear tours.', 'warning')
        return
      }
      this.$router.push({ name: 'RegistroTour' })
    },
    fmtHora (h) { if (!h) return ''; const [hh='00',mm='00']=String(h).split(':'); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` },
    fmtMoneda (n) { const num = Number(n || 0); return `S/ ${num.toFixed(2)}` },
    fmtCap (s) { if (!s) return ''; const t=String(s).toLowerCase(); return t.charAt(0).toUpperCase()+t.slice(1).replace('_',' ') },
    fmtTipo (t) {
      const map={ full_day:'Full day', half_day:'Half day', multi_day:'Multi day', trekking:'Trekking', cultural:'Cultural', aventura:'Aventura', gastronomico:'Gastronómico' }
      return map[String(t).toLowerCase()] || this.fmtCap(t)
    },
    mapDiasBonitos,
    estadoTexto(v){
      const s = String(v || 'activo').toLowerCase()
      if (s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      if (s === 'temporada') return 'Temporada'
      return 'Activo'
    },
    badgeClase(v){
      const s = String(v || 'activo').toLowerCase()
      return {
        'badge--activo': s === 'activo',
        'badge--inactivo': s === 'inactivo',
        'badge--suspendido': s === 'suspendido',
        'badge--temporada': s === 'temporada'
      }
    },
    toPublicUrl (p) {
      if (!p) return null
      const s = String(p)
      if (/^https?:\/\//i.test(s)) return s
      const rel = s.startsWith('storage/') ? s : `storage/${s.replace(/^\/+/, '')}`
      return `${API_ORIGIN}/${rel}`
    },
    async cargarTours () {
      try {
        this.isLoading = true
        const res = await listTours({ q: this.busqueda, page: this.page, perPage: this.perPage })
        const rows = Array.isArray(res.items) ? res.items : []
        this.tours = rows.map(normalizeItem)
        const p = res.pagination || {}
        this.total = Number(p.total ?? this.tours.length)
        this.perPage = Number(p.per_page ?? this.perPage)
        if (this.page > this.totalPages) this.page = this.totalPages
      } catch {
        Swal.fire('Error', 'No se pudo cargar la lista de tours', 'error')
      } finally {
        this.isLoading = false
      }
    },
    verTour (t) {
      if (!this.auth.can('tours.read')) {
        Swal.fire('Permiso denegado', 'No puedes ver tours.', 'warning')
        return
      }
      this.tourSeleccionado = { ...t }
    },
    editarTour (t) {
      if (!this.auth.can('tours.update')) {
        Swal.fire('Permiso denegado', 'No puedes editar tours.', 'warning')
        return
      }
      this.$router.push({ name: 'RegistroTour', query: { id: String(t.id) } })
    },
    async eliminarTour (t) {
      if (!this.auth.can('tours.delete')) {
        Swal.fire('Permiso denegado', 'No puedes eliminar tours.', 'warning')
        return
      }
      const confirm = await Swal.fire({
        title: '¿Eliminar tour?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (!confirm.isConfirmed) return
      try {
        await deleteTour(t.id)
        this.tours = this.tours.filter(x => x.id !== t.id)
        Swal.fire('Eliminado', 'Tour eliminado con éxito', 'success')
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el tour', 'error')
      }
    },
    async toggleEstadoFast (tour) {
      if (!this.auth.can('tours.update')) {
        Swal.fire('Permiso denegado', 'No puedes cambiar el estado de tours.', 'warning')
        return
      }
      const activo = this.estadoTexto(tour.estado) === 'Activo'
      const nuevo = activo ? 'inactivo' : 'activo'
      const anterior = tour.estado
      tour.estado = nuevo
      try {
        await updateTour(tour.id, { estado: nuevo })
      } catch {
        tour.estado = anterior
        Swal.fire('Error', 'No se pudo cambiar el estado del tour.', 'error')
      }
    },
    irPagina (p) {
      const next = Math.min(this.totalPages, Math.max(1, p))
      if (next !== this.page) {
        this.page = next
        this.cargarTours()
      }
    },
    cambiarPerPage (n) {
      this.perPage = Number(n) || 10
      this.page = 1
      this.cargarTours()
    }
  },
  async mounted () { await this.cargarTours() },
  watch: {
    $route (to, from) { if (from?.name === 'RegistroTour') this.cargarTours() },
    busqueda () {
      clearTimeout(this._searchTimer)
      this._searchTimer = setTimeout(() => { this.page = 1; this.cargarTours() }, 300)
    }
  }
}
</script>

<style scoped>
/* ====== Layout oscuro estilo “Hoteles” ====== */
.contenedor{
  padding:16px;
  background:#0f1423;
  min-height:100vh;
  color:#cfd3dc;
}
.encabezado{
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;flex-wrap:wrap;margin-bottom:12px
}
.encabezado h2{margin:0;font-weight:800;letter-spacing:.2px}
.encabezado h2 i{margin-right:8px;color:#51e1e6}

/* acciones derechas */
.acciones-top{display:flex;align-items:center;gap:8px}
.buscador{
  min-width:360px; height:40px;
  padding:8px 12px; border:1px solid #283247; border-radius:10px;
  background:#0b1020; color:#e6ecf6;
}
.buscador::placeholder{color:#8e99b2}

/* botones */
.btn{
  display:inline-flex;align-items:center;gap:8px;
  height:40px;padding:0 12px;border-radius:10px;cursor:pointer;
  border:1px solid #0ea5e9;color:#0ea5e9;background:transparent;
  font-weight:700;
}
.btn:hover{background:#0ea5e9;color:#fff}
.btn-reload:disabled{opacity:.6;cursor:default}
.btn-nuevo{
  display:inline-flex;align-items:center;gap:8px;
  height:40px;padding:0 14px;border-radius:10px;cursor:pointer;
  background:#10b981;color:#fff;border:1px solid #10b981;font-weight:800;
}
.btn-nuevo:hover{filter:brightness(1.06)}

/* ====== Tabla ====== */
.tabla-wrap{
  background:#0c1222;border:1px solid #1b2337;border-radius:12px;overflow:hidden;
  box-shadow:0 8px 22px rgba(0,0,0,.25)
}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #1b2337;padding:12px 14px}
.tabla thead th{
  background:#007b8a; color:#fff; text-align:left; font-weight:800;
}
.tabla tbody tr{transition:background .15s ease}
.tabla tbody tr:hover{background:#0e1830}
.corta{max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}

/* ====== Badges de estado ====== */
.badge{display:inline-block;padding:6px 12px;border-radius:999px;font-size:.82rem;font-weight:800}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}
.badge--temporada{background:#dbeafe;color:#1e40af}

/* ====== Acciones ====== */
.acciones{display:flex;gap:8px;align-items:center}
.acciones button{
  display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:8px;cursor:pointer;border:none;
  transition:transform .08s ease, filter .15s ease;
}
.acciones button:active{transform:scale(.97)}
.ver{background:#0dcaf0;color:#0b2a2f}
.editar{background:#ffc107;color:#1b1f2a}
.eliminar{background:#dc3545;color:#fff}

/* ====== Toggle estilo pastilla ====== */
.toggle{ position:relative; width:50px; height:26px; display:inline-block; cursor:pointer; }
.toggle input{ display:none; }
.track{
  position:absolute; inset:0;
  background:#ef4444;
  border-radius:999px;
  transition:background .18s ease, box-shadow .18s ease;
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.10);
}
.track::before{
  content:""; position:absolute; top:3px; left:3px;
  width:20px; height:20px; background:#fff; border-radius:50%;
  box-shadow:0 2px 6px rgba(0,0,0,.22);
  transition: transform .18s ease;
}
.toggle input:checked + .track{ background:#22c55e; }
.toggle input:checked + .track::before{ transform: translateX(24px); }
.toggle:focus-within .track{ box-shadow:0 0 0 4px rgba(239,68,68,.25), inset 0 0 0 2px rgba(0,0,0,.10); }

/* ====== Empty ====== */
.empty{margin-top:16px;color:#8a90a2}

/* ====== Paginación ====== */
.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{
  background:#2c2f48;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer
}
.btn-pager:disabled{opacity:.55;cursor:default}
.pager-select{
  background:#0b1020;color:#cfd3dc;border:1px solid #283247;border-radius:8px;padding:8px 10px
}

/* ====== Modal con scroll ====== */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:9999}
.modal-contenido{
  background:#fff;color:#111;border-radius:14px;
  width:min(820px, 92vw);
  max-height:min(80vh, 720px);
  overflow:auto;
  padding:18px 16px;
  box-shadow:0 10px 30px rgba(0,0,0,.25);
}
.modal-contenido h4{
  position:sticky;top:0;z-index:1;
  margin:0 0 12px 0;padding:10px 0;
  background:#fff;border-bottom:1px solid #e9ecef;font-weight:800
}
.tabla-detalle{width:100%;border-collapse:separate;border-spacing:0 6px}
.tabla-detalle td{padding:4px 6px;vertical-align:top}
.tabla-detalle td:first-child{white-space:nowrap;width:40%}
.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}

/* Thumbs de imágenes */
.thumbs{
  display:flex; flex-wrap:wrap; gap:8px;
}
.thumb{
  width:74px; height:74px; object-fit:cover;
  border-radius:10px; border:1px solid #e2e8f0;
}
</style>
