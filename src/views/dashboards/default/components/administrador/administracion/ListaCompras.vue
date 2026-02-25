<template>
    <v-container>
        <h2 class="text-h5 mb-4">Compras a Proveedores</h2>

        <v-progress-linear v-if="compraStore.loading" color="primary" indeterminate />

        <v-alert v-if="compraStore.error" type="error" class="mb-4" dismissible @click="compraStore.limpiarMensajes()">
            {{ compraStore.error }}
        </v-alert>

        <v-alert v-if="compraStore.successMessage" type="success" class="mb-4" dismissible @click="compraStore.limpiarMensajes()">
            {{ compraStore.successMessage }}
        </v-alert>

        <div class="mb-4 d-flex gap-2">
            <v-btn 
                color="primary" 
                to="/crear-compra"
            >
                <v-icon left class="fa-solid fa-plus"></v-icon>
                Nueva Orden
            </v-btn>
            <v-btn-toggle v-model="filtroEstado" mandatory>
                <v-btn value="">Todas</v-btn>
                <v-btn value="pendiente">Pendientes</v-btn>
                <v-btn value="entregada">Entregadas</v-btn>
            </v-btn-toggle>
        </div>

        <v-alert v-if="!compraStore.loading && comprasFiltradasList.length === 0" type="info" class="mb-4">
            No hay compras disponibles
        </v-alert>

        <v-table v-else class="rounded-lg elevation-1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="compra in comprasFiltradasList" :key="compra.id_compra">
                    <td><strong>{{ compra.id_compra }}</strong></td>
                    <td>{{ compra.proveedor?.nombre || 'Sin asignar' }}</td>
                    <td>{{ formatDate(compra.fecha_compra) }}</td>
                    <td>${{ Number(compra.total).toFixed(2) }}</td>
                    <td>
                        <v-chip 
                            :color="compra.estado === 'entregada' ? 'green' : 'orange'"
                            text-color="white"
                            size="small"
                        >
                            {{ compra.estado?.toUpperCase() }}
                        </v-chip>
                    </td>
                    <td>
                        <!-- botón con texto para ver detalles (también existía el icono original) -->
                        <v-btn
                            size="small"
                            variant="text"
                            color="primary"
                            @click="verDetalles(compra.id_compra)"
                        >
                            <v-icon left>fa-solid fa-eye</v-icon>
                            Ver detalles
                        </v-btn>
                        <!-- icono adicional por si prefieres solo icono (se mantiene) -->
                        <v-btn 
                            icon
                            size="small"
                            variant="text"
                            color="primary"
                            @click="verDetalles(compra.id_compra)"
                            title="Ver detalles"
                        >
                            <v-icon>fa-solid fa-eye</v-icon>
                        </v-btn>

                        <v-btn
                            size="small"
                            variant="outlined"
                            :color="compra.estado === 'entregada' ? 'green' : 'info'"
                            :disabled="compra.estado === 'entregada'"
                            @click="compra.estado === 'entregada' ? null : abrirModalConfirmacionPara(compra.id_compra)"
                        >
                            {{ compra.estado === 'entregada' ? 'Compra confirmada' : 'Adjuntar Confirmación' }}
                        </v-btn>
                        <v-btn 
                            v-if="compra.estado !== 'entregada'"
                            icon
                            size="small"
                            variant="text"
                            color="success"
                            @click="abrirDialogoEntrega(compra.id_compra)"
                            title="Marcar como entregada"
                        >
                            <v-icon>fa-solid fa-check-circle</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>

        <!-- Dialog Ver Detalles -->
        <v-dialog v-model="dialogDetalles" max-width="700">
            <v-card>
                <v-card-title>
                    Detalles de Compra #{{ detallesCompra?.id_compra }}
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <div v-if="detallesCompra">
                            <div class="mb-4">
                                <strong>Proveedor:</strong> {{ detallesCompra.proveedor?.nombre }}
                            </div>
                            <div class="mb-4">
                                <strong>Fecha:</strong> {{ formatDate(detallesCompra.fecha_compra) }}
                            </div>
                            <div class="mb-4" v-if="detallesCompra.fecha_entrega">
                                <strong>Fecha Entrega:</strong> {{ formatDate(detallesCompra.fecha_entrega) }}
                            </div>
                            <div class="mb-4">
                                <strong>Estado:</strong>
                                <v-chip 
                                    :color="detallesCompra.estado === 'entregada' ? 'green' : 'orange'"
                                    text-color="white"
                                    size="small"
                                    class="ml-2"
                                >
                                    {{ detallesCompra.estado?.toUpperCase() }}
                                </v-chip>
                            </div>

                            <v-divider class="my-4"></v-divider>

                            <h4 class="mb-3">Productos</h4>
                            <v-table dense>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="detalle in detallesCompra.detalles" :key="detalle.id_detalle">
                                        <td>{{ detalle.codigo_producto || detalle.producto?.codigo || '-' }}</td>
                                        <td>{{ detalle.producto?.nombre || detalle.nombre_producto || '—' }}</td>
                                        <td>{{ detalle.cantidad }}</td>
                                        <td>${{ Number(detalle.precio_unitario).toFixed(2) }}</td>
                                        <td>${{ Number(detalle.total).toFixed(2) }}</td>
                                    </tr>
                                </tbody>
                            </v-table>

                            <v-divider class="my-4"></v-divider>

                            <div class="text-right">
                                <strong>Total:</strong> ${{ Number(detallesCompra.total).toFixed(2) }}
                            </div>
                        </div>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="dialogDetalles = false">
                        Cerrar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog Confirmacion (pegar texto) -->
        <v-dialog v-model="dialogConfirmacion" max-width="800">
            <v-card>
                <v-card-title>Adjuntar / Pegar confirmación proveedor - Compra #{{ detallesCompra?.id_compra }}</v-card-title>
                <v-card-text style="color: darkorange;">Por favor pegar la informacion de la confirmacion en este orden (codigo producto, nombre producto, cantidad, precio unitario)</v-card-text>
                <v-card-text>
                                <v-textarea v-model="textoConfirmacion" label="Pega aquí la confirmación (texto del WhatsApp o correo)" rows="8"></v-textarea>
                    <v-file-input
                        v-model="archivoConfirmacion"
                        label="O sube un archivo (pdf, docx, txt)"
                        accept=".pdf,.doc,.docx,.txt"
                        @change="analizarArchivo"
                        clearable
                    ></v-file-input>
                    <small class="text--secondary">
                        El archivo debe contener texto seleccionable (no imágenes escaneadas). Para facturas en papel se requiere OCR, que puede añadirse en el futuro.
                    </small>

                    <v-divider class="my-4"></v-divider>

                    <!-- parsed lines table -->
                    <div v-if="parsedLines && parsedLines.length">
                        <h4>Líneas detectadas</h4>
                        <p class="text--secondary small">
                            Haz clic en "Agregar" para trasladar cada línea a la lista de guardado. "Guardar todo" enviará
                            tanto las líneas que agregaste como las restantes.
                        </p>
                        <v-table dense>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto (detectado)</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(line, idx) in parsedLines" :key="idx">
                                    <td>
                                        <v-text-field dense hide-details v-model="line.codigo_producto" placeholder="Código" />
                                    </td>
                                    <td>{{ line.nombre_producto }}</td>
                                    <td>{{ line.cantidad }}</td>
                                    <td>{{ line.precio_unitario ?? '-' }}</td>
                                    <td>{{ line.subtotal ?? '-' }}</td>
                                    <td>
                                        <v-btn size="small" color="success" @click="agregarLinea(idx)">Agregar</v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>

                    <!-- added lines preview -->
                    <div v-if="addedLines && addedLines.length" class="mt-4">
                        <h4>Líneas que se guardarán</h4>
                        <v-table dense>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(line, idx) in addedLines" :key="'a'+idx">
                                    <td>{{ line.codigo_producto || '-' }}</td>
                                    <td>{{ line.nombre_producto }}</td>
                                    <td>{{ line.cantidad }}</td>
                                    <td>{{ line.precio_unitario ?? '-' }}</td>
                                    <td>{{ line.subtotal ?? '-' }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="error" variant="text" @click="dialogConfirmacion = false">Cancelar</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="analizarConfirmacion" :loading="compraStore.loading">Analizar</v-btn>
                    <v-btn color="success" variant="text" @click="guardarTodoYMarcarEntregada" :loading="compraStore.loading" :disabled="!(parsedLines.length || addedLines.length)">
                        Guardar todo y Marcar entregada
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog Marcar Entregada -->
        <v-dialog v-model="dialogEntrega" max-width="500">
            <v-card>
                <v-card-title>
                    Marcar Compra como Entregada
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <p>¿Deseas marcar esta compra como entregada?</p>
                        <v-text-field
                            v-model="fechaEntrega"
                            type="datetime-local"
                            label="Fecha de Entrega (opcional)"
                            variant="outlined"
                        ></v-text-field>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray" variant="text" @click="dialogEntrega = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="success" variant="text" @click="confirmarEntrega" :loading="compraStore.loading">
                        Confirmar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useCompraStore } from '@/stores/compra';
