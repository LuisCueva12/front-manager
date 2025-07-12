<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
    <div class="card p-4 shadow-lg neon-card">
      <h2 class="text-center mb-3">Crear Cuenta</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group mb-3 position-relative">
          <i class="fas fa-user position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input
            type="text"
            v-model="name"
            class="form-control ps-5"
            placeholder="Nombre completo"
            required
          />
        </div>

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

        <div class="form-group mb-3 position-relative">
          <i class="fas fa-lock position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input
            type="password"
            v-model="password"
            class="form-control ps-5"
            placeholder="Contraseña"
            required
          />
        </div>

        <button type="submit" class="btn btn-info w-100 text-white fw-bold">Registrarse</button>

        <p class="text-center small mt-3">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="d-block small link-info mt-2">Inicia sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'

const name = ref('')
const email = ref('')
const password = ref('')

function handleRegister() {
  if (!email.value.includes('@') || password.value.length < 6) {
    Swal.fire({
      icon: 'error',
      title: 'Datos inválidos',
      text: 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.'
    })
    return
  }

  Swal.fire({
    icon: 'success',
    title: 'Registro exitoso',
    text: `¡Bienvenido, ${name.value}! Tu cuenta ha sido creada.`,
    confirmButtonText: 'Continuar'
  })
}
</script>

<style scoped>
.neon-card {
  background-color: #1a1a1a;
  color: #0ff;
  border: 1px solid #0ff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
}
</style>
