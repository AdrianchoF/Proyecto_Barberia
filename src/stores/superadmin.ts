import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import axios from 'axios'

interface AdminUser {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  foto?: string
  activo: boolean
  esBarbero: boolean
}

interface SuperAdminState {
  admins: AdminUser[]
  loading: boolean
  error: string | null
}

export const useSuperAdminStore = defineStore('superadmin', {
  state: (): SuperAdminState => ({
    admins: [],
    loading: false,
    error: null,
  }),

  actions: {
    async getAdmins() {
      this.loading = true
      this.error = null
      try {
        // En un SaaS real, esto podria ser /auth/administradores
        // Por ahora, traemos todos los usuarios y filtramos o el backend nos da solo admins
        const { data } = await api.get('/auth', { withCredentials: true })
        this.admins = data.filter((u: any) => u.role === 'administrador')
      } catch (err: unknown) {
        this.error = 'Error cargando administradores'
      } finally {
        this.loading = false
      }
    },

    async updateAdmin(id: number, payload: Partial<AdminUser>) {
      this.loading = true
      try {
        await api.patch(`/auth/${id}`, payload, { withCredentials: true })
        const index = this.admins.findIndex(a => a.id === id)
        if (index !== -1) {
          this.admins[index] = { ...this.admins[index], ...payload }
        }
      } catch (err: unknown) {
        this.error = 'Error actualizando administrador'
        throw err
      } finally {
        this.loading = false
      }
    },

    async toggleGlobalSubscription(active: boolean) {
      this.loading = true
      try {
        // Asumiendo que solo hay una configuracion id=1 por ahora (single-tenant)
        await api.patch('/configuracion/1', { suscripcionActiva: active }, { withCredentials: true })
      } catch (err: unknown) {
        this.error = 'Error al cambiar estado de suscripción global'
        throw err
      } finally {
        this.loading = false
      }
    },

    async registerAdmin(userData: any) {
      this.loading = true
      this.error = null
      try {
        // Usamos el endpoint de registro normal pero seteando el rol ADMINISTRADOR
        const payload = { 
          ...userData, 
          role: 'administrador',
          activo: true 
        }
        await api.post('/auth/register', payload)
        await this.getAdmins() // Recargar lista
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Error registrando administrador'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
