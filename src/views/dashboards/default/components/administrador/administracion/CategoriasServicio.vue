<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- CARD: CREAR CATEGORÍA         -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">

      <div class="form-header">
        <div class="header-icon"><i class="fas fa-concierge-bell"></i></div>
        <div>
          <h2 class="header-title">Categorías de Servicios</h2>
          <p class="header-subtitle">Añade y gestiona las categorías de los servicios de la barbería</p>
        </div>
      </div>

      <v-card-text class="pa-6">
        <div class="section-label">
          <i class="fas fa-plus-circle section-icon"></i>
          <span>Nueva Categoría</span>
        </div>

        <v-form @submit.prevent="crearCategoria" v-model="validCrear">
          <v-row align="center">
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.nombre"
                label="Nombre de la categoría"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details="auto"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              >
                <template #prepend-inner>
                  <i class="fas fa-tag field-icon"></i>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-btn
                type="submit"
                class="submit-btn"
                :disabled="!validCrear"
                :loading="categoriaStore.loading"
                rounded="lg"
                size="large"
                block
              >
                <i class="fas fa-plus mr-2"></i> Guardar Categoría
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════ -->
    <!-- CARD: TABLA DE CATEGORÍAS     -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="xl" class="brand-card">
      <div class="table-header">
        <div class="table-title">
          <i class="fas fa-list mr-2"></i> Lista de Categorías
          <v-chip class="ml-3" size="small" color="#ee6f38" variant="flat" text-color="white">
            {{ categoriaStore.categoriasServicio.length }}
          </v-chip>
        </div>
        <button type="button" class="refresh-btn" @click="recargar" :disabled="categoriaStore.loading">
          <i :class="categoriaStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
        </button>
      </div>

      <v-card-text class="pa-4">
        <v-progress-linear v-if="categoriaStore.loading" indeterminate color="#ee6f38" rounded />

        <v-alert v-if="categoriaStore.error" type="error" rounded="lg" class="mb-4" variant="tonal">
          {{ categoriaStore.error }}
        </v-alert>

        <div v-if="!categoriaStore.loading && categoriaStore.categoriasServicio.length === 0" class="empty-state">
          <i class="fas fa-concierge-bell"></i>
          <p>No hay categorías registradas aún</p>
        </div>

        <div v-else class="cat-table-wrapper">
          <table class="cat-table">
            <thead>
              <tr>
                <th class="th-name">Nombre</th>
                <th class="th-id">ID</th>
                <th class="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categoriaStore.categoriasServicio" :key="cat.id" class="cat-row">
                <td><span class="cat-name">{{ cat.nombre }}</span></td>
                <td><span class="cat-id">#{{ cat.id }}</span></td>
                <td class="actions-cell">
                  <button type="button" class="action-btn edit-btn" @click="editar(cat)" title="Editar">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button type="button" class="action-btn delete-btn" @click="confirmarEliminar(cat)" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: EDITAR                -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEditar" persistent max-width="460">
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-pen mr-2"></i> Editar Categoría
        </div>
        <v-card-text class="pa-5">
          <v-form @submit.prevent="guardarEdicion" v-model="validEditar">
            <v-text-field
              v-model="formEditar.nombre"
              label="Nombre"
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
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEditar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn class="submit-btn flex-grow-1" rounded="lg" @click="guardarEdicion" :disabled="!validEditar" :loading="categoriaStore.loading">
            <i class="fas fa-save mr-1"></i> Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: ELIMINAR              -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEliminar" persistent max-width="400">
      <v-card rounded="xl" elevation="8">
        <div class="dialog-header danger">
          <i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación
        </div>
        <v-card-text class="pa-5 text-body-1">
          ¿Deseas eliminar la categoría <strong>{{ categoriaAEliminar?.nombre }}</strong>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEliminar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="eliminarCategoria" :loading="categoriaStore.loading" class="flex-grow-1">
            <i class="fas fa-trash-alt mr-1"></i> Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top right" rounded="lg">
      <i :class="snackbarColor === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-2"></i>
      {{ snackbarMessage }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriaServicioStore } from '@/stores/CategoriaServicio'

