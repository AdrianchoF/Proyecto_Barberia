<template>
  <v-dialog v-model="dialogInterno" max-width="1100" class="cart-dialog" persistent @update:modelValue="emitirCambio">
    <v-card class="cart-glass-card">
      <!-- Header -->
      <div class="cart-header pa-6 d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <div class="cart-icon-bg">
            <i class="fas fa-shopping-basket text-orange" style="color: white;"></i>
          </div>
          <div>
            <h2 class="text-h5 font-weight-bold text-white mb-0 ml-3">CARRITO DE COMPRAS</h2>
            <span class="text-caption text-grey-lighten-1 ml-3" style="color: gray;">{{ carrito.length }} productos seleccionados</span>
          </div>
        </div>
        <v-btn icon variant="text" @click="cerrarModal" class="close-btn">
          <i class="fas fa-times text-white"></i>
        </v-btn>
      </div>

      <v-divider class="border-grey-darken-4"></v-divider>

      <v-row no-gutters class="cart-body">
        <!-- Main Content -->
        <v-col cols="12" md="8" class="pa-6 border-r-dark">
          <div v-if="carrito.length > 0" class="cart-scroll-area">
            <v-data-table
              :items="carrito"
              :headers="headers"
              hide-default-footer
              class="premium-table bg-transparent"
              theme="dark"
            >
              <template #item.nombre="{ item }">
                <div class="d-flex align-center py-4 gap-4">
                  <v-avatar size="70" rounded="lg" class="product-avatar">
                    <v-img :src="item.img" cover></v-img>
                  </v-avatar>
                  <div class="product-info">
                    <div class="text-subtitle-1 font-weight-bold text-white">{{ item.nombre }}</div>
                    <div class="text-caption text-orange">REF-{{ productos.find(p => p.id === item.id)?.codigo }}</div>
                  </div>
                </div>
              </template>

              <template #item.cantidad="{ item }">
                <div class="qty-selector">
                  <v-btn icon size="x-small" variant="text" @click="carritoStore.cambiarCantidad(item.id, -1)" class="text-white">
                    <i class="fas fa-minus"></i>
                  </v-btn>
                  <span class="qty-value px-3">{{ item.cantidad }}</span>
                  <v-btn icon size="x-small" variant="text" @click="carritoStore.cambiarCantidad(item.id, 1)" class="text-white">
                    <i class="fas fa-plus"></i>
                  </v-btn>
                </div>
              </template>

              <template #item.precio="{ item }">
                <span class="text-grey-lighten-1 font-weight-medium">${{ productos.find(p => p.id === item.id)?.precio_venta.toLocaleString() }}</span>
              </template>

              <template #item.subtotal="{ item }">
                <span class="text-white font-weight-bold">${{ (productos.find(p => p.id === item.id)?.precio_venta * item.cantidad).toLocaleString() }}</span>
              </template>

              <template #item.acciones="{ item }">
                <v-btn icon variant="text" color="red-lighten-1" size="small" @click="carritoStore.eliminar(item.id)">
                  <i class="fas fa-trash-alt"></i>
                </v-btn>
              </template>
            </v-data-table>
          </div>

          <div v-else class="empty-cart-state d-flex flex-column align-center justify-center py-16">
            <div class="empty-icon-pulse mb-6">
              <i class="fas fa-shopping-cart fa-3x text-grey-lighten-1" style="color: white;"></i>
            </div>
            <h3 class="text-h5 text-white font-weight-bold mb-2">Tu carrito está vacío</h3>
            <p class="text-body-2 text-grey-lighten-2 mb-6 text-center" style="color: gray;">Parece que aún no has añadido ningún producto.</p>
            <v-btn color="orange" variant="outlined" rounded="pill" @click="cerrarModal" class="text-white">
              VER PRODUCTOS
            </v-btn>
          </div>
        </v-col>

        <!-- Order Summary -->
        <v-col cols="12" md="4" class="pa-6 summary-column">
          <div class="summary-card">
            <h3 class="text-h6 font-weight-bold text-white mb-6">RESUMEN DEL PEDIDO</h3>
            
            <div class="d-flex justify-space-between mb-4">
              <span class="text-white opacity-80">Subtotal</span>
              <span class="text-white font-weight-bold">${{ calcularTotal.toLocaleString() }}</span>
            </div>
            
            <div class="d-flex justify-space-between mb-4">
              <span class="text-white opacity-80">Envío</span>
              <span class="text-green-accent-3 font-weight-bold" style="color: white;">GRATIS</span>
            </div>

            <v-divider class="my-6 border-grey-darken-3"></v-divider>

            <div class="d-flex justify-space-between align-center mb-8">
              <span class="text-h6 text-white font-weight-bold">TOTAL</span>
              <span class="text-h5 text-orange font-weight-black" style="color: white;">${{ calcularTotal.toLocaleString() }}</span>
            </div>

            <v-btn block color="orange" size="x-large" rounded="pill" class="checkout-btn mb-4 font-weight-bold">
              FINALIZAR COMPRA
            </v-btn>

            <v-btn block variant="outlined" color="white" size="small" rounded="pill" @click="confirmarVaciar = true" class="vaciar-btn">
              <i class="fas fa-trash-alt mr-2"></i> VACIAR CARRITO
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Diálogo de Confirmación Vaciar Carrito -->
    <v-dialog v-model="confirmarVaciar" max-width="400" persistent="true">
      <v-card class="cart-glass-card pa-6 text-center">
        <div class="mb-4">
          <i class="fas fa-exclamation-triangle text-red-lighten-2 fa-3x" style="color: red;"></i>
        </div>
        <h3 class="text-h6 font-weight-bold text-white mb-2">¿VACIAR CARRITO?</h3>
        <p class="text-body-2 text-grey-lighten-1 mb-6" style="color: white;">Esta acción eliminará todos los productos del carrito. No podrás deshacerlo.</p>
        
        <div class="d-flex gap-3 justify-center">
          <v-btn variant="text" color="white" rounded="pill" @click="confirmarVaciar = false">CANCELAR</v-btn>
          <v-btn color="red-lighten-1" rounded="pill" @click="confirmarVaciarReal" class="font-weight-bold">SÍ, VACIAR</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCarritoStore } from '@/stores/carrito'
