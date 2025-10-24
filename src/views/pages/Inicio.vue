<template>
  <div class="inicio-modern">
    <nav class="navbar">
      <!-- LOGO 3D con giro -->
      <div class="logo-3d" title="Adventur">
        <img
          src="https://adventur.pe/wp-content/uploads/2024/04/logo-agencia-turismo-adventur.png"
          alt="Adventur Logo"
          class="logo-img"
        />
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
      <p class="hero-subtitle">
        Explora, siente y conecta con lo mejor del Perú: historia, naturaleza, cultura y emoción
        te esperan en cada destino. ¡Comienza tu aventura ahora!
      </p>
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
      <p>&copy; 2025 Adventur. Todos los derechos reservados.</p>
      <div class="links-footer">
        <a href="https://www.facebook.com/AdventurPeru" target="_blank"><i class="bi bi-facebook"></i> Facebook</a>
        <a href="https://www.instagram.com/adventurperu/" target="_blank"><i class="bi bi-instagram"></i> Instagram</a>
        <a href="https://www.twitter.com/AdventurPeru" target="_blank"><i class="bi bi-twitter"></i> Twitter</a>
        <a href="https://www.youtube.com/@AdventurPeru" target="_blank"><i class="bi bi-youtube"></i> YouTube</a>
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
          imagen: "https://www.chullostravelperu.com/blog/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-10-at-6.16.57-PM-768x461.jpeg",
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
  position: relative;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  overflow-x: hidden;
  padding-top: 80px;

  /* Fondo con leve aumento de brillo */
background: 
  linear-gradient(
    rgba(0, 0, 0, 0.35) 0%,       /* ligero degradado superior */
    rgba(0, 0, 0, 0.45) 40%, 
    rgba(0, 0, 0, 0.28) 100%
  ),
  url("https://img2.wallspic.com/crops/0/2/6/2/7/172620/172620-dolomitas-iglesia_de_san_juan-montana-paisaje_natural-naturaleza-7680x4320.jpg")
  no-repeat center center fixed;
background-size: cover;
background-blend-mode: darken;
filter: brightness(1.13) contrast(1.06);
}

/* ======= NAVBAR ======= */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* LOGO 3D */
.logo-3d {
  --logo-h: 72px;
  height: var(--logo-h);
  display: flex;
  align-items: center;
  perspective: 800px;
}
.logo-3d .logo-img {
  height: 100%;
  transform-origin: center;
  transform: rotateX(10deg) rotateY(-16deg);
  animation: spinY 14s linear infinite;
  filter: brightness(1.15) contrast(1.08);
  transition: filter .25s ease;
}
.logo-3d:hover .logo-img {
  animation-play-state: paused;
  transform: rotateX(10deg) rotateY(-8deg) scale(1.05);
  filter: brightness(1.22);
}
@keyframes spinY {
  from { transform: rotateX(10deg) rotateY(0deg); }
  to   { transform: rotateX(10deg) rotateY(360deg); }
}

/* LINKS */
.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}
.nav-links a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: color .3s;
}
.nav-links a:hover { color: #4dd0e1; }

/* BOTÓN LOGIN */
.btn-login {
  background: linear-gradient(135deg, #00796b, #26a69a);
  color: #fff !important;
  font-weight: 600;
  padding: 0.6rem 1.3rem;
  border-radius: 25px;
  box-shadow: 0 0 10px rgba(38,166,154,0.5);
  transition: all .3s;
}
.btn-login:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(38,166,154,0.7);
}

/* ======= HERO ======= */
.hero {
  text-align: center;
  padding: 6rem 2rem 3rem;
}

/* Título formal con entrada suave */
.hero-title {
  position: relative;
  display: inline-block;
  font-weight: 800;
  font-size: clamp(2.2rem, 3.5vw, 3.2rem);
  letter-spacing: 0.5px;
  color: #f5faff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.45);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards;
}

/* Línea decorativa sutil */
.hero-title::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -12px;
  height: 3px;
  width: 0;
  border-radius: 2px;
  background: linear-gradient(90deg, #3ac7e3, #66d1e5);
  opacity: 0.9;
  animation: expandLine 1.2s ease .4s forwards;
}

/* Subtítulo elegante y legible */
.hero-subtitle {
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  max-width: 760px;
  margin: 0.8rem auto 0;
  line-height: 1.6;
  color: #f3f3f3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
  opacity: 0;
  transform: translateY(15px);
  animation: fadeInUp 1s ease .5s forwards;
}

/* ANIMACIONES */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes expandLine {
  from { width: 0; opacity: 0; }
  to { width: 60%; opacity: 1; }
}

/* ======= SLIDER ======= */
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
  background: rgba(0,0,0,0.3);
}
.slide {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  transition: opacity 1s ease-in-out;
}
.slide.active { opacity: 1; z-index: 1; }
.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

/* TEXTO SLIDER */
.texto-slide {
  position: absolute;
  bottom: 4%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.55);
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  backdrop-filter: blur(4px);
}
.texto-slide h2 {
  color: #4dd0e1;
  margin-bottom: 0.3rem;
}

/* CONTROLES SLIDER */
.control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.6);
  border: none;
  font-size: 1.5rem;
  padding: 0.6rem;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 2;
  transition: background .3s;
}
.control:hover { background: rgba(0,0,0,0.8); }
.control.prev { left: 1rem; }
.control.next { right: 1rem; }

/* FOOTER */
.footer {
  background: rgba(0,0,0,0.6);
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
.links-footer a:hover { color: #4dd0e1; }

/* RESPONSIVE */
@media screen and (max-width: 768px) {
  .logo-3d { --logo-h: 56px; }
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 1rem; }
  .slider { height: 320px; }
}
</style>
