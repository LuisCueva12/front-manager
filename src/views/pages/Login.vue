<template>
  <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
    <div class="card p-4 shadow-lg neon-card">
      <h2 class="text-center mb-3">Inicio de Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group mb-3 position-relative">
          <i class="fas fa-envelope position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input type="email" class="form-control ps-5" v-model="username" placeholder="Correo electrónico" required />
        </div>
        <div class="form-group mb-3 position-relative">
          <i class="fas fa-lock position-absolute top-50 translate-middle-y ms-2 text-info"></i>
          <input type="password" class="form-control ps-5" v-model="password" placeholder="Contraseña" required />
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3 small">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" v-model="rememberMe" id="remember" />
            <label class="form-check-label" for="remember">Recuérdame</label>
          </div>
          <a href="#" class="link-info" @click.prevent="recuperarContrasena">¿Olvidaste tu contraseña?</a>
        </div>
        <button type="submit" class="btn btn-info w-100 text-white fw-bold mb-3">Ingresar</button>
        <p class="text-center text-muted">O inicia sesión con:</p>
        <div class="d-flex gap-2 justify-content-center mb-3">
          <button type="button" class="btn btn-primary d-flex align-items-center gap-2" @click="loginFacebook">
            <i class="fab fa-facebook-f"></i> Facebook
          </button>
          <button type="button" class="btn btn-danger d-flex align-items-center gap-2" @click="loginGoogle">
            <i class="fab fa-google"></i> Google
          </button>
        </div>
        <p class="text-center small">¿No tienes una cuenta?
          <a href="#" class="link-info" @click.prevent="goToRegister">Regístrate</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const router = useRouter()

function handleLogin() {
  if (username.value === 'admin@gmail.com' && password.value === 'admin123') {
    sessionStorage.setItem('auth', 'true')
    localStorage.setItem('auth', 'true')

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Has iniciado sesión correctamente.',
      timer: 2000,
      showConfirmButton: false
    })

    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Credenciales inválidas',
      text: 'Verifica tu correo o contraseña'
    })
  }
}

function recuperarContrasena() {
  Swal.fire({
    title: '¿Olvidaste tu contraseña?',
    text: 'Serás redirigido para recuperarla.',
    icon: 'info',
    confirmButtonText: 'Aceptar'
  }).then(() => {
    router.push('/recuperar')
  })
}

function goToRegister() {
  router.push('/registro')
}

function loginFacebook() {
  Swal.fire({
    title: 'Redirigiendo a Facebook...',
    icon: 'info',
    timer: 1500,
    showConfirmButton: false
  })
}

function loginGoogle() {
  Swal.fire({
    title: 'Redirigiendo a Google...',
    icon: 'info',
    timer: 1500,
    showConfirmButton: false
  })
}

onMounted(() => {
  const isSessionActive = sessionStorage.getItem('auth') === 'true'
  const isRemembered = localStorage.getItem('auth') === 'true'
  if (isSessionActive || isRemembered) {
    router.push('/dashboard')
  }
})
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