import { useProductoStore } from '@/stores/producto';

const compraStore = useCompraStore();
const productoStore = useProductoStore();
const filtroEstado = ref('');
const dialogDetalles = ref(false);
const dialogEntrega = ref(false);
const detallesCompra = ref<any | null>(null);
const compraIdParaEntrega = ref<number | null>(null);
const fechaEntrega = ref('');

const comprasFiltradasList = computed(() => {
    if (!filtroEstado.value) {
        return compraStore.compras;
    }
    return compraStore.compras.filter(c => c.estado === filtroEstado.value);
});

// clear messages automatically after a few seconds
watch(() => compraStore.successMessage, (val) => {
    if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000);
});
watch(() => compraStore.error, (val) => {
    if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000);
});

const formatDate = (date: string | Date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-ES');
};

const verDetalles = async (id: number) => {
    await compraStore.getCompraById(id);
    detallesCompra.value = compraStore.compraActual;
    dialogDetalles.value = true;
};

const abrirDialogoEntrega = (id: number) => {
    compraIdParaEntrega.value = id;
    fechaEntrega.value = new Date().toISOString().slice(0, 16);
    dialogEntrega.value = true;
};

const abrirModalConfirmacionPara = async (id: number) => {
    await compraStore.getCompraById(id);
    detallesCompra.value = compraStore.compraActual;
    textoConfirmacion.value = '';
    archivoConfirmacion.value = null;
    parsedLines.value = [];
    addedLines.value = [];
    dialogConfirmacion.value = true;
};

