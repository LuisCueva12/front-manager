// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import api, { getAuthToken, clearAuth } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

/* ======================= Carga perezosa de vistas ======================== */
// Públicas
const Inicio      = () => import('@/views/pages/Inicio.vue')
const Login       = () => import('@/views/pages/Login.vue')
const Registro    = () => import('@/views/pages/Registro.vue')
const Recuperar   = () => import('@/views/pages/Recuperar.vue')
const Nosotros    = () => import('@/views/pages/Nosotros.vue')
const Contacto    = () => import('@/views/pages/Contacto.vue')
const Ayuda       = () => import('@/views/pages/Ayuda.vue')
const Terminos    = () => import('@/views/pages/Terminos.vue')
const Privacidad  = () => import('@/views/pages/Privacidad.vue')
const Error404    = () => import('@/views/pages/Error404.vue')

// Privadas
const Dashboard         = () => import('@/views/dashboardadmin/Dashboard.vue')
const Hoteles           = () => import('@/modules/hoteles/Hoteles.vue')
const RegistroHotel     = () => import('@/modules/hoteles/Registrohoteles.vue')
const Tours             = () => import('@/modules/tours/Tours.vue')
const RegistroTours     = () => import('@/modules/tours/RegistroTours.vue')
const Proveedores       = () => import('@/modules/proveedores/Proveedores.vue')
const RegistroProveedor = () => import('@/modules/proveedores/RegistroProveedores.vue')
const Calculadora       = () => import('@/modules/calculadora/Calculadora.vue')
const Usuarios          = () => import('@/modules/usuarios/Usuarios.vue')
const RegistroUsuarios  = () => import('@/modules/usuarios/RegistroUsuarios.vue')
const Destinos          = () => import('@/modules/destinos/Destinos.vue')
const RegistroDestino   = () => import('@/modules/destinos/RegistroDestino.vue')

