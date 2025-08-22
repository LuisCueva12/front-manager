<template>
  <div class="registro-hotel-box">
    <h2><i class="bi bi-building"></i> Registro de Hotel</h2>

    <form @submit.prevent="guardarHotel">
      <div
        class="form-group"
        v-for="(campo, index) in campos"
        :key="index"
        @click="mostrarTooltip(index)"
      >
        <div v-if="tooltipIndex === index" class="tooltip-box">
          <strong>{{ campo.label }}:</strong> {{ campo.ayuda }}
        </div>

        <label :for="campo.id">
          <i :class="campo.icon"></i> {{ campo.label }}
        </label>

        <template v-if="campo.tipo === 'select'">
          <select
            class="form-control"
            :id="campo.id"
            v-model="hotel[campo.modelo]"
            :required="campo.requerido"
          >
            <option disabled value="">Seleccione categoría</option>
            <option v-for="op in campo.opciones" :key="op" :value="op">{{ op }}</option>
          </select>
        </template>

        <template v-else>
          <input
            :type="campo.tipo"
            class="form-control"
            :id="campo.id"
            v-model="hotel[campo.modelo]"
            :required="campo.requerido"
          />
        </template>
      </div>

      <div class="form-group">
        <label><i class="bi bi-ui-checks-grid"></i> Servicios incluidos:</label>
        <div
          class="form-check"
          v-for="(servicio, i) in serviciosDisponibles"
          :key="'serv-' + i"
        >
          <input
            class="form-check-input"
            type="checkbox"
            :id="'serv-' + i"
            :value="servicio"
            v-model="hotel.servicios"
          />
          <label class="form-check-label" :for="'serv-' + i">{{ servicio }}</label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-100 mt-3">
        <i class="bi bi-save"></i> Guardar Hotel
      </button>
    </form>

    <!-- Botón para regresar -->
    <div class="text-center mt-3">
      <router-link to="/hoteles" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle"></i> Volver a Hoteles
      </router-link>
    </div>

    <loading :active.sync="isLoading" :is-full-page="true" />
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

