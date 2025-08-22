<template>
  <section class="privacy">
    <div class="card">
      <!-- Header -->
      <header class="top">
        <h2 class="title">
          <span class="title-icon" aria-hidden="true">🛡️</span>
          Política de Privacidad
        </h2>
        <p class="subtitle">
          Tus datos están seguros con nosotros. Conoce qué información tratamos, con qué fines
          y cuáles son tus derechos.
        </p>
      </header>

      <!-- Summary blocks -->
      <div class="highlights">
        <article class="hl">
          <div class="hl-ico" aria-hidden="true">🔒</div>
          <h3>Seguridad</h3>
          <p>Aplicamos medidas técnicas y organizativas alineadas a buenas prácticas (cifrado, control de acceso, backups).</p>
        </article>
        <article class="hl">
          <div class="hl-ico" aria-hidden="true">🎯</div>
          <h3>Finalidad</h3>
          <p>Usamos los datos solo para prestar y mejorar nuestros servicios turísticos, atención y comunicaciones necesarias.</p>
        </article>
        <article class="hl">
          <div class="hl-ico" aria-hidden="true">⏳</div>
          <h3>Conservación</h3>
          <p>Conservamos la información el tiempo imprescindible para la relación contractual y obligaciones legales.</p>
        </article>
      </div>

      <!-- Divider -->
      <div class="divider" aria-hidden="true"></div>

      <!-- Details -->
      <div class="grid">
        <div class="block">
          <h4>Qué datos tratamos</h4>
          <ul class="checklist">
            <li>Identificación y contacto (nombre, email, teléfono).</li>
            <li>Datos de reserva y preferencias de viaje.</li>
            <li>Datos de facturación requeridos por ley.</li>
            <li>Uso básico del sitio (logs y analítica anónima).</li>
          </ul>
        </div>

        <div class="block">
          <h4>Tus derechos</h4>
          <ul class="checklist">
            <li>Acceder, rectificar o eliminar tus datos.</li>
            <li>Portabilidad y limitación del tratamiento.</li>
            <li>Oponerte a comunicaciones no esenciales.</li>
            <li>Presentar una reclamación ante la autoridad competente.</li>
          </ul>
        </div>

        <div class="block">
          <h4>Base legal</h4>
          <p>Tratamos la información en base a la <strong>ejecución del servicio</strong>, tu <strong>consentimiento</strong> y el <strong>cumplimiento de obligaciones legales</strong>.</p>
          <p class="muted">No vendemos tus datos ni realizamos decisiones automatizadas con efectos jurídicos sobre ti.</p>
        </div>

        <div class="block">
          <h4>Contacto de privacidad</h4>
          <p>Si tienes dudas o deseas ejercer tus derechos, escríbenos a: <a class="link" href="mailto:privacidad@adventur.pe">privacidad@adventur.pe</a></p>
          <p class="muted">Responderemos lo antes posible.</p>
        </div>
      </div>

      <!-- CTAs -->
      <div class="cta">
        <router-link to="/" class="btn-back" aria-label="Volver al inicio">
          <svg class="chev" viewBox="0 0 24 24" fill="none">
            <path d="M15 18 9 12l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al inicio
        </router-link>

        <a
          class="btn-outline"
          href="#"
          @click.prevent
          title="Abrir versión completa (PDF)"
        >
          Ver política completa
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default { name: 'Privacidad' }
</script>

<style scoped>
/* ===== Base & tokens (alineado al estilo de “Nosotros”) ===== */
.privacy{
  --ink:#0f172a;
  --muted:#475569;
  --brand:#08c7e8;
  --brand-2:#00e5ff;
  --surface:#ffffffF2;
  --line:#e8eef6;
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

/* Card container */
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
  color:#0dcfe9;
  font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
  display:inline-flex; align-items:center; gap:.5rem;
}
.title-icon{ font-size:1.1em; filter: drop-shadow(0 6px 12px rgba(0,229,255,.35)); }
.subtitle{
  margin:.55rem auto 0;
  color:var(--muted);
  font-size: clamp(.98rem, 1.8vw, 1.05rem);
  max-width: 760px;
}

/* Highlights row */
.highlights{
  display:grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: clamp(10px, 2vw, 14px);
  margin-top: 14px;
}
.hl{
  background:#f8fafc;
  border:1px solid var(--line);
  border-radius:14px;
  padding:14px 12px;
  text-align:center;
  transition:.2s transform,.2s box-shadow,.2s border-color,.2s background;
}
.hl:hover{ transform:translateY(-4px); background:#fff; box-shadow:0 12px 24px rgba(2,8,23,.08); border-color:#cfefff; }
.hl-ico{ font-size:20px; margin-bottom:8px; }
.hl h3{ margin:0 0 6px; font-weight:800; color:var(--ink); font-size:1.05rem; }
.hl p{ margin:0; color:#5a6f86; font-size:.95rem; line-height:1.5; }

/* Divider */
.divider{ height:1px; background:linear-gradient(90deg,transparent,#dff7ff 20%,#dff7ff 80%,transparent); margin:18px 0 10px; }

/* Grid details */
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fit,minmax(260px,1fr));
  gap: clamp(12px, 2vw, 18px);
  margin-top: 6px;
}
.block{
  background:#ffffff;
  border:1px solid var(--line);
  border-radius:14px;
  padding:14px 14px 16px;
}
.block h4{ margin:0 0 8px; color:#0aa6c7; font-weight:800; }
.block p{ color:#223044; line-height:1.65; margin:.35rem 0; }
.muted{ color:#64748b; font-size:.93rem; }
.link{ color:#0aa6c7; text-decoration: none; border-bottom:1px dashed #96eefc; }
.link:hover{ color:#087d98; }

/* Checklist */
.checklist{ margin:0; padding-left: 1.2rem; }
.checklist li{
  margin:.32rem 0;
  color:#394b63;
  line-height:1.55;
  position:relative;
}
.checklist li::marker{ color:#13c2df; }

/* CTAs */
.cta{
  display:flex; gap:10px; justify-content:center;
  margin-top: 18px;
  flex-wrap: wrap;
}
.btn-back{
  display:inline-flex; align-items:center; gap:.5rem;
  height: 38px; padding: 0 13px;
  font-size:.94rem; font-weight:700;
  color:#0a6f7c; text-decoration:none;
  background:#eaffff;
  border:1px solid #bff6ff;
  border-radius:12px;
  box-shadow: 0 6px 16px rgba(0, 205, 255, .18) inset, 0 4px 12px rgba(2, 8, 23, .06);
  transition:.18s transform,.18s box-shadow,.18s background,.18s color,.18s border-color;
}
.btn-back .chev{ width:18px; height:18px; color:#0aa6c7; }
.btn-back:hover{ background:#dffbff; border-color:#96eefc; transform:translateY(-1px); box-shadow:0 7px 18px rgba(0,205,255,.22) inset, 0 6px 16px rgba(2,8,23,.08); }
.btn-back:focus-visible{ box-shadow: var(--ring); }

.btn-outline{
  display:inline-flex; align-items:center; justify-content:center;
  height: 38px; padding: 0 12px;
  font-size:.94rem; font-weight:700;
  color:#0aa6c7; text-decoration:none;
  border:1px dashed #9aeaf7; border-radius:12px;
  background:#ffffff;
  transition:.18s background,.18s color,.18s border-color,.18s transform;
}
.btn-outline:hover{ background:#f0fdff; border-color:#63def1; transform:translateY(-1px); }

/* Animations & responsive */
@keyframes cardIn{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }

@media (max-width:640px){
  .subtitle{ text-align:left; }
}
</style>
