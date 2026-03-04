<template>
  <v-container fluid class="py-6 d-flex justify-center">

    <!-- ══════════════════════════════ -->
    <!-- CARD: CREAR PRODUCTO          -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="4" rounded="xl" style="width: 100%; max-width: 800px;">

      <div class="form-header">
        <div class="header-icon"><i class="fas fa-box"></i></div>
        <div>
          <h2 class="header-title">Crear Producto</h2>
          <p class="header-subtitle">Añade un nuevo producto al inventario de la barbería</p>
        </div>
      </div>

      <v-card-text class="pa-6">
        <v-form @submit.prevent="crearProducto" v-model="valid" ref="formRef">
          
          <div class="section-label mt-2">
            <i class="fas fa-info-circle section-icon"></i>
            <span>Información básica</span>
          </div>

          <v-row class="mt-1">
             <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.codigo"
                label="Código (opcional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
              >
                <template #prepend-inner><i class="fas fa-barcode field-icon"></i></template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.nombre"
                label="Nombre del producto *"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              >
                <template #prepend-inner><i class="fas fa-font field-icon"></i></template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.descripcion"
            label="Descripción del producto *"
            variant="outlined"
            rounded="lg"
            rows="3"
            density="comfortable"
            :rules="[v => !!v || 'La descripción es requerida']"
            required
            class="mb-2"
          />

          <v-divider class="my-4" />

          <div class="section-label">
            <i class="fas fa-tags section-icon"></i>
            <span>Detalles y Precio</span>
          </div>

          <v-row class="mt-1">
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.categoriaId"
                :items="categorias"
                item-title="nombre"
                item-value="id"
                label="Categoría *"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :loading="loading"
                :rules="[v => !!v || 'La categoría es requerida']"
                required
              >
                <template #prepend-inner><i class="fas fa-layer-group field-icon"></i></template>
              </v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <!-- Cambiado a subir archivo o URL para que esté completo, basado en el nuevo publicador -->
               <v-text-field
                v-model="form.imagenUrl"
                label="URL de la imagen *"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'La imagen es requerida']"
                required
              >
                <template #prepend-inner><i class="fas fa-image field-icon"></i></template>
              </v-text-field>
            </v-col>
            
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.precio"
                label="Precio de compra *"
                type="number"
                prefix="$"
                step="0.01"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[
                  v => !!v || 'El precio es requerido',
                  v => (v && !isNaN(parseFloat(v))) || 'El precio debe ser un número',
                  v => v > 0 || 'El precio debe ser mayor a 0'
                ]"
                required
              >
                <template #prepend-inner><i class="fas fa-dollar-sign field-icon"></i></template>
              </v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.stock"
                label="Stock inicial *"
                type="number"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[
                  v => v !== '' && v !== null || 'El stock es requerido',
                  v => (Number.isInteger(Number(v))) || 'Debe ser un número entero',
                  v => v >= 0 || 'El stock no puede ser negativo'
                ]"
                required
              >
                <template #prepend-inner><i class="fas fa-cubes field-icon"></i></template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-btn
            type="submit"
            class="submit-btn mt-2"
            :disabled="!valid"
            :loading="productoStore.loading"
            rounded="lg"
            size="large"
            block
          >
            <i class="fas fa-save mr-2"></i> Guardar Producto
          </v-btn>

        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top right" rounded="lg">
      <i :class="snackbarColor === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-2"></i>
      {{ snackbarMessage }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaProductoStore } from '@/stores/CategoriaProducto'

defineOptions({ name: 'CrearProducto' })

const productoStore = useProductoStore()
const categoriaProductoStore = useCategoriaProductoStore()

const formRef = ref(null)
const form = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagenUrl: '',
  categoriaId: null
})

const valid = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const loading = ref(false)
const categorias = ref([])

const getCategorias = async () => {
  loading.value = true
  try {
    const data = await categoriaProductoStore.getCategoriasProducto()
    categorias.value = data
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getCategorias()
})

const crearProducto = async () => {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  const payload = {
    codigo: form.value.codigo?.trim() || undefined,
    nombre: form.value.nombre.trim(),
    descripcion: form.value.descripcion.trim(),
    precio: Number(form.value.precio),
    stock: Number(form.value.stock),
    imagenUrl: form.value.imagenUrl.trim(),
    categoriaId: Number(form.value.categoriaId)
  }

  try {
    const response = await productoStore.createProducto(payload)
    if (response) {
      snackbarMessage.value = 'Producto creado exitosamente'
      snackbarColor.value = 'success'
      snackbar.value = true
      
      formRef.value.reset()
      form.value.codigo = ''
      form.value.imagenUrl = ''
    }
  } catch (error) {
    console.error('Error al crear producto:', error)
    snackbarMessage.value = 'Error al crear el producto'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<style scoped>
/* ── Header ── */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}
.header-icon {
  width: 52px; height: 52px; min-width: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.header-title { font-size: 1.4rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.85rem; margin: 0; opacity: 0.85; }

/* ── Section label ── */
.section-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.82rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: #555; margin-bottom: 16px;
}
.section-icon {
  background: #ee6f38; color: white;
  padding: 5px 7px; border-radius: 7px; font-size: 12px;
}
.field-icon { color: #7f8c9a; font-size: 14px; margin-right: 4px; }

/* ── Submit ── */
.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.5px;
}
.submit-btn:disabled { opacity: 0.45 !important; }

@media (max-width: 600px) {
  .form-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }
}
</style>