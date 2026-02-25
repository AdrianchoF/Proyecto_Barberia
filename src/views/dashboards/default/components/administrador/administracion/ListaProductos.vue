<template>
    <v-container>
        <h2 class="text-h5 mb-4">Productos</h2>
        
        <v-progress-linear v-if="productoStore.loading" color="primary" indeterminate />

        <v-alert v-if="productoStore.error" type="error" class="mb-4">
            {{ productoStore.error }}
        </v-alert>

        <v-alert v-if="!productoStore.loading && productoStore.productos.length === 0" type="info" class="mb-4">
            No hay productos disponibles
        </v-alert>

        <v-row>
            <v-col v-for="producto in productoStore.productos" :key="producto.id" cols="12" sm="6" md="4">
                <v-card>
                    <template v-if="producto.imagenUrl">
                        <v-img 
                            :src="producto.imagenUrl !== 'imagenur1prueba' ? producto.imagenUrl : ''" 
                            height="200px"
                            cover
                        ></v-img>
                    </template>

                    <v-card-title>
                        {{ producto.nombre }}
                    </v-card-title>

                    <v-card-subtitle>
                        <div class="mb-1">{{ producto.descripcion }}</div>
                        <div v-if="producto.codigo"><small>Código: {{ producto.codigo }}</small></div>
                    </v-card-subtitle>

                    <v-card-text>
                        <div><strong>Precio de compra:</strong> ${{ Number(producto.precio).toFixed(2) }}</div>
                        <div><strong>Stock:</strong> {{ producto.stock }} unidades</div>
                        <div><strong>Categoría:</strong> {{ producto.categoria?.nombre || 'Sin categoría' }}</div>
                        <div v-if="producto.publicado"><strong>Precio de venta:</strong> ${{ Number(producto.precio_venta).toFixed(2) }}</div>
                        <div v-if="producto.publicado" class="mt-1"><v-chip color="green" small>Publicado</v-chip></div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="!producto.publicado"
                            color="primary"
                            small
                            @click="abrirDialogoPublicar(producto)"
                        >
                            Publicar producto
                        </v-btn>
                        <v-btn
                            v-else
                            color="error"
                            small
                            @click="despublicar(producto)"
                        >
                            Eliminar publicación
                        </v-btn>
                    </v-card-actions>
                </v-card>

            </v-col>
        </v-row>

        <!-- diálogo para publicar -->
        <v-dialog v-model="dialogPublicar" max-width="500px">
            <v-card>
                <v-card-title>Publicar producto</v-card-title>
                <v-card-text>
                    <v-form ref="pubFormRef">
                        <v-text-field
                            label="Imagen del producto (URL)"
                            v-model="pubForm.imagenUrl"
                        />
                        <v-select
                            label="Categoría del producto"
                            v-model="pubForm.categoriaId"
                            :items="categorias"
                            item-title="nombre"
                            item-value="id"
                            :loading="loadingCategorias"
                        />
                        <v-text-field
                            label="Precio de venta"
                            v-model.number="pubForm.precio_venta"
                            type="number"
                            prefix="$"
                            step="0.01"
                        />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialogPublicar = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="confirmarPublicacion">Publicar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useProductoStore } from '@/stores/producto';
    import { useCategoriaProductoStore } from '@/stores/CategoriaProducto';
        
    const productoStore = useProductoStore();
    const categoriaProductoStore = useCategoriaProductoStore();

    const dialogPublicar = ref(false);
    const pubForm = ref({ imagenUrl: '', categoriaId: null, precio_venta: 0 });
    const pubFormRef = ref(null);
    const selectedProducto = ref(null);
    const categorias = ref([]);
    const loadingCategorias = ref(false);

    const cargarCategorias = async () => {
        loadingCategorias.value = true;
        try {
            categorias.value = await categoriaProductoStore.getCategoriasProducto();
        } catch (e) {
            console.error('Error al cargar categorías', e);
        } finally {
            loadingCategorias.value = false;
        }
    };

    const abrirDialogoPublicar = (producto) => {
        selectedProducto.value = producto;
        pubForm.value = {
            imagenUrl: producto.imagenUrl || '',
            categoriaId: producto.categoriaId || null,
            precio_venta: producto.precio_venta || 0
        };
        dialogPublicar.value = true;
    };

    const confirmarPublicacion = async () => {
        if (!selectedProducto.value) return;
        try {
            await productoStore.publicarProducto(selectedProducto.value.id, {
                imagenUrl: pubForm.value.imagenUrl || undefined,
                categoriaId: pubForm.value.categoriaId || undefined,
                precio_venta: Number(pubForm.value.precio_venta)
            });
            dialogPublicar.value = false;
        } catch (e) {
            console.error('Error al publicar', e);
        }
    };

    const despublicar = async (producto) => {
        if (!producto.id) return;
        try {
            await productoStore.despublicarProducto(producto.id);
        } catch (e) {
            console.error('Error al despublicar', e);
        }
    };

    onMounted(async () => {
        await productoStore.getProductos();
        await cargarCategorias();
    });
</script>