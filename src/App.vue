<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Páginas públicas -->
    <router-view v-if="isPublicRoute || isError404" />

    <!-- Páginas privadas -->
    <div v-else class="app-layout">
      <Sidebar />
      <div class="main-area">
        <Navbar />
        <main class="main-content">
          <router-view />
        </main>
        <Footer />
      </div>
    </div>

    <!-- Chatbot: solo en rutas con meta.chat === true -->
    <ChatWidget v-if="showChat" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'
import ChatWidget from './components/ChatWidget.vue'

export default {
  components: {
    Navbar,
    Sidebar,
    Footer,
    ChatWidget
  },
  setup() {
    const route = useRoute()

    const publicRoutes = [
      'Inicio', 'Login', 'Registro', 'Recuperar',
      'Nosotros', 'Contacto', 'Ayuda', 'Terminos', 'Privacidad'
    ]

    const isPublicRoute = computed(() => publicRoutes.includes(route.name))
    const isError404   = computed(() => route.name === 'Error404')

    // 👇 Muestra el chatbot solo cuando la ruta tenga meta.chat = true
    const showChat = computed(() => route.meta?.chat === true)

    return { isPublicRoute, isError404, showChat }
  }
}
</script>

<style scoped>
/* Layout principal sin bordes */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #1e1e2f;
  margin: 0;
  padding: 0;
}

.main-area {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #1e1e2f;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}
.main-content::-webkit-scrollbar {
  width: 8px;
}
.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>
