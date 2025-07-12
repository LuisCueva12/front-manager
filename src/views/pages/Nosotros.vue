<template>
  <div class="public-page">
    <h2>
      <i class="bi bi-people-fill"></i> Sobre Nosotros
    </h2>
    <p>
      Somos una plataforma de gestión de turismo pensada para facilitar tu trabajo con hoteles, tours y proveedores.
    </p>
    <router-link to="/" class="btn btn-info mt-4">
      <i class="bi bi-arrow-left"></i> Volver al inicio
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Nosotros'
}
</script>

<style scoped>
.public-page {
  max-width: 600px;
  margin: 40px auto;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(44, 62, 80, 0.09);
  padding: 2.5rem 1.5rem;
  color: #222;
  text-align: center;
}

.public-page h2 {
  margin-bottom: 1.2rem;
  font-size: 2rem;
  color: #0dcaf0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
}

.public-page p {
  font-size: 1.13rem;
  line-height: 1.6;
  color: #34495e;
}
</style>