const confirmarEntrega = async () => {
    if (compraIdParaEntrega.value !== null) {
        try {
            await compraStore.marcarEntregada(compraIdParaEntrega.value, fechaEntrega.value || undefined);
            dialogEntrega.value = false;
            compraIdParaEntrega.value = null;
            fechaEntrega.value = '';
        } catch (error) {
            console.error('Error al marcar como entregada:', error);
        }
    }
};

// Confirmacion handling
const dialogConfirmacion = ref(false);
const textoConfirmacion = ref('');
const archivoConfirmacion = ref<File | null>(null);
const parsedLines = ref<any[]>([]);
const addedLines = ref<any[]>([]);

const abrirModalConfirmacion = () => {
    dialogConfirmacion.value = true;
    textoConfirmacion.value = '';
    archivoConfirmacion.value = null;
    parsedLines.value = [];
    addedLines.value = [];
};

const analizarConfirmacion = async () => {
    if (!detallesCompra.value) return;
    try {
        const parsed = await compraStore.parseConfirmation(detallesCompra.value.id_compra, textoConfirmacion.value);
        parsedLines.value = parsed || [];
        addedLines.value = [];
    } catch (error) {
        console.error('Error al analizar:', error);
    }
};

const analizarArchivo = async () => {
    if (!detallesCompra.value || !archivoConfirmacion.value) return;
    try {
        const parsed = await compraStore.parseConfirmationFile(detallesCompra.value.id_compra, archivoConfirmacion.value);
        parsedLines.value = parsed || [];
        addedLines.value = [];
    } catch (error) {
        console.error('Error al analizar archivo:', error);
    }
};

const agregarLinea = (idx: number) => {
    if (!detallesCompra.value) return;
    const line = parsedLines.value[idx];
    // move line to the "added" list so user can see selection
    addedLines.value.push(line);
    parsedLines.value.splice(idx, 1);
};

const guardarTodoYMarcarEntregada = async () => {
    if (!detallesCompra.value) return;
    const toSend = [...addedLines.value, ...parsedLines.value];
    if (toSend.length === 0) return;
    try {
        // send all selected/parsed lines
        await compraStore.addDetalles(detallesCompra.value.id_compra, toSend);
        // mark as delivered
        await compraStore.marcarEntregada(detallesCompra.value.id_compra);
        // refresh product list in case new items were added automatically
        await productoStore.getProductos();
        // refresh list and details
        await compraStore.getCompras();
        await verDetalles(detallesCompra.value.id_compra);
        parsedLines.value = [];
        addedLines.value = [];
        dialogConfirmacion.value = false;
    } catch (error) {
        console.error('Error al guardar y marcar entregada:', error);
    }
};

onMounted(async () => {
    await compraStore.getCompras();
});
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
