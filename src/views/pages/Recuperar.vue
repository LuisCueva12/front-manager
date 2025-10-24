<!-- src/views/pages/Recuperar.vue -->
<template>
  <div class="container-fluid vh-100 d-flex justify-content-center align-items-center bg-dark">
    <Loading :active="loading" :is-full-page="true" />
    <div class="card p-4 shadow-lg neon-card text-center">
      <h2 class="text-info mb-2">Recuperar Contraseña</h2>
      <p class="text-light small mb-4">
        Ingresa tu correo electrónico y te enviaremos un <b>enlace para restablecer</b> tu contraseña.
      </p>

      <form @submit.prevent="handleRecover">
        <div class="form-group mb-3 position-relative">
          <i class="fas fa-envelope position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input
            type="email"
            v-model.trim="email"
            class="form-control ps-5"
            placeholder="correo@dominio.com"
            required
          />
        </div>

        <button type="submit" class="btn btn-info w-100 fw-bold text-white" :disabled="!isValid || loading">
          {{ loading ? 'Enviando…' : 'Enviar enlace' }}
        </button>

        <router-link to="/login" class="d-block small link-info mt-3">← Volver al login</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import { requestPasswordReset } from '@/services/authService'

const email = ref('')
const loading = ref(false)

const isValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value || ''))

async function handleRecover () {
  if (!isValid.value) return
  loading.value = true
  try {
    await requestPasswordReset(email.value)
    loading.value = false
    await Swal.fire({
      icon: 'success',
      title: 'Correo enviado',
      html: `
        <div style="text-align:left">
          <p>Si <b>${email.value}</b> existe en nuestro sistema, recibirás un <b>enlace</b> para restablecer tu contraseña.</p>
          <p class="small text-muted">Revisa también <b>Spam</b> o <b>Promociones</b>.</p>
        </div>
      `,
      confirmButtonColor: '#0dcaf0'
    })
    // Tip: mantenemos al usuario aquí por si escribió mal el correo
    // Si prefieres, puedes redirigir: window.location.href = '/login'
  } catch (err) {
    loading.value = false
    Swal.fire('No se pudo enviar', err?.message || 'Ocurrió un error al enviar el enlace.', 'error')
  }
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
