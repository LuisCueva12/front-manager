// src/main.js
import { createApp } from 'vue'
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

const app = createApp(App)

app.use(router)
app.use(sweetalert)

// Registro global del componente Loading
app.component('Loading', Loading)

app.mount('#app')
