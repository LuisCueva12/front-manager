<!-- src/modules/proveedores/Proveedores.vue -->
<template>
  <div class="contenedor">
    <!-- Header -->
    <div class="encabezado">
      <h2><i class="bi bi-truck"></i> Proveedores</h2>

      <div class="acciones-top">
        <input
          v-model="busqueda"
          class="buscador"
          placeholder="Buscar proveedor…"
          @keyup.enter.prevent="go(1)"
        />

        <button type="button" class="btn" :disabled="loading" @click.prevent="go(page)">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>

        <router-link class="btn-nuevo" :to="{ name: 'RegistroProveedores' }">
          <i class="bi bi-plus-circle"></i> Nuevo
        </router-link>
      </div>
    </div>

    <!-- Table -->
    <div class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th style="width:60px">#</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>RUC</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th style="width:120px">Estado</th>
            <th style="width:170px">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center">Cargando…</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="8" class="text-center">No hay resultados</td>
          </tr>
          <tr v-else v-for="(p, i) in items" :key="p.id ?? i">
            <td>{{ indexBase + i }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ v(p.tipo) }}</td>
            <td>{{ v(p.ruc) }}</td>
            <td>{{ v(p.correo) }}</td>
            <td>{{ v(p.telefono) }}</td>
            <td>
              <span class="badge" :class="badgeClase(p.estado)">{{ estadoTexto(p.estado) }}</span>
            </td>
            <td class="acciones">
              <button type="button" class="ver" title="Ver" @click.stop="verProveedor(p)">
                <i class="bi bi-eye-fill"></i>
              </button>

              <router-link
                class="editar link-boton"
                :to="{ name: 'RegistroProveedores', query: { id: p.id } }"
                title="Editar"
                @click.stop
              >
                <i class="bi bi-pencil-square"></i>
              </router-link>

              <button
                type="button"
                class="eliminar"
                title="Eliminar"
                @click.stop="eliminarProveedor(p)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pager -->
    <div class="pager" v-if="pagination.total > pagination.per_page">
      <button class="btn-pager" :disabled="page<=1 || loading" @click="go(page-1)">Anterior</button>
      <span>Página {{ page }} / {{ pagination.last_page }}</span>
      <button class="btn-pager" :disabled="page>=pagination.last_page || loading" @click="go(page+1)">Siguiente</button>
    </div>

    <!-- Modal detalle (header sticky corregido, sin solaparse) -->
    <div v-if="seleccion" class="modal-overlay" @click.self="seleccion = null">
      <div class="modal-contenido">
        <div class="modal-header">
          <h4><i class="bi bi-card-text"></i> Proveedor</h4>
        </div>

        <div class="modal-body">
          <table class="tabla-detalle">
            <tr><td><strong>Nombre:</strong></td><td>{{ v(seleccion.nombre) }}</td></tr>
            <tr><td><strong>Tipo:</strong></td><td>{{ v(seleccion.tipo) }}</td></tr>
            <tr><td><strong>RUC:</strong></td><td>{{ v(seleccion.ruc) }}</td></tr>

            <tr><td><strong>Correo:</strong></td><td>{{ v(seleccion.correo) }}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>{{ v(seleccion.telefono) }}</td></tr>
            <tr><td><strong>Dirección:</strong></td><td>{{ v(seleccion.direccion) }}</td></tr>

            <tr><td><strong>Cuenta bancaria:</strong></td><td>{{ v(seleccion.cuentaBancaria || seleccion.cuenta) }}</td></tr>
            <tr><td><strong>CCI:</strong></td><td>{{ v(seleccion.cci) }}</td></tr>
            <tr><td><strong>Banco:</strong></td><td>{{ v(seleccion.banco) }}</td></tr>
            <tr><td><strong>Tipo de cuenta:</strong></td><td>{{ v(seleccion.tipo_cuenta) }}</td></tr>

            <tr><td><strong>Contacto - Nombre:</strong></td><td>{{ v(seleccion.representante) }}</td></tr>
            <tr><td><strong>Contacto - Cargo:</strong></td><td>{{ v(seleccion.contacto_cargo) }}</td></tr>
            <tr><td><strong>Contacto - Teléfono:</strong></td><td>{{ v(seleccion.contacto_telefono) }}</td></tr>
            <tr><td><strong>Contacto - Email:</strong></td><td>{{ v(seleccion.contacto_email) }}</td></tr>

            <tr><td><strong>Comisión (%):</strong></td><td>{{ seleccion.comision_porcentaje ?? '-' }}</td></tr>
            <tr>
              <td><strong>Estado:</strong></td>
              <td><span class="badge" :class="badgeClase(seleccion.estado)">{{ estadoTexto(seleccion.estado) }}</span></td>
            </tr>
            <tr><td><strong>Acuerdos:</strong></td><td>{{ v(seleccion.acuerdos) }}</td></tr>
          </table>

          <div class="acciones-modal">
            <button type="button" class="btn" @click="seleccion = null">Cerrar</button>
            <router-link
              class="btn editar-btn"
              :to="{ name: 'RegistroProveedores', query: { id: seleccion.id } }"
            >
              <i class="bi bi-pencil-square"></i> Editar
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { listProveedores, deleteProveedor } from '@/services/proveedorService'

