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
  background: linear-gradient(180deg, #1e1e2f 0%, #2a2a3d 100%);
  color: #ffffff;
  padding: 36px 22px;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.25);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.sidebar-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e1eaf2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  font-size: 1.1rem;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 0;
  color: #ccd6dd;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  transform: translateX(4px);
}

.nav-link.active {
  background: #3a3f51;
  color: #ffffff;
  font-weight: 700;
  border-left: 4px solid #1abc9c;
  padding-left: 12px;
}

.icon {
  font-size: 1.4rem;
  color: #a5b5c5;
  transition: color 0.2s;
}

.nav-link:hover .icon,
.nav-link.active .icon {
  color: #1abc9c;
}

@media (max-width: 700px) {
  .sidebar {
    width: 100vw;
    padding: 18px 12px;
    border-radius: 0;
    min-height: auto;
  }

  .sidebar-title {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  .nav-link {
    font-size: 1rem;
    padding: 10px 14px;
  }
}
</style>
