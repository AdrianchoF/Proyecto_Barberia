import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import axios from 'axios'

interface Client {
    id?: number
    nombre: string
    apellido: string
    email: string
    telefono?: string
    foto?: string
    activo?: boolean
    penalizadoHasta?: Date
    motivoPenalizacion?: string
}

interface ClientState {
    clients: Client[]
    loading: boolean
    error: string | null
}

export const useClientStore = defineStore('client', {
    state: (): ClientState => ({
        clients: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getClients() {
            this.loading = true
            try {
                // ajusta endpoint a tu backend
                const { data } = await api.get('/auth', { withCredentials: true })
                // si todos los usuarios están en /auth filtramos role cliente
                this.clients = data.filter((u: any) => u.role === 'cliente')
                return data;
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error cargando clientes'
                }
                return [];
            } finally {
                this.loading = false
            }
        },
        async updateClient(id: number, payload: Partial<Client>) {
            this.loading = true
            try {
                const { data } = await api.patch(`/auth/${id}`, payload, { withCredentials: true })
                const index = this.clients.findIndex(c => c.id === id)
                if (index !== -1) {
                    // Actualizamos con splice para asegurar reactividad total en Vue 3
                    // Extraemos 'user' de la respuesta si el backend lo devuelve así
                    const updatedUser = data.user || data;
                    this.clients.splice(index, 1, { ...this.clients[index], ...updatedUser })
                }
                return data
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error actualizando cliente'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        },

        async deleteClient(id: number) {
            this.loading = true
            try {
                await api.delete(`/auth/${id}`, { withCredentials: true })
                this.clients = this.clients.filter(c => c.id !== id)
                return true
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error eliminando cliente'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        },

        async createClient(payload: any) {
            this.loading = true
            try {
                // Usamos el endpoint de registro general
                // Forzamos el rol de cliente para seguridad
                const finalPayload = { ...payload, role: 'cliente' }
                const { data } = await api.post('/auth/register', finalPayload, { withCredentials: true })
                
                // Agregamos el nuevo cliente al estado local si la carga fue exitosa
                this.clients.unshift(data)
                return data
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error creando cliente'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        },
    },
})