export default {
  components: { Loading },
  data() {
    return {
      isLoading: false,
      tooltipIndex: null,
      editando: false,
      hotel: {
        id: null,
        nombre: '',
        ruc: '',
        correo: '',
        telefono: '',
        representante: '',
        direccion: '',
        destino: '',
        cuentaBancaria: '',
        categoria: '',
        tarifas: '',
        condiciones: '',
        disponibilidad: '',
        acuerdos: '',
        servicios: []
      },
      serviciosDisponibles: [
        'WiFi', 'Desayuno', 'Piscina', 'Gimnasio',
        'Estacionamiento', 'Spa', 'Restaurante'
      ],
      campos: [
        { id: 'nombre', label: 'Nombre del hotel', modelo: 'nombre', tipo: 'text', icon: 'bi bi-building', requerido: true, ayuda: 'Ejemplo: Hotel Continental' },
        { id: 'ruc', label: 'RUC / Razón Social', modelo: 'ruc', tipo: 'text', icon: 'bi bi-briefcase-fill', requerido: true, ayuda: 'Ejemplo: 12345678901' },
        { id: 'correo', label: 'Correo electrónico', modelo: 'correo', tipo: 'email', icon: 'bi bi-envelope-fill', requerido: true, ayuda: 'Ejemplo: hotel@correo.com' },
        { id: 'telefono', label: 'Teléfono', modelo: 'telefono', tipo: 'text', icon: 'bi bi-telephone-fill', requerido: true, ayuda: 'Ejemplo: 912345678' },
        { id: 'representante', label: 'Representante', modelo: 'representante', tipo: 'text', icon: 'bi bi-person-fill', requerido: false, ayuda: 'Ejemplo: Juan Pérez' },
        { id: 'direccion', label: 'Dirección', modelo: 'direccion', tipo: 'text', icon: 'bi bi-geo-alt-fill', requerido: false, ayuda: 'Ejemplo: Av. Perú 123 - Lima' },
        { id: 'destino', label: 'Ciudad / Destino', modelo: 'destino', tipo: 'text', icon: 'bi bi-geo-fill', requerido: true, ayuda: 'Ejemplo: Cusco, Cajamarca' },
        { id: 'cuentaBancaria', label: 'Cuenta Bancaria', modelo: 'cuentaBancaria', tipo: 'text', icon: 'bi bi-bank', requerido: false, ayuda: 'Ejemplo: 000-1234567890' },
        { id: 'categoria', label: 'Categoría del hotel', modelo: 'categoria', tipo: 'select', icon: 'bi bi-star-fill', requerido: true, ayuda: 'Seleccione entre: 1 a 5 estrellas', opciones: ['1 estrella', '2 estrellas', '3 estrellas', '4 estrellas', '5 estrellas'] },
        { id: 'tarifas', label: 'Tarifas (JSON)', modelo: 'tarifas', tipo: 'text', icon: 'bi bi-currency-exchange', requerido: false, ayuda: 'Ejemplo: {"Simple": 80, "Doble": 120}' },
        { id: 'condiciones', label: 'Condiciones / Políticas', modelo: 'condiciones', tipo: 'text', icon: 'bi bi-info-circle-fill', requerido: false, ayuda: 'Ejemplo: Check-in 1PM, No reembolsos' },
        { id: 'disponibilidad', label: 'Disponibilidad', modelo: 'disponibilidad', tipo: 'text', icon: 'bi bi-door-open-fill', requerido: false, ayuda: 'Ejemplo: Habitaciones simples: 5, dobles: 3' },
        { id: 'acuerdos', label: 'Acuerdos Comerciales', modelo: 'acuerdos', tipo: 'text', icon: 'bi bi-file-earmark-text-fill', requerido: false, ayuda: 'Ejemplo: Convenio con agencias de viajes' }
      ]
    }
  },
  mounted() {
    const hotelEdicion = localStorage.getItem('hotelEdicion')
    if (hotelEdicion) {
      this.hotel = JSON.parse(hotelEdicion)
      this.editando = true
      localStorage.removeItem('hotelEdicion')
    }
  },
  methods: {
    mostrarTooltip(index) {
      this.tooltipIndex = index
      setTimeout(() => (this.tooltipIndex = null), 3000)
    },

    async guardarHotel() {
      this.isLoading = true
      await new Promise(resolve => setTimeout(resolve, 800))

      let hoteles = JSON.parse(localStorage.getItem('hoteles')) || []

      // Validar duplicado
      const existe = hoteles.find(h =>
        h.id !== this.hotel.id && (
          h.nombre.toLowerCase() === this.hotel.nombre.toLowerCase() ||
          h.ruc === this.hotel.ruc ||
          h.correo.toLowerCase() === this.hotel.correo.toLowerCase()
        )
      )

      if (existe) {
        this.isLoading = false
        Swal.fire({
          icon: 'warning',
          title: 'Hotel duplicado',
          text: 'Ya existe un hotel con el mismo nombre, RUC o correo.',
          confirmButtonText: 'Entendido'
        })
        return
      }

      if (this.editando) {
        // Actualizar hotel existente
        const index = hoteles.findIndex(h => h.id === this.hotel.id)
        if (index !== -1) {
          hoteles[index] = { ...this.hotel }
        }
        Swal.fire('¡Actualizado!', 'El hotel ha sido modificado.', 'success')
      } else {
        // Agregar nuevo hotel
        this.hotel.id = Date.now()
        hoteles.push({ ...this.hotel })
        Swal.fire('¡Registrado!', 'El hotel ha sido guardado correctamente.', 'success')
      }

      localStorage.setItem('hoteles', JSON.stringify(hoteles))
      this.isLoading = false
      this.$router.push('/hoteles')
    }
  }
}
</script>


<style scoped>
.registro-hotel-box {
  background-color: #f4f8fb;
  max-width: 430px;
  margin: 40px auto;
  padding: 30px 25px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
}
h2 {
  text-align: center;
  font-weight: bold;
  margin-bottom: 24px;
  color: #006fa2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.form-group {
  margin-bottom: 15px;
  position: relative;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #006fa2;
  font-size: 0.95rem;
}
.form-control {
  border-radius: 0;
  font-size: 0.95rem;
  padding: 8px 10px;
}
.form-check {
  margin-bottom: 6px;
}
.tooltip-box {
  background-color: #0d6efd;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.88rem;
  margin-bottom: 6px;
  position: relative;
}
</style>
