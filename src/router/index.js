// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import api, { getAuthToken, clearAuth } from '@/services/api'

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

const routes = [
  // 👇 Habilita el chat SOLO en Inicio con meta.chat = true
  { path: '/',           name: 'Inicio',     component: Inicio,     meta: { layout: 'public', chat: true } },

  { path: '/login',      name: 'Login',      component: Login,      meta: { layout: 'public' } },
  { path: '/registro',   name: 'Registro',   component: Registro,   meta: { layout: 'public' } },
  { path: '/recuperar',  name: 'Recuperar',  component: Recuperar,  meta: { layout: 'public' } },
  { path: '/nosotros',   name: 'Nosotros',   component: Nosotros,   meta: { layout: 'public' } },
  { path: '/contacto',   name: 'Contacto',   component: Contacto,   meta: { layout: 'public' } },
  { path: '/ayuda',      name: 'Ayuda',      component: Ayuda,      meta: { layout: 'public' } },
  { path: '/terminos',   name: 'Terminos',   component: Terminos,   meta: { layout: 'public' } },
  { path: '/privacidad', name: 'Privacidad', component: Privacidad, meta: { layout: 'public' } },

  { path: '/dashboard',      name: 'Dashboard',     component: Dashboard,     meta: { requiresAuth: true } },
  { path: '/hoteles',        name: 'Hoteles',       component: Hoteles,       meta: { requiresAuth: true } },
  { path: '/registro-hotel', name: 'RegistroHotel', component: RegistroHotel, meta: { requiresAuth: true } },
  { path: '/tours',          name: 'Tours',         component: Tours,         meta: { requiresAuth: true } },
  { path: '/registro-tour',  name: 'RegistroTour',  component: RegistroTours, meta: { requiresAuth: true } },
  { path: '/proveedores',    name: 'Proveedores',   component: Proveedores,   meta: { requiresAuth: true } },
  { path: '/registroproveedor', name: 'RegistroProveedores', component: RegistroProveedor, meta: { requiresAuth: true }, alias: ['/registro-proveedores','/registro-proveedor'] },
  { path: '/calculadora',    name: 'Calculadora',   component: Calculadora,   meta: { requiresAuth: true } },
  { path: '/usuarios',       name: 'Usuarios',      component: Usuarios,      meta: { requiresAuth: true } },
  { path: '/registrousuarios', name: 'RegistroUsuarios', component: RegistroUsuarios, meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', name: 'Error404', component: Error404, meta: { layout: 'public' } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ✅ Solo protege rutas privadas. /login SIEMPRE permite entrar.
router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next()

  const token = getAuthToken()
  if (!token) return next({ name: 'Login', query: { redirect: to.fullPath } })

  try {
    await api.get('/profile') // valida el token con backend
    return next()
  } catch {
    clearAuth()
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
})

export default router
