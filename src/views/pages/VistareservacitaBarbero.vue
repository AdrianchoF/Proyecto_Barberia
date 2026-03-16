<template>
  <v-dialog v-model="props.modelValue" transition="dialog-bottom-transition" fullscreen>
    <v-card class="booking-card">
      <div class="booking-header">
        <v-card-title class="titulo-reserva">
          <h3 class="text-h4 font-weight-bold">RESERVACIÓN DE CITA</h3>
          <p class="text-caption text-grey">Pasos finales para tu cambio de look</p>
        </v-card-title>
        
        <div class="boton-cerrar" @click="closeDialog">
          <i class="fa-solid fa-x"></i>
        </div>
      </div>

      <!-- Contenedor principal con layout de dos columnas -->
      <div class="booking-content d-flex">
        
        <div class="left-column">
          <!-- Tabs - SIN tab de Profesional -->
          <v-tabs v-model="currentTab" class="custom-tabs" bg-color="transparent" height="70">
            <v-tab v-for="(item, index) in items" :key="item" :value="item" :disabled="!isTabEnabled(index)" class="step-tab"> 
              <div class="tab-content" :class="{ 'active-step': currentTab === item }">
                <span class="tab-number">{{ index + 1 }}</span>
                <span class="tab-label desktop-only">{{ item }}</span>
                <i v-if="index < items.length - 1" class="fa-solid fa-chevron-right arrow-icon desktop-only"></i>
              </div>
            </v-tab>
          </v-tabs>

          <!-- Contenido de tabs -->
          <v-tabs-window v-model="currentTab">
            
            <!-- TAB: Servicios -->
            <v-tabs-window-item value="Servicios">
              <ServiciostabBarbero
              @seleccionados="actualizarServicios" 
              @estado-servicio-siguiente="actualizarEstadoBoton"/>
            </v-tabs-window-item>

            <!-- TAB: Fecha y Hora -->
            <v-tabs-window-item value="Fecha y Hora">
              <FechayhoratabBarbero
              @emit-fechay-hora="actualizarFechayHora" 
              @estado-fechayhora-siguiente="actualizarEstadoBoton"/>
            </v-tabs-window-item>

            <!-- TAB: Confirmacion -->
            <v-tabs-window-item value="Confirmacion">
              <ConfirmaciontabBarbero @estado-confirmacion-agendar="actualizarEstadoBoton"></ConfirmaciontabBarbero>
            </v-tabs-window-item>

          </v-tabs-window>
        </div>

        <!-- Columna derecha: Detalles de la cita (fija) -->
        <div class="right-column desktop-only">
          <DetallereservaBarbero
          :servicios="serviciosSeleccionados"
          :barbero="reservaBarberoStore.barberoPreseleccionado"
          :fecha="fechaFormateada"
          :hora="horaFormateada"
          :habilitar-boton="botonActivo"
          @siguiente-tab="avanzarTab"
          :ultimo-tab="currentIndex === items.length - 1"/>
        </div>

      </div>
    </v-card>
    <!-- Modales de notificación -->
    <ModalConfirmacionCita
      v-model="mostrarModalConfirmacion"
      :servicios="serviciosSeleccionados"
      :barbero="reservaBarberoStore.barberoPreseleccionado"
      :fecha="fechaFormateada"
      :hora="horaFormateada"
      @confirmar="agendarCita"
    />

    <NotificacionExito
      v-model="mostrarNotificacionExito"
      :mensaje="mensajeNotificacion"
      @cerrar-todo="closeDialog"
    />

    <NotificacionError
      v-model="mostrarNotificacionError"
      :mensaje="mensajeNotificacion"
      :horarios-alternativos="horariosAlternativos"
      :barberos-alternativos="barberosAlternativos"
    />
  </v-dialog>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useServiceStore } from '@/stores/services'
  import { useReservaBarberoStore } from '@/stores/reservaBarbero'
  import { useCitaStore } from '@/stores/cita'
  import { useAuthStore } from '@/stores/auth'
  import ServiciostabBarbero from '@/components/shared/ReservacitaBarbero/ServiciostabBarbero.vue'
  import FechayhoratabBarbero from '@/components/shared/ReservacitaBarbero/FechayhoratabBarbero.vue'
  import ConfirmaciontabBarbero from '@/components/shared/ReservacitaBarbero/ConfirmaciontabBarbero.vue'
  import DetallereservaBarbero from '@/components/shared/ReservacitaBarbero/DetallereservaBarbero.vue'
  import ModalConfirmacionCita from '@/components/shared/ReservaCita/ModalConfirmacionCita.vue'
  import NotificacionExito from '@/components/shared/ReservaCita/NotificacionExito.vue'
  import NotificacionError from '@/components/shared/ReservaCita/NotificacionError.vue'

  const ServicioStore = useServiceStore()
  const reservaBarberoStore = useReservaBarberoStore()
  const citaStore = useCitaStore()
  const authStore = useAuthStore()

  // ✅ Props y emits
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
      default: false,
    },
  })
  const emit = defineEmits(['update:modelValue'])

  // ✅ Estado - SIN tab de Profesional
  const items = ['Servicios', 'Fecha y Hora', 'Confirmacion']
  const currentIndex = ref(reservaBarberoStore.currentTab)
  const botonActivo = ref(false)
  
  // Estados para los modales
  const mostrarModalConfirmacion = ref(false)
  const mostrarNotificacionExito = ref(false)
  const mostrarNotificacionError = ref(false)
  const mensajeNotificacion = ref('')
  const horariosAlternativos = ref([])
  const barberosAlternativos = ref([])

  const currentTab = computed({
    get: () => items[currentIndex.value],
    set: (val) => {
      const index = items.indexOf(val)
      if (index <= currentIndex.value) {
        currentIndex.value = index
        reservaBarberoStore.setCurrentTab(index)
      }
    }
  })

  // ✅ Función para controlar qué tabs están activos
  const isTabEnabled = (index) => index <= currentIndex.value

  // ✅ Computed para obtener los objetos completos de los servicios
  const serviciosSeleccionados = computed(() => {
    return ServicioStore.services.filter(servicio => 
      reservaBarberoStore.serviciosSeleccionados.includes(servicio.id)
    )
  })

  // ✅ Formatear la fecha
  const fechaFormateada = computed(() => {
    if (!reservaBarberoStore.fechaSeleccionada) return null
    
    const fecha = new Date(reservaBarberoStore.fechaSeleccionada + 'T00:00:00')
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-ES', opciones)
  })

  // ✅ Formatear la hora
  const horaFormateada = computed(() => {
    if (!reservaBarberoStore.horaSeleccionada) return null
    
    const [hoursStr, minutes] = reservaBarberoStore.horaSeleccionada.split(':')
    const h = parseInt(hoursStr, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  })

  // ✅ Watch para verificar el estado del botón
  watch(currentIndex, async (nuevoIndex) => {
    reservaBarberoStore.setCurrentTab(nuevoIndex)
    botonActivo.value = false
    await nextTick()
    verificarEstadoTabActual()
  })

  // ✅ Watch para sincronizar currentIndex cuando cambia en la store
  watch(() => reservaBarberoStore.currentTab, (nuevoTab) => {
    currentIndex.value = nuevoTab
  })

  // ⭐ NUEVO: Watch para sincronizar cuando se abre el modal
  watch(() => props.modelValue, (nuevoValor) => {
    if (nuevoValor) {
      currentIndex.value = reservaBarberoStore.currentTab
      nextTick(() => {
        verificarEstadoTabActual()
      })
    }
  })

  // ✅ Función para verificar estado del botón
  function verificarEstadoTabActual() {
    botonActivo.value = reservaBarberoStore.botonHabilitadoPorTab
  }

  // 🔥 LISTENER PARA REABRIR DIALOG
  const handleOpenReservaBarbero = () => {
    emit('update:modelValue', true)
    currentIndex.value = reservaBarberoStore.currentTab
    nextTick(() => {
      verificarEstadoTabActual()
    })
  }

  onMounted(() => {
    console.log('👂 Listener de reserva barbero montado')
    window.addEventListener('open-reserva-barbero-dialog', handleOpenReservaBarbero)
    verificarEstadoTabActual()
  })

  onUnmounted(() => {
    console.log('🔇 Listener de reserva barbero desmontado')
    window.removeEventListener('open-reserva-barbero-dialog', handleOpenReservaBarbero)
  })

  // ✅ Métodos
  function closeDialog() {
    reservaBarberoStore.resetReserva()
    currentIndex.value = 0
    emit('update:modelValue', false)
  }

  function actualizarServicios(idsSeleccionados) {
    reservaBarberoStore.setServicios(idsSeleccionados)
  }

  function actualizarEstadoBoton(estado) {
    botonActivo.value = estado
  }

  function actualizarFechayHora(data) {
    reservaBarberoStore.setFechaHora(data.fecha, data.hora)
  }

  // Avanzar al siguiente tab
  async function avanzarTab() {
    if (currentIndex.value === items.length - 1) {
      mostrarModalConfirmacion.value = true
    } else {
      currentIndex.value++
    }
  }

  async function agendarCita() {
    try {
      console.log('🎯 Iniciando proceso de agendado con barbero...')
      
      // Validaciones
      if (!reservaBarberoStore.serviciosSeleccionados || reservaBarberoStore.serviciosSeleccionados.length === 0) {
        mensajeNotificacion.value = 'Debes seleccionar al menos un servicio'
        mostrarNotificacionError.value = true
        return
      }
      
      if (!reservaBarberoStore.barberoPreseleccionado) {
        mensajeNotificacion.value = 'Error: No hay barbero seleccionado'
        mostrarNotificacionError.value = true
        return
      }
      
      if (!reservaBarberoStore.fechaSeleccionada || !reservaBarberoStore.horaSeleccionada) {
        mensajeNotificacion.value = 'Debes seleccionar fecha y hora'
        mostrarNotificacionError.value = true
        return
      }
      
      if (!authStore.isAuthenticated) {
        mensajeNotificacion.value = 'Debes iniciar sesión para agendar'
        mostrarNotificacionError.value = true
        return
      }

      // Preparar datos
      const datosReserva = {
        clienteId: authStore.user.id,
        barberoId: reservaBarberoStore.barberoPreseleccionado.id,
        servicioId: reservaBarberoStore.serviciosSeleccionados,
        hora: reservaBarberoStore.horaSeleccionada,
        fecha: reservaBarberoStore.fechaSeleccionada
      }

      console.log('📋 Datos a enviar:', datosReserva)

      // Llamar al store
      const resultado = await citaStore.crearCita(datosReserva)

      if (resultado.success) {
        mensajeNotificacion.value = resultado.mensaje
        mostrarModalConfirmacion.value = false
        await nextTick()
        reservaBarberoStore.resetReserva()
        currentIndex.value = 0
        mostrarNotificacionExito.value = true
        console.log('✅ Citas creadas:', resultado.citas)
      } else {
        mensajeNotificacion.value = resultado.mensaje
        horariosAlternativos.value = resultado.horariosAlternativos || []
        barberosAlternativos.value = resultado.barberosAlternativos || []
        mostrarModalConfirmacion.value = false
        mostrarNotificacionError.value = true
        console.log('🕐 Horarios alternativos:', resultado.horariosAlternativos)
        console.log('💈 Barberos alternativos:', resultado.barberosAlternativos)
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error)
      mensajeNotificacion.value = 'Ocurrió un error inesperado al agendar la cita'
      mostrarModalConfirmacion.value = false
      mostrarNotificacionError.value = true
    }
  }
</script>

<style scoped>
  .booking-card {
    background: rgba(18, 18, 18, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    color: white !important;
    font-family: 'Outfit', sans-serif;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }

  .booking-header {
    position: relative;
    padding: 30px 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.2);
  }

  .titulo-reserva {
    display: block !important;
    padding: 0 !important;
  }

  .titulo-reserva h3 {
    margin: 0;
    color: #ee6f38;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-size: 1.6rem;
    font-weight: 800;
  }

  .boton-cerrar {
    position: absolute;
    top: 35px;
    right: 40px;
    font-size: 20px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .boton-cerrar:hover {
    background: rgba(238, 111, 56, 0.2);
    color: #ee6f38;
    transform: rotate(90deg);
  }

  .booking-content {
    height: calc(100vh - 120px);
  }

  .left-column {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .right-column {
    width: 100%;
    max-width: 450px;
    background: rgba(0, 0, 0, 0.3);
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0;
    overflow-y: auto;
  }

  .custom-tabs {
    background: rgba(0, 0, 0, 0.2) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .step-tab {
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  .step-tab[aria-selected="true"] {
    opacity: 1;
  }

  .tab-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tab-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .active-step .tab-number {
    background: #ee6f38;
    border-color: #ee6f38;
    box-shadow: 0 0 15px rgba(238, 111, 56, 0.4);
  }

  .tab-label {
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 13px;
  }

  .arrow-icon {
    font-size: 12px;
    margin-left: 10px;
    opacity: 0.3;
  }

  @media (max-width: 960px) {
    .booking-header {
      padding: 20px;
    }
    .boton-cerrar {
      top: 25px;
      right: 20px;
    }
    .right-column {
      display: none !important;
    }
  }
</style>