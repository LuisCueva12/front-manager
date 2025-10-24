<template>
  <div class="shell" @keydown.ctrl.prevent.s="guardar" @keydown.meta.prevent.s="guardar">
    <!-- Header + Stepper (2 pasos) -->
    <header class="hero">
      <div class="hero__text">
        <h1><i class="bi bi-geo-alt"></i> {{ editId ? 'Editar destino' : 'Registro de destino' }}</h1>
        <p>Completa la información, revisa el resumen y guarda.</p>
      </div>

      <ol class="stepper" role="list">
        <li :class="{ active: tabIdx >= 1 }">
          <span class="step-index">1</span><span class="step-label">Identificación</span>
        </li>
        <li :class="{ active: tabIdx >= 2 }">
          <span class="step-index">2</span><span class="step-label">Ubicación</span>
        </li>
      </ol>
    </header>

    <!-- progreso fino -->
    <div class="progress">
      <div class="progress__bar" :style="{ width: (tabIdx/2*100)+'%' }"></div>
    </div>

    <div class="grid-2">
      <!-- LEFT -->
      <section class="card form-card" @keydown.enter.exact.prevent="avanzarSiPuede">
        <!-- Tabs (2) -->
        <div class="tabs">
          <button :class="['tab', tab==='id'  && 'active']" @click="setTab('id')">
            <i class="bi bi-card-text"></i> <span>Identificación</span>
          </button>
          <button :class="['tab', tab==='ubi' && 'active']" @click="setTab('ubi')">
            <i class="bi bi-geo"></i> <span>Ubicación</span>
          </button>
        </div>

        <!-- Identificación -->
        <div v-show="tab==='id'" class="panel">
          <div class="grid">
            <label class="full">
              <span><i class="bi bi-type"></i> Nombre del destino *</span>
              <input v-model.trim="form.nombre" :class="err('nombre')" placeholder="Ej. Cordillera Blanca" @blur="touch('nombre')" />
            </label>

            <label>
              <span><i class="bi bi-upc-scan"></i> Código postal</span>
              <input v-model.trim="form.codigo_postal" placeholder="Ej. 02001" maxlength="10" inputmode="numeric" @input="soloNumeros('codigo_postal')" />
            </label>

            <label>
              <span><i class="bi bi-toggle-on"></i> Estado</span>
              <div class="switch">
                <input id="estado" type="checkbox" v-model="activo" />
                <label for="estado">{{ activo ? 'Activo' : 'Inactivo' }}</label>
              </div>
            </label>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" type="button" @click="$router.back()" :disabled="loading">
              <i class="bi bi-arrow-left"></i> Volver
            </button>
            <button class="btn btn-primary" type="button" @click="setTab('ubi')" :disabled="!validaPaso('id') || loading">
              Siguiente <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Ubicación -->
        <div v-show="tab==='ubi'" class="panel">
          <div class="grid">
            <label>
              <span><i class="bi bi-building"></i> Departamento</span>
              <input v-model.trim="form.departamento" placeholder="Ej. Áncash" />
            </label>

            <label>
              <span><i class="bi bi-geo-alt"></i> Provincia</span>
              <input v-model.trim="form.provincia" placeholder="Ej. Huaraz" />
            </label>

            <label class="full">
              <span><i class="bi bi-card-text"></i> Descripción</span>
              <textarea v-model.trim="form.descripcion" rows="3" placeholder="Describe el destino, accesos, actividades..."></textarea>
            </label>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" type="button" @click="setTab('id')" :disabled="loading">
              <i class="bi bi-chevron-left"></i> Atrás
            </button>
            <button class="btn btn-success" type="button" @click="guardar" :disabled="loading">
              <i class="bi bi-save2"></i> {{ loading ? 'Guardando...' : 'Guardar destino' }}
            </button>
          </div>
        </div>
      </section>

      <!-- RIGHT: Summary -->
      <aside class="card summary">
        <div class="summary-head">
          <div class="icon-wrap"><i class="bi bi-map"></i></div>
          <div class="title">
            <h3>{{ form.nombre || 'Nombre del destino' }}</h3>
            <div class="chips">
              <span class="chip" :class="activo ? 'ok' : 'muted'">{{ activo ? 'Activo' : 'Inactivo' }}</span>
              <span v-if="form.codigo_postal" class="chip outline"><i class="bi bi-upc-scan"></i> {{ form.codigo_postal }}</span>
            </div>
          </div>
        </div>

        <div class="kv">
          <p><i class="bi bi-building"></i> <strong>Departamento:</strong> {{ form.departamento || '—' }}</p>
          <p><i class="bi bi-geo"></i> <strong>Provincia:</strong> {{ form.provincia || '—' }}</p>
          <p><i class="bi bi-card-text"></i> <strong>Descripción:</strong> {{ form.descripcion || '—' }}</p>
        </div>

        <div class="note">Registro: {{ editId ? 'Edición' : 'Nuevo' }}</div>
      </aside>
    </div>

    <!-- Overlay de carga -->
    <vue-loading
      :active="loading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#0ea5e9'"
      :opacity="0.25"
      :loader="'dots'"
      :background-color="'#0b1120'"
    />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import VueLoading from 'vue-loading-overlay'
