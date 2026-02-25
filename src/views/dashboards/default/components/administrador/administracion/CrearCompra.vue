<template>
    <v-container>
        <h2 class="text-h5 mb-6">Nueva Orden de Compra</h2>

        <v-alert v-if="compraStore.error" type="error" class="mb-4" dismissible @click="compraStore.limpiarMensajes()">
            {{ compraStore.error }}
        </v-alert>

        <v-alert v-if="compraStore.successMessage" type="success" class="mb-4" dismissible @click="compraStore.limpiarMensajes()">
            {{ compraStore.successMessage }}
        </v-alert>

        <v-row>
            <v-col cols="12" md="6">
                <v-card class="pa-6">
                    <h3 class="text-h6 mb-4">Seleccionar Proveedor</h3>

                    <v-select
                        v-model="formulario.id_proveedor"
                        :items="proveedoresDisponibles"
                        item-title="nombre"
                        item-value="id"
                        label="Proveedor"
                        variant="outlined"
                        class="mb-4"
                    ></v-select>

                    <div class="text-body-2">El administrador debe realizar el pedido por WhatsApp. Aquí sólo se crea una orden pendiente para registrar la operación.</div>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="pa-6">
                    <h3 class="text-h6 mb-4">Acciones</h3>

                    <v-btn
                        color="success"
                        class="w-100"
                        :loading="compraStore.loading"
                        :disabled="!formulario.id_proveedor || compraStore.loading"
                        @click="iniciarPedidoPorWhatsApp"
                    >
                        Iniciar pedido por WhatsApp y Guardar
                    </v-btn>

                    <v-btn
                        color="gray"
                        variant="text"
                        @click="volverAtras"
                        class="w-100 mt-2"
                        :disabled="compraStore.loading"
                    >
                        Cancelar
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCompraStore, type DetalleCompra } from '@/stores/compra';
import { useProveedorStore } from '@/stores/proveedor';

const router = useRouter();
const compraStore = useCompraStore();
const proveedorStore = useProveedorStore();

const formulario = ref({
    id_proveedor: null as number | null,
    fecha_compra: new Date().toISOString().slice(0, 16),
});

const carrito = ref<any[]>([]);

const nuevoProducto = ref({
    nombre: '',
    cantidad: 0,
    precio_unitario: 0,
    descripcion: '',
    categoriaId: null as number | null,
    imagenUrl: '',
});

const proveedoresDisponibles = ref<any[]>([]);
const categoriasDisponibles = ref<any[]>([]);

const proveedorSeleccionado = computed(() => {
    return proveedoresDisponibles.value.find(p => p.id === formulario.value.id_proveedor);
});

// auto hide store messages
watch(() => compraStore.successMessage, (val) => {
    if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000);
});
watch(() => compraStore.error, (val) => {
    if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000);
});

const enlaceWhatsapp = computed(() => {
    if (!proveedorSeleccionado.value?.telefono) return '';
    const telefono = proveedorSeleccionado.value.telefono.replace(/\D/g, '');
    const mensaje = `Hola, necesito hacer un pedido a través del sistema de la barbería.`;
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
});

const calcularSubtotal = () => {
    return carrito.value.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
};

const agregarAlCarrito = () => {
    if (!nuevoProducto.value.nombre || !nuevoProducto.value.cantidad || !nuevoProducto.value.precio_unitario) {
        compraStore.error = 'Completa los campos requeridos';
        return;
    }

    carrito.value.push({
        nombre_producto: nuevoProducto.value.nombre,
        descripcion_producto: nuevoProducto.value.descripcion,
        cantidad: nuevoProducto.value.cantidad,
        precio_unitario: nuevoProducto.value.precio_unitario,
        categoriaId_producto: nuevoProducto.value.categoriaId,
        imagenUrl_producto: nuevoProducto.value.imagenUrl,
    });

    // Limpiar formulario
    nuevoProducto.value = {
        nombre: '',
        cantidad: 0,
        precio_unitario: 0,
        descripcion: '',
        categoriaId: null,
        imagenUrl: '',
    };

    compraStore.successMessage = 'Producto agregado al carrito';
    setTimeout(() => compraStore.limpiarMensajes(), 2000);
};

const eliminarDelCarrito = (index: number) => {
    carrito.value.splice(index, 1);
};

const guardarCompra = async () => {
    // Deprecated in new flow — kept for compatibility
};

const enviarPorWhatsApp = async () => {
    // Deprecated in new flow — kept for compatibility
};

const iniciarPedidoPorWhatsApp = async () => {
    if (!formulario.value.id_proveedor) {
        compraStore.error = 'Selecciona un proveedor';
        return;
    }

    try {
        // crear orden mínima (sin detalles) en servidor
        const created = await compraStore.createCompra({
            id_proveedor: formulario.value.id_proveedor,
            detalles: [],
        } as any);

        const proveedor = proveedorSeleccionado.value;
        const telefono = proveedor?.telefono ? proveedor.telefono.replace(/\D/g, '') : undefined;
        let mensaje = `Hola ${proveedor?.nombre || ''},\n`;
        mensaje += `Necesito realizar un pedido. Orden ID: ${created.id_compra || ''}\n`;
        mensaje += `Por favor confirmar disponibilidad y enviar factura o confirmación.`;

        if (telefono) {
            const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
            compraStore.successMessage = 'Orden creada y chat de WhatsApp abierto.';
        } else {
            compraStore.successMessage = 'Orden creada. No se encontró teléfono del proveedor.';
        }

        setTimeout(() => router.push('/lista-compras'), 800);
    } catch (error) {
        console.error('Error al iniciar pedido por WhatsApp:', error);
    }
};

const volverAtras = () => {
    router.push('/lista-compras');
};

onMounted(async () => {
    await proveedorStore.getProveedores();
    proveedoresDisponibles.value = proveedorStore.proveedores || [];

    // Cargar categorías (esto es una llamada adicional, idealmente vendría del store)
    // Por ahora usamos un placeholder
    categoriasDisponibles.value = [
        { id: 1, nombre: 'General' },
    ];
});
</script>

<style scoped>
.w-100 {
    width: 100%;
}
</style>
