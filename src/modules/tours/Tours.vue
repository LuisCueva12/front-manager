<template>
  <div class="tours-container">
    <h2><i class="bi bi-map"></i> Registro de Tours</h2>

    <!-- Alerta tipo Toast -->
    <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>

    <form @submit.prevent="guardarTour" class="formulario">
      <div class="mb-3">
        <label class="form-label">Nombre del Tour</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-signpost-2"></i></span>
          <input
            type="text"
            v-model="tour.nombre"
            class="form-control"
            :class="{ 'is-invalid': errores.nombre }"
            placeholder="Nombre del tour"
          />
        </div>
        <div class="invalid-feedback" v-if="errores.nombre">{{ errores.nombre }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Ciudad</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
          <input
            type="text"
            v-model="tour.ciudad"
            class="form-control"
            :class="{ 'is-invalid': errores.ciudad }"
            placeholder="Ciudad destino"
          />
        </div>
        <div class="invalid-feedback" v-if="errores.ciudad">{{ errores.ciudad }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea
          class="form-control"
          v-model="tour.descripcion"
          placeholder="Descripción del tour"
          :class="{ 'is-invalid': errores.descripcion }"
        ></textarea>
        <div class="invalid-feedback" v-if="errores.descripcion">{{ errores.descripcion }}</div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label">Fecha</label>
          <input
            type="date"
            v-model="tour.fecha"
            class="form-control"
            :class="{ 'is-invalid': errores.fecha }"
          />
          <div class="invalid-feedback" v-if="errores.fecha">{{ errores.fecha }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Precio por persona</label>
          <input
            type="number"
            v-model.number="tour.precio"
            class="form-control"
            placeholder="Precio"
            :class="{ 'is-invalid': errores.precio }"
          />
          <div class="invalid-feedback" v-if="errores.precio">{{ errores.precio }}</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Duración</label>
        <input
          type="text"
          v-model="tour.duracion"
          class="form-control"
          placeholder="Ej: 4 horas, 1 día"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Horario</label>
        <input
          type="text"
          v-model="tour.horario"
          class="form-control"
          placeholder="Ej: 08:00 - 12:00"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">¿Qué incluye?</label>
        <div class="form-check" v-for="item in incluyeOpciones" :key="item">
          <input class="form-check-input" type="checkbox" :value="item" v-model="tour.incluye" />
          <label class="form-check-label">{{ item }}</label>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Capacidad</label>
        <input
          type="number"
          min="1"
          v-model.number="tour.capacidad"
          class="form-control"
          placeholder="Capacidad máxima"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Días de operación</label>
        <div class="form-check form-check-inline" v-for="dia in diasSemana" :key="dia.valor">
          <input class="form-check-input" type="checkbox" :value="dia.valor" v-model="tour.diasOperacion" />
          <label class="form-check-label">{{ dia.label }}</label>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Observaciones</label>
        <textarea
          class="form-control"
          v-model="tour.observaciones"
          placeholder="Condiciones especiales (opcional)"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-success">
        <i class="bi bi-save"></i>
        {{ editando ? 'Actualizar Tour' : 'Registrar Tour' }}
      </button>
    </form>

    <div v-if="tours.length" class="mt-5">
      <h4><i class="bi bi-list-check"></i> Tours Registrados</h4>
      <ul class="list-group mt-3">
        <li class="list-group-item" v-for="(t, i) in tours" :key="i">
          <div class="d-flex justify-content-between">
            <div>
              <strong>{{ t.nombre }}</strong> – {{ t.ciudad }} – {{ t.fecha }} – S/ {{ t.precio }}
              <p class="mb-1 text-muted small">{{ t.descripcion }}</p>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" @click="editarTour(i)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" @click="eliminarTour(i)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import Loading from 'vue-loading-overlay';

export default {
  components: { Loading },
  data() {
    return {
      isLoading: false,
      tour: {
        nombre: '', ciudad: '', descripcion: '', fecha: '', precio: null,
        duracion: '', horario: '', incluye: [], capacidad: null,
        diasOperacion: [], observaciones: ''
      },
      tours: [],
      editando: false,
      indexEditar: null,
      errores: {},
      incluyeOpciones: ['Almuerzo', 'Guía', 'Transporte', 'Entradas', 'Seguro', 'Snacks', 'Bebidas'],
      diasSemana: [
        { label: 'L', valor: 'Lunes' }, { label: 'M', valor: 'Martes' },
        { label: 'M', valor: 'Miércoles' }, { label: 'J', valor: 'Jueves' },
        { label: 'V', valor: 'Viernes' }, { label: 'S', valor: 'Sábado' },
        { label: 'D', valor: 'Domingo' }
      ]
    };
  },
  mounted() {
    const guardados = localStorage.getItem('tours');
    if (guardados) {
      this.tours = JSON.parse(guardados);
    }
  },
  watch: {
    tours: {
      handler(nuevo) {
        localStorage.setItem('tours', JSON.stringify(nuevo));
      },
      deep: true
    }
  },
  methods: {
    validarFormulario() {
      this.errores = {};
      if (!this.tour.nombre) this.errores.nombre = "El nombre es obligatorio.";
      if (!this.tour.ciudad) this.errores.ciudad = "La ciudad es obligatoria.";
      if (!this.tour.descripcion) this.errores.descripcion = "La descripción es obligatoria.";
      if (!this.tour.fecha) this.errores.fecha = "Debe seleccionar una fecha.";
      if (!this.tour.precio || this.tour.precio <= 0) this.errores.precio = "Ingrese un precio válido.";
      return Object.keys(this.errores).length === 0;
    },
    async guardarTour() {
      if (!this.validarFormulario()) {
        Swal.fire({ icon: 'error', title: 'Formulario incompleto', text: 'Revisa los campos obligatorios.' });
        return;
      }

      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 800));

      if (this.editando) {
        this.tours[this.indexEditar] = { ...this.tour };
        this.mostrarAlerta('Tour actualizado', 'El tour fue modificado correctamente.', 'success');
      } else {
        this.tours.push({ ...this.tour });
        this.mostrarAlerta('Tour registrado', 'El tour ha sido guardado exitosamente.', 'success');
      }

      this.reiniciarFormulario();
      this.isLoading = false;
    },
    async eliminarTour(index) {
      const confirmacion = await Swal.fire({
        title: '¿Eliminar este tour?',
        text: 'Esta acción eliminará el tour permanentemente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmacion.isConfirmed) return;

      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 600));

      this.tours.splice(index, 1);
      this.mostrarAlerta('Eliminado', 'El tour ha sido eliminado.', 'success');

      if (this.indexEditar === index) this.reiniciarFormulario();
      this.isLoading = false;
    },
    editarTour(index) {
      this.tour = { ...this.tours[index] };
      this.editando = true;
      this.indexEditar = index;
    },
    reiniciarFormulario() {
      this.tour = {
        nombre: '', ciudad: '', descripcion: '', fecha: '', precio: null,
        duracion: '', horario: '', incluye: [], capacidad: null,
        diasOperacion: [], observaciones: ''
      };
      this.errores = {};
      this.editando = false;
      this.indexEditar = null;
    },
    mostrarAlerta(titulo, mensaje, tipo) {
      Swal.fire({ icon: tipo, title: titulo, text: mensaje });
    }
  }
};
</script>



<style scoped>
.tours-container {
  max-width: 520px;
  margin: 38px auto;
  padding: 28px 18px 22px 18px;
  background: rgba(255,255,255,0.97);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.13), 0 1.5px 8px rgba(26,188,156,0.07);
  font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
  border: 1.5px solid rgba(44,62,80,0.08);
}