import destinoService from '@/services/destinoService'

const DRAFT_KEY = (id) => `draft:destino:${id || 'new'}`

export default {
  name: 'RegistroDestino',
  components: { VueLoading },
  data () {
    return {
      loading: false,
      tab: 'id',
      editId: this.$route.query.id || null,
      form: {
        nombre: '',
        departamento: '',
        provincia: '',
        codigo_postal: '',
        descripcion: '',
        estado: 'activo'
      },
      touched: {},
      _snapshot: null,
      _saveTimer: null
    }
  },
  computed: {
    tabIdx () { return ['id','ubi'].indexOf(this.tab) + 1 },
    activo: {
      get () { return this.form.estado !== 'inactivo' },
      set (v) { this.form.estado = v ? 'activo' : 'inactivo' }
    },
    dirty () { return JSON.stringify(this.form) !== this._snapshot }
  },
  methods: {
    setTab (k) { this.tab = k },
    touch (k) { this.touched[k] = true },
    err (k) { return this.touched[k] && !this.form[k] ? 'is-invalid' : '' },
    validaPaso (k) { if (k === 'id') return !!this.form.nombre?.trim(); return true },
    avanzarSiPuede () { if (this.tab === 'id' && this.validaPaso('id')) this.setTab('ubi') },
    soloNumeros (field) { this.form[field] = (this.form[field] || '').replace(/[^\d]/g, '') },

    async cargarEdicion () {
      if (!this.editId) {
        const draft = localStorage.getItem(DRAFT_KEY(null))
        if (draft) { try { this.form = JSON.parse(draft) } catch {} }
        this._snapshot = JSON.stringify(this.form)
        return
      }
      this.loading = true
      try {
        const d = await destinoService.obtener(this.editId)
        if (d) {
          this.form = {
            nombre: d.nombre || '',
            departamento: d.departamento || '',
            provincia: d.provincia || '',
            codigo_postal: d.codigo_postal || '',
            descripcion: d.descripcion || '',
            estado: d.estado || 'activo'
          }
          const draft = localStorage.getItem(DRAFT_KEY(this.editId))
          if (draft) { try { this.form = { ...this.form, ...JSON.parse(draft) } } catch {} }
        }
      } catch (e) {
        Swal.fire('Error', e?.message || 'No se pudo cargar el destino', 'error')
      } finally {
        this.loading = false
        this._snapshot = JSON.stringify(this.form)
      }
    },

    async guardar () {
      this.touch('nombre')
      if (!this.validaPaso('id')) {
        Swal.fire('Campos obligatorios', 'Complete al menos el nombre del destino.', 'info')
        this.setTab('id'); return
      }
      try {
        this.loading = true
        if (this.editId) await destinoService.actualizar(this.editId, this.form)
        else await destinoService.crear(this.form)

        localStorage.removeItem(DRAFT_KEY(null))
        if (this.editId) localStorage.removeItem(DRAFT_KEY(this.editId))
        this._snapshot = JSON.stringify(this.form)

        await Swal.fire('¡Listo!', 'Destino guardado correctamente', 'success')
        this.$router.push('/destinos')
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'No se pudo guardar'
        Swal.fire('Atención', msg, 'warning')
      } finally { this.loading = false }
    },

    programarAutosave () {
      clearTimeout(this._saveTimer)
      this._saveTimer = setTimeout(() => {
        const key = DRAFT_KEY(this.editId)
        localStorage.setItem(key, JSON.stringify(this.form))
      }, 1500)
    }
  },
  watch: {
    form: { deep: true, handler () { this.programarAutosave() } }
  },
  beforeRouteLeave (to, from, next) {
    if (this.loading) return next(false)
    if (!this.dirty) return next()
    Swal.fire({
      title: 'Cambios sin guardar',
      text: '¿Deseas salir y descartar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Quedarme'
    }).then(res => next(res.isConfirmed))
  },
  mounted () { this.cargarEdicion() },
  beforeUnmount () { clearTimeout(this._saveTimer) }
}
</script>

