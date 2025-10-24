<!-- src/modules/proveedores/Proveedores.vue -->
<template>
  <div class="contenedor">
    <!-- Header -->
    <div class="encabezado">
      <h2><i class="bi bi-truck"></i> Lista de Proveedores</h2>

      <div class="acciones-top">
        <input
          v-model="busqueda"
          class="buscador"
          placeholder="Buscar proveedor…"
          @keyup.enter.prevent="go(1)"
        />

        <button type="button" class="btn btn-reload" :disabled="loading" @click.prevent="go(page)">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>

        <!-- Nuevo: solo si permiso -->
        <router-link
          v-if="auth.can('proveedores.create')"
          class="btn-nuevo"
          :to="{ name: 'RegistroProveedores' }"
        >
          <i class="bi bi-plus-circle"></i> Nuevo Proveedor
        </router-link>
      </div>
    </div>

    <!-- Tabla -->
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
            <th style="width:200px">Acciones</th>
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
            <td class="corta">{{ p.nombre }}</td>
            <td class="corta">{{ v(p.tipo) }}</td>
            <td>{{ v(p.ruc) }}</td>
            <td class="corta">{{ v(p.correo) }}</td>
            <td>{{ v(p.telefono) }}</td>

            <td>
              <span class="badge" :class="badgeClase(p.estado)">
                {{ estadoTexto(p.estado) }}
              </span>
            </td>

            <td class="acciones">
              <!-- Ver -->
              <button
                v-if="auth.can('proveedores.read')"
                type="button"
                class="ver"
                title="Ver"
                @click.stop="verProveedor(p)"
              >
                <i class="bi bi-eye-fill"></i>
              </button>

              <!-- Editar -->
              <router-link
                v-if="auth.can('proveedores.update')"
                class="editar link-boton"
                :to="{ name: 'RegistroProveedores', query: { id: p.id } }"
                title="Editar"
                @click.stop
              >
                <i class="bi bi-pencil-square"></i>
              </router-link>

              <!-- Eliminar -->
              <button
                v-if="auth.can('proveedores.delete')"
                type="button"
                class="eliminar"
                title="Eliminar"
                @click.stop="eliminarProveedor(p)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>

              <!-- Toggle de estado (UI optimista) -->
              <label
                v-if="auth.can('proveedores.update')"
                class="switch"
                :title="estadoTexto(p.estado)==='Activo' ? 'Desactivar' : 'Activar'"
                style="margin-left:6px"
              >
                <input
                  type="checkbox"
                  :checked="estadoTexto(p.estado)==='Activo'"
                  @change="toggleEstadoFast(p)"
                />
                <span class="slider">
                  <i v-if="estadoTexto(p.estado)==='Activo'" class="bi bi-check-lg"></i>
                  <i v-else class="bi bi-x-lg"></i>
                </span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pager" v-if="pagination.total > pagination.per_page">
      <button class="btn-pager" :disabled="page<=1 || loading" @click="go(page-1)">Anterior</button>
      <span>Página {{ page }} / {{ pagination.last_page }}</span>
      <button class="btn-pager" :disabled="page>=pagination.last_page || loading" @click="go(page+1)">Siguiente</button>
    </div>

    <!-- Modal detalle (header sticky) -->
    <div v-if="seleccion" class="modal-overlay" @click.self="seleccion = null">
      <div class="modal-contenido">
        <div class="modal-header">
          <h4><i class="bi bi-card-text"></i> Proveedor</h4>
        </div>

        <div class="modal-body">
          <table class="tabla-detalle">
            <tbody>
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
            </tbody>
          </table>

          <div class="acciones-modal">
            <button type="button" class="btn" @click="seleccion = null">Cerrar</button>
            <router-link
              v-if="auth.can('proveedores.update')"
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
import { listProveedores, deleteProveedor, updateProveedor } from '@/services/proveedorService'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Proveedores',
  setup () {
    const auth = useAuthStore()
    return { auth }
  },
  data () {
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
    indexBase () { return (this.page - 1) * this.perPage + 1 }
  },
  methods: {
    v (val) { return (val === null || val === undefined || String(val).trim() === '') ? '-' : val },

    estadoTexto (v) {
      const s = String(v ?? 'activo').toLowerCase()
      if (s === '1' || s === 'true' || s === 'activo') return 'Activo'
      if (s === '0' || s === 'false' || s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      return 'Activo'
    },
    badgeClase (v) {
      const s = String(v ?? 'activo').toLowerCase()
      return {
        'badge--activo': s === 'activo' || s === '1' || s === 'true',
        'badge--inactivo': s === 'inactivo' || s === '0' || s === 'false',
        'badge--suspendido': s === 'suspendido'
      }
    },

    async cargar () {
      this.loading = true
      try {
        const { items, pagination } = await listProveedores({
          q: this.busqueda,
          page: this.page,
          perPage: this.perPage
        })
        // Aseguramos estado por defecto y conservamos _raw para updates
        this.items = (items || []).map(p => ({ estado: p.estado ?? 'activo', ...p }))
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

    go (p) {
      this.page = Math.max(1, p)
      this.cargar()
    },

    verProveedor (p) {
      if (!this.auth.can('proveedores.read')) {
        Swal.fire('Permiso denegado', 'No puedes ver proveedores.', 'warning')
        return
      }
      this.seleccion = p
    },

    async eliminarProveedor (p) {
      if (!this.auth.can('proveedores.delete')) {
        Swal.fire('Permiso denegado', 'No puedes eliminar proveedores.', 'warning')
        return
      }
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
    },

    // Cambiar estado de forma optimista — enviamos _raw para no sobreescribir con nulls
    async toggleEstadoFast (p) {
      if (!this.auth.can('proveedores.update')) {
        Swal.fire('Permiso denegado', 'No puedes cambiar el estado de proveedores.', 'warning')
        return
      }
      const activo = this.estadoTexto(p.estado) === 'Activo'
      const nuevo = activo ? 'inactivo' : 'activo'
      const anterior = p.estado
      p.estado = nuevo
      try {
        const payload = p._raw ? { ...p._raw, estado: nuevo } : { estado: nuevo }
        await updateProveedor(p.id, payload)
      } catch (e) {
        p.estado = anterior
        console.error(e)
        Swal.fire('Error', 'No se pudo cambiar el estado.', 'error')
      }
    }
  },
  mounted () { this.cargar() },
  watch: {
    busqueda () {
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
/* ===== Layout / contenedor ===== */
.contenedor{padding:16px;position:relative;color:#cfd3dc;background:#1e1e2f;min-height:100vh}
.encabezado{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.acciones-top{display:flex;align-items:center;gap:12px}
.buscador{min-width:360px;height:40px;padding:8px 12px;border:1px solid #2b2f3a;border-radius:12px;background:#0b1020;color:#e6ecf6}

/* ===== Botones superiores (como la captura) ===== */

/* Base */
.btn,
.btn-nuevo{
  height:40px;
  padding:0 14px;
  border-radius:12px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-weight:800;
  text-decoration:none;
  cursor:pointer;
  border:1.5px solid transparent;
  background:transparent;
  color:#e6ecf6;
  transition:
    background-color .2s ease,
    border-color .2s ease,
    color .2s ease,
    transform .05s ease,
    box-shadow .2s ease;
}
.btn i,
.btn-nuevo i{font-size:1rem}

/* Recargar: outline azul */
.btn-reload{
  background:transparent;
  color:#19b1ff;          /* texto */
  border-color:#0ea5e9;   /* borde */
  box-shadow:inset 0 0 0 2px rgba(14,165,233,.12);
}
.btn-reload:hover{
  background:rgba(14,165,233,.10);
  color:#8bdcff;
  border-color:#38bdf8;
}
.btn-reload:focus{outline:none;box-shadow:0 0 0 3px rgba(56,189,248,.25)}
.btn-reload:active{transform:translateY(1px)}

/* Nuevo Proveedor: verde sólido */
.btn-nuevo{
  background:#10b981;
  border-color:#10b981;
  color:#fff;
  box-shadow:0 2px 0 rgba(0,0,0,.08), inset 0 -2px 0 rgba(0,0,0,.08);
}
.btn-nuevo:hover{background:#059669;border-color:#059669}
.btn-nuevo:focus{outline:none;box-shadow:0 0 0 3px rgba(16,185,129,.25)}
.btn-nuevo:active{transform:translateY(1px)}

/* Deshabilitado */
.btn:disabled{opacity:.6;cursor:not-allowed;filter:grayscale(.1)}

/* ===== Tabla ===== */
.tabla-wrap{background:#1a1d2b;border-radius:6px;overflow:hidden}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #2b2f3a;padding:10px}
.tabla thead th{background:#007b8a;color:#fff;text-align:left}
.text-center{text-align:center}
.corta{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ===== Acciones por fila ===== */
.acciones{display:flex;gap:6px;align-items:center}
.acciones button,.acciones .link-boton{
  display:inline-flex;align-items:center;justify-content:center;
  width:34px;height:34px;border-radius:6px;cursor:pointer;text-decoration:none;border:none
}
.ver{background:#0dcaf0;color:#0b2a2f}
.editar.link-boton{background:#ffc107;color:#1b1f2a}
.eliminar{background:#dc3545;color:#fff}

/* ===== Badges ===== */
.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}

/* ===== Paginación ===== */
.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{background:#2c2f48;color:#fff;border:none;padding:6px 10px;border-radius:6px}

/* ===== Modal ===== */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:9999;padding:16px}
.modal-contenido{background:#fff;color:#111;border-radius:12px;min-width:320px;width:90vw;max-width:900px;max-height:85vh;overflow:auto;padding:0}
.modal-header{position:sticky;top:0;z-index:2;background:#fff;padding:12px 16px;border-bottom:1px solid #e5e7eb;box-shadow:0 2px 4px rgba(0,0,0,.04)}
.modal-header h4{margin:0;display:flex;gap:8px;align-items:center}
.modal-body{padding:16px}
.tabla-detalle{width:100%}
.tabla-detalle td{padding:6px 10px;vertical-align:top}
.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
.editar-btn{border-color:#ffc107;color:#1b1f2a}
.editar-btn:hover{background:#ffc107;color:#1b1f2a}

/* ===== Switch ===== */
.switch{position:relative;width:44px;height:22px;display:inline-flex;align-items:center}
.switch input{display:none}
.slider{position:absolute;inset:0;background:#ff4d4f;border-radius:999px;transition:background .12s ease;box-shadow:inset 0 0 0 2px rgba(255,255,255,.06)}
.slider::before{content:"";position:absolute;height:18px;width:18px;left:3px;top:2px;background:#fff;border-radius:50%;transition:transform .12s ease;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.slider i{position:absolute;top:50%;transform:translate(-50%,-50%);left:18px;font-size:12px;color:#fff;transition:left .12s ease}
.switch input:checked + .slider{background:#22c55e}
.switch input:checked + .slider::before{transform:translateX(22px)}
.switch input:checked + .slider i{left:30px}
</style>