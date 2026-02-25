<template>
    <v-container fluid class="pa-4">

        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-5">
            <div>
                <h2 class="page-title">Productos</h2>
                <p class="page-subtitle">{{ productoStore.productos.length }} productos en inventario</p>
            </div>
        </div>

        <v-progress-linear v-if="productoStore.loading" color="primary" indeterminate rounded class="mb-4" />

        <v-alert v-if="productoStore.error" type="error" class="mb-4" rounded="lg">
            {{ productoStore.error }}
        </v-alert>

        <!-- Tabla -->
        <v-card rounded="lg" elevation="0" class="tabla-card" v-if="!productoStore.loading">

            <v-alert
                v-if="productoStore.productos.length === 0"
                type="info"
                class="ma-4"
                rounded="lg"
            >
                No hay productos disponibles
            </v-alert>

            <v-table v-else fixed-header class="tabla-productos">
                <thead>
                    <tr>
                        <th class="th-img"></th>
                        <th class="th-nombre">Producto</th>
                        <th class="th-categoria">Categoría</th>
                        <th class="th-numero text-right">Precio compra</th>
                        <th class="th-numero text-right">Precio venta</th>
                        <th class="th-numero text-center">Stock</th>
                        <th class="th-estado text-center">Estado</th>
                        <th class="th-acciones text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="producto in productoStore.productos"
                        :key="producto.id"
                        class="fila-producto"
                    >
                        <!-- Miniatura -->
                        <td class="td-img">
                            <div class="miniatura-wrap">
                                <v-img
                                    v-if="producto.imagenUrl && producto.imagenUrl !== 'imagenur1prueba'"
                                    :src="producto.imagenUrl"
                                    width="44"
                                    height="44"
                                    cover
                                    rounded="md"
                                    class="miniatura"
                                />
                                <div v-else class="miniatura-placeholder">
                                    <i class="fa-regular fa-image" style="font-size:16px; color:#bdbdbd;"></i>
                                </div>
                            </div>
                        </td>

                        <!-- Nombre + código -->
                        <td class="td-nombre">
                            <span class="nombre-producto">{{ producto.nombre }}</span>
                            <span v-if="producto.codigo" class="codigo-producto d-block">{{ producto.codigo }}</span>
                        </td>

                        <!-- Categoría -->
                        <td class="td-categoria">
                            <v-chip size="x-small" color="blue-grey" variant="tonal" class="chip-categoria">
                                {{ producto.categoria?.nombre || 'Sin categoría' }}
                            </v-chip>
                        </td>

                        <!-- Precio compra -->
                        <td class="td-numero text-right">
                            <span class="precio-compra">${{ formatPrecio(producto.precio) }}</span>
                        </td>

                        <!-- Precio venta -->
                        <td class="td-numero text-right">
                            <span v-if="producto.precio_venta" class="precio-venta">
                                ${{ formatPrecio(producto.precio_venta) }}
                            </span>
                            <span v-else class="sin-dato">—</span>
                        </td>

                        <!-- Stock -->
                        <td class="td-numero text-center">
                            <span
                                class="badge-stock"
                                :class="{
                                    'stock-ok': producto.stock > 5,
                                    'stock-bajo': producto.stock > 0 && producto.stock <= 5,
                                    'stock-cero': producto.stock === 0
                                }"
                            >
                                {{ producto.stock }}
                            </span>
                        </td>

                        <!-- Estado -->
                        <td class="td-estado text-center">
                            <v-chip
                                size="x-small"
                                :color="producto.publicado ? 'success' : 'default'"
                                :variant="producto.publicado ? 'tonal' : 'outlined'"
                                class="chip-estado"
                            >
                                <i
                                    :class="producto.publicado ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"
                                    style="font-size:10px; margin-right:4px;"
                                ></i>
                                {{ producto.publicado ? 'Publicado' : 'Sin publicar' }}
                            </v-chip>
                        </td>

                        <!-- Acciones -->
                        <td class="td-acciones text-center">
                            <div class="d-flex align-center justify-center gap-acciones">
                                <v-btn
                                    v-if="!producto.publicado"
                                    size="x-small"
                                    color="primary"
                                    variant="tonal"
                                    rounded="lg"
                                    class="btn-accion"
                                    @click="abrirDialogoPublicar(producto)"
                                >
                                    <i class="fa-solid fa-upload" style="font-size:11px; margin-right:5px;"></i>
                                    Publicar
                                </v-btn>
                                <v-btn
                                    v-else
                                    size="x-small"
                                    color="error"
                                    variant="tonal"
                                    rounded="lg"
                                    class="btn-accion"
                                    @click="despublicar(producto)"
                                >
                                    <i class="fa-solid fa-circle-xmark" style="font-size:11px; margin-right:5px;"></i>
                                    Despublicar
                                </v-btn>

                                <!-- Botón Editar (siempre visible) -->
                                <v-btn
                                    size="x-small"
                                    color="warning"
                                    variant="tonal"
                                    rounded="lg"
                                    class="btn-accion"
                                    @click="abrirDialogoEditar(producto)"
                                >
                                    <i class="fa-solid fa-pen" style="font-size:11px; margin-right:5px;"></i>
                                    Editar
                                </v-btn>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>

        <!-- ─── Diálogo para publicar ──────────────────────────────────────── -->
        <v-dialog v-model="dialogPublicar" max-width="620px" scrollable>
            <v-card rounded="lg">
                <v-card-title class="dialog-title pa-4">
                    <i class="fa-solid fa-store" style="color:#1976d2; margin-right:8px;"></i>
                    Publicar producto
                </v-card-title>
                <v-divider />

                <v-card-text class="pa-4" style="max-height: 70vh;">
                    <v-form ref="pubFormRef">

                        <!-- IMAGEN -->
                        <p class="section-label">Imagen del producto</p>
                        <v-btn-toggle v-model="imagenModo" mandatory density="compact" class="mb-3" color="primary">
                            <v-btn value="url" size="small">Desde URL</v-btn>
                            <v-btn value="archivo" size="small">Subir archivo</v-btn>
                        </v-btn-toggle>

                        <v-text-field
                            v-if="imagenModo === 'url'"
                            label="URL de la imagen"
                            v-model="pubForm.imagenUrl"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            clearable
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />
                        <div v-if="imagenModo === 'archivo'" class="mb-3">
                            <v-file-input
                                label="Seleccionar imagen"
                                accept="image/*"
                                density="compact"
                                variant="outlined"
                                @change="onFileChange"
                                clearable
                            />
                            <v-img
                                v-if="imagenPreview"
                                :src="imagenPreview"
                                max-height="160"
                                contain
                                class="rounded mt-1"
                            />
                        </div>

                        <v-divider class="my-3" />

                        <!-- INFO BÁSICA -->
                        <p class="section-label">Información básica</p>

                        <v-select
                            label="Categoría *"
                            v-model="pubForm.categoriaId"
                            :items="categorias"
                            item-title="nombre"
                            item-value="id"
                            :loading="loadingCategorias"
                            density="compact"
                            variant="outlined"
                            :rules="[v => !!v || 'La categoría es requerida']"
                            class="mb-2"
                        />
                        <v-text-field
                            label="Precio de venta *"
                            v-model.number="pubForm.precio_venta"
                            type="number"
                            prefix="$"
                            step="0.01"
                            density="compact"
                            variant="outlined"
                            :rules="[v => v > 0 || 'Ingresa un precio válido']"
                            class="mb-2"
                        />
                        <v-textarea
                            label="Descripción para clientes *"
                            v-model="pubForm.descripcionPublica"
                            placeholder="Describe el producto para los clientes..."
                            rows="3"
                            density="compact"
                            variant="outlined"
                            :rules="[v => !!v?.trim() || 'La descripción es requerida']"
                            class="mb-2"
                        />

                        <v-divider class="my-3" />

                        <!-- DETALLES OPCIONALES -->
                        <p class="section-label">
                            Detalles adicionales
                            <span class="text-caption text-medium-emphasis font-weight-regular ml-1">(opcionales)</span>
                        </p>

                        <v-textarea label="Ingredientes" v-model="pubForm.ingredientes"
                            placeholder="Ej: Aceite de argán, keratina..."
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Modo de uso" v-model="pubForm.modo_uso"
                            placeholder="Ej: Aplicar sobre cabello húmedo..."
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Cantidades de presentación" v-model="pubForm.cantidades"
                            placeholder="Ej: 250ml, 500ml, 1L"
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Beneficios" v-model="pubForm.beneficiosTexto"
                            placeholder="Ej: Hidrata, repara puntas, aporta brillo..."
                            hint="Separar cada beneficio con una coma"
                            persistent-hint
                            rows="2" density="compact" variant="outlined" class="mb-2" />
                    </v-form>
                </v-card-text>

                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogPublicar = false">Cancelar</v-btn>
                    <v-btn color="primary" variant="tonal" rounded="lg" @click="confirmarPublicacion" :loading="productoStore.loading">
                        <i class="fa-solid fa-check" style="margin-right:6px;"></i> Publicar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- ─── Diálogo para editar ───────────────────────────────────────── -->
        <v-dialog v-model="dialogEditar" max-width="620px" scrollable persistent>
            <v-card rounded="lg">
                <v-card-title class="dialog-title pa-4">
                    <i class="fa-solid fa-pen-to-square" style="color:#f9a825; margin-right:8px;"></i>
                    Editar información del producto
                </v-card-title>
                <v-divider />

                <v-card-text class="pa-4" style="max-height: 70vh;">
                    <v-form ref="editFormRef">

                        <!-- DATOS GENERALES -->
                        <p class="section-label">Datos generales</p>

                        <v-text-field
                            label="Código"
                            v-model="editForm.codigo"
                            placeholder="Ej: PROD-001"
                            clearable
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />
                        <v-text-field
                            label="Nombre del producto *"
                            v-model="editForm.nombre"
                            density="compact"
                            variant="outlined"
                            :rules="[v => !!v?.trim() || 'El nombre es requerido']"
                            class="mb-2"
                        />

                        <v-divider class="my-3" />

                        <!-- IMAGEN -->
                        <p class="section-label">Imagen del producto</p>
                        <v-btn-toggle v-model="editImagenModo" mandatory density="compact" class="mb-3" color="warning">
                            <v-btn value="url" size="small">Desde URL</v-btn>
                            <v-btn value="archivo" size="small">Subir archivo</v-btn>
                        </v-btn-toggle>

                        <v-text-field
                            v-if="editImagenModo === 'url'"
                            label="URL de la imagen"
                            v-model="editForm.imagenUrl"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            clearable
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />
                        <div v-if="editImagenModo === 'archivo'" class="mb-3">
                            <v-file-input
                                label="Seleccionar imagen"
                                accept="image/*"
                                density="compact"
                                variant="outlined"
                                @change="onEditFileChange"
                                clearable
                            />
                            <v-img
                                v-if="editImagenPreview"
                                :src="editImagenPreview"
                                max-height="160"
                                contain
                                class="rounded mt-1"
                            />
                        </div>

                        <v-divider class="my-3" />

                        <!-- PUBLICACIÓN -->
                        <p class="section-label">Datos de publicación</p>

                        <v-select
                            label="Categoría"
                            v-model="editForm.categoriaId"
                            :items="categorias"
                            item-title="nombre"
                            item-value="id"
                            :loading="loadingCategorias"
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />
                        <v-text-field
                            label="Precio de venta"
                            v-model.number="editForm.precio_venta"
                            type="number"
                            prefix="$"
                            step="0.01"
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />
                        <v-textarea
                            label="Descripción para clientes"
                            v-model="editForm.descripcionPublica"
                            placeholder="Descripción visible para los clientes..."
                            rows="3"
                            density="compact"
                            variant="outlined"
                            class="mb-2"
                        />

                        <v-divider class="my-3" />

                        <!-- DETALLES OPCIONALES -->
                        <p class="section-label">
                            Detalles adicionales
                            <span class="text-caption text-medium-emphasis font-weight-regular ml-1">(opcionales)</span>
                        </p>

                        <v-textarea label="Ingredientes" v-model="editForm.ingredientes"
                            placeholder="Ej: Aceite de argán, keratina..."
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Modo de uso" v-model="editForm.modo_uso"
                            placeholder="Ej: Aplicar sobre cabello húmedo..."
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Cantidades de presentación" v-model="editForm.cantidades"
                            placeholder="Ej: 250ml, 500ml, 1L"
                            rows="2" density="compact" variant="outlined" class="mb-2" />

                        <v-textarea label="Beneficios" v-model="editForm.beneficiosTexto"
                            placeholder="Ej: Hidrata, repara puntas, aporta brillo..."
                            hint="Separar cada beneficio con una coma"
                            persistent-hint
                            rows="2" density="compact" variant="outlined" class="mb-2" />
                    </v-form>
                </v-card-text>

                <v-divider />
                <v-card-actions class="pa-3">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogEditar = false">Cancelar</v-btn>
                    <v-btn color="warning" variant="tonal" rounded="lg" @click="confirmarEdicion" :loading="productoStore.loading">
                        <i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i> Guardar cambios
                    </v-btn>
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
const pubFormRef = ref(null);
const selectedProducto = ref(null);
const categorias = ref([]);
const loadingCategorias = ref(false);
const imagenModo = ref('url');
const imagenPreview = ref(null);
const imagenBase64 = ref(null);

