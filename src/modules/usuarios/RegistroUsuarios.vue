<!-- src/modules/usuarios/RegistroUsuarios.vue -->
<template>
  <div class="shell">
    <!-- Header con gradiente -->
    <header class="hero">
      <div class="hero__text">
        <h1>
          <i class="bi bi-person-vcard-fill"></i>
          {{ editando ? 'Editar usuario' : 'Registrar usuario' }}
        </h1>
        <p>Completa los datos y revisa el resumen en tiempo real.</p>
      </div>

      <!-- Stepper -->
      <ol class="stepper" role="list">
        <li :class="{ active: activeTab==='personales' || activeTab==='contacto' || activeTab==='rol' }">
          <span class="step-index">1</span>
          <span class="step-label">Datos personales</span>
        </li>
        <li :class="{ active: activeTab==='contacto' || activeTab==='rol' }">
          <span class="step-index">2</span>
          <span class="step-label">Contacto</span>
        </li>
        <li :class="{ active: activeTab==='rol' }">
          <span class="step-index">3</span>
          <span class="step-label">Seguridad y rol</span>
        </li>
      </ol>
    </header>

    <!-- Loader + toast -->
    <Loading :active="cargando" :is-full-page="true" />
    <div v-if="showToast" class="toast success">
      <i class="bi bi-check-circle-fill me-2"></i>
      Usuario {{ editando ? 'actualizado' : 'registrado' }} correctamente
    </div>

    <!-- Layout principal: formulario + preview -->
    <div class="canvas">
      <form @submit.prevent="guardarUsuario" class="card form-card">
        <!-- Tabs -->
        <nav class="tabs">
          <button type="button" :class="['tab', {active: activeTab==='personales'}]" @click="activeTab='personales'">
            <i class="bi bi-person-lines-fill"></i> Personales
          </button>
          <button type="button" :class="['tab', {active: activeTab==='contacto'}]" @click="activeTab='contacto'">
            <i class="bi bi-telephone-fill"></i> Contacto
          </button>
          <button type="button" :class="['tab', {active: activeTab==='rol'}]" @click="activeTab='rol'">
            <i class="bi bi-shield-lock-fill"></i> Seguridad y Rol
          </button>
        </nav>

        <!-- secciones -->
        <!-- PERSONALES -->
        <section v-show="activeTab==='personales'" class="grid">
          <div class="fl" :class="stateCls('nombre')">
            <input v-model.trim="usuario.nombre" type="text" placeholder=" " />
            <label><i class="bi bi-person-fill"></i> Nombre</label>
            <small v-if="errores.nombre" class="err">{{ errores.nombre }}</small>
          </div>

          <div class="fl" :class="stateCls('apellido')">
            <input v-model.trim="usuario.apellido" type="text" placeholder=" " />
            <label><i class="bi bi-people-fill"></i> Apellido</label>
            <small v-if="errores.apellido" class="err">{{ errores.apellido }}</small>
          </div>

          <div class="fl" :class="stateCls('dni')">
            <input v-model.trim="usuario.dni" type="text" maxlength="8" placeholder=" " />
            <label><i class="bi bi-credit-card-2-front"></i> DNI</label>
            <small class="hint">8 dígitos</small>
            <small v-if="errores.dni" class="err">{{ errores.dni }}</small>
          </div>

          <div class="fl">
            <input v-model="usuario.fecha_nacimiento" type="date" placeholder=" " />
            <label><i class="bi bi-calendar-event"></i> Fecha de nacimiento</label>
          </div>

          <div class="fl">
            <select v-model="usuario.estado">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
            <label><i class="bi bi-toggle-on"></i> Estado</label>
          </div>
        </section>

        <!-- CONTACTO -->
        <section v-show="activeTab==='contacto'" class="grid">
          <div class="fl" :class="stateCls('correo')">
            <input v-model.trim="usuario.correo" type="email" placeholder=" " />
            <label><i class="bi bi-envelope-at"></i> Correo electrónico</label>
            <small v-if="errores.correo" class="err">{{ errores.correo }}</small>
          </div>

          <div class="fl">
            <input v-model.trim="usuario.telefono" type="tel" placeholder=" " />
            <label><i class="bi bi-telephone-fill"></i> Teléfono</label>
          </div>

          <div class="fl col-2">
            <input v-model.trim="usuario.direccion" type="text" placeholder=" " />
            <label><i class="bi bi-geo-alt-fill"></i> Dirección</label>
          </div>
        </section>

        <!-- ROL -->
        <section v-show="activeTab==='rol'" class="grid">
          <div class="fl" :class="stateCls('rol_id')">
            <select v-model.number="usuario.rol_id">
              <option :value="null" disabled>Seleccione un rol</option>
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
            <label><i class="bi bi-person-gear"></i> Rol</label>
            <small v-if="errores.rol_id" class="err">{{ errores.rol_id }}</small>
          </div>

          <div class="fl" :class="stateCls('password')">
            <input v-model.trim="usuario.password" type="password" placeholder=" " />
            <label>
              <i class="bi bi-shield-lock-fill"></i>
              {{ editando ? 'Contraseña (si deseas cambiarla)' : 'Contraseña' }}
            </label>
            <small v-if="errores.password" class="err">{{ errores.password }}</small>
          </div>
        </section>

        <!-- Barra de acciones sticky -->
        <div class="actionbar">
          <router-link class="btn ghost" to="/usuarios">
            <i class="bi bi-arrow-left-circle"></i> Volver
          </router-link>
          <button class="btn primary" type="submit" :disabled="cargando">
            <i class="bi" :class="editando ? 'bi-pencil-square' : 'bi-check2-circle'"></i>
            {{ editando ? 'Actualizar usuario' : 'Guardar usuario' }}
          </button>
        </div>
      </form>

      <!-- Preview en vivo -->
      <aside class="card preview">
        <div class="avatar" :data-iniciales="iniciales">
          <i class="bi bi-person-fill"></i>
        </div>
        <h3 class="name">{{ usuario.nombre || 'Nombre' }} {{ usuario.apellido }}</h3>
        <p class="mail">
          <i class="bi bi-envelope"></i> {{ usuario.correo || 'correo@dominio.com' }}
        </p>

        <div class="chips">
          <span class="chip" :class="estadoClase(usuario.estado)">
            {{ estadoTexto(usuario.estado) }}
          </span>
          <span class="chip outline" v-if="rolNombre">
            <i class="bi bi-person-gear"></i> {{ rolNombre }}
          </span>
        </div>

        <ul class="meta">
          <li><i class="bi bi-credit-card-2-front"></i> <span>{{ usuario.dni || '—' }}</span></li>
          <li><i class="bi bi-telephone"></i> <span>{{ usuario.telefono || '—' }}</span></li>
          <li><i class="bi bi-geo-alt"></i> <span>{{ usuario.direccion || '—' }}</span></li>
          <li><i class="bi bi-calendar3"></i> <span>{{ usuario.fecha_nacimiento || '—' }}</span></li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import api from '@/services/api'
