<template>
  <div class="chatbot">
    <!-- FAB -->
    <button class="chat-fab" @click="toggle" :aria-label="open ? 'Cerrar chat' : 'Abrir chat'">
      <i class="bi" :class="open ? 'bi-x' : 'bi-chat-dots-fill'"></i>
    </button>

    <!-- Panel -->
    <transition name="slide-up">
      <section v-if="open" class="chat-panel" role="dialog" aria-label="Chat de ayuda">
        <header class="chat-header">
          <div class="chat-title">
            <i class="bi bi-robot"></i>
            <span>Adventur · Asistente</span>
          </div>
          <button class="icon-btn" @click="toggle" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
        </header>

        <div class="chat-body" ref="scrollEl">
          <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
            <div class="bubble">
              <!-- Usamos HTML ya procesado, sin markdown -->
              <p v-html="m.html"></p>

              <div v-if="m.actions?.length" class="actions">
                <button
                  v-for="(a, j) in m.actions"
                  :key="j"
                  class="action-btn"
                  @click="handleAction(a)"
                  type="button"
                >
                  <i v-if="a.icon" :class="`bi ${a.icon}`"></i> {{ a.label }}
                </button>
              </div>

              <small class="time">{{ m.time }}</small>
            </div>
          </div>

          <div v-if="typing" class="msg bot">
            <div class="bubble typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Sugerencias -->
        <div class="chips">
          <button v-for="(c, i) in quickChips" :key="i" class="chip" @click="useChip(c)" type="button">
            <i :class="`bi ${c.icon}`"></i> {{ c.label }}
          </button>
        </div>

        <footer class="chat-input">
          <i class="bi bi-lightning-charge atajo" title="Sugerencia" @click="insertHint"></i>
          <div class="textbox">
            <textarea
              v-model="draft"
              rows="1"
              placeholder="Pregunta sobre el sistema (módulos, acceso, seguridad, soporte)…"
              @keydown.enter.prevent="maybeSend"
              @keydown.shift.enter.stop
            />
            <button class="send-btn" :disabled="sending || !trimmed" @click="send" type="button">
              <i class="bi" :class="sending ? 'bi-hourglass-split' : 'bi-send-fill'"></i>
            </button>
          </div>
        </footer>

        <div class="note">
          <i class="bi bi-info-circle"></i>
          Respondo dudas del <span class="hl">sistema</span>. Para acciones (reservas/facturas) inicia sesión.
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
const CHAT_KEY = 'adventur_chat';
const CHAT_VER = '2'; // si cambias respuestas/estilo, sube versión para limpiar