// ── Estado del dialog de edición ──
const dialogEditar = ref(false);
const editFormRef = ref(null);
const editImagenModo = ref('url');
const editImagenPreview = ref(null);
const editImagenBase64 = ref(null);

const editForm = ref({
    codigo: '',
    nombre: '',
    imagenUrl: '',
    categoriaId: null,
    precio_venta: 0,
    descripcionPublica: '',
    ingredientes: '',
    modo_uso: '',
    cantidades: '',
    beneficiosTexto: ''
});

const pubForm = ref({
    imagenUrl: '',
    categoriaId: null,
    precio_venta: 0,
    descripcionPublica: '',
    ingredientes: '',
    modo_uso: '',
    cantidades: '',
    beneficiosTexto: ''
});

const formatPrecio = (valor) => {
    return Number(valor).toLocaleString('es-CO');
};

const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) { imagenPreview.value = null; imagenBase64.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => { imagenPreview.value = e.target.result; imagenBase64.value = e.target.result; };
    reader.readAsDataURL(file);
};

const onEditFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) { editImagenPreview.value = null; editImagenBase64.value = null; return; }
    const reader = new FileReader();
    reader.onload = (e) => { editImagenPreview.value = e.target.result; editImagenBase64.value = e.target.result; };
    reader.readAsDataURL(file);
};