import { useProductoStore } from '@/stores/producto'

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:dialog'])

const carritoStore = useCarritoStore()
const { items: ComprasCarrito } = storeToRefs(carritoStore)
const productoStore = useProductoStore()
const { productos } = storeToRefs(productoStore)

const dialogInterno = ref(props.dialog)
const confirmarVaciar = ref(false)
const headers = [
  { title: 'PRODUCTO', value: 'nombre', sortable: false },
  { title: 'CANTIDAD', value: 'cantidad', align: 'center', sortable: false },
  { title: 'PRECIO', value: 'precio', align: 'end', sortable: false },
  { title: 'SUBTOTAL', value: 'subtotal', align: 'end', sortable: false },
  { title: '', value: 'acciones', align: 'center', sortable: false }
]

watch(() => props.dialog, (nuevoValor) => {
  dialogInterno.value = nuevoValor
})

const carrito = computed(() => ComprasCarrito.value)

const calcularTotal = computed(() => {
  return carrito.value.reduce((total, item) => total + (item.precio * item.cantidad), 0)
})

const emitirCambio = (nuevoValor) => {
  emit('update:dialog', nuevoValor)
}

const cerrarModal = () => {
  dialogInterno.value = false
  emit('update:dialog', false)
}

const vaciarCarrito = () => {
  confirmarVaciar.value = true
}

const confirmarVaciarReal = () => {
  carritoStore.vaciar()
  confirmarVaciar.value = false
}
</script>

<style scoped>
.cart-dialog :deep(.v-overlay__content) {
  border-radius: 24px !important;
  overflow: hidden;
}

.cart-glass-card {
  background: rgba(18, 18, 18, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 24px !important;
}

.cart-header {
  background: rgba(255, 255, 255, 0.02);
}

.cart-icon-bg {
  width: 50px;
  height: 50px;
  background: rgba(238, 111, 56, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.border-r-dark {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.cart-scroll-area {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

/* Scrollbar Custom */
.cart-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.cart-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(238, 111, 56, 0.3);
  border-radius: 10px;
}

/* Premium Table */
.premium-table :deep(thead th) {
  background: transparent !important;
  color: #ee6f38 !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  font-size: 11px !important;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.premium-table :deep(tbody td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
}

.product-avatar {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.qty-selector {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
}

.qty-value {
  min-width: 25px;
  text-align: center;
  color: white;
}

.vaciar-btn {
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.vaciar-btn:hover {
  background: #ff5252 !important;
  border-color: #ff5252 !important;
  color: white !important;
  opacity: 1 !important;
}

/* Summary Card */
.summary-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.checkout-btn {
  background: #ee6f38 !important;
  color: white !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 10px 20px rgba(238, 111, 56, 0.2) !important;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(238, 111, 56, 0.4) !important;
}

/* Empty State */
.empty-icon-pulse {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 111, 56, 0.1); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(238, 111, 56, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 111, 56, 0); }
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-70 {
  opacity: 0.7;
}

@media (max-width: 960px) {
  .border-r-dark {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}
</style>
