<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="mb-6 d-flex align-center">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">
          <i class="fas fa-clipboard-list mr-3" style="color: #ee6f38;"></i>
          Gestionar Citas
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Administra todas las citas del sistema
        </p>
      </div>
      <v-btn
        color="#ee6f38"
        variant="flat"
        size="large"
        @click="exportarCSV"
        :disabled="citasFiltradas.length === 0"
      >
        <i class="fas fa-download mr-2"></i>
        Exportar CSV
      </v-btn>
    </div>

    <!-- Filtros y Búsqueda -->
    <v-card class="mb-6 elevation-2" rounded="lg">
      <v-card-text>
        <v-row>
          <!-- Búsqueda -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="busqueda"
              prepend-inner-icon="fas fa-search"
              label="Buscar por cliente o barbero"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            ></v-text-field>
          </v-col>

          <!-- Filtro por Estado -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filtroEstado"
              :items="opcionesEstado"
              label="Estado"
              variant="outlined"
              density="comfortable"
              hide-details
            ></v-select>
          </v-col>

          <!-- Filtro por Barbero -->
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filtroBarbero"
              :items="opcionesBarberos"
              item-title="text"
              item-value="value"
              label="Barbero"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            ></v-select>
          </v-col>

          <!-- Filtro por Fecha -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filtroFecha"
              type="date"
              label="Fecha"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Chips de filtros activos -->
        <div v-if="tienesFiltrosActivos" class="mt-4">
          <v-chip
            v-if="filtroEstado !== 'todas'"
            closable
            @click:close="filtroEstado = 'todas'"
            color="#ee6f38"
            variant="flat"
            class="mr-2"
          >
            Estado: {{ filtroEstado }}
          </v-chip>
          <v-chip
            v-if="filtroBarbero"
            closable
            @click:close="filtroBarbero = null"
            color="#ee6f38"
            variant="flat"
            class="mr-2"
          >
            Barbero: {{ getNombreBarberoById(filtroBarbero) }}
          </v-chip>
          <v-chip
            v-if="filtroFecha"
            closable
            @click:close="filtroFecha = ''"
            color="#ee6f38"
            variant="flat"
            class="mr-2"
          >
            Fecha: {{ formatearFecha(filtroFecha) }}
          </v-chip>
          <v-btn
            variant="text"
            size="small"
            @click="limpiarFiltros"
            color="#ee6f38"
          >
            Limpiar todos
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Estadísticas rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <div class="stat-chip">
          <i class="fas fa-calendar-check" style="color: #ee6f38;"></i>
          <span>{{ citasFiltradas.length }} citas encontradas</span>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="stat-chip">
          <i class="fas fa-clock text-primary"></i>
          <span>{{ contarPorEstado('agendada') }} agendadas</span>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="stat-chip">
          <i class="fas fa-check-circle text-success"></i>
          <span>{{ contarPorEstado('completada') }} completadas</span>
        </div>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <div class="stat-chip">
          <i class="fas fa-times-circle text-error"></i>
          <span>{{ contarPorEstado('cancelada') }} canceladas</span>
        </div>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="cargando" class="text-center py-12">
      <v-progress-circular indeterminate color="#ee6f38" size="64"></v-progress-circular>
      <p class="mt-4 text-grey">Cargando citas...</p>
    </div>

    <!-- Sin resultados -->
    <v-card v-else-if="citasFiltradas.length === 0" class="text-center py-12 elevation-2" rounded="lg">
      <i class="fas fa-inbox fa-4x text-grey mb-4"></i>
      <h3 class="text-h5 mb-2">No se encontraron citas</h3>
      <p class="text-grey mb-4">Intenta ajustar los filtros de búsqueda</p>
      <v-btn color="#ee6f38" variant="outlined" @click="limpiarFiltros">
        Limpiar filtros
      </v-btn>
    </v-card>

    <!-- Tabla de Citas -->
    <v-card v-else class="elevation-3" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="citasFiltradas"
        :items-per-page="10"
        :search="busqueda"
        class="elevation-0"
      >
        <!-- Cliente -->
        <template v-slot:item.cliente="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="40" color="primary" class="mr-3">
              <i class="fas fa-user" style="color: white;"></i>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ getNombreCliente(item.cliente) }}</div>
              <div class="text-caption text-grey">{{ item.cliente?.email || 'Sin email' }}</div>
            </div>
          </div>
        </template>

        <!-- Barbero -->
        <template v-slot:item.barbero="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="36" style="background-color: #ee6f38;" class="mr-2">
              <i class="fas fa-user-tie" style="color: white;"></i>
            </v-avatar>
            <span class="font-weight-medium">{{ getNombreBarbero(item.barbero) }}</span>
          </div>
        </template>

        <!-- Servicio -->
        <template v-slot:item.servicio="{ item }">
          <div>
            <div class="font-weight-medium">{{ getNombreServicio(item.servicio) }}</div>
            <div class="text-caption" style="color: #4caf50;">
              <i class="fas fa-dollar-sign"></i>
              ${{ getPrecioServicio(item.servicio) }}
            </div>
          </div>
        </template>

        <!-- Fecha -->
        <template v-slot:item.fecha="{ item }">
          <div class="text-center">
            <div class="font-weight-medium">{{ formatearFechaCorta(item.fecha) }}</div>
            <div class="text-caption text-grey">{{ getDiaSemana(item.fecha) }}</div>
          </div>
        </template>

        <!-- Hora -->
        <template v-slot:item.hora="{ item }">
          <v-chip color="grey-lighten-2" size="small">
            <i class="fas fa-clock mr-1"></i>
            {{ formatearHora(item.hora) }}
          </v-chip>
        </template>

        <!-- Estado -->
        <template v-slot:item.estado="{ item }">
          <v-chip
            :color="getColorEstado(item.estado)"
            variant="flat"
            size="small"
          >
            <i :class="getIconoEstado(item.estado)" class="mr-1"></i>
            {{ item.estado.toUpperCase() }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template v-slot:item.acciones="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              v-if="item.estado === 'agendada'"
              icon
              size="small"
              color="success"
              variant="text"
              @click="completarCita(item)"
              title="Completar cita"
            >
              <i class="fas fa-check"></i>
            </v-btn>
            <v-btn
              v-if="item.estado === 'agendada'"
              icon
              size="small"
              color="error"
              variant="text"
              @click="abrirModalCancelar(item)"
              title="Cancelar cita"
            >
              <i class="fas fa-times"></i>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="#ee6f38"
              variant="text"
              @click="verDetalles(item)"
              title="Ver detalles"
            >
              <i class="fas fa-eye"></i>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Cancelar -->
    <v-dialog v-model="modalCancelar" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h5 pa-6 bg-error">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Cancelar Cita
        </v-card-title>
        
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Estás seguro de que deseas cancelar esta cita?
          </p>
          
          <v-alert type="warning" variant="tonal" class="mb-4">
            Esta acción cambiará el estado de la cita a "cancelada"
          </v-alert>

          <div v-if="citaSeleccionada" class="pa-4 bg-grey-lighten-4 rounded">
            <div class="mb-2">
              <strong>Cliente:</strong> {{ getNombreCliente(citaSeleccionada.cliente) }}
            </div>
            <div class="mb-2">
              <strong>Fecha:</strong> {{ formatearFecha(citaSeleccionada.fecha) }}
            </div>
            <div class="mb-2">
              <strong>Hora:</strong> {{ formatearHora(citaSeleccionada.hora) }}
            </div>
            <div>
              <strong>Servicio:</strong> {{ getNombreServicio(citaSeleccionada.servicio) }}
            </div>
          </div>

          <!-- Motivo Obligatorio para Administrador -->
          <div class="mt-4">
            <v-textarea
              v-model="motivoCancelacion"
              label="Motivo de la cancelación"
              placeholder="Ej: Decisión administrativa, falta de personal, problemas técnicos..."
              variant="outlined"
              color="error"
              auto-grow
              rows="3"
              clearable
              hint="Requerido. Se notificará a AMBOS (Cliente y Barbero)."
              persistent-hint
              :rules="[v => !!v || 'Debes explicar el motivo']"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="cerrarModalCancelar" :disabled="cargandoAccion">
            No, mantener
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmarCancelacion"
            :loading="cargandoAccion"
            :disabled="!motivoCancelacion || motivoCancelacion.trim() === ''"
          >
            <i class="fas fa-times mr-2"></i>
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Detalles -->
    <v-dialog v-model="modalDetalles" max-width="600">
      <v-card v-if="citaSeleccionada" rounded="lg">
        <v-card-title class="pa-6" style="background-color: #ee6f38; color: white;">
          <i class="fas fa-info-circle mr-2"></i>
          Detalles de la Cita
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="detail-item">
                <i class="fas fa-hashtag detail-icon" style="color: #ee6f38;"></i>
                <div>
                  <div class="detail-label">ID de Cita</div>
                  <div class="detail-value">#{{ citaSeleccionada.id_cita }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-user detail-icon text-primary"></i>
                <div>
                  <div class="detail-label">Cliente</div>
                  <div class="detail-value">{{ getNombreCliente(citaSeleccionada.cliente) }}</div>
                  <div class="text-caption text-grey">{{ citaSeleccionada.cliente?.email }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-user-tie detail-icon" style="color: #ee6f38;"></i>
                <div>
                  <div class="detail-label">Barbero</div>
                  <div class="detail-value">{{ getNombreBarbero(citaSeleccionada.barbero) }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-calendar detail-icon text-primary"></i>
                <div>
                  <div class="detail-label">Fecha</div>
                  <div class="detail-value">{{ formatearFecha(citaSeleccionada.fecha) }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-clock detail-icon text-primary"></i>
                <div>
                  <div class="detail-label">Hora</div>
                  <div class="detail-value">{{ formatearHora(citaSeleccionada.hora) }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="detail-item">
                <i class="fas fa-cut detail-icon text-secondary"></i>
                <div>
                  <div class="detail-label">Servicio</div>
                  <div class="detail-value">{{ getNombreServicio(citaSeleccionada.servicio) }}</div>
                  <div class="text-caption text-grey">
                    {{ citaSeleccionada.servicio?.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-dollar-sign detail-icon text-success"></i>
                <div>
                  <div class="detail-label">Precio</div>
                  <div class="detail-value text-success">${{ getPrecioServicio(citaSeleccionada.servicio) }}</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-item">
                <i class="fas fa-flag detail-icon" :style="{ color: getColorEstado(citaSeleccionada.estado) }"></i>
                <div>
                  <div class="detail-label">Estado</div>
                  <v-chip :color="getColorEstado(citaSeleccionada.estado)" variant="flat">
                    {{ citaSeleccionada.estado.toUpperCase() }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="modalDetalles = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <i :class="snackbarIcon" class="mr-2"></i>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCitaStore } from '@/stores/cita'
import { useBarberStore } from '@/stores/barber'
import { useServiceStore } from '@/stores/services'

const route = useRoute()
const citaStore = useCitaStore()
const barberStore = useBarberStore()
const serviceStore = useServiceStore()

// Estado
const cargando = ref(false)
const cargandoAccion = ref(false)
const busqueda = ref('')
const filtroEstado = ref('todas')
const filtroBarbero = ref(null)
const filtroFecha = ref('')
const modalCancelar = ref(false)
const modalDetalles = ref(false)
const citaSeleccionada = ref(null)
const motivoCancelacion = ref('')

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('fas fa-check-circle')

// Headers de la tabla
const headers = [
  { title: 'Cliente', key: 'cliente', sortable: true },
  { title: 'Barbero', key: 'barbero', sortable: true },
  { title: 'Servicio', key: 'servicio', sortable: true },
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' }
]

// Opciones de filtros
const opcionesEstado = [
  { title: 'Todas', value: 'todas' },
  { title: 'Agendadas', value: 'agendada' },
  { title: 'Completadas', value: 'completada' },
  { title: 'Canceladas', value: 'cancelada' }
]

const opcionesBarberos = computed(() => {
  const barberos = barberStore.barbers.map(b => ({
    text: `${b.nombre} ${b.apellido}`,
    value: b.id
  }))
  return [{ text: 'Todos los barberos', value: null }, ...barberos]
})

// Citas filtradas
const citasFiltradas = computed(() => {
  console.log('🔄 Recalculando citasFiltradas...')
  console.log('📊 citaStore.citas:', citaStore.citas)
  
  if (!citaStore.citas || !Array.isArray(citaStore.citas)) {
    console.log('⚠️ citaStore.citas no es un array válido')
    return []
  }

  if (citaStore.citas.length === 0) {
    console.log('⚠️ citaStore.citas está vacío')
    return []
  }

  let citas = [...citaStore.citas]
  console.log('✅ Total de citas antes de filtrar:', citas.length)

  // Filtro por estado
  if (filtroEstado.value !== 'todas') {
    citas = citas.filter(c => c.estado === filtroEstado.value)
    console.log(`📌 Después de filtrar por estado "${filtroEstado.value}":`, citas.length)
  }

  // Filtro por barbero
  if (filtroBarbero.value) {
    citas = citas.filter(c => c.barbero?.id === filtroBarbero.value)
    console.log('📌 Después de filtrar por barbero:', citas.length)
  }

  // Filtro por fecha
  if (filtroFecha.value) {
    citas = citas.filter(c => {
      // Extraer solo la parte de la fecha (YYYY-MM-DD) sin considerar hora
      const fechaCita = c.fecha.split('T')[0]
      return fechaCita === filtroFecha.value
    })
    console.log('📌 Después de filtrar por fecha:', citas.length)
  }

  // Búsqueda por texto
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    citas = citas.filter(c => {
      const nombreCliente = `${c.cliente?.nombre || ''} ${c.cliente?.apellido || ''}`.toLowerCase()
      const nombreBarbero = `${c.barbero?.nombre || ''} ${c.barbero?.apellido || ''}`.toLowerCase()
      return nombreCliente.includes(termino) || nombreBarbero.includes(termino)
    })
    console.log('📌 Después de buscar:', citas.length)
  }

  // Ordenar por fecha y hora (más recientes primero)
  const citasOrdenadas = citas.sort((a, b) => {
    const fechaA = new Date(`${a.fecha} ${a.hora}`)
    const fechaB = new Date(`${b.fecha} ${b.hora}`)
    return fechaB.getTime() - fechaA.getTime()
  })

  console.log('✅ Total de citas filtradas final:', citasOrdenadas.length)
  return citasOrdenadas
})

const tienesFiltrosActivos = computed(() => {
  return filtroEstado.value !== 'todas' || filtroBarbero.value !== null || filtroFecha.value !== ''
})

// Métodos
const cargarDatos = async () => {
  console.log('🔄 Iniciando carga de datos...')
  cargando.value = true
  try {
    await Promise.all([
      citaStore.obtenerCitas(),
      barberStore.getBarbers(),
      serviceStore.getServices()
    ])
    console.log('✅ Datos cargados exitosamente')
    console.log('📊 Citas en store:', citaStore.citas)
  } catch (error) {
    console.error('❌ Error al cargar datos:', error)
  } finally {
    cargando.value = false
  }
}

const limpiarFiltros = () => {
  filtroEstado.value = 'todas'
  filtroBarbero.value = null
  filtroFecha.value = ''
  busqueda.value = ''
}

const contarPorEstado = (estado) => {
  return citasFiltradas.value.filter(c => c.estado === estado).length
}

const formatearFecha = (fecha) => {
  // Crear fecha sin problema de zona horaria
  const [year, month, day] = fecha.split('-')
  const date = new Date(year, month - 1, day)
  
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('es-ES', opciones)
}

const formatearFechaCorta = (fecha) => {
  // Crear fecha sin problema de zona horaria
  const [year, month, day] = fecha.split('-')
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getDiaSemana = (fecha) => {
  // Crear fecha sin problema de zona horaria
  const [year, month, day] = fecha.split('-')
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString('es-ES', { weekday: 'long' })
}

const formatearHora = (hora) => {
  const [hours, minutes] = hora.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

const getNombreCliente = (cliente) => {
  if (!cliente) return 'Cliente no disponible'
  return `${cliente.nombre} ${cliente.apellido}`
}

const getNombreBarbero = (barbero) => {
  if (!barbero) return 'Barbero no asignado'
  return `${barbero.nombre} ${barbero.apellido}`
}

const getNombreBarberoById = (id) => {
  const barbero = barberStore.barbers.find(b => b.id === id)
  return barbero ? `${barbero.nombre} ${barbero.apellido}` : 'Desconocido'
}

const getNombreServicio = (servicio) => {
  if (!servicio) return 'Servicio no disponible'
  return servicio.nombre
}

const getPrecioServicio = (servicio) => {
  if (!servicio || !servicio.precio) return '0.00'
  const precio = parseFloat(servicio.precio)
  return isNaN(precio) ? '0.00' : precio.toFixed(2)
}

const getColorEstado = (estado) => {
  const colores = {
    agendada: 'primary',
    completada: 'success',
    cancelada: 'error'
  }
  return colores[estado] || 'grey'
}

const getIconoEstado = (estado) => {
  const iconos = {
    agendada: 'fas fa-clock',
    completada: 'fas fa-check-circle',
    cancelada: 'fas fa-times-circle'
  }
  return iconos[estado] || 'fas fa-question-circle'
}

const abrirModalCancelar = (cita) => {
  citaSeleccionada.value = cita
  modalCancelar.value = true
}

const cerrarModalCancelar = () => {
  modalCancelar.value = false
  citaSeleccionada.value = null
  motivoCancelacion.value = ''
}

const confirmarCancelacion = async () => {
  if (!citaSeleccionada.value) return
  if (!motivoCancelacion.value || motivoCancelacion.value.trim() === '') {
    mostrarNotificacion('Debes proporcionar un motivo de cancelación', 'error')
    return
  }

  cargandoAccion.value = true
  try {
    const resultado = await citaStore.cancelarCita(citaSeleccionada.value.id_cita, motivoCancelacion.value)
    
    if (resultado.success) {
      mostrarNotificacion('Cita cancelada exitosamente', 'success')
      cerrarModalCancelar()
      await citaStore.obtenerCitas()
    } else {
      mostrarNotificacion(resultado.mensaje || 'Error al cancelar', 'error')
    }
  } catch (error) {
    mostrarNotificacion(error.response?.data?.message || 'Error al cancelar', 'error')
  } finally {
    cargandoAccion.value = false
  }
}

const completarCita = async (cita) => {
  cargandoAccion.value = true
  try {
    const response = await fetch(`http://localhost:3000/cita/${cita.id_cita}/completar`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Error al completar la cita')
    }

    mostrarNotificacion('Cita completada exitosamente', 'success')
    await citaStore.obtenerCitas()
  } catch (error) {
    mostrarNotificacion('Error al completar la cita', 'error')
  } finally {
    cargandoAccion.value = false
  }
}

const verDetalles = (cita) => {
  citaSeleccionada.value = cita
  modalDetalles.value = true
}

const exportarCSV = () => {
  const headers = ['ID', 'Cliente', 'Barbero', 'Servicio', 'Fecha', 'Hora', 'Estado', 'Precio']
  const rows = citasFiltradas.value.map(c => [
    c.id_cita,
    getNombreCliente(c.cliente),
    getNombreBarbero(c.barbero),
    getNombreServicio(c.servicio),
    formatearFechaCorta(c.fecha),
    c.hora,
    c.estado,
    getPrecioServicio(c.servicio)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `citas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  mostrarNotificacion('CSV exportado exitosamente', 'success')
}

const mostrarNotificacion = (texto, tipo) => {
  snackbarText.value = texto
  snackbarColor.value = tipo
  snackbarIcon.value = tipo === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
  snackbar.value = true
}

// Aplicar filtro inicial desde la URL
watch(() => route.query.estado, (estado) => {
  if (estado && typeof estado === 'string') {
    filtroEstado.value = estado
  }
}, { immediate: true })

onMounted(async () => {
  console.log('🚀 Componente montado, cargando datos...')
  await cargarDatos()
  console.log('📊 Estado final del store:', citaStore.citas)
})
</script>

<style scoped>
.stat-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-chip i {
  font-size: 1.5rem;
}

.stat-chip span {
  font-weight: 500;
  color: #424242;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f5f5f5;
}

.detail-icon {
  font-size: 1.5rem;
  margin-top: 4px;
}

.detail-label {
  font-size: 0.75rem;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: #212121;
}
</style>