const cargarCategorias = async () => {
    loadingCategorias.value = true;
    try { categorias.value = await categoriaProductoStore.getCategoriasProducto(); }
    catch (e) { console.error('Error al cargar categorías', e); }
    finally { loadingCategorias.value = false; }
};

const abrirDialogoPublicar = (producto) => {
    selectedProducto.value = producto;
    imagenModo.value = 'url';
    imagenPreview.value = null;
    imagenBase64.value = null;
    pubForm.value = {
        imagenUrl: producto.imagenUrl || '',
        categoriaId: producto.categoriaId || null,
        precio_venta: producto.precio_venta || 0,
        descripcionPublica: producto.descripcionPublica || '',
        ingredientes: producto.ingredientes || '',
        modo_uso: producto.modo_uso || '',
        cantidades: producto.cantidades || '',
        beneficiosTexto: Array.isArray(producto.beneficios)
            ? producto.beneficios.join(', ')
            : (producto.beneficios || '')
    };
    dialogPublicar.value = true;
};

const confirmarPublicacion = async () => {
    if (!selectedProducto.value) return;
    const { valid } = await pubFormRef.value?.validate() ?? { valid: true };
    if (!valid) return;

    const imagenFinal = imagenModo.value === 'archivo' && imagenBase64.value
        ? imagenBase64.value
        : pubForm.value.imagenUrl || undefined;

    const beneficiosArray = pubForm.value.beneficiosTexto
        ? pubForm.value.beneficiosTexto.split(',').map(b => b.trim()).filter(Boolean)
        : [];

    try {
        await productoStore.publicarProducto(selectedProducto.value.id, {
            imagenUrl: imagenFinal,
            categoriaId: pubForm.value.categoriaId || undefined,
            precio_venta: Number(pubForm.value.precio_venta),
            descripcionPublica: pubForm.value.descripcionPublica.trim(),
            ingredientes: pubForm.value.ingredientes.trim() || null,
            modo_uso: pubForm.value.modo_uso.trim() || null,
            cantidades: pubForm.value.cantidades.trim() || null,
            beneficios: beneficiosArray.length ? beneficiosArray : null
        });
        dialogPublicar.value = false;
    } catch (e) {
        console.error('Error al publicar', e);
    }
};