import { createUsuario, updateUsuario, getUsuario } from '@/services/usuarioService'

export default {
  components: { Loading },
  data() {
    return {
      activeTab: 'personales',
      usuario: {
        id: null,
        nombre: '',
        apellido: '',
        dni: '',
        correo: '',
        password: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
        estado: 'activo',
        rol_id: null
      },
      roles: [],
      errores: {},
      editando: false,
      cargando: false,
      showToast: false
    }
  },
  computed: {
    rolNombre() {
      const r = this.roles.find(x => x.id === this.usuario.rol_id)
      return r?.nombre || ''
    },
    iniciales() {
      const n = `${this.usuario.nombre || ''} ${this.usuario.apellido || ''}`.trim()
      const parts = n.split(/\s+/).filter(Boolean).slice(0, 2)
      return parts.map(p => p[0]?.toUpperCase() || '').join('')
    }
  },
  async mounted() {
    await this.cargarRoles()
    const usuarioEdicion = JSON.parse(localStorage.getItem('usuarioEdicion'))
    if (usuarioEdicion?.id) {
      this.editando = true
      await this.cargarDetalle(usuarioEdicion.id)
      localStorage.removeItem('usuarioEdicion')
    }
  },
  methods: {
    estadoTexto(v) {
      const s = String(v || 'activo').toLowerCase()
      if (s === 'inactivo') return 'Inactivo'
      if (s === 'suspendido') return 'Suspendido'
      return 'Activo'
    },
    estadoClase(v) {
      const s = String(v || 'activo').toLowerCase()
      return {
        'chip--ok': s === 'activo',
        'chip--warn': s === 'suspendido',
        'chip--bad': s === 'inactivo'
      }
    },
    stateCls(campo) {
      return {
        invalid: !!this.errores[campo],
        ok:
          this.usuario[campo] !== '' &&
          this.usuario[campo] !== null &&
          this.usuario[campo] !== undefined &&
          !this.errores[campo]
      }
    },
    async cargarRoles() {
      try {
        const { data } = await api.get('/roles')
        const raw = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : data?.data?.data || [])
        this.roles = raw.map(r => ({ id: Number(r.id), nombre: r.nombre }))
      } catch {
        this.roles = []
      }
    },
    async cargarDetalle(id) {
      this.cargando = true
      try {
        const u = await getUsuario(id)
        const raw = u._raw || u
        const rolIdCandidate = raw.rol_id ?? raw?.rol?.id ?? u.rol_id ?? u?.rol?.id ?? null
        this.usuario = {
          id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          dni: u.dni,
          correo: u.correo,
          password: '',
          telefono: u.telefono || '',
          direccion: u.direccion || '',
          fecha_nacimiento: u.fecha_nacimiento || '',
          estado: u.estado || 'activo',
          rol_id: rolIdCandidate != null ? Number(rolIdCandidate) : null,
          _raw: raw
        }
      } finally {
        this.cargando = false
      }
    },
    validar() {
      this.errores = {}
      if (!this.usuario.nombre) this.errores.nombre = 'El nombre es obligatorio.'
      if (!this.usuario.apellido) this.errores.apellido = 'El apellido es obligatorio.'
      if (!this.usuario.dni || this.usuario.dni.length !== 8) this.errores.dni = 'El DNI debe tener 8 dígitos.'
      if (!this.usuario.correo || !this.usuario.correo.includes('@')) this.errores.correo = 'Correo no válido.'
      if (!this.editando && !this.usuario.password) this.errores.password = 'La contraseña es obligatoria.'
      if (this.usuario.rol_id === null || this.usuario.rol_id === undefined) this.errores.rol_id = 'Seleccione un rol.'

      if (Object.keys(this.errores).length) {
        const tabPorCampo = {
          nombre: 'personales',
          apellido: 'personales',
          dni: 'personales',
          fecha_nacimiento: 'personales',
          estado: 'personales',
          correo: 'contacto',
          telefono: 'contacto',
          direccion: 'contacto',
          password: 'rol',
          rol_id: 'rol'
        }
        this.activeTab = tabPorCampo[Object.keys(this.errores)[0]] || 'personales'
      }
      return Object.keys(this.errores).length === 0
    },
    bodyLimpio() {
      const b = {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        dni: this.usuario.dni,
        correo: this.usuario.correo,
        telefono: this.usuario.telefono || undefined,
        direccion: this.usuario.direccion || undefined,
        fecha_nacimiento: this.usuario.fecha_nacimiento || undefined,
        estado: this.usuario.estado || undefined,
        rol_id: this.usuario.rol_id ?? undefined
      }
      if (this.usuario.password) b.password = this.usuario.password
      Object.keys(b).forEach(k => b[k] === undefined && delete b[k])
      return b
    },
    async guardarUsuario() {
      if (!this.validar()) {
        Swal.fire({ icon: 'error', title: 'Revisa el formulario', text: 'Corrige los campos marcados.' })
        return
      }
      this.cargando = true
      try {
        if (this.editando && this.usuario.id) {
          await updateUsuario(this.usuario.id, this.bodyLimpio())
        } else {
          await createUsuario(this.bodyLimpio())
        }
        this.showToast = true
        setTimeout(() => (this.showToast = false), 2200)
        this.$router.push('/usuarios')
      } catch (e) {
        const errs = e?.response?.data?.errors || {}
        if (Object.keys(errs).length) {
          this.errores = Object.fromEntries(
            Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
          this.validar()
          Swal.fire({ icon: 'error', title: 'Validación', text: 'Revisa los campos marcados.' })
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el usuario.' })
        }
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
:root{
  /* Paleta clara (igual al diseño de Tours) */
  --bg:#ffffff;
  --card:#ffffff;
  --ink:#0f172a;
  --muted:#475569;
  --primary:#0ea5e9;
  --accent:#10b981;
  --warn:#f59e0b;
  --danger:#ef4444;
  --ring: rgba(14,165,233,.18);
}

/* === Fondo tipo halo superior suave === */
.shell{
  min-height:100%;
  background:
    radial-gradient(1200px 600px at 50% -220px, #eaf6ff 0%, rgba(234,246,255,0.6) 35%, transparent 60%),
    linear-gradient(180deg,#ffffff 0%, #fcfeff 45%, #f9fbff 100%);
  color: var(--ink);
  padding-bottom:32px;
}

/* Cabecera */
.hero{
  max-width:1200px; margin:24px auto 12px; padding:20px 22px;
  border-radius:16px;
  background: linear-gradient(135deg, rgba(14,165,233,.18), rgba(16,185,129,.10));
  border:1px solid rgba(2,6,23,.06);
  box-shadow: 0 6px 18px rgba(2,6,23,.06);
}
.hero__text h1{ margin:0 0 6px; font-size:1.35rem; display:flex; gap:10px; align-items:center; color:#0b3b57 }
.hero__text p{ margin:0; color: var(--muted) }

/* Stepper (claro) */
.stepper{ display:flex; gap:12px; margin-top:14px; padding:0; list-style:none }
.stepper li{
  position:relative; flex:1; padding:10px 12px; border-radius:10px;
  background:#ffffff; border:1px solid #e2e8f0;
  display:flex; align-items:center; gap:10px; color:var(--ink);
}
.stepper li:not(:last-child)::after{
  content:''; position:absolute; right:-6px; top:50%; width:12px; height:2px; background:#e2e8f0;
}
.step-index{
  display:grid; place-items:center; width:26px; height:26px; border-radius:999px;
  background:#f1f5f9; border:1px solid #e2e8f0; font-weight:700; color:#0f172a;
}
.stepper li.active .step-index{ background:#0ea5e9; border-color:#0ea5e9; color:#fff }
.step-label{ font-weight:600 }

/* Layout principal */
.canvas{
  max-width:1200px; margin:0 auto;
  display:grid; gap:16px;
  grid-template-columns: minmax(640px, 2fr) minmax(320px, 1fr);
}

/* Tarjetas */
.card{
  background:var(--card); color:var(--ink);
  border:1px solid #e8eef6; border-radius:14px;
  box-shadow:0 8px 22px rgba(2,6,23,.08);
}

/* Tabs */
.form-card{ overflow:hidden }
.tabs{
  display:flex; gap:8px; border-bottom:1px solid #eef2f7; padding:10px;
  position:sticky; top:0; background:#fff; z-index:5;
}
.tab{
  border:1px solid #e2e8f0; background:#fff; color:#334155; padding:8px 12px; border-radius:999px;
  display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;
}
.tab.active{ background:#e8f6ff; color:#0369a1; border-color:#bae6fd }

/* Secciones */
.grid{
  display:grid; gap:14px 16px; padding:14px;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
}
.col-2{ grid-column: 1 / -1 }

/* Floating labels “pill” */
.fl{ position:relative; display:flex; flex-direction:column }
.fl input,.fl select,.fl textarea{
  width:100%;
  background:#fff; color:var(--ink);
  border:1.2px solid #e5e7eb; border-radius:10px;
  padding:14px 12px 10px;
  font-size:1rem;
  outline:none; transition:border-color .2s, box-shadow .2s;
  min-height:44px;
}
.fl input:focus,.fl select:focus,.fl textarea:focus{ border-color:var(--primary); box-shadow:0 0 0 4px var(--ring) }
.fl textarea{ resize:vertical }

.fl label{
  position:absolute; left:12px; top:14px;
  display:inline-flex; align-items:center; gap:6px;
  padding:0 10px; height:20px; line-height:20px;
  border-radius:999px; background:#f8fbff; color:#5b6b7f;
  border:1px solid #e6eef8;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  max-width:calc(100% - 24px);
  pointer-events:none; transition: all .18s ease;
  box-shadow: 0 0 0 3px #fff;
}
.fl label i{ font-size:1em; position:relative; top:-1px }
.fl input::placeholder{ color:transparent }
.fl input:focus + label,
.fl input:not(:placeholder-shown) + label,
.fl textarea:focus + label,
.fl textarea:not(:placeholder-shown) + label,
.fl select + label{
  top:-10px; font-size:.78rem; color:#0369a1;
  height:18px; line-height:18px; box-shadow: 0 0 0 4px #fff;
}

/* Estados de validación */
.fl.invalid input, .fl.invalid select, .fl.invalid textarea{ border-color: var(--danger); background:#fff7f7 }
.fl.ok input, .fl.ok select, .fl.ok textarea{ border-color: var(--accent); background:#f0fdf4 }
.err{ color: var(--danger); font-size:.82rem; margin-top:6px }
.hint{ color:#94a3b8; font-size:.78rem; margin-top:6px }

/* Action bar sticky */
.actionbar{
  display:flex; justify-content:flex-end; gap:10px; padding:12px 14px; border-top:1px solid #eef2f7;
  position:sticky; bottom:0; background:#fff; z-index:4;
}
.btn{
  border:1px solid #cbd5e1; color:#0f172a; background:#fff; padding:10px 14px; border-radius:10px;
  display:inline-flex; align-items:center; gap:8px; font-weight:700; cursor:pointer;
}
.btn.ghost{ background:#f8fafc }
.btn.primary{ background:linear-gradient(90deg,#0ea5e9,#22c55e); border-color:transparent; color:#fff }
.btn:disabled{ opacity:.7; cursor:not-allowed }

/* Preview */
.preview{ padding:16px 16px 10px; position:sticky; top:18px; align-self:start }
.avatar{
  width:72px; height:72px; border-radius:18px; background:linear-gradient(135deg,#0ea5e9,#22c55e);
  display:grid; place-items:center; color:#fff; font-size:1.6rem; font-weight:900; margin-bottom:10px;
}
.name{ margin:0 0 4px; font-size:1.15rem }
.mail{ margin:0 0 10px; color:#475569 }
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px }
.chip{
  display:inline-flex; gap:6px; align-items:center; padding:6px 10px; border-radius:999px; font-weight:700; font-size:.85rem; color:#0f172a;
  background:#f1f5f9; border:1px solid #e2e8f0;
}
.chip.outline{ background:#fff }
.chip--ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534 }
.chip--warn{ background:#fff7ed; border-color:#fed7aa; color:#7c2d12 }
.chip--bad{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d }

.meta{ list-style:none; padding:0; margin:0; display:grid; gap:6px; color:#0f172a }
.meta li{ display:flex; gap:10px }

/* Toast */
.toast{ position:fixed; top:18px; right:22px; padding:10px 14px; border-radius:10px; color:#fff; font-weight:700; z-index:1000 }
.toast.success{ background:#22c55e }

/* Responsive */
@media (max-width:1180px){ .canvas{ grid-template-columns:1fr } .preview{ position:static } }
@media (max-width:720px){ .grid{ grid-template-columns:1fr } }
</style>
