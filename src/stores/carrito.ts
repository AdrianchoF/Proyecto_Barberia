import { defineStore } from 'pinia';

interface CarritoItem {
    id: number;
    nombre: string;
    precio: number;
    img?: string;
    cantidad: number;
}

interface CarritoState {
    items: CarritoItem[];
    mostrarDetalles: boolean;
}

export const useCarritoStore = defineStore('carrito', {
    state: (): CarritoState => ({
        items: [],
        mostrarDetalles: false,
    }),
    actions: {
        agregarProducto(item: any) {
            const existente = this.items.find(p => p.id === item.id);
            if (existente) {
                existente.cantidad += 1;
            } else {
                this.items.push({ ...item, cantidad: 1 });
            }
        },
        eliminar(id: number) {
            this.items = this.items.filter(item => item.id !== id);
        },
        cambiarCantidad(id: number, delta: number) {
            const item = this.items.find(p => p.id === id);
            if (item) {
                item.cantidad += delta;
                if (item.cantidad <= 0) {
                    this.eliminar(id);
                }
            }
        },
        vaciar() {
            this.items = [];
        },
        abrirDetalles() {
            this.mostrarDetalles = true;
        },
        cerrarDetalles() {
            this.mostrarDetalles = false;
        }
    }
});