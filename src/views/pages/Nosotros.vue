<template>
  <section class="nosotros">
    <div class="card">
      <!-- Encabezado -->
      <header class="top">
        <h2 class="title">
          <span class="title-icon" aria-hidden="true">👥</span>
          Sobre Nosotros
        </h2>
        <p class="subtitle">
          Conectamos experiencias únicas con viajeros que buscan descubrir lo mejor del Perú.
        </p>
      </header>

      <!-- Texto -->
      <div class="content">
        <p>
          Somos una plataforma de gestión de turismo creada para
          <strong>facilitar el trabajo de hoteles, agencias de viajes y proveedores</strong>.
          Nuestro objetivo es ofrecer herramientas modernas, ágiles y seguras que te permitan
          ahorrar tiempo y enfocarte en brindar experiencias inolvidables a tus clientes.
        </p>
        <p>
          Creemos en el turismo como un motor de
          <em>cultura, historia y desarrollo sostenible</em>.
          Por ello, trabajamos para crear una red que una a viajeros con operadores locales de confianza.
        </p>
      </div>

      <!-- Separador sutil -->
      <div class="divider" aria-hidden="true"></div>

      <!-- Features -->
      <div class="features">
        <!-- Hoteles -->
        <article class="feature" tabindex="0">
          <figure class="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/>
              <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M3 21h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </figure>
          <h3>Hoteles</h3>
          <p>Gestión sencilla de reservas y disponibilidad en tiempo real.</p>
        </article>

        <!-- Tours -->
        <article class="feature" tabindex="0">
          <figure class="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <circle cx="15" cy="10" r="2.3" stroke="currentColor" stroke-width="1.6"/>
            </svg>
          </figure>
          <h3>Tours</h3>
          <p>Conecta con viajeros interesados en experiencias auténticas.</p>
        </article>

        <!-- Proveedores -->
        <article class="feature" tabindex="0">
          <figure class="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8.5 12.5 11 15c1 .9 2.5.9 3.5 0l2.5-2.5M6 10l2.5 2.5m9.5-1.5 2-2a2.8 2.8 0 0 0 0-4l-.5-.5a2.8 2.8 0 0 0-4 0l-3 3m-3-1-2-2a2.8 2.8 0 0 0-4 0l-.5.5a2.8 2.8 0 0 0 0 4l2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </figure>
          <h3>Proveedores</h3>
          <p>Unimos servicios y productos con quienes más los necesitan.</p>
        </article>
      </div>

      <!-- CTA (más compacto y elegante) -->
      <div class="cta">
        <router-link to="/" class="btn-back" aria-label="Volver al inicio">
          <svg class="chev" viewBox="0 0 24 24" fill="none">
            <path d="M15 18 9 12l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al inicio
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default { name: 'Nosotros' }
</script>

<style scoped>
/* ===== Variables y base ===== */
.nosotros{
  --ink:#0f172a;         /* Títulos */
  --muted:#475569;       /* Secundario */
  --brand:#08c7e8;       /* Acento 1 */
  --brand-2:#00e5ff;     /* Acento 2 */
  --surface:#ffffffF2;   /* Card */
  --line:#e8eef6;        /* Bordes suaves */
  --shadow:0 10px 35px rgba(2,8,23,.10);
  --ring:0 0 0 3px rgba(0,229,255,.25);

  padding: clamp(16px, 3vw, 28px);
  background:
    radial-gradient(850px 850px at -10% -10%, #e9fbff 0%, transparent 60%),
    radial-gradient(900px 900px at 110% -5%, #ecfff8 0%, transparent 60%),
    #f6f9fc;
  min-height: 100%;
  font-family: "Poppins", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* ===== Tarjeta ===== */
.card{
  max-width: 980px;
  margin: 0 auto;
  padding: clamp(20px, 3.2vw, 34px);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
  animation: cardIn .5s ease both;
}

/* ===== Encabezado ===== */
.top{ text-align: center; margin-bottom: 10px; }
.title{
  margin:0;
  color:#0dcfe9;
  font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  letter-spacing:.2px;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
}
.title-icon{ font-size: 1.1em; filter: drop-shadow(0 6px 12px rgba(0,229,255,.35)); }
.subtitle{
  margin: 8px auto 0;
  color: var(--muted);
  font-size: clamp(.98rem, 1.8vw, 1.05rem);
  font-style: italic;
  max-width: 820px;
}

/* ===== Texto ===== */
.content{
  color:#223044;
  margin: 18px auto;
  max-width: 860px;
}
.content p{
  line-height: 1.75;
  font-size: 1.02rem;
  margin: .8rem 0;
  text-align: justify;
}
.content strong{ color:#0aa6c7; font-weight:800; }
.content em{ color:#0f766e; }

/* Separador sutil */
.divider{
  height: 1px;
  background: linear-gradient(90deg, transparent, #dff7ff 20%, #dff7ff 80%, transparent);
  margin: 18px 0 8px;
}

/* ===== Features ===== */
.features{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(240px,1fr));
  gap: clamp(12px, 2vw, 18px);
}
.feature{
  --bg:#f8fafc;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 14px 18px;
  text-align:center;
  transition: .22s transform, .22s box-shadow, .2s border-color, .22s background;
  min-height: 164px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  outline:none;
}
.feature:hover,
.feature:focus-visible{
  transform: translateY(-5px);
  background:#ffffff;
  box-shadow: 0 14px 28px rgba(2, 8, 23, .10);
  border-color:#cfefff;
}
.feature .ico{
  width:52px; height:52px; margin: 2px auto 10px;
  color:#09c6e6;
  display:grid; place-items:center;
  border-radius:12px;
  background: radial-gradient(80px 80px at 25% 15%, #e9fbff, transparent 60%);
}
.feature .ico svg{ width:30px; height:30px; }
.feature h3{
  margin:2px 0 4px; font-size:1.08rem;
  font-weight:800; color: var(--ink);
}
.feature p{
  color:#5a6f86; font-size:.95rem; line-height:1.5;
}

/* ===== CTA menor y elegante ===== */
.cta{ display:flex; justify-content:center; margin-top: 18px; }
.btn-back{
  display:inline-flex; align-items:center; gap:.5rem;
  height: 40px; padding: 0 14px;
  font-size:.95rem; font-weight:700;
  color:#0a6f7c; text-decoration:none;
  background: #eaffff;
  border: 1px solid #bff6ff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 205, 255, .18) inset, 0 4px 12px rgba(2, 8, 23, .06);
  transition: .18s transform, .18s box-shadow, .18s background, .18s color, .18s border-color;
}
.btn-back .chev{ width:18px; height:18px; color:#0aa6c7; }
.btn-back:hover{
  background: #dffbff;
  border-color: #96eefc;
  transform: translateY(-1px);
  box-shadow: 0 7px 18px rgba(0, 205, 255, .22) inset, 0 6px 16px rgba(2, 8, 23, .08);
}
.btn-back:active{ transform: translateY(0); }
.btn-back:focus-visible{ box-shadow: var(--ring); }

/* ===== Animaciones ===== */
@keyframes cardIn{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }

/* ===== Responsive ===== */
@media (max-width: 640px){
  .subtitle{ text-align:left; }
  .content{ text-align:left; }
  .feature{ min-height: 150px; }
}
</style>
