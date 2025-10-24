<!-- src/modules/calculadora/Calculadora.vue -->
<template>
  <div class="calculadora-container">
    <loading v-model:active="isLoading" :is-full-page="false" />

    <h2><i class="bi bi-calculator"></i> Calculadora de Tarifas Integrada</h2>

    <form @submit.prevent="calcularTotal">
      <div class="input-group">
        <!-- HOTEL -->
        <div class="input-field">
          <label>Hotel</label>
          <div class="input-icon">
            <i class="bi bi-building"></i>
            <select v-model="selHotelId">
              <option disabled value="">
                {{ hoteles.length ? 'Selecciona un hotel' : 'Cargando...' }}
              </option>
              <option
                v-for="h in hoteles"
                :key="String(h.id)"
                :value="String(h.id)"
              >
                {{ h.nombre }} ({{ money(h.tarifa) }} por pasajero)
              </option>
            </select>
          </div>
          <small class="text-muted" v-if="hotelSel">
            Base: {{ money(hotelSel.tarifa) }}
          </small>
        </div>

        <!-- TOUR -->
        <div class="input-field">
          <label>Tour</label>
          <div class="input-icon">
            <i class="bi bi-binoculars"></i>
            <select v-model="selTourId">
              <option disabled value="">
                {{ tours.length ? 'Selecciona un tour' : 'Cargando...' }}
              </option>
              <option
                v-for="t in tours"
                :key="String(t.id)"
                :value="String(t.id)"
              >
                {{ t.nombre }} ({{ money(t.tarifa) }} por pasajero)
              </option>
            </select>
          </div>
          <small class="text-muted" v-if="tourSel">
            Base: {{ money(tourSel.tarifa) }}
          </small>
        </div>

        <!-- PASAJEROS -->
        <div class="input-field">
          <label>N° Pasajeros</label>
          <div class="input-icon">
            <i class="bi bi-people-fill"></i>
            <input type="number" min="1" v-model.number="pasajeros" />
          </div>
        </div>

        <!-- PROMO -->
        <div class="input-field">
          <label>Promoción</label>
          <div class="input-icon">
            <i class="bi bi-percent"></i>
            <select v-model="selPromoId">
              <option value="">Sin promoción</option>
              <option v-for="p in promociones" :key="p.id" :value="p.id">
                {{ p.nombre }} ({{ p.desc }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-success"
        :disabled="!hotelSel || !tourSel || pasajeros < 1"
      >
        <i class="bi bi-cash-coin"></i> Calcular Total
      </button>
    </form>

    <!-- RESULTADO -->
    <div class="resultado mt-4" v-if="total !== null">
      <div><strong>Subtotal:</strong> {{ money(subtotal) }}</div>
      <div v-if="promoSel">
        <strong>Descuento:</strong> -{{ money(descuento) }} ({{ promoSel.desc }})
      </div>
      <div>
        <strong>Total:</strong>
        <span class="total-final">{{ money(total) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay'
import Swal from 'sweetalert2'

// Usa los *Lite* que ya normalizan
import { getHotelesLite } from '../../services/hotelService'
import { getToursLite }   from '../../services/tours'

// opcional
import { calcularTotalLocal } from '../../services/calculadoraService'

// formateador S/.
const PEN = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2
})

// --------- FAKE PRICES (determinísticos por ID) ----------
const hashInt = (str) => {
  str = String(str || '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
const fakeFromRange = (id, min, max, step = 5) => {
  const r = hashInt(id) % ((max - min) / step + 1)
  return min + r * step
}
const precioFakeHotel = (id) => fakeFromRange(id, 90, 240, 5)   // S/ 90 — 240
const precioFakeTour  = (id) => fakeFromRange(id, 60, 180, 5)   // S/ 60 — 180
// ----------------------------------------------------------

export default {
  components: { Loading },
  data() {
    return {
      isLoading: false,

      hoteles: [], // [{ id, nombre, tarifa }]
      tours:   [], // [{ id, nombre, tarifa }]

      selHotelId: '',
      selTourId: '',
      pasajeros: 1,

      promociones: [
        { id: 'p10', nombre: 'Promo 10% OFF', desc: '10% de descuento', porcentaje: 10 },
        { id: 'p20', nombre: 'Promo 20% OFF', desc: '20% de descuento', porcentaje: 20 }
      ],
      selPromoId: '',

      subtotal: 0,
      descuento: 0,
      total: null
    }
  },
  computed: {
    hotelSel() {
      return this.hoteles.find(h => String(h.id) === this.selHotelId) || null
    },
    tourSel() {
      return this.tours.find(t => String(t.id) === this.selTourId) || null
    },
    promoSel() {
      return this.promociones.find(p => p.id === this.selPromoId) || null
    }
  },
  methods: {
    money(n) {
      const v = Number(n || 0)
      return PEN.format(isFinite(v) ? v : 0)
    },

    async cargarListas() {
      try {
        this.isLoading = true
        const [hot, tou] = await Promise.all([
          getHotelesLite(),
          getToursLite()
        ])

        // Si la API trae 0 o vacío, aplicamos precios falsos por ID
        this.hoteles = (Array.isArray(hot) ? hot : []).map(h => ({
          ...h,
          tarifa: Number(h.tarifa) > 0 ? Number(h.tarifa) : precioFakeHotel(h.id)
        }))
        this.tours = (Array.isArray(tou) ? tou : []).map(t => ({
          ...t,
          tarifa: Number(t.tarifa) > 0 ? Number(t.tarifa) : precioFakeTour(t.id)
        }))

        if (!this.hoteles.length || !this.tours.length) {
          Swal.fire('Aviso', 'No se encontraron hoteles o tours. Verifica la API.', 'info')
        }
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudieron cargar hoteles/tours.', 'error')
      } finally {
        this.isLoading = false
      }
    },

    async calcularTotal() {
      if (!this.hotelSel || !this.tourSel || !(this.pasajeros >= 1)) {
        Swal.fire('Campos incompletos', 'Selecciona hotel, tour y pasajeros (>=1).', 'warning')
        return
      }

      this.isLoading = true
      await new Promise(r => setTimeout(r, 120))

      const precioHotel = Number(this.hotelSel.tarifa || 0)
      const precioTour  = Number(this.tourSel.tarifa  || 0)
      const promoPct    = Number(this.promoSel?.porcentaje || 0)

      let subtotal, descuento, total
      if (typeof calcularTotalLocal === 'function') {
        const r = calcularTotalLocal({ precioHotel, precioTour, pasajeros: this.pasajeros, promoPct })
        subtotal  = r.subtotal
        descuento = r.descuentoPromo
        total     = r.total
      } else {
        subtotal  = (precioHotel + precioTour) * Number(this.pasajeros || 1)
        descuento = subtotal * (promoPct / 100)
        total     = subtotal - descuento
      }

      this.subtotal  = subtotal
      this.descuento = descuento
      this.total     = total

      this.isLoading = false
      Swal.fire('Cálculo listo', `Total: ${this.money(this.total)}`, 'success')
    }
  },
  mounted() {
    this.cargarListas()
  }
}
</script>

<style scoped>
.calculadora-container {
  max-width: 700px;
  margin: 50px auto;
  background: #fff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
}

h2 {
  margin-bottom: 1.8rem;
  color: #16a085;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

form { width: 100%; }

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2rem;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 220px;
  position: relative;
}

.input-field label {
  font-weight: 600;
  font-size: 0.97rem;
  color: #34495e;
  margin-bottom: 2px;
  text-align: left;
}

.input-icon { position: relative; width: 100%; }

.input-icon i.bi {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #16a085;
  font-size: 1.13rem;
  opacity: 0.92;
  pointer-events: none;
}

.input-icon input,
.input-icon select {
  padding: 0.7rem 0.9rem 0.7rem 2.1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  min-width: 160px;
  background-color: #f4f4f4;
  transition: border 0.3s ease;
}

input:focus,
select:focus {
  border-color: #16a085;
  outline: none;
}

button {
  background-color: #16a085;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

button:disabled { background-color: #b2dfdb; cursor: not-allowed; }
button:hover:enabled { background-color: #149174; }

.resultado {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 600;
  margin-top: 2rem;
  background: #eafaf1;
  border-radius: 10px;
  padding: 1.2rem 0.5rem;
  box-shadow: 0 2px 8px rgba(22,160,133,0.07);
}

.total-final { color: #16a085; font-weight: 700; }
</style>
