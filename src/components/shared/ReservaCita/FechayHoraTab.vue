<template>
  <v-container class="fecha-hora-container">
    <h3 class="titulo-fecha-hora">¿Cuándo te esperamos?</h3>

    <div class="scroll-fecha-hora">
      <!-- 🔹 Selector de fecha horizontal estilo moderno -->
      <v-card class="calendar-section" elevation="0">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <span class="mes-anio">{{ mesYAnioActual }}</span>
          </div>
          <div class="d-flex ga-3 align-center">
            <!-- 🆕 Botón para abrir calendario completo con v-menu -->
            <v-menu v-model="mostrarCalendario" :close-on-content-click="false" location="bottom end" offset="12">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="flat" class="btn-nav-calendar" v-bind="props" title="Ver calendario completo">
                  <i class="fas fa-calendar-alt"></i>
                </v-btn>
              </template>

              <v-card min-width="320" class="booking-card">
                <v-card-text class="pa-0">
                  <v-date-picker v-model="fechaCalendario" :min="fechaMinima" color="#ee6f38" show-adjacent-months hide-header elevation="0" theme="dark" @update:model-value="aplicarFechaCalendario"></v-date-picker>
                </v-card-text>
              </v-card>
            </v-menu>
            
            <v-btn icon size="small" variant="flat" class="btn-nav-calendar" @click="semanaAnterior">
              <i class="fas fa-chevron-left"></i>
            </v-btn>
            <v-btn icon size="small" variant="flat" class="btn-nav-calendar" @click="semanaSiguiente">
              <i class="fas fa-chevron-right"></i>
            </v-btn>
          </div>
        </div>

        <!-- Días en formato horizontal -->
        <div class="dias-horizontales">
          <div v-for="(date, index) in diasVisibles" :key="index" class="dia-card"
            :class="{ 
              'dia-seleccionado': esMismaFecha(date, fechaSeleccionada),
              'dia-hoy': esHoy(date) && !esMismaFecha(date, fechaSeleccionada),
              'dia-deshabilitado': esDiaPasado(date)
            }"
            @click="seleccionarDia(date)"
          >
            <span class="dia-nombre">{{ obtenerNombreDia(date) }}</span>
            <span class="dia-numero">{{ date.getDate() }}</span>
          </div>
        </div>
      </v-card>

      <!-- 🔹 Selector de hora con input type="time" -->
      <v-card class="time-section" elevation="0">
        <v-label class="text-subtitle-1 mb-4 text-white font-weight-bold">
            <i class="fas fa-clock mr-2 text-orange"></i>
            Elegir Hora
        </v-label>
        
        <div v-if="!fechaSeleccionada" class="text-center py-8 text-white">
          <i class="fas fa-calendar-day mb-3 d-block" style="font-size: 40px; opacity: 0.2;"></i>
          Selecciona una fecha para ver horarios
        </div>
        
        <div v-else class="hora-selector">
          <v-text-field 
            v-model="horaSeleccionada" 
            type="time" 
            variant="flat" 
            density="comfortable" 
            hide-details
            class="time-input"
            :min="horaMinima"
            :class="{ 'hora-invalida': esHoraInvalida }"
            @blur="validarHora"
          >
            <template v-slot:prepend-inner>
              <i class="fas fa-clock text-orange mr-2"></i>
            </template>
          </v-text-field>
          
          <!-- Mensaje de ayuda/error -->
          <div v-if="esHoy(fechaSeleccionada)" class="mt-4">
            <div v-if="esHoraInvalida" class="error-box">
              <i class="fas fa-exclamation-circle mr-2"></i>
              Hora no disponible. Mínimo: {{ formatearHoraMinima }}
            </div>
            <div v-else class="info-box">
              <i class="fas fa-info-circle mr-2 text-orange"></i>
              Horarios disponibles desde las {{ formatearHoraMinima }}
            </div>
          </div>
        </div>
      </v-card>

      <!-- 🔹 Resumen temporal -->
      <div v-if="fechaSeleccionada && horaSeleccionada && !esHoraInvalida" class="resumen-seleccion mt-6">
        <v-alert class="resumen-card" theme="dark">
          <div class="d-flex align-center gap-3">
            <v-icon color="orange" size="large">mdi-calendar-check</v-icon>
            <div>
                <p class="ma-0 font-weight-bold text-orange">Cita programada:</p>
                <p class="ma-0 text-white font-weight-medium">{{ formatearFecha(fechaSeleccionada) }} a las {{ formatearHora(horaSeleccionada) }}</p>
            </div>
          </div>
        </v-alert>
      </div>
    </div>
  </v-container>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useReservaStore } from '@/stores/reserva'

  const reservaStore = useReservaStore()
  const emit = defineEmits(['emit-fechay-hora', 'estado-fechayhora-siguiente'])
  const fechaSeleccionada = ref(null)
  const horaSeleccionada = ref(null)
  const semanaActual = ref(new Date())
  const horaActual = ref(new Date()) // 🆕 Ref para la hora actual que se actualiza
  const intervalId = ref(null) // 🆕 Para guardar el ID del intervalo
  const mostrarCalendario = ref(false) // 🆕 Para controlar el diálogo del calendario
  const fechaCalendario = ref(null) // 🆕 Para el v-date-picker
  
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // 🆕 Computed para la fecha mínima (hoy)
  const fechaMinima = computed(() => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  })

  // 🆕 Función para aplicar la fecha seleccionada del calendario
  const aplicarFechaCalendario = (fecha) => {
    if (fecha) {
      // Convertir la fecha del calendario a objeto Date
      const fechaObj = new Date(fecha)
      fechaSeleccionada.value = fechaObj
      
      // Actualizar la semana visible para que incluya esta fecha
      semanaActual.value = new Date(fechaObj)
      
      // Cerrar el menú
      mostrarCalendario.value = false
    }
  }

  // 🆕 Computed reactivo que usa horaActual en lugar de new Date()
  const horaMinima = computed(() => {
    if (!fechaSeleccionada.value) return '00:00'
    
    if (esHoy(fechaSeleccionada.value)) {
      const horas = String(horaActual.value.getHours()).padStart(2, '0')
      const minutos = String(horaActual.value.getMinutes()).padStart(2, '0')
      return `${horas}:${minutos}`
    }
    
    return '00:00'
  })

  // Computed para formatear la hora mínima en formato legible
  const formatearHoraMinima = computed(() => {
    if (!horaMinima.value) return ''
    const [h, m] = horaMinima.value.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  })

  // Computed para verificar si la hora seleccionada es inválida
  const esHoraInvalida = computed(() => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return false
    
    // Solo validar si es hoy
    if (esHoy(fechaSeleccionada.value)) {
      return horaSeleccionada.value < horaMinima.value
    }
    
    return false
  })

  // Función para validar la hora cuando el usuario termina de editarla
  const validarHora = () => {
    if (esHoraInvalida.value) {
      // Limpiar la hora si es inválida
      horaSeleccionada.value = null
    }
  }

  // Función para verificar si un día ya pasó
  const esDiaPasado = (fecha) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaComparar = new Date(fecha)
    fechaComparar.setHours(0, 0, 0, 0)
    return fechaComparar < hoy
  }

  // 🆕 Iniciar intervalo para actualizar la hora sincronizado con el reloj del sistema
  const iniciarActualizacionHora = () => {
    // Actualizar inmediatamente
    horaActual.value = new Date()
    
    // Función que actualiza la hora y valida
    const actualizarYValidar = () => {
      horaActual.value = new Date()
      
      // Si hay una hora seleccionada y ahora es inválida, limpiarla
      if (horaSeleccionada.value && esHoraInvalida.value) {
        horaSeleccionada.value = null
      }
    }
    
    // Calcular cuántos milisegundos faltan para el próximo minuto
    const ahora = new Date()
    const segundosRestantes = 60 - ahora.getSeconds()
    const milisegundosRestantes = (segundosRestantes * 1000) - ahora.getMilliseconds()
    
    // Programar la primera actualización exactamente cuando cambie el minuto
    setTimeout(() => {
      actualizarYValidar()
      
      // Después de la primera sincronización, actualizar cada minuto exacto
      intervalId.value = setInterval(actualizarYValidar, 60000)
    }, milisegundosRestantes)
  }

  // 🆕 Detener el intervalo cuando el componente se desmonte
  const detenerActualizacionHora = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
    // También limpiar cualquier setTimeout pendiente si existe
    // (aunque el setTimeout se ejecuta una sola vez, es buena práctica)
  }

  // Cargar valores previos si existen
  onMounted(() => {
    // Iniciar actualización de hora
    iniciarActualizacionHora()
    
    if (reservaStore.fechaSeleccionada) {
      const f = reservaStore.fechaSeleccionada
      fechaSeleccionada.value = typeof f === 'string' ? new Date(f + 'T00:00:00') : f
      semanaActual.value = new Date(fechaSeleccionada.value)
      // 🆕 También actualizar fechaCalendario
      fechaCalendario.value = reservaStore.fechaSeleccionada
    }
    if (fechaSeleccionada.value) {
      semanaActual.value = new Date(fechaSeleccionada.value)
    }
    if (reservaStore.horaSeleccionada) {
      horaSeleccionada.value = reservaStore.horaSeleccionada
    }
  })

  // 🆕 Limpiar intervalo al desmontar
  onUnmounted(() => {
    detenerActualizacionHora()
  })

  // Generar 7 días visibles desde la semana actual
  const diasVisibles = computed(() => {
    const dias = []
    const inicio = new Date(semanaActual.value)
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + i)
      dias.push(fecha)
    }
    return dias
  })

  // Watch para detectar cambios y validar
  watch([fechaSeleccionada, horaSeleccionada], ([nuevaFecha, nuevaHora]) => {
    const ambosSeleccionados = !!(nuevaFecha && nuevaHora && nuevaHora.trim() !== '')
    
    // Solo habilitar el botón si ambos están seleccionados Y la hora es válida
    const esValido = ambosSeleccionados && !esHoraInvalida.value
    
    emit('estado-fechayhora-siguiente', esValido)
    
    if (esValido) {
      actualizarFechayHora()
    }
  }, { deep: true })

  // Watch para limpiar hora si cambia la fecha y la hora ya no es válida
  watch(fechaSeleccionada, (nuevaFecha) => {
    if (nuevaFecha && horaSeleccionada.value) {
      if (esHoy(nuevaFecha) && horaSeleccionada.value < horaMinima.value) {
        horaSeleccionada.value = null
      }
    }
  })

  // Obtener mes y año actual de la semana visible
  const mesYAnioActual = computed(() => {
    const fechaMedia = diasVisibles.value[3] || semanaActual.value
    return `${nombresMeses[fechaMedia.getMonth()]} ${fechaMedia.getFullYear()}`
  })

  const semanaSiguiente = () => {
    const nuevaFecha = new Date(semanaActual.value)
    nuevaFecha.setDate(nuevaFecha.getDate() + 7)
    semanaActual.value = nuevaFecha
  }

  const semanaAnterior = () => {
    const nuevaFecha = new Date(semanaActual.value)
    nuevaFecha.setDate(nuevaFecha.getDate() - 7)
    semanaActual.value = nuevaFecha
  }

  const esHoy = (fecha) => {
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  }

  const esMismaFecha = (fecha1, fecha2) => {
    if (!fecha1 || !fecha2) return false
    const f1 = new Date(fecha1)
    const f2 = new Date(fecha2)
    return f1.toDateString() === f2.toDateString()
  }

  const obtenerNombreDia = (fecha) => {
    const nombres = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    return nombres[fecha.getDay()]
  }

  const seleccionarDia = (fecha) => {
    if (esDiaPasado(fecha)) {
      return
    }
    fechaSeleccionada.value = fecha
  }

  const actualizarFechayHora = () => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return

    let fechaISO = ''

    if (fechaSeleccionada.value instanceof Date && !isNaN(fechaSeleccionada.value)) {
      fechaISO = fechaSeleccionada.value.toISOString().split('T')[0]
    } 
    else if (typeof fechaSeleccionada.value === 'string') {
      const partes = fechaSeleccionada.value.match(/(\d{1,2}) de (\w+) de (\d{4})/)
      if (partes) {
        const [_, dia, mesTexto, año] = partes
        const meses = {
          enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
          julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
        }
        const fecha = new Date(año, meses[mesTexto.toLowerCase()], dia)
        fechaISO = fecha.toISOString().split('T')[0]
      }
    }
    reservaStore.setFechaHora(fechaISO, horaSeleccionada.value)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ''

    let dateObj = null

    if (fecha instanceof Date && !isNaN(fecha)) {
      dateObj = fecha
    } else if (typeof fecha === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        dateObj = new Date(fecha + 'T00:00:00')
      } else {
        const partes = fecha.match(/(\d{1,2})\s+de\s+([a-zA-Záéíóúñ]+)\s+de\s+(\d{4})/i)
        if (partes) {
          const [, dia, mesTexto, anio] = partes
          const meses = {
            enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
            julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
          }
          const mesIndex = meses[mesTexto.toLowerCase()]
          if (mesIndex !== undefined) {
            dateObj = new Date(Number(anio), mesIndex, Number(dia))
          }
        } else {
          const intento = new Date(fecha)
          if (!isNaN(intento)) dateObj = intento
        }
      }
    }

    if (!dateObj || isNaN(dateObj)) return 'Invalid Date'

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return dateObj.toLocaleDateString('es-ES', opciones)
  }

  const formatearHora = (hora) => {
    if (!hora) return ''

    if (/^\d{1,2}:\d{2}$/.test(hora)) {
      const [hoursStr, minutes] = hora.split(':')
      const h = parseInt(hoursStr, 10)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      return `${h12}:${minutes} ${ampm}`
    }

    if (typeof hora === 'string') {
      const normalized = hora.replace(/\./g, '').trim()
      return normalized.toUpperCase()
    }

    return String(hora)
  }
