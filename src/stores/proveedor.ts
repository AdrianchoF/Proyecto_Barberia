import api from "@/plugins/axios";
import axios from "axios";
import { defineStore } from "pinia";

interface Proveedor {
    id?: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
}

interface ProveedorState {
    proveedores: Proveedor[];
    loading: boolean;
    error: string | null;
}

export const useProveedorStore = defineStore('proveedor', {
    state: (): ProveedorState => ({
        proveedores: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getProveedores() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get('/proveedor', { withCredentials: true });
                this.proveedores = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener los proveedores';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },

        async refreshProveedores() {
            try {
                const { data } = await api.get('/proveedor', { withCredentials: true });
                this.proveedores = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener los proveedores';
                }
                return [];
            }
        },

        async createProveedor(payload: Proveedor) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.post('/proveedor', payload, { withCredentials: true });
                this.proveedores.push(data);
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al crear el proveedor';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProveedor(id: number, payload: Proveedor) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.patch(`/proveedor/${id}`, payload, { withCredentials: true });
                // Recargar la lista sin interferir con el estado loading principal
                await this.refreshProveedores();
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al actualizar el proveedor';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteProveedor(id: number) {
            this.loading = true;
            this.error = null;
            try {
                await api.delete(`/proveedor/${id}`, { withCredentials: true });
                this.proveedores = this.proveedores.filter(p => p.id !== id);
                return true;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al eliminar el proveedor';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
