<template>
  <div class="dashboard-container">
    <div class="content-wrapper">
      <div class="welcome-card">
        <h2><i class="bi bi-speedometer2 me-2"></i> Bienvenido al sistema de gestión</h2>
        <p>Desde aquí podrás acceder a todos los módulos del sistema, gestionar recursos y más.</p>
      </div>

      <div class="modules">
        <router-link to="/hoteles" class="module-link">
          <div class="module-card">
            <div class="module-img" style="background-image: url('https://images.unsplash.com/photo-1561501900-3701fa6a0864?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWwlMjBkZSUyMGx1am98ZW58MHx8MHx8fDA%3D');"></div>
            <div class="module-body">
              <h5><i class="bi bi-building me-2"></i> Hoteles</h5>
              <p>Gestiona hoteles, categorías y ubicaciones.</p>
            </div>
          </div>
        </router-link>

        <router-link to="/tours" class="module-link">
          <div class="module-card">
            <div class="module-img" style="background-image: url('https://www.mundomapi.com/wp-content/uploads/2019/06/laguna-de-humantay-700x500.jpg');"></div>
            <div class="module-body">
              <h5><i class="bi bi-map me-2"></i> Tours</h5>
              <p>Registra tours, destinos y actividades.</p>
            </div>
          </div>
        </router-link>

        <router-link to="/proveedores" class="module-link">
          <div class="module-card">
            <div class="module-img" style="background-image: url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="module-body">
              <h5><i class="bi bi-truck me-2"></i> Proveedores</h5>
              <p>Administra proveedores según su especialidad.</p>
            </div>
          </div>
        </router-link>

        <router-link to="/usuarios" class="module-link">
          <div class="module-card">
            <div class="module-img" style="background-image: url('https://media.istockphoto.com/id/1257664126/es/foto/feliz-hombre-de-negocios-usando-port%C3%A1til-en-la-habitaci%C3%B3n-del-hotel-retrato.jpg?s=612x612&w=0&k=20&c=bXvq22kS5SWCCUBqct0_GJ-nLZn7dAceE00a38QvLbk=');"></div>
            <div class="module-body">
              <h5><i class="bi bi-person-fill me-2"></i> Usuarios</h5>
              <p>Controla los accesos y roles del sistema.</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  width: 100%;
  background: url('https://img2.wallspic.com/previews/1/9/6/3/0/103691/103691-la_reserva_natural_de-la_botanica-desierto-carretera-jardin-x750.jpg') no-repeat center center fixed;
  background-size: cover;
  padding: 2rem;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
}

.welcome-card {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  margin-bottom: 2.5rem;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.welcome-card h2 {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.welcome-card p {
  font-size: 1.1rem;
  color: #f0f0f0;
}

.modules {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.module-link {
  text-decoration: none;
  width: 300px;
}

.module-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 6px; /* bordes rectos pero suaves */
  overflow: hidden;
  color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.15);
  will-change: transform;
}

.module-card:hover {
  transform: scale(1.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.module-img {
  height: 160px;
  background-size: cover;
  background-position: center;
  filter: brightness(0.75);
}

.module-body {
  padding: 1rem 1.2rem;
  flex-grow: 1;
}

.module-card h5 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.module-card p {
  font-size: 1rem;
  color: #ddd;
}
</style>

