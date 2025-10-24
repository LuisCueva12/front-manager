<!-- src/modules/hoteles/Registrohoteles.vue -->
<template>
  <div class="shell">
    <header class="hero">
      <div class="hero__text">
        <h1><i class="bi bi-buildings"></i> {{ editando ? 'Editar Hotel' : 'Registro de Hotel' }}</h1>
        <p>Completa la información, revisa el resumen y guarda.</p>
      </div>
      <ol class="stepper" role="list">
        <li :class="{ active: isActive('id') || isActive('ubi') || isActive('pol') || isActive('srv') }"><span class="step-index">1</span><span class="step-label">Identificación</span></li>
        <li :class="{ active: isActive('ubi') || isActive('pol') || isActive('srv') }"><span class="step-index">2</span><span class="step-label">Ubicación</span></li>
        <li :class="{ active: isActive('pol') || isActive('srv') }"><span class="step-index">3</span><span class="step-label">Horario y políticas</span></li>
        <li :class="{ active: isActive('srv') }"><span class="step-index">4</span><span class="step-label">Servicios, imágenes y estado</span></li>
      </ol>
    </header>

    <Loading :active="isLoading" :is-full-page="true" />

    <div class="canvas">
      <!-- novalidate para evitar bloqueos silenciosos del navegador -->
      <form class="card form-card" novalidate @submit.prevent="guardarHotel">
        <nav class="tabs">
          <button type="button" :class="['tab',{active:isActive('id')}]"  @click="activeTab='id'"><i class="bi bi-card-text"></i> Identificación</button>
          <button type="button" :class="['tab',{active:isActive('ubi')}]" @click="activeTab='ubi'"><i class="bi bi-geo"></i> Ubicación</button>
          <button type="button" :class="['tab',{active:isActive('pol')}]" @click="activeTab='pol'"><i class="bi bi-clock-history"></i> Horario y políticas</button>
          <button type="button" :class="['tab',{active:isActive('srv')}]" @click="activeTab='srv'"><i class="bi bi-ui-checks-grid"></i> Servicios / Imágenes / Estado</button>
        </nav>

        <!-- Identificación -->
        <section v-show="isActive('id')" class="grid">
          <div class="fl col-2">
            <input v-model.trim="hotel.nombre_hotel" v-filled type="text" placeholder=" " required />
            <label><i class="bi bi-card-text"></i> Nombre del hotel</label>
          </div>

          <div class="fl">
            <select v-model="hotel.categoria" v-filled>
              <option value="">—</option>
              <option value="1">1 estrella</option><option value="2">2 estrellas</option><option value="3">3 estrellas</option><option value="4">4 estrellas</option><option value="5">5 estrellas</option>
              <option value="boutique">Boutique</option><option value="hostal">Hostal</option>
            </select>
            <label><i class="bi bi-star-fill"></i> Categoría</label>
          </div>

          <div class="fl">
            <input v-model.trim="hotel.telefono_hotel" v-filled type="text" placeholder=" " />
            <label><i class="bi bi-telephone"></i> Teléfono</label>
          </div>
          <div class="fl">
            <input v-model.trim="hotel.correo" v-filled type="email" placeholder=" " />
            <label><i class="bi bi-envelope"></i> Correo</label>
          </div>

          <div class="fl">
            <select v-model="hotel.proveedor_id" v-filled>
              <option value="">—</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razon_social || p.nombre || p.nombre_comercial || ('Proveedor #'+p.id) }}</option>
            </select>
            <label><i class="bi bi-people"></i> Proveedor (opcional)</label>
          </div>

          <div class="fl">
            <select v-model="hotel.destino_id" v-filled>
              <option value="">Seleccione destino…</option>
              <option v-for="d in destinos" :key="d.id" :value="d.id">{{ d.nombre || d.ciudad || d.nombre_destino || ('Destino #'+d.id) }}</option>
            </select>
            <label><i class="bi bi-geo-alt"></i> Destino</label>
          </div>
        </section>

        <!-- Ubicación -->
        <section v-show="isActive('ubi')" class="grid">
          <div class="fl col-2">
            <input v-model.trim="hotel.direccion" v-filled type="text" placeholder=" " />
            <label><i class="bi bi-geo-alt-fill"></i> Dirección</label>
          </div>
          <div class="fl col-2">
            <textarea v-model.trim="hotel.ubicacion_geografica" v-filled rows="2" placeholder=" "></textarea>
            <label><i class="bi bi-geo-alt"></i> Ubicación geográfica (referencia o URL Maps)</label>
          </div>
          <div class="fl">
            <input v-model="hotel.latitud" v-filled type="number" step="0.000001" min="-90" max="90" placeholder=" " />
            <label><i class="bi bi-compass"></i> Latitud</label>
          </div>
          <div class="fl">
            <input v-model="hotel.longitud" v-filled type="number" step="0.000001" min="-180" max="180" placeholder=" " />
            <label><i class="bi bi-compass-fill"></i> Longitud</label>
          </div>
        </section>

        <!-- Horario y políticas -->
        <section v-show="isActive('pol')" class="grid">
          <div class="fl">
            <input v-model="hotel.check_in" v-filled type="time" placeholder=" " />
            <label><i class="bi bi-clock"></i> Check-in</label>
          </div>
          <div class="fl">
            <input v-model="hotel.check_out" v-filled type="time" placeholder=" " />
            <label><i class="bi bi-clock-history"></i> Check-out</label>
          </div>
          <div class="fl col-2">
            <textarea v-model.trim="hotel.politica_cancelacion" v-filled rows="3" placeholder=" "></textarea>
            <label><i class="bi bi-info-circle"></i> Política de cancelación</label>
          </div>
          <div class="fl col-2">
            <textarea v-model.trim="hotel.condiciones" v-filled rows="3" placeholder=" "></textarea>
            <label><i class="bi bi-card-text"></i> Condiciones</label>
          </div>
        </section>

        <!-- Servicios / Imágenes / Estado -->
        <section v-show="isActive('srv')" class="grid">
          <div class="form-chip col-2">
            <span class="chip-title"><i class="bi bi-ui-checks-grid"></i> Servicios incluidos</span>
            <div class="chips">
              <label v-for="(s,i) in serviciosDisponibles" :key="'inc-'+i" class="chip-check">
                <input type="checkbox" :value="s" v-model="hotel.servicios_incluidos" />
                <span>{{ s }}</span>
              </label>
            </div>
          </div>

          <div class="fl">
            <select v-model="hotel.estado" v-filled>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            <label><i class="bi bi-toggle-on"></i> Estado</label>
          </div>

          <!-- Uploader (sin cambios) -->
          <div class="form-chip col-2">
            <span class="chip-title"><i class="bi bi-images"></i> Imágenes del hotel</span>

            <div class="uploader" @dragover.prevent @drop.prevent="onDrop">
              <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onPickFiles" />
              <button type="button" class="btn" @click="$refs.fileInput.click()">
                <i class="bi bi-upload"></i> Seleccionar
              </button>
              <span class="muted">o arrastra aquí tus imágenes</span>
            </div>

            <div class="thumbs" v-if="previews.length">
              <div v-for="(p,i) in previews" :key="'new-'+i" class="thumb">
                <img :src="p.url" alt="">
                <button type="button" class="x" @click="removeNew(i)" :disabled="isUploading || isDeleting"><i class="bi bi-x"></i></button>
              </div>
            </div>

            <div class="thumbs" v-if="hotel.imagenes?.length">
              <div v-for="(u,i) in hotel.imagenes" :key="'ex-'+i" class="thumb">
                <img :src="normalizeImg(u)" alt="imagen">
                <button type="button" class="x" @click="removeExisting(i)" :disabled="isUploading || isDeleting"><i class="bi bi-x"></i></button>
              </div>
            </div>

            <div class="uploader-actions">
              <button type="button" class="btn primary" :disabled="!newImages.length || isUploading || isDeleting" @click="subirAhora">
                <i class="bi bi-cloud-upload"></i>
                Subir {{ newImages.length }} imagen{{ newImages.length===1?'':'es' }}
              </button>
              <span v-if="isUploading" class="muted">Subiendo… {{ uploadPct }}%</span>
            </div>

            <div v-if="isUploading" class="progress"><div :style="{ width: uploadPct + '%' }"></div></div>
          </div>
        </section>

        <div class="actionbar">
          <router-link class="btn ghost" :to="{ name: 'Hoteles' }"><i class="bi bi-arrow-left-circle"></i> Volver</router-link>
          <button class="btn primary" type="submit" :disabled="isLoading || isUploading || isDeleting">
            <i class="bi bi-save"></i> {{ editando ? 'Actualizar' : 'Guardar' }} Hotel
          </button>
        </div>
      </form>

      <!-- PREVIEW -->
      <aside class="card preview">
        <div class="avatar"><i class="bi bi-building"></i></div>
        <h3 class="name">{{ hotel.nombre_hotel || 'Nombre del hotel' }}</h3>

        <div class="chips">
          <span class="chip" :class="estadoClase(hotel.estado)">{{ estadoTexto(hotel.estado) }}</span>
          <span class="chip outline"><i class="bi bi-star-fill"></i> {{ categoriaTexto }}</span>
        </div>

        <ul class="meta">
          <li><i class="bi bi-geo-alt"></i> <span>{{ destinoNombre || 'Destino' }}</span></li>
          <li><i class="bi bi-people"></i>   <span>{{ proveedorNombre || 'Proveedor' }}</span></li>
          <li><i class="bi bi-envelope"></i> <span>{{ hotel.correo || '—' }}</span></li>
          <li><i class="bi bi-telephone"></i><span>{{ hotel.telefono_hotel || '—' }}</span></li>
          <li><i class="bi bi-geo"></i>      <span>{{ hotel.direccion || '—' }}</span></li>
          <li><i class="bi bi-clock-history"></i>
            <span v-if="hotel.check_in || hotel.check_out">
              {{ fmtHora(hotel.check_in) }}<span v-if="hotel.check_in && hotel.check_out"> - </span>{{ fmtHora(hotel.check_out) }}
            </span>
            <span v-else>—</span>
          </li>
        </ul>

        <div class="line"></div>

        <div>
          <strong>Servicios:</strong>
          <div class="days" style="margin-top:6px">
            <span v-for="s in (hotel.servicios_incluidos || [])" :key="s" class="day">{{ s }}</span>
            <span v-if="!hotel.servicios_incluidos?.length" class="day muted">No definidos</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay'
