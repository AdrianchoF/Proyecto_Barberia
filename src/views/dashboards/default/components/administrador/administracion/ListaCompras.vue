<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- HEADER CARD + FILTROS         -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-shopping-cart"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Compras a Proveedores</h2>
          <p class="header-subtitle">Gestiona y da seguimiento a todas las órdenes de compra</p>
        </div>
        <v-btn class="new-order-btn" to="/crear-compra" rounded="lg">
          <i class="fas fa-plus mr-2"></i> Nueva Orden
        </v-btn>
      </div>

      <v-card-text class="pa-4 pb-4">
        <div class="filter-bar">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            type="button"
            class="filter-chip"
            :class="{ active: filtroEstado === opt.value }"
            @click="filtroEstado = opt.value"
          >
            <i :class="opt.icon" class="mr-1"></i> {{ opt.label }}
          </button>
        </div>
      </v-card-text>
    </v-card>

    <!-- Alerts -->
    <v-alert v-if="compraStore.error" type="error" rounded="lg" variant="tonal" class="mb-4" closable @click:close="compraStore.limpiarMensajes()">
      {{ compraStore.error }}
    </v-alert>
    <v-alert v-if="compraStore.successMessage" type="success" rounded="lg" variant="tonal" class="mb-4" closable @click:close="compraStore.limpiarMensajes()">
      {{ compraStore.successMessage }}
    </v-alert>

    <v-progress-linear v-if="compraStore.loading" color="#ee6f38" indeterminate rounded class="mb-4" />

    <!-- ══════════════════════════════ -->
    <!-- ALERTA: ÓRDENES ABANDONADAS    -->
    <!-- ══════════════════════════════ -->
    <v-alert
      v-if="comprasHuérfanas.length > 0"
      type="warning"
      variant="tonal"
      rounded="xl"
      class="mb-6 border-warning"
      border="start"
    >
      <template #prepend>
        <i class="fas fa-exclamation-circle text-warning mr-3" style="font-size: 28px;"></i>
      </template>
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div>
          <strong class="text-subtitle-1">Gestiona tus órdenes pendientes</strong>
          <p class="text-caption mb-0">Tienes {{ comprasHuérfanas.length }} orden(es) que parecen estar inactivas o vacías. ¿Deseas revisarlas?</p>
        </div>
        <v-btn size="small" variant="flat" color="warning" @click="filtroEstado = 'pendiente'">
          Ver Pendientes
        </v-btn>
      </div>
    </v-alert>

    <!-- ══════════════════════════════ -->
    <!-- TABLA DE COMPRAS              -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="xl">
      <div class="table-header">
        <div class="table-title">
          <i class="fas fa-list mr-2"></i> Órdenes
          <v-chip class="ml-2" size="small" color="#ee6f38" variant="flat">
            {{ comprasFiltradasList.length }}
          </v-chip>
        </div>
      </div>

      <v-card-text class="pa-4">
        <div v-if="!compraStore.loading && comprasFiltradasList.length === 0" class="empty-state">
          <i class="fas fa-shopping-bag"></i>
          <p>No hay compras {{ filtroEstado ? `con estado "${filtroEstado}"` : 'registradas' }}</p>
        </div>

        <div v-else class="compra-table-wrapper">
          <table class="compra-table">
            <thead>
              <tr>
                <th class="th-left">Orden</th>
                <th class="th-left">Proveedor</th>
                <th class="th-left th-hide-sm">Fecha</th>
                <th class="th-right">Total</th>
                <th class="th-center">Estado</th>
                <th class="th-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="compra in comprasFiltradasList" :key="compra.id_compra" class="compra-row">
                <td>
                  <span class="order-id">#{{ compra.id_compra }}</span>
                </td>
                <td>
                  <div class="proveedor-name">{{ compra.proveedor?.nombre || 'Sin asignar' }}</div>
                </td>
                <td class="th-hide-sm text-muted">
                  {{ formatDate(compra.fecha_compra) }}
                </td>
                <td class="th-right">
                  <strong class="total-amount">${{ Number(compra.total).toFixed(2) }}</strong>
                </td>
                <td class="th-center">
                  <span :class="compra.estado === 'entregada' ? 'status-pill delivered' : 'status-pill pending'">
                    <i :class="compra.estado === 'entregada' ? 'fas fa-check-circle' : 'fas fa-clock'" class="mr-1"></i>
                    {{ compra.estado === 'entregada' ? 'Entregada' : 'Pendiente' }}
                  </span>
                </td>
                <td class="th-center actions-cell">
                  <!-- Ver detalles -->
                  <v-tooltip text="Ver detalles" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn view-btn" @click="verDetalles(compra.id_compra)">
                        <i class="fas fa-eye"></i>
                      </button>
                    </template>
                  </v-tooltip>

                  <!-- Adjuntar confirmación (Manual) -->
                  <v-tooltip v-if="compra.estado !== 'entregada'" text="Cargar Factura / Productos" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn confirm-btn" @click="abrirModalCargaManual(compra.id_compra)">
                        <i class="fas fa-file-invoice"></i>
                      </button>
                    </template>
                  </v-tooltip>

                  <!-- Marcar entregada -->
                  <v-tooltip v-if="compra.estado !== 'entregada'" text="Marcar como entregada" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn deliver-btn" @click="abrirDialogoEntrega(compra.id_compra)">
                        <i class="fas fa-check"></i>
                      </button>
                    </template>
                  </v-tooltip>

                  <!-- Eliminar orden (Solo si es pendiente) -->
                  <v-tooltip v-if="compra.estado === 'pendiente'" text="Eliminar orden accidental" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn delete-btn ml-1" @click="abrirConfirmarEliminarCompra(compra)">
                        <i class="fas fa-trash-alt"></i>
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
    <!-- DIALOG: VER DETALLES                      -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogDetalles" max-width="700">
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-receipt mr-2"></i> Detalle de Compra #{{ detallesCompra?.id_compra }}
        </div>
        <v-card-text class="pa-5">
          <div v-if="detallesCompra">
            <v-row class="mb-2">
              <v-col cols="6">
                <div class="detail-label">Proveedor</div>
                <div class="detail-value">{{ detallesCompra.proveedor?.nombre }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">Estado</div>
                <span :class="detallesCompra.estado === 'entregada' ? 'status-pill delivered' : 'status-pill pending'">
                  <i :class="detallesCompra.estado === 'entregada' ? 'fas fa-check-circle' : 'fas fa-clock'" class="mr-1"></i>
                  {{ detallesCompra.estado === 'entregada' ? 'Entregada' : 'Pendiente' }}
                </span>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">Fecha de Compra</div>
                <div class="detail-value">{{ formatDate(detallesCompra.fecha_compra) }}</div>
              </v-col>
              <v-col cols="6" v-if="detallesCompra.fecha_entrega">
                <div class="detail-label">Fecha de Entrega</div>
                <div class="detail-value">{{ formatDate(detallesCompra.fecha_entrega) }}</div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />
            <div class="section-label mb-3">
              <i class="fas fa-boxes section-icon"></i>
              <span>Productos</span>
            </div>

            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Ref. Prov</th>
                    <th>Producto</th>
                    <th class="th-center">Cant.</th>
                    <th class="th-right">Precio U.</th>
                    <th class="th-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in detallesCompra.detalles" :key="detalle.id_detalle">
                    <td><span class="code-badge">{{ detalle.producto?.codigo || '-' }}</span></td>
                    <td><small class="text-muted">{{ detalle.codigo_producto || '-' }}</small></td>
                    <td>{{ detalle.producto?.nombre || '—' }}</td>
                    <td class="th-center">{{ detalle.cantidad }}</td>
                    <td class="th-right">${{ Number(detalle.precio_unitario).toFixed(2) }}</td>
                    <td class="th-right"><strong>${{ Number(detalle.total).toFixed(2) }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-row mt-4">
              <span>Total</span>
              <strong class="total-amount">${{ Number(detallesCompra.total).toFixed(2) }}</strong>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="dialogDetalles = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: CARGA MANUAL DE PRODUCTOS         -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogCarga" max-width="900" persistent>
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-boxes mr-2"></i> Carga de Productos — Compra #{{ detallesCompra?.id_compra }}
        </div>
        <v-card-text class="pa-5">
          <v-alert type="info" variant="tonal" rounded="lg" class="mb-4" density="compact">
            Busca y selecciona los productos que llegaron en la factura del proveedor.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="productoSeleccionado"
                :items="productoStore.productos"
                item-title="nombre"
                item-value="id"
                label="Buscar Producto en Catálogo"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="fas fa-search"
                density="comfortable"
                @update:model-value="alSeleccionarProducto"
                return-object
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="'Stock actual: ' + item.raw.stock + ' | Código: ' + (item.raw.codigo || 'N/A')"></v-list-item>
                </template>
                <template #prepend-item>
                  <v-list-item @click="abrirDialogoNuevoProducto">
                    <template #prepend>
                      <v-icon color="#ee6f38">fas fa-plus-circle</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-bold text-orange-darken-3">
                      ¿No lo encuentras? Crear Producto Nuevo
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider class="mb-2"></v-divider>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="tempItem.cantidad"
                label="Cantidad"
                type="number"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="tempItem.precio_unitario"
                label="Costo Unitario"
                type="number"
                prefix="$"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model="tempItem.codigo_producto"
                label="Ref. Proveedor"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                placeholder="Ej: C-10"
                @keyup.enter="agregarLineaManual"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="pt-0">
              <v-btn block color="#ee6f38" variant="flat" rounded="lg" @click="agregarLineaManual" :disabled="!productoSeleccionado">
                <i class="fas fa-plus mr-2"></i> Agregar a la Lista
              </v-btn>
            </v-col>
          </v-row>

          <!-- Tabla de ítems agregados -->
          <div class="mt-6" v-if="itemsCarga.length > 0">
            <div class="section-label mb-2">
              <i class="fas fa-list-ul section-icon"></i><span>Productos a Ingresar</span>
            </div>
            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Ref. Prov</th>
                    <th class="th-center">Cant.</th>
                    <th class="th-right">Costo U.</th>
                    <th class="th-right">Subtotal</th>
                    <th class="th-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in itemsCarga" :key="idx">
                    <td>
                      <div class="font-weight-bold">{{ item.nombre_producto }}</div>
                      <small class="text-muted">ID: {{ item.id_producto }}</small>
                    </td>
                    <td>
                      <v-text-field v-model="item.codigo_producto" density="compact" hide-details variant="plain" placeholder="-"></v-text-field>
                    </td>
                    <td class="th-center" style="width: 100px;">
                      <v-text-field v-model.number="item.cantidad" density="compact" hide-details type="number" variant="plain" class="text-center"></v-text-field>
                    </td>
                    <td class="th-right" style="width: 150px;">
                      <v-text-field v-model.number="item.precio_unitario" density="compact" hide-details type="number" prefix="$" variant="plain" class="text-right"></v-text-field>
                    </td>
                    <td class="th-right">
                      <strong>${{ (item.cantidad * item.precio_unitario).toFixed(2) }}</strong>
                    </td>
                    <td class="th-center">
                      <button type="button" class="action-btn view-btn" @click="quitarLinea(idx)" style="background: #ffebee; color: #c62828;">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-row mt-4">
              <span>Total Factura</span>
              <strong class="total-amount">${{ totalCarga.toFixed(2) }}</strong>
            </div>
          </div>
          <div v-else class="text-center py-10 text-muted">
            <i class="fas fa-box-open d-block mb-2" style="font-size: 32px; opacity: 0.2;"></i>
            No has agregado productos todavía.
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" color="error" @click="dialogCarga = false">Cerrar</v-btn>
          <v-spacer />
          <v-btn class="submit-btn" rounded="lg" @click="guardarCargaYFinalizar" :loading="compraStore.loading" :disabled="itemsCarga.length === 0">
            <i class="fas fa-save mr-1"></i> Guardar y Finalizar Compra
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: MARCAR ENTREGADA                  -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogEntrega" max-width="460">
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header success">
          <i class="fas fa-check-circle mr-2"></i> Marcar como Entregada
        </div>
        <v-card-text class="pa-5">
          <p class="mb-4">¿Deseas marcar esta compra como entregada?</p>
          <v-text-field
            v-model="fechaEntrega"
            type="datetime-local"
            label="Fecha de Entrega (opcional)"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          >
            <template #prepend-inner><i class="fas fa-calendar-check field-icon"></i></template>
          </v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEntrega = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn class="submit-btn flex-grow-1" rounded="lg" @click="confirmarEntrega" :loading="compraStore.loading">
            <i class="fas fa-check mr-1"></i> Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: CREAR PRODUCTO RÁPIDO             -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogNuevoProducto" max-width="500">
      <v-card rounded="xl" elevation="10" border="1px solid #ee6f38">
        <div class="dialog-header accent">
          <i class="fas fa-plus-circle mr-2"></i> Nuevo Producto para Catálogo
        </div>
        <v-card-text class="pa-5">
          <v-alert v-if="productoStore.error" type="error" variant="tonal" rounded="lg" class="mb-4" density="compact">
            {{ productoStore.error }}
          </v-alert>
          <p class="text-caption mb-4">Ingresa los datos básicos para añadir este producto al catálogo global.</p>
          <v-text-field
            v-model="productoRapido.nombre"
            label="Nombre del Producto"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="productoRapido.codigo"
            label="Código de Referencia"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-2"
          ></v-text-field>
          <v-select
            v-model="productoRapido.categoriaId"
            :items="categoriaStore.categoriasProducto"
            item-title="nombre"
            item-value="id"
            label="Categoría"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-2"
          ></v-select>

          <v-divider class="my-3"></v-divider>
          <div class="section-label mb-2"><i class="fas fa-image section-icon"></i><span>Imagen (Opcional)</span></div>
          
          <v-btn-toggle v-model="productoRapidoImagenModo" mandatory density="compact" class="mb-3 custom-toggle-small">
            <v-btn value="url" size="x-small">URL</v-btn>
            <v-btn value="archivo" size="x-small">Archivo</v-btn>
          </v-btn-toggle>

          <v-text-field
            v-if="productoRapidoImagenModo === 'url'"
            v-model="productoRapido.imagenUrl"
            label="URL de la imagen"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          >
            <template #prepend-inner><i class="fas fa-link field-icon"></i></template>
          </v-text-field>

          <div v-if="productoRapidoImagenModo === 'archivo'">
            <v-file-input
              label="Seleccionar imagen"
              accept="image/*"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              prepend-icon=""
              @change="onProductoRapidoFileChange"
            >
              <template #prepend-inner><i class="fas fa-upload field-icon"></i></template>
            </v-file-input>
            <v-img v-if="productoRapidoImagenPreview" :src="productoRapidoImagenPreview" max-height="100" contain class="rounded-lg mt-1 border-img" />
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogNuevoProducto = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn 
            class="submit-btn" 
            rounded="lg" 
            @click="crearProductoRapido" 
            :loading="productoStore.loading"
            :disabled="!productoRapido.nombre || !productoRapido.categoriaId"
          >
            <i class="fas fa-save mr-1"></i> Crear y Añadir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════════════════ -->
    <!-- DIALOG: CONFIRMAR ELIMINAR COMPRA         -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogEliminarCompra" max-width="420">
      <v-card rounded="xl" elevation="10" border="1px solid #ff5252">
        <div class="dialog-header error bg-red-darken-2" style="background: linear-gradient(135deg, #ff5252, #d32f2f) !important;">
          <i class="fas fa-exclamation-triangle mr-2"></i> Eliminar Orden de Compra
        </div>
        <v-card-text class="pa-5 text-center">
          <div class="mb-4 d-flex justify-center align-center">
             <div class="position-relative">
                <i class="fas fa-file-invoice text-error" style="font-size: 54px; opacity: 0.3;"></i>
                <i class="fas fa-trash-alt text-error position-absolute" style="font-size: 24px; bottom: 0; right: -10px;"></i>
             </div>
          </div>
          <p class="text-h6 mb-2">¿Anular esta compra?</p>
          <p>Se eliminará la orden <strong>#{{ compraAEliminar?.id_compra }}</strong> y todos sus ítems cargados.</p>
          <v-alert type="info" variant="tonal" density="compact" class="mt-4 text-left" rounded="lg">
            Usa esto si la orden fue un error o si el proveedor finalmente no pudo despacharla.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEliminarCompra = false" class="flex-grow-1">Volver</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="confirmarEliminarCompra" :loading="compraStore.loading" class="flex-grow-1">
            Eliminar Orden
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
import { useCategoriaProductoStore } from '@/stores/CategoriaProducto';

const compraStore = useCompraStore();
const productoStore = useProductoStore();
const categoriaStore = useCategoriaProductoStore();

const filtroEstado = ref('');
const dialogDetalles = ref(false);
const dialogEntrega = ref(false);
const dialogCarga = ref(false);
const dialogNuevoProducto = ref(false);

const detallesCompra = ref<any | null>(null);
const compraIdParaEntrega = ref<number | null>(null);
const fechaEntrega = ref('');

const dialogEliminarCompra = ref(false);
const compraAEliminar = ref<any | null>(null);

// Para carga manual
const productoSeleccionado = ref<any>(null);
const tempItem = ref({ cantidad: 1, precio_unitario: 0, codigo_producto: '' });
const itemsCarga = ref<any[]>([]);

// Para creación rápida
const productoRapido = ref({
  nombre: '',
  codigo: '',
  categoriaId: null as number | null,
  descripcion: 'Autocreado desde orden de compra',
  precio: 0,
  stock: 0,
  imagenUrl: ''
});

const productoRapidoImagenModo = ref('url');
const productoRapidoImagenPreview = ref<string | null>(null);
const productoRapidoImagenBase64 = ref<string | null>(null);

const filterOptions = [
  { value: '', label: 'Todas', icon: 'fas fa-th-list' },
  { value: 'pendiente', label: 'Pendientes', icon: 'fas fa-clock' },
  { value: 'entregada', label: 'Entregadas', icon: 'fas fa-check-circle' },
];

const comprasFiltradasList = computed(() => {
  if (!filtroEstado.value) return compraStore.compras;
  return compraStore.compras.filter(c => c.estado === filtroEstado.value);
});

const totalCarga = computed(() => {
  return itemsCarga.value.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
});

const comprasHuérfanas = computed(() => {
  const ahora = new Date();
  return compraStore.compras.filter(c => {
    if (c.estado !== 'pendiente') return false;
    
    const fecha = new Date(c.fecha_compra);
    const horasDif = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60);
    
    // Es huérfana si tiene total 0 O si lleva más de 24 horas pendiente
    return Number(c.total) === 0 || horasDif > 24;
  });
});

watch(() => compraStore.successMessage, (val) => { if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000); });
watch(() => compraStore.error, (val) => { if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000); });

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

