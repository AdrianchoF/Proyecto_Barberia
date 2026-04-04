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
        <v-btn class="new-item-btn ml-4" @click="dialogCreate = true" rounded="lg">
          <i class="fas fa-user-plus mr-2"></i> Nuevo Cliente
        </v-btn>
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
                <th class="th-center">Estado</th>
                <th class="th-center" style="width: 140px">Acciones</th>
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
                  <span class="client-phone">
                    {{ cliente.telefono || '---' }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="td-center">
                  <v-chip
                    :color="cliente.activo ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ cliente.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </v-chip>
                </td>

                <!-- Acciones -->
                <td class="td-center">
                   <div class="d-flex justify-center gap-1">
                    <v-btn icon variant="text" size="small" color="primary" @click="editClient(cliente)">
                      <i class="fas fa-pen"></i>
                      <v-tooltip activator="parent" location="top">Editar datos</v-tooltip>
                    </v-btn>
                    <v-btn 
                      icon 
                      variant="text" 
                      size="small" 
                      :color="cliente.activo ? 'error' : 'success'" 
                      @click="openToggleStatusDialog(cliente)"
                    >
                      <i :class="['fas', cliente.activo ? 'fa-user-slash' : 'fa-user-check']"></i>
                      <v-tooltip activator="parent" location="top">
                        {{ cliente.activo ? 'Desactivar' : 'Activar' }} cliente
                      </v-tooltip>
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
        <div class="dialog-header bg-orange-gradient">
          <div class="d-flex align-center">
            <div class="dialog-icon-box shadow-sm">
              <i class="fas fa-user-edit text-orange"></i>
            </div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0 text-white">Editar Cliente</h3>
              <p class="text-caption mb-0 text-white opacity-80">Actualiza los datos del cliente</p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogEdit = false"></v-btn>
        </div>

        <v-card-text class="pa-6 pt-8">
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
    <!-- DIALOG: CREAR CLIENTE           -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogCreate" max-width="600" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header bg-orange-gradient">
          <div class="d-flex align-center">
            <div class="dialog-icon-box shadow-sm">
              <i class="fas fa-user-plus text-orange"></i>
            </div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0 text-white">Nuevo Cliente</h3>
              <p class="text-caption mb-0 text-white opacity-80">Registra un cliente manualmente</p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogCreate = false"></v-btn>
        </div>

        <v-card-text class="pa-6 pt-8">
          <v-form ref="formCreate" v-model="isFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.nombre"
                  label="Nombre"
                  variant="outlined"
                  rounded="lg"
                  color="#ee6f38"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.apellido"
                  label="Apellido"
                  variant="outlined"
                  rounded="lg"
                  color="#ee6f38"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="createForm.email"
                  label="Email"
                  variant="outlined"
                  rounded="lg"
                  color="#ee6f38"
                  prepend-inner-icon="mdi-email-outline"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="createForm.telefono"
                  label="Teléfono"
                  variant="outlined"
                  rounded="lg"
                  color="#ee6f38"
                  prepend-inner-icon="mdi-phone-outline"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="createForm.password"
                  label="Contraseña"
                  type="text"
                  variant="outlined"
                  rounded="lg"
                  color="#ee6f38"
                  prepend-inner-icon="mdi-lock-outline"
                  hint="Se generó una por defecto, puedes cambiarla"
                  persistent-hint
                >
                  <template v-slot:append-inner>
                    <v-btn icon variant="text" size="small" @click="generatePassword">
                      <i class="fas fa-sync-alt"></i>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogCreate = false">Cancelar</v-btn>
          <v-btn 
            color="#ee6f38" 
            variant="flat" 
            rounded="lg" 
            class="px-6 text-white" 
            :loading="isSaving" 
            @click="saveNewClient"
            :disabled="!isFormValid"
          >
            Registrar Cliente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: CAMBIAR ESTADO           -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogToggleStatus" max-width="500" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div :class="['dialog-header', selectedClient?.activo ? 'bg-red-gradient' : 'bg-green-gradient']">
          <div class="d-flex align-center">
            <div class="dialog-icon-box shadow-sm">
              <i :class="['fas', selectedClient?.activo ? 'fa-user-slash text-error' : 'fa-user-check text-success']"></i>
            </div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0 text-white">
                {{ selectedClient?.activo ? 'Gestionar Penalización' : 'Reactivar Cliente' }}
              </h3>
              <p class="text-caption mb-0 text-white opacity-80">
                {{ selectedClient?.activo ? 'Aplica una restricción de acceso' : 'Habilita el acceso al sistema' }}
              </p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogToggleStatus = false"></v-btn>
        </div>

        <v-card-text class="pa-6 pt-8">
          <div v-if="selectedClient?.activo" class="penalty-form">
            <p class="text-subtitle-2 font-weight-bold mb-4 ml-1">
              <i class="fas fa-info-circle mr-2 text-primary"></i> Detalles de la Sanción
            </p>
            
            <v-textarea
              v-model="penaltyFields.motivo"
              label="Motivo de la penalización"
              placeholder="Ej: No asistió a su cita el día de ayer..."
              variant="outlined"
              rounded="lg"
              color="primary"
              rows="3"
              class="mb-4"
              prepend-inner-icon="mdi-text-box-outline"
            ></v-textarea>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="penaltyFields.duracion"
                  label="Duración"
                  type="number"
                  min="1"
                  variant="outlined"
                  rounded="lg"
                  color="primary"
                  prepend-inner-icon="mdi-clock-outline"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="penaltyFields.unidad"
                  :items="[
                    { title: 'Horas', value: 'hours' },
                    { title: 'Días', value: 'days' },
                    { title: 'Semanas', value: 'weeks' },
                    { title: 'Meses', value: 'months' },
                    { title: 'Permanente', value: 'permanent' }
                  ]"
                  label="Unidad"
                  variant="outlined"
                  rounded="lg"
                  color="primary"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-alert
              v-if="calculatedPenaltyDate"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2 text-caption"
              rounded="lg"
            >
              <i class="fas fa-calendar-check mr-2"></i>
              El acceso se reactivará el: <strong>{{ calculatedPenaltyDate }}</strong>
            </v-alert>
          </div>

          <div v-else class="text-center py-4">
            <p class="text-body-1">
              Estás a punto de reactivar a <strong class="text-primary">{{ selectedClient?.nombre }}</strong>.
              Podrá volver a reservar citas inmediatamente.
            </p>
          </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogToggleStatus = false">Cancelar</v-btn>
          <v-btn 
            :color="selectedClient?.activo ? 'error' : 'success'" 
            variant="flat" 
            rounded="lg" 
            class="px-6 text-white" 
            :loading="isStatusLoading"
            @click="handleToggleStatus"
            :disabled="selectedClient?.activo && (!penaltyFields.motivo || (!penaltyFields.duracion && penaltyFields.unidad !== 'permanent'))"
          >
            Confirmar {{ selectedClient?.activo ? 'Sanción' : 'Reactivación' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '@/stores/client'

const clientStore = useClientStore()
const search = ref('')
const dialogToggleStatus = ref(false)
const dialogEdit = ref(false)
const dialogCreate = ref(false)
const isFormValid = ref(true)
const selectedClient = ref(null)
const isStatusLoading = ref(false)
const isSaving = ref(false)

const penaltyFields = ref({
  motivo: '',
  duracion: 1,
  unidad: 'days'
})

const createForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: ''
})

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

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let pass = ''
  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
  createForm.value.password = pass
}

