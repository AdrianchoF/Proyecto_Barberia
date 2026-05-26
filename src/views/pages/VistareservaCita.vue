<template>
  <v-dialog v-model="props.modelValue" transition="dialog-bottom-transition" fullscreen>
      <v-card class="booking-card">
        <div class="booking-header">
          <v-card-title class="titulo-reserva">
            <h3 class="text-h4 font-weight-bold">AGENDAR TU CITA</h3>
            <p class="text-caption text-grey">Vive la experiencia StyleHub</p>
          </v-card-title>
          
          <div class="boton-cerrar" @click="closeDialog">
            <i class="fa-solid fa-x"></i>
          </div>
        </div>

        <!-- Contenedor principal con layout de dos columnas -->
        <div class="booking-content d-flex">
          
          <div class="left-column">
            <!-- Tabs -->
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
                <ServiciosTab
                @seleccionados="actualizarServicios" 
                @estado-servicio-siguiente="actualizarEstadoBoton"/>
              </v-tabs-window-item>

              <!-- TAB: Fecha y Hora -->
              <v-tabs-window-item value="Fecha y Hora">
                <FechayHoraTab @emit-fechay-hora="actualizarFechayHora" 
                @estado-fechayhora-siguiente="actualizarEstadoBoton"/>
              </v-tabs-window-item>
              
              <!-- TAB: Barberos -->
              <v-tabs-window-item value="Profesional">
                <BarberoTab @emit-barbero="actualizarBarbero"
                @estado-barbero-siguiente="actualizarEstadoBoton"/>
              </v-tabs-window-item>

              <!-- TAB: Confirmacion -->
              <v-tabs-window-item value="Confirmacion">
                <ConfirmacionTab @estado-confirmacion-agendar="actualizarEstadoBoton"></ConfirmacionTab>
              </v-tabs-window-item>

            </v-tabs-window>
          </div>

          <!-- Columna derecha: Detalles de la cita (fija) -->
          <div class="right-column">
            <DetalleReserva
            :servicios="serviciosSeleccionados"
            :barbero="reservaStore.barberoSeleccionado"
            :fecha="fechaFormateada"
            :hora="horaFormateada"
            :habilitar-boton="botonActivo"
            @siguiente-tab="avanzarTab"
            :ultimo-tab="currentIndex === items.length - 1"/>
          </div>

          <!-- INDICADOR DE SCROLL HACIA ABAJO - SOLO MÓVIL -->
          <div class="scroll-indicator-mobile">
            <span class="indicator-text">Desliza para ver detalles</span>
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </v-card>
      <!-- Modales de notificación -->
      <ModalConfirmacionCita
        v-model="mostrarModalConfirmacion"
        :servicios="serviciosSeleccionados"
        :barbero="reservaStore.barberoSeleccionado"
        :fecha="fechaFormateada"
        :hora="horaFormateada"
        @confirmar="agendarCita"
      />

      <NotificacionExito
        v-model="mostrarNotificacionExito"
        :mensaje="mensajeNotificacion"
        :fecha="detallesUltimaReserva.fecha"
        :hora="detallesUltimaReserva.hora"
        :barbero="detallesUltimaReserva.barbero"
        :servicios="detallesUltimaReserva.servicios"
        @cerrar-todo="closeDialog"
      />


  </v-dialog>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useServiceStore } from '@/stores/services'
  import { useReservaStore } from '@/stores/reserva'
  import { useCitaStore } from '@/stores/cita'
  import { useAuthStore } from '@/stores/auth'
  import ServiciosTab from '@/components/shared/ReservaCita/ServiciosTab.vue'
  import BarberoTab from '@/components/shared/ReservaCita/BarberoTab.vue'
  import FechayHoraTab from '@/components/shared/ReservaCita/FechayHoraTab.vue'
  import ConfirmacionTab from '@/components/shared/ReservaCita/ConfirmacionTab.vue'
  import DetalleReserva from '@/components/shared/ReservaCita/DetalleReserva.vue'
  import ModalConfirmacionCita from '@/components/shared/ReservaCita/ModalConfirmacionCita.vue'
  import NotificacionExito from '@/components/shared/ReservaCita/NotificacionExito.vue'

  const ServicioStore = useServiceStore()
  const reservaStore = useReservaStore()
  const citaStore = useCitaStore()
  const authStore = useAuthStore()

  // ✅ Props y emits
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
      default: false,
    },
    initialServiceId: {
      type: Number,
      default: null
    }
  })
  const emit = defineEmits(['update:modelValue'])

  // Watcher para manejar apertura y cierre del diálogo
  watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
      if (props.initialServiceId) {
        console.log('📦 Pre-seleccionando servicio:', props.initialServiceId)
        reservaStore.setServicios([props.initialServiceId])
        currentIndex.value = 0
        reservaStore.setCurrentTab(0)
      }
    } else {
      // ✅ RESET AUTOMÁTICO AL CERRAR (solo si no estamos en proceso de login)
      const isReturning = sessionStorage.getItem('returnToReserva') === 'true' || 
                         sessionStorage.getItem('returnToReservaBarbero') === 'true';
      
      if (!isReturning) {
        console.log('🧹 Limpiando reserva al cerrar (cierre definitivo)...')
        reservaStore.resetReserva()
        currentIndex.value = 0
        reservaStore.setCurrentTab(0)
      } else {
        console.log('⏳ Manteniendo estado de reserva para el retorno tras login...')
      }
    }
  })

  // ✅ Estado
  const items = ['Servicios', 'Fecha y Hora', 'Profesional', 'Confirmacion']
  const currentIndex = ref(reservaStore.currentTab) // ✅ Obtener de la store
  const botonActivo = ref(false)
  // Estados para los modales
  const mostrarModalConfirmacion = ref(false)
  const mostrarNotificacionExito = ref(false)
  const mensajeNotificacion = ref('')
  const detallesUltimaReserva = ref({
    fecha: null,
    hora: null,
    barbero: null,
    servicios: []
  })

  const currentTab = computed({
    get: () => items[currentIndex.value],
    set: (val) => {
      const index = items.indexOf(val)
      if (index <= currentIndex.value) {
        currentIndex.value = index
        reservaStore.setCurrentTab(index) // ✅ Sincronizar con store
      }
    }
  })

  // ✅ Función para controlar qué tabs están activos
  const isTabEnabled = (index) => index <= currentIndex.value

  // ✅ Computed para obtener los objetos completos de los servicios DESDE LA STORE
  const serviciosSeleccionados = computed(() => {
    return ServicioStore.services.filter(servicio => 
      reservaStore.serviciosSeleccionados.includes(servicio.id)
    )
  })

  // ✅ NUEVO: Formatear la fecha para mostrar en DetalleReserva
  const fechaFormateada = computed(() => {
    if (!reservaStore.fechaSeleccionada) return null
    
    const fecha = new Date(reservaStore.fechaSeleccionada + 'T00:00:00')
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-ES', opciones)
  })

  // ✅ NUEVO: Formatear la hora para mostrar en DetalleReserva
  const horaFormateada = computed(() => {
    if (!reservaStore.horaSeleccionada) return null
    
    const [hoursStr, minutes] = reservaStore.horaSeleccionada.split(':')
    const h = parseInt(hoursStr, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  })

  // ✅ Watch para verificar el estado del botón al cambiar de tab
  watch(currentIndex, async (nuevoIndex) => {
    reservaStore.setCurrentTab(nuevoIndex) // ✅ Sincronizar con store
    botonActivo.value = false
    await nextTick()
    verificarEstadoTabActual()
  })

  // ✅ Función para verificar si el tab actual debe tener el botón habilitado
  function verificarEstadoTabActual() {
    // ✅ Usar el getter de la store que ya tiene esta lógica
    botonActivo.value = reservaStore.botonHabilitadoPorTab
  }

  // 🔥 LISTENER PARA REABRIR DIALOG DESPUÉS DEL LOGIN
  const handleOpenReserva = (event) => {
    emit('update:modelValue', true)
    
    // ✅ Si viene un serviceId en el evento (desde HomeServicios), lo pre-seleccionamos
    const serviceId = event?.detail?.serviceId;
    if (serviceId) {
       console.log('📦 Pre-seleccionando servicio desde evento:', serviceId)
       reservaStore.setServicios([serviceId])
       currentIndex.value = 0
       reservaStore.setCurrentTab(0)
    } else {
       // ✅ Si no, restaurar el tab desde la store (útil para el retorno tras login)
       currentIndex.value = reservaStore.currentTab
    }
    
    // ✅ Verificar estado del botón
    nextTick(() => {
      verificarEstadoTabActual()
    })
  }

  onMounted(() => {
    console.log('👂 Listener de reserva montado')
    window.addEventListener('open-reserva-dialog', handleOpenReserva)
    
    // ✅ Al cargar, si estamos regresando de un login, recuperamos el tab
    if (sessionStorage.getItem('returnToReserva') === 'true') {
      currentIndex.value = reservaStore.currentTab
      nextTick(() => {
        handleOpenReserva()
        sessionStorage.removeItem('returnToReserva')
      })
    }
    
    verificarEstadoTabActual()
  })

  onUnmounted(() => {
    console.log('🔇 Listener de reserva desmontado')
    window.removeEventListener('open-reserva-dialog', handleOpenReserva)
  })

  // ✅ Métodos - AHORA ACTUALIZAN LA STORE
  function closeDialog() {
    reservaStore.resetReserva() // ✅ Limpiar todo al cerrar
    currentIndex.value = 0      // ✅ Volver al primer tab
    emit('update:modelValue', false)
  }

  function actualizarServicios(idsSeleccionados) {
    reservaStore.setServicios(idsSeleccionados) // ✅ Guardar en store
  }

  function actualizarEstadoBoton(estado) {
    botonActivo.value = estado
  }

  function actualizarBarbero(barbero) {
    reservaStore.setBarbero(barbero) // ✅ Guardar en store
  }

  function actualizarFechayHora(data) {
    reservaStore.setFechaHora(data.fecha, data.hora) // ✅ Guardar en store
  }

  // Avanzar al siguiente tab
  async function avanzarTab() {
    // Si es el último tab (Confirmación), mostrar modal de confirmación
    if (currentIndex.value === items.length - 1) {
      mostrarModalConfirmacion.value = true
    } else {
      // Si no, avanzar al siguiente tab
      currentIndex.value++
      
      // Auto-scroll hacia arriba SOLO en móvil
      if (window.innerWidth < 960) {
        await nextTick()
        const leftColumn = document.querySelector('.left-column')
        if (leftColumn) {
          leftColumn.scrollTop = 0
        }
      }
    }
  }

  async function agendarCita() {
    try {
      console.log('🎯 Iniciando proceso de agendado...')
      
      // Validaciones
      if (!reservaStore.serviciosSeleccionados || reservaStore.serviciosSeleccionados.length === 0) {
        mensajeNotificacion.value = 'Debes seleccionar al menos un servicio'
        mostrarNotificacionError.value = true
        return
      }
      
      if (!reservaStore.barberoSeleccionado) {
        mensajeNotificacion.value = 'Debes seleccionar un barbero'
        mostrarNotificacionError.value = true
        return
      }
      
      if (!reservaStore.fechaSeleccionada || !reservaStore.horaSeleccionada) {
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
        barberoId: reservaStore.barberoSeleccionado.id,
        servicioId: reservaStore.serviciosSeleccionados,
        hora: reservaStore.horaSeleccionada + ':00',
        fecha: reservaStore.fechaSeleccionada
      }

      console.log('📋 Datos a enviar:', datosReserva)

      // Llamar al store
      const resultado = await citaStore.crearCita(datosReserva)

      if (resultado.success) {
        // ✅ ÉXITO
        mensajeNotificacion.value = resultado.mensaje
        
        // ⭐ IMPORTANTE: Guardar detalles para el calendario antes de limpiar la reserva
        detallesUltimaReserva.value = {
          fecha: reservaStore.fechaSeleccionada,
          hora: reservaStore.horaSeleccionada + ':00',
          barbero: reservaStore.barberoSeleccionado,
          servicios: serviciosSeleccionados.value
        }
        
        // ⭐ IMPORTANTE: Primero cerrar el modal de confirmación
        mostrarModalConfirmacion.value = false
        
        // ⭐ Esperar un poco para que el modal se cierre completamente
        await nextTick()
        
        // ⭐ Luego limpiar la reserva (esto resetea los datos)
        reservaStore.resetReserva()
        
        // ⭐ Resetear el índice del tab
        currentIndex.value = 0
        
        // ⭐ Mostrar notificación de éxito
        mostrarNotificacionExito.value = true
        
        console.log('✅ Citas creadas:', resultado.citas)

      } else {
        // ❌ ERROR (General)
        mensajeNotificacion.value = resultado.mensaje
        
        // Cerrar modal de confirmación
        mostrarModalConfirmacion.value = false
        
        // Usar una alerta simple o un snackbar si existiera, 
        // pero por ahora solo log y limpiar para evitar el modal gigante
        alert(mensajeNotificacion.value)
        
        console.log('❌ Error al agendar:', resultado.mensaje)
      }

    } catch (error) {
      console.error('💥 Error inesperado:', error)
      mensajeNotificacion.value = 'Ocurrió un error inesperado al agendar la cita'
      
      // Cerrar modal de confirmación si está abierto
      mostrarModalConfirmacion.value = false
      
      // Mostrar notificación de error
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

  /* Indicador de scroll solo para móvil */
  .scroll-indicator-mobile {
    display: none;
  }

  @media (max-width: 960px) {
    .scroll-indicator-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      background: rgba(238, 111, 56, 0.1);
      border-top: 1px solid rgba(238, 111, 56, 0.3);
      color: #ee6f38;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      animation: pulse-chevron 2s infinite;
    }

    .scroll-indicator-mobile i {
      font-size: 14px;
      animation: bounce-chevron 2s infinite;
    }

    @keyframes pulse-chevron {
      0%, 100% {
        opacity: 0.7;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes bounce-chevron {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(4px);
      }
    }
    .booking-header {
      padding: 20px;
    }
    .boton-cerrar {
      top: 25px;
      right: 20px;
    }
    .booking-content {
      flex-direction: column;
      height: auto;
    }
    .left-column {
      flex: 1;
      order: 1;
    }
    .right-column {
      width: 100% !important;
      max-width: 100% !important;
      order: 2;
      border-left: none;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      max-height: none;
    }
  }
</style>