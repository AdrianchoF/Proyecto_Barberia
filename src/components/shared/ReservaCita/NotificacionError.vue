<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card class="notification-card error-theme">
      <!-- Header Banner -->
      <div class="header-banner">
        <div class="status-icon">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>
        <h2 class="status-title">LO SENTIMOS</h2>
        <p class="status-message">{{ mensaje }}</p>
      </div>

      <v-card-text class="pa-8 content-body">
        <!-- Alternativas de Horarios -->
        <div v-if="horariosAlternativos && horariosAlternativos.length > 0" class="mb-6">
          <h3 class="suggestion-label mb-3">
              <i class="fa-solid fa-clock mr-2"></i>
              OTRAS HORAS DISPONIBLES
          </h3>
          <div class="suggestions-grid">
            <div v-for="(horario, index) in horariosAlternativos.slice(0, 3)" :key="index" class="suggestion-chip">
              {{ horario }}
            </div>
          </div>
        </div>

        <!-- Alternativas de Barberos -->
        <div v-if="barberosAlternativos && barberosAlternativos.length > 0" class="mb-8">
          <h3 class="suggestion-label mb-3">
              <i class="fa-solid fa-users mr-2"></i>
              PROFESIONALES DISPONIBLES
          </h3>
          <div class="suggestions-grid">
            <div v-for="(barbero, index) in barberosAlternativos.slice(0, 3)" :key="index" class="suggestion-chip highlight">
              {{ barbero }}
            </div>
          </div>
        </div>

        <v-btn block color="#ee6f38" size="x-large" @click="$emit('update:modelValue', false)" class="btn-action">
          ENTENDIDO
          <i class="fa-solid fa-rotate-left ml-3"></i>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  defineProps({
    modelValue: Boolean,
    mensaje: String,
    horariosAlternativos: Array,
    barberosAlternativos: Array
  })

  defineEmits(['update:modelValue'])
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
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.2), rgba(0, 0, 0, 0));
    padding: 40px 30px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .status-icon {
    width: 80px;
    height: 80px;
    background: rgba(211, 47, 47, 0.1);
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: #f44336;
    margin-bottom: 20px;
    box-shadow: 0 0 30px rgba(211, 47, 47, 0.2);
  }

  .status-title {
    font-size: 1.8rem !important;
    font-weight: 800;
    letter-spacing: 2px;
    color: #f44336;
    margin-bottom: 10px;
  }

  .status-message {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .suggestion-label {
    font-size: 0.75rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .suggestions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .suggestion-chip {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 15px;
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    flex: 1;
    min-width: 120px;
    text-align: center;
  }

  .suggestion-chip.highlight {
    border-color: rgba(238, 111, 56, 0.3);
    color: #ee6f38;
  }

  .btn-action {
    background: #ee6f38 !important;
    color: white !important;
    font-weight: 800;
    letter-spacing: 1.5px;
    border-radius: 15px !important;
    height: 60px !important;
    box-shadow: 0 10px 20px rgba(238, 111, 56, 0.2) !important;
    transition: all 0.3s ease;
  }

  .btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(238, 111, 56, 0.4) !important;
  }
</style>