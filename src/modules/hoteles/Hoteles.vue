<template>
  <div class="hotel-form">
    <h2><i class="bi bi-building"></i> Registro de Hoteles</h2>

    <!-- Filtro por ciudad -->
    <div class="filtro-ciudad">
      <label><i class="bi bi-geo-alt-fill"></i> Filtrar por ciudad:</label>
      <select v-model="ciudadFiltro">
        <option value="">Todas</option>
        <option v-for="ciudad in ciudadesDisponibles" :key="ciudad" :value="ciudad">{{ ciudad }}</option>
      </select>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>

    <form @submit.prevent="guardarHotel">
      <div class="form-group">
        <div class="input-icon">
          <i class="bi bi-building"></i>
          <input type="text" v-model="hotel.nombre" placeholder="Nombre del hotel" :class="{ 'input-error': submitted && !hotel.nombre }" />
        </div>
        <div class="input-icon">
          <i class="bi bi-star-fill"></i>
          <input type="text" v-model="hotel.categoria" placeholder="Categoría" :class="{ 'input-error': submitted && !hotel.categoria }" />
        </div>
        <div class="input-icon">
          <i class="bi bi-telephone-fill"></i>
          <input type="text" v-model="hotel.telefono" placeholder="Teléfono" />
        </div>
        <div class="input-icon">
          <i class="bi bi-envelope-fill"></i>
          <input type="email" v-model="hotel.correo" placeholder="Correo" />
        </div>
        <div class="input-icon">
          <i class="bi bi-person-workspace"></i>
          <input type="text" v-model="hotel.representante" placeholder="Representante del hotel" />
        </div>
        <div class="input-icon">
          <i class="bi bi-geo-fill"></i>
          <input type="text" v-model="hotel.destino" placeholder="Destino (Ciudad)" />
        </div>
        <div class="input-icon">
          <i class="bi bi-tags-fill"></i>
          <textarea v-model="hotel.tarifas" placeholder="Tarifas (JSON ejemplo: {SGL: 80, DBL: 100})"></textarea>
        </div>
        <div class="input-icon">
          <i class="bi bi-cash-coin"></i>
          <textarea v-model="hotel.precios" placeholder="Precios por temporada (JSON)"></textarea>
        </div>
        <div class="input-icon">
          <i class="bi bi-globe"></i>
          <textarea v-model="hotel.ubicacion" placeholder="Ubicación geográfica"></textarea>
        </div>
        <div class="input-icon">
          <i class="bi bi-info-circle-fill"></i>
          <textarea v-model="hotel.condiciones" placeholder="Condiciones (check-in, penalidades...)"></textarea>
        </div>

        <!-- Servicios incluidos -->
        <div class="servicios-incluidos">
          <label><i class="bi bi-ui-checks-grid"></i> Servicios incluidos:</label>
          <div class="servicios-lista">
            <label v-for="servicio in serviciosDisponibles" :key="servicio">
              <input type="checkbox" :value="servicio" v-model="hotel.servicios" />
              {{ servicio }}
            </label>
          </div>
        </div>

        <div class="input-icon">
          <i class="bi bi-door-closed"></i>
          <textarea v-model="hotel.disponibilidad" placeholder="Disponibilidad de habitaciones (ej: {SGL: 5, DBL: 10})"></textarea>
        </div>
        <div class="input-icon">
          <i class="bi bi-file-earmark-text"></i>
          <textarea v-model="hotel.acuerdos" placeholder="Acuerdos comerciales"></textarea>
        </div>
      </div>
      <button type="submit" class="btn-guardar">
        <i class="bi bi-save"></i> {{ editando ? "Actualizar Hotel" : "Guardar Hotel" }}
      </button>
    </form>

    <div v-if="hotelesFiltrados.length" class="hotel-list">
      <h3><i class="bi bi-list-task"></i> Hoteles Registrados</h3>
      <ul>
        <li v-for="(h, index) in hotelesFiltrados" :key="index">
          <strong>{{ h.nombre }}</strong> – {{ h.categoria }} – {{ h.destino }}<br />
          <i class="bi bi-telephone-fill"></i> {{ h.telefono }} |
          <i class="bi bi-envelope-fill"></i> {{ h.correo }}<br />
          <i class="bi bi-person-fill"></i> {{ h.representante }}<br />
          <span v-if="h.servicios && h.servicios.length"><b>Servicios:</b> {{ h.servicios.join(', ') }}</span><br />
          <span v-if="h.disponibilidad"><b>Disponibilidad:</b> {{ h.disponibilidad }}</span><br />
          <span v-if="h.acuerdos"><b>Acuerdos:</b> {{ h.acuerdos }}</span>
          <div class="acciones">
            <button @click="editarHotel(index)" title="Editar"><i class="bi bi-pencil-square"></i></button>
            <button @click="eliminarHotel(index)" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'

