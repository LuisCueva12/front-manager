<template>
  <div class="calculadora-container">
    <loading v-model:active="isLoading" :is-full-page="false" />

    <h2><i class="bi bi-calculator"></i> Calculadora de Tarifas Integrada</h2>

    <form @submit.prevent="calcularTotal">
      <div class="input-group">
        <div class="input-field">
          <label>Hotel</label>
          <div class="input-icon">
            <i class="bi bi-building"></i>
            <select v-model="hotelSeleccionado">
              <option disabled value="">Selecciona un hotel</option>
              <option v-for="hotel in hoteles" :key="hotel.nombre" :value="hotel">
                {{ hotel.nombre }} (S/ {{ hotel.tarifa }} por pasajero)
              </option>
            </select>
          </div>
        </div>

        <div class="input-field">
          <label>Tour</label>
          <div class="input-icon">
            <i class="bi bi-binoculars"></i>
            <select v-model="tourSeleccionado">
              <option disabled value="">Selecciona un tour</option>
              <option v-for="tour in tours" :key="tour.nombre" :value="tour">
                {{ tour.nombre }} (S/ {{ tour.tarifa }} por pasajero)
              </option>
            </select>
          </div>
        </div>

        <div class="input-field">
          <label>N° Pasajeros</label>
          <div class="input-icon">
            <i class="bi bi-people-fill"></i>
            <input type="number" min="1" v-model.number="pasajeros" />
          </div>
        </div>

        <div class="input-field">
          <label>Promoción</label>
          <div class="input-icon">
            <i class="bi bi-percent"></i>
            <select v-model="promoSeleccionada">
              <option value="">Sin promoción</option>
              <option v-for="promo in promociones" :key="promo.nombre" :value="promo">
                {{ promo.nombre }} ({{ promo.desc }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-success" :disabled="!hotelSeleccionado || !tourSeleccionado || !pasajeros">
        <i class="bi bi-cash-coin"></i> Calcular Total
      </button>
    </form>

    <div class="resultado mt-4" v-if="total !== null">
      <div><strong>Subtotal:</strong> S/ {{ subtotal.toFixed(2) }}</div>
      <div v-if="promoSeleccionada"><strong>Descuento:</strong> -S/ {{ descuento.toFixed(2) }} ({{ promoSeleccionada.desc }})</div>
      <div><strong>Total:</strong> <span class="total-final">S/ {{ total.toFixed(2) }}</span></div>
    </div>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay'
import Swal from 'sweetalert2'

export default {
  components: { Loading },
  data() {
    return {
      isLoading: false,
      hoteles: [
        { nombre: 'Hotel Sol', tarifa: 120 },
        { nombre: 'Hotel Luna', tarifa: 95 },
        { nombre: 'Hotel Estrella', tarifa: 150 }
      ],
      tours: [
        { nombre: 'Tour Montaña', tarifa: 80 },
        { nombre: 'Tour Ciudad', tarifa: 60 },
        { nombre: 'Tour Aventura', tarifa: 110 }
      ],
      promociones: [
        { nombre: 'Promo 10% OFF', desc: '10% de descuento', porcentaje: 10 },
        { nombre: 'Promo 20% OFF', desc: '20% de descuento', porcentaje: 20 }
      ],
      hotelSeleccionado: '',
      tourSeleccionado: '',
      pasajeros: 1,
      promoSeleccionada: '',
      subtotal: 0,
      descuento: 0,
      total: null
    };
  },
  methods: {
    async calcularTotal() {
      if (!this.hotelSeleccionado || !this.tourSeleccionado || !this.pasajeros) {
        Swal.fire('Campos incompletos', 'Por favor selecciona hotel, tour y número de pasajeros.', 'warning');
        return;
      }

      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 600));

      const subtotal = (this.hotelSeleccionado.tarifa + this.tourSeleccionado.tarifa) * this.pasajeros;
      let descuento = 0;
      if (this.promoSeleccionada) {
        descuento = subtotal * (this.promoSeleccionada.porcentaje / 100);
      }
      this.subtotal = subtotal;
      this.descuento = descuento;
      this.total = subtotal - descuento;

      this.isLoading = false;
      Swal.fire('Cálculo exitoso', `El total a pagar es S/ ${this.total.toFixed(2)}`, 'success');
    }
  }
};
</script>

<style scoped>
.calculadora-container {
  max-width: 700px;
  margin: auto;
  padding: 1rem;
}
.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.input-field {
  flex: 1 1 45%;
}
.input-icon {
  position: relative;
}
.input-icon i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.input-icon input,
.input-icon select {
  padding-left: 2rem;
  width: 100%;
}
.resultado {
  margin-top: 1rem;
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 10px;
}
.total-final {
  font-size: 1.4rem;
  font-weight: bold;
  color: green;
}
</style>


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

form {
  width: 100%;
}

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

.input-icon {
  position: relative;
  width: 100%;
}

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

button:disabled {
  background-color: #b2dfdb;
  cursor: not-allowed;
}

button:hover:enabled {
  background-color: #149174;
}

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

.total-final {
  color: #16a085;
  font-weight: 700;
}
</style>
