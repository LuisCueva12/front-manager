<!-- src/modules/usuarios/Usuarios.vue -->
<template>
  <div class="contenedor">
    <!-- Header -->
    <div class="encabezado">
      <h2><i class="bi bi-people-fill"></i> Lista de Usuarios</h2>

      <div class="acciones-top">
        <input
          v-model="busqueda"
          class="buscador"
          placeholder="Buscar usuario…"
          @keyup.enter.prevent="go(1)"
        />
        <button type="button" class="btn" :disabled="loading" @click.prevent="go(page)">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>
        <router-link class="btn-nuevo" :to="{ name: 'RegistroUsuarios' }">
          <i class="bi bi-plus-circle"></i> Nuevo
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
            <th>Apellido</th>
            <th>DNI</th>
            <th>Correo</th>
            <th>Rol</th>
            <th style="width:120px">Estado</th>
            <th style="width:160px">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <!-- Cargando -->
          <tr v-if="loading">
            <td colspan="8" class="text-center">Cargando…</td>
          </tr>

          <!-- Vacío -->
          <tr v-else-if="usuarios.length === 0">
            <td colspan="8" class="text-center">Sin resultados</td>
          </tr>

          <!-- Filas -->
          <tr v-else v-for="(u, i) in usuarios" :key="u.id ?? i">
            <td>{{ indexBase + i }}</td>
            <td>{{ u.nombre }}</td>
            <td>{{ u.apellido }}</td>
            <td>{{ u.dni }}</td>
            <td>{{ u.correo }}</td>
            <td>{{ u.rol?.nombre || u.rol_nombre || u.rol || '—' }}</td>
            <td>
              <span class="badge" :class="badgeClase(u.estado)">{{ estadoTexto(u.estado) }}</span>
            </td>
            <td class="acciones">
              <button type="button" class="ver" title="Ver" @click.stop="verUsuario(u)">
                <i class="bi bi-eye-fill"></i>
              </button>

              <button type="button" class="editar" title="Editar" @click.stop="editarUsuario(u)">
                <i class="bi bi-pencil-square"></i>
              </button>

              <button type="button" class="eliminar" title="Eliminar" @click.stop="eliminarUsuario(u)">
                <i class="bi bi-trash-fill"></i>
              </button>
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

    <!-- Modal Detalle (con scroll y header pegajoso) -->
    <div v-if="usuarioSeleccionado" class="modal-overlay" @click.self="usuarioSeleccionado = null">
      <div class="modal-contenido">
        <h4><i class="bi bi-card-text"></i> Detalles del Usuario</h4>

        <table class="tabla-detalle">
          <tr><td><strong>Nombre:</strong></td><td>{{ usuarioSeleccionado.nombre }}</td></tr>
          <tr><td><strong>Apellido:</strong></td><td>{{ usuarioSeleccionado.apellido }}</td></tr>
          <tr><td><strong>DNI:</strong></td><td>{{ usuarioSeleccionado.dni }}</td></tr>
          <tr><td><strong>Correo:</strong></td><td>{{ usuarioSeleccionado.correo }}</td></tr>
          <tr><td><strong>Teléfono:</strong></td><td>{{ usuarioSeleccionado.telefono || '—' }}</td></tr>
          <tr><td><strong>Dirección:</strong></td><td>{{ usuarioSeleccionado.direccion || '—' }}</td></tr>
          <tr><td><strong>Fecha nacimiento:</strong></td><td>{{ usuarioSeleccionado.fecha_nacimiento || 'No registrada' }}</td></tr>
          <tr><td><strong>Rol:</strong></td><td>{{ usuarioSeleccionado.rol?.nombre || usuarioSeleccionado.rol_nombre || usuarioSeleccionado.rol || '—' }}</td></tr>
          <tr>
            <td><strong>Estado:</strong></td>
            <td><span class="badge" :class="badgeClase(usuarioSeleccionado.estado)">{{ estadoTexto(usuarioSeleccionado.estado) }}</span></td>
          </tr>
        </table>

        <div class="acciones-modal">
          <button type="button" class="btn" @click="usuarioSeleccionado = null">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { listUsuarios, deleteUsuario, getUsuario } from '@/services/usuarioService'

export default {
  data() {
    return {
      busqueda: '',
      usuarios: [],
      pagination: { current_page: 1, per_page: 10, last_page: 1, total: 0 },
      page: 1,
      perPage: 10,
      loading: false,
      usuarioSeleccionado: null,
      _debounce: null
    }
  },
  computed: {
    indexBase() {
      return (this.page - 1) * this.perPage + 1
    }
  },
  methods: {
    async cargar() {
      this.loading = true
      try {
        const { items, pagination } = await listUsuarios({
          q: this.busqueda,
          page: this.page,
          perPage: this.perPage
        })
        this.usuarios = (items || []).map(u => ({ estado: 'activo', ...u }))
        this.pagination = pagination || {
          current_page: this.page,
          per_page: this.perPage,
          total: this.usuarios.length,
          last_page: 1
        }
      } finally {
        this.loading = false
      }
    },
    go(p) {
      this.page = Math.max(1, p)
      this.cargar()
    },
    async verUsuario(usuario) {
      const detail = await getUsuario(usuario.id)
      this.usuarioSeleccionado = detail
    },
    editarUsuario(usuario) {
      localStorage.setItem('usuarioEdicion', JSON.stringify(usuario))
      this.$router.push({ name: 'RegistroUsuarios' })
    },
    async eliminarUsuario(usuario) {
      const res = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: `${usuario.nombre} ${usuario.apellido}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar'
      })
      if (!res.isConfirmed) return
      await deleteUsuario(usuario.id)
      await this.cargar()
      Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success')
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
/* Layout base */
.contenedor{padding:16px;position:relative;color:#cfd3dc;background:#1e1e2f;min-height:100vh}
.encabezado{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.acciones-top{display:flex;align-items:center;gap:8px}
.buscador{min-width:260px;padding:8px 10px;border:1px solid #2b2f3a;border-radius:6px;background:#151722;color:#cfd3dc}
.btn,.btn-nuevo{padding:8px 12px;border-radius:6px;border:1px solid #0d6efd;color:#0d6efd;background:transparent;cursor:pointer;text-decoration:none}
.btn:hover,.btn-nuevo:hover{background:#0d6efd;color:#fff}

/* Tabla (oscura, igual Proveedores) */
.tabla-wrap{background:#1a1d2b;border-radius:6px;overflow:hidden}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #2b2f3a;padding:10px}
.tabla thead th{background:#007b8a;color:#fff;text-align:left}
.text-center{text-align:center}

/* Acciones */
.acciones{display:flex;gap:6px;align-items:center}
.acciones button,.acciones .link-boton{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:6px;cursor:pointer;text-decoration:none}
.ver{background:#0dcaf0;border:none;color:#0b2a2f}
.editar{background:#ffc107;border:none;color:#1b1f2a}
.eliminar{background:#dc3545;border:none;color:#fff}

/* Badges de estado (mismo estilo que Proveedores) */
.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:.8rem;font-weight:600}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}

/* Paginación */
.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{background:#2c2f48;color:#fff;border:none;padding:6px 10px;border-radius:6px}

/* Modal con scroll y header pegajoso */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:9999}
.modal-contenido{
  background:#fff;color:#111;border-radius:12px;
  width:min(620px, 92vw);
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
.tabla-detalle td:first-child{white-space:nowrap;width:46%}
.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
</style>