export default {
  name: 'ChatWidget',
  data() {
    return {
      open: false,
      draft: '',
      sending: false,
      typing: false,
      messages: [],
      USE_API: false,
      ENDPOINT: '/api/chat',
      quickChips: [
        { label: '¿Qué módulos hay?',     text: '¿Qué módulos tiene el sistema y para qué sirve cada uno?', icon: 'bi-grid' },
        { label: 'Crear cuenta',          text: '¿Cómo me registro y confirmo el correo?', icon: 'bi-person-plus' },
        { label: 'Olvidé mi clave',       text: 'Olvidé mi contraseña ¿cómo la recupero?', icon: 'bi-key' },
        { label: 'Seguridad y datos',     text: '¿Cómo protegen mis datos y qué normas cumplen?', icon: 'bi-shield-lock' },
        { label: 'Soporte y contacto',    text: '¿Cómo contacto con soporte?', icon: 'bi-headset' },
      ],
    };
  },
  computed: {
    trimmed() { return this.draft.trim(); },
    isAuth() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return !!token;
    },
  },
  mounted() {
    // Limpieza por versión (borra mensajes viejos con asteriscos)
    if (localStorage.getItem(`${CHAT_KEY}_ver`) !== CHAT_VER) {
      localStorage.removeItem(CHAT_KEY);
      localStorage.setItem(`${CHAT_KEY}_ver`, CHAT_VER);
    }
    this.restore();
    if (this.messages.length === 0) this.welcome();
  },
  methods: {
    toggle() {
      this.open = !this.open;
      if (!this.open) this.resetConversation(); // al cerrar, resetea
      else if (this.messages.length === 0) this.welcome();
    },

    // ========== Conversación ==========
    welcome() {
      this.pushBot(
        '¡Hola! 👋 Soy tu asistente de <span class="hl">Adventur</span>. ' +
        'Te ayudo con <span class="hl">módulos</span>, <span class="hl">registro y acceso</span>, ' +
        '<span class="hl">seguridad</span> y <span class="hl">soporte</span>. ' +
        '¿En qué te ayudo?'
      );
    },
    resetConversation() {
      this.messages = [];
      localStorage.removeItem(CHAT_KEY);
    },

    now() {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    // Procesamos a HTML (listas + enlaces + resaltado de keywords)
    toHTML(text) {
      // Escapar
      let safe = String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // URL → enlace
      safe = safe.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Listas simples
      const lines = safe.split(/\n/);
      let out = '', inList = false;
      for (const line of lines) {
        if (/^\s*[-•]\s+/.test(line)) {
          if (!inList) { out += '<ul class="ul-clean">'; inList = true; }
          out += `<li>${line.replace(/^\s*[-•]\s+/, '')}</li>`;
        } else {
          if (inList) { out += '</ul>'; inList = false; }
          out += line + '<br>';
        }
      }
      if (inList) out += '</ul>';

      // Resaltar keywords comunes sin asteriscos
      const kws = [
        'módulos','registro','acceso','seguridad','soporte','planes','precios',
        'contacto','términos','privacidad','ayuda','login','iniciar sesión',
        'recuperar','cuenta'
      ];
      const rx = new RegExp(`\\b(${kws.join('|')})\\b`, 'gi');
      out = out.replace(rx, '<span class="hl">$1</span>');

      return out;
    },
    pushBot(content, actions = []) {
      this.messages.push({ role: 'bot', html: this.toHTML(content), actions, time: this.now() });
      this.$nextTick(this.scrollToEnd);
      this.persist();
    },
    pushUser(content) {
      this.messages.push({ role: 'user', html: this.toHTML(content), time: this.now() });
      this.$nextTick(this.scrollToEnd);
      this.persist();
    },
    scrollToEnd() {
      const el = this.$refs.scrollEl;
      if (el) el.scrollTop = el.scrollHeight;
    },
    persist() {
      localStorage.setItem(CHAT_KEY, JSON.stringify(this.messages));
    },
    restore() {
      const saved = localStorage.getItem(CHAT_KEY);
      if (saved) {
        try { this.messages = JSON.parse(saved); this.$nextTick(this.scrollToEnd); } catch {}
      }
    },

    insertHint() {
      if (!this.draft) this.draft = '¿Qué módulos tiene el sistema y para qué sirve cada uno?';
    },
    useChip(c) {
      this.draft = c.text;
      this.send();
    },
    maybeSend(e) {
      if (e.shiftKey) return;
      this.send();
    },

    async send() {
      const text = this.trimmed;
      if (!text || this.sending) return;

      this.pushUser(text);
      this.draft = '';
      this.sending = true;
      this.typing = true;

      try {
        let reply = ''; let actions = [];
        if (this.USE_API) {
          const res = await fetch(this.ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: this.messages.map(m => ({ role: m.role, content: m.html })) })
          });
          if (!res.ok) throw new Error('Error del servidor');
          const data = await res.json();
          reply = data.reply || 'Lo siento, no pude procesar tu solicitud.';
        } else {
          ({ reply, actions } = this.answerSystemOnly(text));
        }
        this.pushBot(reply, actions);
      } catch {
        this.pushBot('⚠️ Ocurrió un problema al responder. Inténtalo nuevamente.');
      } finally {
        this.sending = false;
        this.typing = false;
      }
    },

    // --------- Solo dudas del sistema ----------
    answerSystemOnly(q) {
      const t = q.toLowerCase();

      const wantBooking = /reserv|pagar|factur|bolet|comprob|crear tour|crear hotel|publicar/i.test(t);
      const wantProfile = /mi\s*cuenta|perfil|cambiar contraseña|actualizar datos|notific/i.test(t);
      const askModules  = /(módul|modul|qué incluye|funciona el sistema)/i.test(t);
      const askPricing  = /(precio|plan|costo|suscripc)/i.test(t);
      const askSecurity = /(seguridad|datos|privacidad|protege|gdpr|norma|ley)/i.test(t);
      const askSupport  = /(soporte|contacto|ayuda|ticket|whatsapp|correo)/i.test(t);
      const askAccount  = /(registr|crear cuenta|abrir cuenta|confirmar correo|verificar)/i.test(t);
      const askAccess   = /(iniciar sesión|login|entrar|no puedo entrar|olvidé mi contraseña|recuperar)/i.test(t);
      const askNav      = /(dónde|donde|en qué sección|navegar|ir a)/i.test(t);

      if (!this.isAuth && (wantBooking || wantProfile)) {
        return {
          reply: 'Para realizar <b>acciones</b> (reservas, pagos, facturación o edición de perfil) debes <b>iniciar sesión</b>.',
          actions: [
            { label: 'Iniciar sesión', to: '/login',     icon: 'bi-box-arrow-in-right' },
            { label: 'Crear cuenta',   to: '/registro',  icon: 'bi-person-plus' }
          ]
        };
      }

      if (askModules) {
        return {
          reply:
`Estos son los módulos principales:
- Hoteles: disponibilidad, reservas y tarifas.
- Tours: publica experiencias y controla cupos.
- Proveedores: partners y servicios conectados.
- Calculadora: costos, márgenes y utilidades.
- Usuarios: roles, permisos y equipo.
- Dashboard: métricas y actividad.`,
          actions: [
            { label: 'Centro de Ayuda', to: '/ayuda',     icon: 'bi-question-circle' },
            { label: 'Sobre Nosotros',  to: '/nosotros',  icon: 'bi-people' }
          ]
        };
      }

      if (askPricing) {
        return {
          reply: 'Los planes dependen del tamaño del equipo y del volumen de uso. Solicita una propuesta desde Contacto.',
          actions: [
            { label: 'Contacto', to: '/contacto', icon: 'bi-envelope' },
            { label: 'Términos', to: '/terminos', icon: 'bi-file-earmark-text' }
          ]
        };
      }

      if (askSecurity) {
        return {
          reply:
`Sobre seguridad:
- Cifrado HTTPS y contraseñas con hashing.
- Control de roles y permisos.
- Políticas de privacidad claras.`,
          actions: [
            { label: 'Privacidad', to: '/privacidad', icon: 'bi-shield-lock' },
            { label: 'Términos',   to: '/terminos',   icon: 'bi-file-earmark-text' }
          ]
        };
      }

      if (askSupport) {
        return {
          reply: 'Para soporte: revisa el Centro de Ayuda o escríbenos desde Contacto.',
          actions: [
            { label: 'Centro de Ayuda', to: '/ayuda',    icon: 'bi-question-circle' },
            { label: 'Contacto',        to: '/contacto', icon: 'bi-envelope' }
          ]
        };
      }

      if (askAccount) {
        return {
          reply:
`Para crear cuenta:
1) Ve a Registro y completa tus datos.
2) Confirma tu correo.
3) Inicia sesión y sigue el onboarding.`,
          actions: [
            { label: 'Registrarme', to: '/registro', icon: 'bi-person-plus' },
            { label: 'Ayuda',       to: '/ayuda',    icon: 'bi-question-circle' }
          ]
        };
      }

      if (askAccess) {
        return {
          reply: 'Para iniciar sesión usa tu correo y contraseña. Si olvidaste la clave, recupérala con tu correo.',
          actions: [
            { label: 'Iniciar sesión',  to: '/login',     icon: 'bi-box-arrow-in-right' },
            { label: 'Recuperar clave', to: '/recuperar', icon: 'bi-key' }
          ]
        };
      }

      if (askNav) {
        return {
          reply: '¿A dónde quieres ir?',
          actions: [
            { label: 'Ayuda',      to: '/ayuda',      icon: 'bi-question-circle' },
            { label: 'Nosotros',   to: '/nosotros',   icon: 'bi-people' },
            { label: 'Términos',   to: '/terminos',   icon: 'bi-file-earmark-text' },
            { label: 'Privacidad', to: '/privacidad', icon: 'bi-shield-lock' },
            { label: 'Contacto',   to: '/contacto',   icon: 'bi-envelope' }
          ]
        };
      }

      if (!this.isAuth && /tour|hotel|proveedor|reserva|pago|factur|bole|comprob/i.test(t)) {
        return {
          reply: 'Puedo darte información del sistema. Para ejecutar acciones (reservas, pagos o facturación) inicia sesión.',
          actions: [
            { label: 'Iniciar sesión', to: '/login',    icon: 'bi-box-arrow-in-right' },
            { label: 'Crear cuenta',   to: '/registro', icon: 'bi-person-plus' },
            { label: 'Ver Ayuda',      to: '/ayuda',    icon: 'bi-question-circle' }
          ]
        };
      }

      return {
        reply:
`Puedo ayudarte con información del sistema (módulos, registro, acceso, seguridad, soporte).
Prueba con:
- “¿Qué módulos tiene el sistema?”
- “Olvidé mi contraseña”
- “¿Cómo me registro?”`,
        actions: [
          { label: 'Centro de Ayuda', to: '/ayuda',      icon: 'bi-question-circle' },
          { label: 'Términos',        to: '/terminos',   icon: 'bi-file-earmark-text' },
          { label: 'Privacidad',      to: '/privacidad', icon: 'bi-shield-lock' }
        ]
      };
    },

    handleAction(a) {
      if (a.to) this.$router.push(a.to);
      if (a.href) window.open(a.href, '_blank', 'noopener');
    },
  }
};
</script>

