<template>
  <div class="inicio-publico d-flex flex-column align-items-center justify-content-center vh-100 text-center">
    <img src="https://adventur.pe/wp-content/uploads/2024/04/logo-adventur-2.png" alt="Logo Adventur" class="logo-adventur mb-4" />
    <h1 class="neon-text mb-3">
      <i class="bi bi-globe2"></i> Bienvenido a <strong>Adventur Manager</strong>
    </h1>
    <p class="lead text-white-50 mb-4">
      Gestión inteligente de proveedores, hoteles y tours.
    </p>

    <div class="d-flex gap-3 mb-4 justify-content-center">
      <router-link to="/login" class="btn btn-primary btn-lg neon-btn px-4">
        <i class="bi bi-box-arrow-in-right"></i> Iniciar sesión
      </router-link>
      <router-link to="/registro" class="btn btn-outline-light btn-lg px-4">
        <i class="bi bi-person-plus"></i> Crear cuenta
      </router-link>
    </div>

    <div class="links-footer text-white-50 small mt-3">
      <router-link to="/nosotros" class="me-3">Nosotros</router-link>
      <router-link to="/contacto" class="me-3">Contacto</router-link>
      <router-link to="/ayuda" class="me-3">Ayuda</router-link>
      <router-link to="/terminos" class="me-3">Términos</router-link>
      <router-link to="/privacidad">Privacidad</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Inicio'
}
</script>

<style scoped>
.inicio-publico {
  background: url('https://img3.wallspic.com/previews/5/1/7/5/7/175715/175715-el_parque_nacional_los_glaciares-dos_medicine_lake-lago_de_avalancha-montana_reynolds-el_lago_mcdonald-550x310.jpg') center center/cover no-repeat;
  color: #fff;
  padding: 2rem;
  min-height: 100vh;
  position: relative;
}

.inicio-publico::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, #183c4a88 0%, #203a4388 60%, #2c536488 100%);
  z-index: 0;
}

.inicio-publico > * {
  position: relative;
  z-index: 1;
}

.logo-adventur {
  width: 140px;
  height: auto;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 12px #00f7ff88);
  transition: transform 0.2s;
}
.logo-adventur:hover {
  transform: scale(1.07);
}

.neon-text {
  color: #00f7ff;
  text-shadow: 0 0 6px #00f7ff, 0 0 12px #00f7ff, 0 0 24px #00f7ff;
}

/* BOTÓN NEÓN PRINCIPAL */
.neon-btn {
  background: linear-gradient(135deg, #00f7ff, #0072ff);
  color: #fff !important;
  border: none;
  border-radius: 50px;
  padding: 0.85rem 2.8rem;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  box-shadow: 0 0 10px #00f7ff55, 0 0 25px #00f7ff88, inset 0 0 6px #00f7ff44;
  transition: all 0.3s ease-in-out;
}
.neon-btn:hover,
.neon-btn:focus {
  background: linear-gradient(135deg, #0072ff, #00f7ff);
  box-shadow: 0 0 15px #00f7ff99, 0 0 30px #00f7ffcc, inset 0 0 8px #00f7ff66;
  transform: scale(1.05) translateY(-2px);
}

/* BOTÓN CONTORNO CON ESTILO NEÓN */
.btn-outline-light {
  background: transparent;
  border: 2px solid #00f7ff;
  color: #00f7ff !important;
  border-radius: 50px;
  padding: 0.85rem 2.8rem;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  box-shadow: 0 0 12px #00f7ff33;
  transition: all 0.3s ease-in-out;
}
.btn-outline-light:hover,
.btn-outline-light:focus {
  background: #00f7ff;
  color: #203a43 !important;
  box-shadow: 0 0 18px #00f7ff, 0 0 36px #00f7ff88, inset 0 0 8px #203a43;
  transform: scale(1.05) translateY(-2px);
}

/* FOOTER LINKS CON ESTILO NEÓN */
.links-footer {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.links-footer .router-link {
  position: relative;
  color: #00f7ff !important;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  box-shadow: 0 0 10px #00f7ff33;
  transition: all 0.3s ease-in-out;
}
.links-footer .router-link:hover {
  color: #fff !important;
  background: rgba(0, 247, 255, 0.1);
  box-shadow: 0 0 16px #00f7ff99;
  transform: scale(1.05);
}
</style>