export default {
  components: {
    Loading
  },
  data() {
    return {
      isLoading: false,
      toast: '',
      hotel: {
        nombre: '', categoria: '', telefono: '', correo: '', representante: '', destino: '',
        tarifas: '', precios: '', ubicacion: '', condiciones: '', servicios: [],
        disponibilidad: '', acuerdos: ''
      },
      hoteles: [],
      editando: false,
      indexEditar: null,
      ciudadFiltro: '',
      serviciosDisponibles: ['WiFi', 'Desayuno', 'Piscina', 'Gimnasio', 'Estacionamiento', 'Spa', 'Restaurante']
    };
  },
  computed: {
    ciudadesDisponibles() {
      const ciudades = this.hoteles.map(h => h.destino).filter(Boolean);
      return [...new Set(ciudades)];
    },
    hotelesFiltrados() {
      if (!this.ciudadFiltro) return this.hoteles;
      return this.hoteles.filter(h => h.destino === this.ciudadFiltro);
    }
  },
  methods: {
    async guardarHotel() {
      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 900));
      if (this.editando) {
        this.hoteles[this.indexEditar] = { ...this.hotel };
        this.mostrarAlerta('Hotel actualizado', 'Los datos del hotel han sido modificados.', 'success');
      } else {
        this.hoteles.push({ ...this.hotel });
        this.mostrarAlerta('Hotel registrado', 'El hotel ha sido registrado exitosamente.', 'success');
      }
      this.resetForm();
      this.isLoading = false;
    },
    editarHotel(index) {
      const realIndex = this.ciudadFiltro
        ? this.hoteles.findIndex(h => h === this.hotelesFiltrados[index])
        : index;
      this.hotel = { ...this.hoteles[realIndex] };
      this.editando = true;
      this.indexEditar = realIndex;
    },
    async eliminarHotel(index) {
      const realIndex = this.ciudadFiltro
        ? this.hoteles.findIndex(h => h === this.hotelesFiltrados[index])
        : index;

      const result = await Swal.fire({
        title: '¿Eliminar hotel?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        this.isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 900));
        this.hoteles.splice(realIndex, 1);
        this.mostrarAlerta('Eliminado', 'El hotel ha sido eliminado correctamente.', 'success');
        if (this.indexEditar === realIndex) this.resetForm();
        this.isLoading = false;
      }
    },
    resetForm() {
      this.hotel = {
        nombre: '', categoria: '', telefono: '', correo: '', representante: '', destino: '',
        tarifas: '', precios: '', ubicacion: '', condiciones: '', servicios: [],
        disponibilidad: '', acuerdos: ''
      };
      this.editando = false;
      this.indexEditar = null;
    },
    mostrarAlerta(titulo, texto, tipo) {
      Swal.fire({
        icon: tipo,
        title: titulo,
        text: texto
      });
    }
  }
}
</script>



<style scoped>
.hotel-form {
  max-width: 440px;
  margin: 36px auto;
  padding: 28px 18px 22px 18px;
  background: rgba(255,255,255,0.97);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.13), 0 1.5px 8px rgba(26,188,156,0.07);
  font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(44,62,80,0.08);
}

