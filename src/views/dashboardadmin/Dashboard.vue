<template>
  <div class="container-fluid py-5 bg-dashboard">
    <div class="row justify-content-center mb-4">
      <div class="col-md-10">
        <div class="card neon-card text-center p-4">
          <h2 class="text-info fw-bold">
            <i class="bi bi-speedometer2 me-2"></i> Bienvenido al sistema de gestión
          </h2>
          <p class="text-light">
            Desde aquí podrás acceder a todos los módulos del sistema, gestionar recursos, y más.
          </p>
        </div>
      </div>
    </div>

    <div class="row g-4 justify-content-center">
      <router-link to="/hoteles" class="col-md-5 col-lg-3 text-decoration-none">
        <div class="module-card card h-100 text-white text-center">
          <div class="card-img-top module-bg"
            style="background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80')">
          </div>
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-building me-2"></i> Hoteles</h5>
            <p class="card-text">Gestiona hoteles, categorías y ubicaciones.</p>
          </div>
        </div>
      </router-link>

      <router-link to="/tours" class="col-md-5 col-lg-3 text-decoration-none">
        <div class="module-card card h-100 text-white text-center">
          <div class="card-img-top module-bg"
            style="background-image: url('https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80')">
          </div>
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-map me-2"></i> Tours</h5>
            <p class="card-text">Registra tours, destinos y actividades.</p>
          </div>
        </div>
      </router-link>

      <router-link to="/proveedores" class="col-md-5 col-lg-3 text-decoration-none">
        <div class="module-card card h-100 text-white text-center">
          <div class="card-img-top module-bg"
            style="background-image: url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80')">
          </div>
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-truck me-2"></i> Proveedores</h5>
            <p class="card-text">Administra proveedores según su especialidad.</p>
          </div>
        </div>
      </router-link>

      <router-link to="/usuarios" class="col-md-5 col-lg-3 text-decoration-none">
        <div class="module-card card h-100 text-white text-center">
          <div class="card-img-top module-bg"
            style="background-image: url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80')">
          </div>
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-person-fill me-2"></i> Usuarios</h5>
            <p class="card-text">Controla los accesos y roles del sistema.</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.bg-dashboard {
  background: linear-gradient(135deg, #0e0e0e 30%, #1b1b1b 100%);
  min-height: 100vh;
}

.neon-card {
  background-color: #1f1f1f;
  border: 2px solid #00ffff;
  box-shadow: 0 0 25px #00ffff55;
  border-radius: 18px;
  animation: pulse-border 2s infinite alternate;
}

@keyframes pulse-border {
  from {
    box-shadow: 0 0 15px #00ffff55, 0 0 30px #00ffff33;
  }
  to {
    box-shadow: 0 0 30px #00ffffaa, 0 0 50px #00ffff77;
  }
}

.module-card {
  background: #1b1b1b;
  border: 1px solid #333;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.08);
}

.module-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2);
}

.module-bg {
  height: 160px;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00fff7;
}

.card-text {
  color: #ccc;
  font-size: 0.95rem;
}
</style>
