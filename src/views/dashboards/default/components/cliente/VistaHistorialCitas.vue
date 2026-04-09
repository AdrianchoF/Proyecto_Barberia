<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">
        <i class="fas fa-history mr-3" style="color: #9c27b0;"></i>
        Historial de Citas
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        Revisa tus citas completadas y canceladas
      </p>
    </div>

    <!-- Filtros -->
    <v-card class="mb-6 elevation-2" rounded="lg">
      <v-card-text>
        <v-chip-group v-model="filtroEstado" mandatory color="primary">
          <v-chip value="todas" variant="outlined">
            <i class="fas fa-list mr-2"></i>
            Todas
          </v-chip>
          <v-chip value="completada" variant="outlined">
            <i class="fas fa-check-circle mr-2"></i>
            Completadas
          </v-chip>
          <v-chip value="cancelada" variant="outlined">
            <i class="fas fa-times-circle mr-2"></i>
            Canceladas
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <div v-if="cargando" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-grey">Cargando historial...</p>
    </div>

    <!-- Sin citas en historial -->
    <v-card v-else-if="citasHistorial.length === 0" class="text-center py-12 elevation-2" rounded="lg">
      <i class="fas fa-folder-open fa-4x text-grey mb-4"></i>
      <h3 class="text-h5 mb-2">No hay citas en el historial</h3>
      <p class="text-grey">{{ getMensajeHistorialVacio() }}</p>
    </v-card>

    <!-- Lista de Citas del Historial -->
    <v-row v-else>
      <v-col
        v-for="cita in citasHistorial"
        :key="cita.id_cita"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="historial-card elevation-3"
          rounded="lg"
          :class="getCardClass(cita.estado)"
        >
          <!-- Estado Badge -->
          <div class="estado-badge" :class="getEstadoClass(cita.estado)">
            <i :class="getEstadoIcon(cita.estado)" class="mr-1"></i>
            {{ cita.estado.toUpperCase() }}
          </div>

          <v-card-text class="pb-2">
            <!-- Fecha y Hora -->
            <div class="mb-4">
              <div class="d-flex align-center mb-2">
                <i class="fas fa-calendar-alt fa-lg mr-3" style="color: #9c27b0; width: 24px;"></i>
                <div>
                  <div class="text-subtitle-2 text-grey">Fecha</div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatearFecha(cita.fecha) }}
                  </div>
                </div>
              </div>
              
              <div class="d-flex align-center">
                <i class="fas fa-clock fa-lg mr-3" style="color: #9c27b0; width: 24px;"></i>
                <div>
                  <div class="text-subtitle-2 text-grey">Hora</div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatearHora(cita.hora) }}
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Barbero -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="40" color="primary" class="mr-3">
                <i class="fas fa-user-tie" style="color: white;"></i>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 text-grey">Barbero</div>
                <div class="text-body-1 font-weight-medium">
                  {{ getNombreBarbero(cita.barbero) }}
                </div>
              </div>
            </div>

            <!-- Servicio -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="40" color="secondary" class="mr-3">
                <i class="fas fa-cut" style="color: white;"></i>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 text-grey">Servicio</div>
                <div class="text-body-1 font-weight-medium">
                  {{ getNombreServicio(cita.servicio) }}
                </div>
              </div>
            </div>

            <!-- Precio -->
            <div class="d-flex align-center">
              <i class="fas fa-dollar-sign fa-lg mr-3" style="color: #4caf50; width: 24px;"></i>
              <div>
                <div class="text-subtitle-2 text-grey">Precio</div>
                <div class="text-h6 font-weight-bold" style="color: #4caf50;">
                  ${{ getPrecioServicio(cita.servicio) }}
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- Estado final -->
          <v-card-actions class="px-4 pb-4">
            <v-chip
              block
              :color="cita.estado === 'completada' ? 'success' : 'error'"
              variant="flat"
              size="large"
              class="justify-center font-weight-bold"
            >
              <i :class="getEstadoIcon(cita.estado)" class="mr-2"></i>
              {{ cita.estado === 'completada' ? 'Servicio Completado' : 'Cita Cancelada' }}
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estadísticas -->
    <v-row v-if="citasHistorial.length > 0" class="mt-6">
      <v-col cols="12">
        <v-card class="elevation-2" rounded="lg">
          <v-card-title class="text-h6 pa-4">
            <i class="fas fa-chart-bar mr-2"></i>
            Resumen
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-grey-darken-2">
                    {{ estadisticas.total }}
                  </div>
                  <div class="text-caption text-grey">Total de citas</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-success">
                    {{ estadisticas.completadas }}
                  </div>
                  <div class="text-caption text-grey">Completadas</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-error">
                    {{ estadisticas.canceladas }}
                  </div>
                  <div class="text-caption text-grey">Canceladas</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    ${{ estadisticas.totalGastado }}
                  </div>
                  <div class="text-caption text-grey">Total gastado</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCitaStore } from '@/stores/cita'
import { useBarberStore } from '@/stores/barber'
import { useServiceStore } from '@/stores/services'
import { useAuthStore } from '@/stores/auth'

