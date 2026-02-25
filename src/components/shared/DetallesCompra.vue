<template>
    <div>
        <v-dialog v-model="dialogInterno" max-width="1300" class="rounded-xl" persistent @update:modelValue="emitirCambio">
            <v-card>
                <v-toolbar flat>
                    <v-toolbar-title>SHOPPING CART</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="vaciarCarrito">Vaciar carrito</v-btn>
                </v-toolbar>

                <v-row no-gutters>
                    <!-- Columna izquierda (contenido adicional) -->
                    <v-col cols="12" md="7" class="pa-4" style="max-height: 600px; overflow-y: auto;">
                        <v-data-table v-model="selected" :items="carrito" :headers="headers" item-value="id" show-select class="elevation-1">
                            <template #item.nombre="{ item }">
                                <div class="d-flex align-center gap-2">
                                    <v-avatar size="80">
                                        <v-img :src="item.img" alt="PRODUCTO"></v-img>
                                    </v-avatar>
                                    <span><strong>{{ item.nombre }}</strong></span>
                                </div>
                            </template>
                            <template #item.subtotal="{ item }">
                                ${{ (item.precio * item.cantidad).toLocaleString() }}
                            </template>
                        </v-data-table>
                    </v-col>

                    <v-col cols="12" md="5" class="pa-4">
                        <!-- Aquí puedes poner lo que quieras, por ejemplo: -->
                        <h3>TOTAL DEL CARRITO</h3>
                    </v-col>
                </v-row> 
            </v-card>
            <v-btn color="#ee6f38" @click="cerrarModal">Cerrar</v-btn>
        </v-dialog>
    </div>
</template>

<script setup>
    import { ref, watch, computed } from 'vue'
    import { storeToRefs } from 'pinia'
    import { useCarritoStore } from '@/stores/carrito'

    const props = defineProps({
        dialog: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits(['update:dialog'])

    const carritoStore = useCarritoStore()
    const { items: ComprasCarrito, mostrarDetalles } = storeToRefs(carritoStore)

    const dialogInterno = ref(props.dialog)
    const selected = ref([])
    const headers = [
        { title: 'PRODUCTO', value: 'nombre' },
        { title: 'CANTIDAD', value: 'cantidad' },
        { title: 'PRECIO', value: 'precio' },
        { title: 'SUBTOTAL', value: 'subtotal' }
    ]

    // Watch para sincronizar con el prop
    watch(() => props.dialog, (nuevoValor) => {
        dialogInterno.value = nuevoValor
    })

    const carrito = computed(() => {
        return ComprasCarrito.value
    })

    const emitirCambio = (nuevoValor) => {
        emit('update:dialog', nuevoValor)
    }

    const cerrarModal = () => {
        dialogInterno.value = false
        emit('update:dialog', false)
    }

    const vaciarCarrito = () => {
        carritoStore.vaciar()
    }
</script>