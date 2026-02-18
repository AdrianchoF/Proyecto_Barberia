import api from "@/plugins/axios";
import axios from "axios";
import { defineStore } from "pinia";

interface CategoriaProducto {
    id?: number;
    nombre: string;
}

interface CategoriaProductoState {
    categoriasProducto: CategoriaProducto[];
    loading: boolean;
    error: string | null;
}

export const useCategoriaProductoStore = defineStore('categoriaProducto', {
    state: (): CategoriaProductoState => ({
        categoriasProducto: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getCategoriasProducto() {
            this.loading = true;
            try {
                const { data } = await api.get('/categoria-producto', { withCredentials: true });
                this.categoriasProducto = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener las categorías de producto';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },
        async createCategoriaProducto(payload: CategoriaProducto) {
            this.loading = true;
            try {
                const { data } = await api.post('/categoria-producto', payload, { withCredentials: true });
                this.categoriasProducto.push(data);
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al crear la categoría';
                }
            } finally {
                this.loading = false;
            }
        }
        ,
        async refreshCategoriasProducto() {
            try {
                const { data } = await api.get('/categoria-producto', { withCredentials: true });
                this.categoriasProducto = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener las categorías de producto';
                }
                return [];
            }
        },

        async updateCategoriaProducto(id: number, payload: CategoriaProducto) {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await api.patch(`/categoria-producto/${id}`, payload, { withCredentials: true });
                // recargar lista para mantener consistencia
                await this.refreshCategoriasProducto();
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al actualizar la categoría';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteCategoriaProducto(id: number) {
            this.loading = true;
            this.error = null;
            try {
                await api.delete(`/categoria-producto/${id}`, { withCredentials: true });
                // recargar para sincronizar
                await this.refreshCategoriasProducto();
                return true;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al eliminar la categoría';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
})