import api from "@/plugins/axios";
import axios from "axios";
import { defineStore } from "pinia";

export interface DetalleCompra {
    id_producto: number;
    cantidad: number;
    cantidad_recibida?: number;
    precio_unitario: number;
}

export interface Compra {
    id_compra?: number;
    fecha_compra: string;
    id_proveedor: number;
    detalles: DetalleCompra[];
    estado?: string;
    total?: number;
    fecha_entrega?: string;
}

export interface CompraState {
    compras: any[];
    compraActual: Compra | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

export const useCompraStore = defineStore('compra', {
    state: (): CompraState => ({
        compras: [],
        compraActual: null,
        loading: false,
        error: null,
        successMessage: null,
    }),

    getters: {
        comprasPendientes: (state) => state.compras.filter(c => c.estado === 'pendiente'),
        comprasEntregadas: (state) => state.compras.filter(c => c.estado === 'entregada'),
    },

    actions: {
        async getCompras() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get('/compra-producto', { withCredentials: true });
                this.compras = Array.isArray(data) ? data : [];
                return this.compras;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener los compras';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },

        async getCompraById(id: number) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.get(`/compra-producto/${id}`, { withCredentials: true });
                this.compraActual = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener la compra';
                }
            } finally {
                this.loading = false;
            }
        },

        async createCompra(payload: Compra) {
            this.loading = true;
            this.error = null;
            this.successMessage = null;
            try {
                const { data } = await api.post('/compra-producto', payload, { withCredentials: true });
                this.compras.push(data);
                this.successMessage = 'Compra creada exitosamente';
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al crear la compra';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async marcarEntregada(id: number, fecha_entrega?: string) {
            this.loading = true;
            this.error = null;
            this.successMessage = null;
            try {
                const payload = fecha_entrega ? { fecha_entrega } : {};
                const { data } = await api.post(`/compra-producto/${id}/entregar`, payload, { withCredentials: true });
                const index = this.compras.findIndex(c => c.id_compra === id);
                if (index !== -1) {
                    this.compras[index] = data;
                }
                this.successMessage = 'Compra marcada como entregada';
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al marcar la compra como entregada';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        limpiarMensajes() {
            this.error = null;
            this.successMessage = null;
        },

        resetCompraActual() {
            this.compraActual = null;
        }
        ,

        async parseConfirmation(compraId: number, text: string) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.post(`/compra-producto/${compraId}/confirmacion`, { text }, { withCredentials: true });
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al analizar la confirmación';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async parseConfirmationFile(compraId: number, file: File) {
            this.loading = true;
            this.error = null;
            try {
                const form = new FormData();
                form.append('file', file);
                const { data } = await api.post(`/compra-producto/${compraId}/confirmacion/archivo`, form, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al analizar el archivo de confirmación';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addDetalles(compraId: number, detalles: any[]) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.post(`/compra-producto/${compraId}/detalles`, detalles, { withCredentials: true });

                // `data` contains `{ creados, compra }`. update local store immediately
                if (data && data.compra) {
                    const updated: any = data.compra;
                    const index = this.compras.findIndex(c => c.id_compra === updated.id_compra);
                    if (index !== -1) {
                        this.compras[index] = updated;
                    }
                    // also refresh compraActual if it matches
                    if (this.compraActual && this.compraActual.id_compra === updated.id_compra) {
                        this.compraActual = updated;
                    }
                }

                // still fetch full list to ensure consistency
                await this.getCompras();
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al guardar los detalles';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
