<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- BRAND -->
    <header class="brand">
      <component
        :is="logoTo ? 'router-link' : (logoHref ? 'a' : 'div')"
        class="logo-wrap"
        :to="logoTo || undefined"
        :href="logoHref || undefined"
        :target="logoHref ? '_blank' : undefined"
        rel="noopener"
        aria-label="Inicio"
      >
        <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="logo" decoding="async" />
        <svg v-else class="logo" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stop-color="#1abc9c" />
              <stop offset="100%" stop-color="#34d399" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" rx="12" fill="#0f172a" />
          <path d="M12 48 28 26l7 9 7-9 16 22z" fill="url(#g)" />
          <circle cx="44" cy="20" r="4" fill="#22d3ee" />
        </svg>
      </component>

      <div class="brand-text" v-show="!collapsed">
        <div class="brand-title">System Adventur</div>
        <div class="brand-sub">Panel</div>
      </div>

      <button
        class="collapse-btn"
        type="button"
        :aria-label="collapsed ? 'Expandir menú' : 'Contraer menú'"
        @click="toggleCollapse"
        title="Contraer/Expandir"
      >
        <i :class="['bi', collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left']"></i>
      </button>
    </header>

    <!-- NAV -->
    <nav class="nav" aria-label="Navegación principal">
      <ul class="nav-list" role="list">
        <li v-for="item in menuItems" :key="item.key" class="nav-li">
          <router-link
            :to="item.to"
            class="nav-link"
            :class="{ active: isActive(item.to) }"
            :aria-current="isActive(item.to) ? 'page' : null"
            :title="collapsed ? item.label : null"
          >
            <span class="active-bar" aria-hidden="true"></span>
            <i :class="['bi', item.icon, 'icon']" aria-hidden="true"></i>
            <span class="label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="spacer" aria-hidden="true"></div>

    <!-- PROFILE -->
    <footer class="profile">
      <div class="avatar-wrap">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          alt="Foto de perfil"
          class="avatar"
          @error="onAvatarError"
        />
        <div v-else class="avatar fallback">{{ initials }}</div>
        <span class="status-dot" :class="user.online ? 'on' : 'off'"></span>
      </div>

      <div class="profile-info" v-show="!collapsed">
        <div class="name">{{ user.name || 'Usuario' }}</div>
        <div class="role">{{ user.role || '—' }}</div>
      </div>

      <router-link to="/perfil" class="profile-btn" :title="collapsed ? 'Perfil' : 'Configurar perfil'">
        <i class="bi bi-gear"></i>
      </router-link>
    </footer>
  </aside>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/services/api'

export default {
  name: 'Sidebar',
  props: {
    logoSrc: {
      type: String,
      default:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAPvmEcR8pCW17AuCDN56wrImLS2C9ntdX1w&s'
    },
    logoTo:   { type: String, default: '/dashboard' },
    logoHref: { type: String, default: '' }
  },
  data () {
    return {
      collapsed: false,
      // 👉 Enlazamos por NOMBRE de ruta para evitar errores
      menuItems: [
        { key: 'dashboard',   label: 'Inicio',       to: { name: 'Dashboard' },   icon: 'bi-house-door' },
        { key: 'hoteles',     label: 'Hoteles',      to: { name: 'Hoteles' },     icon: 'bi-building' },
        { key: 'tours',       label: 'Tours',        to: { name: 'Tours' },       icon: 'bi-map' },
        { key: 'destinos',    label: 'Destinos',     to: { name: 'Destinos' },    icon: 'bi-geo-alt' },
        { key: 'proveedores', label: 'Proveedores',  to: { name: 'Proveedores' }, icon: 'bi-truck' },
        { key: 'usuarios',    label: 'Usuarios',     to: { name: 'Usuarios' },    icon: 'bi-person' },
        { key: 'calc',        label: 'Calculadora',  to: { name: 'Calculadora' }, icon: 'bi-calculator' }
      ],
      user: { name: 'Usuario', role: '', avatar: '', online: true },
      unwatchAuth: null
    }
  },
  computed: {
    initials () {
      const p = (this.user.name || '').trim().split(/\s+/).slice(0,2)
      return p.map(s => s[0] || '').join('').toUpperCase() || 'U'
    }
  },
  mounted () {
    const saved = localStorage.getItem('sidebar:collapsed')
    if (saved != null) this.collapsed = saved === '1'
    if (window.matchMedia('(max-width: 1024px)').matches) this.collapsed = true

    const auth = useAuthStore()
    this.syncUser(auth.user)
    this.unwatchAuth = this.$watch(() => auth.user, (u) => this.syncUser(u), { deep: false })
  },
  beforeUnmount () { if (this.unwatchAuth) this.unwatchAuth() },
  methods: {
    toggleCollapse () {
      this.collapsed = !this.collapsed
      localStorage.setItem('sidebar:collapsed', this.collapsed ? '1' : '0')
    },
    // Soporta to por nombre o por path
    isActive (to) {
      const curr = this.$route
      if (to && typeof to === 'object' && to.name) return curr.name === to.name
      const path = typeof to === 'string' ? to : (to?.path || '')
      return curr.path === path || curr.path.startsWith(path + '/')
    },
    // Convierte rutas relativas a absolutas (avatar)
    toAbsoluteUrl (src) {
      if (!src) return ''
      if (/^https?:\/\//i.test(src)) return src
      const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '')
      if (src.startsWith('/')) return apiRoot + src
      return apiRoot + '/' + src
    },
    syncUser (u) {
      if (!u) return
      const raw = u.avatar || u.avatar_url || u.foto || ''
      this.user = {
        name:   u.name   || u.nombre || 'Usuario',
        role:   u.role   || u.rol    || '',
        avatar: this.toAbsoluteUrl(raw),
        online: true
      }
    },
    onAvatarError () {
      this.user = { ...this.user, avatar: '' }
    }
  }
}
</script>


