<!-- src/modules/tours/RegistroTour.vue -->
<template>
  <div class="shell">
    <!-- Header con gradiente + Stepper -->
    <header class="hero">
      <div class="hero__text">
        <h1>
          <i class="bi bi-map"></i>
          {{ editId ? 'Editar Tour' : 'Registro de Tour' }}
        </h1>
        <p>Completa la información, revisa el resumen y guarda.</p>
      </div>

      <ol class="stepper" role="list">
        <li :class="{ active: isActive('id') || isActive('prog') || isActive('cap') || isActive('cont') }">
          <span class="step-index">1</span><span class="step-label">Identificación</span>
        </li>
        <li :class="{ active: isActive('prog') || isActive('cap') || isActive('cont') }">
          <span class="step-index">2</span><span class="step-label">Programación</span>
        </li>
        <li :class="{ active: isActive('cap') || isActive('cont') }">
          <span class="step-index">3</span><span class="step-label">Capacidad y reglas</span>
        </li>
        <li :class="{ active: isActive('cont') }">
          <span class="step-index">4</span><span class="step-label">Contenido</span>
        </li>
      </ol>
    </header>

    <Loading :active="isLoading" :is-full-page="true" />

    <div class="canvas">
      <!-- FORM -->
      <form class="card form-card" @submit.prevent="guardarTour">
        <!-- Tabs -->
        <nav class="tabs">
          <button type="button" :class="['tab',{active:isActive('id')}]"   @click="activeTab='id'"><i class="bi bi-card-text"></i> Identificación</button>
          <button type="button" :class="['tab',{active:isActive('prog')}]" @click="activeTab='prog'"><i class="bi bi-clock-history"></i> Programación</button>
          <button type="button" :class="['tab',{active:isActive('cap')}]"  @click="activeTab='cap'"><i class="bi bi-people-fill"></i> Capacidad y reglas</button>
          <button type="button" :class="['tab',{active:isActive('cont')}]" @click="activeTab='cont'"><i class="bi bi-images"></i> Contenido</button>
        </nav>

        <!-- Sección: Identificación -->
        <section v-show="isActive('id')" class="grid">
          <div class="fl col-2">
            <input v-model.trim="form.nombre_tour" type="text" placeholder=" " required />
            <label><i class="bi bi-card-text"></i> Nombre del tour</label>
          </div>

          <div class="fl">
            <input v-model.trim="form.codigo_tour" type="text" placeholder=" " />
            <label><i class="bi bi-upc"></i> Código (opcional)</label>
          </div>

          <div class="fl">
            <select v-model="form.tipo_tour" required>
              <option value="full_day">Full day</option>
              <option value="half_day">Half day</option>
              <option value="multi_day">Multi day</option>
              <option value="trekking">Trekking</option>
            </select>
            <label><i class="bi bi-tags"></i> Tipo de tour</label>
          </div>

          <div class="fl">
            <select v-model.number="form.destino_id" required>
              <option disabled value="">Seleccione destino…</option>
              <option v-for="d in destinos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
            </select>
            <label><i class="bi bi-geo"></i> Destino</label>
          </div>

          <div class="fl">
            <select v-model.number="form.proveedor_id">
              <option :value="''">—</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">
                {{ p.nombre }} <span v-if="p.ruc">({{ p.ruc }})</span>
              </option>
            </select>
            <label><i class="bi bi-truck"></i> Proveedor (opcional)</label>
          </div>
        </section>

        <!-- Sección: Programación / Precios -->
        <section v-show="isActive('prog')" class="grid">
          <div class="fl">
            <input v-model.number="form.duracion_dias" type="number" min="0" placeholder=" " required />
            <label><i class="bi bi-hourglass-split"></i> Duración (días)</label>
          </div>
          <div class="fl">
            <input v-model.number="form.duracion_horas" type="number" min="0" placeholder=" " />
            <label><i class="bi bi-hourglass"></i> Duración (horas)</label>
          </div>

          <div class="fl">
            <input v-model="form.hora_inicio" type="time" placeholder=" " />
            <label><i class="bi bi-clock"></i> Hora inicio</label>
          </div>
          <div class="fl">
            <input v-model="form.hora_fin" type="time" placeholder=" " />
            <label><i class="bi bi-clock-history"></i> Hora fin</label>
          </div>

          <div class="fl">
            <input v-model.number="form.precio_base" type="number" step="0.01" min="0" placeholder=" " />
            <label><i class="bi bi-currency-dollar"></i> Precio base (opcional)</label>
          </div>
          <div class="fl">
            <input v-model.number="form.precio_por_persona" type="number" step="0.01" min="0" placeholder=" " />
            <label><i class="bi bi-cash"></i> Precio por persona (opcional)</label>
          </div>
        </section>

        <!-- Sección: Capacidad / Reglas -->
        <section v-show="isActive('cap')" class="grid">
          <div class="fl">
            <input v-model.number="form.capacidad_minima" type="number" min="1" placeholder=" " required />
            <label><i class="bi bi-people"></i> Capacidad mínima</label>
          </div>
          <div class="fl">
            <input v-model.number="form.capacidad_maxima" type="number" min="1" placeholder=" " />
            <label><i class="bi bi-people-fill"></i> Capacidad máxima (opcional)</label>
          </div>

          <div class="fl">
            <select v-model="form.dificultad" required>
              <option value="facil">Fácil</option>
              <option value="moderado">Moderado</option>
              <option value="dificil">Difícil</option>
              <option value="extremo">Extremo</option>
            </select>
            <label><i class="bi bi-graph-up-arrow"></i> Dificultad</label>
          </div>

          <div class="fl">
            <input v-model.number="form.edad_minima" type="number" min="0" placeholder=" " required />
            <label><i class="bi bi-person-badge"></i> Edad mínima</label>
          </div>

          <div class="fl">
            <select v-model="form.estado" required>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="temporada">Temporada</option>
            </select>
            <label><i class="bi bi-toggle-on"></i> Estado</label>
          </div>

          <!-- Días de operación -->
          <div class="form-chip col-2">
            <span class="chip-title"><i class="bi bi-calendar-week"></i> Días de operación</span>
            <div class="chips">
              <label v-for="d in diasSemana" :key="d.valor" class="chip-check">
                <input type="checkbox" :value="d.valor" v-model="form.dias_operativos" />
                <span>{{ d.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Sección: Contenido / Medios -->
        <section v-show="isActive('cont')" class="grid">
          <div class="form-chip col-2">
            <span class="chip-title"><i class="bi bi-list-task"></i> ¿Qué incluye?</span>
            <div class="chips">
              <label v-for="(s,i) in incluyeOpciones" :key="'inc-'+i" class="chip-check">
                <input type="checkbox" :value="s" v-model="form.incluye" />
                <span>{{ s }}</span>
              </label>
            </div>
          </div>

          <div class="fl col-2">
            <textarea v-model="noIncluyeTexto" rows="2" placeholder=" "></textarea>
            <label><i class="bi bi-x-circle"></i> No incluye (separa con comas)</label>
          </div>

          <div class="fl col-2">
            <textarea v-model="itinerarioTexto" rows="4" placeholder=" "></textarea>
            <label><i class="bi bi-signpost-split"></i> Itinerario (uno por línea)</label>
          </div>

          <div class="fl col-2">
            <textarea v-model="form.recomendaciones" rows="2" placeholder=" "></textarea>
            <label><i class="bi bi-lightbulb"></i> Recomendaciones (opcional)</label>
          </div>

          <div class="fl col-2">
            <textarea v-model="form.observaciones" rows="2" placeholder=" "></textarea>
            <label><i class="bi bi-info-circle"></i> Observaciones (opcional)</label>
          </div>

          <div class="fl col-2">
            <textarea v-model="imagenesTexto" rows="2" placeholder=" "></textarea>
            <label><i class="bi bi-image"></i> Imágenes (URLs separadas por comas)</label>
          </div>
        </section>

        <!-- Action bar -->
        <div class="actionbar">
          <router-link class="btn ghost" :to="{ name: 'Tours' }">
            <i class="bi bi-arrow-left-circle"></i> Volver
          </router-link>
          <button class="btn primary" type="submit" :disabled="isLoading">
            <i class="bi bi-save"></i> {{ editId ? 'Actualizar' : 'Guardar' }} Tour
          </button>
        </div>
      </form>

      <!-- PREVIEW -->
      <aside class="card preview">
        <div class="avatar"><i class="bi bi-map"></i></div>
        <h3 class="name">{{ form.nombre_tour || 'Nombre del tour' }}</h3>

        <div class="chips">
          <span class="chip" :class="estadoClase(form.estado)">{{ estadoTexto(form.estado) }}</span>
          <span class="chip outline"><i class="bi bi-tags"></i> {{ fmtTipo(form.tipo_tour) }}</span>
        </div>

        <ul class="meta">
          <li><i class="bi bi-geo-alt"></i> <span>{{ destinoNombre || 'Destino' }}</span></li>
          <li><i class="bi bi-truck"></i> <span>{{ proveedorNombre || 'Proveedor' }}</span></li>
          <li><i class="bi bi-clock-history"></i>
            <span v-if="form.hora_inicio || form.hora_fin">
              {{ fmtHora(form.hora_inicio) }}<span v-if="form.hora_inicio && form.hora_fin"> - </span>{{ fmtHora(form.hora_fin) }}
            </span>
            <span v-else>—</span>
          </li>
          <li><i class="bi bi-hourglass-split"></i>
            <span>{{ form.duracion_dias || 0 }} día(s) / {{ form.duracion_horas || 0 }} hora(s)</span>
          </li>
          <li><i class="bi bi-currency-dollar"></i>
            <span v-if="form.precio_por_persona">S/ {{ Number(form.precio_por_persona||0).toFixed(2) }} por persona</span>
            <span v-else-if="form.precio_base">S/ {{ Number(form.precio_base||0).toFixed(2) }} base</span>
            <span v-else>—</span>
          </li>
          <li><i class="bi bi-people"></i>
            <span>
              Mín: {{ form.capacidad_minima || 1 }}
              <span v-if="form.capacidad_maxima"> · Máx: {{ form.capacidad_maxima }}</span>
            </span>
          </li>
          <li><i class="bi bi-person-badge"></i> <span>Edad mínima: {{ form.edad_minima || 0 }}</span></li>
          <li><i class="bi bi-graph-up-arrow"></i> <span>{{ fmtCap(form.dificultad) }}</span></li>
        </ul>

        <div class="line"></div>

        <div>
          <strong>Días de operación:</strong>
          <div class="days">
            <span v-for="d in mapDiasBonitos(form.dias_operativos)" :key="d" class="day">{{ d }}</span>
            <span v-if="!form.dias_operativos?.length" class="day muted">No definidos</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { createTour, getTour, updateTour } from '@/services/tours'
import api from '@/services/api'

const TIPOS = ['full_day', 'half_day', 'multi_day', 'trekking']
const DIF = ['facil', 'moderado', 'dificil', 'extremo']
const ESTADOS = ['activo', 'inactivo', 'temporada']

const toHHmm = (v) => {
  if (!v) return null
  const [h='0', m='0'] = String(v).split(':')
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}
const asArray = (v) => {
  if (Array.isArray(v)) return v
  if (v == null || v === '') return []
  if (typeof v === 'string') {
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : (x ? [x] : []) }
    catch { return v.split(',').map(s=>s.trim()).filter(Boolean) }
  }
  return [v]
}
const compact = (obj) => {
  const out = {}
  Object.entries(obj).forEach(([k,v])=>{
    if (v === '' || v === null || typeof v === 'undefined') return
    out[k] = v
  })
  return out
}

const DAY_NAMES = { lun:'Lunes', mar:'Martes', mie:'Miércoles', jue:'Jueves', vie:'Viernes', sab:'Sábado', dom:'Domingo' }
const mapDiasBonitos = (arr) => asArray(arr).map(d => DAY_NAMES[String(d).toLowerCase()] || d)

export default {
  components: { Loading },
  data () {
    return {
      activeTab: 'id',
      isLoading: false,
      editId: null,

      destinos: [],
      proveedores: [],

      form: {
        nombre_tour: '',
        codigo_tour: '',
        tipo_tour: 'full_day',
        destino_id: '',
        proveedor_id: '',
        duracion_dias: 1,
        duracion_horas: 0,
        hora_inicio: null,
        hora_fin: null,
        precio_base: null,
        precio_por_persona: null,
        capacidad_minima: 1,
        capacidad_maxima: null,
        dias_operativos: [],
        incluye: [],
        no_incluye: [],
        itinerario: [],
        imagenes: [],
        recomendaciones: '',
        dificultad: 'facil',
        edad_minima: 0,
        observaciones: '',
        estado: 'activo'
      },

      noIncluyeTexto: '',
      itinerarioTexto: '',
      imagenesTexto: '',

      incluyeOpciones: ['Guía', 'Transporte', 'Entradas', 'Seguro'],
      diasSemana: [
        { valor: 'lun', label: 'Lun' },
        { valor: 'mar', label: 'Mar' },
        { valor: 'mie', label: 'Mié' },
        { valor: 'jue', label: 'Jue' },
        { valor: 'vie', label: 'Vie' },
        { valor: 'sab', label: 'Sáb' },
        { valor: 'dom', label: 'Dom' }
      ]
    }
  },

  computed:{
    destinoNombre(){
      const d = this.destinos.find(x=>x.id===this.form.destino_id)
      return d?.nombre || ''
    },
    proveedorNombre(){
      const p = this.proveedores.find(x=>x.id===this.form.proveedor_id)
      return p?.nombre || ''
    }
  },

  methods: {
    isActive(k){ return this.activeTab===k },

    estadoTexto(v){ const s=String(v||'activo').toLowerCase(); return s==='inactivo'?'Inactivo':(s==='temporada'?'Temporada':'Activo') },
    estadoClase(v){
      const s=String(v||'activo').toLowerCase()
      return { 'chip--ok': s==='activo', 'chip--warn': s==='temporada', 'chip--bad': s==='inactivo' }
    },

    fmtHora(h){ if(!h) return ''; const [hh='00',mm='00']=String(h).split(':'); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}` },
    fmtTipo(t){ const map={ full_day:'Full day', half_day:'Half day', multi_day:'Multi day', trekking:'Trekking' }; return map[String(t).toLowerCase()] || this.fmtCap(t) },
    fmtCap(s){ if(!s) return ''; const t=String(s).toLowerCase(); return t.charAt(0).toUpperCase()+t.slice(1).replace('_',' ') },
    mapDiasBonitos,

    async cargarOpciones () {
      const [dest, prov] = await Promise.all([
        api.get('/destinos', { params: { per_page: 1000 } }),
        api.get('/proveedores', { params: { per_page: 1000 } })
      ])
      const toArray = (r) => r?.data?.data?.data ?? r?.data?.data ?? r?.data ?? []
      this.destinos = toArray(dest).map(d => ({ id: d.id, nombre: d.nombre || d.ciudad || `Destino #${d.id}` }))
      this.proveedores = toArray(prov).map(p => ({
        id: p.id,
        nombre: p.razon_social || p.nombre_comercial || p.nombre || `Proveedor #${p.id}`,
        ruc: p.ruc || ''
      }))
    },

    parseTextAreasToArrays () {
      const splitLines = (txt) => txt.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean)
      this.form.no_incluye = splitLines(this.noIncluyeTexto)
      this.form.itinerario = splitLines(this.itinerarioTexto)
      this.form.imagenes = splitLines(this.imagenesTexto)
    },

    buildPayload () {
      if (!TIPOS.includes(this.form.tipo_tour)) this.form.tipo_tour = 'full_day'
      if (!DIF.includes(this.form.dificultad)) this.form.dificultad = 'facil'
      if (!ESTADOS.includes(this.form.estado)) this.form.estado = 'activo'

      this.form.hora_inicio = toHHmm(this.form.hora_inicio)
      this.form.hora_fin    = toHHmm(this.form.hora_fin)

      if (!this.form.capacidad_minima || this.form.capacidad_minima < 1) this.form.capacidad_minima = 1
      if (!this.form.duracion_dias && this.form.duracion_dias !== 0) this.form.duracion_dias = 1
      if (this.form.edad_minima == null || this.form.edad_minima < 0) this.form.edad_minima = 0

      this.form.dias_operativos = asArray(this.form.dias_operativos)
      this.form.incluye         = asArray(this.form.incluye)
      this.parseTextAreasToArrays()

      if (this.form.proveedor_id === '') this.form.proveedor_id = null
      return compact({ ...this.form })
    },

    async guardarTour () {
      try {
        this.isLoading = true

        if (!this.form.nombre_tour) { Swal.fire('Faltan datos','El nombre del tour es obligatorio.','warning'); this.activeTab='id'; return }
        if (!this.form.destino_id)   { Swal.fire('Faltan datos','Selecciona un destino.','warning'); this.activeTab='id'; return }

        const payload = this.buildPayload()
        if (!payload.codigo_tour || !String(payload.codigo_tour).trim()) payload.codigo_tour = `T-${Date.now()}`

        if (this.editId) {
          await updateTour(this.editId, payload)
          Swal.fire('Actualizado','Tour actualizado correctamente','success')
        } else {
          await createTour(payload)
          Swal.fire('Guardado','Tour creado correctamente','success')
        }
        this.$router.push({ name: 'Tours' })
      } catch (e) {
        console.error(e)
        const status = e?.response?.status
        if (status === 422) {
          const errs = e.response?.data?.errors || {}
          const msg = Object.values(errs).flat().join('<br>') || e.response?.data?.message
          Swal.fire('Datos inválidos', msg || 'Revisa los campos requeridos', 'warning')
        } else {
          Swal.fire('Error', e.message || 'No se pudo guardar el tour', 'error')
        }
      } finally {
        this.isLoading = false
      }
    }
  },

  async mounted () {
    await this.cargarOpciones()
    const id = this.$route.params?.id || this.$route.query?.id
    if (!id) return

    this.editId = id
    try {
      this.isLoading = true
      const t = await getTour(id)
      this.form = {
        ...this.form,
        nombre_tour: t.nombre_tour || '',
        codigo_tour: t.codigo_tour || '',
        tipo_tour: (t.tipo_tour || 'full_day').toLowerCase(),
        destino_id: t.destino_id ?? '',
        proveedor_id: t.proveedor_id ?? '',
        duracion_dias: t.duracion_dias ?? 1,
        duracion_horas: t.duracion_horas ?? 0,
        hora_inicio: toHHmm(t.hora_inicio),
        hora_fin: toHHmm(t.hora_fin),
        precio_base: t.precio_base ?? null,
        precio_por_persona: t.precio_por_persona ?? null,
        capacidad_minima: t.capacidad_minima ?? 1,
        capacidad_maxima: t.capacidad_maxima ?? null,
        dias_operativos: asArray(t.dias_operativos),
        incluye: asArray(t.incluye),
        no_incluye: asArray(t.no_incluye),
        itinerario: asArray(t.itinerario),
        recomendaciones: t.recomendaciones || '',
        dificultad: (t.dificultad || 'facil').toLowerCase(),
        edad_minima: t.edad_minima ?? 0,
        observaciones: t.observaciones || '',
        imagenes: asArray(t.imagenes),
        estado: (t.estado || 'activo').toLowerCase()
      }
      this.noIncluyeTexto = this.form.no_incluye.join(', ')
      this.itinerarioTexto = this.form.itinerario.join('\n')
      this.imagenesTexto = this.form.imagenes.join(', ')
    } catch (e) {
      console.error(e)
      Swal.fire('Error','No se pudo cargar el tour','error')
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
:root{
  /* Paleta clara */
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

/* === Fondo tipo captura: blanco con halo superior muy suave === */
.shell{
  min-height:100%;
  background:
    radial-gradient(1200px 600px at 50% -220px, #eaf6ff 0%, rgba(234,246,255,0.6) 35%, transparent 60%),
    linear-gradient(180deg,#ffffff 0%, #fcfeff 45%, #f9fbff 100%);
  color: var(--ink);
  padding-bottom:32px;
}

/* Header */
.hero{
  max-width:1200px; margin:24px auto 12px; padding:20px 22px;
  border-radius:16px;
  background: linear-gradient(135deg, rgba(14,165,233,.18), rgba(16,185,129,.10));
  border:1px solid rgba(2,6,23,.06);
  box-shadow: 0 6px 18px rgba(2,6,23,.06);
}
.hero__text h1{ margin:0 0 6px; font-size:1.35rem; display:flex; gap:10px; align-items:center; color:#0b3b57 }
.hero__text p{ margin:0; color: var(--muted) }

/* Stepper */
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

/* Canvas */
.canvas{
  max-width:1200px; margin:0 auto;
  display:grid; gap:16px;
  grid-template-columns: minmax(640px, 2fr) minmax(320px, 1fr);
}

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

/* Grids */
.grid{
  display:grid; gap:14px 16px; padding:14px;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
}
.grid > .fl,
.grid > .form-chip{ width:100% }
.grid .col-2{ grid-column: 1 / -1 }
.col-2{ grid-column: 1 / -1 }

/* Floating labels mejoradas (una sola línea + pill claro) */
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

/* El “subtítulo” queda en una sola línea, sin cortes y con bordecito suave */
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

/* Chips */
.form-chip{ display:flex; flex-direction:column; gap:8px; padding:2px 0 }
.chip-title{ font-weight:700; color:#0f172a }
.chips{ display:flex; flex-wrap:wrap; gap:8px }
.chip-check{
  display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px;
  border:1px solid #e2e8f0; background:#f8fafc; cursor:pointer; user-select:none; color:#0f172a;
}
.chip-check input{ accent-color:#0ea5e9 }

/* Action bar */
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
.name{ margin:0 0 6px; font-size:1.15rem }
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 }
.chip{
  display:inline-flex; gap:6px; align-items:center; padding:6px 10px; border-radius:999px; font-weight:700; font-size:.85rem;
  background:#f1f5f9; border:1px solid #e2e8f0; color:#0f172a;
}
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

/* Responsive */
@media (max-width:1180px){
  .canvas{ grid-template-columns: 1fr; }
  .preview{ position:static }
}
@media (max-width:720px){
  .grid{ grid-template-columns: 1fr }
}
</style>

