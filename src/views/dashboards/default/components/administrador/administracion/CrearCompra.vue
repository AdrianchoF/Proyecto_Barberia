<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- CARD PRINCIPAL                -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card" elevation="2" rounded="lg" style="max-width:760px; margin:auto">

      <div class="form-header">
        <div class="header-icon"><i class="fas fa-file-invoice"></i></div>
        <div>
          <h2 class="header-title">Nueva Orden de Compra</h2>
          <p class="header-subtitle">Selecciona el proveedor e inicia el pedido por WhatsApp</p>
        </div>
      </div>

      <v-card-text class="pa-6">

        <v-alert v-if="compraStore.error" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="compraStore.limpiarMensajes()">
          {{ compraStore.error }}
        </v-alert>
        <v-alert v-if="compraStore.successMessage" type="success" variant="tonal" rounded="lg" class="mb-4" closable @click:close="compraStore.limpiarMensajes()">
          {{ compraStore.successMessage }}
        </v-alert>

        <!-- SECCIÓN: PROVEEDOR -->
        <div class="section-label">
          <i class="fas fa-truck section-icon"></i>
          <span>Seleccionar Proveedor</span>
        </div>

        <v-select
          v-model="formulario.id_proveedor"
          :items="proveedoresDisponibles"
          item-title="nombre"
          item-value="id"
          label="Proveedor"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-2"
        >
          <template #prepend-inner>
            <i class="fas fa-building field-icon"></i>
          </template>
        </v-select>

        <v-alert type="info" variant="tonal" rounded="lg" density="compact" class="mb-6">
          <i class="fas fa-info-circle mr-2"></i>
          El administrador realiza el pedido por WhatsApp. Aquí solo se crea una orden pendiente para registrar la operación.
        </v-alert>

        <!-- SECCIÓN: ACCIONES -->
        <v-divider class="mb-5" />

        <div class="section-label">
          <i class="fas fa-bolt section-icon"></i>
          <span>Acciones</span>
        </div>

        <v-btn
          class="submit-btn mb-3"
          size="large"
          rounded="lg"
          block
          :loading="compraStore.loading"
          :disabled="!formulario.id_proveedor || compraStore.loading"
          @click="iniciarPedidoPorWhatsApp"
        >
          <i class="fab fa-whatsapp mr-2" style="font-size:16px"></i>
          Iniciar Pedido por WhatsApp y Guardar
        </v-btn>

        <v-btn
          variant="outlined"
          size="large"
          rounded="lg"
          block
          @click="volverAtras"
          :disabled="compraStore.loading"
        >
          <i class="fas fa-arrow-left mr-2"></i> Cancelar y Volver
        </v-btn>

      </v-card-text>
    </v-card>
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
const nuevoProducto = ref({ nombre: '', cantidad: 0, precio_unitario: 0, descripcion: '', categoriaId: null as number | null, imagenUrl: '' });
const proveedoresDisponibles = ref<any[]>([]);
const categoriasDisponibles = ref<any[]>([]);

const proveedorSeleccionado = computed(() => proveedoresDisponibles.value.find(p => p.id === formulario.value.id_proveedor));

watch(() => compraStore.successMessage, (val) => { if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000); });
watch(() => compraStore.error, (val) => { if (val) setTimeout(() => compraStore.limpiarMensajes(), 3000); });

const iniciarPedidoPorWhatsApp = async () => {
  if (!formulario.value.id_proveedor) {
    compraStore.error = 'Selecciona un proveedor';
    return;
  }
  try {
    const created = await compraStore.createCompra({ id_proveedor: formulario.value.id_proveedor, detalles: [] } as any);
    const proveedor = proveedorSeleccionado.value;
    const telefono = proveedor?.telefono ? proveedor.telefono.replace(/\D/g, '') : undefined;
    let mensaje = `Hola ${proveedor?.nombre || ''},\n`;
    mensaje += `Necesito realizar un pedido. Orden ID: ${created.id_compra || ''}\n`;
    mensaje += `Por favor confirmar disponibilidad y enviar factura o confirmación.`;

    if (telefono) {
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
      compraStore.successMessage = 'Orden creada y chat de WhatsApp abierto.';
    } else {
      compraStore.successMessage = 'Orden creada. No se encontró teléfono del proveedor.';
    }
    setTimeout(() => router.push('/lista-compras'), 800);
  } catch (error) {
    console.error('Error al iniciar pedido por WhatsApp:', error);
  }
};

const volverAtras = () => { router.push('/lista-compras'); };

onMounted(async () => {
  await proveedorStore.getProveedores();
  proveedoresDisponibles.value = proveedorStore.proveedores || [];
  categoriasDisponibles.value = [{ id: 1, nombre: 'General' }];
});
</script>

<style scoped>
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 22px 28px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white; border-radius: 12px 12px 0 0;
}
.header-icon {
  width: 48px; height: 48px; min-width: 48px;
  border-radius: 12px; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.header-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.8rem; margin: 0; opacity: 0.85; }

.section-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.82rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: #555; margin-bottom: 14px;
}
.section-icon {
  background: #ee6f38; color: white;
  padding: 5px 7px; border-radius: 7px; font-size: 12px;
}
.field-icon { color: #7f8c9a; font-size: 13px; margin-right: 4px; }

.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important; font-weight: 700;
}
.submit-btn:disabled { opacity: 0.45 !important; }
</style>
