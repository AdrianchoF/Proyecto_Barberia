<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card class="notification-card success-theme">
      <div class="header-banner">
        <div class="status-icon">
          <i class="fa-solid fa-check-circle"></i>
        </div>
        <h2 class="status-title">¡CITA AGENDADA!</h2>
        <p class="status-message">{{ mensaje }}</p>
      </div>

      <v-card-text class="pa-8 text-center content-body">
        <div class="info-details mb-8">
            <i class="fa-solid fa-paper-plane mb-3"></i>
            <p class="text-body-1 opacity-70">Enviamos una confirmación por correo electrónico y SMS con todos los detalles de tu cita.</p>
        </div>
        
        <v-btn block color="#4caf50" size="x-large" @click="handleClose" class="btn-action">
          ENTENDIDO
          <i class="fa-solid fa-thumbs-up ml-3"></i>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  defineProps({
    modelValue: Boolean,
    mensaje: String
  })

  const emit = defineEmits(['update:modelValue', 'cerrar-todo'])

  function handleClose() {
    emit('update:modelValue', false)
    emit('cerrar-todo')
  }
</script>

<style scoped>
  .notification-card {
    background: rgba(15, 15, 15, 0.98) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 25px !important;
    font-family: 'Outfit', sans-serif;
    color: white !important;
    overflow: hidden;
  }

  .header-banner {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(0, 0, 0, 0));
    padding: 40px 30px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .status-icon {
    width: 80px;
    height: 80px;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: #4caf50;
    margin-bottom: 20px;
    box-shadow: 0 0 30px rgba(76, 175, 80, 0.2);
  }

  .status-title {
    font-size: 1.8rem !important;
    font-weight: 800;
    letter-spacing: 2px;
    color: #4caf50;
    margin-bottom: 10px;
  }

  .status-message {
    font-size: 1rem;
    opacity: 0.8;
  }

  .content-body {
    background: transparent;
  }

  .info-details i {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.2);
  }

  .btn-action {
    background: #4caf50 !important;
    color: white !important;
    font-weight: 800;
    letter-spacing: 1.5px;
    border-radius: 15px !important;
    height: 60px !important;
    box-shadow: 0 10px 20px rgba(76, 175, 80, 0.2) !important;
    transition: all 0.3s ease;
  }

  .btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(76, 175, 80, 0.4) !important;
  }
</style>