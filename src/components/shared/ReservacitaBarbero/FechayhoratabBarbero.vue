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
            <v-menu v-model="mostrarCalendario" :close-on-content-click="false" location="bottom end" offset="12">
              <template v-slot:activator="{ props: menuProps }">
                <v-btn icon size="small" variant="flat" class="btn-nav-calendar" v-bind="menuProps" title="Ver calendario completo">
                  <i class="fas fa-calendar-alt"></i>
                </v-btn>
              </template>

              <v-card min-width="320" class="booking-card">
                <v-card-text class="pa-0">
                  <v-date-picker 
                    v-model="fechaCalendario" 
                    :min="fechaMinima" 
                    color="#ee6f38" 
                    show-adjacent-months 
                    hide-header 
                    elevation="0" 
                    theme="dark" 
                    @update:model-value="aplicarFechaCalendario"
                  ></v-date-picker>
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

        <div class="dias-horizontales">
          <div v-for="(date, index) in diasVisibles" :key="index" class="dia-card"
            :class="{ 
              'dia-seleccionado': esMismaFecha(date, fechaSeleccionada),
              'dia-hoy': esHoy(date) && !esMismaFecha(date, fechaSeleccionada),
              'dia-deshabilitado': esDiaPasado(date) || !esDiaHabilitado(date)
            }"
            @click="(!esDiaPasado(date) && esDiaHabilitado(date)) ? seleccionarDia(date) : null"
          >
            <span class="dia-nombre">{{ obtenerNombreDia(date) }}</span>
            <span class="dia-numero">{{ date ? date.getDate() : '' }}</span>
          </div>
        </div>
      </v-card>

      <!-- 🔹 Selector de hora con Franjas Horarias -->
      <v-card class="time-section" elevation="0">
        <v-label class="text-subtitle-1 mb-4 text-white font-weight-bold">
            <i class="fas fa-clock mr-2 text-orange"></i>
            Elegir Hora
        </v-label>
        
        <div v-if="!fechaSeleccionada" class="text-center py-8 text-white">
          <i class="fas fa-calendar-day mb-3 d-block" style="font-size: 40px; opacity: 0.2;"></i>
          Selecciona una fecha para ver los horarios del barbero
        </div>
        
        <div v-else>
           <div v-if="cargandoFranjas" class="text-center py-8">
              <v-progress-circular indeterminate color="orange" size="40"></v-progress-circular>
              <p class="mt-4 text-white opacity-60">Consultando disponibilidad...</p>
           </div>
           
           <div v-else-if="franjasDisponibles.length === 0" class="error-box text-center py-4">
              <i class="fas fa-calendar-times mr-2" style="font-size: 24px;"></i>
              <p class="mt-2 mb-0">El profesional no tiene horarios disponibles para este día o duración.</p>
           </div>
           
           <div v-else class="franjas-grid">
               <div
                  v-for="franja in franjasDisponibles"
                  :key="franja.id_franja"
                  class="time-chip-wrapper"
                  :class="horaSeleccionada === franja.hora_inicio ? 'time-chip-selected' : 'time-chip'"
                  @click="seleccionarHora(franja.hora_inicio)"
                >
                  <i class="fas fa-clock mr-2" :class="horaSeleccionada === franja.hora_inicio ? 'text-white' : 'text-orange'"></i>
                  {{ formatearHora(franja.hora_inicio) }}
               </div>
           </div>
        </div>
      </v-card>

      <div v-if="fechaSeleccionada && horaSeleccionada" class="resumen-seleccion mt-6">
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
  import { useReservaBarberoStore } from '@/stores/reservaBarbero'
  import { useServiceStore } from '@/stores/services'
  import { useCitaStore } from '@/stores/cita'

  const reservaBarberoStore = useReservaBarberoStore()
  const serviceStore = useServiceStore()
  const citaStore = useCitaStore()
  const emit = defineEmits(['emit-fechay-hora', 'estado-fechayhora-siguiente'])
  
  const fechaSeleccionada = ref(null)
  const horaSeleccionada = ref(null)
  const semanaActual = ref(new Date())
  const horaActual = ref(new Date())
  const intervalId = ref(null)
  const mostrarCalendario = ref(false)
  const fechaCalendario = ref(null)
  const horasOcupadas = ref([])
  const cargandoFranjas = ref(false)
  
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const fechaMinima = computed(() => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  })

  // ✅ Calcular duración total de los servicios seleccionados
  const duracionTotal = computed(() => {
    if (!reservaBarberoStore.serviciosSeleccionados || reservaBarberoStore.serviciosSeleccionados.length === 0) return 30
    
    return reservaBarberoStore.serviciosSeleccionados.reduce((total, id) => {
      const servicio = serviceStore.services.find(s => s.id === id)
      if (servicio) {
        // Formato esperado: "HH:mm:ss" o "30" (minutos)
        const duracion = servicio.duracionAprox || '00:30:00'
        if (duracion.includes(':')) {
          const [h, m] = duracion.split(':').map(Number)
          return total + (h * 60) + m
        }
        return total + parseInt(duracion)
      }
      return total
    }, 0)
  })

  // Obtener nombre dia sin tildes para map
  const obtenerDiaStoreName = (fecha) => {
     if (!fecha) return '';
     const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
     return diasSemana[fecha.getDay()];
  }

  // Verifica si un dia de la semana especifico esta habilitado por el barbero
  const esDiaHabilitado = (fecha) => {
      if (!fecha) return false;
      const diaStore = obtenerDiaStoreName(fecha);
      const diasDisponibles = reservaBarberoStore.diasDisponiblesBarbero || [];
      return diasDisponibles.includes(diaStore);
  }

  const aplicarFechaCalendario = (fecha) => {
    if (fecha) {
      const fechaObj = new Date(fecha)
      if (!esDiaHabilitado(fechaObj)) return
      fechaSeleccionada.value = fechaObj
      semanaActual.value = new Date(fechaObj)
      mostrarCalendario.value = false
    }
  }

  const esDiaPasado = (fecha) => {
    if (!fecha) return true;
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaComparar = new Date(fecha)
    fechaComparar.setHours(0, 0, 0, 0)
    return fechaComparar < hoy
  }

  // 🔥 ALGORITMO DE GENERACIÓN DE FRANJAS
  const franjasDisponibles = computed(() => {
      if (!fechaSeleccionada.value) return [];
      const diaStore = obtenerDiaStoreName(fechaSeleccionada.value);
      const jornadas = reservaBarberoStore.horariosBarbero.filter(h => h.Dia_semana === diaStore);
      
      if (jornadas.length === 0) return [];

      const franjas = [];
      const duracionMinutos = duracionTotal.value;
      const gap = 0; // Podría añadirse un gap entre citas si se requiere

      jornadas.forEach(jornada => {
          let actual = timeToMinutes(jornada.hora_inicio);
          const fin = timeToMinutes(jornada.hora_fin);

          while (actual + duracionMinutos <= fin) {
              const inicioStr = minutesToTime(actual);
              const finStr = minutesToTime(actual + duracionMinutos);

              // Validar contra horas ocupadas
              const estaOcupada = horasOcupadas.value.some(ocupada => {
                  const oInicio = timeToMinutes(ocupada.hora_inicio);
                  const oFin = timeToMinutes(ocupada.hora_fin);
                  // Hay solapamiento si:
                  return (actual < oFin && actual + duracionMinutos > oInicio);
              });

              // Validar contra hora actual si es hoy
              let esPasada = false;
              if (esHoy(fechaSeleccionada.value)) {
                  const ahoraMins = (horaActual.value.getHours() * 60) + horaActual.value.getMinutes();
                  if (actual <= ahoraMins) esPasada = true;
              }

              if (!estaOcupada && !esPasada) {
                  franjas.push({
                      id_franja: `${inicioStr}-${finStr}`,
                      hora_inicio: inicioStr,
                      hora_fin: finStr
                  });
              }

              // Incrementar por la duración del servicio (o por un bloque fijo si se prefiere)
              actual += duracionMinutos; 
          }
      });

      return franjas;
  })

  // Helpers para conversión de tiempo
  const timeToMinutes = (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h * 60) + m;
  }

  const minutesToTime = (totalMinutes) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  }

  // Cargar horas ocupadas cuando cambia la fecha
  watch(fechaSeleccionada, async (nuevaFecha) => {
      if (nuevaFecha && reservaBarberoStore.barberoPreseleccionado) {
          cargandoFranjas.value = true;
          try {
              const fechaISO = nuevaFecha.toISOString().split('T')[0];
              const result = await citaStore.obtenerHorasOcupadasBarbero(
                  reservaBarberoStore.barberoPreseleccionado.id, 
                  fechaISO
              );
              horasOcupadas.value = result.horasOcupadas || [];
          } catch (error) {
              console.error("Error cargando disponibilidad:", error);
          } finally {
              cargandoFranjas.value = false;
          }
      }
  })

  const iniciarActualizacionHora = () => {
    horaActual.value = new Date()
    intervalId.value = setInterval(() => {
        horaActual.value = new Date()
    }, 60000)
  }

  const detenerActualizacionHora = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }

  onMounted(() => {
    iniciarActualizacionHora()
    // Recuperar de la store si existe
    if (reservaBarberoStore.fechaSeleccionada) {
      const f = reservaBarberoStore.fechaSeleccionada
      fechaSeleccionada.value = typeof f === 'string' ? new Date(f + 'T00:00:00') : f
      semanaActual.value = new Date(fechaSeleccionada.value)
      fechaCalendario.value = fechaSeleccionada.value
    }
    if (reservaBarberoStore.horaSeleccionada) {
      horaSeleccionada.value = reservaBarberoStore.horaSeleccionada
    }
  })

  onUnmounted(() => {
    detenerActualizacionHora()
  })

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

  watch([fechaSeleccionada, horaSeleccionada], ([nuevaFecha, nuevaHora]) => {
    const esValido = !!(nuevaFecha && nuevaHora && nuevaHora.trim() !== '')
    emit('estado-fechayhora-siguiente', esValido)
    if (esValido) {
      actualizarFechayHora()
    }
  })

  const mesYAnioActual = computed(() => {
    const fechaMedia = (diasVisibles.value && diasVisibles.value[3]) || semanaActual.value
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

  const esHoy = (fecha) => fecha && fecha.toDateString() === new Date().toDateString()
  const esMismaFecha = (fecha1, fecha2) => fecha1 && fecha2 && fecha1.toDateString() === fecha2.toDateString()
  const obtenerNombreDia = (fecha) => fecha ? ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][fecha.getDay()] : ''

  const seleccionarDia = (fecha) => {
    fechaSeleccionada.value = fecha
    horaSeleccionada.value = null
  }

  const seleccionarHora = (hora) => {
    horaSeleccionada.value = hora
  }

  const actualizarFechayHora = () => {
    if (!fechaSeleccionada.value || !horaSeleccionada.value) return
    const fechaISO = fechaSeleccionada.value.toISOString().split('T')[0]
    reservaBarberoStore.setFechaHora(fechaISO, horaSeleccionada.value)
    emit('emit-fechay-hora', { fecha: fechaISO, hora: horaSeleccionada.value })
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return fecha.toLocaleDateString('es-ES', options)
  }

  const formatearHora = (hora) => {
    if (!hora) return ''
    const [hStr, m] = hora.split(':')
    const h = parseInt(hStr)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${ampm}`
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

  .scroll-fecha-hora::-webkit-scrollbar { width: 6px; }
  .scroll-fecha-hora::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
  .scroll-fecha-hora::-webkit-scrollbar-thumb { background: rgba(238, 111, 56, 0.3); border-radius: 10px; }

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
    transition: all 0.3s ease;
  }

  .dia-card:hover:not(.dia-deshabilitado) {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }

  .dia-seleccionado {
    background: #ee6f38 !important;
    color: white !important;
    border-color: #ee6f38 !important;
    box-shadow: 0 8px 25px rgba(238, 111, 56, 0.4);
    transform: scale(1.05) translateY(-5px);
  }

  .dia-deshabilitado { opacity: 0.2; cursor: not-allowed; }

  .dia-nombre {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.5);
  }

  .dia-seleccionado .dia-nombre { color: white; }

  .dia-numero {
    font-size: 1.4rem;
    font-weight: 800;
    color: white;
  }

  .franjas-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
  }
  
  .time-chip-wrapper {
      padding: 10px 20px;
      border-radius: 50px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
  }

  .time-chip {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.8) !important;
  }
  
  .time-chip:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      border-color: rgba(238, 111, 56, 0.5) !important;
      color: white !important;
      transform: translateY(-2px);
  }
  
  .time-chip-selected {
      background: #ee6f38 !important;
      border-color: #ee6f38 !important;
      color: white !important;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(238, 111, 56, 0.4);
      transform: translateY(-2px);
  }

  .error-box {
    background: rgba(211, 47, 47, 0.1);
    color: #ff5252;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 0.85rem;
    border: 1px solid rgba(211, 47, 47, 0.2);
  }

  .resumen-card {
    background: rgba(238, 111, 56, 0.05) !important;
    border: 1px solid rgba(238, 111, 56, 0.2) !important;
    border-radius: 15px !important;
  }

  :deep(.v-date-picker) { background: #1a1a1a !important; color: white !important; }
</style>