const abrirDialogoEditar = (producto) => {
    selectedProducto.value = producto;
    editImagenModo.value = 'url';
    editImagenPreview.value = null;
    editImagenBase64.value = null;
    editForm.value = {
        codigo: producto.codigo || '',
        nombre: producto.nombre || '',
        imagenUrl: producto.imagenUrl || '',
        categoriaId: producto.categoriaId || null,
        precio_venta: producto.precio_venta || 0,
        descripcionPublica: producto.descripcionPublica || '',
        ingredientes: producto.ingredientes || '',
        modo_uso: producto.modo_uso || '',
        cantidades: producto.cantidades || '',
        beneficiosTexto: Array.isArray(producto.beneficios)
            ? producto.beneficios.join(', ')
            : (producto.beneficios || '')
    };
    dialogEditar.value = true;
};

const confirmarEdicion = async () => {
    if (!selectedProducto.value) return;
    const { valid } = await editFormRef.value?.validate() ?? { valid: true };
    if (!valid) return;

    const imagenFinal = editImagenModo.value === 'archivo' && editImagenBase64.value
        ? editImagenBase64.value
        : editForm.value.imagenUrl || undefined;

    const beneficiosArray = editForm.value.beneficiosTexto
        ? editForm.value.beneficiosTexto.split(',').map(b => b.trim()).filter(Boolean)
        : [];

    try {
        await productoStore.updateProducto(selectedProducto.value.id, {
            codigo: editForm.value.codigo?.trim() || undefined,
            nombre: editForm.value.nombre.trim(),
            imagenUrl: imagenFinal,
            categoriaId: editForm.value.categoriaId || undefined,
            precio_venta: editForm.value.precio_venta ? Number(editForm.value.precio_venta) : undefined,
            descripcionPublica: editForm.value.descripcionPublica?.trim() || null,
            ingredientes: editForm.value.ingredientes?.trim() || null,
            modo_uso: editForm.value.modo_uso?.trim() || null,
            cantidades: editForm.value.cantidades?.trim() || null,
            beneficios: beneficiosArray.length ? beneficiosArray : null
        });
        dialogEditar.value = false;
    } catch (e) {
        console.error('Error al editar', e);
    }
};

