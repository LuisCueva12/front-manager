<!-- src/modules/usuarios/RegistroUsuarios.vue -->
<template>
  <div class="shell">
    <!-- Header -->
    <header class="hero">
      <div class="hero__text">
        <h1>
          <i class="bi bi-truck"></i>
          {{ editId ? 'Editar proveedor' : 'Registro de Proveedores' }}
        </h1>
        <p>Completa los datos del proveedor y revisa el resumen en tiempo real.</p>
      </div>
      <ol class="stepper" role="list">
        <li :class="{ active: true }">
          <span class="step-index">1</span>
          <span class="step-label">Datos del proveedor</span>
        </li>
      </ol>
    </header>

    <Loading :active="isLoading" :is-full-page="true" />

    <div class="canvas">
      <!-- FORM -->
      <form class="card form-card" @submit.prevent="guardarProveedor" novalidate>
        <section class="grid">
          <div
            class="fl"
            v-for="(campo, index) in campos"
            :key="campo.id"
            @click="mostrarTooltip(index)"
          >
            <!-- Ayuda más sutil -->
            <div v-if="tooltipIndex === index" class="tooltip-box">
              <strong>{{ campo.label }}:</strong> {{ campo.ayuda }}
            </div>

            <!-- SELECT -->
            <select
              v-if="campo.options"
              class="form-control"
              :id="campo.id"
              v-model="proveedor[campo.modelo]"
              :disabled="isLoading"
              :class="{ 'invalid': campo.requerido && !isFilled(proveedor[campo.modelo]) }"
            >
              <option value="" disabled>Seleccione...</option>
              <option v-for="opt in campo.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- INPUT -->
            <input
              v-else
              class="form-control"
              :id="campo.id"
              :type="campo.tipo"
              v-model.trim="proveedor[campo.modelo]"
              :required="campo.requerido"
              :disabled="isLoading"
              :class="{ 'invalid': campo.requerido && !isFilled(proveedor[campo.modelo]) }"
              :min="campo.min"
              :max="campo.max"
              :step="campo.step"
              :placeholder="campo.placeholder || ' '"
              autocomplete="off"
            />

            <!-- Label flotante -->
            <label :for="campo.id">
              <i :class="campo.icon"></i> {{ campo.label }}
            </label>

            <!-- Error -->
            <small class="err" v-if="campo.requerido && !isFilled(proveedor[campo.modelo])">
              {{ campo.label }} es obligatorio.
            </small>
          </div>

          <div class="spacer"></div>
        </section>

        <!-- Acciones -->
        <div class="actionbar">
          <router-link class="btn ghost" to="/proveedores">
            <i class="bi bi-arrow-left-circle"></i> Volver
          </router-link>
          <button class="btn primary" type="submit" :disabled="isLoading">
            <i class="bi bi-save2"></i>
            {{ editId ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>

      <!-- PREVIEW -->
      <aside class="card preview">
        <div class="avatar"><i class="bi bi-truck"></i></div>
        <h3 class="name">{{ proveedor.nombre || 'Nombre / Razón social' }}</h3>

        <div class="chips">
          <span class="chip outline" v-if="proveedor.tipo">
            <i class="bi bi-tag"></i> {{ proveedor.tipo }}
          </span>
          <span
            class="chip"
            :class="{
              'chip--ok': (proveedor.estado || '').toLowerCase() === 'activo',
              'chip--warn': (proveedor.estado || '').toLowerCase() === 'suspendido',
              'chip--bad': (proveedor.estado || '').toLowerCase() === 'inactivo'
            }"
            v-if="proveedor.estado"
          >
            {{ (proveedor.estado || '').charAt(0).toUpperCase() + (proveedor.estado || '').slice(1) }}
          </span>
        </div>

        <ul class="meta">
          <li v-if="proveedor.ruc"><i class="bi bi-upc"></i> <span>{{ proveedor.ruc }}</span></li>
          <li v-if="proveedor.correo"><i class="bi bi-envelope"></i> <span>{{ proveedor.correo }}</span></li>
          <li v-if="proveedor.telefono"><i class="bi bi-telephone"></i> <span>{{ proveedor.telefono }}</span></li>
          <li v-if="proveedor.direccion"><i class="bi bi-geo-alt"></i> <span>{{ proveedor.direccion }}</span></li>

          <li v-if="proveedor.banco || proveedor.tipo_cuenta">
            <i class="bi bi-bank"></i>
            <span>{{ proveedor.banco || '—' }}<span v-if="proveedor.tipo_cuenta"> · {{ proveedor.tipo_cuenta }}</span></span>
          </li>
          <li v-if="proveedor.cuentaBancaria"><i class="bi bi-credit-card"></i> <span>{{ proveedor.cuentaBancaria }}</span></li>
          <li v-if="proveedor.cci"><i class="bi bi-123"></i> <span>{{ proveedor.cci }}</span></li>

          <li v-if="proveedor.representante"><i class="bi bi-person"></i> <span>{{ proveedor.representante }}</span></li>
          <li v-if="proveedor.contacto_cargo"><i class="bi bi-person-badge"></i> <span>{{ proveedor.contacto_cargo }}</span></li>
          <li v-if="proveedor.contacto_telefono"><i class="bi bi-telephone-forward"></i> <span>{{ proveedor.contacto_telefono }}</span></li>
          <li v-if="proveedor.contacto_email"><i class="bi bi-envelope-at"></i> <span>{{ proveedor.contacto_email }}</span></li>

          <li v-if="proveedor.comision_porcentaje !== '' && proveedor.comision_porcentaje != null">
            <i class="bi bi-percent"></i> <span>{{ proveedor.comision_porcentaje }} %</span>
          </li>
          <li v-if="proveedor.acuerdos"><i class="bi bi-journal-text"></i> <span>{{ proveedor.acuerdos }}</span></li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { createProveedor, getProveedor, updateProveedor } from '../../services/proveedorService.js'

const ENUM_TIPOS = ['hotel','guia','transporte','restaurante','tour_operador','otro']
const ENUM_TIPO_CUENTA = ['ahorros','corriente']
const ENUM_ESTADO = ['activo','inactivo','suspendido']

export default {
  components: { Loading },
  props: {
    id: { type: [String, Number], default: null }
  },
  data() {
    return {
      isLoading: false,
      tooltipIndex: null,
      editId: null,
      proveedor: {
        ruc: '',
        nombre: '',
        tipo: '',
        correo: '',
        telefono: '',
        direccion: '',
        cuentaBancaria: '',
        cci: '',
        banco: '',
        tipo_cuenta: '',
        representante: '',
        contacto_cargo: '',
        contacto_telefono: '',
        contacto_email: '',
        comision_porcentaje: '',
        estado: '',
        acuerdos: ''
      },
      campos: [
        { id:'ruc', modelo:'ruc', label:'RUC', tipo:'text', requerido:true, icon:'bi bi-upc', ayuda:'11 dígitos. Solo números.', placeholder:'12345678901' },
        { id:'nombre', modelo:'nombre', label:'Razón social / Nombre comercial', tipo:'text', requerido:true, icon:'bi bi-card-text', ayuda:'Nombre legal o comercial.', placeholder:'Proveedor Demo SAC' },
        { id:'tipo', modelo:'tipo', label:'Tipo de proveedor', tipo:'text', requerido:true, icon:'bi bi-tag', ayuda:'Selecciona el tipo.', options: ENUM_TIPOS },

        { id:'correo', modelo:'correo', label:'Correo', tipo:'email', requerido:false, icon:'bi bi-envelope', ayuda:'Email de contacto.', placeholder:'ventas@proveedor.com' },
        { id:'telefono', modelo:'telefono', label:'Teléfono', tipo:'text', requerido:false, icon:'bi bi-telephone', ayuda:'Número de contacto.', placeholder:'987654321' },
        { id:'direccion', modelo:'direccion', label:'Dirección', tipo:'text', requerido:false, icon:'bi bi-geo-alt', ayuda:'Dirección del proveedor.', placeholder:'Av. Siempre Viva 123' },

        { id:'cuentaBancaria', modelo:'cuentaBancaria', label:'Cuenta bancaria', tipo:'text', requerido:false, icon:'bi bi-bank', ayuda:'Cuenta para pagos.', placeholder:'1234567890123456' },
        { id:'cci', modelo:'cci', label:'CCI', tipo:'text', requerido:false, icon:'bi bi-123', ayuda:'Código interbancario (opcional).', placeholder:'12345678901234567890' },
        { id:'banco', modelo:'banco', label:'Banco', tipo:'text', requerido:false, icon:'bi bi-building', ayuda:'Nombre del banco.', placeholder:'BCP / Interbank' },
        { id:'tipo_cuenta', modelo:'tipo_cuenta', label:'Tipo de cuenta', tipo:'text', requerido:false, icon:'bi bi-wallet2', ayuda:'Si no eliges, queda "ahorros".', options: ENUM_TIPO_CUENTA },

        { id:'representante', modelo:'representante', label:'Contacto - Nombre', tipo:'text', requerido:false, icon:'bi bi-person', ayuda:'Persona de contacto.', placeholder:'Juan Pérez' },
        { id:'contacto_cargo', modelo:'contacto_cargo', label:'Contacto - Cargo', tipo:'text', requerido:false, icon:'bi bi-person-badge', ayuda:'Cargo del contacto.', placeholder:'Ventas' },
        { id:'contacto_telefono', modelo:'contacto_telefono', label:'Contacto - Teléfono', tipo:'text', requerido:false, icon:'bi bi-telephone-forward', ayuda:'Teléfono del contacto.', placeholder:'999888777' },
        { id:'contacto_email', modelo:'contacto_email', label:'Contacto - Email', tipo:'email', requerido:false, icon:'bi bi-envelope-at', ayuda:'Email del contacto.', placeholder:'contacto@proveedor.com' },

        { id:'comision_porcentaje', modelo:'comision_porcentaje', label:'Comisión (%)', tipo:'number', requerido:false, icon:'bi bi-percent', ayuda:'0 a 100, hasta 2 decimales.', min:0, max:100, step:'0.01', placeholder:'0.00' },
        { id:'estado', modelo:'estado', label:'Estado', tipo:'text', requerido:false, icon:'bi bi-toggle-on', ayuda:'Si no eliges, queda "activo".', options: ENUM_ESTADO },

        { id:'acuerdos', modelo:'acuerdos', label:'Seguimiento o acuerdos comerciales', tipo:'text', requerido:false, icon:'bi bi-journal-text', ayuda:'Notas internas.', placeholder:'Condiciones, acuerdos, etc.' }
      ]
    }
  },
  methods: {
    isFilled(val) { return String(val ?? '').trim().length > 0 },
    mostrarTooltip(index) {
      this.tooltipIndex = index
      setTimeout(() => (this.tooltipIndex = null), 1500)
    },
    saneaAntesDeEnviar() {
      this.proveedor.ruc = (this.proveedor.ruc || '').replace(/\D/g, '').slice(0, 11)
      if (this.proveedor.correo) this.proveedor.correo = this.proveedor.correo.toLowerCase().trim()
      if (this.proveedor.contacto_email) this.proveedor.contacto_email = this.proveedor.contacto_email.toLowerCase().trim()
      if (this.proveedor.comision_porcentaje !== '' && this.proveedor.comision_porcentaje != null) {
        let c = Number(this.proveedor.comision_porcentaje)
        if (Number.isNaN(c)) c = 0
        c = Math.max(0, Math.min(100, c))
        this.proveedor.comision_porcentaje = Number(c.toFixed(2))
      }
      if (this.proveedor.tipo) this.proveedor.tipo = String(this.proveedor.tipo).toLowerCase()
      if (this.proveedor.tipo_cuenta) this.proveedor.tipo_cuenta = String(this.proveedor.tipo_cuenta).toLowerCase()
      if (this.proveedor.estado) this.proveedor.estado = String(this.proveedor.estado).toLowerCase()
    },
    async cargarParaEdicion(id) {
      if (!id) return
      this.editId = id
      try {
        this.isLoading = true
        const datos = await getProveedor(id)
        this.proveedor = { ...this.proveedor, ...datos }
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar el proveedor', 'error')
      } finally {
        this.isLoading = false
      }
    },
    async guardarProveedor() {
      try {
        this.isLoading = true
        const faltantes = []
        if (!this.isFilled(this.proveedor.ruc) || this.proveedor.ruc.length !== 11) faltantes.push('RUC (11 dígitos)')
        if (!this.isFilled(this.proveedor.nombre)) faltantes.push('Razón social / Nombre comercial')
        if (!this.isFilled(this.proveedor.tipo) || !['hotel','guia','transporte','restaurante','tour_operador','otro'].includes(this.proveedor.tipo)) faltantes.push('Tipo de proveedor (válido)')
        if (faltantes.length) {
          Swal.fire('Datos incompletos', `Faltan:<br>• ${faltantes.join('<br>• ')}`, 'warning')
          return
        }
        this.saneaAntesDeEnviar()
        if (this.editId) {
          await updateProveedor(this.editId, this.proveedor)
          Swal.fire('Actualizado', 'Proveedor actualizado correctamente', 'success')
        } else {
          await createProveedor(this.proveedor)
          Swal.fire('Guardado', 'Proveedor creado correctamente', 'success')
        }
        this.$router.push({ name: 'Proveedores' })
      } catch (e) {
        console.error(e)
        if (e.response?.status === 422) {
          const errs = e.response.data.errors || {}
          const msg = Object.values(errs).flat().join('<br>')
          Swal.fire('Datos inválidos', msg || 'Revisa los campos requeridos', 'warning')
        } else {
          Swal.fire('Error', 'No se pudo guardar el proveedor', 'error')
        }
      } finally {
        this.isLoading = false
      }
    }
  },
  async mounted() {
    const id = this.id || this.$route.params.id || this.$route.query.id
    await this.cargarParaEdicion(id)
  },
  watch: {
    '$route.params.id'(val) {
      const id = this.id || val
      this.cargarParaEdicion(id)
    },
    'proveedor.ruc'(val) {
      if (val == null) return
      const limpio = String(val).replace(/\D/g, '').slice(0, 11)
      if (limpio !== val) this.proveedor.ruc = limpio
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
  --ctrl-h: 48px;
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

/* Layout */
.canvas{ max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr; gap:16px }
.card{
  background:var(--card); color:var(--ink);
  border:1px solid #e8eef6; border-radius:14px;
  box-shadow:0 8px 22px rgba(2,6,23,.08);
}

/* Grid */
.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:14px 16px;
  padding:14px;
}
.spacer{ display:block }

/* Inputs + labels */
.fl{ position:relative; display:flex; flex-direction:column }
.form-control{
  background:#fff; color:var(--ink);
  border:1.2px solid #e5e7eb; border-radius:10px;
  padding:12px 12px 10px; font-size:1rem;
  height: var(--ctrl-h);
  outline:none; transition:border-color .2s, box-shadow .2s;
  width: 100%;
  box-sizing: border-box;
}
.form-control:focus{ border-color: var(--primary); box-shadow: 0 0 0 4px var(--ring) }

.fl label{
  position:absolute; left:12px; top:12px;
  display:inline-flex; align-items:center; gap:6px;
  padding:0 10px; height:22px; line-height:22px;
  border-radius:999px; background:#f8fbff; color:#5b6b7f;
  border:1px solid #e6eef8; box-shadow:0 0 0 3px #fff;
  pointer-events:none; transition: all .18s ease;
}
.form-control::placeholder{ color:transparent }
.form-control:focus + label,
.form-control:not(:placeholder-shown) + label,
select.form-control + label{
  top:-10px; font-size:.78rem; color:#0369a1; height:18px; line-height:18px; box-shadow:0 0 0 4px #fff;
}

/* Estados / errores */
.invalid{ border-color: var(--danger) !important; background:#fff7f7 }
.err{ color: var(--danger); font-size:.82rem; margin-top:6px }

/* ===== Tooltip ayuda (nuevo estilo sutil) ===== */
.tooltip-box{
  position: relative;
  margin: 0 0 8px 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f8fafc;               /* fondo claro */
  color: #334155;                    /* texto gris */
  border: 1px solid #e2e8f0;         /* borde suave */
  box-shadow: 0 2px 8px rgba(15,23,42,.06);
  font-size: .88rem;
}
.tooltip-box::before{
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 10px 0 0 10px;
  background: var(--primary);        /* barrita primaria */
}

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

/* Responsive */
@media (max-width:1024px){ .canvas{ grid-template-columns:1fr } .preview{ position:static } }
@media (max-width:720px){ .grid{ grid-template-columns:1fr } .spacer{ display:none } }
</style>