<style scoped>
/* Layout general */
.shell{ padding:16px; min-height:100vh; background:#f6f9fc; }
.grid-2{ display:grid; gap:18px; grid-template-columns:minmax(0,1fr) 360px; }
@media (max-width:1080px){ .grid-2{ grid-template-columns:1fr; } }

/* Header + Stepper */
.hero{ display:flex; align-items:center; justify-content:space-between; gap:16px;
  background:linear-gradient(120deg,#e9f4ff,#e7fbf6); border:1px solid #e6eef6; border-radius:14px; padding:16px 18px; margin-bottom:10px; }
.hero__text h1{ margin:0; font-size:1.28rem; font-weight:800; display:flex; gap:10px; color:#0b1731; }
.hero__text p{ margin:4px 0 0; color:#5b6a86; font-weight:600; }
.stepper{ display:flex; gap:10px; margin:0; padding:0; list-style:none; }
.stepper li{ display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #dbe4ee; border-radius:12px; padding:8px 10px; color:#5b6a86; font-weight:800; }
.stepper li.active{ background:#22c55e; border-color:#16a34a; color:#fff; }
.step-index{ width:22px; height:22px; border-radius:999px; display:grid; place-items:center; font-size:.82rem; background:rgba(0,0,0,.08); }
.stepper li.active .step-index{ background:rgba(255,255,255,.2); }

/* progress bar (2 pasos) */
.progress{ height:6px; background:#ecf2f9; border-radius:999px; margin:0 0 12px; overflow:hidden; border:1px solid #e6eef6; }
.progress__bar{ height:100%; background:linear-gradient(90deg,#0ea5e9,#22c55e); width:50%; transition:width .2s ease; }

/* Card base */
.card{ background:#fff; border:1px solid #e6eef6; border-radius:14px; }

/* Tabs */
.tabs{ display:flex; gap:8px; padding:12px; border-bottom:1px solid #eef3f9; flex-wrap:wrap; }
.tab{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid #dbe4ee; background:#fff; color:#1f2a44; font-weight:800; cursor:pointer; }
.tab.active{ background:#0ea5e9; border-color:#0284c7; color:#fff; }

/* Form */
.form-card .panel{ padding:14px; }
.grid{ display:grid; gap:12px; grid-template-columns:repeat(2,minmax(0,1fr)); }
.full{ grid-column:1/-1; }
label{ display:flex; flex-direction:column; gap:6px; font-weight:700; color:#283656; }
input, textarea, select{ background:#fff; border:1px solid #dbe4ee; border-radius:10px; padding:10px 12px; color:#1f2a44; }
textarea{ resize:vertical; }
.is-invalid{ border-color:#ef4444 !important; }
.switch{ display:flex; align-items:center; gap:10px; }
.switch input[type="checkbox"]{ width:42px; height:24px; appearance:none; background:#e5e7eb; border-radius:999px; position:relative; outline:none; cursor:pointer; transition:.15s; }
.switch input:checked{ background:#22c55e; }
.switch input::after{ content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:.15s; }
.switch input:checked::after{ transform:translateX(18px); }
.hint{ background:#f3f7fc; border:1px dashed #dbe4ee; padding:12px; border-radius:10px; color:#486089; }

/* Actions */
.actions{ margin-top:10px; display:flex; gap:10px; }
.btn{ display:inline-flex; align-items:center; gap:8px; border-radius:10px; padding:10px 14px; font-weight:800; cursor:pointer; text-decoration:none; }
.btn-secondary{ background:#fff; border:1px solid #cfd9e7; color:#1f2a44; }
.btn-primary{ background:#0ea5e9; border:1px solid #0284c7; color:#fff; }
.btn-success{ background:#22c55e; border:1px solid #16a34a; color:#fff; }

/* Summary */
.summary{ padding:14px; display:grid; gap:12px; }
.summary-head{ display:flex; align-items:center; gap:12px; }
.icon-wrap{ width:44px; height:44px; border-radius:12px; display:grid; place-items:center; background:#ecfeff; color:#0891b2; font-size:22px; }
.title h3{ margin:0; font-size:1.06rem; font-weight:900; color:#0b1731; }
.chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
.chip{ padding:4px 10px; border-radius:999px; font-weight:800; font-size:.82rem; }
.chip.ok{ background:#e8fbf1; color:#16a34a; border:1px solid #b6f0ce; }
.chip.muted{ background:#eef2f7; color:#66728a; border:1px solid #dde3ee; }
.chip.outline{ background:#fff; color:#0b1731; border:1px solid #dbe4ee; }
.kv p{ margin:.2rem 0; color:#324361; }
.note{ margin-top:4px; color:#6b7a95; font-weight:700; }
</style>