const despublicar = async (producto) => {
    if (!producto.id) return;
    try { await productoStore.despublicarProducto(producto.id); }
    catch (e) { console.error('Error al despublicar', e); }
};

onMounted(async () => {
    await productoStore.getProductos();
    await cargarCategorias();
});
</script>

<style scoped>
/* ── Página ── */
.page-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.3px;
}
.page-subtitle {
    font-size: 0.82rem;
    color: #9e9e9e;
    margin-top: 2px;
}

/* ── Tabla contenedor ── */
.tabla-card {
    border: 1px solid #ebebeb;
    overflow: hidden;
}
.tabla-productos {
    font-size: 0.855rem;
}

/* ── Encabezados ── */
.tabla-productos thead tr th {
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #9e9e9e !important;
    background: #fafafa !important;
    border-bottom: 1px solid #ebebeb !important;
    white-space: nowrap;
    padding: 10px 14px !important;
}

/* ── Filas ── */
.fila-producto { transition: background 0.15s ease; }
.fila-producto:hover { background: #f7f8ff !important; }
.fila-producto td {
    padding: 10px 14px !important;
    border-bottom: 1px solid #f0f0f0 !important;
    vertical-align: middle;
}

/* ── Anchos de columnas ── */
.th-img, .td-img    { width: 60px; }
.th-nombre          { min-width: 180px; }
.th-categoria       { width: 130px; }
.th-numero          { width: 120px; }
.th-estado          { width: 120px; }
.th-acciones        { width: 180px; }

/* ── Gap entre botones de acciones ── */
.gap-acciones { gap: 6px; flex-wrap: wrap; }

/* ── Miniatura ── */
.miniatura-wrap { display: flex; align-items: center; justify-content: center; }
.miniatura { border-radius: 8px; flex-shrink: 0; }
.miniatura-placeholder {
    width: 44px; height: 44px;
    border-radius: 8px;
    background: #f5f5f5;
    display: flex; align-items: center; justify-content: center;
    border: 1px dashed #ddd;
}

/* ── Nombre y código ── */
.nombre-producto {
    font-weight: 600;
    color: #1a1a2e;
    font-size: 0.875rem;
    line-height: 1.3;
}
.codigo-producto {
    font-size: 0.72rem;
    color: #bdbdbd;
    margin-top: 2px;
    letter-spacing: 0.3px;
}

/* ── Chips ── */
.chip-categoria { font-size: 0.7rem !important; }
.chip-estado    { font-size: 0.7rem !important; }

/* ── Precios ── */
.precio-compra { font-weight: 500; color: #424242; font-size: 0.845rem; }
.precio-venta  { font-weight: 700; color: #1976d2; font-size: 0.845rem; }
.sin-dato      { color: #d0d0d0; font-size: 0.85rem; }

/* ── Badge stock ── */
.badge-stock {
    display: inline-block;
    min-width: 32px;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-align: center;
}
.stock-ok   { background: #e8f5e9; color: #388e3c; }
.stock-bajo { background: #fff8e1; color: #f57f17; }
.stock-cero { background: #ffebee; color: #c62828; }

/* ── Botón acción ── */
.btn-accion { font-size: 0.72rem !important; font-weight: 600 !important; }

/* ── Dialog ── */
.dialog-title { font-size: 1rem; font-weight: 700; }
.section-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #757575;
    margin-bottom: 10px;
}
</style>