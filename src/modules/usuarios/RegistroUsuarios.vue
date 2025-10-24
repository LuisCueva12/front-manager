<!-- src/modules/usuarios/RegistroUsuarios.vue -->
<template>
  <div class="shell">
    <!-- Encabezado -->
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

    <Loading :active="cargando" :is-full-page="true" />
    <div v-if="showToast" class="toast success">
      <i class="bi bi-check-circle-fill me-2"></i>
      Usuario {{ editando ? 'actualizado' : 'registrado' }} correctamente
    </div>

    <!-- Layout principal -->
    <div class="canvas">
      <!-- Formulario -->
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

          <!-- Uploader con Drag & Drop + Cámara -->
          <div class="col-2">
            <div
              class="uploader"
              :class="{'uploader--drag': dragging, 'uploader--ok': uploadDone}"
              @dragenter.prevent="onDragEnter"
              @dragover.prevent="onDragOver"
              @dragleave.prevent="onDragLeave"
              @drop.prevent="onDrop"
            >
              <div class="uploader__left">
                <div class="avatar avatar--lg">
                  <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
                  <div v-else class="avatar-fallback">{{ iniciales || '👤' }}</div>

                  <!-- Botón eliminar sobre la imagen -->
                  <button
                    v-if="tieneFoto"
                    type="button"
                    class="avatar__remove"
                    :disabled="borrandoFoto || cargando"
                    @click.stop="quitarFotoPerfil"
                    title="Quitar foto"
                  >
                    <i class="bi bi-trash3-fill"></i>
                  </button>

                  <!-- Progreso circular -->
                  <div v-if="uploading" class="avatar__progress">
                    <span>{{ Math.round(uploadProgress) }}%</span>
                  </div>

                  <!-- Check de éxito -->
                  <div v-if="uploadDone" class="avatar__done">
                    <i class="bi bi-check2"></i>
                  </div>
                </div>
              </div>

              <div class="uploader__right">
                <p class="uploader__title">Foto de perfil</p>
                <p class="uploader__hint">Arrastra y suelta la imagen aquí, o usa la cámara</p>

                <div class="uploader__buttons">
                  <button type="button" class="btn" @click="openFilePicker">
                    <i class="bi bi-upload"></i> Elegir foto
                  </button>

                  <!-- Abrir cámara (getUserMedia) -->
                  <button type="button" class="btn ghost" @click="openCamera">
                    <i class="bi bi-camera-video-fill"></i> Tomar foto
                  </button>
                </div>

                <p class="uploader__meta">
                  Formatos: JPG/PNG/WEBP. Máx: 5 MB.
                  <span v-if="!editando && (previewUrl || fotoFile)" class="meta-note">
                    (Se subirá automáticamente al guardar)
                  </span>
                </p>

                <!-- Nombre del archivo seleccionado -->
                <div v-if="fileName" class="chip-file">
                  <i class="bi bi-file-earmark-image"></i>
                  <span class="ellipsis">{{ fileName }}</span>
                  <button type="button" class="chip-close" @click="clearLocalFile" :disabled="uploading">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>

                <!-- Fallback de archivo -->
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="hidden-input"
                />
              </div>
            </div>
            <small v-if="errores.foto" class="err" style="margin-top:8px">{{ errores.foto }}</small>
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
            <input v-model.trim="usuario.password" type="password" placeholder=" " autocomplete="new-password" />
            <label>
              <i class="bi bi-shield-lock-fill"></i>
              {{ editando ? 'Contraseña (si deseas cambiarla)' : 'Contraseña' }}
            </label>
            <small v-if="errores.password" class="err">{{ errores.password }}</small>
          </div>
        </section>

        <!-- Acción -->
        <div class="actionbar">
          <router-link class="btn ghost" to="/usuarios">
            <i class="bi bi-arrow-left-circle"></i> Volver
          </router-link>
          <button class="btn primary" type="submit" :disabled="cargando || uploading">
            <i class="bi" :class="editando ? 'bi-pencil-square' : 'bi-check2-circle'"></i>
            {{ editando ? 'Actualizar usuario' : 'Guardar usuario' }}
          </button>
        </div>
      </form>

      <!-- Aside Preview -->
      <aside class="card preview">
        <div class="preview__top">
          <div class="avatar avatar--md">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-fallback">{{ iniciales || '👤' }}</div>
          </div>

          <div class="preview__title">
            <h3 class="name">{{ usuario.nombre || 'Nombre' }} {{ usuario.apellido }}</h3>
            <p class="mail"><i class="bi bi-envelope"></i> {{ usuario.correo || 'correo@dominio.com' }}</p>
          </div>
        </div>

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

    <!-- === Modal Cámara === -->
    <div v-if="showCamera" class="cam-modal" @click.self="closeCamera(false)">
      <div class="cam-card">
        <div class="cam-head">
          <strong><i class="bi bi-camera-video"></i> Cámara</strong>
          <div class="spacer"></div>
          <button class="btn ghost sm" @click="switchCamera" :disabled="startingCam || capturing">
            <i class="bi bi-arrow-repeat"></i> Cambiar cámara
          </button>
          <button class="btn danger sm" @click="closeCamera(false)" :disabled="startingCam || capturing">
            <i class="bi bi-x-lg"></i> Cerrar
          </button>
        </div>

        <div class="cam-body">
          <div class="cam-view">
            <video
              ref="video"
              class="cam-video"
              autoplay
              playsinline
              muted
            ></video>

            <div class="cam-overlay" v-if="startingCam">
              <div class="spinner"></div>
              <span>Abriendo cámara…</span>
            </div>
          </div>
        </div>

        <div class="cam-foot">
          <button class="btn primary" @click="capturePhoto" :disabled="startingCam || capturing">
            <i class="bi bi-camera-fill"></i>
            {{ editando ? 'Capturar y subir' : 'Capturar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import api from '@/services/api'
import { createUsuario, updateUsuario, getUsuario } from '@/services/usuarioService'

const API_ORIGIN = (() => {
  try {
    const u = new URL(api.defaults.baseURL || window.location.origin)
    return `${u.protocol}//${u.hostname}${u.port ? ':' + u.port : ''}`
  } catch {
    return 'http://localhost:8000'
  }
})()

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
        rol_id: null,
        foto_perfil: null,
      },
      roles: [],
      errores: {},
      editando: false,
      cargando: false,
      showToast: false,

      // Imagen
      fileName: '',
      fotoFile: null,
      previewUrl: null, // blob/url temporal (predomina sobre foto_perfil)
      borrandoFoto: false,

      // Drag & Drop + progreso
      dragging: false,
      uploading: false,
      uploadProgress: 0,
      uploadDone: false,

      // Cámara
      showCamera: false,
      startingCam: false,
      capturing: false,
      cameraFacing: 'environment', // 'user' | 'environment'
      cameraStream: null,
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
    },
    avatarUrl() {
      if (this.previewUrl) return this.previewUrl
      const p = this.usuario?.foto_perfil
      if (!p) return null
      if (/^https?:\/\//i.test(p)) return p
      const rel = p.startsWith('storage/') ? p : `storage/${p.replace(/^\/+/, '')}`
      return `${API_ORIGIN}/${rel}`
    },
    tieneFoto() {
      return !!this.previewUrl || !!this.usuario?.foto_perfil
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
  beforeUnmount() {
    this.stopCamera()
  },
  methods: {
    /* ---------- UI helpers ---------- */
    openFilePicker() {
      this.$refs.fileInput?.click()
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

    /* ---------- Data ---------- */
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
          foto_perfil: u.foto_perfil || raw?.foto_perfil || null,
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

      if (this.fotoFile) {
        const mb = this.fotoFile.size / (1024 * 1024)
        const okType = /image\/(jpeg|jpg|png|webp)/i.test(this.fotoFile.type)
        if (!okType) this.errores.foto = 'Formato no válido. Usa JPG, PNG o WEBP.'
        if (mb > 5) this.errores.foto = 'La imagen supera 5 MB.'
      }

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
          rol_id: 'rol',
          foto: 'personales'
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

    /* ---------- Imagen: archivo ---------- */
    async handleFileUpload(e) {
      const file = e?.target?.files?.[0] || e?.dataTransfer?.files?.[0]
      if (!file) return
      this.fileName = file.name
      this.previewUrl = URL.createObjectURL(file)
      try {
        this.fotoFile = await this.compressImage(file, { maxSizePx: 800, quality: 0.9 })
      } catch {
        this.fotoFile = file
      }
      this.uploadDone = false

      // Si estamos editando (hay id), subimos automáticamente
      if (this.editando && this.usuario?.id) {
        await this.subirFotoPerfil(this.usuario.id)
      }
    },

    clearLocalFile() {
      this.fileName = ''
      this.previewUrl = null
      this.fotoFile = null
      this.uploadDone = false
      if (this.$refs.fileInput) this.$refs.fileInput.value = null
    },

    async compressImage(file, { maxSizePx = 800, quality = 0.9 } = {}) {
      if (!/^image\//.test(file.type)) return file
      const bitmap = await createImageBitmap(file)
      const ratio = Math.min(maxSizePx / bitmap.width, maxSizePx / bitmap.height, 1)
      const w = Math.round(bitmap.width * ratio)
      const h = Math.round(bitmap.height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(bitmap, 0, 0, w, h)

      const type = file.type.includes('png') ? 'image/png' : 'image/webp'
      const blob = await new Promise(res => canvas.toBlob(res, type, quality))
      return new File([blob], file.name.replace(/\.(\w+)$/, '.webp'), { type, lastModified: Date.now() })
    },

    /* ---------- Drag & Drop ---------- */
    onDragEnter() { this.dragging = true },
    onDragOver() { this.dragging = true },
    onDragLeave() { this.dragging = false },
    onDrop(e) { this.dragging = false; this.handleFileUpload(e) },

    /* ---------- Subida / borrado ---------- */
    async subirFotoPerfil(userId) {
      if (!this.fotoFile) return
      const form = new FormData()
      form.append('foto', this.fotoFile)

      this.uploading = true
      this.uploadDone = false
      this.uploadProgress = 0

      try {
        const { data } = await api.post(`/uploads/usuarios/${userId}/foto`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (!e.total) return
            this.uploadProgress = (e.loaded / e.total) * 100
          }
        })
        // Mostrar versión pública y marcar como ok
        this.usuario.foto_perfil = data?.relative_path || this.usuario.foto_perfil
        this.previewUrl = data?.url || this.previewUrl
        this.uploadDone = true
        setTimeout(() => (this.uploadDone = false), 1500)
      } finally {
        this.uploading = false
      }
    },

    async quitarFotoPerfil() {
      if (this.borrandoFoto) return

      // Si solo hay preview local (aún no subida) o usuario sin id
      if ((this.previewUrl && !this.usuario?.foto_perfil) || !this.usuario?.id) {
        this.clearLocalFile()
        this.usuario.foto_perfil = null
        return
      }

      const res = await Swal.fire({
        title: 'Quitar foto de perfil',
        text: '¿Deseas eliminar la foto actual?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e11d48'
      })
      if (!res.isConfirmed) return

      this.borrandoFoto = true
      try {
        await api.delete(`/uploads/usuarios/${this.usuario.id}/foto`)
        this.clearLocalFile()
        this.usuario.foto_perfil = null
        Swal.fire({ icon: 'success', title: 'Listo', text: 'Foto eliminada.' })
      } catch (e) {
        console.error(e)
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la foto.' })
      } finally {
        this.borrandoFoto = false
      }
    },

    /* ---------- Cámara (getUserMedia) ---------- */
    async openCamera() {
      // getUserMedia requiere HTTPS o localhost
      const isSecure = window.isSecureContext || location.hostname === 'localhost'
      if (!isSecure) {
        Swal.fire('Permiso requerido', 'Para usar la cámara abre el sitio con HTTPS o en localhost.', 'warning')
        return
      }

      this.showCamera = true
      await this.startCamera()
    },

    async startCamera() {
      try {
        this.startingCam = true
        this.stopCamera() // por si había otra

        const constraints = {
          video: {
            facingMode: { ideal: this.cameraFacing }, // 'environment' por defecto
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.cameraStream = stream
        const video = this.$refs.video
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
        }
      } catch (err) {
        console.error(err)
        Swal.fire('No se pudo abrir la cámara', 'Revisa permisos del navegador o dispositivo.', 'error')
        this.closeCamera(false)
      } finally {
        this.startingCam = false
      }
    },

    stopCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(t => t.stop())
        this.cameraStream = null
      }
    },

    async switchCamera() {
      this.cameraFacing = this.cameraFacing === 'environment' ? 'user' : 'environment'
      await this.startCamera()
    },

    async capturePhoto() {
      if (!this.$refs.video) return
      this.capturing = true
      try {
        const video = this.$refs.video
        const vw = video.videoWidth || 1280
        const vh = video.videoHeight || 720

        // Redimensionamos a máx 800px manteniendo proporción
        const maxSide = 800
        const ratio = Math.min(maxSide / vw, maxSide / vh, 1)
        const w = Math.round(vw * ratio)
        const h = Math.round(vh * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, w, h)

        // A blob (preferimos webp si está disponible)
        const type = 'image/webp'
        const blob = await new Promise(resolve => canvas.toBlob(resolve, type, 0.92))
        const file = new File([blob], `captura_${Date.now()}.webp`, { type })

        // Vista previa inmediata y estado local
        this.fileName = file.name
        this.previewUrl = URL.createObjectURL(file)
        this.fotoFile = file
        this.uploadDone = false

        // Cerrar cámara
        this.closeCamera(true)

        // Si estamos editando (hay id), subimos automáticamente
        if (this.editando && this.usuario?.id) {
          await this.subirFotoPerfil(this.usuario.id)
        } else {
          // Usuarios nuevos: avisito breve
          Swal.fire({
            icon: 'info',
            title: 'Foto lista',
            text: 'Se subirá automáticamente al guardar el usuario.',
            timer: 1600,
            showConfirmButton: false
          })
        }
      } finally {
        this.capturing = false
      }
    },

    closeCamera(keepOpen = false) {
      this.stopCamera()
      if (!keepOpen) this.showCamera = false
      else this.showCamera = false // cerramos igual tras captura
    },

    /* ---------- Guardar ---------- */
    async guardarUsuario() {
      if (!this.validar()) {
        Swal.fire({ icon: 'error', title: 'Revisa el formulario', text: 'Corrige los campos marcados.' })
        return
      }
      this.cargando = true
      try {
        let saved
        if (this.editando && this.usuario.id) {
          saved = await updateUsuario(this.usuario.id, this.bodyLimpio())
        } else {
          saved = await createUsuario(this.bodyLimpio())
        }

        const id =
          this.usuario.id ||
          saved?.id ||
          saved?.data?.id ||
          saved?._raw?.id ||
          saved?.usuario?.id

        if (!id) throw new Error('No se obtuvo el ID del usuario al guardar.')

        // Subimos la foto si existe archivo pendiente (usuarios nuevos)
        if (this.fotoFile) {
          await this.subirFotoPerfil(id)
        }

        this.showToast = true
        setTimeout(() => (this.showToast = false), 1500)
        this.$router.push('/usuarios')
      } catch (e) {
        const errs = e?.response?.data?.errors || {}
        if (Object.keys(errs).length) {
          this.errores = Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))
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

/* Fondo */
.shell{
  min-height:100%;
  background:
    radial-gradient(1200px 600px at 50% -220px, #eaf6ff 0%, rgba(234,246,255,0.6) 35%, transparent 60%),
    linear-gradient(180deg,#ffffff 0%, #fcfeff 45%, #f9fbff 100%);
  color: var(--ink);
  padding-bottom:32px;
}

/* Header */
.hero{ max-width:1200px; margin:24px auto 12px; padding:20px 22px; border-radius:16px;
  background: linear-gradient(135deg, rgba(14,165,233,.18), rgba(16,185,129,.10));
  border:1px solid rgba(2,6,23,.06); box-shadow: 0 6px 18px rgba(2,6,23,.06); }
.hero__text h1{ margin:0 0 6px; font-size:1.35rem; display:flex; gap:10px; align-items:center; color:#0b3b57 }
.hero__text p{ margin:0; color: var(--muted) }

/* Stepper */
.stepper{ display:flex; gap:12px; margin-top:14px; padding:0; list-style:none }
.stepper li{ position:relative; flex:1; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid #e2e8f0; display:flex; align-items:center; gap:10px }
.stepper li:not(:last-child)::after{ content:''; position:absolute; right:-6px; top:50%; width:12px; height:2px; background:#e2e8f0 }
.step-index{ display:grid; place-items:center; width:26px; height:26px; border-radius:999px; background:#f1f5f9; border:1px solid #e2e8f0; font-weight:700; color:#0f172a }
.stepper li.active .step-index{ background:#0ea5e9; border-color:#0ea5e9; color:#fff }
.step-label{ font-weight:600 }

/* Layout */
.canvas{ max-width:1200px; margin:0 auto; display:grid; gap:16px; grid-template-columns: minmax(640px, 2fr) minmax(320px, 1fr); }
.card{ background:var(--card); border:1px solid #e8eef6; border-radius:14px; box-shadow:0 8px 22px rgba(2,6,23,.08); }

/* Tabs */
.form-card{ overflow:hidden }
.tabs{ display:flex; gap:8px; border-bottom:1px solid #eef2f7; padding:10px; position:sticky; top:0; background:#fff; z-index:5; }
.tab{ border:1px solid #e2e8f0; background:#fff; color:#334155; padding:8px 12px; border-radius:999px; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; }
.tab.active{ background:#e8f6ff; color:#0369a1; border-color:#bae6fd }

/* Secciones */
.grid{ display:grid; gap:14px 16px; padding:14px; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr); }
.col-2{ grid-column: 1 / -1 }

/* Floating labels */
.fl{ position:relative; display:flex; flex-direction:column }
.fl input,.fl select,.fl textarea{ width:100%; background:#fff; color:var(--ink); border:1.2px solid #e5e7eb; border-radius:10px; padding:14px 12px 10px; font-size:1rem; outline:none; transition:border-color .2s, box-shadow .2s; min-height:44px; }
.fl input:focus,.fl select:focus,.fl textarea:focus{ border-color:var(--primary); box-shadow:0 0 0 4px var(--ring) }
.fl textarea{ resize:vertical }
.fl label{ position:absolute; left:12px; top:14px; display:inline-flex; align-items:center; gap:6px; padding:0 10px; height:20px; line-height:20px; border-radius:999px; background:#f8fbff; color:#5b6b7f; border:1px solid #e6eef8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:calc(100% - 24px); pointer-events:none; transition: all .18s ease; box-shadow: 0 0 0 3px #fff; }
.fl label i{ font-size:1em; position:relative; top:-1px }
.fl input::placeholder{ color:transparent }
.fl input:focus + label, .fl input:not(:placeholder-shown) + label, .fl textarea:focus + label, .fl textarea:not(:placeholder-shown) + label, .fl select + label{ top:-10px; font-size:.78rem; color:#0369a1; height:18px; line-height:18px; box-shadow: 0 0 0 4px #fff; }

/* Estados */
.fl.invalid input, .fl.invalid select, .fl.invalid textarea{ border-color: var(--danger); background:#fff7f7 }
.fl.ok input, .fl.ok select, .fl.ok textarea{ border-color: var(--accent); background:#f0fdf4 }
.err{ color: var(--danger); font-size:.82rem; margin-top:6px }
.hint{ color:#94a3b8; font-size:.78rem; margin-top:6px }

/* Botones y barra acción */
.actionbar{ display:flex; justify-content:flex-end; gap:10px; padding:12px 14px; border-top:1px solid #eef2f7; position:sticky; bottom:0; background:#fff; z-index:4; }
.btn{ border:1px solid #cbd5e1; color:#0f172a; background:#fff; padding:10px 14px; border-radius:10px; display:inline-flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; }
.btn.ghost{ background:#f8fafc }
.btn.primary{ background:linear-gradient(90deg,#0ea5e9,#22c55e); border-color:transparent; color:#fff }
.btn.danger{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d }
.btn.sm{ height:34px; padding:0 10px; border-radius:8px; font-weight:800; }
.btn:disabled{ opacity:.7; cursor:not-allowed }

/* ---- Uploader ---- */
.uploader{ display:grid; grid-template-columns: 120px 1fr; gap:14px; padding:14px; border:1px dashed #c7d5e6; border-radius:12px; background:#f9fbff; align-items:center; }
.uploader--drag{ background:#eef7ff; border-color:#8cc8ff; }
.uploader--ok{ border-color:#86efac; box-shadow: 0 0 0 3px rgba(34,197,94,.15) inset; }
.uploader__left{ display:flex; align-items:center; justify-content:center }
.uploader__right{ display:flex; flex-direction:column; gap:8px }
.uploader__title{ font-weight:800; margin:0 }
.uploader__hint{ margin:0; color:#64748b }
.uploader__buttons{ display:flex; gap:8px; flex-wrap:wrap }
.uploader__meta{ margin:0; color:#8fa1b6; font-size:.86rem }
.hidden-input{ display:none }

/* Avatar */
.avatar{ position:relative; border-radius:999px; overflow:hidden; background:#dbe8f7; display:grid; place-items:center; }
.avatar--lg{ width:100px; height:100px; }
.avatar--md{ width:72px; height:72px; }
.avatar-img{ width:100%; height:100%; object-fit:cover; display:block; }
.avatar-fallback{ font-weight:900; color:#0b3b57; font-size:1.1rem; }

.avatar__remove{ position:absolute; right:0; top:0; transform:translate(25%, -25%); background:#fee2e2; color:#991b1b; width:30px; height:30px; border-radius:999px; border:none; display:grid; place-items:center; box-shadow:0 2px 8px rgba(0,0,0,.2); cursor:pointer; }
.avatar__remove:hover{ filter:brightness(.95) }

.avatar__progress{ position:absolute; inset:0; background:rgba(15,23,42,.35); color:#fff; display:grid; place-items:center; font-weight:800; font-size:.9rem; }
.avatar__done{ position:absolute; bottom:6px; right:6px; width:22px; height:22px; background:#22c55e; color:#fff; border-radius:50%; display:grid; place-items:center; font-weight:900; }

/* Chip archivo */
.chip-file{ display:inline-flex; gap:8px; align-items:center; background:#eef6ff; border:1px solid #cde7ff; padding:6px 10px; border-radius:999px; width:fit-content; max-width:100%; }
.chip-close{ border:none; background:transparent; cursor:pointer }
.ellipsis{ max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }

/* Preview */
.preview{ padding:16px; position:sticky; top:18px; align-self:start }
.preview__top{ display:flex; gap:12px; align-items:center }
.name{ margin:0 0 4px; font-size:1.12rem; font-weight:900 }
.mail{ margin:0 0 10px; color:#475569 }
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin:12px 0 10px }
.chip{ display:inline-flex; gap:6px; align-items:center; padding:6px 10px; border-radius:999px; font-weight:800; font-size:.85rem; color:#0f172a; background:#f1f5f9; border:1px solid #e2e8f0; }
.chip.outline{ background:#fff }
.chip--ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534 }
.chip--warn{ background:#fff7ed; border-color:#fed7aa; color:#7c2d12 }
.chip--bad{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d }
.meta{ list-style:none; padding:0; margin:0; display:grid; gap:6px; color:#0f172a }
.meta li{ display:flex; gap:10px }

/* Toast */
.toast{ position:fixed; top:18px; right:22px; padding:10px 14px; border-radius:10px; color:#fff; font-weight:700; z-index:1000 }
.toast.success{ background:#22c55e }

/* === Modal Cámara === */
.cam-modal{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:grid; place-items:center; z-index:9999; padding:16px; }
.cam-card{ background:#fff; color:#111; border-radius:14px; width:min(720px,95vw); overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,.35); display:flex; flex-direction:column; }
.cam-head{ display:flex; align-items:center; gap:10px; padding:12px 12px; border-bottom:1px solid #e9eef4; }
.cam-head .spacer{ flex:1 }
.cam-body{ padding:12px; background:#0b1020; }
.cam-view{ position:relative; border-radius:12px; overflow:hidden; min-height:260px; display:grid; place-items:center; }
.cam-video{ width:100%; height:auto; max-height:70vh; background:#000; }
.cam-overlay{ position:absolute; inset:0; display:grid; place-items:center; gap:10px; color:#fff; background:rgba(0,0,0,.35); font-weight:800; }
.spinner{ width:24px; height:24px; border-radius:50%; border:3px solid rgba(255,255,255,.35); border-top-color:#fff; animation:spin 1s linear infinite }
@keyframes spin{ to{ transform: rotate(360deg)} }
.cam-foot{ display:flex; justify-content:flex-end; gap:10px; padding:12px; border-top:1px solid #e9eef4; }

/* Responsive */
@media (max-width:1180px){ .canvas{ grid-template-columns:1fr } .preview{ position:static } }
@media (max-width:720px){
  .grid{ grid-template-columns:1fr }
  .uploader{ grid-template-columns: 96px 1fr }
}
</style>