.hotel-form h2 {
  text-align: center;
  color: #16a085;
  margin-bottom: 18px;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 12px rgba(26,188,156,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toast {
  position: fixed;
  top: 22px;
  right: 22px;
  background: linear-gradient(90deg, #1abc9c 60%, #16a085 100%);
  color: #fff;
  padding: 12px 22px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(26,188,156,0.13);
  z-index: 1000;
  font-size: 1.05em;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: toastIn 0.4s;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(-20px);}
  to { opacity: 1; transform: translateY(0);}
}

.filtro-ciudad {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 1rem;
}

.filtro-ciudad select {
  padding: 5px 12px;
  border-radius: 7px;
  border: 1px solid #b2dfdb;
  font-size: 1rem;
  background: #f9f9f9;
  transition: border 0.2s;
}
.filtro-ciudad select:focus {
  border-color: #16a085;
  outline: none;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-icon {
  position: relative;
  width: 100%;
}

.input-icon i {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #16a085;
  font-size: 1.13rem;
  pointer-events: none;
  opacity: 0.92;
}

.input-icon input,
.input-icon textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px 8px 2.5rem;
  border-radius: 9px;
  border: 1.3px solid #e1e8ed;
  font-size: 1rem;
  background: rgba(250,250,250,0.99);
  transition: border-color 0.22s, box-shadow 0.22s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
  color: #2c3e50;
  outline: none;
  height: 36px;
  min-height: unset;
}

.input-icon input:focus,
.input-icon textarea:focus {
  border-color: #16a085;
  background: #fff;
}

.input-icon textarea {
  min-height: 38px;
  height: auto;
  resize: vertical;
  padding-top: 10px;
  padding-bottom: 10px;
}

.input-error {
  border-color: #e74c3c !important;
}

textarea {
  min-height: 38px;
  font-size: 1rem;
  resize: vertical;
}

.servicios-incluidos {
  margin: 10px 0 0 0;
}

.servicios-incluidos label {
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
  color: #16a085;
  font-size: 1rem;
}

.servicios-lista {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.servicios-lista label {
  font-weight: 400;
  font-size: 0.97rem;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f4f8fb;
  border-radius: 5px;
  padding: 2px 10px;
  cursor: pointer;
  border: 1px solid #e1e8ed;
  transition: background 0.18s, border-color 0.18s;
}

.servicios-lista label:hover {
  background: #eafaf1;
  border-color: #1abc9c;
}

.servicios-lista input[type="checkbox"] {
  accent-color: #16a085;
  margin-right: 2px;
  width: 15px;
  height: 15px;
}

button[type="submit"], .btn-guardar {
  margin-top: 16px;
  padding: 12px 0;
  border-radius: 9px;
  font-size: 1.08rem;
  font-weight: 700;
  background: linear-gradient(90deg, #1abc9c 60%, #16a085 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 12px rgba(26,188,156,0.11);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
}
button[type="submit"]:hover, .btn-guardar:hover {
  background: linear-gradient(90deg, #16a085 60%, #1abc9c 100%);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 18px rgba(26,188,156,0.18);
}

.hotel-list {
  margin-top: 2rem;
  padding: 14px 10px 8px 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.98);
  box-shadow: 0 2px 12px rgba(44,62,80,0.09);
}

.hotel-list h3 {
  margin-bottom: 1.1rem;
  color: #16a085;
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.hotel-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hotel-list li {
  background: rgba(236, 240, 241, 0.92);
  padding: 0.7rem 0.8rem 0.7rem 0.8rem;
  border-radius: 9px;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  position: relative;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
  border: 1px solid #e1e8ed;
}

.hotel-list li strong {
  color: #16a085;
  font-weight: 700;
}

.hotel-list li i {
  color: #1abc9c;
  margin-right: 2px;
}

.hotel-list li b {
  color: #34495e;
}

.acciones {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  display: flex;
  gap: 10px;
}

.acciones button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #2c3e50;
  padding: 2px 6px;
  border-radius: 7px;
  transition: background 0.18s, color 0.18s, transform 0.13s;
}
.acciones button:hover {
  background: #eafaf1;
  color: #e74c3c;
  transform: scale(1.13);
}

@media (max-width: 600px) {
  .hotel-form {
    max-width: 98vw;
    padding: 10px 2vw 14px 2vw;
  }
  .hotel-list {
    padding: 8px 2vw 6px 2vw;
  }
}
</style>