</script>

<style scoped>
  .fecha-hora-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    color: white;
  }

  .titulo-fecha-hora {
    font-size: 1.8rem !important;
    font-weight: 800;
    color: white;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 30px !important;
  }

  .scroll-fecha-hora {
    max-height: 550px;
    overflow-y: auto;
    padding-right: 15px;
  }

  /* Scrollbar */
  .scroll-fecha-hora::-webkit-scrollbar {
    width: 6px;
  }

  .scroll-fecha-hora::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  .scroll-fecha-hora::-webkit-scrollbar-thumb {
    background: rgba(238, 111, 56, 0.3);
    border-radius: 10px;
  }

  .scroll-fecha-hora::-webkit-scrollbar-thumb:hover {
    background: #ee6f38;
  }

  .calendar-section, .time-section {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 20px !important;
    padding: 25px !important;
    margin-bottom: 30px !important;
  }

  .mes-anio {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ee6f38;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .btn-nav-calendar {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }

  .btn-nav-calendar:hover {
    background: rgba(238, 111, 56, 0.1) !important;
    border-color: #ee6f38 !important;
    color: #ee6f38 !important;
  }

  /* Diseño horizontal de días */
  .dias-horizontales {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
    margin-top: 20px;
  }

  .dia-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 5px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    user-select: none;
  }

  .dia-card:hover:not(.dia-deshabilitado) {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .dia-deshabilitado {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .dia-seleccionado {
    background: #ee6f38 !important;
    color: white !important;
    border-color: #ee6f38 !important;
    box-shadow: 0 8px 25px rgba(238, 111, 56, 0.4);
    transform: scale(1.05) translateY(-5px);
  }

  .dia-hoy:not(.dia-seleccionado) {
    border: 1px solid #ee6f38;
    background: rgba(238, 111, 56, 0.05);
  }

  .dia-nombre {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 5px;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5); /* Changed for better contrast */
  }

  .dia-seleccionado .dia-nombre {
    color: white;
    opacity: 0.9;
  }

  .dia-numero {
    font-size: 1.4rem;
    font-weight: 800;
    color: white; /* Changed for better contrast */
  }

  /* Selector de hora */
  .time-input {
    max-width: 300px;
    margin-bottom: 10px;
  }

  .time-input :deep(.v-field) {
    background: rgba(255, 255, 255, 0.03) !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }

  .time-input :deep(.v-field--focused) {
    border-color: #ee6f38 !important;
    box-shadow: 0 0 15px rgba(238, 111, 56, 0.2);
  }

  .time-input :deep(input[type="time"]) {
    font-family: 'Outfit', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: white !important;
  }

  .time-input :deep(input[type="time"]::-webkit-calendar-picker-indicator) {
    filter: invert(1) brightness(0.8) sepia(1) saturate(5) hue-rotate(-30deg);
    cursor: pointer;
    transform: scale(1.2);
  }

  .error-box {
    background: rgba(211, 47, 47, 0.1);
    color: #ff5252;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid rgba(211, 47, 47, 0.2);
  }

  .info-box {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .resumen-card {
    background: rgba(238, 111, 56, 0.05) !important;
    border: 1px solid rgba(238, 111, 56, 0.2) !important;
    border-radius: 15px !important;
  }

  /* Dark Calendar Styles */
  :deep(.v-date-picker) {
    background: #1a1a1a !important;
    color: white !important;
  }

  :deep(.v-date-picker-month__day--selected .v-btn) {
    background-color: #ee6f38 !important;
    color: white !important;
  }

  @media (max-width: 600px) {
    .fecha-hora-container {
      padding: 20px;
    }
    .dias-horizontales {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