export default {
  data() {
    return {
      busqueda: '',
      items: [],
      pagination: { current_page: 1, per_page: 10, last_page: 1, total: 0 },
      page: 1,
      perPage: 10,
      loading: false,
      seleccion: null,
      _debounce: null
    }
  },
  computed: {
    indexBase() {
      return (this.page - 1) * this.perPage + 1
    }
  },
  methods: {
    v(val) {
      return (val === null || val === undefined || String(val).trim() === '') ? '-' : val
    },
    estadoTexto(v) {
      const s = String(v || 'activo').toLowerCase()
      if (s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      return 'Activo'
    },
    badgeClase(v) {
      const s = String(v || 'activo').toLowerCase()
      return {
        'badge--activo': s === 'activo',
        'badge--inactivo': s === 'inactivo',
        'badge--suspendido': s === 'suspendido'
      }
    },
    async cargar() {
      this.loading = true
      try {
        const { items, pagination } = await listProveedores({
          q: this.busqueda,
          page: this.page,
          perPage: this.perPage
        })
        this.items = (items || []).map(p => ({ estado: 'activo', ...p }))
        this.pagination = pagination || {
          current_page: this.page,
          per_page: this.perPage,
          total: this.items.length,
          last_page: 1
        }
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar proveedores', 'error')
      } finally {
        this.loading = false
      }
    },
    go(p) {
      this.page = Math.max(1, p)
      this.cargar()
    },
    verProveedor(p) {
      this.seleccion = p
    },
    async eliminarProveedor(p) {
      const c = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: `${p.nombre || 'Proveedor'}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (!c.isConfirmed) return
      try {
        await deleteProveedor(p.id)
        if (this.items.length === 1 && this.page > 1) this.page -= 1
        this.cargar()
        Swal.fire('Eliminado', 'Proveedor eliminado', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  },
  mounted() {
    this.cargar()
  },
  watch: {
    busqueda() {
      clearTimeout(this._debounce)
      this._debounce = setTimeout(() => {
        this.page = 1
        this.cargar()
      }, 350)
    }
  }
}
</script>

<style scoped>
.contenedor{padding:16px;position:relative;color:#cfd3dc}
.encabezado{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.acciones-top{display:flex;align-items:center;gap:8px}
.buscador{min-width:260px;padding:8px 10px;border:1px solid #2b2f3a;border-radius:6px;background:#151722;color:#cfd3dc}
.btn,.btn-nuevo{padding:8px 12px;border-radius:6px;border:1px solid #0d6efd;color:#0d6efd;background:transparent;cursor:pointer;text-decoration:none}
.btn:hover,.btn-nuevo:hover{background:#0d6efd;color:#fff}

.tabla-wrap{background:#1a1d2b;border-radius:6px;overflow:hidden}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #2b2f3a;padding:10px}
.tabla thead th{background:#007b8a;color:#fff;text-align:left}
.text-center{text-align:center}

.acciones{display:flex;gap:6px;align-items:center}
.acciones button,.acciones .link-boton{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:6px;cursor:pointer;text-decoration:none}
.ver{background:#0dcaf0;border:none;color:#0b2a2f}
.editar.link-boton{background:#ffc107;color:#1b1f2a}
.eliminar{background:#dc3545;border:none;color:#fff}

.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}

.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{background:#2c2f48;color:#fff;border:none;padding:6px 10px;border-radius:6px}

/* ---------- MODAL con scroll + header sticky sin solaparse ---------- */
.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:grid;
  place-items:center;
  z-index:9999;
  padding:16px;
}

.modal-contenido{
  background:#fff;
  color:#111;
  border-radius:10px;
  min-width:320px;
  width:90vw;
  max-width:900px;
  max-height:85vh;
  overflow:auto;                 /* scroll en el contenedor */
  overscroll-behavior: contain;
  padding:0;                     /* 👉 header y body manejan su propio padding */
  /* Scrollbar (Firefox) */
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #e5e7eb;
}
/* Scrollbar (Chromium/WebKit) */
.modal-contenido::-webkit-scrollbar{ width:10px; }
.modal-contenido::-webkit-scrollbar-track{ background:#e5e7eb; border-radius:999px; }
.modal-contenido::-webkit-scrollbar-thumb{ background:#94a3b8; border-radius:999px; }
.modal-contenido::-webkit-scrollbar-thumb:hover{ background:#64748b; }

/* Header pegajoso, siempre visible y SIN márgenes negativos */
.modal-header{
  position: sticky;
  top: 0;
  z-index: 2;
  background:#fff;
  padding:12px 16px;
  border-bottom:1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0,0,0,.04);
}
.modal-header h4{ margin:0; display:flex; gap:8px; align-items:center }

/* Cuerpo del modal */
.modal-body{ padding:16px; }

.tabla-detalle{ width:100%; }
.tabla-detalle td{padding:6px 10px;vertical-align:top}

.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
.editar-btn{border-color:#ffc107;color:#1b1f2a}
.editar-btn:hover{background:#ffc107;color:#1b1f2a}
</style>