<style scoped>
/* FAB */
.chat-fab{
  position: fixed; right: 18px; bottom: 18px; z-index: 1100;
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg,#10d2ff,#14e6a8);
  color:#0b2a2e; border:none;
  box-shadow: 0 12px 28px rgba(16,210,255,.35);
  display:grid; place-items:center; font-size:1.35rem; cursor:pointer;
  transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
}
.chat-fab:hover{ transform: translateY(-1px); filter: brightness(.98); }

/* Panel */
.chat-panel{
  position: fixed; right: 18px; bottom: 84px; z-index: 1100;
  width: min(380px, 92vw); height: 560px; display:flex; flex-direction:column;
  background: rgba(255,255,255,.78);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 20px; overflow:hidden;
  border:1px solid rgba(255,255,255,.6);
  box-shadow: 0 18px 60px rgba(0,0,0,.18), 0 2px 10px rgba(0,0,0,.08);
}

/* Header */
.chat-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 14px;
  background: linear-gradient(135deg,#10d2ff,#14e6a8);
  color:#06343a; font-weight: 800;
}
.chat-title{ display:flex; align-items:center; gap:.55rem; }
.icon-btn{ background:transparent; color:#06343a; border:none; font-size:1.05rem; cursor:pointer; }

/* Body */
.chat-body{
  flex:1; overflow:auto; padding:14px;
  background: linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.35));
}
.msg{ display:flex; margin:10px 0; }
.msg .bubble{
  max-width:86%; padding:12px 14px; border-radius:14px; position:relative;
  box-shadow:0 6px 18px rgba(0,0,0,.06);
}
.msg.user{ justify-content:flex-end; }
.msg.user .bubble{ background:#e6fbff; color:#0b2a2e; border-top-right-radius:6px; }
.msg.bot .bubble{ background:#ffffff; color:#21313a; border-top-left-radius:6px; }
.time{ display:block; margin-top:4px; opacity:.55; font-size:.75rem; }

/* typing */
.typing{ display:inline-flex; gap:4px; }
.dot{ width:6px; height:6px; border-radius:50%; background:#8aa3ad; animation:blink 1s infinite; }
.dot:nth-child(2){ animation-delay:.2s; } .dot:nth-child(3){ animation-delay:.4s; }
@keyframes blink{ 0%,80%,100%{ opacity:.35 } 40%{ opacity:1 } }

/* acciones */
.actions{ display:flex; flex-wrap:wrap; gap:.45rem; margin-top:.6rem; }
.action-btn{
  background:#0dcaf0; color:#06343a; border:none; border-radius:999px; padding:.38rem .75rem;
  font-size:.86rem; display:inline-flex; align-items:center; gap:.35rem; font-weight:700;
  box-shadow:0 6px 16px rgba(13,202,240,.28); cursor:pointer;
}
.action-btn:hover{ filter:brightness(.97); }
.ul-clean{ margin:.35rem 0 0 .6rem; padding:0; }
.ul-clean li{ margin:.15rem 0; }

/* chips */
.chips{
  display:flex; flex-wrap:wrap; gap:.5rem; padding:6px 12px 0;
  border-top:1px dashed rgba(0,0,0,.06);
}
.chip{
  border:none; border-radius:999px; padding:.28rem .7rem;
  background:#eefbff; color:#0b2a2e;
  font-size:.85rem; display:inline-flex; align-items:center; gap:.35rem; cursor:pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,.06);
}
.chip:hover{ filter:brightness(.98); }

/* Input */
.chat-input{
  display:flex; align-items:center; gap:.55rem; padding:10px 12px;
  border-top:1px solid rgba(0,0,0,.06);
}
.atajo{ color:#0aaed1; font-size:1.1rem; cursor:pointer; }
.textbox{
  flex:1; display:flex; align-items:center; background:#ffffff; border-radius:999px; padding:.2rem;
  border:1px solid rgba(0,0,0,.06); box-shadow: 0 4px 10px rgba(0,0,0,.04);
}
.textbox textarea{
  flex:1; resize:none; border:none; background:transparent;
  padding:.55rem .8rem; outline:none; font-size:.93rem; max-height:110px; min-height:38px; color:#0b2a2e;
}
.send-btn{
  background: linear-gradient(135deg,#10d2ff,#14e6a8);
  color:#06343a; border:none; padding:.45rem .7rem; border-radius:999px; margin-right:.15rem;
  font-weight:900; cursor:pointer; box-shadow:0 6px 16px rgba(16,210,255,.35);
}
.send-btn:disabled{ opacity:.6; cursor:not-allowed; }

.note{
  padding:8px 12px; font-size:.8rem; color:#33515a;
  border-top:1px dashed rgba(0,0,0,.06);
  background: rgba(255,255,255,.5);
}

/* highlight */
.hl{ color:#00bcd4; font-weight:800; }

/* Transition */
.slide-up-enter-active,.slide-up-leave-active{ transition: all .2s ease; }
.slide-up-enter-from,.slide-up-leave-to{ transform: translateY(8px); opacity:0; }
</style>
