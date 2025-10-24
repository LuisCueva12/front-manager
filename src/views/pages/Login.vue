<!-- src/views/pages/Login.vue -->
<template>
  <div class="login-wrapper">
    <Loading :active="isLoading" :is-full-page="true" />

    <div class="login-left">
      <div class="overlay">
        <h1 class="welcome-title">¡Bienvenido de nuevo!</h1>
        <p class="welcome-text">
          Explora la aventura con nosotros. Gestiona tus reservas y experiencias desde tu panel.
        </p>
        <div class="social-icons">
          <i class="fab fa-facebook-f"></i>
          <i class="fab fa-instagram"></i>
          <i class="fab fa-twitter"></i>
          <i class="fab fa-youtube"></i>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="card p-4 shadow neon-card">
        <h2 class="text-center mb-3">Inicio de Sesión</h2>

        <form @submit.prevent="handleLogin">
          <div class="form-group mb-3 position-relative">
            <i class="fas fa-envelope position-absolute top-50 translate-middle-y ms-2 text-info"></i>
            <input
              type="email"
              class="form-control ps-5"
              v-model.trim="username"
              placeholder="Correo electrónico"
              required
            />
          </div>

          <div class="form-group mb-3 position-relative">
            <i class="fas fa-lock position-absolute top-50 translate-middle-y ms-2 text-info"></i>
            <input
              type="password"
              class="form-control ps-5"
              v-model.trim="password"
              placeholder="Contraseña (mínimo 5 caracteres)"
              required
              minlength="5"
            />
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3 small">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="rememberMe" id="remember" />
              <label class="form-check-label" for="remember">Recuérdame</label>
            </div>
            <a href="#" class="link-info" @click.prevent="recuperarContrasena">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            class="btn btn-info w-100 text-white fw-bold mb-3"
            :disabled="!username || password.length < 5 || isLoading"
          >
            Ingresar
          </button>

          <p class="text-center text-muted">O inicia sesión con:</p>
          <div class="d-flex gap-2 justify-content-center mb-3">
            <button type="button" class="btn btn-primary d-flex align-items-center gap-2" @click="loginFacebook">
              <i class="fab fa-facebook-f"></i> Facebook
            </button>
            <button type="button" class="btn btn-danger d-flex align-items-center gap-2" @click="loginGoogle">
              <i class="fab fa-google"></i> Google
            </button>
          </div>

          <p class="text-center small">
            ¿No tienes una cuenta?
            <a href="#" class="link-info" @click.prevent="goToRegister">Regístrate</a>
          </p>

          <div class="text-center mt-3">
            <button class="btn btn-outline-light w-100" @click.prevent="volverInicio">
              <i class="fas fa-home me-2"></i>Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/services/authService'
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'

export default {
  components: { Loading },
  data: () => ({
    username: '',
    password: '',
    rememberMe: false,
    isLoading: false
  }),
  methods: {
    async handleLogin () {
      if (!this.username || this.password.length < 5) {
        Swal.fire('Datos inválidos', 'Completa el correo y la contraseña (mínimo 5 caracteres).', 'warning')
        return
      }
      this.isLoading = true
      try {
        // El servicio fija token en axios y setea Pinia
        const { token, user } = await login({ correo: this.username, password: this.password })

        // Implementa "Recuérdame" real:
        // - Si NO está marcado, pasamos el token a sessionStorage y borramos localStorage,
        //   porque api.getAuthToken() prioriza localStorage.
        if (!this.rememberMe && token) {
          try {
            sessionStorage.setItem('token', token)
            localStorage.removeItem('auth:token')
            localStorage.removeItem('token')
          } catch {}
        }

        this.isLoading = false
        await Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: user?.name || user?.nombre || 'Acceso exitoso',
          confirmButtonColor: '#7e74f1'
        })

        const redirect = typeof this.$route.query.redirect === 'string'
          ? this.$route.query.redirect
          : '/dashboard'
        // replace para no volver al login al presionar "Atrás"
        await this.$router.replace(redirect)
      } catch (err) {
        this.isLoading = false
        Swal.fire('Error', err?.message || 'No se pudo iniciar sesión. Verifica tus datos.', 'error')
      }
    },
    recuperarContrasena () { this.$router.push('/recuperar') },
    loginFacebook () { Swal.fire('Info', 'Inicio de sesión con Facebook aún no disponible.', 'info') },
    loginGoogle () { Swal.fire('Info', 'Inicio de sesión con Google aún no disponible.', 'info') },
    goToRegister () { this.$router.push('/registro') },
    volverInicio () { this.$router.push('/') }
  }
}
</script>

<style scoped>
/* … tus estilos tal cual … */
.login-wrapper { display:flex; height:100vh; font-family:'Poppins',sans-serif; }
.login-left { flex:1; background:url('https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg') no-repeat center/cover; position:relative; display:flex; align-items:center; justify-content:center; color:#fff; }
.overlay { background:rgba(0,0,0,0.6); padding:3rem; border-radius:12px; text-align:center; }
.welcome-title { font-size:2.5rem; font-weight:700; margin-bottom:1rem; }
.welcome-text { font-size:1rem; max-width:400px; margin:0 auto 1.5rem; }
.social-icons i { font-size:1.5rem; margin:0 10px; cursor:pointer; color:#ffffffcc; transition:transform .3s; }
.social-icons i:hover { transform:scale(1.2); color:#fff; }
.login-right { flex:1; background:#121212; display:flex; align-items:center; justify-content:center; }
.neon-card { background:rgba(255,255,255,.05); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:#fff; border-radius:16px; max-width:400px; width:100%; border:none; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.btn-outline-light { border:1px solid #ffffff99; color:#ffffffcc; transition:all .3s; }
.btn-outline-light:hover { background:#ffffffcc; color:#000; }
</style>
