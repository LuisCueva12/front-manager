<template>
  <header class="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow">
    <h1 class="navbar-brand m-0">
      <i class="bi bi-speedometer2 me-2"></i> Panel de Administración
    </h1>
    <button @click="logout" class="btn btn-danger ms-auto">
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
header.navbar {
  height: 70px;
  align-items: center;
}
</style>
