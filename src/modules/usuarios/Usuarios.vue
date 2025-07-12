<template>
  <div class="container">
    <Loading :active="cargando" :is-full-page="true" />

    <h1>Gestión de Usuarios</h1>

    <!-- Alerta Toast -->
    <div v-if="showToast" class="toast success">
      <i class="bi bi-check-circle-fill me-2"></i> Usuario {{ editando ? 'actualizado' : 'registrado' }} correctamente
    </div>

    <form @submit.prevent="guardarUsuario" class="form">
      <div class="input-icon" :class="claseInput('nombre')">
        <i class="bi bi-person-fill icon"></i>
        <input v-model="usuario.nombre" type="text" placeholder="Nombre" />
      </div>
      <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>

      <div class="input-icon" :class="claseInput('apellido')">
        <i class="bi bi-people-fill icon"></i>
        <input v-model="usuario.apellido" type="text" placeholder="Apellido" />
      </div>
      <span v-if="errores.apellido" class="error-msg">{{ errores.apellido }}</span>

      <div class="input-icon" :class="claseInput('dni')">
        <i class="bi bi-credit-card icon"></i>
        <input v-model="usuario.dni" type="text" placeholder="DNI" />
      </div>
      <span v-if="errores.dni" class="error-msg">{{ errores.dni }}</span>

      <div class="input-icon" :class="claseInput('correo')">
        <i class="bi bi-envelope-at-fill icon"></i>
        <input v-model="usuario.correo" type="email" placeholder="Correo electrónico" />
      </div>
      <span v-if="errores.correo" class="error-msg">{{ errores.correo }}</span>

      <div class="input-icon">
        <i class="bi bi-telephone-fill icon"></i>
        <input v-model="usuario.telefono" type="tel" placeholder="Teléfono" />
      </div>

      <div class="input-icon">
        <i class="bi bi-geo-alt-fill icon"></i>
        <input v-model="usuario.direccion" type="text" placeholder="Dirección" />
      </div>

      <div class="input-icon" :class="claseInput('fecha_nacimiento')">
        <i class="bi bi-calendar-date-fill icon"></i>
        <input v-model="usuario.fecha_nacimiento" type="date" />
      </div>
      <span v-if="errores.fecha_nacimiento" class="error-msg">{{ errores.fecha_nacimiento }}</span>

      <div class="input-icon" :class="claseInput('rol')">
        <i class="bi bi-shield-lock-fill icon"></i>
        <select v-model="usuario.rol">
          <option value="" disabled>Seleccione un rol</option>
          <option value="Administrador">Administrador</option>
          <option value="Usuario">Usuario</option>
        </select>
      </div>
      <span v-if="errores.rol" class="error-msg">{{ errores.rol }}</span>

      <button type="submit" class="btn-submit">
        <i class="bi" :class="editando ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
        {{ editando ? 'Actualizar Usuario' : 'Registrar Usuario' }}
      </button>
    </form>

    <div v-if="usuarios.length" class="list">
      <h2>Usuarios Registrados</h2>
      <ul>
        <li v-for="(u, index) in usuarios" :key="index">
          <strong>{{ u.nombre }} {{ u.apellido }}</strong> – {{ u.rol }}<br />
          <small>{{ u.correo }} | {{ u.telefono }}</small><br />
          <button @click="editarUsuario(index)" class="edit" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button @click="eliminarUsuario(index)" class="delete" title="Eliminar">
            <i class="bi bi-trash-fill"></i>
          </button>
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
      usuario: {
        nombre: '', apellido: '', dni: '', correo: '',
        telefono: '', direccion: '', fecha_nacimiento: '', rol: ''
      },
      usuarios: [],
      errores: {},
      editando: false,
      indiceEditar: null,
      cargando: false,
      showToast: false
    };
  },
  computed: {
    claseInput() {
      return (campo) => {
        if (this.errores[campo]) return 'input-error';
        if (this.usuario[campo] && !this.errores[campo]) return 'input-ok';
        return '';
      };
    }
  },
  methods: {
    validarFormulario() {
      this.errores = {};
      if (!this.usuario.nombre) this.errores.nombre = "El nombre es obligatorio.";
      if (!this.usuario.apellido) this.errores.apellido = "El apellido es obligatorio.";
      if (!this.usuario.dni || this.usuario.dni.length !== 8) this.errores.dni = "El DNI debe tener 8 dígitos.";
      if (!this.usuario.correo.includes('@')) this.errores.correo = "Correo no válido.";
      if (!this.usuario.fecha_nacimiento) this.errores.fecha_nacimiento = "Debe ingresar una fecha de nacimiento.";
      if (!this.usuario.rol) this.errores.rol = "Seleccione un rol.";
      return Object.keys(this.errores).length === 0;
    },
    guardarUsuario() {
      this.cargando = true;
      if (this.validarFormulario()) {
        setTimeout(() => {
          if (this.editando) {
            this.usuarios.splice(this.indiceEditar, 1, { ...this.usuario });
            this.editando = false;
            Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: 'Los datos del usuario han sido modificados correctamente.' });
          } else {
            this.usuarios.push({ ...this.usuario });
            Swal.fire({ icon: 'success', title: 'Usuario registrado', text: 'El nuevo usuario ha sido guardado exitosamente.' });
          }
          this.usuario = { nombre: '', apellido: '', dni: '', correo: '', telefono: '', direccion: '', fecha_nacimiento: '', rol: '' };
          this.errores = {};
          this.cargando = false;
        }, 1000);
      } else {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Errores en el formulario', text: 'Por favor, corrige los errores antes de continuar.' });
      }
    },
    editarUsuario(index) {
      this.usuario = { ...this.usuarios[index] };
      this.editando = true;
      this.indiceEditar = index;
    },
    eliminarUsuario(index) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará al usuario de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cargando = true;
          setTimeout(() => {
            this.usuarios.splice(index, 1);
            this.cargando = false;
            Swal.fire({ icon: 'success', title: 'Usuario eliminado', text: 'El usuario ha sido eliminado correctamente.' });
          }, 1000);
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 720px;
  margin: 40px auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.toast {
  position: fixed;
  top: 20px;
  right: 30px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
}
.toast.success {
  background-color: #2ecc71;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-icon {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  padding: 0.5rem;
}

.input-icon .icon {
  margin-right: 0.6rem;
  font-size: 1.2rem;
  color: #2980b9;
}

.input-icon input,
.input-icon select {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: transparent;
  padding: 0.5rem 0;
}

.input-error {
  border: 1px solid #e74c3c !important;
  background-color: #fef0f0 !important;
}

.input-ok {
  border: 1px solid #2ecc71 !important;
  background-color: #f0fdf4 !important;
}

.btn-submit {
  background-color: #16a085;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}
.btn-submit:hover {
  background-color: #12876f;
}

.list {
  margin-top: 2rem;
}
.list h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #34495e;
}
.list ul {
  list-style: none;
  padding: 0;
}
.list li {
  background-color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.8rem;
}

.edit,
.delete {
  margin-right: 10px;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}
.edit:hover { color: #2980b9; }
.delete:hover { color: #e74c3c; }

.error-msg {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: -0.6rem;
  margin-bottom: 0.6rem;
}
</style>
