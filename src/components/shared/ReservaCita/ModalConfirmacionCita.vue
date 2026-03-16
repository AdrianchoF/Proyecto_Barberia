<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="650" persistent>
    <v-card class="modal-confirmacion-card">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="icon-glow">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <div class="header-text">
            <h2 class="text-h5 font-weight-bold mb-0">CONFIRMAR RESERVA</h2>
            <p class="text-caption mb-0 opacity-70">Revisa los detalles finales antes de agendar</p>
          </div>
        </div>
        <v-btn icon variant="text" color="white" size="small" class="close-btn" @click="$emit('update:modelValue', false)">
          <i class="fa-solid fa-xmark"></i>
        </v-btn>
      </div>

      <!-- Contenido -->
      <v-card-text class="modal-body pa-8">
        <!-- Resumen de Servicios -->
        <div class="section-container mb-8">
          <h3 class="section-label mb-4">
            <i class="fa-solid fa-scissors mr-2"></i>
            Servicios Solicitados
          </h3>
          
          <div class="servicios-grid">
            <div v-for="servicio in servicios" :key="servicio.id" class="confirm-service-card">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <p class="service-name-mini mb-1">{{ servicio.nombre }}</p>
                  <span class="service-meta-mini">{{ servicio.duracionAprox }}</span>
                </div>
                <div class="text-right">
                  <p class="service-price-mini">{{ servicio.precio }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Global -->
          <div class="total-summary-card mt-4">
            <div class="summary-item">
              <span class="label">DURACIÓN TOTAL</span>
              <span class="value">{{ calcularDuracionTotal }}</span>
            </div>
            <div class="summary-item highlight">
              <span class="label">TOTAL ESTIMADO</span>
              <span class="value text-orange">{{ calcularPrecioTotal }}</span>
            </div>
          </div>
        </div>

        <!-- Info en dos columnas -->
        <v-row>
          <v-col cols="12" md="6">
            <div class="section-container h-100">
              <h3 class="section-label mb-4">
                <i class="fa-solid fa-user-tie mr-2"></i>
                Profesional
              </h3>
              <div class="info-card-minimal">
                <v-avatar size="50" class="border-orange mr-4">
                  <v-img :src="barbero.foto" :alt="barbero.nombre"></v-img>
                </v-avatar>
                <div>
                  <p class="label-tiny">BARBERO</p>
                  <p class="value-main">{{ barbero.nombre }} {{ barbero.apellido }}</p>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="section-container h-100">
              <h3 class="section-label mb-4">
                <i class="fa-solid fa-clock-rotate-left mr-2"></i>
                Programación
              </h3>
              <div class="info-card-minimal">
                <div class="date-time-box">
                  <p class="label-tiny">FECHA Y HORA</p>
                  <p class="value-main">{{ fecha }}</p>
                  <p class="value-highlight">{{ hora }}</p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Footer -->
      <v-divider color="rgba(255,255,255,0.05)"></v-divider>
      <v-card-actions class="pa-8">
        <v-btn variant="text" color="white" size="large" class="flex-1 btn-edit" @click="$emit('update:modelValue', false)">
          <i class="fa-solid fa-pen-to-square mr-2"></i>
          Editar
        </v-btn>
        <v-btn color="#ee6f38" size="large" class="flex-1 btn-confirm" @click="$emit('confirmar')">
          CONFIRMAR CITA
          <i class="fa-solid fa-check-double ml-3"></i>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    servicios: Array,
    barbero: Object,
    fecha: String,
    hora: String
  })

  defineEmits(['update:modelValue', 'confirmar'])

  const calcularPrecioTotal = computed(() => {
    if (!props.servicios || props.servicios.length === 0) return '$0.00'
    
    const total = props.servicios.reduce((sum, servicio) => {
      const precio = parseFloat(servicio.precio.replace(/[^0-9.-]+/g, '')) || 0
      return sum + precio
    }, 0)
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(total)
  })

  const calcularDuracionTotal = computed(() => {
    if (!props.servicios || props.servicios.length === 0) return '0 min'
    
    const totalMinutos = props.servicios.reduce((sum, servicio) => {
      const match = servicio.duracionAprox.match(/(\d+):(\d+):(\d+)/)
      if (match) {
        const horas = parseInt(match[1])
        const minutos = parseInt(match[2])
        return sum + (horas * 60) + minutos
      }
      return sum
    }, 0)
    
    const horas = Math.floor(totalMinutos / 60)
    const minutos = totalMinutos % 60
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`
    }
    return `${minutos}min`
  })
</script>

<style scoped>
  .modal-confirmacion-card {
    background: rgba(15, 15, 15, 0.98) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 25px !important;
    font-family: 'Outfit', sans-serif;
    color: white !important;
    overflow: hidden;
  }

  .modal-header {
    background: linear-gradient(to right, rgba(238, 111, 56, 0.15), rgba(0, 0, 0, 0));
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .icon-glow {
    width: 60px;
    height: 60px;
    background: rgba(238, 111, 56, 0.1);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #ee6f38;
    box-shadow: 0 0 20px rgba(238, 111, 56, 0.2);
  }

  .header-text h2 {
    letter-spacing: 2px;
    color: #ee6f38;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 50%;
  }

  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-body::-webkit-scrollbar {
    width: 4px;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .section-label {
    font-size: 0.85rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    display: flex;
    align-items: center;
  }

  .confirm-service-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 15px 20px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
  }

  .confirm-service-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(238, 111, 56, 0.3);
  }

  .service-name-mini {
    font-weight: 700;
    font-size: 1rem;
    color: white;
  }

  .service-meta-mini {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .service-price-mini {
    font-weight: 800;
    color: #ee6f38;
    font-size: 1.1rem;
  }

  .total-summary-card {
    background: rgba(238, 111, 56, 0.05);
    border: 1px solid rgba(238, 111, 56, 0.1);
    border-radius: 20px;
    padding: 20px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .summary-item .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1px;
  }

  .summary-item .value {
    font-weight: 700;
    color: white;
  }

  .summary-item.highlight {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .summary-item.highlight .value {
    font-size: 1.4rem;
    font-weight: 800;
  }

  .info-card-minimal {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    align-items: center;
  }

  .border-orange {
    border: 2px solid #ee6f38;
    padding: 2px;
  }

  .label-tiny {
    font-size: 0.65rem;
    font-weight: 800;
    color: #ee6f38;
    letter-spacing: 1px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .value-main {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0;
  }

  .value-highlight {
    font-size: 1.1rem;
    font-weight: 800;
    color: #ee6f38;
    margin-bottom: 0;
  }

  .btn-edit {
    font-weight: 700;
    letter-spacing: 1px;
    background: rgba(255, 255, 255, 0.05) !important;
    border-radius: 15px !important;
    height: 56px !important;
  }

  .btn-confirm {
    background: #ee6f38 !important;
    color: white !important;
    font-weight: 800;
    letter-spacing: 1.5px;
    border-radius: 15px !important;
    height: 56px !important;
    box-shadow: 0 10px 20px rgba(238, 111, 56, 0.2) !important;
  }

  .btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(238, 111, 56, 0.4) !important;
  }
</style>