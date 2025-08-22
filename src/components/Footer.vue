<template>
  <footer class="footer">
    <div class="footer-content">
      <i class="bi bi-lightning-charge-fill icon"></i>
      <span class="text">© 2025 Adventur Manager System — Todos los derechos reservados</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  width: 100%;
  padding: 1.2rem 0;
  background: linear-gradient(135deg, #1e1e2f 0%, #2a2a3d 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
  /* SIN bordes redondeados */
  border-radius: 0;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.95rem;
  color: #d8e3ea;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.footer-content .icon {
  font-size: 1.2rem;
  color: #4fd1c5;
  filter: drop-shadow(0 0 2px rgba(79, 209, 197, 0.6));
}
</style>
