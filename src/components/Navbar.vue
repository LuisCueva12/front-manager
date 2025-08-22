<template>
  <header class="custom-navbar">
    <h1 class="navbar-title">
      <i class="bi bi-speedometer2 me-2"></i> Panel de Administración
    </h1>
    <button @click="logout" class="logout-btn">
      <i class="bi bi-box-arrow-right me-1"></i> Cerrar sesión
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('auth')
  sessionStorage.removeItem('auth')
  router.push('/')
}
</script>

<style scoped>
.custom-navbar {
  width: 100%;
  height: 70px;
  padding: 0 2rem;
  background-color: #232335; /* Color del fondo de la imagen */
  background-image: linear-gradient(to right, #232335, #1e1e2f); /* Suave variación */
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #f1f1f1;
}

.navbar-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f9f9fa;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.logout-btn {
  background-color: #ff4c4c;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 10px rgba(255, 76, 76, 0.25);
}

.logout-btn:hover {
  background-color: #e03b3b;
  transform: scale(1.05);
  cursor: pointer;
}
</style>

