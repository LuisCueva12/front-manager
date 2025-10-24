<!-- src/components/AdminNavbar.vue (o el archivo donde está tu header) -->
<template>
  <header class="custom-navbar">
    <h1 class="navbar-title">
      <i class="bi bi-speedometer2 me-2"></i> Panel de Administración
    </h1>
    <button @click="onLogout" class="logout-btn" :disabled="loading">
      <i class="bi bi-box-arrow-right me-1"></i>
      {{ loading ? 'Saliendo…' : 'Cerrar sesión' }}
    </button>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout as doLogout } from '@/services/authService' // <-- usa el servicio robusto

const router = useRouter()
const loading = ref(false)

async function onLogout () {
  if (loading.value) return
  loading.value = true
  try {
    await doLogout()                         // limpia token + header + store
    await router.replace({ name: 'Login' })  // evita volver al panel con “Atrás”
  } catch (e) {
    // si el endpoint falla, fuerza salida local igualmente
    await router.replace({ name: 'Login' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-navbar {
  width: 100%;
  height: 70px;
  padding: 0 2rem;
  background-color: #232335;
  background-image: linear-gradient(to right, #232335, #1e1e2f);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #f1f1f1;
}
.navbar-title { font-size: 1.4rem; font-weight: 600; margin: 0; display: flex; align-items: center; gap: .5rem; color: #f9f9fa; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
.logout-btn {
  background-color: #ff4c4c; border: none; color: #fff; padding: .5rem 1rem;
  border-radius: 4px; font-weight: 500; transition: all .2s; display: flex; align-items: center; gap: .4rem;
  box-shadow: 0 2px 10px rgba(255, 76, 76, .25);
}
.logout-btn:hover { background-color: #e03b3b; transform: scale(1.05); cursor: pointer; }
.logout-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
</style>
