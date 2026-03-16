<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <!-- 🔹 La card SIEMPRE está visible con layout flex -->
    <v-card class="detalle-card" elevation="0">
      <div class="header-receipt">
        <v-avatar size="100">
          <v-img src="/imagenes/logo/logo2.png" alt="Logo"></v-img>
        </v-avatar>
        <span class="shop-name">BARBERÍA STYLEHUB</span>
        <span class="shop-address">Calle 25 # 12-34 Barrio El Recreo, Montería</span>
      </div>

      <!-- 🔹 Contenedor con scroll para el contenido -->
      <v-card-text class="contenido-scroll">
        <!-- 🔹 Sección de Servicios Seleccionados -->
        <div class="mb-8">
          <h4 class="section-title">
            <i class="fa-solid fa-scissors"></i>
            Tus Servicios
          </h4>
          
          <div v-if="servicios && servicios.length > 0">
            <v-list class="servicios-list" density="compact">
              <v-list-item v-for="servicio in servicios" :key="servicio.id" class="servicio-item">
                <template v-slot:prepend>
                  <i class="fa-solid fa-check-circle text-orange mr-3" style="color: #ee6f38;"></i>
                </template>
                
                <v-list-item-title class="servicio-nombre-mini">
                  {{ servicio.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle class="servicio-meta-mini">
                  {{ servicio.precio }} • {{ servicio.duracionAprox }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <div class="resumen-total">
              <div class="resumen-row">
                <span class="resumen-label">Tiempo Total</span>
                <span class="resumen-value">{{ calcularDuracionTotal }}</span>
              </div>
              <div class="resumen-row mt-2 pt-2 border-top-dashed">
                <span class="resumen-label">Total a Pagar</span>
                <span class="total-value">{{ calcularPrecioTotal }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fa-solid fa-receipt" style="opacity: 0.4; color: white;"></i>
            <p style="opacity: 0.4; color: white;">Selecciona tus servicios para ver el detalle aquí</p>
          </div>
        </div>

        <!-- 🔹 Otras secciones (Barbero, Fecha, Hora) -->
        <div class="mb-8">
          <h4 class="section-title">
            <i class="fa-solid fa-user"></i>
            Profesional
          </h4>
          <div v-if="barbero" class="info-summary-card">
              <v-avatar size="45" class="border-orange-thin">
                <v-img :src="barbero.foto || barbero.fotoUrl || '/placeholder-barber.jpg'" :alt="barbero.nombre"></v-img>
              </v-avatar>
              <div class="summary-text">
                <span class="summary-label">Barbero</span>
                <p class="summary-value ma-0">{{ barbero.nombre }} {{ barbero.apellido || '' }}</p>
              </div>
              <i class="fa-solid fa-check text-orange"></i>
          </div>
          <div v-else class="text-caption text-white pl-2">
            Por seleccionar...
          </div>
        </div>

        <div class="mb-6">
          <h4 class="section-title">
            <i class="fa-solid fa-calendar-day"></i>
            Cita
          </h4>
          <div v-if="fecha && hora" class="info-summary-card">
              <div class="summary-text">
                <span class="summary-label">Fecha y Hora</span>
                <p class="summary-value ma-0">{{ fecha }}</p>
                <p class="summary-value text-orange ma-0">{{ hora }}</p>
              </div>
              <i class="fa-solid fa-clock text-orange"></i>
          </div>
          <div v-else class="text-caption text-white pl-2">
            Por seleccionar...
          </div>
        </div>
      </v-card-text>

      <!-- 🔹 Botón FIJO en la parte inferior -->
      <v-card-actions class="acciones-fijas">
        <v-btn block color="#ee6f38" size="x-large" :disabled="!habilitarBoton" @click="handleSiguiente" class="boton-accion">
          {{  TextoBtn  }}
          <i :class="`fa-solid ${ IconoBtn } ml-3`"></i>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    servicios: { type: Array, default: () => [] },
    barbero: { type: Object, default: null },
    fecha: { type: String, default: null },
    hora: { type: String, default: null },
    habilitarBoton: { type: Boolean, default: false },
    ultimoTab: { type: Boolean, default: false }
  })

  const emit = defineEmits(['siguiente-tab'])

  function handleSiguiente() { emit('siguiente-tab') }

  const TextoBtn = computed(() => props.ultimoTab ? 'Agendar cita' : 'Siguiente')
  const IconoBtn = computed(() => props.ultimoTab ? 'fa-check' : 'fa-arrow-right')

  const calcularPrecioTotal = computed(() => {
    if (!props.servicios || props.servicios.length === 0) return '$0.00'
    const total = props.servicios.reduce((sum, s) => {
      const p = parseFloat(String(s.precio).replace(/[^0-9.-]+/g, '')) || 0
      return sum + p
    }, 0)
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total)
  })

  const calcularDuracionTotal = computed(() => {
    if (!props.servicios || props.servicios.length === 0) return '0 min'
    const totalMinutos = props.servicios.reduce((sum, s) => {
      const match = String(s.duracionAprox || s.tiempo_estimado || '').match(/(\d+):(\d+):(\d+)/)
      if (match) return sum + (parseInt(match[1]) * 60) + parseInt(match[2])
      const mins = parseInt(s.tiempo_estimado || s.duracionAprox) || 0
      return sum + mins
    }, 0)
    const h = Math.floor(totalMinutos / 60)
    const m = totalMinutos % 60
    return h > 0 ? `${h}h ${m}min` : `${totalMinutos}min`
  })
</script>

<style scoped>
  .detalle-card { height: 100%; display: flex; flex-direction: column; background: transparent !important; border: none !important; }
  .header-receipt { padding: 30px; text-align: center; background: rgba(255, 255, 255, 0.02); border-bottom: 1px dashed rgba(255, 255, 255, 0.1); }
  .shop-name { display: block; font-size: 1.4rem; font-weight: 800; color: white; letter-spacing: 2px; margin-top: 15px; }
  .shop-address { font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); letter-spacing: 1px; text-transform: uppercase; }

  .contenido-scroll { flex: 1; overflow-y: auto; padding: 30px; }
  .contenido-scroll::-webkit-scrollbar { width: 4px; }
  .contenido-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }

  .section-title {
    font-size: 0.8rem !important;
    font-weight: 800;
    color: #ee6f38;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 15px !important;
    display: flex; align-items: center; gap: 10px;
  }

  .servicios-list { background: transparent; padding: 0; }
  .servicio-item {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 12px !important;
    margin-bottom: 10px;
    padding: 12px 15px !important;
    min-height: auto !important;
  }

  .servicio-nombre-mini { color: white !important; font-weight: 700 !important; font-size: 0.9rem !important; }
  .servicio-meta-mini { color: rgba(255, 255, 255, 0.6) !important; font-size: 0.75rem !important; }

  .resumen-total {
    background: rgba(238, 111, 56, 0.05);
    border-radius: 15px; padding: 20px;
    margin-top: 20px; border: 1px solid rgba(238, 111, 56, 0.1);
  }

  .resumen-row { display: flex; justify-content: space-between; align-items: center; }
  .resumen-label { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; font-weight: 600; }
  .resumen-value { color: white; font-weight: 700; }
  .total-value { font-size: 1.4rem; color: #ee6f38; font-weight: 800; }

  .info-summary-card {
    display: flex; align-items: center; gap: 15px; padding: 15px;
    background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 15px;
  }
  .summary-text { flex: 1; }
  .summary-label { display: block; font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 2px; }
  .summary-value { display: block; font-size: 0.95rem; font-weight: 700; color: white; }

  .empty-state { text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.2); }
  .empty-state i { font-size: 40px; margin-bottom: 15px; opacity: 0.2; }

  .acciones-fijas { padding: 30px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05); }
  .boton-accion {
    background: #ee6f38 !important; color: white !important;
    font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
    font-size: 1rem; height: 56px !important; border-radius: 15px !important;
    box-shadow: 0 10px 20px rgba(238, 111, 56, 0.2) !important;
  }
</style>