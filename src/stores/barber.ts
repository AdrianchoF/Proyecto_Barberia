import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import axios from 'axios'

interface Barber {
  id?: number
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  foto?: string
}

interface Horario {
  diasemana: string
  hora_inicio: string
  hora_fin: string
}

interface BarberWithSchedule extends Barber {
  horarios: Horario[]
}

interface BarberState {
  barbers: Barber[]
  loading: boolean
  error: string | null
}

export const useBarberStore = defineStore('barber', {
  state: (): BarberState => ({
    barbers: [],
    loading: false,
    error: null,
  }),

  actions: {
    async getBarbers() {
      this.loading = true
      try {
        const { data } = await api.get('/auth', { withCredentials: true })
        this.barbers = data.filter((u: any) => u.role === 'barbero')
        return data;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error cargando barberos'
        }
        return [];
      } finally {
        this.loading = false
      }
    },

    async createBarber(payload: Barber) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/register-barber', payload, { withCredentials: true })
        // agregar el barbero nuevo a la lista
        this.barbers.push(data)
        return data
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error creando barbero'
        }
        throw this.error
      } finally {
        this.loading = false
      }
    },

    // NUEVO MÉTODO: Crear barbero con horarios
    async createBarberWithSchedule(payload: BarberWithSchedule) {
      this.loading = true
      try {
        // Separar los datos del barbero de los horarios
        const { horarios, ...barberData } = payload

        const { data: newBarber } = await api.post(
          '/auth/register-barber',
          { ...barberData, horarios },
          { withCredentials: true }
        )

        // Ya NO es necesario un for loop o promises para enviar los horarios uno por uno 
        // porque el backend de auth/register-barber ahora los recibe todos en un solo array.
        // Las interfaces del backend han sido actualizadas.

        // Agregar el barbero a la lista
        this.barbers.push(newBarber)

        return {
          barber: newBarber,
          horarios: horarios,
          message: 'Barbero y horarios creados exitosamente'
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error creando barbero con horarios'
        }
        throw this.error
      } finally {
        this.loading = false
      }
    },

    // Metodo para traer barberos disponibles segun fecha y hora escogido
    async getBarberosDisponibles(dia: string, hora: string) {
      this.loading = true
      try {
        const { data } = await api.get(`/horario-barbero/${dia}/${hora}`, { withCredentials: true })
        return data || []
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error cargando barberos disponibles'
        }
        return []
      } finally {
        this.loading = false
      }
    },

    // En barber.ts - agregar al final de actions
    async getHorariosBarbero(barberoId: number) {
      this.loading = true
      try {
        const { data } = await api.get(`/horario-barbero/barbero/${barberoId}`, { withCredentials: true })
        console.log('📅 Horarios recibidos del backend:', data)
        return data || []
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error cargando horarios del barbero'
        }
        console.error('❌ Error:', this.error)
        throw this.error
      } finally {
        this.loading = false
      }
    },

    async updateBarber(id: number, payload: Partial<Barber>) {
      this.loading = true
      try {
        const { data } = await api.patch(`/auth/${id}`, payload, { withCredentials: true })
        const index = this.barbers.findIndex(b => b.id === id)
        if (index !== -1) {
          this.barbers[index] = { ...this.barbers[index], ...data }
        }
        return data
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error actualizando barbero'
        }
        throw this.error
      } finally {
        this.loading = false
      }
    },

    async deleteBarber(id: number) {
      this.loading = true
      try {
        await api.delete(`/auth/${id}`, { withCredentials: true })
        this.barbers = this.barbers.filter(b => b.id !== id)
        return true
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          this.error = err.response.data.message
        } else {
          this.error = 'Error eliminando barbero'
        }
        throw this.error
      } finally {
        this.loading = false
      }
    }
  },
})
