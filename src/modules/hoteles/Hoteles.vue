<!-- src/modules/hoteles/Hoteles.vue -->
<template>
  <div class="wrap">
    <!-- Título + buscador + botones -->
    <div class="toolbar">
      <h1 class="title">
        <i class="bi bi-buildings"></i>
        Lista de Hoteles
      </h1>

      <div class="tools">
        <input v-model="busqueda" class="search" placeholder="Buscar hotel..." />
        <button class="btn btn-outline" @click="cargarHoteles">
          <i class="bi bi-arrow-repeat"></i> Recargar
        </button>

        <!-- Nuevo hotel: solo si tiene permiso -->
        <router-link v-if="auth.can('hoteles.create')" to="/registro-hotel" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Nuevo Hotel
        </router-link>
      </div>
    </div>

    <div class="table-card">
      <table class="tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Destino</th>
            <th>Horario</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(hotel, index) in hotelesFiltrados" :key="hotel.id">
            <td>{{ index + 1 }}</td>
            <td>{{ hotel.nombre_hotel }}</td>
            <td>{{ (hotel.destino && (hotel.destino.nombre || hotel.destino.ciudad || hotel.destino.nombre_destino)) || '-' }}</td>
            <td>{{ fmtHora(hotel.check_in) + ' - ' + fmtHora(hotel.check_out) }}</td>
            <td>{{ hotel.telefono_hotel || '-' }}</td>
            <td>{{ hotel.correo || '-' }}</td>

            <td>
              <span class="pill" :class="estadoClase(hotel)">{{ estadoTexto(hotel) }}</span>
            </td>

            <td class="acciones">
              <!-- Ver (lectura) -->
              <button
                v-if="auth.can('hoteles.read')"
                class="act-btn cyan"
                title="Ver"
                @click="verHotel(hotel)"
              >
                <i class="bi bi-eye-fill"></i>
              </button>

              <!-- Editar -->
              <button
                v-if="auth.can('hoteles.update')"
                class="act-btn yellow"
                title="Editar"
                @click="editarHotel(hotel)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>

              <!-- Eliminar -->
              <button
                v-if="auth.can('hoteles.delete')"
                class="act-btn red"
                title="Eliminar"
                @click="eliminarHotelUI(hotel)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>

              <!-- Toggle estado (optimistic UI) -->
              <label
                v-if="auth.can('hoteles.update')"
                class="switch"
                :title="estadoTexto(hotel)==='Activo' ? 'Desactivar' : 'Activar'"
              >
                <input
                  type="checkbox"
                  :checked="estadoTexto(hotel)==='Activo'"
                  @change="toggleEstadoFast(hotel)"
                />
                <span class="slider">
                  <i v-if="estadoTexto(hotel)==='Activo'" class="bi bi-check-lg"></i>
                  <i v-else class="bi bi-x-lg"></i>
                </span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal resumen con TODOS los detalles -->
    <div v-if="hotelSeleccionado" class="dropzone-overlay" @click.self="hotelSeleccionado = null">
      <div class="dropzone">
        <h4><i class="bi bi-card-text"></i> Resumen del Hotel</h4>
        <table class="detail">
          <tbody>
            <tr><td><strong>Nombre:</strong></td><td>{{ hotelSeleccionado.nombre_hotel || '-' }}</td></tr>
            <tr><td><strong>Proveedor:</strong></td><td>{{ provName }}</td></tr>
            <tr><td><strong>Correo:</strong></td><td>{{ hotelSeleccionado.correo || '-' }}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>{{ hotelSeleccionado.telefono_hotel || '-' }}</td></tr>

            <tr><td><strong>Ciudad:</strong></td><td>{{ destName }}</td></tr>
            <tr><td><strong>Dirección:</strong></td><td>{{ hotelSeleccionado.direccion || '-' }}</td></tr>
            <tr><td><strong>Categoría:</strong></td><td>{{ hotelSeleccionado.categoria || '-' }}</td></tr>

            <tr>
              <td><strong>Check-in / Check-out:</strong></td>
              <td>{{ fmtHora(hotelSeleccionado.check_in) + ' / ' + fmtHora(hotelSeleccionado.check_out) }}</td>
            </tr>

            <tr>
              <td><strong>Latitud / Longitud:</strong></td>
              <td>{{ (hotelSeleccionado.latitud ?? '-') + ' / ' + (hotelSeleccionado.longitud ?? '-') }}</td>
            </tr>

            <tr>
              <td><strong>Estado:</strong></td>
              <td><span class="pill" :class="estadoClase(hotelSeleccionado)">{{ estadoTexto(hotelSeleccionado) }}</span></td>
            </tr>

            <tr><td><strong>Ubicación geográfica:</strong></td><td class="pre">{{ hotelSeleccionado.ubicacion_geografica || '-' }}</td></tr>
            <tr><td><strong>Política de cancelación:</strong></td><td class="pre">{{ hotelSeleccionado.politica_cancelacion || '-' }}</td></tr>
            <tr><td><strong>Condiciones:</strong></td><td class="pre">{{ hotelSeleccionado.condiciones || '-' }}</td></tr>

            <tr v-if="imgList.length">
              <td><strong>Imágenes:</strong></td>
              <td>
                <div class="thumbs">
                  <a v-for="(img,i) in imgList" :key="i" :href="img" target="_blank" rel="noopener">
                    <img :src="img" alt="imagen" />
                  </a>
                </div>
              </td>
            </tr>

            <tr><td><strong>Creado:</strong></td><td>{{ hotelSeleccionado.created_at || '-' }}</td></tr>
            <tr><td><strong>Actualizado:</strong></td><td>{{ hotelSeleccionado.updated_at || '-' }}</td></tr>
          </tbody>
        </table>

        <button @click="hotelSeleccionado = null" class="btn btn-secondary mt-3">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { getHoteles, deleteHotel, updateHotel } from '@/services/hotelService'
