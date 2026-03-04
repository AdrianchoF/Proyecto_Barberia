<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- CARD: HEADER                  -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-boxes"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Inventario de Productos</h2>
          <p class="header-subtitle">Gestiona el inventario, precios y publicación de productos</p>
        </div>
      </div>
    </v-card>

    <v-progress-linear v-if="productoStore.loading" color="#ee6f38" indeterminate rounded class="mb-4" />

    <v-alert v-if="productoStore.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ productoStore.error }}
    </v-alert>

    <!-- ══════════════════════════════ -->
    <!-- TABLA DE PRODUCTOS            -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="xl" v-if="!productoStore.loading">
      <div class="table-header">
        <div class="table-title">
          <i class="fas fa-list mr-2"></i> Lista de Productos
          <v-chip class="ml-2" size="small" color="#ee6f38" variant="flat">
            {{ productoStore.productos.length }}
          </v-chip>
        </div>
      </div>

      <v-card-text class="pa-4">
        <div v-if="productoStore.productos.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No hay productos registrados en el inventario</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="brand-table">
            <thead>
              <tr>
                <th class="th-center" style="width: 60px">Img</th>
                <th class="th-left">Producto</th>
                <th class="th-left th-hide-sm">Categoría</th>
                <th class="th-right th-hide-sm">Precio (C / V)</th>
                <th class="th-center">Stock</th>
                <th class="th-center">Estado</th>
                <th class="th-center" style="width: 140px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="producto in productoStore.productos" :key="producto.id" class="brand-row">
                
                <!-- Miniatura -->
                <td class="td-center">
                  <div class="miniatura-wrap">
                    <v-img
                      v-if="producto.imagenUrl && producto.imagenUrl !== 'imagenur1prueba'"
                      :src="producto.imagenUrl"
                      width="44" height="44" cover rounded="md"
                    />
                    <div v-else class="miniatura-placeholder">
                      <i class="fas fa-image text-muted"></i>
                    </div>
                  </div>
                </td>

                <!-- Nombre y Código -->
                <td>
                  <div class="prod-nombre">{{ producto.nombre }}</div>
                  <div class="prod-codigo" v-if="producto.codigo">{{ producto.codigo }}</div>
                </td>

                <!-- Categoría -->
                <td class="th-hide-sm">
                  <span class="category-pill">{{ producto.categoria?.nombre || 'Sin categoría' }}</span>
                </td>

                <!-- Precios -->
                <td class="th-right th-hide-sm">
                  <div class="precio-compra text-muted" title="Precio Compra">
                    Compra: ${{ formatPrecio(producto.precio) }}
                  </div>
                  <div class="precio-venta" title="Precio Venta">
                    Venta: <strong v-if="producto.precio_venta">${{ formatPrecio(producto.precio_venta) }}</strong>
                    <span v-else class="text-muted">—</span>
                  </div>
                </td>

                <!-- Stock -->
                <td class="td-center">
                  <span class="stock-pill" :class="{
                      'stock-ok': producto.stock > 5,
                      'stock-low': producto.stock > 0 && producto.stock <= 5,
                      'stock-out': producto.stock === 0
                  }">
                    {{ producto.stock }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="td-center">
                  <span class="status-pill" :class="producto.publicado ? 'published' : 'draft'">
                    <i :class="producto.publicado ? 'fas fa-eye' : 'fas fa-eye-slash'" class="mr-1"></i>
                    {{ producto.publicado ? 'Público' : 'Privado' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="td-center actions-cell">
                  <!-- Botón Editar -->
                  <v-tooltip text="Editar producto" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn edit-btn" @click="abrirDialogoEditar(producto)">
                        <i class="fas fa-pen"></i>
                      </button>
                    </template>
                  </v-tooltip>

                  <!-- Botón Publicar/Despublicar -->
                  <v-tooltip :text="producto.publicado ? 'Bajar producto' : 'Publicar producto'" location="top">
                    <template #activator="{ props }">
                      <button 
                        v-bind="props" 
                        type="button" 
                        class="action-btn ml-1" 
                        :class="producto.publicado ? 'delete-btn' : 'deliver-btn'" 
                        @click="producto.publicado ? despublicar(producto) : abrirDialogoPublicar(producto)"
                      >
                        <i :class="producto.publicado ? 'fas fa-eye-slash' : 'fas fa-upload'"></i>
                      </button>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: PUBLICAR PRODUCTO                 -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogPublicar" max-width="620" scrollable>
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-upload mr-2"></i> Publicar Producto
        </div>
        
        <v-card-text class="pa-5" style="max-height: 70vh;">
          <v-form ref="pubFormRef">
            
            <div class="section-label mb-3"><i class="fas fa-image section-icon"></i><span>Imagen del producto</span></div>
            <v-btn-toggle v-model="imagenModo" mandatory density="compact" class="mb-3 custom-toggle">
              <v-btn value="url" size="small">Desde URL</v-btn>
              <v-btn value="archivo" size="small">Subir archivo</v-btn>
            </v-btn-toggle>

            <v-text-field v-if="imagenModo === 'url'" label="URL de la imagen" v-model="pubForm.imagenUrl" variant="outlined" rounded="lg" density="comfortable" class="mb-2">
              <template #prepend-inner><i class="fas fa-link field-icon"></i></template>
            </v-text-field>

            <div v-if="imagenModo === 'archivo'" class="mb-3">
              <v-file-input label="Seleccionar imagen" accept="image/*" variant="outlined" rounded="lg" density="comfortable" @change="onFileChange" prepend-icon="">
                <template #prepend-inner><i class="fas fa-upload field-icon"></i></template>
              </v-file-input>
              <v-img v-if="imagenPreview" :src="imagenPreview" max-height="160" contain class="rounded-lg mt-2 border-img" />
            </div>

            <v-divider class="my-4" />
            
            <div class="section-label mb-3"><i class="fas fa-info-circle section-icon"></i><span>Información básica</span></div>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select label="Categoría *" v-model="pubForm.categoriaId" :items="categorias" item-title="nombre" item-value="id" :loading="loadingCategorias" variant="outlined" rounded="lg" density="comfortable" :rules="[v => !!v || 'Requerido']">
                  <template #prepend-inner><i class="fas fa-tags field-icon"></i></template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Precio de venta *" v-model.number="pubForm.precio_venta" type="number" prefix="$" variant="outlined" rounded="lg" density="comfortable" :rules="[v => v > 0 || 'Inválido']">
                  <template #prepend-inner><i class="fas fa-dollar-sign field-icon"></i></template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-textarea label="Descripción para clientes *" v-model="pubForm.descripcionPublica" rows="3" variant="outlined" rounded="lg" density="comfortable" :rules="[v => !!v?.trim() || 'Requerido']" />

            <v-divider class="my-4" />

            <div class="section-label mb-3"><i class="fas fa-list section-icon"></i><span>Detalles Adicionales (Opcional)</span></div>
            <v-row>
              <v-col cols="12" sm="6"><v-textarea label="Ingredientes" v-model="pubForm.ingredientes" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Modo de uso" v-model="pubForm.modo_uso" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Presentaciones" v-model="pubForm.cantidades" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Beneficios (separados por coma)" v-model="pubForm.beneficiosTexto" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
            </v-row>

          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogPublicar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn class="submit-btn flex-grow-1" rounded="lg" @click="confirmarPublicacion" :loading="productoStore.loading">
            <i class="fas fa-check mr-2"></i> Publicar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: EDITAR PRODUCTO                   -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogEditar" max-width="620" scrollable persistent>
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header edit">
          <i class="fas fa-pen mr-2"></i> Editar Producto
        </div>
        
        <v-card-text class="pa-5" style="max-height: 70vh;">
          <v-form ref="editFormRef">
            
            <div class="section-label mb-3"><i class="fas fa-box section-icon"></i><span>Datos Generales</span></div>
            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field label="Código" v-model="editForm.codigo" variant="outlined" rounded="lg" density="comfortable" class="mb-2">
                  <template #prepend-inner><i class="fas fa-barcode field-icon"></i></template>
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="8">
                <v-text-field label="Nombre del producto *" v-model="editForm.nombre" variant="outlined" rounded="lg" density="comfortable" :rules="[v => !!v?.trim() || 'Requerido']" class="mb-2">
                  <template #prepend-inner><i class="fas fa-font field-icon"></i></template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Reusa formato de imagenes de arriba -->
            <div class="section-label mb-3"><i class="fas fa-image section-icon"></i><span>Imagen del producto</span></div>
            <v-btn-toggle v-model="editImagenModo" mandatory density="compact" class="mb-3 custom-toggle edit">
              <v-btn value="url" size="small">Desde URL</v-btn>
              <v-btn value="archivo" size="small">Subir archivo</v-btn>
            </v-btn-toggle>

            <v-text-field v-if="editImagenModo === 'url'" label="URL de la imagen" v-model="editForm.imagenUrl" variant="outlined" rounded="lg" density="comfortable" class="mb-2">
              <template #prepend-inner><i class="fas fa-link field-icon"></i></template>
            </v-text-field>

            <div v-if="editImagenModo === 'archivo'" class="mb-3">
              <v-file-input label="Seleccionar imagen" accept="image/*" variant="outlined" rounded="lg" density="comfortable" @change="onEditFileChange" prepend-icon="">
                <template #prepend-inner><i class="fas fa-upload field-icon"></i></template>
              </v-file-input>
              <v-img v-if="editImagenPreview" :src="editImagenPreview" max-height="160" contain class="rounded-lg mt-2 border-img" />
            </div>

            <v-divider class="my-4" />

            <div class="section-label mb-3"><i class="fas fa-bullhorn section-icon"></i><span>Datos de publicación</span></div>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select label="Categoría" v-model="editForm.categoriaId" :items="categorias" item-title="nombre" item-value="id" :loading="loadingCategorias" variant="outlined" rounded="lg" density="comfortable">
                  <template #prepend-inner><i class="fas fa-tags field-icon"></i></template>
                </v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Precio de venta" v-model.number="editForm.precio_venta" type="number" prefix="$" variant="outlined" rounded="lg" density="comfortable">
                  <template #prepend-inner><i class="fas fa-dollar-sign field-icon"></i></template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-textarea label="Descripción pública" v-model="editForm.descripcionPublica" rows="3" variant="outlined" rounded="lg" density="comfortable" />

            <v-divider class="my-4" />

            <div class="section-label mb-3"><i class="fas fa-list section-icon"></i><span>Detalles Adicionales (Opcional)</span></div>
            <v-row>
              <v-col cols="12" sm="6"><v-textarea label="Ingredientes" v-model="editForm.ingredientes" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Modo de uso" v-model="editForm.modo_uso" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Presentaciones" v-model="editForm.cantidades" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
              <v-col cols="12" sm="6"><v-textarea label="Beneficios (separados por coma)" v-model="editForm.beneficiosTexto" rows="2" variant="outlined" rounded="lg" density="compact" /></v-col>
            </v-row>

          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEditar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn class="submit-btn edit flex-grow-1" rounded="lg" @click="confirmarEdicion" :loading="productoStore.loading">
            <i class="fas fa-save mr-2"></i> Guardar Cambios
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

const dialogEditar = ref(false);
const editFormRef = ref(null);
const editImagenModo = ref('url');
const editImagenPreview = ref(null);
const editImagenBase64 = ref(null);

const editForm = ref({ codigo: '', nombre: '', imagenUrl: '', categoriaId: null, precio_venta: 0, descripcionPublica: '', ingredientes: '', modo_uso: '', cantidades: '', beneficiosTexto: '' });
const pubForm = ref({ imagenUrl: '', categoriaId: null, precio_venta: 0, descripcionPublica: '', ingredientes: '', modo_uso: '', cantidades: '', beneficiosTexto: '' });

const formatPrecio = (valor) => Number(valor).toLocaleString('es-CO');

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
        beneficiosTexto: Array.isArray(producto.beneficios) ? producto.beneficios.join(', ') : (producto.beneficios || '')
    };
    dialogPublicar.value = true;
};

const confirmarPublicacion = async () => {
    if (!selectedProducto.value) return;
    const { valid } = await pubFormRef.value?.validate() ?? { valid: true };
    if (!valid) return;

    const imagenFinal = imagenModo.value === 'archivo' && imagenBase64.value ? imagenBase64.value : pubForm.value.imagenUrl || undefined;
    const beneficiosArray = pubForm.value.beneficiosTexto ? pubForm.value.beneficiosTexto.split(',').map(b => b.trim()).filter(Boolean) : [];

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
    } catch (e) { console.error('Error al publicar', e); }
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
        beneficiosTexto: Array.isArray(producto.beneficios) ? producto.beneficios.join(', ') : (producto.beneficios || '')
    };
    dialogEditar.value = true;
};

