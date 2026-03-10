import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export interface Configuracion {
    id: number;
    nombre: string;
    direccion: string;
    latitud: number;
    longitud: number;
    telefono: string;
    whatsapp: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    horarios?: string;
    updatedAt?: string;
}

export const useConfiguracionStore = defineStore('configuracion', {
    state: () => ({
        config: null as Configuracion | null,
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchConfiguracion() {
            this.loading = true;
            try {
                const response = await api.get('/configuracion');
                this.config = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Error al cargar la configuración';
            } finally {
                this.loading = false;
            }
        },

        async updateConfiguracion(datos: Partial<Configuracion>) {
            this.loading = true;
            try {
                const response = await api.patch('/configuracion', datos);
                this.config = response.data;
                return true;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Error al actualizar la configuración';
                return false;
            } finally {
                this.loading = false;
            }
        },
    },
});
