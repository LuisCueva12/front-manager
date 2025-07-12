// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 📂 Páginas públicas
const Inicio = () => import('@/views/pages/Inicio.vue')
const Login = () => import('@/views/pages/Login.vue')
const Registro = () => import('@/views/pages/Registro.vue')
const Recuperar = () => import('@/views/pages/Recuperar.vue')
const Nosotros = () => import('@/views/pages/Nosotros.vue')
const Contacto = () => import('@/views/pages/Contacto.vue')
const Ayuda = () => import('@/views/pages/Ayuda.vue')
const Terminos = () => import('@/views/pages/Terminos.vue')
const Privacidad = () => import('@/views/pages/Privacidad.vue')
const Error404 = () => import('@/views/pages/Error404.vue')

// 📂 Dashboard principal (protegido)
const Dashboard = () => import('@/views/dashboardadmin/Dashboard.vue')

// 📂 Módulos privados (requieren login)
const Hoteles = () => import('@/modules/hoteles/Hoteles.vue')
const Tours = () => import('@/modules/tours/Tours.vue')
const Proveedores = () => import('@/modules/proveedores/Proveedores.vue')
const Calculadora = () => import('@/modules/calculadora/Calculadora.vue')
const Usuarios = () => import('@/modules/usuarios/Usuarios.vue')
const Roles = () => import('@/modules/roles/Roles.vue')

const routes = [
  // 🌐 Rutas públicas
  { path: '/', name: 'Inicio', component: Inicio, meta: { layout: 'public' } },
  { path: '/login', name: 'Login', component: Login, meta: { layout: 'public' } },
  { path: '/registro', name: 'Registro', component: Registro, meta: { layout: 'public' } },
  { path: '/recuperar', name: 'Recuperar', component: Recuperar, meta: { layout: 'public' } },
  { path: '/nosotros', name: 'Nosotros', component: Nosotros, meta: { layout: 'public' } },
  { path: '/contacto', name: 'Contacto', component: Contacto, meta: { layout: 'public' } },
  { path: '/ayuda', name: 'Ayuda', component: Ayuda, meta: { layout: 'public' } },
  { path: '/terminos', name: 'Terminos', component: Terminos, meta: { layout: 'public' } },
  { path: '/privacidad', name: 'Privacidad', component: Privacidad, meta: { layout: 'public' } },

  // 🔐 Rutas privadas
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/hoteles', name: 'Hoteles', component: Hoteles, meta: { requiresAuth: true } },
  { path: '/tours', name: 'Tours', component: Tours, meta: { requiresAuth: true } },
  { path: '/proveedores', name: 'Proveedores', component: Proveedores, meta: { requiresAuth: true } },
  { path: '/calculadora', name: 'Calculadora', component: Calculadora, meta: { requiresAuth: true } },
  { path: '/usuarios', name: 'Usuarios', component: Usuarios, meta: { requiresAuth: true } },
  { path: '/roles', name: 'Roles', component: Roles, meta: { requiresAuth: true } },

  // ❌ Página no encontrada
  { path: '/:pathMatch(.*)*', name: 'Error404', component: Error404, meta: { layout: 'public' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 Middleware de protección
router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('auth') === 'true'

  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'Login' })
  } else if (['Login', 'Registro', 'Recuperar'].includes(to.name) && isAuth) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
