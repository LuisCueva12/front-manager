<template>
  <div v-if="visible" class="toast-container" :class="type">
    <i class="bi me-2 icon" :class="icon"></i>
    <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'success' // 'success', 'error', 'info'
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      visible: true
    }
  },
  computed: {
    icon() {
      switch (this.type) {
        case 'success': return 'bi-check-circle-fill'
        case 'error': return 'bi-x-circle-fill'
        case 'info': return 'bi-info-circle-fill'
        default: return 'bi-info-circle'
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.visible = false
    }, this.duration)
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 0.95rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  animation: fadeSlide 0.4s ease-out;
  backdrop-filter: blur(4px);
  border: 1px solid transparent;
}

/* Estilos por tipo */
.toast-container.success {
  background: #2ecc71;
  border-color: #27ae60;
  box-shadow: 0 0 14px #2ecc7166;
}

.toast-container.error {
  background: #e74c3c;
  border-color: #c0392b;
  box-shadow: 0 0 14px #e74c3c66;
}

.toast-container.info {
  background: #3498db;
  border-color: #2980b9;
  box-shadow: 0 0 14px #3498db66;
}

.icon {
  font-size: 1.3rem;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
