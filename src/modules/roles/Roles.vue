<template>
  <div class="roles-container">
    <!-- Loader -->
    <loading v-model:active="isLoading" :is-full-page="false" />

    <h2><i class="bi bi-shield-lock-fill"></i> Gestión de Roles</h2>

    <form @submit.prevent="agregarRol" class="form-group">
      <div class="input-wrapper">
        <div class="input-icon">
          <i class="bi bi-person-badge-fill"></i>
          <input
            v-model="nuevoRol"
            type="text"
            placeholder="Nombre del rol"
            required
            class="form-control"
          />
        </div>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Agregar Rol
        </button>
      </div>
    </form>

    <div v-if="roles.length" class="roles-list mt-4">
      <h3><i class="bi bi-list-check"></i> Roles Registrados</h3>
      <ul class="list-group mt-3">
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(rol, index) in roles" :key="index">
          <div>
            <i class="bi bi-circle-fill text-primary me-2"></i>{{ rol }}
          </div>
          <div class="role-actions">
            <i class="bi bi-pencil-square text-warning me-3" role="button" @click="editarRol(index)" title="Editar"></i>
            <i class="bi bi-trash-fill text-danger" role="button" @click="eliminarRol(index)" title="Eliminar"></i>
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
  components: { Loading },
  data() {
    return {
      isLoading: false,
      nuevoRol: '',
      roles: []
    };
  },
  mounted() {
    const guardados = localStorage.getItem('roles');
    if (guardados) {
      this.roles = JSON.parse(guardados);
    }
  },
  watch: {
    roles: {
      handler(nuevo) {
        localStorage.setItem('roles', JSON.stringify(nuevo));
      },
      deep: true
    }
  },
  methods: {
    async agregarRol() {
      const rol = this.nuevoRol.trim();
      if (rol === '') {
        Swal.fire('Campo vacío', 'Escribe un nombre para el rol.', 'warning');
        return;
      }
      if (this.roles.includes(rol)) {
        Swal.fire('Duplicado', 'Ese rol ya está registrado.', 'error');
        return;
      }

      this.isLoading = true;
      await new Promise(res => setTimeout(res, 500));

      this.roles.push(rol);
      this.nuevoRol = '';
      this.isLoading = false;

      Swal.fire('Agregado', 'Rol agregado correctamente.', 'success');
    },
    async eliminarRol(index) {
      const confirmacion = await Swal.fire({
        title: '¿Eliminar este rol?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmacion.isConfirmed) return;

      this.isLoading = true;
      await new Promise(res => setTimeout(res, 500));

      this.roles.splice(index, 1);
      this.isLoading = false;

      Swal.fire('Eliminado', 'El rol ha sido eliminado.', 'success');
    },
    editarRol(index) {
      Swal.fire('Función pendiente', 'La edición de roles aún no está implementada.', 'info');
    }
  }
}
</script>

<style scoped>
.roles-container {
  max-width: 600px;
  margin: auto;
}
.input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.input-icon {
  flex: 1;
  position: relative;
}
.input-icon i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}
.input-icon input {
  padding-left: 2rem;
}
.role-actions i {
  font-size: 1.2rem;
  cursor: pointer;
}
</style>



<style scoped>
.roles-container {
  max-width: 700px;
  margin: 40px auto;
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  text-align: center;
  font-size: 2rem;
  color: #16a085;
  margin-bottom: 1.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.form-group {
  margin-bottom: 2rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.input-icon {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.input-icon i {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: #16a085;
  font-size: 1.15rem;
}

input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #16a085;
  outline: none;
  box-shadow: 0 0 0 2px rgba(22, 160, 133, 0.13);
}

button {
  background-color: #16a085;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(22, 160, 133, 0.13);
  outline: none;
  white-space: nowrap;
  flex-shrink: 0;
  width: 100%;
  margin-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button:hover {
  background-color: #149174;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(22, 160, 133, 0.18);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(22, 160, 133, 0.18);
}

.roles-list {
  margin-top: 2rem;
}

.roles-list h3 {
  font-size: 1.3rem;
  color: #34495e;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.roles-list ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.roles-list li {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.roles-list li i.bi-circle-fill {
  color: #16a085;
  font-size: 0.9em;
}

.role-actions {
  display: flex;
  gap: 8px;
  margin-left: 8px;
}

.role-actions i {
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
  font-size: 1.1em;
}

.role-actions i.bi-pencil-square:hover {
  color: #2980b9;
}

.role-actions i.bi-trash-fill:hover {
  color: #e74c3c;
}
</style>
