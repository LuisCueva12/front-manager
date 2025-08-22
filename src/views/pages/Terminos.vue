<template>
  <section class="terms">
    <div class="card">
      <!-- Header -->
      <header class="top">
        <h2 class="title">
          <span class="title-icon">📑</span>
          Términos y Condiciones
        </h2>
        <p class="subtitle">
          El uso de esta plataforma implica la aceptación de nuestras políticas de uso y condiciones del servicio.
        </p>
      </header>

      <!-- Highlights -->
      <div class="highlights">
        <article class="hl">
          <div class="hl-ico">✅</div>
          <h3>Aceptación</h3>
          <p>Al registrarte o usar nuestros servicios, confirmas que aceptas las condiciones aquí descritas.</p>
        </article>
        <article class="hl">
          <div class="hl-ico">⚖️</div>
          <h3>Uso correcto</h3>
          <p>El usuario se compromete a utilizar la plataforma de manera responsable, sin afectar la experiencia de terceros.</p>
        </article>
        <article class="hl">
          <div class="hl-ico">🔄</div>
          <h3>Actualizaciones</h3>
          <p>Nos reservamos el derecho de modificar estos términos para mejorar el servicio. Te notificaremos los cambios relevantes.</p>
        </article>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Content blocks -->
      <div class="grid">
        <div class="block">
          <h4>Condiciones de uso</h4>
          <ul class="checklist">
            <li>Respetar la normativa vigente en Perú y el país desde donde accedas.</li>
            <li>No usar la plataforma para actividades ilícitas.</li>
            <li>Respetar la propiedad intelectual de los contenidos mostrados.</li>
          </ul>
        </div>

        <div class="block">
          <h4>Limitaciones</h4>
          <p>No garantizamos disponibilidad ininterrumpida, aunque hacemos todo lo posible para mantener el servicio activo y seguro.</p>
        </div>

        <div class="block">
          <h4>Responsabilidad</h4>
          <p>Adventur no se responsabiliza por la información proporcionada directamente por proveedores o terceros.</p>
        </div>

        <div class="block">
          <h4>Contacto</h4>
          <p>Para dudas o reclamos sobre los términos, escríbenos a: 
            <a class="link" href="mailto:legal@adventur.pe">legal@adventur.pe</a>
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div class="cta">
        <router-link to="/" class="btn-back">
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
export default { name: 'Terminos' }
</script>

<style scoped>
/* ===== Base ===== */
.terms{
  --ink:#0f172a;
  --muted:#475569;
  --brand:#0dcaf0;
  --surface:#ffffffF2;
  --line:#e8eef6;
  --shadow:0 10px 35px rgba(2,8,23,.10);

  padding: clamp(16px, 3vw, 28px);
  background:
    radial-gradient(850px 850px at -10% -10%, #eafcff 0%, transparent 60%),
    radial-gradient(900px 900px at 110% -5%, #ecfff8 0%, transparent 60%),
    #f6f9fc;
  min-height: 100%;
  font-family: "Poppins", sans-serif;
}

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

/* Header */
.top{ text-align:center; margin-bottom: 16px; }
.title{
  margin:0;
  color: var(--brand);
  font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
  display:inline-flex; align-items:center; gap:.5rem;
}
.title-icon{ font-size:1.2em; }
.subtitle{
  margin:.55rem auto 0;
  color:var(--muted);
  font-size: clamp(.98rem, 1.8vw, 1.05rem);
  max-width: 760px;
}

/* Highlights */
.highlights{
  display:grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 14px;
  margin-top: 18px;
}
.hl{
  background:#f8fafc;
  border:1px solid var(--line);
  border-radius:14px;
  padding:14px 12px;
  text-align:center;
  transition:.2s transform,.2s box-shadow;
}
.hl:hover{ transform:translateY(-4px); box-shadow:0 10px 18px rgba(2,8,23,.08); }
.hl-ico{ font-size:20px; margin-bottom:8px; }
.hl h3{ margin:0 0 6px; font-weight:700; color:var(--ink); font-size:1.05rem; }
.hl p{ margin:0; color:#5a6f86; font-size:.95rem; line-height:1.5; }

/* Divider */
.divider{ height:1px; background:linear-gradient(90deg,transparent,#dff7ff 20%,#dff7ff 80%,transparent); margin:18px 0 10px; }

/* Grid */
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fit,minmax(260px,1fr));
  gap: 16px;
  margin-top: 6px;
}
.block{
  background:#ffffff;
  border:1px solid var(--line);
  border-radius:14px;
  padding:14px 14px 16px;
}
.block h4{ margin:0 0 8px; color:var(--brand); font-weight:700; }
.block p{ color:#223044; line-height:1.65; margin:.35rem 0; }
.link{ color:var(--brand); text-decoration: none; border-bottom:1px dashed #96eefc; }
.link:hover{ color:#087d98; }

/* Checklist */
.checklist{ margin:0; padding-left: 1.2rem; }
.checklist li::marker{ color:var(--brand); }

/* CTA */
.cta{ display:flex; justify-content:center; margin-top: 20px; }
.btn-back{
  display:inline-flex; align-items:center; gap:.5rem;
  height: 36px; padding: 0 12px;
  font-size:.92rem; font-weight:700;
  color:#0a6f7c; text-decoration:none;
  background:#eaffff;
  border:1px solid #bff6ff;
  border-radius:10px;
  transition:.18s background,.18s transform;
}
.btn-back .chev{ width:18px; height:18px; color:#0dcaf0; }
.btn-back:hover{ background:#dffbff; transform:translateY(-1px); }

/* Anim */
@keyframes cardIn{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
</style>
