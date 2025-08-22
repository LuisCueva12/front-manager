<template>
  <section class="contact">
    <!-- Hero -->
    <header class="hero">
      <div class="hero__title">
        <i class="bi bi-envelope-paper-heart"></i>
        <h1>Contáctanos</h1>
      </div>
      <p class="hero__subtitle">
        ¿Tienes dudas, comentarios o necesitas soporte? Estamos aquí para ayudarte.
      </p>
      <div class="hero__chips">
        <button
          v-for="t in topics"
          :key="t.key"
          :class="['chip', { on: form.topic === t.key }]"
          @click="selectTopic(t.key)"
          type="button"
        >
          <i :class="`bi ${t.icon}`"></i> {{ t.label }}
        </button>
      </div>
    </header>

    <div class="wrap">
      <!-- Info -->
      <aside class="info glass">
        <h3><i class="bi bi-life-preserver"></i> Atención al cliente</h3>
        <p class="muted">
          Tiempo de respuesta promedio:
          <span class="hl">menos de 24 horas</span> en días hábiles.
        </p>

        <ul class="list">
          <li>
            <i class="bi bi-envelope-fill"></i>
            <a href="mailto:soporte@adventur.pe">soporte@adventur.pe</a>
            <button class="copy" @click="copy('soporte@adventur.pe')" title="Copiar">
              <i class="bi bi-clipboard"></i>
            </button>
          </li>
          <li>
            <i class="bi bi-telephone-fill"></i>
            <a href="tel:+51987654321">+51 987 654 321</a>
            <button class="copy" @click="copy('+51987654321')" title="Copiar">
              <i class="bi bi-clipboard"></i>
            </button>
          </li>
          <li>
            <i class="bi bi-geo-alt-fill"></i>
            Lima, Perú — GMT-5
          </li>
          <li>
            <i class="bi bi-clock-fill"></i>
            Lun a Vie — 9:00 a 18:00
          </li>
        </ul>

        <div class="cta">
          <button class="btn whats" @click="openWhatsApp">
            <i class="bi bi-whatsapp"></i> Hablar por WhatsApp
          </button>
          <a class="btn ghost" href="mailto:soporte@adventur.pe">
            <i class="bi bi-at"></i> Enviar email directo
          </a>
        </div>

        <div class="note">
          <i class="bi bi-shield-lock"></i>
          <small>
            Tus datos están protegidos. Consulta nuestra
            <router-link to="/privacidad">Política de Privacidad</router-link>.
          </small>
        </div>
      </aside>

      <!-- Form -->
      <form class="form glass" novalidate @submit.prevent="submit">
        <h3><i class="bi bi-pencil-square"></i> Envíanos un mensaje</h3>

        <div class="grid">
          <div class="field">
            <label>Nombre y Apellido</label>
            <input
              v-model.trim="form.name"
              type="text"
              inputmode="text"
              autocomplete="name"
              :class="{ invalid: errors.name }"
              @blur="touch('name')"
              placeholder="Tu nombre completo"
            />
            <small v-if="errors.name" class="error">{{ errors.name }}</small>
          </div>

          <div class="field">
            <label>Correo electrónico</label>
            <input
              v-model.trim="form.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              :class="{ invalid: errors.email }"
              @blur="touch('email')"
              placeholder="tucorreo@dominio.com"
            />
            <small v-if="errors.email" class="error">{{ errors.email }}</small>
          </div>

          <div class="field">
            <label>Teléfono (opcional)</label>
            <input
              v-model.trim="form.phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="+51 999 999 999"
            />
          </div>

          <div class="field">
            <label>Motivo</label>
            <select v-model="form.topic" :class="{ invalid: errors.topic }" @blur="touch('topic')">
              <option disabled value="">Selecciona un motivo…</option>
              <option v-for="t in topics" :key="t.key" :value="t.key">
                {{ t.label }}
              </option>
            </select>
            <small v-if="errors.topic" class="error">{{ errors.topic }}</small>
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label>Asunto</label>
            <input
              v-model.trim="form.subject"
              type="text"
              :placeholder="subjectPlaceholder"
              :class="{ invalid: errors.subject }"
              @blur="touch('subject')"
            />
            <small v-if="errors.subject" class="error">{{ errors.subject }}</small>
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label>Mensaje</label>
            <textarea
              ref="messageEl"
              v-model="form.message"
              rows="5"
              :maxlength="MAX_MESSAGE"
              :class="{ invalid: errors.message }"
              @input="autoResize"
              @blur="touch('message')"
              placeholder="Cuéntanos con detalle en qué podemos ayudarte…"
            />
            <div class="meta">
              <small :class="{ warn: remaining < 20 }">
                {{ remaining }} caracteres disponibles
              </small>
            </div>
            <small v-if="errors.message" class="error">{{ errors.message }}</small>
          </div>

          <!-- Adjuntos -->
          <div class="field" style="grid-column: 1 / -1;">
            <label>Adjuntar archivos (opcional)</label>
            <div class="uploader">
              <input
                id="file"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                @change="onFiles"
              />
              <label for="file" class="btn ghost">
                <i class="bi bi-paperclip"></i> Agregar adjuntos
              </label>
              <small class="muted">
                Máx. 3 archivos (JPG/PNG/PDF) — 5&nbsp;MB c/u
              </small>
            </div>

            <ul class="files" v-if="files.length">
              <li v-for="(f,i) in files" :key="i">
                <i class="bi" :class="fileIcon(f)"></i>
                <span class="name" :title="f.name">{{ f.name }}</span>
                <span class="size">{{ pretty(f.size) }}</span>
                <button type="button" class="remove" @click="removeFile(i)">
                  <i class="bi bi-x-lg"></i>
                </button>
              </li>
            </ul>
          </div>

          <div class="agree" style="grid-column: 1 / -1;">
            <label>
              <input type="checkbox" v-model="form.consent" />
              Acepto el uso de mis datos según la
              <router-link to="/privacidad">Política de Privacidad</router-link>.
            </label>
            <small v-if="errors.consent" class="error">{{ errors.consent }}</small>
          </div>
        </div>

        <div class="actions">
          <button
            class="btn primary"
            type="submit"
            :disabled="sending || !formValid"
          >
            <i v-if="!sending" class="bi bi-send-fill"></i>
            <i v-else class="bi bi-arrow-repeat spin"></i>
            {{ sending ? 'Enviando…' : 'Enviar mensaje' }}
          </button>

          <button type="button" class="btn ghost" @click="reset">
            <i class="bi bi-eraser"></i> Limpiar
          </button>
        </div>

        <!-- Éxito -->
        <transition name="fade">
          <div v-if="done" class="success">
            <div class="confetti"></div>
            <i class="bi bi-emoji-smile"></i>
            <h4>¡Mensaje enviado!</h4>
            <p>Tu ticket es <b>#{{ ticketId }}</b>. Te responderemos pronto.</p>
            <button class="btn ghost" @click="done = false">Enviar otro</button>
          </div>
        </transition>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Contacto',
  data() {
    return {
      MAX_MESSAGE: 1000,
      form: {
        name: '',
        email: '',
        phone: '',
        topic: '',
        subject: '',
        message: '',
        consent: false
      },
      topics: [
        { key: 'ventas',    label: 'Ventas y planes',    icon: 'bi-bag-check' },
        { key: 'tecnico',   label: 'Soporte técnico',    icon: 'bi-tools' },
        { key: 'facturas',  label: 'Facturación',        icon: 'bi-receipt-cutoff' },
        { key: 'socios',    label: 'Proveedores / B2B',  icon: 'bi-diagram-3' },
        { key: 'otros',     label: 'Otros',              icon: 'bi-chat-right-text' }
      ],
      files: [],
      errors: {},
      sentOnce: false,
      sending: false,
      done: false,
      ticketId: null
    };
  },
  computed: {
    subjectPlaceholder() {
      const map = {
        ventas:   'Quiero información sobre planes y precios',
        tecnico:  'Necesito ayuda técnica',
        facturas: 'Consulta de comprobantes / facturación',
        socios:   'Quiero ser proveedor / integrar servicios',
        otros:    'Otro motivo'
      };
      return map[this.form.topic] || 'Asunto del mensaje';
    },
    remaining() {
      return this.MAX_MESSAGE - (this.form.message?.length || 0);
    },
    formValid() {
      // Validación ligera para habilitar botón
      return (
        !this.sending &&
        this.form.name.trim().length >= 3 &&
        this.isEmail(this.form.email) &&
        this.form.topic &&
        this.form.subject.trim().length >= 6 &&
        this.form.message.trim().length >= 20 &&
        this.form.consent
      );
    }
  },
  mounted() {
    // Restaurar borrador
    const saved = localStorage.getItem('contact_draft');
    if (saved) {
      try { Object.assign(this.form, JSON.parse(saved)); } catch {}
    }
    this.$nextTick(this.autoResize);
  },
  watch: {
    form: {
      deep: true,
      handler(v) {
        localStorage.setItem('contact_draft', JSON.stringify(v));
      }
    }
  },
  methods: {
    // ---------- UI helpers ----------
    selectTopic(key) {
      this.form.topic = key;
      if (!this.sentOnce && !this.form.subject) {
        this.form.subject = this.subjectPlaceholder;
      }
    },
    autoResize() {
      const el = this.$refs.messageEl;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 500) + 'px';
    },
    copy(txt) {
      navigator.clipboard?.writeText(txt);
    },
    openWhatsApp() {
      const msg =
        `Hola Adventur, necesito ayuda.\n\n` +
        `Motivo: ${this.form.topic || 'consulta general'}\n` +
        `${this.form.subject ? 'Asunto: ' + this.form.subject + '\n' : ''}`;
      const url = `https://wa.me/51987654321?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener');
    },

    // ---------- Files ----------
    onFiles(e) {
      const incoming = Array.from(e.target.files || []);
      const current = [...this.files];
      const MAX_FILES = 3;
      const MAX_SIZE = 5 * 1024 * 1024;
      const allowed = ['image/jpeg','image/png','application/pdf'];

      for (const f of incoming) {
        if (current.length >= MAX_FILES) break;
        if (!allowed.includes(f.type) || f.size > MAX_SIZE) continue;
        current.push(f);
      }
      this.files = current;
      e.target.value = '';
    },
    fileIcon(f) {
      if (f.type === 'application/pdf') return 'bi-file-earmark-pdf';
      return 'bi-file-earmark-image';
    },
    removeFile(i) {
      this.files.splice(i,1);
    },
    pretty(bytes) {
      if (bytes < 1024) return bytes + 'B';
      const kb = bytes / 1024;
      if (kb < 1024) return kb.toFixed(1) + 'KB';
      return (kb/1024).toFixed(1) + 'MB';
    },

    // ---------- Validation ----------
    isEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    },
    touch(field) {
      // mensajes más claros
      switch (field) {
        case 'name':
          this.errors.name = this.form.name.trim().length >= 3
            ? '' : 'Por favor, escribe tu nombre.';
          break;
        case 'email':
          this.errors.email = this.isEmail(this.form.email)
            ? '' : 'Correo inválido.';
          break;
        case 'topic':
          this.errors.topic = this.form.topic ? '' : 'Selecciona un motivo.';
          break;
        case 'subject':
          this.errors.subject = this.form.subject.trim().length >= 6
            ? '' : 'El asunto debe tener al menos 6 caracteres.';
          break;
        case 'message':
          this.errors.message = this.form.message.trim().length >= 20
            ? '' : 'Cuéntanos con más detalle (mín. 20 caracteres).';
          break;
        case 'consent':
          this.errors.consent = this.form.consent ? '' : 'Debes aceptar la política para continuar.';
          break;
      }
    },
    validateAll() {
      ['name','email','topic','subject','message','consent'].forEach(this.touch);
      return Object.values(this.errors).every(v => !v);
    },

    // ---------- Submission ----------
    async submit() {
      this.sentOnce = true;
      if (!this.validateAll()) return;

      this.sending = true;
      this.done = false;

      // Construir payload
      const payload = {
        ...this.form,
        files: this.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      };

      try {
        // Intenta una API (si la tienes)
        const res = await Promise.race([
          fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }),
          // Timeout para no colgar UI
          new Promise((_ ,rej) => setTimeout(() => rej(new Error('timeout')), 7000))
        ]);

        if (!res || !res.ok) throw new Error('sin api');

        // Éxito real
        const data = await res.json().catch(() => ({}));
        this.ticketId = data.ticketId || Math.floor(100000 + Math.random()*900000);
        this.onSuccess();
      } catch (err) {
        // Fallback tasteful a mailto (usuario mantiene control)
        this.ticketId = Math.floor(100000 + Math.random()*900000);
        this.onSuccess(true);
      } finally {
        this.sending = false;
      }
    },
    onSuccess(openMail) {
      this.done = true;
      // limpiar borrador pero mantener el estado visual
      localStorage.removeItem('contact_draft');
      // Opcional: lanzar mailto con los datos si no hubo API real
      if (openMail) {
        const subject = `[Contacto] ${this.form.subject} · Ticket #${this.ticketId}`;
        const body = [
          `Nombre: ${this.form.name}`,
          `Email: ${this.form.email}`,
          `Teléfono: ${this.form.phone || '-'}`,
          `Motivo: ${this.form.topic}`,
          '',
          this.form.message
        ].join('\n');
        window.open(`mailto:soporte@adventur.pe?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
      // reset suave del form (conserva “done”)
      this.reset(false);
    },
    reset(hard = true) {
      this.files = [];
      this.errors = {};
      if (hard) this.done = false;
      this.form = {
        name: '',
        email: '',
        phone: '',
        topic: '',
        subject: '',
        message: '',
        consent: false
      };
      this.$nextTick(this.autoResize);
    }
  }
};
</script>

<style scoped>
/* Layout base */
.contact{
  padding: clamp(18px, 2.5vw, 28px);
  color:#0f2d36;
  --glass-bg: rgba(255,255,255,.78);
  --glass-brd: rgba(255,255,255,.6);
  --muted:#6b8793;
  --ink:#0b2a2e;
  --brand1:#10d2ff; --brand2:#14e6a8;
}

.hl{ color: var(--brand1); font-weight: 800; }
.muted{ color: var(--muted); }

.glass{
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border:1px solid var(--glass-brd);
  border-radius: 18px;
  box-shadow: 0 18px 60px rgba(0,0,0,.08), 0 2px 10px rgba(0,0,0,.04);
}

/* Hero */
.hero{
  text-align:center;
  margin: 6px auto 18px;
}
.hero__title{
  display:flex; align-items:center; justify-content:center; gap:.6rem;
  font-size: clamp(1.9rem, 3vw, 2.4rem); font-weight: 900;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero__title i{ font-size: 1.1em; }
.hero__subtitle{ color:#44616a; margin-top:.2rem; }
.hero__chips{
  display:flex; gap:.6rem; flex-wrap:wrap; justify-content:center;
  margin-top:12px;
}
.chip{
  border:none; border-radius:999px; padding:.35rem .85rem;
  background:#eafaff; color:#0b2a2e; cursor:pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,.06); font-weight:700;
}
.chip.on{ background: linear-gradient(135deg,var(--brand1),var(--brand2)); color:#06343a; }

/* Columns */
.wrap{
  display:grid; grid-template-columns: 1fr 1.35fr; gap: clamp(14px, 2vw, 24px);
  max-width: 1040px; margin: 0 auto;
}
@media (max-width: 880px){
  .wrap{ grid-template-columns: 1fr; }
}

/* Info card */
.info{ padding: 18px; }
.info h3{ font-weight: 800; display:flex; gap:.5rem; align-items:center; }
.list{ list-style:none; padding: 10px 0 0; margin:0; }
.list li{
  display:flex; align-items:center; gap:.6rem; margin: 8px 0; color:#22414b;
}
.list a{ color:inherit; text-decoration:none; border-bottom:1px dashed rgba(0,0,0,.15); }
.copy{
  margin-left:auto; border:none; background:transparent; cursor:pointer; color:#5c7b85;
}
.cta{ display:flex; gap:.6rem; margin-top:14px; flex-wrap:wrap; }
.btn{
  border:none; border-radius:12px; padding:.55rem .9rem; cursor:pointer;
  display:inline-flex; align-items:center; gap:.45rem; font-weight:800;
}
.btn.primary{
  background: linear-gradient(135deg,var(--brand1),var(--brand2)); color:#06343a;
}
.btn.ghost{
  background:#eefbff; color:#0b2a2e; box-shadow: 0 4px 10px rgba(0,0,0,.05);
}
.btn.whats{
  background:#25d366; color:#053a21;
}
.note{
  background:#f7fdff; border:1px dashed rgba(0,0,0,.06); border-radius:12px;
  padding:10px; margin-top:12px; color:#46606a;
}

/* Form */
.form{ padding: 18px; position:relative; overflow:hidden; }
.form h3{ font-weight:800; display:flex; align-items:center; gap:.55rem; margin-bottom:.6rem; }
.grid{
  display:grid; grid-template-columns: 1fr 1fr; gap:12px;
}
@media (max-width: 720px){ .grid{ grid-template-columns: 1fr; } }

.field label{ display:block; font-weight:700; margin-bottom:.35rem; }
.field input, .field select, .field textarea{
  width:100%; border-radius:12px; border:1px solid rgba(0,0,0,.08);
  background:#fff; padding:.62rem .8rem; color:#0b2a2e; outline:none;
  box-shadow: 0 4px 10px rgba(0,0,0,.04);
}
.field input:focus, .field select:focus, .field textarea:focus{
  border-color: var(--brand1); box-shadow: 0 0 0 3px rgba(16,210,255,.15);
}
.field .invalid{
  border-color:#f33; box-shadow: 0 0 0 3px rgba(255, 51, 51, .12);
}
.error{ color:#c2273d; }
.meta{ display:flex; justify-content:flex-end; margin-top:.2rem; }
.meta .warn{ color:#9b4d11; }

/* Uploader */
.uploader{ display:flex; align-items:center; gap:.6rem; }
.uploader input[type="file"]{ display:none; }
.files{ list-style:none; padding:6px 0 0; margin:0; display:grid; gap:6px; }
.files li{
  display:grid; grid-template-columns:auto 1fr auto auto; gap:.5rem; align-items:center;
  background:#f8fdff; border:1px solid rgba(0,0,0,.05); border-radius:10px; padding:.35rem .5rem;
}
.files .name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.files .size{ color:#6a8089; font-size:.85rem; }
.files .remove{ border:none; background:transparent; color:#6a8089; cursor:pointer; }

/* Agree */
.agree{ margin-top:4px; }
.agree label{ display:flex; gap:.45rem; align-items:flex-start; }
.agree input{ transform: translateY(2px); }

/* Actions */
.actions{
  display:flex; gap:.6rem; align-items:center; margin-top:10px; flex-wrap:wrap;
}
.btn .spin{ animation: spin 1s linear infinite; }
@keyframes spin { to{ transform: rotate(360deg); } }

/* Success */
.success{
  position:absolute; inset:0; background:rgba(255,255,255,.95);
  display:grid; place-items:center; text-align:center; padding:18px;
}
.success i{ font-size:3rem; color:#13d1bc; }
.success h4{ margin:.25rem 0; }
.confetti{
  position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(circle at 20% 30%, #ff8a00 3px, transparent 4px),
    radial-gradient(circle at 60% 20%, #10d2ff 3px, transparent 4px),
    radial-gradient(circle at 80% 40%, #14e6a8 3px, transparent 4px),
    radial-gradient(circle at 30% 70%, #ff5d73 3px, transparent 4px),
    radial-gradient(circle at 70% 80%, #ffd66e 3px, transparent 4px);
  animation: pop 1.4s ease forwards;
  opacity:0;
}
@keyframes pop { 30%{opacity:1} 100%{opacity:0; transform: scale(1.08)} }

/* Transitions */
.fade-enter-active,.fade-leave-active{ transition: opacity .2s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }
</style>
