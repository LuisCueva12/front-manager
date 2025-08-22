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
        <button type="button" class="btn" :disabled="isLoading" @click="cargarTours">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
        <button type="button" class="btn-nuevo" @click="irCrear">
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
            <th style="width:160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tour, index) in toursFiltrados" :key="tour.id ?? index">
            <td>{{ index + 1 + (page - 1) * perPage }}</td>

            <td>{{ tour.nombre || tour.nombre_tour || '—' }}</td>

            <td>{{ tour.destino_nombre || tour.destino?.nombre || tour.ciudad || '—' }}</td>

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
              <button type="button" class="ver" title="Ver" @click.stop="verTour(tour)">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button type="button" class="editar" title="Editar" @click.stop="editarTour(tour)">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button type="button" class="eliminar" title="Eliminar" @click.stop="eliminarTour(tour)">
                <i class="bi bi-trash-fill"></i>
              </button>
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

    <!-- Modal detalle con scroll -->
    <div v-if="tourSeleccionado" class="modal-overlay" @click.self="tourSeleccionado = null">
      <div class="modal-contenido">
        <h4><i class="bi bi-card-text"></i> Resumen del Tour</h4>

        <table class="tabla-detalle">
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
          <tr><td><strong>Observaciones:</strong></td><td>{{ tourSeleccionado.observaciones || 'Ninguna' }}</td></tr>
          <tr>
            <td><strong>Estado:</strong></td>
            <td>
              <span class="badge" :class="badgeClase(tourSeleccionado.estado)">
                {{ estadoTexto(tourSeleccionado.estado) }}
              </span>
            </td>
          </tr>
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
import { listTours, deleteTour } from '@/services/tours'

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
    observaciones: raw.observaciones || '',
    estado: raw.estado || t.estado || 'activo',
    _raw: raw
  }
}

export default {
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
    totalPages () { return Math.max(1, Math.ceil(this.total / this.perPage)) }
  },
  methods: {
    irCrear () { this.$router.push({ name: 'RegistroTour' }) },
    fmtHora (h) { if (!h) return ''; const [hh='00',mm='00']=String(h).split(':'); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` },
    fmtMoneda (n) { const num = Number(n || 0); return `S/ ${num.toFixed(2)}` },
    fmtCap (s) { if (!s) return ''; const t=String(s).toLowerCase(); return t.charAt(0).toUpperCase()+t.slice(1).replace('_',' ') },
    fmtTipo (t) {
      const map={ full_day:'Full day', half_day:'Half day', multi_day:'Multi day', trekking:'Trekking', cultural:'Cultural', aventura:'Aventura', gastronomico:'Gastronómico' }
      return map[String(t).toLowerCase()] || this.fmtCap(t)
    },
    mapDiasBonitos,
    // ✅ Ahora incluye "Temporada"
    estadoTexto(v){
      const s = String(v || 'activo').toLowerCase()
      if (s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      if (s === 'temporada') return 'Temporada'
      return 'Activo'
    },
    // ✅ Clase visual para "Temporada"
    badgeClase(v){
      const s = String(v || 'activo').toLowerCase()
      return {
        'badge--activo': s === 'activo',
        'badge--inactivo': s === 'inactivo',
        'badge--suspendido': s === 'suspendido',
        'badge--temporada': s === 'temporada'
      }
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
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar la lista de tours', 'error')
      } finally {
        this.isLoading = false
      }
    },
    verTour (t) { this.tourSeleccionado = { ...t } },
    editarTour (t) { this.$router.push({ name: 'RegistroTour', query: { id: t.id } }) },
    async eliminarTour (t) {
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
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo eliminar el tour', 'error')
      }
    },
    irPagina (p) { const next=Math.min(this.totalPages, Math.max(1,p)); if(next!==this.page){ this.page=next; this.cargarTours() } },
    cambiarPerPage (n) { this.perPage=Number(n)||10; this.page=1; this.cargarTours() }
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
/* Layout base */
.contenedor{padding:16px;background:#1e1e2f;min-height:100vh;color:#cfd3dc}
.encabezado{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.acciones-top{display:flex;align-items:center;gap:8px}
.buscador{min-width:260px;padding:8px 10px;border:1px solid #2b2f3a;border-radius:6px;background:#151722;color:#cfd3dc}
.btn,.btn-nuevo{padding:8px 12px;border-radius:6px;border:1px solid #0d6efd;color:#0d6efd;background:transparent;cursor:pointer;text-decoration:none}
.btn:hover,.btn-nuevo:hover{background:#0d6efd;color:#fff}

/* Tabla */
.tabla-wrap{background:#1a1d2b;border-radius:6px;overflow:hidden}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #2b2f3a;padding:10px}
.tabla thead th{background:#007b8a;color:#fff;text-align:left}

/* Badges de estado */
.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}
/* ✅ Nuevo estilo para "Temporada" */
.badge--temporada{background:#dbeafe;color:#1e40af}

/* Acciones */
.acciones{display:flex;gap:6px;align-items:center}
.acciones button{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:6px;cursor:pointer;border:none}
.ver{background:#0dcaf0;color:#0b2a2f}
.editar{background:#ffc107;color:#1b1f2a}
.eliminar{background:#dc3545;color:#fff}

.empty{margin-top:16px;color:#8a90a2}

/* Paginación */
.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{background:#2c2f48;color:#fff;border:none;padding:6px 10px;border-radius:6px}
.pager-select{background:#151722;color:#cfd3dc;border:1px solid #2b2f3a;border-radius:6px;padding:6px 8px}

/* Modal con scroll y header pegajoso */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:9999}
.modal-contenido{
  background:#fff;color:#111;border-radius:12px;
  width:min(780px, 92vw);
  max-height:min(80vh, 680px);
  overflow:auto;
  padding:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.25);
}
.modal-contenido h4{
  position:sticky;top:0;z-index:1;
  margin:0 0 10px 0;padding:8px 0;
  background:#fff;border-bottom:1px solid #e9ecef;
}
.tabla-detalle{width:100%;border-collapse:separate;border-spacing:0 6px}
.tabla-detalle td{padding:2px 6px;vertical-align:top}
.tabla-detalle td:first-child{white-space:nowrap;width:40%}
.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
</style>