import { API_BASE_URL } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const FILE_BASE = API_BASE_URL.replace(/\/api$/, '')

export default {
  name: 'Hoteles',
  setup () {
    const auth = useAuthStore()
    return { auth }
  },
  data() {
    return {
      busqueda: '',
      hoteles: [],
      hotelSeleccionado: null
    }
  },
  computed: {
    hotelesFiltrados() {
      const t = this.busqueda.trim().toLowerCase()
      if (!t) return this.hoteles
      return this.hoteles.filter(h => {
        const nombre = (h.nombre_hotel || '').toLowerCase()
        const correo = (h.correo || '').toLowerCase()
        const telefono = (h.telefono_hotel || '').toLowerCase()
        const destino =
          (h.destino && (h.destino.nombre || h.destino.ciudad || h.destino.nombre_destino) || '').toLowerCase()
        return nombre.includes(t) || correo.includes(t) || telefono.includes(t) || destino.includes(t)
      })
    },
    provName() {
      const p = this.hotelSeleccionado?.proveedor
      return p ? (p.nombre || p.razon_social || p.nombre_comercial || `Proveedor #${p.id}`) : '-'
    },
    destName() {
      const d = this.hotelSeleccionado?.destino
      return d ? (d.nombre || d.ciudad || d.nombre_destino || `Destino #${d.id}`) : '-'
    },
    serviciosList() {
      const raw = this.hotelSeleccionado?.servicios_incluidos
      if (Array.isArray(raw)) return raw.filter(Boolean)
      if (typeof raw === 'string') {
        try {
          const j = JSON.parse(raw)
          if (Array.isArray(j)) return j.filter(Boolean)
        } catch {}
        return raw.split(',').map(s => s.trim()).filter(Boolean)
      }
      return []
    },
    imgList() {
      const raw = this.hotelSeleccionado?.imagenes
      let arr = []
      if (Array.isArray(raw)) arr = raw
      else if (typeof raw === 'string') {
        try {
          const j = JSON.parse(raw)
          arr = Array.isArray(j) ? j : (raw ? [raw] : [])
        } catch {
          arr = raw.split(',').map(s => s.trim()).filter(Boolean)
        }
      }
      return arr.map(u => this.imgSrc(u)).filter(Boolean)
    }
  },
  methods: {
    imgSrc(v) {
      if (!v) return ''
      const s = String(v)
      if (/^https?:\/\//i.test(s)) return s
      const path = s.replace(/^\/+/, '')
      return `${FILE_BASE}/${path}`
    },
    fmtHora(v) {
      if (!v) return '—'
      const s = String(v)
      const m = s.match(/^(\d{1,2}):(\d{2})/)
      return m ? `${m[1].padStart(2,'0')}:${m[2]}` : '—'
    },
    estadoTexto(h) {
      const v = h.estado
      if (v === 1 || v === '1' || v === true || v === 'activo' || v === 'Activo') return 'Activo'
      if (v === 0 || v === '0' || v === false || v === 'inactivo' || v === 'Inactivo') return 'Inactivo'
      if (v === 'mantenimiento') return 'Mantenimiento'
      return 'Inactivo'
    },
    estadoClase(h) {
      const t = this.estadoTexto(h)
      return {
        'pill-success': t === 'Activo',
        'pill-warning': t === 'Mantenimiento',
        'pill-secondary': t === 'Inactivo'
      }
    },
    extractList(body) {
      if (Array.isArray(body)) return body
      if (Array.isArray(body?.data)) return body.data
      if (Array.isArray(body?.data?.data)) return body.data.data
      return []
    },
    async cargarHoteles() {
      try {
        const { data } = await getHoteles()
        this.hoteles = this.extractList(data)
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar la lista de hoteles.', 'error')
      }
    },
    verHotel(hotel) {
      if (!this.auth.can('hoteles.read')) {
        Swal.fire('Permiso denegado', 'No puedes ver hoteles.', 'warning')
        return
      }
      this.hotelSeleccionado = hotel
    },
    editarHotel(hotel) {
      if (!this.auth.can('hoteles.update')) {
        Swal.fire('Permiso denegado', 'No puedes editar hoteles.', 'warning')
        return
      }
      localStorage.setItem('hotelEdicion', JSON.stringify(hotel))
      this.$router.push('/registro-hotel')
    },
    async toggleEstadoFast(hotel) {
      if (!this.auth.can('hoteles.update')) {
        Swal.fire('Permiso denegado', 'No puedes cambiar el estado de hoteles.', 'warning')
        return
      }
      const activo = this.estadoTexto(hotel) === 'Activo'
      const nuevo = activo ? 'inactivo' : 'activo'
      const anterior = hotel.estado
      hotel.estado = nuevo
      try {
        await updateHotel(hotel.id, { estado: nuevo })
      } catch (e) {
        hotel.estado = anterior
        console.error(e)
        Swal.fire('Error', 'No se pudo cambiar el estado.', 'error')
      }
    },
    async eliminarHotelUI(hotel) {
      if (!this.auth.can('hoteles.delete')) {
        Swal.fire('Permiso denegado', 'No puedes eliminar hoteles.', 'warning')
        return
      }
      const ok = await Swal.fire({
        title: '¿Eliminar hotel?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Sí, eliminar'
      })
      if (!ok.isConfirmed) return
      try {
        await deleteHotel(hotel.id)
        await this.cargarHoteles()
        Swal.fire('Eliminado', 'El hotel ha sido eliminado.', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo eliminar el hotel.', 'error')
      }
    }
  },
  mounted() { this.cargarHoteles() },
  watch: {
    '$route'(to, from) { if (from.path === '/registro-hotel') this.cargarHoteles() }
  }
}
</script>

<style scoped>
/* ====== Layout general ====== */
.wrap { padding: 20px; background:#1a1b2b; min-height:100vh; color:#fff; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px; }
.title { margin:0; font-size:28px; font-weight:800; display:flex; align-items:center; gap:10px; }
.tools { display:flex; align-items:center; gap:10px; }
.search {
  width: 360px; max-width: 40vw;
  background:#0f1122; color:#e9eef6;
  border:1px solid #24314b; border-radius:10px; padding:10px 12px;
}

/* ====== Botones ====== */
.btn {
  display:inline-flex; align-items:center; gap:8px;
  border-radius:10px; padding:10px 14px; font-weight:800;
  height:40px; cursor:pointer; text-decoration:none;
  border:1.5px solid transparent; transition:background-color .2s ease, border-color .2s ease, color .2s ease, transform .05s ease, box-shadow .2s ease;
}
.btn i { font-size:1rem; }

/* Outline azul (Recargar) */
.btn-outline {
  background:transparent;
  color:#19b1ff;              /* texto azul */
  border-color:#0ea5e9;       /* borde azul */
  box-shadow: inset 0 0 0 2px rgba(14,165,233,.12);
}
.btn-outline:hover {
  background:rgba(14,165,233,.10);
  color:#8bdcff;
  border-color:#38bdf8;
}
.btn-outline:focus { outline:none; box-shadow:0 0 0 3px rgba(56,189,248,.25); }
.btn-outline:active { transform:translateY(1px); }

/* Verde sólido (Nuevo) */
.btn-primary {
  background:#10b981;
  color:#fff;
  border-color:#10b981;
  box-shadow:0 2px 0 rgba(0,0,0,.08), inset 0 -2px 0 rgba(0,0,0,.08);
}
.btn-primary:hover   { background:#059669; border-color:#059669; }
.btn-primary:focus   { outline:none; box-shadow:0 0 0 3px rgba(16,185,129,.25); }
.btn-primary:active  { transform:translateY(1px); }

/* ====== Tabla ====== */
.table-card { background:#0f1122; border-radius:12px; overflow:hidden; }
.tabla { width:100%; border-collapse:collapse; color:#e8e8f0; }
.tabla thead th { background:#007b8a; color:#fff; padding:12px; text-align:left; }
.tabla tbody td { padding:12px; border-bottom:1px solid #232742; }
.th-actions { width:220px; }

/* Estado pill */
.pill { display:inline-block; padding:4px 10px; border-radius:999px; font-weight:700; font-size:.82rem; }
.pill-success  { background:#c8f7e1; color:#0d683b; }
.pill-warning  { background:#fff1c2; color:#6b4e00; }
.pill-secondary{ background:#e0e3ea; color:#2c2f36; }

/* Acciones cuadradas */
.acciones { display:flex; align-items:center; gap:8px; }
.act-btn {
  width:36px; height:36px; display:grid; place-items:center;
  border:none; border-radius:10px; cursor:pointer;
  transition:transform .08s ease, filter .08s ease;
  color:#06111a; font-size:18px;
}
.act-btn:hover { transform:translateY(-1px); filter:brightness(1.05); }
.cyan   { background:#0dcaf0; color:#052a33; }
.yellow { background:#ffc107; color:#4f3c00; }
.red    { background:#dc3545; color:#fff; }

/* Toggle compacto */
.switch { position: relative; width: 44px; height: 22px; display:inline-flex; align-items:center; }
.switch input { display:none; }
.slider {
  position:absolute; inset:0; background:#ff4d4f; border-radius:999px;
  transition: background .12s ease; box-shadow: inset 0 0 0 2px rgba(255,255,255,.06);
}
.slider::before {
  content:""; position:absolute; height:18px; width:18px; left:3px; top:2px;
  background:#fff; border-radius:50%; transition: transform .12s ease; box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.slider i { position:absolute; top:50%; transform:translate(-50%,-50%); left:18px; font-size:12px; color:#fff; transition:left .12s ease; }
.switch input:checked + .slider { background:#22c55e; }
.switch input:checked + .slider::before { transform: translateX(22px); }
.switch input:checked + .slider i { left:30px; }

/* ====== Modal ====== */
.dropzone-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; padding:16px; z-index:1000; }
.dropzone { background:#fff; color:#000; padding:20px; border-radius:12px; width:90%; max-width:680px; }
.dropzone h4 { color:#007b8a; display:flex; align-items:center; gap:6px; margin:0 0 10px; }
.dropzone table.detail { width:100%; font-size:.95rem; }
.dropzone td { padding:6px; vertical-align:top; }
.pre { white-space: pre-wrap; }
.thumbs { display:flex; gap:8px; flex-wrap:wrap; }
.thumbs img { height:48px; border-radius:6px; border:1px solid #dfe6ee; display:block; }
.btn.btn-secondary { background:#6c757d; color:#fff; border:none; border-radius:10px; padding:8px 14px; }
</style>
