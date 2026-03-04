import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import axios from 'axios'

interface Service {
    id?: number
    nombre: string
    descripcion: string
    precio: number
    duracionAprox: string
    categoria: string
    categoriaId?: number
    esDestacado?: boolean
    videoUrl?: string
}

interface ServiceState {
    services: Service[]
    loading: boolean
    error: string | null
}

export const useServiceStore = defineStore('service', {
    state: (): ServiceState => ({
        services: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getServices() {
            this.loading = true
            try {
                const { data } = await api.get('/servicio', { withCredentials: true })
                this.services = data.map((s: any) => ({
                    ...s,
                    esDestacado: !!s.esDestacado,
                    videoUrl: s.videoUrl || ''
                }))
                return data;
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error cargando servicios'
                }
                return [];
            } finally {
                this.loading = false
            }
        },
        async createService(payload: Service) {
            this.loading = true
            try {
                const { data } = await api.post('/servicio', payload, { withCredentials: true })
                this.services.push(data)
                return data
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error creando servicio'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        },

        async updateService(id: number, payload: Partial<Service>) {
            this.loading = true
            try {
                const { data } = await api.patch(`/servicio/${id}`, payload, { withCredentials: true })
                const index = this.services.findIndex(s => s.id === id)
                if (index !== -1) {
                    this.services[index] = { ...this.services[index], ...data }
                }
                return data
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error actualizando servicio'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        },

        async toggleFeatured(id: number) {
            const service = this.services.find(s => s.id === id)
            if (!service) return

            return this.updateService(id, { esDestacado: !service.esDestacado })
        },

        async deleteService(id: number) {
            this.loading = true
            try {
                await api.delete(`/servicio/${id}`, { withCredentials: true })
                this.services = this.services.filter(s => s.id !== id)
                return true
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message
                } else {
                    this.error = 'Error eliminando servicio'
                }
                throw this.error
            } finally {
                this.loading = false
            }
        }
    },
})
