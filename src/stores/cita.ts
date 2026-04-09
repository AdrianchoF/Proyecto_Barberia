import { defineStore } from 'pinia';
import api from '@/plugins/axios';
import axios from 'axios';

export const useCitaStore = defineStore('cita', {
  state: () => ({
    citas: [] as any[],
    citaActual: null as { id_cita: number } | null,
    cargando: false,
    error: null,
    barberosDisponibles: [],
    horariosAlternativos: [],
    barberosAlternativos: []
  }),

  getters: {
    // Obtener citas por cliente
    citasPorCliente: (state) => (clienteId: any) => {
      return state.citas.filter(cita => cita.clienteId === clienteId);
    },

    // Obtener citas por estado
    citasPorEstado: (state) => (estado: any) => {
      return state.citas.filter(cita => cita.estado === estado);
    }
  },

  actions: {
    /**
     * Crear cita con múltiples servicios
     */
    async crearCita(datosReserva: { clienteId: any; barberoId: any; servicioId: any; hora: any; fecha: any; }) {
      this.cargando = true;
      this.error = null;
      this.horariosAlternativos = [];
      this.barberosAlternativos = [];

      try {
        const citaData = {
          clienteId: datosReserva.clienteId,
          barberoId: datosReserva.barberoId,
          servicioId: datosReserva.servicioId, // Array de IDs
          hora: datosReserva.hora,
          fecha: datosReserva.fecha,
          estado: 'agendada'
        };

        const response = await api.post('/cita', citaData);

        // Verificar si hubo conflictos
        if (response.data.disponible === false) {
          this.error = response.data.mensaje;
          this.horariosAlternativos = response.data.horarios_alternativos || [];
          this.barberosAlternativos = response.data.otros_barberos || [];

          return {
            success: false,
            mensaje: response.data.mensaje,
            horariosAlternativos: this.horariosAlternativos,
            barberosAlternativos: this.barberosAlternativos
          };
        }

        // Citas creadas exitosamente
        this.citas.push(...response.data.citas);

        return {
          success: true,
          mensaje: response.data.mensaje,
          citas: response.data.citas,
          total_citas: response.data.total_citas
        };

      } catch (error: any) {
        console.error('❌ Error al crear cita:', error);
        this.error = error.response?.data?.message || 'Error al agendar la cita';
        
        return {
          success: false,
          mensaje: this.error
        };
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Obtener barberos disponibles
     */
    async obtenerBarberosDisponibles(fecha: any, hora: any, servicioId: any) {
      this.cargando = true;
      this.error = null;

      try {
        const response = await api.get(`/cita/${fecha}/${hora}/${servicioId}`);
        this.barberosDisponibles = response.data.barberos_disponibles || [];
        return response.data;
      } catch (error: any) {
        console.error('Error al obtener barberos:', error);
        this.error = error.response?.data?.message || 'Error al buscar barberos';
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async obtenerHorasOcupadasBarbero(barberoId: number, fecha: string) {
      this.cargando = true
      try {
        const response = await api.get(`/cita/barbero/${barberoId}/ocupadas/${fecha}`)
        return response.data
      } catch (error: any) {
        console.error('Error al obtener horas ocupadas:', error)
        this.error = error.response?.data?.message || 'Error al consultar disponibilidad'
        return { horasOcupadas: [] }
      } finally {
        this.cargando = false
      }
    },

    /**
     * Obtener todas las citas - CORREGIDO
     */
    async obtenerCitas() {
      this.cargando = true;
      try {
        const response = await api.get('/cita');
        
        console.log('📡 Respuesta del backend:', response.data);
        
        // Verificar si la respuesta es un array directamente
        if (Array.isArray(response.data)) {
          this.citas = response.data;
        } 
        // Si viene dentro de una propiedad 'data' o 'citas'
        else if (response.data.data && Array.isArray(response.data.data)) {
          this.citas = response.data.data;
        } 
        else if (response.data.citas && Array.isArray(response.data.citas)) {
          this.citas = response.data.citas;
        }
        // Si no es ninguno de los anteriores, inicializar como array vacío
        else {
          console.warn('⚠️ La respuesta no contiene un array de citas:', response.data);
          this.citas = [];
        }
        
        console.log('✅ Citas cargadas en el store:', this.citas);
        return this.citas;
      } catch (error: any) {
        console.error('❌ Error al obtener citas:', error);
        this.error = error.response?.data?.message || 'Error al cargar citas';
        this.citas = []; // Asegurar que sea un array
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Obtener cita por ID
     */
    async obtenerCita(id: any) {
      this.cargando = true;
      try {
        const response = await api.get(`/cita/${id}`);
        this.citaActual = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar cita';
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Cancelar cita (cambia el estado a 'cancelada')
     */
    async cancelarCita(id: any, motivo: string) {
      this.cargando = true;
      this.error = null;
      
      try {
        const response = await api.patch(`/cita/${id}/cancelar`, { motivo });
        
        // Actualizar la cita en el array local
        const index = this.citas.findIndex(cita => cita.id_cita === id);
        if (index !== -1) {
          this.citas[index] = response.data.cita;
        }
        
        return {
          success: true,
          mensaje: response.data.mensaje || 'Cita cancelada exitosamente',
          cita: response.data.cita
        };
      } catch (error: any) {
        console.error('❌ Error al cancelar cita:', error);
        this.error = error.response?.data?.message || 'Error al cancelar la cita';
        
        return {
          success: false,
          mensaje: this.error
        };
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Eliminar cita
     */
    async eliminarCita(id: any) {
      this.cargando = true;
      try {
        await api.delete(`/cita/${id}`);
        this.citas = this.citas.filter(cita => cita.id_cita !== id);
        
        if (this.citaActual?.id_cita === id) {
          this.citaActual = null;
        }
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar cita';
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    // Limpiar estado
    limpiarAlternativas() {
      this.horariosAlternativos = [];
      this.barberosAlternativos = [];
      this.error = null;
    },

    limpiarCitaActual() {
      this.citaActual = null;
    },
  }
});