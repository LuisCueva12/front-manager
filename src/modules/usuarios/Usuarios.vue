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

        <button type="button" class="btn btn-reload" :disabled="loading" @click.prevent="go(page)">
          <i class="bi bi-arrow-clockwise"></i> Recargar
        </button>

        <!-- Nuevo: solo si tiene permiso -->
        <router-link
          v-if="auth.can('users.create')"
          class="btn-nuevo"
          :to="{ name: 'RegistroUsuarios' }"
        >
          <i class="bi bi-plus-circle"></i> Nuevo Usuario
        </router-link>
      </div>
    </div>

    <!-- Tabla -->
    <div class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th style="width:60px">#</th>
            <th style="width:64px">Foto</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Correo</th>
            <th>Rol</th>
            <th style="width:120px">Estado</th>
            <th style="width:200px">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <!-- Cargando -->
          <tr v-if="loading">
            <td colspan="9" class="text-center">Cargando…</td>
          </tr>

          <!-- Vacío -->
          <tr v-else-if="usuarios.length === 0">
            <td colspan="9" class="text-center">Sin resultados</td>
          </tr>

          <!-- Filas -->
          <tr v-else v-for="(u, i) in usuarios" :key="u.id ?? i">
            <td>{{ indexBase + i }}</td>

            <!-- Avatar -->
            <td>
              <div class="avatar-cell">
                <img v-if="avatarUrl(u)" :src="avatarUrl(u)" alt="avatar" class="avatar-img" />
                <div v-else class="avatar-fallback" :title="`${u.nombre||''} ${u.apellido||''}`">
                  {{ iniciales(u) }}
                </div>
              </div>
            </td>

            <td class="corta">{{ u.nombre }}</td>
            <td class="corta">{{ u.apellido }}</td>
            <td>{{ u.dni || '—' }}</td>
            <td class="corta">{{ u.correo || '—' }}</td>
            <td>{{ u.rol?.nombre || u.rol_nombre || u.rol || '—' }}</td>

            <td>
              <span class="badge" :class="badgeClase(u.estado)">
                {{ estadoTexto(u.estado) }}
              </span>
            </td>

            <td class="acciones">
              <!-- Ver: permitido si puede leer o es su propio usuario -->
              <button
                v-if="puedeVer(u)"
                type="button"
                class="ver"
                title="Ver"
                @click.stop="verUsuario(u)"
              >
                <i class="bi bi-eye-fill"></i>
              </button>

              <!-- Editar -->
              <button
                v-if="auth.can('users.update')"
                type="button"
                class="editar"
                title="Editar"
                @click.stop="editarUsuario(u)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>

              <!-- Eliminar -->
              <button
                v-if="auth.can('users.delete')"
                type="button"
                class="eliminar"
                title="Eliminar"
                @click.stop="eliminarUsuario(u)"
              >
                <i class="bi bi-trash-fill"></i>
              </button>

              <!-- Toggle de estado: solo si puede actualizar -->
              <label
                v-if="auth.can('users.update')"
                class="switch"
                :title="estadoTexto(u.estado)==='Activo' ? 'Desactivar' : 'Activar'"
                style="margin-left:6px"
              >
                <input
                  type="checkbox"
                  :checked="estadoTexto(u.estado)==='Activo'"
                  @change="toggleEstadoFast(u)"
                />
                <span class="slider">
                  <i v-if="estadoTexto(u.estado)==='Activo'" class="bi bi-check-lg"></i>
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

    <!-- Modal Detalle -->
    <div v-if="usuarioSeleccionado" class="modal-overlay" @click.self="usuarioSeleccionado = null">
      <div class="modal-contenido">
        <h4><i class="bi bi-card-text"></i> Detalles del Usuario</h4>

        <div class="detalle-top">
          <div class="avatar-large">
            <img v-if="avatarUrl(usuarioSeleccionado)" :src="avatarUrl(usuarioSeleccionado)" alt="avatar" />
            <div v-else class="avatar-large-fallback">
              {{ iniciales(usuarioSeleccionado) }}
            </div>
          </div>
          <div class="detalle-head-txt">
            <div class="det-nombre">{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</div>
            <div class="det-mail">{{ usuarioSeleccionado.correo || '—' }}</div>
            <span class="badge" :class="badgeClase(usuarioSeleccionado.estado)">
              {{ estadoTexto(usuarioSeleccionado.estado) }}
            </span>
          </div>
        </div>

        <table class="tabla-detalle">
          <tbody>
            <tr><td><strong>Nombre:</strong></td><td>{{ usuarioSeleccionado.nombre }}</td></tr>
            <tr><td><strong>Apellido:</strong></td><td>{{ usuarioSeleccionado.apellido }}</td></tr>
            <tr><td><strong>DNI:</strong></td><td>{{ usuarioSeleccionado.dni || '—' }}</td></tr>
            <tr><td><strong>Correo:</strong></td><td>{{ usuarioSeleccionado.correo || '—' }}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>{{ usuarioSeleccionado.telefono || '—' }}</td></tr>
            <tr><td><strong>Dirección:</strong></td><td>{{ usuarioSeleccionado.direccion || '—' }}</td></tr>
            <tr><td><strong>Fecha nacimiento:</strong></td><td>{{ usuarioSeleccionado.fecha_nacimiento || 'No registrada' }}</td></tr>
            <tr><td><strong>Rol:</strong></td><td>{{ usuarioSeleccionado.rol?.nombre || usuarioSeleccionado.rol_nombre || usuarioSeleccionado.rol || '—' }}</td></tr>
          </tbody>
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
import { listUsuarios, deleteUsuario, getUsuario, updateUsuario } from '@/services/usuarioService'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const API_ORIGIN = (() => {
  // baseURL suele ser: http://localhost:8000/api
  try {
    const u = new URL(api.defaults.baseURL || window.location.origin)
    return `${u.protocol}//${u.hostname}${u.port ? ':' + u.port : ''}`
  } catch {
    return 'http://localhost:8000'
  }
})()

export default {
  name: 'Usuarios',
  setup () {
    const auth = useAuthStore()
    return { auth }
  },
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
    // ========= helpers de avatar con URL absoluta al backend =========
    urlFromPath(path) {
      if (!path || typeof path !== 'string') return null
      if (path.startsWith('http://') || path.startsWith('https://')) return path
      const clean = path.replace(/^\/+/, '')
      const rel = clean.startsWith('storage/') ? clean : `storage/${clean}`
      return `${API_ORIGIN}/${rel}`
    },
    avatarUrl(u) {
      const p = u?.foto_perfil || u?._raw?.foto_perfil
      return this.urlFromPath(p)
    },
    iniciales(u) {
      const n = `${u?.nombre || ''} ${u?.apellido || ''}`.trim()
      const parts = n.split(/\s+/).filter(Boolean).slice(0, 2)
      return parts.map(p => (p[0] || '').toUpperCase()).join('') || 'U'
    },

    async cargar() {
      this.loading = true
      try {
        const { items, pagination } = await listUsuarios({
          q: this.busqueda,
          page: this.page,
          perPage: this.perPage
        })
        // estado por defecto 'activo' si no viene
        this.usuarios = (items || []).map(u => ({ estado: 'activo', ...u }))
        this.pagination = pagination || {
          current_page: this.page,
          per_page: this.perPage,
          total: this.usuarios.length,
          last_page: 1
        }
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar usuarios', 'error')
      } finally {
        this.loading = false
      }
    },
    go(p) {
      this.page = Math.max(1, p)
      this.cargar()
    },

    // --- Permisos de lectura: puede ver si tiene users.read o si es su propio usuario (read-self)
    puedeVer(u) {
      if (this.auth.can('users.read')) return true
      const myId = this.auth.user?.id
      return myId && u?.id && String(myId) === String(u.id) // ver su propio detalle
    },

    async verUsuario(usuario) {
      if (!this.puedeVer(usuario)) {
        Swal.fire('Permiso denegado', 'No puedes ver este usuario.', 'warning')
        return
      }
      try {
        const detail = await getUsuario(usuario.id)
        this.usuarioSeleccionado = detail
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo obtener el usuario', 'error')
      }
    },

    editarUsuario(usuario) {
      if (!this.auth.can('users.update')) {
        Swal.fire('Permiso denegado', 'No puedes editar usuarios.', 'warning')
        return
      }
      localStorage.setItem('usuarioEdicion', JSON.stringify(usuario))
      this.$router.push({ name: 'RegistroUsuarios' })
    },

    async eliminarUsuario(usuario) {
      if (!this.auth.can('users.delete')) {
        Swal.fire('Permiso denegado', 'No puedes eliminar usuarios.', 'warning')
        return
      }
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
      try {
        await deleteUsuario(usuario.id)
        if (this.usuarios.length === 1 && this.page > 1) this.page -= 1
        await this.cargar()
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error')
      }
    },

    // Toggle rápido (optimistic UI)
    async toggleEstadoFast (usuario) {
      if (!this.auth.can('users.update')) {
        Swal.fire('Permiso denegado', 'No puedes cambiar el estado de usuarios.', 'warning')
        return
      }
      const activo = this.estadoTexto(usuario.estado) === 'Activo'
      const nuevo = activo ? 'inactivo' : 'activo'
      const anterior = usuario.estado
      usuario.estado = nuevo
      try {
        await updateUsuario(usuario.id, { estado: nuevo })
      } catch (e) {
        usuario.estado = anterior
        console.error(e)
        Swal.fire('Error', 'No se pudo cambiar el estado del usuario.', 'error')
      }
    },

    // Normaliza estado desde 1/0, true/false y strings
    estadoTexto(v) {
      const s = String(v ?? 'activo').toLowerCase()
      if (s === '1' || s === 'true' || s === 'activo') return 'Activo'
      if (s === '0' || s === 'false' || s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      return 'Activo'
    },
    badgeClase(v) {
      const s = String(v ?? 'activo').toLowerCase()
      return {
        'badge--activo': s === 'activo' || s === '1' || s === 'true',
        'badge--inactivo': s === 'inactivo' || s === '0' || s === 'false',
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
/* ====== Layout oscuro ====== */
.contenedor{
  padding:16px;
  background:#0f1423;
  min-height:100vh;
  color:#cfd3dc;
}

/* ====== Header ====== */
.encabezado{
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;flex-wrap:wrap;margin-bottom:12px
}
.encabezado h2{margin:0;font-weight:800;letter-spacing:.2px}
.encabezado h2 i{margin-right:8px;color:#51e1e6}
.acciones-top{display:flex;align-items:center;gap:12px}

/* Buscador con glow */
.buscador{
  min-width:360px;height:40px;
  padding:8px 12px;border-radius:12px;
  background:#0b1020;color:#e6ecf6;
  border:1px solid #0ea5e97a;
  box-shadow: inset 0 0 0 1px rgba(14,165,233,.16);
  outline:none;
  transition: box-shadow .18s ease, border-color .18s ease;
}
.buscador::placeholder{color:#8e99b2}
.buscador:focus{
  border-color:#0ea5e9;
  box-shadow:0 0 0 3px rgba(14,165,233,.22), inset 0 0 0 1px rgba(14,165,233,.18);
}

/* Botones header */
.btn{
  display:inline-flex;align-items:center;gap:8px;
  height:40px;padding:0 14px;border-radius:12px;cursor:pointer;
  font-weight:800;letter-spacing:.2px;
}
.btn:disabled{opacity:.55;cursor:not-allowed}
.btn.btn-reload{
  color:#19b1ff;border:1px solid #0ea5e9;background:transparent;
  box-shadow:0 0 0 1px rgba(14,165,233,.22);
}
.btn.btn-reload:hover{background:#0b2e3b;color:#e8f7ff}
.btn-nuevo{
  display:inline-flex;align-items:center;gap:8px;
  height:40px;padding:0 16px;border-radius:12px;cursor:pointer;
  background:linear-gradient(90deg,#10b981,#059669);
  color:#fff;border:1px solid #10b981;font-weight:900;
  box-shadow:0 6px 16px rgba(16,185,129,.28);
}
.btn-nuevo:hover{filter:brightness(1.06)}

/* ====== Tabla ====== */
.tabla-wrap{background:#0c1222;border:1px solid #1b2337;border-radius:12px;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.25)}
.tabla{width:100%;border-collapse:collapse}
.tabla th,.tabla td{border-bottom:1px solid #1b2337;padding:12px 14px}
.tabla thead th{background:#007b8a;color:#fff;text-align:left;font-weight:800}
.tabla tbody tr{transition:background .15s ease}
.tabla tbody tr:hover{background:#0e1830}
.corta{max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.text-center{text-align:center}

/* ====== Avatar en celda ====== */
.avatar-cell{
  width:40px;height:40px;border-radius:999px;overflow:hidden;
  display:grid;place-items:center;background:#11203a;border:1px solid #1b2a44;
}
.avatar-img{ width:100%;height:100%;object-fit:cover;display:block }
.avatar-fallback{
  width:100%;height:100%;display:grid;place-items:center;
  color:#dbeafe;font-weight:900;letter-spacing:.5px;font-size:.85rem;
}

/* ====== Acciones + colores exactos ====== */
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

/* ====== Switch (como Hoteles/Tours) ====== */
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

/* ====== Badges ====== */
.badge{display:inline-block;padding:6px 12px;border-radius:999px;font-size:.82rem;font-weight:800}
.badge--activo{background:#d1fae5;color:#065f46}
.badge--inactivo{background:#fee2e2;color:#991b1b}
.badge--suspendido{background:#fef3c7;color:#92400e}

/* ====== Paginación ====== */
.pager{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:12px}
.btn-pager{background:#2c2f48;color:#fff;border:none;padding:8px 12px;border-radius:8px}
.btn-pager:disabled{opacity:.55;cursor:default}

/* ====== Modal ====== */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:9999}
.modal-contenido{
  background:#fff;color:#111;border-radius:14px;
  width:min(760px, 92vw);
  max-height:min(82vh, 760px);
  overflow:auto;
  padding:18px 16px;
  box-shadow:0 10px 30px rgba(0,0,0,.25);
}
.modal-contenido h4{
  position:sticky;top:0;z-index:1;
  margin:0 0 12px 0;padding:10px 0;
  background:#fff;border-bottom:1px solid #e9ecef;font-weight:800
}
.detalle-top{
  display:flex;gap:14px;align-items:center;margin-bottom:12px
}
.avatar-large{
  width:72px;height:72px;border-radius:999px;overflow:hidden;border:1px solid #e5e7eb;background:#f8fafc;flex:0 0 auto;
  display:grid;place-items:center;
}
.avatar-large img{width:100%;height:100%;object-fit:cover;display:block}
.avatar-large-fallback{
  width:100%;height:100%;display:grid;place-items:center;font-weight:900;color:#0b3b57
}
.detalle-head-txt .det-nombre{font-weight:800;font-size:1.1rem}
.detalle-head-txt .det-mail{color:#475569;margin-bottom:6px}

.tabla-detalle{width:100%;border-collapse:separate;border-spacing:0 6px}
.tabla-detalle td{padding:4px 6px;vertical-align:top}
.tabla-detalle td:first-child{white-space:nowrap;width:42%}
.acciones-modal{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
</style>