import Swal from 'sweetalert2'
import api, { API_BASE_URL } from '@/services/api'

const FILE_BASE = API_BASE_URL.replace(/\/api$/, '')

const toHHmm = (v) => {
  if (!v) return null
  const [h='0', m='0'] = String(v).split(':')
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

// ---- Directiva local: marca el contenedor .fl como "is-filled" si hay valor (cubre autofill) ----
function bindFilled(el){
  const box = el.closest('.fl')
  if (!box) return
  const hasVal = () => {
    if (el.tagName === 'SELECT') return el.value !== ''
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked
    return (el.value ?? '') !== ''
  }
  const update = () => box.classList.toggle('is-filled', hasVal())
  update()
  // Chrome aplica autofill un “tick” después
  setTimeout(update, 50)
  el.addEventListener('input', update)
  el.addEventListener('change', update)
  el.addEventListener('blur', update)
  // Guarda para cleanup si el componente se desmonta
  el.__filledCleanup = () => {
    el.removeEventListener('input', update)
    el.removeEventListener('change', update)
    el.removeEventListener('blur', update)
  }
}

export default {
  components: { Loading },
  directives: {
    filled: {
      mounted(el){ bindFilled(el) },
      updated(el){ bindFilled(el) },
      unmounted(el){ el.__filledCleanup && el.__filledCleanup() }
    }
  },
  data () {
    return {
      activeTab: 'id',
      isLoading: false,
      editando: false,

      destinos: [],
      proveedores: [],

      hotel: {
        id: null,
        nombre_hotel: '',
        categoria: '',
        telefono_hotel: '',
        correo: '',
        destino_id: '',
        direccion: '',
        ubicacion_geografica: '',
        latitud: '',
        longitud: '',
        check_in: '14:00',
        check_out: '12:00',
        politica_cancelacion: '',
        condiciones: '',
        servicios_incluidos: [],
        imagenes: [],
        estado: 'activo',
        proveedor_id: ''
      },

      serviciosDisponibles: ['WiFi','Desayuno','Piscina','Gimnasio','Estacionamiento','Spa','Restaurante'],

      newImages: /** @type {File[]} */([]),
      previews: /** @type {{ file: File, url: string }[]} */([]),
      isUploading: false,
      isDeleting: false,
      uploadPct: 0
    }
  },

  computed:{
    destinoNombre(){
      const d = this.destinos.find(x=>String(x.id)===String(this.hotel.destino_id))
      return d?.nombre || d?.ciudad || d?.nombre_destino || ''
    },
    proveedorNombre(){
      const p = this.proveedores.find(x=>String(x.id)===String(this.hotel.proveedor_id))
      return p?.razon_social || p?.nombre || p?.nombre_comercial || ''
    },
    categoriaTexto(){
      const c = String(this.hotel.categoria||'').toLowerCase()
      if (['1','2','3','4','5'].includes(c)) return `${c} estrella${c==='1'?'':'s'}`
      if (c==='boutique') return 'Boutique'
      if (c==='hostal') return 'Hostal'
      return '—'
    }
  },

  methods:{
    isActive(k){ return this.activeTab===k },
    estadoTexto(v){ const s=String(v||'activo').toLowerCase(); return s==='inactivo'?'Inactivo':(s==='mantenimiento'?'Mantenimiento':'Activo') },
    estadoClase(v){ const s=String(v||'activo').toLowerCase(); return { 'chip--ok': s==='activo', 'chip--warn': s==='mantenimiento', 'chip--bad': s==='inactivo' } },
    fmtHora(h){ if(!h) return '—'; const [hh='00',mm='00']=String(h).split(':'); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` },

    extractList(resp) {
      const body = resp?.data || resp
      if (Array.isArray(body)) return body
      if (Array.isArray(body?.data)) return body.data
      if (Array.isArray(body?.data?.data)) return body.data.data
      return []
    },

    normalizeImg(u){
      if (!u) return ''
      const s = String(u)
      if (/^https?:\/\//i.test(s)) return s
      const path = s.replace(/^\/+/, '')
      return `${FILE_BASE}/${path}`
    },

    async cargarCatalogos(){
      try{
        this.isLoading = true
        const [d,p] = await Promise.allSettled([ api.get('/destinos'), api.get('/proveedores') ])
        if (d.status==='fulfilled') this.destinos = this.extractList(d.value)
        if (p.status==='fulfilled') this.proveedores = this.extractList(p.value)
      } finally { this.isLoading = false }
    },

    onPickFiles(e){
      const files = Array.from(e.target.files || [])
      this.addFiles(files)
      e.target.value = ''
    },
    onDrop(e){
      const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
      this.addFiles(files)
    },
    addFiles(files){
      for (const f of files){
        this.newImages.push(f)
        this.previews.push({ file: f, url: URL.createObjectURL(f) })
      }
    },
    removeNew(i){
      URL.revokeObjectURL(this.previews[i].url)
      this.previews.splice(i,1)
      this.newImages.splice(i,1)
    },

    async removeExisting(i){
      const url = this.hotel.imagenes[i]
      if (!url) return
      let path = String(url)
      try { if (path.startsWith('http')) path = new URL(path).pathname.replace(/^\/+/, '') } catch {}
      if (path.startsWith('storage/')) path = path.slice(8)
      const pos = path.indexOf('hoteles/')
      if (pos > -1) path = path.slice(pos)

      const ok = await Swal.fire({
        title: '¿Eliminar imagen?',
        text: 'Se borrará del servidor y del hotel.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (!ok.isConfirmed) return

      try {
        this.isDeleting = true
        try { await api.delete(`/uploads/hoteles/${encodeURIComponent(path)}`, { params: { path } }) } catch {}
        this.hotel.imagenes.splice(i,1)
        if (this.editando && this.hotel.id) {
          await api.put(`/hoteles/${this.hotel.id}`, { imagenes: this.hotel.imagenes })
        }
        Swal.fire('Eliminada','La imagen fue eliminada','success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error','No se pudo eliminar la imagen','error')
      } finally {
        this.isDeleting = false
      }
    },

    async uploadBatch(){
      if (!this.newImages.length) return []

      const fd = new FormData()
      this.newImages.forEach(f => fd.append('imagenes[]', f))
      if (this.hotel.id) fd.append('hotel_id', this.hotel.id)

      this.isUploading = true
      this.uploadPct = 0

      const { data } = await api.post('/uploads/hoteles', fd, {
        onUploadProgress: (e) => {
          if (e.total) this.uploadPct = Math.round((e.loaded / e.total) * 100)
        }
      })

      const urls = Array.isArray(data?.urls) ? data.urls
                   : Array.isArray(data?.paths) ? data.paths.map(p => `/${String(p).replace(/^\/+/, '')}`)
                   : (data?.url ? [data.url] : [])

      this.previews.forEach(p => URL.revokeObjectURL(p.url))
      this.previews = []
      this.newImages = []

      this.uploadPct = 100
      this.isUploading = false
      setTimeout(()=> this.uploadPct = 0, 400)

      if (this.editando && this.hotel.id && urls.length) {
        this.hotel.imagenes.push(...urls)
        await api.put(`/hoteles/${this.hotel.id}`, { imagenes: this.hotel.imagenes })
      }

      return urls
    },

    async subirAhora(){
      try{
        const urls = await this.uploadBatch()
        if (!this.editando && urls.length) this.hotel.imagenes.push(...urls)
        if (urls.length) Swal.fire('Listo','Imágenes subidas correctamente','success')
      } catch(e){
        console.error(e)
        this.isUploading = false
        const msg = e?.response?.data?.message ||
          (e?.response?.status===422 ? 'El archivo no cumple los requisitos (máx 5MB, jpeg/jpg/png/webp).' :
          'No se pudieron subir las imágenes')
        Swal.fire('Error', msg, 'error')
      }
    },

    async ensureUploadsBeforeSave(){
      if (!this.newImages.length) return
      const urls = await this.uploadBatch()
      if (!this.editando && urls.length) this.hotel.imagenes.push(...urls)
    },

    normalizarPayload(){
      const toNumOrNull = (v) => (v === '' || v === null || typeof v === 'undefined' ? null : Number(v))
      const cat = this.hotel.categoria
      const categoria =
        /^\d+$/.test(String(cat)) ? Number(cat) : (cat || null)

      const payload = {
        nombre_hotel: this.hotel.nombre_hotel?.trim(),
        categoria,
        telefono_hotel: this.hotel.telefono_hotel || null,
        correo: this.hotel.correo || null,
        destino_id: toNumOrNull(this.hotel.destino_id),
        direccion: this.hotel.direccion || null,
        ubicacion_geografica: this.hotel.ubicacion_geografica || null,
        latitud: this.hotel.latitud !== '' ? Number(this.hotel.latitud) : null,
        longitud: this.hotel.longitud !== '' ? Number(this.hotel.longitud) : null,
        check_in: toHHmm(this.hotel.check_in) || null,
        check_out: toHHmm(this.hotel.check_out) || null,
        politica_cancelacion: this.hotel.politica_cancelacion || null,
        condiciones: this.hotel.condiciones || null,
        servicios_incluidos: Array.isArray(this.hotel.servicios_incluidos) ? this.hotel.servicios_incluidos : [],
        imagenes: Array.isArray(this.hotel.imagenes) ? this.hotel.imagenes : [],
        estado: this.hotel.estado || 'activo',
        proveedor_id: toNumOrNull(this.hotel.proveedor_id)
      }

      // alias de compatibilidad
      payload.nombre = payload.nombre_hotel
      payload.telefono = payload.telefono_hotel

      return payload
    },

    detalle422(resp){
      const errs = resp?.data?.errors
      if (!errs) return null
      const lines = []
      Object.entries(errs).forEach(([k,v])=>{
        const arr = Array.isArray(v) ? v : [String(v)]
        arr.forEach(m => lines.push(`• ${k}: ${m}`))
      })
      return lines.length ? lines.join('\n') : null
    },

    async guardarHotel(){
      if (!this.hotel.nombre_hotel?.trim()){
        Swal.fire('Faltan datos','El nombre del hotel es obligatorio.','warning'); this.activeTab='id'; return
      }
      if (!this.hotel.destino_id){
        Swal.fire('Faltan datos','Selecciona un destino.','warning'); this.activeTab='id'; return
      }

      try{
        this.isLoading = true

        await this.ensureUploadsBeforeSave()

        const payload = this.normalizarPayload()
        if (!this.editando) payload.estado = payload.estado || 'activo'

        if (this.editando && this.hotel.id){
          await api.put(`/hoteles/${this.hotel.id}`, payload)
          Swal.fire('Actualizado','Hotel actualizado correctamente','success')
        } else {
          const res = await api.post('/hoteles', payload)
          const created = res?.data?.data || res?.data
          if (created?.id) this.hotel.id = created.id
          Swal.fire('Guardado','Hotel creado correctamente','success')
        }

        try {
          await this.$router.push({ name: 'Hoteles' })
        } catch {
          await this.$router.push('/hoteles')
        }
      } catch(e){
        console.error('Crear/Actualizar hotel ::', e)
        const status = e?.response?.status
        const detalle = status===422 ? this.detalle422(e.response) : null
        Swal.fire(
          status===422 ? 'Revisa los datos' : 'Error',
          detalle || e?.response?.data?.message || 'No se pudo guardar el hotel',
          status===422 ? 'info' : 'error'
        )
      } finally { this.isLoading = false }
    }
  },

  mounted(){
    const ed = localStorage.getItem('hotelEdicion')
    if (ed){
      const parsed = JSON.parse(ed)
      this.hotel = {
        ...this.hotel, ...parsed,
        destino_id: parsed.destino_id ?? parsed.destino?.id ?? '',
        proveedor_id: parsed.proveedor_id ?? parsed.proveedor?.id ?? '',
        check_in: (parsed.check_in || '14:00:00').slice(0,5),
        check_out: (parsed.check_out || '12:00:00').slice(0,5),
        servicios_incluidos: Array.isArray(parsed.servicios_incluidos) ? parsed.servicios_incluidos : [],
        imagenes: Array.isArray(parsed.imagenes) ? parsed.imagenes : []
      }
      this.editando = true
      localStorage.removeItem('hotelEdicion')
    }
    this.cargarCatalogos()
  }
}
</script>

<style scoped>
:root{ --bg:#fff; --card:#fff; --ink:#0f172a; --muted:#475569; --primary:#0ea5e9; --accent:#10b981; --warn:#f59e0b; --danger:#ef4444; --ring: rgba(14,165,233,.18); }
.shell{ min-height:100%; background: radial-gradient(1200px 600px at 50% -220px, #eaf6ff 0%, rgba(234,246,255,0.6) 35%, transparent 60%), linear-gradient(180deg,#ffffff 0%, #fcfeff 45%, #f9fbff 100%); color:var(--ink); padding-bottom:32px; }
.hero{ max-width:1200px; margin:24px auto 12px; padding:20px 22px; border-radius:16px; background: linear-gradient(135deg, rgba(14,165,233,.18), rgba(16,185,129,.10)); border:1px solid rgba(2,6,23,.06); box-shadow: 0 6px 18px rgba(2,6,23,.06); }
.hero__text h1{ margin:0 0 6px; font-size:1.35rem; display:flex; gap:10px; align-items:center; color:#0b3b57 }
.hero__text p{ margin:0; color: var(--muted) }
.stepper{ display:flex; gap:12px; margin-top:14px; padding:0; list-style:none }
.stepper li{ position:relative; flex:1; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid #e2e8f0; display:flex; align-items:center; gap:10px; color:var(--ink); }
.stepper li:not(:last-child)::after{ content:''; position:absolute; right:-6px; top:50%; width:12px; height:2px; background:#e2e8f0; }
.step-index{ display:grid; place-items:center; width:26px; height:26px; border-radius:999px; background:#f1f5f9; border:1px solid #e2e8f0; font-weight:700; color:#0f172a; }
.stepper li.active .step-index{ background:#0ea5e9; border-color:#0ea5e9; color:#fff }
.step-label{ font-weight:600 }
.canvas{ max-width:1200px; margin:0 auto; display:grid; gap:16px; grid-template-columns: minmax(640px, 2fr) minmax(320px, 1fr); }
.card{ background:#fff; color:#0f172a; border:1px solid #e8eef6; border-radius:14px; box-shadow:0 8px 22px rgba(2,6,23,.08); }
.form-card{ overflow:hidden }
.tabs{ display:flex; gap:8px; border-bottom:1px solid #eef2f7; padding:10px; position:sticky; top:0; background:#fff; z-index:5; }
.tab{ border:1px solid #e2e8f0; background:#fff; color:#334155; padding:8px 12px; border-radius:999px; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; }
.tab.active{ background:#e8f6ff; color:#0369a1; border-color:#bae6fd }
.grid{ display:grid; gap:14px 16px; padding:14px; grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr); }
.grid > .fl, .grid > .form-chip{ width:100% }
.grid .col-2{ grid-column: 1 / -1 }
.fl{ position:relative; display:flex; flex-direction:column }
.fl input,.fl select,.fl textarea{ width:100%; background:#fff; color:#0f172a; border:1.2px solid #e5e7eb; border-radius:10px; padding:14px 12px 10px; font-size:1rem; outline:none; transition:border-color .2s, box-shadow .2s; min-height:44px; }
.fl input:focus,.fl select:focus,.fl textarea:focus{ border-color:var(--primary); box-shadow:0 0 0 4px var(--ring) }
.fl textarea{ resize:vertical }

/* --- Floating label “perfecto” --- */
.fl label{
  position:absolute; left:12px; top:14px;
  display:inline-flex; align-items:center; gap:6px;
  padding:0 10px; height:20px; line-height:20px; border-radius:999px;
  background:#f8fbff; color:#5b6b7f; border:1px solid #e6eef8;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:calc(100% - 24px);
  pointer-events:none; transition: all .18s ease;
  box-shadow: 0 0 0 3px #fff; z-index:1;
}
.fl.is-filled label,
.fl:focus-within label{
  top:-10px; font-size:.78rem; color:#0369a1;
  height:18px; line-height:18px; box-shadow: 0 0 0 4px #fff;
}

/* oculta placeholder para no duplicar texto */
.fl input::placeholder{ color:transparent }

/* chips / uploader / botones (igual que tenías) */
.form-chip{ display:flex; flex-direction:column; gap:8px; padding:2px 0 }
.chip-title{ font-weight:700; color:#0f172a }
.chips{ display:flex; flex-wrap:wrap; gap:8px }
.chip-check{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; border:1px solid #e2e8f0; background:#f8fafc; cursor:pointer; user-select:none; color:#0f172a; }
.chip-check input{ accent-color:#0ea5e9 }

.uploader{ display:flex; align-items:center; gap:10px; padding:10px; border:1px dashed #cbd5e1; border-radius:12px; background:#f8fafc }
.uploader .muted{ color:#64748b; font-size:.9rem }
.uploader-actions{ margin-top:8px; display:flex; align-items:center; gap:10px }
.thumbs{ display:flex; flex-wrap:wrap; gap:10px; margin-top:10px }
.thumb{ position:relative; width:90px; height:90px; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; background:#fff }
.thumb img{ width:100%; height:100%; object-fit:cover }
.thumb .x{ position:absolute; right:4px; top:4px; width:22px; height:22px; border:none; border-radius:999px; background:#fff; box-shadow:0 0 0 1px #e2e8f0; display:grid; place-items:center; cursor:pointer }
.progress{ width:100%; height:6px; border-radius:999px; background:#eef2f7; overflow:hidden }
.progress > div{ height:100%; background:linear-gradient(90deg,#0ea5e9,#22c55e) }

.actionbar{ display:flex; justify-content:flex-end; gap:10px; padding:12px 14px; border-top:1px solid #eef2f7; position:sticky; bottom:0; background:#fff; z-index:4; }
.btn{ border:1px solid #cbd5e1; color:#0f172a; background:#fff; padding:10px 14px; border-radius:10px; display:inline-flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; }
.btn.ghost{ background:#f8fafc }
.btn.primary{ background:linear-gradient(90deg,#0ea5e9,#22c55e); border-color:transparent; color:#fff }
.btn:disabled{ opacity:.7; cursor:not-allowed }

.preview{ padding:16px 16px 10px; position:sticky; top:18px; align-self:start }
.avatar{ width:72px; height:72px; border-radius:18px; background:linear-gradient(135deg,#0ea5e9,#22c55e); display:grid; place-items:center; color:#fff; font-size:1.6rem; font-weight:900; margin-bottom:10px; }
.name{ margin:0 0 6px; font-size:1.15rem }
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 }
.chip{ display:inline-flex; gap:6px; align-items:center; padding:6px 10px; border-radius:999px; font-weight:700; font-size:.85rem; background:#f1f5f9; border:1px solid #e2e8f0; color:#0f172a; }
.chip.outline{ background:#fff }
.chip--ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534 }
.chip--warn{ background:#fff7ed; border-color:#fed7aa; color:#7c2d12 }
.chip--bad{ background:#fee2e2; border-color:#fecaca; color:#7f1d1d }
.meta{ list-style:none; padding:0; margin:0; display:grid; gap:6px; color:#0f172a }
.meta li{ display:flex; gap:10px }
.line{ height:1px; background:#e5e7eb; margin:12px 0 }
.days{ display:flex; flex-wrap:wrap; gap:6px }
.day{ padding:4px 8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:.85rem; color:#334155 }
.day.muted{ opacity:.6 }
@media (max-width:1180px){ .canvas{ grid-template-columns: 1fr } .preview{ position:static } }
@media (max-width:720px){ .grid{ grid-template-columns: 1fr } }
</style>
