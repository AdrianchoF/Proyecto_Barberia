import { defineStore } from 'pinia';
import api from '@/plugins/axios';
import axios from 'axios';

export interface Cinta {
    id: number;
    ubicacion: string;
    texto: string;
    activo: boolean;
}

export const useCintaStore = defineStore('cinta', {
    state: () => ({
        cintas: [] as Cinta[],
        loading: false,
        error: null as string | null,
    }),

    actions: {
        async getCintas() {
            this.loading = true;
            try {
                const { data } = await api.get('/cintas-promocionales');
                this.cintas = data;
                return data;
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message;
                } else {
                    this.error = 'Error cargando cintas promocionales';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },

        async updateCinta(id: number, payload: Partial<Cinta>) {
            this.loading = true;
            try {
                const { data } = await api.patch(`/cintas-promocionales/${id}`, payload);
                const index = this.cintas.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.cintas[index] = { ...this.cintas[index], ...data };
                }
                return data;
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    this.error = err.response.data.message;
                } else {
                    this.error = 'Error actualizando cinta';
                }
                throw this.error;
            } finally {
                this.loading = false;
            }
        },
    },
});
