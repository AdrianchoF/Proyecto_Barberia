<template>
  <v-container fluid class="pa-6">
    <!-- Header con estadísticas del día -->
    <v-card class="mb-6 elevation-3" rounded="lg" style="background: linear-gradient(135deg, #ee6f38 0%, #d85a28 100%);">
      <v-card-text class="pa-6 text-white">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <i class="fas fa-cut mr-3"></i>
              Mi Agenda
            </h1>
          </div>
          
          <!-- Estadísticas del día -->
          <div class="d-flex gap-6 flex-wrap">
            <div class="text-center">
              <div class="text-h3 font-weight-bold">{{ estadisticasHoy.total }}</div>
              <div class="text-caption opacity-80">Citas Hoy</div>
            </div>
            <v-divider vertical class="mx-2" style="opacity: 0.3;"></v-divider>
            <div class="text-center">
              <div class="text-h3 font-weight-bold">{{ estadisticasHoy.completadas }}</div>
              <div class="text-caption opacity-80">Completadas</div>
            </div>
            <v-divider vertical class="mx-2" style="opacity: 0.3;"></v-divider>
            <div class="text-center">
              <div class="text-h3 font-weight-bold">${{ estadisticasHoy.ganado }}</div>
              <div class="text-caption opacity-80">Ganado Hoy</div>
            </div>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="mt-4">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-caption">Progreso del día</span>
            <span class="text-caption font-weight-bold">{{ estadisticasHoy.porcentaje }}%</span>
          </div>
          <v-progress-linear :model-value="estadisticasHoy.porcentaje" height="8" rounded color="white" bg-color="rgba(255,255,255,0.3)"
          ></v-progress-linear>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-card class="elevation-3" rounded="lg">
      <v-tabs v-model="tabActual" bg-color="white" color="#ee6f38" align-tabs="start">
        <v-tab value="hoy">
          <i class="fas fa-calendar-day mr-2"></i>
          Hoy
          <v-chip v-if="citasHoy.length > 0" size="small" color="#ee6f38" class="ml-2">
            {{ citasHoy.length }}
          </v-chip>
        </v-tab>
        <v-tab value="proximas">
          <i class="fas fa-calendar-alt mr-2"></i>
          Próximas
          <v-chip v-if="citasProximas.length > 0" size="small" color="primary" class="ml-2">
            {{ citasProximas.length }}
          </v-chip>
        </v-tab>
        <v-tab value="historial">
          <i class="fas fa-history mr-2"></i>
          Historial
        </v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <!-- Loading -->
      <div v-if="cargando" class="text-center py-12">
        <v-progress-circular indeterminate color="#ee6f38" size="64"></v-progress-circular>
        <p class="mt-4 text-grey">Cargando agenda...</p>
      </div>

      <!-- Tab Content -->
      <v-window v-else v-model="tabActual">
        <!-- Tab: Hoy -->
        <v-window-item value="hoy">
          <v-card-text class="pa-6">
            <div v-if="citasHoy.length === 0" class="text-center py-12">
              <i class="fas fa-calendar-check fa-4x text-grey mb-4"></i>
              <h3 class="text-h5 mb-2">No tienes citas para hoy</h3>
              <p class="text-grey">¡Disfruta tu día libre! 😎</p>
            </div>

            <!-- Timeline de citas del día -->
            <v-timeline v-else side="end" align="start">
              <v-timeline-item v-for="cita in citasHoy" :key="cita.id_cita" :dot-color="getColorEstado(cita.estado)" size="large">
                <template v-slot:icon>
                  <i :class="getIconoEstado(cita.estado)"></i>
                </template>

                <v-card class="cita-card elevation-2" rounded="lg">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-chip :color="getColorEstado(cita.estado)" size="large" variant="flat">
                          <i class="fas fa-clock mr-2"></i>
                          {{ formatearHora(cita.hora) }}
                        </v-chip>
                        <v-chip :color="getColorEstado(cita.estado)" class="ml-2" size="small">
                          {{ cita.estado.toUpperCase() }}
                        </v-chip>
                      </div>
                    </div>

                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="info-item mb-3">
                          <v-avatar size="40" color="primary" class="mr-3">
                            <i class="fas fa-user" style="color: white;"></i>
                          </v-avatar>
                          <div>
                            <div class="text-caption text-grey">Cliente</div>
                            <div class="text-h6 font-weight-medium">
                              {{ getNombreCliente(cita.cliente) }}
                            </div>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="6">
                        <div class="info-item mb-3">
                          <v-avatar size="40" color="secondary" class="mr-3">
                            <i class="fas fa-cut" style="color: white;"></i>
                          </v-avatar>
                          <div>
                            <div class="text-caption text-grey">Servicio</div>
                            <div class="text-h6 font-weight-medium">
                              {{ getNombreServicio(cita.servicio) }}
                            </div>
                            <div class="text-caption text-success">
                              <i class="fas fa-dollar-sign"></i>
                              ${{ getPrecioServicio(cita.servicio) }}
                            </div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>

                    <!-- Botón completar y cancelar -->
                    <div v-if="cita.estado === 'agendada'" class="d-flex gap-2">
                      <v-btn class="flex-grow-1" size="large" color="success" variant="flat" @click="abrirModalCompletar(cita)" :loading="cargandoAccion">
                        <i class="fas fa-check-circle mr-2"></i>
                        Completar
                      </v-btn>
                      <v-btn color="error" variant="tonal" size="large" @click="abrirModalCancelar(cita)" :loading="cargandoAccion" title="Cancelar Cita">
                        <i class="fas fa-times"></i>
                      </v-btn>
                    </div>

                    <v-alert v-else :type="cita.estado === 'completada' ? 'success' : 'error'" variant="tonal">
                      <i :class="getIconoEstado(cita.estado)" class="mr-2"></i>
                      {{ cita.estado === 'completada' ? 'Servicio completado' : 'Cita cancelada' }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-window-item>

        <!-- Tab: Próximas -->
        <v-window-item value="proximas">
          <v-card-text class="pa-6">
            <div v-if="citasProximas.length === 0" class="text-center py-12">
              <i class="fas fa-calendar-times fa-4x text-grey mb-4"></i>
              <h3 class="text-h5 mb-2">No tienes citas próximas</h3>
              <p class="text-grey">Tu agenda está libre por ahora</p>
            </div>

            <v-row v-else>
              <v-col v-for="cita in citasProximas" :key="cita.id_cita" cols="12" md="6" lg="4">
                <v-card class="cita-card-futura elevation-2" rounded="lg">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-4">
                      <v-chip color="#ee6f38" variant="flat">
                        <i class="fas fa-calendar mr-1"></i>
                        {{ formatearFechaCorta(cita.fecha) }}
                      </v-chip>
                      <v-chip color="primary" size="small">
                        <i class="fas fa-clock mr-1"></i>
                        {{ formatearHora(cita.hora) }}
                      </v-chip>
                    </div>

                    <div class="info-item-compact mb-3">
                      <i class="fas fa-user text-primary mr-2"></i>
                      <span class="font-weight-medium">{{ getNombreCliente(cita.cliente) }}</span>
                    </div>

                    <div class="info-item-compact mb-3">
                      <i class="fas fa-cut text-secondary mr-2"></i>
                      <span>{{ getNombreServicio(cita.servicio) }}</span>
                    </div>

                    <div class="info-item-compact">
                      <i class="fas fa-dollar-sign text-success mr-2"></i>
                      <span class="font-weight-bold text-success">${{ getPrecioServicio(cita.servicio) }}</span>
                    </div>

                    <v-divider class="my-3"></v-divider>
                    <v-btn block color="error" variant="tonal" size="small" @click="abrirModalCancelar(cita)" :loading="cargandoAccion">
                      <i class="fas fa-times-circle mr-2"></i> Cancelar Cita
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>

        <!-- Tab: Historial -->
        <v-window-item value="historial">
          <v-card-text class="pa-6">
            <!-- Filtros -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select v-model="filtroHistorial" :items="opcionesFiltroHistorial" label="Filtrar por estado" variant="outlined" density="comfortable"></v-select>
              </v-col>
            </v-row>

            <!-- Estadísticas del historial -->
            <v-row class="mb-6">
              <v-col cols="12" sm="6" md="3">
                <v-card class="text-center pa-4" color="grey-lighten-4">
                  <div class="text-h4 font-weight-bold" style="color: #ee6f38;">
                    {{ estadisticasHistorial.total }}
                  </div>
                  <div class="text-caption text-grey">Total de citas</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="text-center pa-4" color="success-lighten-5">
                  <div class="text-h4 font-weight-bold text-success">
                    {{ estadisticasHistorial.completadas }}
                  </div>
                  <div class="text-caption text-grey">Completadas</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="text-center pa-4" color="error-lighten-5">
                  <div class="text-h4 font-weight-bold text-error">
                    {{ estadisticasHistorial.canceladas }}
                  </div>
                  <div class="text-caption text-grey">Canceladas</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="text-center pa-4" style="background-color: #e8f5e9;">
                  <div class="text-h4 font-weight-bold text-success">
                    ${{ estadisticasHistorial.totalGanado }}
                  </div>
                  <div class="text-caption text-grey">Total ganado</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Lista de historial -->
            <div v-if="citasHistorialFiltradas.length === 0" class="text-center py-12">
              <i class="fas fa-inbox fa-4x text-grey mb-4"></i>
              <h3 class="text-h5 mb-2">No hay citas en el historial</h3>
            </div>

            <v-data-table
              v-else :headers="headersHistorial" :items="citasHistorialFiltradas" :items-per-page="10">
              <template v-slot:item.fecha="{ item }">
                <div>
                  <div class="font-weight-medium">{{ formatearFechaCorta(item.fecha) }}</div>
                  <div class="text-caption text-grey">{{ getDiaSemana(item.fecha) }}</div>
                </div>
              </template>

              <template v-slot:item.hora="{ item }">
                <v-chip size="small" color="grey-lighten-2">
                  {{ formatearHora(item.hora) }}
                </v-chip>
              </template>

              <template v-slot:item.cliente="{ item }">
                {{ getNombreCliente(item.cliente) }}
              </template>

              <template v-slot:item.servicio="{ item }">
                <div>
                  <div>{{ getNombreServicio(item.servicio) }}</div>
                  <div class="text-caption text-success">
                    ${{ getPrecioServicio(item.servicio) }}
                  </div>
                </div>
              </template>

              <template v-slot:item.estado="{ item }">
                <v-chip :color="getColorEstado(item.estado)" size="small" variant="flat">
                  {{ item.estado.toUpperCase() }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Modal Completar Cita -->
    <v-dialog v-model="modalCompletar" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6" style="background-color: #4caf50; color: white;">
          <i class="fas fa-check-circle mr-2"></i>
          Completar Servicio
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Confirmas que has completado este servicio?
          </p>

          <v-alert type="info" variant="tonal" class="mb-4">
            Esta acción marcará la cita como completada
          </v-alert>

          <div v-if="citaSeleccionada" class="pa-4 bg-grey-lighten-4 rounded">
            <div class="mb-2">
              <strong>Cliente:</strong> {{ getNombreCliente(citaSeleccionada.cliente) }}
            </div>
            <div class="mb-2">
              <strong>Servicio:</strong> {{ getNombreServicio(citaSeleccionada.servicio) }}
            </div>
            <div class="mb-2">
              <strong>Hora:</strong> {{ formatearHora(citaSeleccionada.hora) }}
            </div>
            <div>
              <strong>Cobro:</strong> 
              <span class="text-success font-weight-bold">
                ${{ getPrecioServicio(citaSeleccionada.servicio) }}
              </span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="cerrarModalCompletar" :disabled="cargandoAccion">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" variant="flat" size="large" @click="confirmarCompletar" :loading="cargandoAccion">
            <i class="fas fa-check mr-2"></i>
            Sí, completar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Cancelar Cita -->
    <v-dialog v-model="modalCancelar" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-6" style="background-color: #f44336; color: white;">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Confirmar Cancelación
        </v-card-title>
        
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Estás seguro de que deseas cancelar esta cita?
          </p>
          
          <v-alert type="warning" variant="tonal" class="mb-4">
            Esta acción no se puede deshacer y notificará al cliente
          </v-alert>

          <div v-if="citaSeleccionada" class="pa-4 bg-grey-lighten-4 rounded">
            <div class="mb-2"><strong>Cliente:</strong> {{ getNombreCliente(citaSeleccionada.cliente) }}</div>
            <div class="mb-2"><strong>Servicio:</strong> {{ getNombreServicio(citaSeleccionada.servicio) }}</div>
            <div class="mb-2"><strong>Hora:</strong> {{ formatearHora(citaSeleccionada.hora) }}</div>
          </div>

          <!-- Motivo Obligatorio -->
          <div class="mt-4">
            <v-textarea
              v-model="motivoCancelacion"
              label="Motivo de la cancelación"
              placeholder="Ej: Máquina dañada, falta de luz, emergencia personal..."
              variant="outlined"
              color="error"
              auto-grow
              rows="3"
              clearable
              hint="Requerido para cancelar y notificar al cliente"
              persistent-hint
              :rules="[v => !!v || 'Debes explicar el motivo']"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn variant="text" @click="cerrarModalCancelar" :disabled="cargandoAccion">
            Mantener Cita
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="error" 
            variant="flat" 
            size="large" 
            @click="confirmarCancelar" 
            :loading="cargandoAccion"
            :disabled="!motivoCancelacion || motivoCancelacion.trim() === ''"
          >
            <i class="fas fa-times mr-2"></i> Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top">
      <i :class="snackbarIcon" class="mr-2"></i>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useCitaStore } from '@/stores/cita'
  import { useServiceStore } from '@/stores/services'
  import { useAuthStore } from '@/stores/auth'

  // Store
  const citaStore = useCitaStore()
  const serviceStore = useServiceStore()
  const authStore = useAuthStore()

  // Estado
  const tabActual = ref('hoy')
  const cargando = ref(false)
  const cargandoAccion = ref(false)
  const modalCompletar = ref(false)
  const modalCancelar = ref(false)
  const citaSeleccionada = ref(null)
  const motivoCancelacion = ref('')
  const filtroHistorial = ref('todas')

  // Snackbar
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')
  const snackbarIcon = ref('fas fa-check-circle')

  // Opciones filtro historial
  const opcionesFiltroHistorial = [
    { title: 'Todas', value: 'todas' },
    { title: 'Completadas', value: 'completada' },
    { title: 'Canceladas', value: 'cancelada' }
  ]

  // Headers tabla historial
  const headersHistorial = [
    { title: 'Fecha', key: 'fecha' },
    { title: 'Hora', key: 'hora' },
    { title: 'Cliente', key: 'cliente' },
    { title: 'Servicio', key: 'servicio' },
    { title: 'Estado', key: 'estado' }
  ]

  // Computed - Mis citas (del barbero logueado)
  const misCitas = computed(() => {
    if (!Array.isArray(citaStore.citas) || !authStore.user) return []
    
    console.log('🔍 Filtrando citas para barbero ID:', authStore.user.id)
    
    return citaStore.citas.filter(cita => cita.barbero?.id === authStore.user.id)
  })

  // Citas de hoy
  const citasHoy = computed(() => {
    const hoy = new Date()
    const year = hoy.getFullYear()
    const month = String(hoy.getMonth() + 1).padStart(2, '0')
    const day = String(hoy.getDate()).padStart(2, '0')
    const fechaHoy = `${year}-${month}-${day}`

    return misCitas.value
      .filter(cita => {
        const fechaCita = cita.fecha.split('T')[0]
        return fechaCita === fechaHoy
      })
      .sort((a, b) => a.hora.localeCompare(b.hora))
  })

  // Citas próximas (futuras, no hoy)
  const citasProximas = computed(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    return misCitas.value
      .filter(cita => {
        if (cita.estado !== 'agendada') return false
        
        const [year, month, day] = cita.fecha.split('T')[0].split('-')
        const fechaCita = new Date(year, month - 1, day)
        
        return fechaCita > hoy
      })
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha} ${a.hora}`)
        const fechaB = new Date(`${b.fecha} ${b.hora}`)
        return fechaA.getTime() - fechaB.getTime()
      })
      .slice(0, 12) // Limitar a las próximas 12 citas
  })

  // Citas historial
  const citasHistorial = computed(() => {
    return misCitas.value.filter(cita => 
      cita.estado === 'completada' || cita.estado === 'cancelada'
    ).sort((a, b) => {
      const fechaA = new Date(`${a.fecha} ${a.hora}`)
      const fechaB = new Date(`${b.fecha} ${b.hora}`)
      return fechaB.getTime() - fechaA.getTime()
    })
  })

  const citasHistorialFiltradas = computed(() => {
    if (filtroHistorial.value === 'todas') return citasHistorial.value
    return citasHistorial.value.filter(c => c.estado === filtroHistorial.value)
  })

  // Estadísticas de hoy
  const estadisticasHoy = computed(() => {
    const total = citasHoy.value.length
    const completadas = citasHoy.value.filter(c => c.estado === 'completada').length
    
    const ganado = citasHoy.value
      .filter(c => c.estado === 'completada')
      .reduce((sum, cita) => {
        const precio = parseFloat(cita.servicio?.precio || 0)
        return sum + (isNaN(precio) ? 0 : precio)
      }, 0)

    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0

    return {
      total,
      completadas,
      ganado: ganado.toFixed(2),
      porcentaje
    }
  })

  // Estadísticas historial
  const estadisticasHistorial = computed(() => {
    const total = citasHistorial.value.length
    const completadas = citasHistorial.value.filter(c => c.estado === 'completada').length
    const canceladas = citasHistorial.value.filter(c => c.estado === 'cancelada').length
    
    const totalGanado = citasHistorial.value
      .filter(c => c.estado === 'completada')
      .reduce((sum, cita) => {
        const precio = parseFloat(cita.servicio?.precio || 0)
        return sum + (isNaN(precio) ? 0 : precio)
      }, 0)

    return {
      total,
      completadas,
      canceladas,
      totalGanado: totalGanado.toFixed(2)
    }
  })

  // Métodos
  const cargarDatos = async () => {
    cargando.value = true
    try {
      await Promise.all([
        citaStore.obtenerCitas(),
        serviceStore.getServices()
      ])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      cargando.value = false
    }
  }

  const formatearFecha = (fecha) => {
    const fechaSinHora = fecha.split('T')[0]
    const [year, month, day] = fechaSinHora.split('-')
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatearFechaCorta = (fecha) => {
    const fechaSinHora = fecha.split('T')[0]
    const [year, month, day] = fechaSinHora.split('-')
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getDiaSemana = (fecha) => {
    const fechaSinHora = fecha.split('T')[0]
    const [year, month, day] = fechaSinHora.split('-')
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
      agendada: '#ee6f38',
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

  const abrirModalCompletar = (cita) => {
    citaSeleccionada.value = cita
    modalCompletar.value = true
  }

  const cerrarModalCompletar = () => {
    modalCompletar.value = false
    citaSeleccionada.value = null
  }

  const confirmarCompletar = async () => {
    if (!citaSeleccionada.value) return

    cargandoAccion.value = true
    try {
      const response = await fetch(`http://localhost:3000/cita/${citaSeleccionada.value.id_cita}/completar`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al completar la cita')
      }

      mostrarNotificacion('¡Servicio completado exitosamente! 🎉', 'success')
      cerrarModalCompletar()
      await citaStore.obtenerCitas()
    } catch (error) {
      mostrarNotificacion('Error al completar el servicio', 'error')
    } finally {
      cargandoAccion.value = false
    }
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

  const confirmarCancelar = async () => {
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
        throw new Error(resultado.mensaje || 'Error al cancelar la cita')
      }
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al cancelar la cita', 'error')
    } finally {
      cargandoAccion.value = false
    }
  }

  const mostrarNotificacion = (texto, tipo) => {
    snackbarText.value = texto
    snackbarColor.value = tipo
    snackbarIcon.value = tipo === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
    snackbar.value = true
  }

  onMounted(async () => {
    await cargarDatos()
  })
</script>

<style scoped>
  .cita-card {
    transition: all 0.3s ease;
    border-left: 4px solid #ee6f38;
  }

  .cita-card:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(238, 111, 56, 0.2) !important;
  }

  .cita-card-futura {
    transition: all 0.3s ease;
  }

  .cita-card-futura:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  }

  .info-item {
    display: flex;
    align-items: center;
  }

  .info-item-compact {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
</style>