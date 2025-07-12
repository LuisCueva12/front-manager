<template>
  <aside class="sidebar">
    <h2 class="sidebar-title">
      <i class="bi bi-list-ul me-2"></i> Menú
    </h2>
    <ul class="nav-list">
      <li v-for="item in menuItems" :key="item.path">
        <router-link
          :to="item.path"
          class="nav-link"
          :class="{ active: $route.path === item.path }"
        >
          <i :class="['bi', item.icon, 'icon']"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      menuItems: [
        { label: 'Inicio', path: '/dashboard', icon: 'bi-house-door-fill' },
        { label: 'Hoteles', path: '/hoteles', icon: 'bi-building' },
        { label: 'Tours', path: '/tours', icon: 'bi-map' },
        { label: 'Proveedores', path: '/proveedores', icon: 'bi-truck' },
        { label: 'Usuarios', path: '/usuarios', icon: 'bi-person-fill' },
        { label: 'Roles', path: '/roles', icon: 'bi-shield-lock-fill' },
        { label: 'Calculadora', path: '/calculadora', icon: 'bi-calculator-fill' }
      ]
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #0e0e0e;
  color: #fff;
  padding: 36px 22px 24px 22px;
  box-shadow: 4px 0 24px rgba(0, 255, 255, 0.06);
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 2;
  border-right: 2px solid #00ffff33;
}

.sidebar-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00fff7;
  text-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 1.13rem;
  padding: 13px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  color: #ecf0f1;
  text-decoration: none;
  background: transparent;
  transition: 
    background 0.25s cubic-bezier(.4,0,.2,1),
    color 0.2s,
    box-shadow 0.2s,
    transform 0.18s;
  box-shadow: none;
  font-weight: 500;
  position: relative;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background: rgba(0, 255, 255, 0.08);
  color: #00fff7;
  transform: translateX(8px) scale(1.04);
  box-shadow: 0 4px 18px rgba(0, 255, 255, 0.1);
  border-left: 4px solid #00fff7;
}

.nav-link.active {
  background: linear-gradient(90deg, #00fff7 20%, #00bfa6 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 24px rgba(0, 255, 255, 0.3);
  transform: scale(1.06);
  border-left: 4px solid #ffffff;
}

.icon {
  font-size: 1.5em;
  filter: drop-shadow(0 2px 6px rgba(0, 255, 255, 0.1));
}

@media (max-width: 700px) {
  .sidebar {
    width: 100vw;
    border-radius: 0 0 24px 24px;
    padding: 18px 10px 10px 10px;
  }

  .sidebar-title {
    font-size: 1.1rem;
    margin-bottom: 18px;
  }

  .nav-link {
    font-size: 1rem;
    padding: 10px;
    margin-bottom: 8px;
  }
}
</style>
