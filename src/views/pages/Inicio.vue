<template>
  <div class="inicio-modern">
    <nav class="navbar">
      <div class="logo">
        <img src="https://adventur.pe/wp-content/uploads/2024/04/logo-agencia-turismo-adventur.png" alt="Adventur Logo" class="logo-img" />
      </div>
      <ul class="nav-links">
        <li><router-link to="/nosotros">Nosotros</router-link></li>
        <li><router-link to="/terminos">Términos</router-link></li>
        <li><router-link to="/contacto">Contacto</router-link></li>
        <li><router-link to="/ayuda">Ayuda</router-link></li>
        <li><router-link to="/privacidad">Privacidad</router-link></li>
      </ul>
      <router-link to="/login" class="btn-login">
        <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
      </router-link>
    </nav>

    <header class="hero">
      <h1 class="hero-title">¡Vive la experiencia Adventur!</h1>
      <p class="hero-subtitle">Explora, siente y conecta con lo mejor del Perú: historia, naturaleza, cultura y emoción te esperan en cada destino. ¡Comienza tu aventura ahora!</p>
    </header>

    <div class="slider-container">
      <div class="slider">
        <div
          class="slide"
          v-for="(destino, index) in destinos"
          :key="index"
          :class="{ active: index === activo }"
        >
          <img :src="destino.imagen" :alt="destino.nombre" />
          <div class="texto-slide animate">
            <h2><i class="bi bi-geo-alt-fill"></i> {{ destino.nombre }}</h2>
            <p>{{ destino.descripcion }}</p>
          </div>
        </div>
        <button class="control prev" @click="anterior"><i class="bi bi-chevron-left"></i></button>
        <button class="control next" @click="siguiente"><i class="bi bi-chevron-right"></i></button>
      </div>
    </div>

    <footer class="footer">
      <p>&copy; 2024 Adventur. Todos los derechos reservados.</p>
      <div class="links-footer">
        <a href="https://www.facebook.com/AdventurPeru" target="_blank" rel="noopener noreferrer"><i class="bi bi-facebook"></i> Facebook</a>
        <a href="https://www.instagram.com/adventurperu/" target="_blank" rel="noopener noreferrer"><i class="bi bi-instagram"></i> Instagram</a>
        <a href="https://www.twitter.com/AdventurPeru" target="_blank" rel="noopener noreferrer"><i class="bi bi-twitter"></i> Twitter</a>
        <a href="https://www.youtube.com/@AdventurPeru" target="_ blank" rel="noopener noreferrer"><i class="bi bi-youtube"></i> YouTube</a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "Inicio",
  data() {
    return {
      activo: 0,
      interval: null,
      destinos: [
        {
          nombre: "Cusco - Perú",
          descripcion: "Explora la historia en la capital del imperio inca.",
          imagen: "https://www.machupicchuterra.com/wp-content/uploads/machu-picchu-presupuesto.jpg",
        },
        {
          nombre: "Amazonía Peruana",
          descripcion: "Sumérgete en la selva más biodiversa del planeta.",
          imagen: "https://p4.wallpaperbetter.com/wallpaper/268/607/584/amazon-river-river-amazon-rainforest-rainforest-wallpaper-preview.jpg",
        },
        {
          nombre: "Arequipa - Cañón del Colca",
          descripcion: "Admira los cóndores y paisajes imponentes.",
          imagen: "https://www.tuentrada.com.pe/wp-content/uploads/2023/04/Canon-del-Colca.webp",
        },
        {
          nombre: "Máncora - Piura",
          descripcion: "Relájate en las playas más cálidas del norte.",
          imagen: "https://pasosdeviajero.com/wp-content/uploads/paraiso-de-sol-y-bellas-playas.jpg",
        },
        {
          nombre: "Cordillera Blanca - Huaraz",
          descripcion: "Aventura entre lagunas y nevados majestuosos.",
          imagen: "https://highsummitperu.com/wp-content/uploads/2022/03/47.jpg",
        },
      ],
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      this.siguiente();
    }, 6000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    siguiente() {
      this.activo = (this.activo + 1) % this.destinos.length;
    },
    anterior() {
      this.activo = (this.activo - 1 + this.destinos.length) % this.destinos.length;
    },
  },
};
</script>
<style scoped>
.inicio-modern {
  min-height: 100vh;
  background: url("https://img2.wallspic.com/crops/0/2/6/2/7/172620/172620-dolomitas-iglesia_de_san_juan-montana-paisaje_natural-naturaleza-7680x4320.jpg") no-repeat center center fixed;
  background-size: cover;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  overflow-x: hidden;
  padding-top: 80px;
}

/* NAVBAR */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  width: 160px;
  max-height: 100px;
  object-fit: contain;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.7));
  transition: transform 0.3s ease;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.nav-links li a {
  color: white;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-links li a:hover {
  color: #00ffe0;
}

/* === BOTÓN LOGIN === */
.btn-login {
  background: linear-gradient(135deg, #00c853, #00e676);
  color: #fff !important;
  font-weight: bold;
  padding: 0.6rem 1.3rem;
  border-radius: 25px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 14px rgba(0, 230, 118, 0.7);
}
.btn-login:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 230, 118, 1);
}

/* HERO */
.hero {
  text-align: center;
  padding: 6rem 2rem 3rem;
}

.hero-title {
  font-size: 2.2rem; /* antes 3rem */
  font-weight: 700;
  color: #00f2ff;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.6);
  margin-bottom: 0.8rem;
}

.hero-subtitle {
  font-size: 1.05rem; /* antes 1.3rem */
  max-width: 750px;
  margin: 0 auto;
  line-height: 1.5;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0,0,0,0.5);
}


/* SLIDER */
.slider-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.slider {
  position: relative;
  width: 90%;
  max-width: 1100px;
  height: 440px;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.3);
}

.slide {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  transition: opacity 1s ease-in-out;
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.texto-slide {
  position: absolute;
  bottom: 4%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.55); /* más transparente */
  padding: 0.7rem 1.5rem; /* menos padding */
  border-radius: 12px;
  text-align: center;
  color: #fff;
  max-width: 85%;
  backdrop-filter: blur(4px); /* difuminado moderno */
  box-shadow: 0 0 8px rgba(0,0,0,0.4);
}

.texto-slide h2 {
  font-size: 1.2rem; /* antes 1.5rem */
  color: #00e6e6;
  margin-bottom: 0.4rem;
  font-weight: 600;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.texto-slide p {
  font-size: 0.95rem; /* antes 1rem */
  color: #f1f1f1;
}


/* CONTROLES SLIDER */
.control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  font-size: 1.5rem;
  padding: 0.6rem;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 2;
}

.control:hover {
  background: rgba(0, 0, 0, 0.8);
}

.control.prev {
  left: 1rem;
}

.control.next {
  right: 1rem;
}

/* FOOTER */
.footer {
  background: rgba(0, 0, 0, 0.6);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #ccc;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 3rem;
}

.links-footer a {
  color: #ccc;
  margin: 0 0.7rem;
  text-decoration: none;
}

.links-footer a:hover {
  color: #00ffe0;
}

/* RESPONSIVE */
@media screen and (max-width: 768px) {
  .logo-img {
    width: 120px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
