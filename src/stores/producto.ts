import api from "@/plugins/axios";
import axios from "axios";
import { defineStore } from "pinia";

interface producto {
    id?: number;
    codigo?: string;
    nombre: string;
    descripcion: string;
    precio: number;            // precio de compra
    stock: number;
    imagenUrl?: string | null; // imagen para publicación
    categoriaId?: number | null; // categoría para publicación
    publicado?: boolean;
    precio_venta?: number;
}

interface ProductoState {
    productos: producto[];
    loading: boolean;
    error: string | null;
}

export const useProductoStore = defineStore('producto', {
    state: (): ProductoState => ({
        productos: [],
        loading: false,
        error: null,
    }),

    actions: {
        async getProductos(onlyPublished = false) {
            this.loading = true;
            this.error = null;
            try {
                const url = onlyPublished ? '/producto?publicado=true' : '/producto';
                const { data } = await api.get(url, { withCredentials: true });
                // Transformar los datos para asegurar tipos correctos y compatibilidad con componentes
                this.productos = data.map((producto: any) => ({
                    ...producto,
                    codigo: producto.codigo || null,
                    imagenUrl: producto.imagenUrl || null,
                    // helper alias for legacy components
                    img: producto.imagenUrl || producto.img || null,
                    categoriaId: producto.categoriaId || null,
                    precio: parseFloat(producto.precio) || 0,
                    precio_venta: producto.precio_venta != null ? parseFloat(producto.precio_venta) : null,
                    stock: parseInt(producto.stock) || 0
                }));
                console.log('Productos cargados:', this.productos);
                return this.productos;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al obtener los productos';
                }
                return [];
            } finally {
                this.loading = false;
            }
        },
        async createProducto(payload: producto) {
            this.loading = true;
            try {
                // ensure codigo sent if present
                const { data } = await api.post('/producto', payload, { withCredentials: true });
                this.productos.push(data);
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al crear el producto';
                }
            } finally {
                this.loading = false;
            }
        },
        async updateProducto(id: number, payload: Partial<producto>) {
            this.loading = true;
            try {
                const { data } = await api.patch(`/producto/${id}`, payload, { withCredentials: true });
                const index = this.productos.findIndex(p => p.id === id);
                if (index !== -1) this.productos[index] = data;
                return data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al actualizar el producto';
                }
            } finally {
                this.loading = false;
            }
        },
        async deleteProducto(id: number) {
            this.loading = true;
            try {
                await api.delete(`/producto/${id}`, { withCredentials: true });
                this.productos = this.productos.filter(p => p.id !== id);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error al eliminar el producto';
                }
            } finally {
                this.loading = false;
            }
        },
        async publicarProducto(id: number, changes: Partial<producto>) {
            // Ensure publicado: true is included
            changes.publicado = true;
            return this.updateProducto(id, changes);
        },
        async despublicarProducto(id: number) {
            return this.updateProducto(id, { publicado: false });
        }
    }
});