const confirmarEdicion = async () => {
    if (!selectedProducto.value) return;
    const { valid } = await editFormRef.value?.validate() ?? { valid: true };
    if (!valid) return;

    const imagenFinal = editImagenModo.value === 'archivo' && editImagenBase64.value ? editImagenBase64.value : editForm.value.imagenUrl || undefined;
    const beneficiosArray = editForm.value.beneficiosTexto ? editForm.value.beneficiosTexto.split(',').map(b => b.trim()).filter(Boolean) : [];

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
    } catch (e) { console.error('Error al editar', e); }
};

const despublicar = async (producto) => {
    if (!producto.id) return;
    try { await productoStore.despublicarProducto(producto.id); } catch (e) { console.error('Error al despublicar', e); }
};

onMounted(async () => {
    await productoStore.getProductos();
    await cargarCategorias();
});
</script>

<style scoped>
/* ── Header Principal ── */
.form-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%); color: white; border-radius: 12px 12px 0 0; }
.header-icon { width: 46px; height: 46px; min-width: 46px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.header-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.8rem; margin: 0; opacity: 0.85; }

.new-order-btn { background: rgba(255,255,255,0.2) !important; color: white !important; font-weight: 700 !important; border: 1px solid rgba(255,255,255,0.4) !important; }
.new-order-btn:hover { background: rgba(255,255,255,0.3) !important; }

