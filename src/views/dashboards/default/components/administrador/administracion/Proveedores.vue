<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- CARD: CREAR PROVEEDOR         -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="lg">

      <div class="form-header">
        <div class="header-icon"><i class="fas fa-truck"></i></div>
        <div>
          <h2 class="header-title">Gestionar Proveedores</h2>
          <p class="header-subtitle">Registra y administra los proveedores de la barbería</p>
        </div>
      </div>

      <v-card-text class="pa-6">
        <div class="section-label">
          <i class="fas fa-plus-circle section-icon"></i>
          <span>Nuevo Proveedor</span>
        </div>

        <v-form @submit.prevent="crearProveedor" v-model="validCrear">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.nombre"
                label="Nombre del proveedor"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              >
                <template #prepend-inner>
                  <i class="fas fa-building field-icon"></i>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.telefono"
                label="Teléfono"
                type="tel"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'El teléfono es requerido']"
                required
              >
                <template #prepend-inner>
                  <i class="fas fa-phone field-icon"></i>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                required
              >
                <template #prepend-inner>
                  <i class="fas fa-envelope field-icon"></i>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.direccion"
                label="Dirección"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[v => !!v || 'La dirección es requerida']"
                required
              >
                <template #prepend-inner>
                  <i class="fas fa-map-marker-alt field-icon"></i>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12">
              <v-btn
                type="submit"
                class="submit-btn"
                :disabled="!validCrear"
                :loading="proveedorStore.loading"
                rounded="lg"
                size="large"
              >
                <i class="fas fa-plus mr-2"></i> Guardar Proveedor
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════ -->
    <!-- CARD: TABLA DE PROVEEDORES    -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="lg" class="brand-card">
      <div class="table-header">
        <div class="table-title">
          <i class="fas fa-list mr-2"></i> Lista de Proveedores
          <v-chip class="ml-3" size="small" color="#ee6f38" variant="flat" text-color="white">
            {{ proveedorStore.proveedores.length }}
          </v-chip>
        </div>
        <button type="button" class="refresh-btn" @click="recargarProveedores" :disabled="proveedorStore.loading">
          <i :class="proveedorStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
        </button>
      </div>

      <v-card-text class="pa-4">
        <v-progress-linear v-if="proveedorStore.loading" indeterminate color="#ee6f38" rounded />

        <v-alert v-if="proveedorStore.error" type="error" rounded="lg" class="mb-4" variant="tonal">
          {{ proveedorStore.error }}
        </v-alert>

        <div v-if="!proveedorStore.loading && proveedorStore.proveedores.length === 0" class="empty-state">
          <i class="fas fa-truck"></i>
          <p>No hay proveedores registrados aún</p>
        </div>

        <div v-else class="prov-table-wrapper">
          <table class="prov-table">
            <thead>
              <tr>
                <th class="th-left">Nombre</th>
                <th class="th-left th-hide-sm">Dirección</th>
                <th class="th-left">Teléfono</th>
                <th class="th-left th-hide-sm">Email</th>
                <th class="th-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="proveedor in proveedorStore.proveedores" :key="proveedor.id" class="prov-row">
                <td>
                  <div class="prov-name">{{ proveedor.nombre }}</div>
                  <div class="prov-id">#{{ proveedor.id }}</div>
                </td>
                <td class="th-hide-sm">{{ proveedor.direccion }}</td>
                <td>
                  <span class="info-pill phone-pill">
                    <i class="fas fa-phone"></i> {{ proveedor.telefono }}
                  </span>
                </td>
                <td class="th-hide-sm">
                  <span class="info-pill email-pill">
                    <i class="fas fa-envelope"></i> {{ proveedor.email }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button type="button" class="action-btn edit-btn" @click="editarProveedor(proveedor)" title="Editar">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button type="button" class="action-btn delete-btn" @click="confirmarEliminar(proveedor)" title="Eliminar">
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
    <v-dialog v-model="dialogEditar" persistent max-width="520">
      <v-card rounded="lg" elevation="8">
        <div class="dialog-header">
          <i class="fas fa-pen mr-2"></i> Editar Proveedor
        </div>
        <v-card-text class="pa-5">
          <v-form @submit.prevent="guardarEdicion" v-model="validEditar">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formEditar.nombre"
                  label="Nombre"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[v => !!v || 'Requerido']"
                  required
                >
                  <template #prepend-inner><i class="fas fa-building field-icon"></i></template>
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formEditar.telefono"
                  label="Teléfono"
                  type="tel"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[v => !!v || 'Requerido']"
                  required
                >
                  <template #prepend-inner><i class="fas fa-phone field-icon"></i></template>
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formEditar.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[v => !!v || 'Requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                  required
                >
                  <template #prepend-inner><i class="fas fa-envelope field-icon"></i></template>
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formEditar.direccion"
                  label="Dirección"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[v => !!v || 'Requerido']"
                  required
                >
                  <template #prepend-inner><i class="fas fa-map-marker-alt field-icon"></i></template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEditar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn class="submit-btn flex-grow-1" rounded="lg" @click="guardarEdicion" :disabled="!validEditar" :loading="proveedorStore.loading">
            <i class="fas fa-save mr-1"></i> Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: ELIMINAR              -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEliminar" persistent max-width="400">
      <v-card rounded="lg" elevation="8">
        <div class="dialog-header danger">
          <i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación
        </div>
        <v-card-text class="pa-5 text-body-1">
          ¿Deseas eliminar el proveedor <strong>{{ proveedorAEliminar?.nombre }}</strong>? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 gap-2">
          <v-btn variant="outlined" rounded="lg" @click="dialogEliminar = false" class="flex-grow-1">Cancelar</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="eliminarProveedor" :loading="proveedorStore.loading" class="flex-grow-1">
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
import { useProveedorStore } from '@/stores/proveedor'

defineOptions({ name: 'Proveedores' })

const proveedorStore = useProveedorStore()
const form = ref({ nombre: '', direccion: '', telefono: '', email: '' })
const validCrear = ref(false)
const dialogEditar = ref(false)
const dialogEliminar = ref(false)
const validEditar = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const proveedorAEliminar = ref(null)
const formEditar = ref({ id: null, nombre: '', direccion: '', telefono: '', email: '' })

onMounted(async () => { await recargarProveedores() })

const recargarProveedores = async () => { await proveedorStore.getProveedores() }

const crearProveedor = async () => {
  if (!validCrear.value) return
  try {
    await proveedorStore.createProveedor(form.value)
    snackbarMessage.value = 'Proveedor creado exitosamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    form.value = { nombre: '', direccion: '', telefono: '', email: '' }
  } catch (error) {
    snackbarMessage.value = proveedorStore.error || 'Error al crear el proveedor'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const editarProveedor = (proveedor) => { formEditar.value = { ...proveedor }; dialogEditar.value = true }

const guardarEdicion = async () => {
  if (!validEditar.value) return
  try {
    await proveedorStore.updateProveedor(formEditar.value.id, {
      nombre: formEditar.value.nombre,
      direccion: formEditar.value.direccion,
      telefono: formEditar.value.telefono,
      email: formEditar.value.email
    })
    snackbarMessage.value = 'Proveedor actualizado exitosamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEditar.value = false
  } catch (error) {
    snackbarMessage.value = proveedorStore.error || 'Error al actualizar el proveedor'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const confirmarEliminar = (proveedor) => { proveedorAEliminar.value = proveedor; dialogEliminar.value = true }

const eliminarProveedor = async () => {
  try {
    await proveedorStore.deleteProveedor(proveedorAEliminar.value.id)
    snackbarMessage.value = 'Proveedor eliminado exitosamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    proveedorAEliminar.value = null
  } catch (error) {
    snackbarMessage.value = proveedorStore.error || 'Error al eliminar el proveedor'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<style scoped>
/* ── Header ── */
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
.field-icon { color: #7f8c9a; font-size: 13px; margin-right: 4px; }

/* ── Submit ── */
.submit-btn {
  background: linear-gradient(135deg, #ee6f38, #d45a22) !important;
  color: white !important; font-weight: 700;
}
.submit-btn:disabled { opacity: 0.45 !important; }

/* ── Table header ── */
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

/* ── Empty state ── */
.empty-state { text-align: center; padding: 36px 20px; color: #aaa; }
.empty-state i { font-size: 2.2rem; margin-bottom: 10px; display: block; opacity: 0.4; color: #ee6f38; }
.empty-state p { margin: 0; font-size: 0.9rem; }

/* ── Custom table ── */
.prov-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #f0f0f0; margin-top: 8px; }
.prov-table { width: 100%; border-collapse: collapse; }
.prov-table thead tr { background: #fff8f5; }
.prov-table th {
  padding: 12px 16px; font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px; color: #ee6f38;
  border-bottom: 2px solid #fde8d8;
}
.th-left { text-align: left; }
.th-center { text-align: center; width: 110px; }
.prov-row { transition: background 0.15s; }
.prov-row:hover { background: #fff8f5; }
.prov-row td { padding: 13px 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.prov-name { font-weight: 600; color: #333; }
.prov-id { font-size: 0.75rem; color: #bbb; margin-top: 2px; }
.text-secondary { color: #777; font-size: 0.9rem; }

/* ── Info pills ── */
.info-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.8rem; font-weight: 500;
}
.phone-pill { background: #fff3e0; color: #e65100; }
.email-pill { background: #e8f5e9; color: #2e7d32; }

/* ── Action buttons ── */
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

/* ── Dialog ── */
.dialog-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, #ee6f38, #d45a22);
  color: white; font-weight: 700; font-size: 1rem;
  border-radius: 12px 12px 0 0;
}
.dialog-header.danger { background: linear-gradient(135deg, #e53935, #b71c1c); }
.gap-2 { gap: 8px; }

@media (max-width: 600px) {
  .form-header { flex-direction: column; text-align: center; }
  .th-hide-sm { display: none; }
}
</style>