const citaStore = useCitaStore()
const barberStore = useBarberStore()
const serviceStore = useServiceStore()
const authStore = useAuthStore()

// Estado
const filtroEstado = ref('todas')
const cargando = ref(false)

// Computed - Citas del historial (completadas y canceladas)
const citasHistorial = computed(() => {
  if (!Array.isArray(citaStore.citas)) {
    return []
  }

  // Filtrar citas completadas y canceladas del usuario actual
  let citas = citaStore.citas.filter(
    (cita: any) => {
      const esDelUsuario = cita.cliente?.id === authStore.user?.id
      const esHistorial = cita.estado === 'completada' || cita.estado === 'cancelada'
      return esDelUsuario && esHistorial
    }
  )

  // Aplicar filtro de estado
  if (filtroEstado.value !== 'todas') {
    citas = citas.filter((cita: any) => cita.estado === filtroEstado.value)
  }

  // Ordenar por fecha y hora (más recientes primero)
  return citas.sort((a: any, b: any) => {
    const fechaA = new Date(`${a.fecha} ${a.hora}`)
    const fechaB = new Date(`${b.fecha} ${b.hora}`)
    return fechaB.getTime() - fechaA.getTime()
  })
})

// Estadísticas
const estadisticas = computed(() => {
  if (!Array.isArray(citaStore.citas)) {
    return { total: 0, completadas: 0, canceladas: 0, totalGastado: '0.00' }
  }

  const todasLasCitasHistorial = citaStore.citas.filter(
    (cita: any) => {
      const esDelUsuario = cita.cliente?.id === authStore.user?.id
      const esHistorial = cita.estado === 'completada' || cita.estado === 'cancelada'
      return esDelUsuario && esHistorial
    }
  )

  const completadas = todasLasCitasHistorial.filter((c: any) => c.estado === 'completada')
  const canceladas = todasLasCitasHistorial.filter((c: any) => c.estado === 'cancelada')

  // Calcular total gastado (solo en citas completadas)
  const totalGastado = completadas.reduce((sum: number, cita: any) => {
    const precio = parseFloat(cita.servicio?.precio || 0)
    return sum + (isNaN(precio) ? 0 : precio)
  }, 0)

  return {
    total: todasLasCitasHistorial.length,
    completadas: completadas.length,
    canceladas: canceladas.length,
    totalGastado: totalGastado.toFixed(2)
  }
})

// Métodos
const cargarDatos = async () => {
  cargando.value = true
  try {
    await Promise.all([
      citaStore.obtenerCitas(),
      barberStore.getBarbers(),
      serviceStore.getServices()
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    cargando.value = false
  }
}

const formatearFecha = (fecha: string) => {
  // Extraer solo YYYY-MM-DD para evitar conversión de zona horaria (UTC → local)
  const fechaSinHora = fecha.split('T')[0]
  const [year, month, day] = fechaSinHora.split('-').map(Number)
  const date = new Date(year, month - 1, day) // Sin UTC, sin desfase
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', opciones)
}

const formatearHora = (hora: string) => {
  const [hours, minutes] = hora.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

const getNombreBarbero = (barbero: any) => {
  if (!barbero) return 'Barbero no asignado'
  return `${barbero.nombre} ${barbero.apellido}`
}

const getNombreServicio = (servicio: any) => {
  if (!servicio) return 'Servicio no disponible'
  return servicio.nombre
}

const getPrecioServicio = (servicio: any) => {
  if (!servicio || !servicio.precio) return '0.00'
  const precio = parseFloat(servicio.precio)
  return isNaN(precio) ? '0.00' : precio.toFixed(2)
}

const getCardClass = (estado: string) => {
  return {
    'border-left-completada': estado === 'completada',
    'border-left-cancelada': estado === 'cancelada'
  }
}

const getEstadoClass = (estado: string) => {
  return {
    'estado-completada': estado === 'completada',
    'estado-cancelada': estado === 'cancelada'
  }
}

const getEstadoIcon = (estado: string) => {
  const icons: Record<string, string> = {
    completada: 'fas fa-check-circle',
    cancelada: 'fas fa-times-circle'
  }
  return icons[estado] || 'fas fa-question-circle'
}

const getMensajeHistorialVacio = () => {
  const mensajes: Record<string, string> = {
    todas: 'Aún no tienes citas en tu historial.',
    completada: 'No has completado ninguna cita todavía.',
    cancelada: 'No tienes citas canceladas en tu historial.'
  }
  return mensajes[filtroEstado.value] || ''
}

// Lifecycle
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.historial-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  opacity: 0.95;
}

.historial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  opacity: 1;
}

.border-left-completada {
  border-left: 5px solid #4caf50;
}

.border-left-cancelada {
  border-left: 5px solid #f44336;
}

.estado-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.estado-completada {
  background-color: #4caf50;
  color: white;
}

.estado-cancelada {
  background-color: #f44336;
  color: white;
}

@media (max-width: 600px) {
  .estado-badge {
    font-size: 0.65rem;
    padding: 4px 8px;
  }
}
</style>