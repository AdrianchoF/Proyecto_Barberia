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

      <!-- 🔹 Selector de hora con Grid de Chips Moderno -->
      <v-card class="time-section" elevation="0">
        <v-label class="text-subtitle-1 mb-4 text-white font-weight-bold">
            <i class="fas fa-clock mr-2 text-orange"></i>
            Selecciona una Hora
        </v-label>
        
        <div v-if="!fechaSeleccionada" class="text-center py-8 text-white">
          <i class="fas fa-calendar-day mb-3 d-block" style="font-size: 40px; opacity: 0.2;"></i>
          Selecciona una fecha para ver horarios disponibles
        </div>
        
        <div v-else>
          <!-- Mensaje si no hay horas disponibles para hoy -->
          <div v-if="horariosDisponibles.length === 0" class="no-availability-box">
             <i class="fas fa-moon mb-2 d-block" style="font-size: 30px;"></i>
             <p class="ma-0">No hay más citas disponibles para hoy.</p>
             <p class="text-caption opacity-70">Por favor, selecciona otro día.</p>
          </div>

          <div v-else>
            <!-- Grupos de horarios (Mañana, Tarde, Noche) -->
            <div v-for="(grupo, nombre) in horariosAgrupados" :key="nombre" class="mb-4">
              <span class="grupo-label">{{ nombre }}</span>
              <div class="time-grid">
                <div 
                  v-for="slot in grupo" 
                  :key="slot.hora"
                  class="time-chip"
                  :class="{ 'chip-seleccionado': horaSeleccionada === slot.hora }"
                  @click="seleccionarHora(slot.hora)"
                >
                  {{ slot.formato12 }}
                </div>
              </div>
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

  // 🆕 Computed para los horarios disponibles filtrados
  const horariosDisponibles = computed(() => {
    if (!fechaSeleccionada.value) return []
    
    const slots = []
    const inicio = 8 // 8:00 AM
    const fin = 21   // 9:00 PM
    const intervalo = 30 // Minutos
    
    // Si es hoy, calcular el tiempo mínimo (ahora + 15 minutos)
    let minHoras = 0
    let minMinutos = 0
    const esDiaHoy = esHoy(fechaSeleccionada.value)
    
    if (esDiaHoy) {
      const ahora = new Date()
      // Añadir 15 minutos de margen
      const margen = new Date(ahora.getTime() + 15 * 60000)
      minHoras = margen.getHours()
      minMinutos = margen.getMinutes()
    }
    
    for (let h = inicio; h <= fin; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        // No pasar de las 21:00
        if (h === 21 && m > 0) break
        
        const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        
        // Filtrar si es hoy y la hora ya pasó (o está dentro del margen)
        if (esDiaHoy) {
          if (h < minHoras || (h === minHoras && m < minMinutos)) {
            continue
          }
        }
        
        // Formato 12h para mostrar
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        const formato12 = `${h12}:${String(m).padStart(2, '0')} ${ampm}`
        
        slots.push({ hora: horaStr, formato12 })
      }
    }
    
    return slots
  })

  // Agrupar horarios por periodo
  const horariosAgrupados = computed(() => {
    const grupos = {
      'Mañana': [],
      'Tarde': [],
      'Noche': []
    }
    
    horariosDisponibles.value.forEach(slot => {
      const [h] = slot.hora.split(':').map(Number)
      if (h < 12) grupos['Mañana'].push(slot)
      else if (h < 18) grupos['Tarde'].push(slot)
      else grupos['Noche'].push(slot)
    })
    
    // Eliminar grupos vacíos
    return Object.fromEntries(Object.entries(grupos).filter(([_, v]) => v.length > 0))
  })

  const seleccionarHora = (hora) => {
    horaSeleccionada.value = hora
  }

  // Comprobar si la hora seleccionada sigue siendo válida al actualizar
  const esHoraInvalida = computed(() => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return false
    
    // Verificar si la hora seleccionada está en los horarios disponibles
    return !horariosDisponibles.value.some(h => h.hora === horaSeleccionada.value)
  })



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
      // Si la hora ya no está disponible en la nueva fecha, limpiarla
      if (!horariosDisponibles.value.some(h => h.hora === horaSeleccionada.value)) {
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

  const obtenerFechaISOLocal = (fecha) => {
    if (!(fecha instanceof Date)) return fecha
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    return `${anio}-${mes}-${dia}`
  }

  const actualizarFechayHora = () => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return

    let fechaISO = ''

    if (fechaSeleccionada.value instanceof Date && !isNaN(fechaSeleccionada.value)) {
      fechaISO = obtenerFechaISOLocal(fechaSeleccionada.value)
    } 
    else if (typeof fechaSeleccionada.value === 'string') {
      const partes = fechaSeleccionada.value.match(/(\d{1,2}) de (\w+) de (\d{4})/)
      if (partes) {
        const [_, diaNum, mesTexto, año] = partes
        const meses = {
          enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
          julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
        }
        const fecha = new Date(Number(año), meses[mesTexto.toLowerCase()], Number(diaNum))
        fechaISO = obtenerFechaISOLocal(fecha)
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

  /* Selector de hora Grid */
  .time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .time-chip {
    padding: 10px 5px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
  }

  .time-chip:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    color: white;
  }

  .chip-seleccionado {
    background: linear-gradient(135deg, #ee6f38 0%, #fe9037 100%) !important;
    color: white !important;
    border-color: #ee6f38 !important;
    box-shadow: 0 5px 15px rgba(238, 111, 56, 0.4);
    transform: scale(1.05);
  }

  .grupo-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #ee6f38;
    margin-bottom: 10px;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .no-availability-box {
    text-align: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
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