/* ===================== Normalizador de roles confiable ==================== */
function normalizeRole(user) {
  let r =
    user?.role ??
    user?.rol ??
    user?.rol_nombre ??
    user?.role_name ??
    user?.roleName ??
    (typeof user?.rol_obj === 'object' ? user.rol_obj?.nombre : undefined)

  if (r && typeof r === 'object') r = r.nombre ?? r.name ?? r.title ?? r.label
  if (Array.isArray(r)) r = r[0]
  if (!r || typeof r !== 'string') return 'Usuario'
  const t = r.trim().toLowerCase()
  if (t.startsWith('admin')) return 'Administrador'
  if (t.startsWith('usuario') || t === 'user') return 'Usuario'
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/* ===================== Normalizador de permisos (alias) =================== */
// Mapea sinónimos para tolerar backends con claves distintas
function normalizePerm(p) {
  if (!p) return ''
  const s = String(p).trim()
  // alias: usuarios.* ⇆ users.*
  return s
    .replace(/^usuarios\./i, 'users.')
    .replace(/^usuario\./i, 'users.')
}
function normalizePermList(list) {
  return (Array.isArray(list) ? list : []).map(normalizePerm)
}

/* ===================== Helpers de autorización por ruta =================== */
function hasAnyRole(user, roles) {
  if (!Array.isArray(roles) || roles.length === 0) return true
  const role = normalizeRole(user)
  return roles.some(r => String(r).toLowerCase() === role.toLowerCase())
}
function hasAllRoles(user, roles) {
  if (!Array.isArray(roles) || roles.length === 0) return true
  const role = normalizeRole(user)
  return roles.every(r => String(r).toLowerCase() === role.toLowerCase())
}
/**
 * Verifica permisos con:
 * - alias normalizados (usuarios.* -> users.*)
 * - bypass automático para Administrador (a menos que strictPerms=true en meta)
 */
function hasPermissions(authStore, perms = [], user, strictPerms = false) {
  const need = normalizePermList(perms)
  if (need.length === 0) return true

  // Bypass: Admin siempre puede, salvo que la ruta pida strictPerms
  if (!strictPerms && normalizeRole(user) === 'Administrador') return true

  return need.every(p => authStore?.can?.(p))
}

/* ================================= Rutas ================================= */
const routes = [
  { path: '/',           name: 'Inicio',     component: Inicio,     meta: { layout: 'public', chat: true } },
  { path: '/login',      name: 'Login',      component: Login,      meta: { layout: 'public', publicOnly: true } },
  { path: '/registro',   name: 'Registro',   component: Registro,   meta: { layout: 'public', publicOnly: true } },
  { path: '/recuperar',  name: 'Recuperar',  component: Recuperar,  meta: { layout: 'public', publicOnly: true } },
  { path: '/nosotros',   name: 'Nosotros',   component: Nosotros,   meta: { layout: 'public' } },
  { path: '/contacto',   name: 'Contacto',   component: Contacto,   meta: { layout: 'public' } },
  { path: '/ayuda',      name: 'Ayuda',      component: Ayuda,      meta: { layout: 'public' } },
  { path: '/terminos',   name: 'Terminos',   component: Terminos,   meta: { layout: 'public' } },
  { path: '/privacidad', name: 'Privacidad', component: Privacidad, meta: { layout: 'public' } },

  // Autenticadas (cualquier rol)
  { path: '/dashboard',   name: 'Dashboard',   component: Dashboard,   meta: { requiresAuth: true } },
  { path: '/hoteles',     name: 'Hoteles',     component: Hoteles,     meta: { requiresAuth: true } },
  { path: '/tours',       name: 'Tours',       component: Tours,       meta: { requiresAuth: true } },
  { path: '/proveedores', name: 'Proveedores', component: Proveedores, meta: { requiresAuth: true } },
  { path: '/calculadora', name: 'Calculadora', component: Calculadora, meta: { requiresAuth: true } },
  { path: '/destinos',    name: 'Destinos',    component: Destinos,    meta: { requiresAuth: true, permissions: ['destinos.read'] } },

  // Solo ADMIN (con ejemplo de permisos)
  { path: '/registro-hotel',    name: 'RegistroHotel',        component: RegistroHotel,    meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['hoteles.create'] } },
  { path: '/registro-tour',     name: 'RegistroTour',         component: RegistroTours,    meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['tours.create'] } },
  { path: '/registroproveedor', name: 'RegistroProveedores',  component: RegistroProveedor, meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['proveedores.create'] }, alias: ['/registro-proveedores','/registro-proveedor'] },

  // Aquí estaba el problema: la ruta pedía 'usuarios.read' pero tu store usa 'users.read'
  // Con el normalizador y bypass de Admin ya no fallará; además, dejamos ambos por compat.
  { path: '/usuarios',          name: 'Usuarios',             component: Usuarios,          meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['users.read','usuarios.read'] } },
  { path: '/registrousuarios',  name: 'RegistroUsuarios',     component: RegistroUsuarios,  meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['users.create','usuarios.create'] } },

  { path: '/registro-destino',  name: 'RegistroDestino',      component: RegistroDestino,   meta: { requiresAuth: true, roles: ['Administrador'], permissions: ['destinos.create'] }, alias: ['/registrodestino'] },

  { path: '/:pathMatch(.*)*', name: 'Error404', component: Error404, meta: { layout: 'public' } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

/* =================== Cache de perfil para evitar ráfagas ================== */
let profilePromise = null
async function ensureProfile(auth) {
  if (auth?.user && auth?.role) return auth.user
  if (!profilePromise) {
    profilePromise = (async () => {
      const { data } = await api.get('/profile')
      const user = { ...data, role: normalizeRole(data) }
      auth.setUser(user)
      return user
    })().finally(() => { profilePromise = null })
  }
  return profilePromise
}

/* ============================ Guard global =============================== */
router.beforeEach(async (to, from, next) => {
  const token = getAuthToken()
  const auth  = useAuthStore()

  // Bloquea páginas de auth si ya hay sesión (solo login/registro/recuperar)
  if (to.meta.publicOnly && token) {
    try { await ensureProfile(auth) } catch { clearAuth() }
    return next({ name: 'Dashboard' })
  }

  // Rutas públicas → pasan
  if (!to.meta.requiresAuth) return next()

  // Requiere auth: sin token → a Login
  if (!token) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  try {
    // Asegura perfil/rol en store
    const user = await ensureProfile(auth)

    // Roles
    const roles = to.meta.roles || []
    const okRole = (to.meta.roleMode === 'and')
      ? hasAllRoles(user, roles)
      : hasAnyRole(user, roles)

    if (!okRole) {
      // No rebota al Dashboard (evita el “me vuelve al panel”)
      return next({ name: 'Inicio' })
    }

    // Permisos (con normalización y bypass para Admin salvo strictPerms)
    const perms = normalizePermList(to.meta.permissions || [])
    const strict = !!to.meta.strictPerms
    if (!hasPermissions(auth, perms, user, strict)) {
      return next({ name: 'Inicio' })
    }

    return next()
  } catch (e) {
    // Token inválido/expirado → limpiar y a Login
    clearAuth()
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
})

export default router