<style scoped>
/* ===== Tokens ===== */
:host, .sidebar{
  --sb-bg-top:#161a28;
  --sb-bg-bot:#1b2031;
  --sb-text:#f2f6fb;
  --sb-text-dim:#c7d0db;
  --sb-muted:#9aa6b2;
  --sb-sep:rgba(255,255,255,.10);
  --sb-hover:rgba(255,255,255,.08);
  --sb-active:#2b3046;
  --sb-focus:rgba(45,212,191,.35);
  --sb-icon:#c0ccdc;
  --sb-accent:#1abc9c;
  --sb-accent-2:#22d3ee;
  --radius-lg:14px;
  --radius-md:10px;
  --item-h:56px;
  --icon-size:1.38rem;

  --logo-size:48px;
  --logo-size-sm:40px;
  --btn-size:36px;
  --btn-size-sm:30px;

  --sidebar-w: 296px;
  --sidebar-w-sm: 96px;
}

/* ===== Contenedor ===== */
.sidebar{
  width:var(--sidebar-w);
  min-height:100vh;
  background:linear-gradient(180deg,var(--sb-bg-top) 0%,var(--sb-bg-bot) 100%);
  color:var(--sb-text);
  padding:12px 12px 10px;
  border-right:1px solid var(--sb-sep);
  box-shadow:4px 0 16px rgba(0,0,0,.25);
  display:flex; flex-direction:column;
  transition:width .18s ease;
}
.sidebar.collapsed{ width:var(--sidebar-w-sm); }

/* ===== Brand: logo | textos | botón (derecha) ===== */
.brand{
  position:relative;            /* crea su propio contexto */
  isolation:isolate;            /* evita que elementos “pasen” visualmente */
  display:grid;
  grid-template-columns:auto 1fr auto;
  align-items:center;
  column-gap:5px;
  padding:5px 6px 12px;
  border-bottom:1px solid var(--sb-sep);
}
.logo-wrap{ display:flex; align-items:center; justify-content:center; z-index:2; }
.logo{
  width:var(--logo-size); height:var(--logo-size);
  border-radius:5px; object-fit:cover; display:block; background:#0f172a;
  box-shadow:none;                /* sin glow/sombra */
}
.brand-text{ display:flex; flex-direction:column; line-height:1.1; min-width:0; }
.brand-title{ color:var(--sb-text); font-size:1.06rem; font-weight:900; letter-spacing:.2px; }
.brand-sub{ color:var(--sb-muted); font-size:.8rem; margin-top:2px; }

/* Botón a la derecha, perfectamente centrado y sin invadir el logo */
.collapse-btn{
  justify-self:end; align-self:center;
  width:var(--btn-size); height:var(--btn-size);
  border-radius:12px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.04); /* leve fondo para que no parezca “traspasar” */
  color:#fff;
  display:grid; place-items:center; cursor:pointer;
  transition:background .15s, border-color .15s, transform .05s;
  z-index:1;                      /* por debajo del logo (que está en z=2) */
}
.collapse-btn i{ font-size:14px; line-height:0; }
.collapse-btn:hover{ background:rgba(255,255,255,.10); border-color:rgba(255,255,255,.26); }
.collapse-btn:active{ transform:translateY(1px); }

/* Colapsado: textos fuera, tamaños contenidos */
.sidebar.collapsed .brand-text{ display:none; }
.sidebar.collapsed .logo{ width:var(--logo-size-sm); height:var(--logo-size-sm); }
.sidebar.collapsed .collapse-btn{ width:var(--btn-size-sm); height:var(--btn-size-sm); }

