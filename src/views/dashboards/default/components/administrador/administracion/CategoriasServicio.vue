<template>
  <v-container fluid class="py-6">
    <h1 class="text-h4 mb-6">Categorias de Servicios</h1>

    <v-card class="mb-6 pa-6">
      <v-card-title class="text-h6 mb-4">Crear nueva categoría</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="crearCategoria" v-model="validCrear">
          <v-row>
            <v-col cols="12" sm="8">
              <v-text-field
                label="Nombre de la categoría"
                v-model="form.nombre"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              />
            </v-col>
            <v-col cols="12" sm="4" class="d-flex align-center">
              <v-btn color="primary" type="submit" :disabled="!validCrear" :loading="categoriaStore.loading">
                <i class="fas fa-plus me-2"></i>
                Guardar categoría
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center text-h6 mb-4">
        Lista de categorías
        <v-btn size="small" color="primary" @click="recargar" :loading="categoriaStore.loading" icon>
          <i class="fas fa-sync"></i>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-linear v-if="categoriaStore.loading" indeterminate color="primary" />

        <v-alert v-if="categoriaStore.error" type="error" class="mb-4">{{ categoriaStore.error }}</v-alert>

        <v-alert v-if="!categoriaStore.loading && categoriaStore.categoriasServicio.length === 0" type="info" class="mb-4">
          No hay categorías disponibles
        </v-alert>

        <v-table v-if="categoriaStore.categoriasServicio.length > 0" class="elevation-1">
          <thead>
            <tr>
              <th class="text-left">Nombre</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categoriaStore.categoriasServicio" :key="cat.id">
              <td>{{ cat.nombre }}</td>
              <td class="text-center">
                <v-btn size="small" color="warning" variant="text" @click="editar(cat)" icon title="Editar">
                  <i class="fas fa-edit"></i>
                </v-btn>
                <v-btn size="small" color="error" variant="text" @click="confirmarEliminar(cat)" icon title="Eliminar">
                  <i class="fas fa-trash"></i>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialogEditar" persistent max-width="500">
      <v-card>
        <v-card-title>Editar categoría</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarEdicion" v-model="validEditar">
            <v-text-field label="Nombre" v-model="formEditar.nombre" :rules="[v => !!v || 'El nombre es requerido']" required />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialogEditar = false">Cancelar</v-btn>
          <v-btn color="primary" variant="text" @click="guardarEdicion" :disabled="!validEditar" :loading="categoriaStore.loading">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEliminar" persistent max-width="400">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>¿Desea eliminar la categoría <strong>{{ categoriaAEliminar?.nombre }}</strong>?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialogEliminar = false">Cancelar</v-btn>
          <v-btn color="error" variant="text" @click="eliminarCategoria" :loading="categoriaStore.loading">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">{{ snackbarMessage }}</v-snackbar>
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
const snackbarColor = ref('green')
const categoriaAEliminar = ref(null)
const formEditar = ref({ id: null, nombre: '' })

onMounted(async () => {
  await recargar()
})

const recargar = async () => {
  await categoriaStore.getCategoriasServicio()
}

const crearCategoria = async () => {
  if (!validCrear.value) return
  try {
    const res = await categoriaStore.createCategoriaServicio(form.value)
    if (res) {
      snackbarMessage.value = 'Categoría creada'
      snackbarColor.value = 'green'
      snackbar.value = true
      form.value.nombre = ''
    }
  } catch (e) {
    snackbarMessage.value = categoriaStore.error || 'Error al crear categoría'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const editar = (cat) => {
  formEditar.value = { ...cat }
  dialogEditar.value = true
}

const guardarEdicion = async () => {
  if (!validEditar.value) return
  try {
    await categoriaStore.updateCategoriaServicio(formEditar.value.id, { nombre: formEditar.value.nombre })
    snackbarMessage.value = 'Categoría actualizada'
    snackbarColor.value = 'green'
    snackbar.value = true
    dialogEditar.value = false
  } catch (e) {
    snackbarMessage.value = categoriaStore.error || 'Error al actualizar'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const confirmarEliminar = (cat) => {
  categoriaAEliminar.value = cat
  dialogEliminar.value = true
}

const eliminarCategoria = async () => {
  try {
    await categoriaStore.deleteCategoriaServicio(categoriaAEliminar.value.id)
    snackbarMessage.value = 'Categoría eliminada'
    snackbarColor.value = 'green'
    snackbar.value = true
    dialogEliminar.value = false
    categoriaAEliminar.value = null
  } catch (e) {
    snackbarMessage.value = categoriaStore.error || 'Error al eliminar'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>
