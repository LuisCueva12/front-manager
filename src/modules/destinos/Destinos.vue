<template>
  <div class="wrap">
    <!-- Toolbar -->
    <div class="toolbar">
      <h1 class="title">
        <i class="bi bi-geo-alt-fill"></i>
        Lista de Destinos
      </h1>

      <div class="tools">
        <input v-model="q" class="search" type="text" placeholder="Buscar destino..." @keyup.enter="cargar" />
        <button class="btn btn-outline" @click="cargar">
          <i class="bi bi-arrow-repeat"></i> Recargar
        </button>
        <!-- Nuevo: solo si tiene permiso -->
        <router-link v-if="auth.can('destinos.create')" to="/registro-destino" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Nuevo Destino
        </router-link>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-card">
      <table class="tabla">
        <thead>
          <tr>
            <th style="width:56px">#</th>
            <th>Nombre</th>
            <th>Departamento</th>
            <th>Provincia</th>
            <th>Código postal</th>
            <th>Estado</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d,i) in filtrados" :key="d.id">
            <td>{{ i+1 }}</td>
            <td>{{ d.nombre }}</td>
            <td>{{ d.departamento || '—' }}</td>
            <td>{{ d.provincia || '—' }}</td>
            <td>{{ d.codigo_postal || '—' }}</td>
            <td>
              <span :class="['pill', d.estado==='activo' ? 'pill-success' : 'pill-secondary']">
                {{ d.estado==='activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <!-- Ver -->
                <button
                  v-if="auth.can('destinos.read')"
                  class="act-btn cyan"
                  title="Ver"
                  @click="ver(d)"
                >
                  <i class="bi bi-eye"></i>
                </button>

                <!-- Editar -->
                <button
                  v-if="auth.can('destinos.update')"
                  class="act-btn yellow"
                  title="Editar"
                  @click="editar(d)"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>

                <!-- Eliminar -->
                <button
                  v-if="auth.can('destinos.delete')"
                  class="act-btn red"
                  title="Eliminar"
                  @click="eliminar(d)"
                >
                  <i class="bi bi-trash"></i>
                </button>

                <!-- Toggle estado -->
                <label
                  v-if="auth.can('destinos.update')"
                  class="switch"
                  :title="d.estado==='activo' ? 'Desactivar' : 'Activar'"
                >
                  <input type="checkbox" :checked="d.estado==='activo'" @change="toggleEstado(d)">
                  <span class="slider">
                    <i class="bi" :class="d.estado==='activo' ? 'bi-check-lg' : 'bi-x-lg'"></i>
                  </span>
                </label>
              </div>
            </td>
          </tr>

          <tr v-if="!filtrados.length">
            <td colspan="7" style="text-align:center;color:#8fa1bf;padding:16px;">No hay resultados</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal detalle -->
    <div v-if="detalle" class="dropzone-overlay" @click.self="detalle=null">
      <div class="dropzone">
        <h4><i class="bi bi-geo-alt"></i> {{ detalle.nombre }}</h4>
        <table class="detail">
          <tbody>
            <tr>
              <td><strong>Departamento:</strong></td>
              <td>{{ detalle.departamento || '—' }}</td>
            </tr>
            <tr>
              <td><strong>Provincia:</strong></td>
              <td>{{ detalle.provincia || '—' }}</td>
            </tr>
            <tr>
              <td><strong>Código postal:</strong></td>
              <td>{{ detalle.codigo_postal || '—' }}</td>
            </tr>
            <tr>
              <td><strong>Estado:</strong></td>
              <td>{{ detalle.estado }}</td>
            </tr>
            <tr>
              <td class="va-top"><strong>Descripción:</strong></td>
              <td class="pre">{{ detalle.descripcion || '—' }}</td>
            </tr>
            <tr>
              <td></td>
              <td>
                <small style="color:#596784">
                  Creado: {{ fmt(detalle.created_at) }} · Actualizado: {{ fmt(detalle.updated_at) }}
                </small>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
          <button class="btn btn-secondary" @click="detalle=null">Cerrar</button>
          <button
            v-if="auth.can('destinos.update')"
            class="btn btn-primary"
            @click="editar(detalle)"
          >
            <i class="bi bi-pencil-square"></i> Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import destinoService from '@/services/destinoService'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Destinos',
  setup () {
    const auth = useAuthStore()
    return { auth }
  },
  data: () => ({
    q: '',
    destinos: [],
    detalle: null
  }),
  computed: {
    filtrados () {
      const s = this.q.trim().toLowerCase()
      if (!s) return this.destinos
      return this.destinos.filter(d =>
        [d.nombre, d.departamento, d.provincia, d.codigo_postal, d.estado]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(s))
      )
    }
  },
  methods: {
    async cargar () {
      try {
        this.destinos = await destinoService.listar()
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo cargar los destinos', 'error')
      }
    },
    ver (d) {
      if (!this.auth.can('destinos.read')) {
        Swal.fire('Permiso denegado', 'No puedes ver destinos.', 'warning')
        return
      }
      this.detalle = d
    },
    editar (d) {
      if (!this.auth.can('destinos.update')) {
        Swal.fire('Permiso denegado', 'No puedes editar destinos.', 'warning')
        return
      }
      this.$router.push({ name: 'RegistroDestino', query: { id: d.id } })
    },
    async eliminar (d) {
      if (!this.auth.can('destinos.delete')) {
        Swal.fire('Permiso denegado', 'No puedes eliminar destinos.', 'warning')
        return
      }
      const res = await Swal.fire({
        title: '¿Eliminar destino?',
        text: d.nombre,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      if (!res.isConfirmed) return
      try {
        await destinoService.eliminar(d.id)
        await this.cargar()
        Swal.fire('Eliminado', 'El destino fue eliminado', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Error', 'No se pudo eliminar el destino', 'error')
      }
    },
    async toggleEstado (d) {
      if (!this.auth.can('destinos.update')) {
        Swal.fire('Permiso denegado', 'No puedes cambiar el estado de destinos.', 'warning')
        return
      }
      const nuevo = d.estado === 'activo' ? 'inactivo' : 'activo'
      const prev = d.estado
      d.estado = nuevo // UI optimista
      try {
        await destinoService.actualizar(d.id, { ...d, estado: nuevo })
      } catch (e) {
        d.estado = prev
        console.error(e)
        Swal.fire('Error', 'No se pudo cambiar el estado.', 'error')
      }
    },
    fmt (iso) { return iso ? new Date(iso).toLocaleString() : '—' }
  },
  mounted () { this.cargar() }
}
</script>

<style scoped>
/* ====== Layout general ====== */
.wrap { padding: 20px; background:#1a1b2b; min-height:100vh; color:#fff; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:14px; }
.title { margin:0; font-size:28px; font-weight:800; display:flex; align-items:center; gap:10px; }
.tools { display:flex; align-items:center; gap:10px; }
.search {
  width: 360px; max-width: 40vw;
  background:#0f1122; color:#e9eef6;
  border:1px solid #24314b; border-radius:10px; padding:10px 12px;
}

/* ====== Botones ====== */
.btn {
  display:inline-flex; align-items:center; gap:8px;
  border-radius:10px; padding:10px 14px; font-weight:800;
  height:40px; cursor:pointer; text-decoration:none;
  border:1.5px solid transparent; transition:background-color .2s ease, border-color .2s ease, color .2s ease, transform .05s ease, box-shadow .2s ease;
}
.btn i { font-size:1rem; }

/* Outline azul (Recargar) */
.btn-outline {
  background:transparent;
  color:#19b1ff;
  border-color:#0ea5e9;
  box-shadow: inset 0 0 0 2px rgba(14,165,233,.12);
}
.btn-outline:hover {
  background:rgba(14,165,233,.10);
  color:#8bdcff;
  border-color:#38bdf8;
}
.btn-outline:focus { outline:none; box-shadow:0 0 0 3px rgba(56,189,248,.25); }
.btn-outline:active { transform:translateY(1px); }

/* Verde sólido (Nuevo) */
.btn-primary {
  background:#10b981;
  color:#fff;
  border-color:#10b981;
  box-shadow:0 2px 0 rgba(0,0,0,.08), inset 0 -2px 0 rgba(0,0,0,.08);
}
.btn-primary:hover   { background:#059669; border-color:#059669; }
.btn-primary:focus   { outline:none; box-shadow:0 0 0 3px rgba(16,185,129,.25); }
.btn-primary:active  { transform:translateY(1px); }

/* ====== Tabla ====== */
.table-card { background:#0f1122; border-radius:12px; overflow:hidden; }
.tabla { width:100%; border-collapse:collapse; color:#e8e8f0; }
.tabla thead th { background:#007b8a; color:#fff; padding:12px; text-align:left; }
.tabla tbody td { padding:12px; border-bottom:1px solid #232742; }
.th-actions { width:220px; }

/* Estado pill */
.pill { display:inline-block; padding:4px 10px; border-radius:999px; font-weight:700; font-size:.82rem; }
.pill-success  { background:#c8f7e1; color:#0d683b; }
.pill-warning  { background:#fff1c2; color:#6b4e00; }
.pill-secondary{ background:#e0e3ea; color:#2c2f36; }

/* Acciones cuadradas */
.acciones { display:flex; align-items:center; gap:8px; }
.act-btn {
  width:36px; height:36px; display:grid; place-items:center;
  border:none; border-radius:10px; cursor:pointer;
  transition:transform .08s ease, filter .08s ease;
  color:#06111a; font-size:18px;
}
.act-btn:hover { transform:translateY(-1px); filter:brightness(1.05); }
.cyan   { background:#0dcaf0; color:#052a33; }
.yellow { background:#ffc107; color:#4f3c00; }
.red    { background:#dc3545; color:#fff; }

/* Toggle compacto */
.switch { position: relative; width: 44px; height: 22px; display:inline-flex; align-items:center; }
.switch input { display:none; }
.slider {
  position:absolute; inset:0; background:#ff4d4f; border-radius:999px;
  transition: background .12s ease; box-shadow: inset 0 0 0 2px rgba(255,255,255,.06);
}
.slider::before {
  content:""; position:absolute; height:18px; width:18px; left:3px; top:2px;
  background:#fff; border-radius:50%; transition: transform .12s ease; box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.slider i { position:absolute; top:50%; transform:translate(-50%,-50%); left:18px; font-size:12px; color:#fff; transition:left .12s ease; }
.switch input:checked + .slider { background:#22c55e; }
.switch input:checked + .slider::before { transform: translateX(22px); }
.switch input:checked + .slider i { left:30px; }

/* ====== Modal ====== */
.dropzone-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; padding:16px; z-index:1000; }
.dropzone { background:#fff; color:#000; padding:20px; border-radius:12px; width:90%; max-width:680px; }
.dropzone h4 { color:#007b8a; display:flex; align-items:center; gap:6px; margin:0 0 10px; }
.dropzone table.detail { width:100%; font-size:.95rem; border-collapse: collapse; }
.dropzone td { padding:6px; vertical-align:top; }
.pre { white-space: pre-wrap; }
.va-top { vertical-align: top; }
.thumbs { display:flex; gap:8px; flex-wrap:wrap; }
.thumbs img { height:48px; border-radius:6px; border:1px solid #dfe6ee; display:block; }
.btn.btn-secondary { background:#6c757d; color:#fff; border:none; border-radius:10px; padding:8px 14px; }
</style>