/* ===== Navegación ===== */
.nav{ padding-top:10px; }
.nav-list{ list-style:none; margin:0; padding:0; }
.nav-li + .nav-li{ margin-top:8px; }

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: var(--item-h);
  padding: 0 22px 0 18px;
  border-radius: var(--radius-lg);
  color: var(--sb-text-dim);
  font-size: 1.08rem;
  text-decoration: none;
  outline: none;
  transition: background 0.15s, color 0.15s, transform 0.08s;
  box-shadow: none;
}

.icon {
  font-size: var(--icon-size);
  color: var(--sb-icon);
  min-width: 28px;
  transition: color 0.15s;
  z-index: 1;
}
.label {
  white-space: nowrap;
  font-weight: 600;
  font-size: 1.06rem;
  letter-spacing: .1px;
}

/* barra activa (expandido) */
.active-bar{
  content:"";
  position:absolute; left:8px; top:10px; bottom:10px; width:4px;
  background:transparent; border-radius:6px; opacity:0; transform:scaleY(.7);
  transition:opacity .15s, transform .15s, background .15s;
  z-index:0;
}
.nav-link:hover{
  background:var(--sb-hover);
  color:var(--sb-text);
  transform:translateX(2px);
}
.nav-link:hover .icon{ color:var(--sb-accent-2); }
.nav-link:hover .active-bar{ background:var(--sb-accent-2); opacity:1; transform:scaleY(1); }
.nav-link:focus-visible{ box-shadow:0 0 0 3px var(--sb-focus); }

.nav-link.active{
  background:var(--sb-active);
  color:var(--sb-text);
  font-weight:800;
}
.nav-link.active .icon{ color:var(--sb-accent); }
.nav-link.active .active-bar{
  background:linear-gradient(180deg,var(--sb-accent-2),var(--sb-accent));
  opacity:1; transform:scaleY(1);
}

/* ===== Modo barra (colapsado) — SIN sombras que tapen el ícono ===== */
.sidebar.collapsed .nav-link{
  justify-content:center;
  min-height:var(--item-h);
  padding:0;
  width:72px;
  margin-inline:auto;
  border-radius:16px;
  background:transparent; transform:none; box-shadow:none; /* ✅ sin sombra */
}
.sidebar.collapsed .nav-link .label{ display:none; }
.sidebar.collapsed .nav-link .active-bar{ display:none; }
/* Pastilla de fondo debajo del ícono y sin sombras */
.sidebar.collapsed .nav-link::before{
  content:""; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:40px; height:40px; border-radius:12px; background:transparent; z-index:0; box-shadow:none; /* ✅ */
}
.sidebar.collapsed .nav-link:hover::before{ background:var(--sb-hover); }
.sidebar.collapsed .nav-link.active::before{ background:var(--sb-active); }
.sidebar.collapsed .nav-link:hover .icon{ color:var(--sb-accent-2); }
.sidebar.collapsed .nav-link.active .icon{ color:var(--sb-accent); }

/* ===== Perfil ===== */
.spacer{ flex:1 1 auto; }
.profile{
  display:flex; align-items:center; gap:12px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.14);
  margin:12px 6px 6px; padding:12px;
  border-radius:var(--radius-lg);
}
.avatar-wrap{ position:relative; }
.avatar{
  width:44px; height:44px; border-radius:12px; object-fit:cover; display:block;
  box-shadow:none;
}
.fallback{
  width:44px; height:44px; border-radius:12px; background:#0f172a; color:#a7f3d0;
  font-weight:900; display:grid; place-items:center;
}
.status-dot{
  position:absolute; right:-2px; bottom:-2px; width:11px; height:11px; border-radius:50%;
  box-shadow:0 0 0 2px #121524;
}
.status-dot.on{ background:#22c55e; }
.status-dot.off{ background:#9ca3af; }

.profile-info{ min-width:0; }
.name{ color:var(--sb-text); font-weight:800; line-height:1.05; }
.role{ color:var(--sb-muted); font-size:.8rem; margin-top:2px; }

.profile-btn{
  margin-left:auto; width:34px; height:34px; border-radius:10px;
  display:grid; place-items:center; color:var(--sb-text);
  background:transparent; border:1px solid rgba(255,255,255,.18);
  transition:background .15s, border-color .15s;
  text-decoration:none;
}
.profile-btn:hover{ background:rgba(255,255,255,.10); border-color:rgba(255,255,255,.26); }

.sidebar.collapsed .profile{ flex-direction:column; align-items:center; gap:8px; }
.sidebar.collapsed .profile-info{ display:none; }
.sidebar.collapsed .profile-btn{ margin-left:0; }

/* ===== Responsive ===== */
@media (max-width: 1024px){
  .sidebar{ width:var(--sidebar-w-sm); }
  .sidebar .brand-text{ display:none; }
  .sidebar .nav-link{ justify-content:center; }
  .sidebar .nav-link .label{ display:none; }
  .sidebar .nav-link .active-bar{ display:none; }
  .sidebar .profile{ flex-direction:column; align-items:center; }
}
</style>
