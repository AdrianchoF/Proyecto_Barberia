<template>
  <v-card class="crear-servicio-card" elevation="2" rounded="lg">

    <!-- Header con gradiente naranja -->
    <div class="form-header">
      <div class="header-icon">
        <i class="fas fa-concierge-bell"></i>
      </div>
      <div>
        <h2 class="header-title">Nuevo Servicio</h2>
        <p class="header-subtitle">Registra un nuevo servicio disponible en la barbería</p>
      </div>
    </div>

    <v-card-text class="pa-6">
      <v-form @submit.prevent="crearServicio" v-model="valid">

        <!-- SECCIÓN: DATOS DEL SERVICIO -->
        <div class="section-label">
          <i class="fas fa-clipboard-list section-icon"></i>
          <span>Datos del Servicio</span>
        </div>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.nombre"
              label="Nombre del servicio"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-tag field-icon"></i>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="form.categoriaId"
              :items="categorias"
              item-title="nombre"
              item-value="id"
              label="Categoría"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :loading="loading"
              :rules="[v => !!v || 'La categoría es requerida']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-layer-group field-icon"></i>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.precio"
              label="Precio"
              type="number"
              prefix="$"
              step="0.01"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => v > 0 || 'El precio debe ser mayor que 0']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-dollar-sign field-icon"></i>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.duracion"
              label="Duración"
              placeholder="00:30"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hint="Formato HH:MM · Ej: 00:30 = 30 min, 01:00 = 1 hora"
              persistent-hint
              :rules="[v => /^\d{2}:\d{2}$/.test(v) || 'Formato HH:MM requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-hourglass-half field-icon"></i>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.descripcion"
              label="Descripción del servicio"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              auto-grow
              rows="3"
              :rules="[v => !!v || 'La descripción es requerida']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-align-left field-icon mt-1"></i>
              </template>
            </v-textarea>
          </v-col>
        </v-row>

        <!-- BOTÓN SUBMIT -->
        <v-divider class="my-4" />
        <v-btn
          type="submit"
          class="submit-btn"
          :disabled="!valid"
          :loading="loading"
          size="large"
          rounded="lg"
          block
        >
          <i class="fas fa-check-circle mr-2"></i>
          Guardar Servicio
        </v-btn>

      </v-form>
    </v-card-text>
  </v-card>

  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top right" rounded="lg">
    <i :class="snackbarColor === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-2"></i>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useServiceStore } from '@/stores/services'
  import { useCategoriaServicioStore } from '@/stores/CategoriaServicio'

  const form = ref({
    nombre: '',
    descripcion: '',
    precio: null,
    duracion: '',
    categoriaId: null
  })

  const valid = ref(false)
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')
  const loading = ref(false)
  const categorias = ref([])

  const serviceStore = useServiceStore()
  const categoriaServicioStore = useCategoriaServicioStore()

  const getCategorias = async () => {
    loading.value = true
    try {
      const data = await categoriaServicioStore.getCategoriasServicio()
      categorias.value = data
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => { getCategorias() })

  const crearServicio = async () => {
    loading.value = true
    if (!valid.value) { loading.value = false; return }

    // Añadir segundos si faltan
    let duracionFinal = form.value.duracion
    if (/^\d{2}:\d{2}$/.test(duracionFinal)) {
      duracionFinal = duracionFinal + ':00'
    }

    try {
      await serviceStore.createService({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        precio: parseFloat(form.value.precio),
        duracionAprox: duracionFinal,
        categoriaId: form.value.categoriaId
      })

      form.value = { nombre: '', descripcion: '', precio: null, duracion: '', categoriaId: null }
      snackbarMessage.value = 'Servicio creado exitosamente'
      snackbarColor.value = 'success'
      snackbar.value = true
    } catch (error) {
      console.error('Error al crear servicio:', error)
      snackbarMessage.value = error?.message || 'Error al crear el servicio'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.crear-servicio-card {
  max-width: 860px;
  margin: auto;
  overflow: hidden;
}

/* ── Header ── */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
  backdrop-filter: blur(6px);
}

.header-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 2px;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 0.82rem;
  margin: 0;
  opacity: 0.85;
}

/* ── Section label ── */
.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #555;
  margin-bottom: 18px;
}

.section-icon {
  background: #ee6f38;
  color: white;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 13px;
}

/* ── Fields ── */
.field-icon {
  color: #7f8c9a;
  font-size: 13px;
  margin-right: 4px;
}

/* ── Submit button ── */
.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 1rem;
}
.submit-btn:disabled {
  opacity: 0.45 !important;
}

@media (max-width: 600px) {
  .form-header { flex-direction: column; text-align: center; }
}
</style>