const abrirConfirmarEliminarCompra = (compra: any) => {
  compraAEliminar.value = compra;
  dialogEliminarCompra.value = true;
};

const confirmarEliminarCompra = async () => {
  if (!compraAEliminar.value?.id_compra) return;
  try {
    await compraStore.deleteCompra(compraAEliminar.value.id_compra);
    dialogEliminarCompra.value = false;
    compraAEliminar.value = null;
  } catch (err) {
    console.error('Error al eliminar compra:', err);
  }
};

const abrirModalCargaManual = async (id: number) => {
  await compraStore.getCompraById(id);
  detallesCompra.value = compraStore.compraActual;
  itemsCarga.value = [];
  productoSeleccionado.value = null;
  tempItem.value = { cantidad: 1, precio_unitario: 0, codigo_producto: '' };
  
  // Asegurar productos y categorías cargados
  if (productoStore.productos.length === 0) {
    await productoStore.getProductos();
  }
  if (categoriaStore.categoriasProducto.length === 0) {
    await categoriaStore.getCategoriasProducto();
  }
  
  dialogCarga.value = true;
};

const alSeleccionarProducto = (prod: any) => {
  if (prod) {
    tempItem.value.precio_unitario = prod.precio_costo || 0;
  }
};

const abrirDialogoNuevoProducto = () => {
  productoStore.error = null; // Limpiar errores previos
  productoRapido.value = {
    nombre: '',
    codigo: '',
    categoriaId: categoriaStore.categoriasProducto.length > 0 ? (categoriaStore.categoriasProducto[0].id || null) : null,
    descripcion: 'Autocreado desde orden de compra',
    precio: 0,
    stock: 0,
    imagenUrl: ''
  };
  productoRapidoImagenModo.value = 'url';
  productoRapidoImagenPreview.value = null;
  productoRapidoImagenBase64.value = null;
  dialogNuevoProducto.value = true;
};

