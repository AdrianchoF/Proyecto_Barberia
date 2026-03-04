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

                  <!-- Adjuntar confirmación -->
                  <v-tooltip v-if="compra.estado !== 'entregada'" text="Adjuntar confirmación" location="top">
                    <template #activator="{ props }">
                      <button v-bind="props" type="button" class="action-btn confirm-btn" @click="abrirModalConfirmacionPara(compra.id_compra)">
                        <i class="fas fa-paperclip"></i>
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
                    <th>Producto</th>
                    <th class="th-center">Cant.</th>
                    <th class="th-right">Precio U.</th>
                    <th class="th-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in detallesCompra.detalles" :key="detalle.id_detalle">
                    <td><span class="code-badge">{{ detalle.codigo_producto || detalle.producto?.codigo || '-' }}</span></td>
                    <td>{{ detalle.producto?.nombre || detalle.nombre_producto || '—' }}</td>
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
    <!-- DIALOG: ADJUNTAR CONFIRMACIÓN             -->
    <!-- ══════════════════════════════════════════ -->
    <v-dialog v-model="dialogConfirmacion" max-width="800">
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-paperclip mr-2"></i> Adjuntar Confirmación — Compra #{{ detallesCompra?.id_compra }}
        </div>
        <v-card-text class="pa-5">
          <v-alert type="info" variant="tonal" rounded="lg" class="mb-4" density="compact">
            Pega la confirmación en este orden: <strong>código producto, nombre, cantidad, precio unitario</strong>
          </v-alert>

          <v-textarea
            v-model="textoConfirmacion"
            label="Pega aquí la confirmación (WhatsApp o correo)"
            variant="outlined"
            rounded="lg"
            rows="6"
            class="mb-3"
          />
          <v-file-input
            v-model="archivoConfirmacion"
            label="O sube un archivo (.pdf, .docx, .txt)"
            accept=".pdf,.doc,.docx,.txt"
            variant="outlined"
            rounded="lg"
            prepend-icon=""
            @change="analizarArchivo"
            clearable
          >
            <template #prepend-inner><i class="fas fa-file-upload field-icon"></i></template>
          </v-file-input>

          <!-- Líneas detectadas -->
          <div v-if="parsedLines && parsedLines.length" class="mt-4">
            <div class="section-label mb-2">
              <i class="fas fa-search section-icon"></i><span>Líneas detectadas</span>
            </div>
            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Código</th><th>Producto</th><th>Cant.</th><th>Precio U.</th><th>Subtotal</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, idx) in parsedLines" :key="idx">
                    <td><v-text-field density="compact" hide-details variant="outlined" v-model="line.codigo_producto" placeholder="Código" style="min-width:80px" /></td>
                    <td>{{ line.nombre_producto }}</td>
                    <td class="th-center">{{ line.cantidad }}</td>
                    <td class="th-right">{{ line.precio_unitario ?? '-' }}</td>
                    <td class="th-right">{{ line.subtotal ?? '-' }}</td>
                    <td class="th-center">
                      <button type="button" class="action-btn deliver-btn" @click="agregarLinea(idx)">
                        <i class="fas fa-plus"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Líneas a guardar -->
          <div v-if="addedLines && addedLines.length" class="mt-4">
            <div class="section-label mb-2">
              <i class="fas fa-check-circle section-icon"></i><span>Líneas seleccionadas para guardar</span>
            </div>
            <div class="detail-table-wrapper">
              <table class="detail-table">
                <thead>
                  <tr><th>Código</th><th>Producto</th><th>Cant.</th><th>Precio U.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(line, idx) in addedLines" :key="'a'+idx">
                    <td><span class="code-badge">{{ line.codigo_producto || '-' }}</span></td>
                    <td>{{ line.nombre_producto }}</td>
                    <td class="th-center">{{ line.cantidad }}</td>
                    <td class="th-right">{{ line.precio_unitario ?? '-' }}</td>
                    <td class="th-right">{{ line.subtotal ?? '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" color="error" @click="dialogConfirmacion = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="analizarConfirmacion" :loading="compraStore.loading">
            <i class="fas fa-search mr-1"></i> Analizar
          </v-btn>
          <v-btn class="submit-btn" rounded="lg" @click="guardarTodoYMarcarEntregada" :loading="compraStore.loading" :disabled="!(parsedLines.length || addedLines.length)">
            <i class="fas fa-save mr-1"></i> Guardar y Marcar Entregada
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

const filterOptions = [
  { value: '', label: 'Todas', icon: 'fas fa-th-list' },
  { value: 'pendiente', label: 'Pendientes', icon: 'fas fa-clock' },
  { value: 'entregada', label: 'Entregadas', icon: 'fas fa-check-circle' },
];

const comprasFiltradasList = computed(() => {
  if (!filtroEstado.value) return compraStore.compras;
  return compraStore.compras.filter(c => c.estado === filtroEstado.value);
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

const dialogConfirmacion = ref(false);
const textoConfirmacion = ref('');
const archivoConfirmacion = ref<File | null>(null);
const parsedLines = ref<any[]>([]);
const addedLines = ref<any[]>([]);

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
  addedLines.value.push(line);
  parsedLines.value.splice(idx, 1);
};

const guardarTodoYMarcarEntregada = async () => {
  if (!detallesCompra.value) return;
  const toSend = [...addedLines.value, ...parsedLines.value];
  if (toSend.length === 0) return;
  try {
    await compraStore.addDetalles(detallesCompra.value.id_compra, toSend);
    await compraStore.marcarEntregada(detallesCompra.value.id_compra);
    await productoStore.getProductos();
    await compraStore.getCompras();
    await verDetalles(detallesCompra.value.id_compra);
    parsedLines.value = [];
    addedLines.value = [];
    dialogConfirmacion.value = false;
  } catch (error) {
    console.error('Error al guardar y marcar entregada:', error);
  }
};

onMounted(async () => { await compraStore.getCompras(); });
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
  width: 30px; height: 30px; border-radius: 8px; border: none;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; transition: all 0.18s; margin: 0 2px;
}
.view-btn { background: #e3f2fd; color: #1565c0; }
.view-btn:hover { background: #1565c0; color: white; }
.confirm-btn { background: #fff3e0; color: #ee6f38; }
.confirm-btn:hover { background: #ee6f38; color: white; }
.deliver-btn { background: #e8f5e9; color: #2e7d32; }
.deliver-btn:hover { background: #2e7d32; color: white; }

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
</style>
