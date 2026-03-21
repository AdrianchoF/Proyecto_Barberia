import { defineStore } from "pinia";

interface Barbero {
  id: number
  nombre: string
  apellido: string
  foto: string
}

interface ReservaState {
  fechaSeleccionada: string | null
  horaSeleccionada: string | null
  barberoSeleccionado: Barbero | null
  serviciosSeleccionados: number[] // IDs de servicios
  currentTab: number // Índice del tab actual
}

export const useReservaStore = defineStore('reserva', {
  state: (): ReservaState => {
    const saved = localStorage.getItem('reserva_state')
    return saved ? JSON.parse(saved) : {
      fechaSeleccionada: null,
      horaSeleccionada: null,
      barberoSeleccionado: null,
      serviciosSeleccionados: [],
      currentTab: 0
    }
  },

  getters: {
    // Obtener el día de la semana en español (sin acentos)
    diaSemana: (state) => {
      if (!state.fechaSeleccionada) return null
      
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
      const fecha = new Date(state.fechaSeleccionada + 'T00:00:00')
      return diasSemana[fecha.getDay()]
    },


    // Verificar si hay fecha y hora seleccionadas
    tieneFechaYHora: (state) => {
      return !!(state.fechaSeleccionada && state.horaSeleccionada)
    },

    // ✅ NUEVO: Verificar si el tab actual debe tener botón habilitado
    botonHabilitadoPorTab: (state) => {
      switch(state.currentTab) {
        case 0: // Servicios
          return state.serviciosSeleccionados.length > 0
        case 1: // Fecha y Hora
          return !!(state.fechaSeleccionada && state.horaSeleccionada)
        case 2: // Profesional
          return !!state.barberoSeleccionado
        case 3: // Confirmación
          return false // Se maneja desde el componente
        default:
          return false
      }
    }
  },

  actions: {
    // ✅ Actualizar servicios
    setServicios(serviciosIds: number[]) {
      this.serviciosSeleccionados = serviciosIds
      this.persist()
    },

    // ✅ Actualizar fecha y hora
    setFechaHora(fecha: Date | string, hora: string) {
      // Asegúrate de guardar una fecha válida en formato ISO
      if (fecha instanceof Date) {
        // Guarda como YYYY-MM-DD local
        this.fechaSeleccionada = fecha.toISOString().split('T')[0]
      } else {
        this.fechaSeleccionada = fecha
      }
      this.horaSeleccionada = hora
      this.persist()
    },


    // ✅ Actualizar barbero (ahora guarda el objeto completo)
    setBarbero(barbero: Barbero | null) {
      this.barberoSeleccionado = barbero
      this.persist()
    },

    // ✅ Actualizar tab actual
    setCurrentTab(index: number) {
      this.currentTab = index
      this.persist()
    },

    // ✅ Resetear toda la reserva
    resetReserva() {
      this.serviciosSeleccionados = []
      this.barberoSeleccionado = null
      this.fechaSeleccionada = null
      this.horaSeleccionada = null
      this.currentTab = 0
      this.persist()
    },

    persist() {
      localStorage.setItem('reserva_state', JSON.stringify(this.$state))
    }
  }
})