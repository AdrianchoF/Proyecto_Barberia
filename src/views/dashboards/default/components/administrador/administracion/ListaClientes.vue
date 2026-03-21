<template>
  <v-container fluid class="py-6">
    <!-- ══════════════════════════════ -->
    <!-- CARD: HEADER                  -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-user-friends"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Base de Datos de Clientes</h2>
          <p class="header-subtitle">Gestiona la información y contacto de tus clientes registrados</p>
        </div>
        <div class="text-right">
           <v-chip color="white" variant="flat" class="text-primary font-weight-bold" v-if="!clientStore.loading">
              {{ filteredClients.length }} Clientes
           </v-chip>
        </div>
      </div>
    </v-card>

    <v-progress-linear v-if="clientStore.loading" color="#ee6f38" indeterminate rounded class="mb-4" />

    <v-alert v-if="clientStore.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      <i class="fas fa-exclamation-circle mr-2"></i> {{ clientStore.error }}
    </v-alert>

    <!-- ══════════════════════════════ -->
    <!-- TABLA DE CLIENTES             -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="lg" v-if="!clientStore.loading">
      <div class="table-header py-4 px-6 d-flex align-center gap-4">
        <div class="table-title flex-grow-1">
          <i class="fas fa-list mr-2"></i> Directorio de Clientes
        </div>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por nombre o email..."
          variant="outlined"
          rounded="lg"
          hide-details
          density="compact"
          class="search-field"
          color="#ee6f38"
        ></v-text-field>
      </div>

      <v-card-text class="pa-4">
        <div v-if="filteredClients.length === 0" class="empty-state">
          <i class="fas fa-user-slash"></i>
          <p>No se encontraron clientes disponibles</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="brand-table">
            <thead>
              <tr>
                <th class="th-center" style="width: 60px">Foto</th>
                <th class="th-left">Nombre Completo</th>
                <th class="th-left th-hide-sm">Email de Contacto</th>
                <th class="th-center">Teléfono</th>
                <th class="th-center" style="width: 120px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in filteredClients" :key="cliente.id" class="brand-row">
                
                <!-- Foto -->
                <td class="td-center">
                  <v-avatar size="40" color="grey-lighten-3">
                    <v-img :src="cliente.foto || 'https://via.placeholder.com/100?text=User'" cover></v-img>
                  </v-avatar>
                </td>

                <!-- Nombre -->
                <td>
                  <div class="client-name">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                  <div class="text-caption text-grey">ID: #{{ cliente.id }}</div>
                </td>

                <!-- Email -->
                <td class="th-hide-sm">
                  <div class="client-email">
                    <i class="far fa-envelope mr-1 text-muted"></i>
                    {{ cliente.email }}
                  </div>
                </td>

                <!-- Teléfono -->
                <td class="td-center">
                  <span class="phone-pill">
                    <i class="fas fa-phone-alt mr-1"></i>
                    {{ cliente.telefono || '---' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="td-center">
                   <div class="d-flex justify-center gap-2">
                    <v-btn icon variant="text" size="small" color="primary" @click="editClient(cliente)">
                      <i class="fas fa-pen"></i>
                    </v-btn>
                    <v-btn icon variant="text" size="small" color="error" @click="deleteClient(cliente)">
                      <i class="fas fa-trash-alt"></i>
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: EDITAR CLIENTE         -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEdit" max-width="600" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header">
          <div class="d-flex align-center">
            <div class="dialog-icon"><i class="fas fa-user-edit text-orange"></i></div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0">Editar Cliente</h3>
              <p class="text-caption mb-0 text-white opacity-80">Actualiza los datos del cliente</p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogEdit = false"></v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.nombre"
                label="Nombre"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.apellido"
                label="Apellido"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editForm.email"
                label="Email"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-email-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editForm.telefono"
                label="Teléfono"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-phone-outline"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogEdit = false">Cancelar</v-btn>
          <v-btn color="#ee6f38" variant="flat" rounded="lg" class="px-6 text-white" :loading="isSaving" @click="saveClientEdit">
            Actualizar Cliente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: CONFIRMAR ELIMINACIÓN  -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogDelete" max-width="400" rounded="xl">
      <v-card class="text-center pa-6">
        <div class="mb-4">
          <v-avatar color="error" variant="tonal" size="70">
            <i class="fas fa-trash-alt fa-2x"></i>
          </v-avatar>
        </div>
        <h3 class="text-h5 font-weight-bold mb-2">¿Eliminar Cliente?</h3>
        <p class="text-body-2 text-grey-darken-1 mb-6">
          Estás a punto de eliminar a <strong class="text-black">{{ selectedClient?.nombre }}</strong>. <br>
          Esta acción no se puede deshacer.
        </p>
        <div class="d-flex gap-3 justify-center">
          <v-btn variant="tonal" color="grey" rounded="xl" @click="dialogDelete = false" class="px-6">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="flat" rounded="xl" @click="handleDelete" :loading="isDeleting" class="px-6">
            Confirmar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/client'

const clientStore = useClientStore()
const search = ref('')
const dialogDelete = ref(false)
const dialogEdit = ref(false)
const selectedClient = ref(null)
const isDeleting = ref(false)
const isSaving = ref(false)

const editForm = ref({
  id: null,
  nombre: '',
  apellido: '',
  email: '',
  telefono: ''
})

const filteredClients = computed(() => {
  if (!search.value) return clientStore.clients
  const q = search.value.toLowerCase()
  return clientStore.clients.filter(c => 
    c.nombre.toLowerCase().includes(q) || 
    c.apellido.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q)
  )
})

const editClient = (cliente) => {
  selectedClient.value = cliente
  editForm.value = { ...cliente }
  dialogEdit.value = true
}

const saveClientEdit = async () => {
  if (!editForm.value.id) return
  isSaving.value = true
  try {
    const payload = { ...editForm.value }
    delete payload.id
    await clientStore.updateClient(editForm.value.id, payload)
    dialogEdit.value = false
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteClient = (cliente) => {
  selectedClient.value = cliente
  dialogDelete.value = true
}

const handleDelete = async () => {
  if (!selectedClient.value) return
  isDeleting.value = true
  try {
    await clientStore.deleteClient(selectedClient.value.id)
    dialogDelete.value = false
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  clientStore.getClients()
})
</script>

<style scoped>
/* ── Header Principal ── */
.brand-card { border: none; overflow: hidden; }
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  color: white;
}
.header-icon {
  width: 52px; height: 52px; min-width: 52px;
  border-radius: 14px; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.header-title { font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.header-subtitle { font-size: 0.9rem; margin: 2px 0 0; opacity: 0.9; }

/* ── Table Styling ── */
.table-header { border-bottom: 1px solid #f0f0f0; }
.table-title { font-size: 1.1rem; font-weight: 700; color: #333; display: flex; align-items: center; }
.search-field { max-width: 300px; }

.table-wrapper { overflow-x: auto; }
.brand-table { width: 100%; border-collapse: collapse; }
.brand-table th {
  padding: 16px; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; color: #999; letter-spacing: 1px;
  border-bottom: 2px solid #f5f5f5; text-align: left;
}
.brand-table td { padding: 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.th-center, .td-center { text-align: center !important; }
.th-right, .td-right { text-align: right !important; }

.brand-row { transition: background 0.2s; }
.brand-row:hover { background: #fffcfb; }

.client-name { font-weight: 700; color: #333; font-size: 0.95rem; }
.client-email { font-size: 0.85rem; color: #666; }

.phone-pill {
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  border: 1px solid #eee;
}

/* ── Empty State ── */
.empty-state {
  text-align: center; padding: 60px 20px;
}
.empty-state i { font-size: 3.5rem; color: #fde8d8; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 1rem; color: #777; font-weight: 500; }

@media (max-width: 768px) {
  .th-hide-sm { display: none; }
  .form-header { flex-direction: column; text-align: center; }
  .search-field { max-width: 100%; margin-top: 12px; }
  .table-header { flex-direction: column; align-items: stretch; }
}
</style>