// Al abrir el diálogo de creación, generar contraseña
import { watch } from 'vue'
watch(dialogCreate, (val) => {
  if (val) {
    createForm.value = { nombre: '', apellido: '', email: '', telefono: '', password: '' }
    generatePassword()
  }
})

const saveNewClient = async () => {
  isSaving.value = true
  try {
    await clientStore.createClient(createForm.value)
    dialogCreate.value = false
  } catch (error) {
    console.error('Error al crear cliente:', error)
  } finally {
    isSaving.value = false
  }
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

const openToggleStatusDialog = (cliente) => {
  selectedClient.value = cliente
  penaltyFields.value = { motivo: '', duracion: 1, unidad: 'days' }
  dialogToggleStatus.value = true
}

const calculatedPenaltyDate = computed(() => {
  if (!selectedClient.value?.activo || penaltyFields.value.unidad === 'permanent') return null
  const now = new Date()
  const val = penaltyFields.value.duracion || 0
  switch (penaltyFields.value.unidad) {
    case 'hours': now.setHours(now.getHours() + val); break
    case 'days': now.setDate(now.getDate() + val); break
    case 'weeks': now.setDate(now.getDate() + (val * 7)); break
    case 'months': now.setMonth(now.getMonth() + val); break
  }
  return now.toLocaleString()
})

const handleToggleStatus = async () => {
  if (!selectedClient.value) return
  isStatusLoading.value = true
  try {
    const newStatus = !selectedClient.value.activo
    const payload = { activo: newStatus }
    
    if (newStatus === false) {
      // Aplicar penalización
      payload.motivoPenalizacion = penaltyFields.value.motivo
      if (penaltyFields.value.unidad !== 'permanent') {
        const hasta = new Date()
        const val = penaltyFields.value.duracion || 0
        switch (penaltyFields.value.unidad) {
          case 'hours': hasta.setHours(hasta.getHours() + val); break
          case 'days': hasta.setDate(hasta.getDate() + val); break
          case 'weeks': hasta.setDate(hasta.getDate() + (val * 7)); break
          case 'months': hasta.setMonth(hasta.getMonth() + val); break
        }
        payload.penalizadoHasta = hasta
      }
    } else {
      // Reactivar (limpiar campos)
      payload.penalizadoHasta = null
      payload.motivoPenalizacion = null
    }

    await clientStore.updateClient(selectedClient.value.id, payload)
    dialogToggleStatus.value = false
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error)
  } finally {
    isStatusLoading.value = false
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

.new-item-btn {
  background: white !important; color: #ee6f38 !important;
  font-weight: 700 !important; text-transform: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* ── Dialog Styling (Premium) ── */
.dialog-card { border: none; }
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px;
  position: relative;
  overflow: hidden;
}

/* Red / Green / Orange Gradients */
.bg-orange-gradient {
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
}
.bg-red-gradient {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
}
.bg-green-gradient {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

.dialog-header::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
  opacity: 0.05; pointer-events: none;
}

.dialog-icon-box {
  width: 48px; height: 48px; min-width: 48px;
  background: white;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  margin-right: 18px;
  position: relative;
  z-index: 1;
}

.text-orange { color: #ee6f38 !important; }
.text-error { color: #d32f2f !important; }
.text-success { color: #2e7d32 !important; }
.shadow-sm { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

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