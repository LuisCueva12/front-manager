<template>
  <div id="app">
    <!-- Páginas públicas: solo se muestra el contenido sin layout -->
    <router-view v-if="isPublicRoute || isError404" />

    <!-- Páginas privadas: panel completo con menú, navbar y footer -->
    <div v-else class="app-layout">
      <Sidebar />
      <div class="main-area">
        <Navbar />
        <main class="main-content container-fluid py-4 px-3">
          <router-view />
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'

export default {
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  setup() {
    const route = useRoute()
    // Agrega todas las rutas públicas aquí
    const publicRoutes = [
      'Inicio', 'Login', 'Registro', 'Recuperar',
      'Nosotros', 'Contacto', 'Ayuda', 'Terminos', 'Privacidad'
    ]
    const isPublicRoute = computed(() => publicRoutes.includes(route.name))
    const isError404 = computed(() => route.name === 'Error404')
    return { isPublicRoute, isError404 }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f1f3f5;
}

.main-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: #f9f9f9;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 12px;
}
</style>