defineOptions({ name: 'CategoriasServicio' })

const categoriaStore = useCategoriaServicioStore()
const form = ref({ nombre: '' })
const validCrear = ref(false)
const dialogEditar = ref(false)
const dialogEliminar = ref(false)
const validEditar = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const categoriaAEliminar = ref(null)
const formEditar = ref({ id: null, nombre: '' })

onMounted(async () => { await recargar() })

const recargar = async () => { await categoriaStore.getCategoriasServicio() }

const crearCategoria = async () => {
  if (!validCrear.value) return
  try {
    await categoriaStore.createCategoriaServicio(form.value)
    snackbarMessage.value = 'Categoría creada exitosamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    form.value.nombre = ''
  } catch {
    snackbarMessage.value = categoriaStore.error || 'Error al crear categoría'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const editar = (cat) => { formEditar.value = { ...cat }; dialogEditar.value = true }

const guardarEdicion = async () => {
  if (!validEditar.value) return
  try {
    await categoriaStore.updateCategoriaServicio(formEditar.value.id, { nombre: formEditar.value.nombre })
    snackbarMessage.value = 'Categoría actualizada'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEditar.value = false
  } catch {
    snackbarMessage.value = categoriaStore.error || 'Error al actualizar'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const confirmarEliminar = (cat) => { categoriaAEliminar.value = cat; dialogEliminar.value = true }

const eliminarCategoria = async () => {
  try {
    await categoriaStore.deleteCategoriaServicio(categoriaAEliminar.value.id)
    snackbarMessage.value = 'Categoría eliminada'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    categoriaAEliminar.value = null
  } catch {
    snackbarMessage.value = categoriaStore.error || 'Error al eliminar'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<style scoped>
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 22px 28px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white; border-radius: 12px 12px 0 0;
}
.header-icon {
  width: 48px; height: 48px; min-width: 48px; border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.header-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 2px; }
.header-subtitle { font-size: 0.8rem; margin: 0; opacity: 0.85; }

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
.field-icon { color: #7f8c9a; font-size: 13px; margin-right: 4px; }

.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important; font-weight: 700;
}
.submit-btn:disabled { opacity: 0.45 !important; }

.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px 0;
}
.table-title { font-size: 1rem; font-weight: 700; color: #333; display: flex; align-items: center; }
.refresh-btn {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid #e0e0e0; background: #f8f8f8; color: #ee6f38;
  cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.refresh-btn:hover { background: #fff3ee; }

.empty-state { text-align: center; padding: 36px 20px; color: #aaa; }
.empty-state i { font-size: 2.2rem; margin-bottom: 10px; display: block; opacity: 0.4; color: #ee6f38; }
.empty-state p { margin: 0; font-size: 0.9rem; }

.cat-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #f0f0f0; }
.cat-table { width: 100%; border-collapse: collapse; }
.cat-table thead tr { background: #fff8f5; }
.cat-table th {
  padding: 12px 16px; font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px; color: #ee6f38;
  border-bottom: 2px solid #fde8d8;
}
.th-name { text-align: left; }
.th-id { text-align: center; width: 80px; }
.th-actions { text-align: center; width: 110px; }
.cat-row { transition: background 0.15s; }
.cat-row:hover { background: #fff8f5; }
.cat-row td { padding: 13px 16px; border-bottom: 1px solid #f5f5f5; }
.cat-name { font-weight: 500; color: #333; }
.cat-id { font-size: 0.8rem; color: #aaa; font-weight: 600; }
.actions-cell { text-align: center; }

.action-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; transition: all 0.18s; margin: 0 3px;
}
.edit-btn { background: #fff3e0; color: #ee6f38; }
.edit-btn:hover { background: #ee6f38; color: white; }
.delete-btn { background: #ffeaea; color: #e53935; }
.delete-btn:hover { background: #e53935; color: white; }

.dialog-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #ee6f38, #d45a22);
  color: white; font-weight: 700; font-size: 1rem;
  border-radius: 12px 12px 0 0;
}
.dialog-header.danger { background: linear-gradient(135deg, #e53935, #b71c1c); }
.gap-2 { gap: 8px; }
</style>
