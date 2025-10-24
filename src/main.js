// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vue-loading-overlay/dist/vue-loading.css'

// Plugins
import sweetalert from './plugins/sweetalert'
import Loading from 'vue-loading-overlay'

// Store (Pinia)
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// Crear instancia de Pinia e inyectarla
const pinia = createPinia()
app.use(pinia)

// Cargar sesión guardada ANTES de montar la app
const auth = useAuthStore(pinia)
auth.loadFromStorage()

app.use(router)
app.use(sweetalert)

// Registro global del componente Loading
app.component('Loading', Loading)

app.mount('#app')