const onProductoRapidoFileChange = (event: any) => {
  const file = event.target.files?.[0];
  if (!file) {
    productoRapidoImagenPreview.value = null;
    productoRapidoImagenBase64.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = (e: any) => {
    productoRapidoImagenPreview.value = e.target.result;
    productoRapidoImagenBase64.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const crearProductoRapido = async () => {
  try {
    const payload = { ...productoRapido.value };
    
    // Asignar imagen si es modo archivo
    if (productoRapidoImagenModo.value === 'archivo' && productoRapidoImagenBase64.value) {
      payload.imagenUrl = productoRapidoImagenBase64.value;
    }

    const nuevoProd = await productoStore.createProducto(payload as any);
    if (nuevoProd) {
      // En lugar de añadirlo directamente, lo seleccionamos para que el usuario
      // defina cantidad y precio en el formulario principal.
      productoSeleccionado.value = nuevoProd;
      tempItem.value.cantidad = 1;
      tempItem.value.precio_unitario = 0;
      
      dialogNuevoProducto.value = false;
      compraStore.successMessage = 'Producto creado. Ahora ingresa su cantidad y costo.';
    }
  } catch (err) {
    console.error('Error al crear producto rápido:', err);
  }
};

const agregarLineaManual = () => {
  if (!productoSeleccionado.value) return;
  
  const p = productoSeleccionado.value;

  // Evitar duplicados: Si ya está en la lista, actualizar valores
  const existenteIdx = itemsCarga.value.findIndex(i => i.id_producto === p.id);
  if (existenteIdx !== -1) {
    itemsCarga.value[existenteIdx].cantidad += tempItem.value.cantidad;
    itemsCarga.value[existenteIdx].precio_unitario = tempItem.value.precio_unitario;
    compraStore.successMessage = 'Se actualizó la cantidad del producto existente';
  } else {
    itemsCarga.value.push({
      id_producto: p.id,
      nombre_producto: p.nombre,
      cantidad: tempItem.value.cantidad,
      precio_unitario: tempItem.value.precio_unitario,
      codigo_producto: tempItem.value.codigo_producto
    });
  }
  
  // Reset
  productoSeleccionado.value = null;
  tempItem.value = { cantidad: 1, precio_unitario: 0, codigo_producto: '' };
};

const quitarLinea = (idx: number) => {
  itemsCarga.value.splice(idx, 1);
};

const guardarCargaYFinalizar = async () => {
  if (!detallesCompra.value || itemsCarga.value.length === 0) return;
  try {
    // 1. Guardar detalles
    await compraStore.addDetalles(detallesCompra.value.id_compra, itemsCarga.value);
    // 2. Marcar como entregada (esto dispara la actualización de stock en el backend)
    await compraStore.marcarEntregada(detallesCompra.value.id_compra);
    
    // Refresh global
    await productoStore.getProductos();
    await compraStore.getCompras();
    
    dialogCarga.value = false;
    compraStore.successMessage = 'Inventario actualizado correctamente';
  } catch (error) {
    console.error('Error al guardar carga:', error);
  }
};

const confirmarEntrega = async () => {
  if (compraIdParaEntrega.value !== null) {
    try {
      await compraStore.marcarEntregada(compraIdParaEntrega.value, fechaEntrega.value || undefined);
      await productoStore.getProductos();
      dialogEntrega.value = false;
      compraIdParaEntrega.value = null;
      fechaEntrega.value = '';
    } catch (error) {
      console.error('Error al marcar como entregada:', error);
    }
  }
};

onMounted(async () => { 
  await compraStore.getCompras(); 
});
</script>

<style scoped>
/* ── Header ── */
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white; border-radius: 12px 12px 0 0;
}
.header-icon {
  width: 46px; height: 46px; min-width: 46px;
  border-radius: 12px; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.header-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.8rem; margin: 0; opacity: 0.85; }

.new-order-btn {
  background: rgba(255,255,255,0.2) !important;
  color: white !important;
  font-weight: 700 !important;
  border: 1px solid rgba(255,255,255,0.4) !important;
  flex-shrink: 0;
}
.new-order-btn:hover { background: rgba(255,255,255,0.3) !important; }

/* ── Filter bar ── */
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip {
  padding: 6px 14px; border-radius: 20px;
  border: 1.5px solid #e0e0e0; background: transparent;
  color: #666; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.filter-chip:hover { border-color: #ee6f38; color: #ee6f38; }
.filter-chip.active { background: #ee6f38; border-color: #ee6f38; color: white; }

/* ── Table ── */
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 0;
}
.table-title { font-size: 1rem; font-weight: 700; color: #333; display: flex; align-items: center; }

.empty-state { text-align: center; padding: 40px 20px; color: #aaa; }
.empty-state i { font-size: 2.5rem; margin-bottom: 10px; display: block; opacity: 0.4; color: #ee6f38; }
.empty-state p { margin: 0; font-size: 0.9rem; }

.compra-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #f0f0f0; margin-top: 8px; }
.compra-table { width: 100%; border-collapse: collapse; }
.compra-table thead tr { background: #fff8f5; }
.compra-table th {
  padding: 12px 16px; font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px; color: #ee6f38;
  border-bottom: 2px solid #fde8d8;
}
.th-left { text-align: left; }
.th-right { text-align: right; }
.th-center { text-align: center; }
.compra-row { transition: background 0.15s; }
.compra-row:hover { background: #fff8f5; }
.compra-row td { padding: 13px 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.order-id { font-weight: 700; color: #ee6f38; font-size: 0.95rem; }
.proveedor-name { font-weight: 500; color: #333; }
.text-muted { color: #888; font-size: 0.88rem; }
.total-amount { color: #333; font-size: 1rem; }

/* ── Status pills ── */
.status-pill {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700;
}
.status-pill.delivered { background: #e8f5e9; color: #2e7d32; }
.status-pill.pending { background: #fff3e0; color: #e65100; }

/* ── Action buttons ── */
.actions-cell { text-align: center; white-space: nowrap; }
.action-btn {
  width: 32px; height: 32px; border-radius: 10px; border: none;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; transition: all 0.18s; margin: 0 4px; border: 1px solid transparent;
}
.view-btn { background: #f0f4f8; color: #1565c0; border-color: #d0e1f0; }
.view-btn:hover { background: #1565c0; color: white; transform: translateY(-2px); }
.confirm-btn { background: #fff8f0; color: #ee6f38; border-color: #fde8d8; }
.confirm-btn:hover { background: #ee6f38; color: white; transform: translateY(-2px); }
.deliver-btn { background: #f0fdf4; color: #2e7d32; border-color: #dcfce7; }
.deliver-btn:hover { background: #2e7d32; color: white; transform: translateY(-2px); }

/* ── Detail dialog ── */
.detail-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #aaa; margin-bottom: 2px; }
.detail-value { font-weight: 500; color: #333; }

.detail-table-wrapper { overflow-x: auto; border-radius: 10px; border: 1px solid #eee; }
.detail-table { width: 100%; border-collapse: collapse; }
.detail-table thead tr { background: #fff8f5; }
.detail-table th { padding: 10px 12px; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #ee6f38; border-bottom: 2px solid #fde8d8; }
.detail-table td { padding: 10px 12px; border-bottom: 1px solid #f5f5f5; font-size: 0.88rem; }
.code-badge { background: #f0f0f0; padding: 2px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; color: #555; }

.total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff8f5; border-radius: 10px; border: 1px solid #fde8d8; }
.total-row .total-amount { font-size: 1.15rem; color: #ee6f38; }

/* ── Section label ── */
.section-label { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #555; }
.section-icon { background: #ee6f38; color: white; padding: 4px 6px; border-radius: 6px; font-size: 11px; }

/* ── Dialog header ── */
.dialog-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #ee6f38, #d45a22);
  color: white; font-weight: 700; font-size: 1rem;
  border-radius: 12px 12px 0 0;
}
.dialog-header.success { background: linear-gradient(135deg, #43a047, #1b5e20); }
.dialog-header.accent { background: linear-gradient(135deg, #333, #000); border-bottom: 2px solid #ee6f38; }

.text-orange-darken-3 { color: #bf360c !important; }

/* ── Submit ── */
.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important; font-weight: 700;
}
.submit-btn:disabled { opacity: 0.45 !important; }

.field-icon { color: #7f8c9a; font-size: 13px; margin-right: 4px; }
.gap-2 { gap: 8px; }

@media (max-width: 600px) {
  .form-header { flex-wrap: wrap; }
  .th-hide-sm { display: none; }
}

/* Toggle Small */
.custom-toggle-small { border-radius: 8px; border: 1px solid #fde8d8 !important; height: 32px !important; }
.custom-toggle-small .v-btn--active { background: #ee6f38 !important; color: white !important; }
.custom-toggle-small .v-btn { font-size: 10px !important; }

.border-img { border: 1px solid #fde8d8; background: #fafafa; border-radius: 8px; }
</style>
