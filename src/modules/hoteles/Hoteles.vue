<template>
  <div class="contenedor-hoteles">
    <div class="header-hoteles">
      <router-link to="/registro-hotel" class="btn btn-success">
        <i class="bi bi-plus-circle"></i> Nuevo Hotel
      </router-link>
    </div>

    <input type="text" v-model="busqueda" class="buscador" placeholder="Buscar hotel..." />

    <table class="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th>Categoría</th>
          <th>Teléfono</th>
          <th>Correo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(hotel, index) in hotelesFiltrados" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ hotel.nombre }}</td>
          <td>{{ hotel.destino }}</td>
          <td>{{ hotel.categoria }}</td>
          <td>{{ hotel.telefono }}</td>
          <td>{{ hotel.correo }}</td>
          <td class="acciones">
            <button @click="verHotel(hotel)" title="Ver"><i class="bi bi-eye-fill"></i></button>
            <button @click="editarHotel(hotel)" title="Editar"><i class="bi bi-pencil-square"></i></button>
            <button @click="eliminarHotel(index)" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Dropzone -->
    <div v-if="hotelSeleccionado" class="dropzone-overlay">
      <div class="dropzone">
        <h4><i class="bi bi-card-text"></i> Resumen del Hotel</h4>
        <table>
          <tr><td><strong>Nombre:</strong></td><td>{{ hotelSeleccionado.nombre }}</td></tr>
          <tr><td><strong>RUC:</strong></td><td>{{ hotelSeleccionado.ruc }}</td></tr>
          <tr><td><strong>Correo:</strong></td><td>{{ hotelSeleccionado.correo }}</td></tr>
          <tr><td><strong>Teléfono:</strong></td><td>{{ hotelSeleccionado.telefono }}</td></tr>
          <tr><td><strong>Ciudad:</strong></td><td>{{ hotelSeleccionado.destino }}</td></tr>
          <tr><td><strong>Categoría:</strong></td><td>{{ hotelSeleccionado.categoria }}</td></tr>
          <tr><td><strong>Servicios:</strong></td>
            <td>
              <ul v-if="hotelSeleccionado.servicios && hotelSeleccionado.servicios.length">
                <li v-for="(servicio, i) in hotelSeleccionado.servicios" :key="i">{{ servicio }}</li>
              </ul>
              <span v-else>Sin servicios registrados</span>
            </td>
          </tr>
        </table>
        <button @click="hotelSeleccionado = null" class="btn btn-secondary mt-3">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  data() {
    return {
      busqueda: '',
      hoteles: [],
      hotelSeleccionado: null
    };
  },
  computed: {
    hotelesFiltrados() {
      const texto = this.busqueda.trim().toLowerCase();
      return this.hoteles.filter(h =>
        h.nombre.toLowerCase().includes(texto) ||
        h.destino.toLowerCase().includes(texto) ||
        h.correo.toLowerCase().includes(texto)
      );
    }
  },
  methods: {
    cargarHoteles() {
      this.hoteles = JSON.parse(localStorage.getItem('hoteles')) || [];
    },
    verHotel(hotel) {
      this.hotelSeleccionado = hotel;
    },
    editarHotel(hotel) {
      localStorage.setItem('hotelEdicion', JSON.stringify(hotel));
      this.$router.push('/registro-hotel');
    },
    eliminarHotel(index) {
      Swal.fire({
        title: '¿Eliminar hotel?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Sí, eliminar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.hoteles.splice(index, 1);
          localStorage.setItem('hoteles', JSON.stringify(this.hoteles));
          Swal.fire('Eliminado', 'El hotel ha sido eliminado.', 'success');
        }
      });
    }
  },
  mounted() {
    this.cargarHoteles();
  },
  watch: {
    '$route'(to, from) {
      if (from.path === '/registro-hotel') {
        this.cargarHoteles();
      }
    }
  }
};
</script>
<style scoped>
.contenedor-hoteles {
  padding: 25px;
  background-color: #1e1e2f;
  min-height: 100vh;
  color: #fff;
}
.header-hoteles {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
.buscador {
  margin-bottom: 15px;
  padding: 8px 12px;
  width: 100%;
  max-width: 350px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.btn {
  font-weight: 600;
  border-radius: 5px;
}
.tabla {
  width: 100%;
  background-color: white;
  color: #000;
  border-radius: 6px;
  overflow: hidden;
}
.tabla th {
  background-color: #007b8a;
  color: white;
  padding: 10px;
  text-align: left;
}
.tabla td {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}
.acciones {
  display: flex;
  gap: 6px;
}
.acciones button {
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.acciones .bi-eye-fill {
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 4px 6px;
  border-radius: 4px;
}
.acciones .bi-pencil-square {
  background-color: #fff3cd;
  color: #856404;
  padding: 4px 6px;
  border-radius: 4px;
}
.acciones .bi-trash-fill {
  background-color: #f8d7da;
  color: #721c24;
  padding: 4px 6px;
  border-radius: 4px;
}

/* Modal tipo dropzone */
.dropzone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dropzone {
  background-color: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
}
.dropzone h4 {
  font-size: 1.2rem;
  color: #007b8a;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.dropzone table {
  width: 100%;
  font-size: 0.95rem;
}
.dropzone td {
  padding: 6px;
  vertical-align: top;
}
.btn-secondary {
  margin-top: 15px;
  padding: 8px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
}
</style>
