<template>
  <footer class="footer bg-dark text-light text-center">
    <p class="mb-0 d-flex justify-content-center align-items-center py-3">
      <i class="bi bi-lightning-charge-fill me-2 text-info fs-5"></i>
      <span class="fw-semibold">© 2025 Adventur Manager System - Todos los derechos reservados</span>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  position: relative;
  width: 100%;
  bottom: 0;
  background-image: linear-gradient(180deg, rgba(26,188,156,0.08) 0%, rgba(44,62,80,0.85) 100%);
  border-top: 1px solid #34495e;
  box-shadow: 0 -4px 24px rgba(44, 62, 80, 0.12);
  backdrop-filter: blur(6px);
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  font-size: 0.95rem;
  letter-spacing: 0.4px;
}
</style>