/* ── Tabla Header ── */
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 0; }
.table-title { font-size: 1rem; font-weight: 700; color: #333; display: flex; align-items: center; }

.empty-state { text-align: center; padding: 40px 20px; color: #aaa; }
.empty-state i { font-size: 2.5rem; margin-bottom: 10px; display: block; opacity: 0.4; color: #ee6f38; }
.empty-state p { margin: 0; font-size: 0.9rem; }

/* ── Custom Table ── */
.table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #f0f0f0; margin-top: 8px; }
.brand-table { width: 100%; border-collapse: collapse; }
.brand-table thead tr { background: #fff8f5; }
.brand-table th { padding: 12px 16px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #ee6f38; border-bottom: 2px solid #fde8d8; white-space: nowrap; }
.th-left { text-align: left; } .th-right { text-align: right; } .th-center { text-align: center; }
.td-center { text-align: center; }
.brand-row { transition: background 0.15s; }
.brand-row:hover { background: #fff8f5; }
.brand-row td { padding: 12px 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

/* ── Elementos de tabla ── */
.miniatura-wrap { display: flex; align-items: center; justify-content: center; }
.miniatura-placeholder { width: 44px; height: 44px; border-radius: 6px; background: #f8f8f8; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; }
.text-muted { color: #888; font-size: 0.82rem; }
.prod-nombre { font-weight: 600; color: #333; font-size: 0.9rem; }
.prod-codigo { font-size: 0.72rem; color: #999; margin-top: 2px; }
.precio-compra { font-size: 0.8rem; margin-bottom: 2px; }
.precio-venta strong { font-size: 0.9rem; color: #ee6f38; }

/* ── Pills ── */
.category-pill { background: #f0f0f0; color: #555; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.stock-pill { display: inline-block; min-width: 32px; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.stock-ok { background: #e8f5e9; color: #2e7d32; }
.stock-low { background: #fff3e0; color: #ef6c00; }
.stock-out { background: #ffebee; color: #c62828; }

.status-pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.status-pill.published { background: #e3f2fd; color: #1565c0; }
.status-pill.draft { background: #f5f5f5; color: #757575; border: 1px solid #e0e0e0; }

/* ── Action buttons ── */
.actions-cell { white-space: nowrap; }
.action-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.18s; margin: 0 3px; }
.edit-btn { background: #fff3e0; color: #ee6f38; } .edit-btn:hover { background: #ee6f38; color: white; }
.deliver-btn { background: #e3f2fd; color: #1565c0; } .deliver-btn:hover { background: #1565c0; color: white; }
.delete-btn { background: #ffeaea; color: #e53935; } .delete-btn:hover { background: #e53935; color: white; }

/* ── Dialog Components ── */
.dialog-header { padding: 18px 22px; background: linear-gradient(135deg, #ee6f38, #d45a22); color: white; font-weight: 700; font-size: 1rem; border-radius: 12px 12px 0 0; }
.dialog-header.edit { background: linear-gradient(135deg, #f9a825, #f57f17); }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #555; }
.section-icon { background: #ee6f38; color: white; padding: 4px 6px; border-radius: 6px; font-size: 11px; }

.submit-btn { background: linear-gradient(135deg, #ee6f38, #d45a22) !important; color: white !important; font-weight: 700; }
.submit-btn.edit { background: linear-gradient(135deg, #f9a825, #f57f17) !important; }
.submit-btn:disabled { opacity: 0.45 !important; }

.field-icon { color: #7f8c9a; font-size: 13px; margin-right: 4px; }
.gap-2 { gap: 8px; }
.border-img { border: 1px solid #f0f0f0; background: #fafafa; }

/* Toggle Fixes */
.custom-toggle { border-radius: 8px; border: 1px solid #fde8d8 !important; }
.custom-toggle .v-btn--active { background: #ee6f38 !important; color: white !important; }
.custom-toggle.edit { border: 1px solid #fff59d !important; }
.custom-toggle.edit .v-btn--active { background: #f9a825 !important; color: white !important; }

@media (max-width: 600px) {
  .form-header { flex-wrap: wrap; }
  .th-hide-sm { display: none; }
}
</style>