.tours-container h2 {
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

.formulario label {
  font-weight: 600;
  color: #16a085;
  margin-bottom: 4px;
  font-size: 1rem;
}

.input-group-text {
  background: #eafaf1;
  border: none;
  color: #16a085;
  font-size: 1.1rem;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1.3px solid #e1e8ed;
  font-size: 1rem;
  background: rgba(250,250,250,0.99);
  transition: border-color 0.22s, box-shadow 0.22s;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
  color: #2c3e50;
  outline: none;
  min-height: 36px;
}

.form-control:focus, .form-select:focus {
  border-color: #16a085;
  background: #fff;
}

textarea.form-control {
  min-height: 38px;
  resize: vertical;
  padding-top: 10px;
  padding-bottom: 10px;
}

.invalid-feedback {
  color: #e74c3c;
  font-size: 0.97em;
  margin-top: 2px;
}

.btn-success {
  background: linear-gradient(90deg, #1abc9c 60%, #16a085 100%);
  border: none;
  border-radius: 9px;
  font-size: 1.08rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 12px rgba(26,188,156,0.11);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.18s, transform 0.13s, box-shadow 0.18s;
  width: 100%;
  margin-top: 16px;
  padding: 12px 0;
}
.btn-success:hover {
  background: linear-gradient(90deg, #16a085 60%, #1abc9c 100%);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 18px rgba(26,188,156,0.18);
}

.form-check-input:checked {
  background-color: #16a085;
  border-color: #16a085;
}

.form-check-label {
  font-size: 0.97rem;
  color: #34495e;
}

.mt-5 {
  margin-top: 2.5rem !important;
}

.list-group-item {
  background: rgba(236, 240, 241, 0.92);
  border-radius: 9px !important;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  position: relative;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
  border: 1px solid #e1e8ed !important;
  padding: 0.7rem 0.8rem 0.7rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-group-item strong {
  color: #16a085;
  font-weight: 700;
}

.list-group-item .text-muted {
  color: #7f8c8d !important;
}

.btn-outline-primary, .btn-outline-danger {
  border-radius: 7px;
  font-size: 1.1rem;
  padding: 2px 10px;
  transition: background 0.18s, color 0.18s, transform 0.13s;
}
.btn-outline-primary:hover {
  background: #eafaf1;
  color: #16a085;
  transform: scale(1.13);
}
.btn-outline-danger:hover {
  background: #fdecea;
  color: #e74c3c;
  transform: scale(1.13);
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
  animation: toastIn 0.4s, fadeInOut 3s ease-in-out;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(-20px);}
  to { opacity: 1; transform: translateY(0);}
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-10px); }
}

@media (max-width: 600px) {
  .tours-container {
    max-width: 98vw;
    padding: 10px 2vw 14px 2vw;
  }
}
</style>
