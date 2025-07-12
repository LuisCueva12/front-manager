<template>
  <loading v-model:active="isLoading" :is-full-page="false" />
  <div class="proveedor-form">
    <h2><i class="bi bi-truck"></i> Registro de Proveedores</h2>

    <form @submit.prevent="guardarProveedor">
      <div class="form-group">
        <div class="input-icon" :class="{ error: errores.nombre }">
          <i class="bi bi-person-fill"></i>
          <input type="text" v-model="proveedor.nombre" placeholder="Nombre del proveedor" />
        </div>
        <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>

        <div class="input-icon" :class="{ error: errores.tipo }">
          <i class="bi bi-list-ul"></i>
          <input type="text" v-model="proveedor.tipo" placeholder="Tipo (hotel, guía, etc.)" />
        </div>
        <span v-if="errores.tipo" class="error-msg">{{ errores.tipo }}</span>

        <div class="input-icon">
          <i class="bi bi-credit-card-2-front-fill"></i>
          <input type="text" v-model="proveedor.ruc" placeholder="RUC" />
        </div>

        <div class="input-icon" :class="{ error: errores.correo }">
          <i class="bi bi-envelope-fill"></i>
          <input type="email" v-model="proveedor.correo" placeholder="Correo electrónico" />
        </div>
        <span v-if="errores.correo" class="error-msg">{{ errores.correo }}</span>

        <div class="input-icon" :class="{ error: errores.telefono }">
          <i class="bi bi-telephone-fill"></i>
          <input type="text" v-model="proveedor.telefono" placeholder="Teléfono" />
        </div>
        <span v-if="errores.telefono" class="error-msg">{{ errores.telefono }}</span>

        <div class="input-icon">
          <i class="bi bi-geo-alt-fill"></i>
          <input type="text" v-model="proveedor.direccion" placeholder="Dirección" />
        </div>

        <div class="input-icon">
          <i class="bi bi-globe2"></i>
          <input type="text" v-model="proveedor.departamento" placeholder="Departamento" />
        </div>

        <div class="input-icon">
          <i class="bi bi-map-fill"></i>
          <input type="text" v-model="proveedor.provincia" placeholder="Provincia" />
        </div>

        <div class="input-icon" :class="{ error: errores.cuenta }">
          <i class="bi bi-bank"></i>
          <input type="text" v-model="proveedor.cuenta" placeholder="Cuenta bancaria (ahorros/corriente – CCI)" />
        </div>
        <span v-if="errores.cuenta" class="error-msg">{{ errores.cuenta }}</span>

        <div class="input-icon" :class="{ error: errores.representante }">
          <i class="bi bi-person-badge-fill"></i>
          <input type="text" v-model="proveedor.representante" placeholder="Representante legal o contacto principal" />
        </div>
        <span v-if="errores.representante" class="error-msg">{{ errores.representante }}</span>

        <div class="input-icon">
          <i class="bi bi-person-vcard-fill"></i>
          <input type="text" v-model="proveedor.cargo" placeholder="Cargo del contacto (opcional, ej: Gerente, Encargado de reservas)" />
        </div>

        <div class="input-icon">
          <i class="bi bi-journal-text"></i>
          <textarea v-model="proveedor.acuerdos" placeholder="Seguimiento/acuerdos comerciales, observaciones, fechas..."></textarea>
        </div>
      </div>

      <button type="submit">
        <i class="bi bi-save"></i> {{ editando ? "Actualizar" : "Guardar" }}
      </button>
    </form>

    <div v-if="proveedores.length" class="proveedor-list">
      <h3>📋 Proveedores Registrados</h3>
      <ul>
        <li v-for="(p, index) in proveedores" :key="index">
          <strong>{{ p.nombre }}</strong> – {{ p.tipo }}<br />
          📧 {{ p.correo }} | ☎️ {{ p.telefono }}<br />
          🏦 {{ p.cuenta }} | 📍 {{ p.direccion }}
          <div class="acciones">
            <button @click="editarProveedor(index)" title="Editar"><i class="fas fa-edit"></i></button>
            <button @click="eliminarProveedor(index)" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
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
      proveedor: {
        nombre: '', tipo: '', ruc: '', correo: '', telefono: '', direccion: '',
        departamento: '', provincia: '', cuenta: '', representante: '', cargo: '', acuerdos: ''
      },
      proveedores: [],
      editando: false,
      indexEditar: null,
      toast: '',
      errores: {}
    };
  },
  mounted() {
    const guardados = localStorage.getItem('proveedores');
    if (guardados) {
      this.proveedores = JSON.parse(guardados);
    }
  },
  watch: {
    proveedores: {
      handler(nuevo) {
        localStorage.setItem('proveedores', JSON.stringify(nuevo));
      },
      deep: true
    }
  },
  methods: {
    async guardarProveedor() {
      this.errores = {};
      if (!this.proveedor.nombre.trim()) this.errores.nombre = "El nombre es obligatorio.";
      if (!this.proveedor.tipo.trim()) this.errores.tipo = "El tipo es obligatorio.";
      if (!this.proveedor.correo.trim()) {
        this.errores.correo = "El correo es obligatorio.";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.proveedor.correo)) {
        this.errores.correo = "Correo no válido.";
      }
      if (!this.proveedor.telefono.trim()) this.errores.telefono = "El teléfono es obligatorio.";
      if (!this.proveedor.cuenta.trim()) this.errores.cuenta = "La cuenta bancaria es obligatoria.";
      if (!this.proveedor.representante.trim()) this.errores.representante = "El representante es obligatorio.";

      if (Object.keys(this.errores).length > 0) {
        this.mostrarToast("⚠️ Por favor completa los campos obligatorios correctamente.");
        return;
      }

      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 800));

      if (this.editando) {
        this.proveedores[this.indexEditar] = { ...this.proveedor };
        Swal.fire("Actualizado", "Proveedor actualizado correctamente", "success");
      } else {
        this.proveedores.push({ ...this.proveedor });
        Swal.fire("Registrado", "Proveedor registrado correctamente", "success");
      }

      this.resetForm();
      this.isLoading = false;
    },
    async eliminarProveedor(index) {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esto eliminará permanentemente el proveedor.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      if (!confirmacion.isConfirmed) return;

      this.isLoading = true;
      await new Promise(resolve => setTimeout(resolve, 600));

      this.proveedores.splice(index, 1);
      Swal.fire("Eliminado", "Proveedor eliminado", "success");

      if (this.indexEditar === index) this.resetForm();
      this.isLoading = false;
    },
    editarProveedor(index) {
      this.proveedor = { ...this.proveedores[index] };
      this.editando = true;
      this.indexEditar = index;
    },
    resetForm() {
      this.proveedor = {
        nombre: '', tipo: '', ruc: '', correo: '', telefono: '', direccion: '',
        departamento: '', provincia: '', cuenta: '', representante: '', cargo: '', acuerdos: ''
      };
      this.editando = false;
      this.indexEditar = null;
      this.errores = {};
    },
    mostrarToast(msg) {
      this.toast = msg;
      setTimeout(() => { this.toast = ''; }, 3000);
    }
  }
};
</script>

