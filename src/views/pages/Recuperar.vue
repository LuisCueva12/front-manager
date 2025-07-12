<template>
  <div class="container-fluid vh-100 d-flex justify-content-center align-items-center bg-dark">
    <div class="card p-4 shadow-lg neon-card text-center">
      <h2 class="text-info mb-2">Recuperar Contraseña</h2>
      <p class="text-light small mb-4">
        Ingresa tu correo electrónico para restablecer tu contraseña.
      </p>

      <form @submit.prevent="handleRecover">
        <div class="form-group mb-3 position-relative">
          <i class="fas fa-envelope position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input
            type="email"
            v-model="email"
            class="form-control ps-5"
            placeholder="Correo electrónico"
            required
          />
        </div>

        <button type="submit" class="btn btn-info w-100 fw-bold text-white mb-2">
          Enviar enlace
        </button>

        <router-link to="/login" class="d-block small link-info mt-2">← Volver al login</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')

function handleRecover() {
  if (!email.value.includes('@')) {
    alert('Ingresa un correo válido')
    return
  }

  alert(`Se ha enviado un enlace de recuperación a ${email.value}`)
}
</script>

<style scoped>
.neon-card {
  background-color: #1f1f1f;
  color: #0ff;
  border: 1px solid #0ff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
}
</style>
