// src/stores/auth.js
import { defineStore } from 'pinia'
import api, { setAuthToken, clearAuth } from '@/services/api'

/* ================= Normalizador de rol consistente con el router ================= */
function normalizeRole(userOrRole) {
  // admite objeto usuario o string de rol
  let r = userOrRole
  if (userOrRole && typeof userOrRole === 'object') {
    r =
      userOrRole.role ??
      userOrRole.rol ??
      userOrRole.rol_nombre ??
      userOrRole.role_name ??
      userOrRole.roleName ??
      (typeof userOrRole.rol_obj === 'object' ? userOrRole.rol_obj?.nombre : undefined)
  }
  if (r && typeof r === 'object') r = r.nombre ?? r.name ?? r.title ?? r.label
  if (Array.isArray(r)) r = r[0]
  if (!r || typeof r !== 'string') return 'Usuario'
  const t = r.trim().toLowerCase()
  if (t.startsWith('admin')) return 'Administrador'
  if (t.startsWith('usuario') || t === 'user') return 'Usuario'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/* ===================== Permisos por rol (fallback si backend no envía) ===================== */
const ROLE_PERMS = {
  Administrador: [
    // usuarios
    'users.read', 'users.create', 'users.update', 'users.delete',
    // hoteles
    'hoteles.read', 'hoteles.create', 'hoteles.update', 'hoteles.delete',
    // tours
    'tours.read', 'tours.create', 'tours.update', 'tours.delete',
    // destinos
    'destinos.read', 'destinos.create', 'destinos.update', 'destinos.delete',
    // proveedores
    'proveedores.read', 'proveedores.create', 'proveedores.update', 'proveedores.delete',
    // precios / cotizaciones / reservas / pagos
    'precios.read', 'precios.create', 'precios.update', 'precios.delete',
    'cotizaciones.*', 'reservas.*', 'pagos.*',
  ],
  Usuario: [
    // solo lectura
    'users.read-self',
    'hoteles.read', 'tours.read', 'destinos.read', 'proveedores.read',
  ],
}

function normStringArray(arr) {
  const out = new Set()
  ;(Array.isArray(arr) ? arr : []).forEach(x => {
    if (x == null) return
    const s = String(x).trim()
    if (s) out.add(s)
  })
  return Array.from(out)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,            // { id, nombre/name, role/rol, permissions/permisos? }
    token: null,           // token en memoria (opcional; el header vive en api.defaults)
    _profileLoaded: false, // evita pedir /profile en cada navegación
  }),

  getters: {
    role(state) {
      return normalizeRole(state.user)
    },
    isAdmin() {
      return ['Administrador', 'Admin'].includes(this.role)
    },
    /**
     * Permisos efectivos = backend (permissions/permisos) + fallback por rol
     */
    permissions(state) {
      const backend = normStringArray(state.user?.permissions || state.user?.permisos)
      const rolePerms = normStringArray(ROLE_PERMS[normalizeRole(state.user)])
      return normStringArray([...backend, ...rolePerms])
    },
  },

  actions: {
    /** Guardar sesión (tras login) */
    setSession({ user, token }) {
      this.user  = user || null
      this.token = token || null
      this._profileLoaded = !!user

      // persistencia
      localStorage.setItem('auth:user', JSON.stringify(this.user || {}))
      if (token) localStorage.setItem('auth:token', token)
      else localStorage.removeItem('auth:token')

      // fija header Authorization global si hay token
      if (token) setAuthToken(token)
    },

    /** Actualizar solo datos del usuario */
    setUser(user) {
      this.user = user || null
      this._profileLoaded = !!user
      localStorage.setItem('auth:user', JSON.stringify(this.user || {}))
    },

    /** Hidratar desde localStorage (llamar en main.js al iniciar la app) */
    loadFromStorage() {
      try {
        const storedUser = localStorage.getItem('auth:user')
        const storedToken = localStorage.getItem('auth:token')
        this.user  = storedUser ? JSON.parse(storedUser) : null
        this.token = storedToken || null
        this._profileLoaded = !!this.user

        // muy importante: si había token persistido, fijar header Authorization
        if (this.token) setAuthToken(this.token)
      } catch {
        this.user = null
        this.token = null
        this._profileLoaded = false
        clearAuth() // limpia headers por si acaso
      }
    },

    /**
     * Traer perfil desde API y actualizar store.
     * Normaliza rol y permisos del backend.
     */
    async fetchProfile() {
      const { data } = await api.get('/profile')
      const normalized = {
        ...data,
        role: normalizeRole(data),
        permissions: normStringArray(data?.permissions || data?.permisos || []),
      }
      this.setUser(normalized)
      return normalized
    },

    /**
     * Cargar el perfil una sola vez por ciclo de app.
     * Úsalo en el guard del router o al montar tu layout principal.
     */
    async syncProfile() {
      if (this._profileLoaded && this.user) return this.user
      try {
        return await this.fetchProfile()
      } catch (e) {
        // token inválido/expirado: deja estado limpio
        this.user = null
        this._profileLoaded = false
        throw e
      }
    },

    /**
     * Verificación de permisos:
     * - string: 'users.update'
     * - wildcard por recurso: 'cotizaciones.*'
     * - array (cumple ALGUNO): ['a.b','c.d']
     */
    can(perm) {
      const perms = this.permissions
      if (!perm) return false

      if (Array.isArray(perm)) {
        return perm.some(p => this.can(p))
      }

      if (perms.includes(perm)) return true
      const [res] = String(perm).split('.')
      if (!res) return false
      return perms.includes(`${res}.*`)
    },

    /** Conveniencias */
    canAny(arr) { return Array.isArray(arr) && arr.some(p => this.can(p)) },
    canAll(arr) { return Array.isArray(arr) && arr.every(p => this.can(p)) },

    /**
     * Cerrar sesión “a prueba de balas”.
     * (Si quieres llamar al endpoint backend, hazlo en authService.logout()).
     */
    logout() {
      this.user = null
      this.token = null
      this._profileLoaded = false
      localStorage.removeItem('auth:user')
      localStorage.removeItem('auth:token')
      // limpia headers y cualquier resto del cliente HTTP
      clearAuth()
    },
  },
})