<style scoped>
.proveedor-form {
  max-width: 480px;
  margin: 40px auto;
  padding: 30px 20px 24px 20px;
  background: rgba(255,255,255,0.98);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.13), 0 1.5px 8px rgba(26,188,156,0.07);
  font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
  border: 1.5px solid rgba(44,62,80,0.08);
}

.proveedor-form h2 {
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

.input-icon.error input,
.input-icon.error textarea {
  border-color: #e74c3c !important;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.97em;
  margin-top: 2px;
  margin-bottom: -6px;
}

button[type="submit"], .proveedor-form button {
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
button[type="submit"]:hover, .proveedor-form button:hover {
  background: linear-gradient(90deg, #16a085 60%, #1abc9c 100%);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 18px rgba(26,188,156,0.18);
}

.proveedor-list {
  margin-top: 2.2rem;
  padding: 14px 10px 8px 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.98);
  box-shadow: 0 2px 12px rgba(44,62,80,0.09);
}

.proveedor-list h3 {
  margin-bottom: 1.1rem;
  color: #16a085;
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.proveedor-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.proveedor-list li {
  background: rgba(236, 240, 241, 0.92);
  padding: 0.7rem 0.8rem 0.7rem 0.8rem;
  border-radius: 9px;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  position: relative;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
  border: 1px solid #e1e8ed;
}

.proveedor-list li strong {
  color: #16a085;
  font-weight: 700;
}

.proveedor-list li b {
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
  .proveedor-form {
    max-width: 98vw;
    padding: 10px 2vw 14px 2vw;
  }
  .proveedor-list {
    padding: 8px 2vw 6px 2vw;
  }
}
</style>
