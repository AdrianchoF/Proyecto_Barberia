<template>
  <v-container fluid class="py-6">
    <!-- ══════════════════════════════ -->
    <!-- CARD: HEADER                  -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-users"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Nuestro Equipo de Barberos</h2>
          <p class="header-subtitle">Gestiona los perfiles, fotos y contactos de tus profesionales</p>
        </div>
        <v-btn class="new-item-btn" to="/crear-barbero" rounded="lg">
          <i class="fas fa-user-plus mr-2"></i> Nuevo Barbero
        </v-btn>
      </div>
    </v-card>

    <!-- ══════════════════════════════ -->
    <!-- FILTROS Y ESTADO              -->
    <!-- ══════════════════════════════ -->
    <div class="d-flex align-center mb-6 px-1">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Buscar barbero..."
        variant="solo"
        rounded="xl"
        flat
        hide-details
        density="comfortable"
        class="search-bar"
        bg-color="white"
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-chip color="#ee6f38" variant="flat" class="font-weight-bold" v-if="!barberStore.loading">
        {{ filteredBarbers.length }} Barberos
      </v-chip>
    </div>

    <v-progress-linear v-if="barberStore.loading" color="#ee6f38" indeterminate rounded class="mb-6" />

    <v-alert v-if="barberStore.error" type="error" variant="tonal" rounded="lg" class="mb-6">
      <i class="fas fa-exclamation-circle mr-2"></i> {{ barberStore.error }}
    </v-alert>

    <!-- ══════════════════════════════ -->
    <!-- GRID DE BARBEROS              -->
    <!-- ══════════════════════════════ -->
    <div v-if="!barberStore.loading && filteredBarbers.length === 0" class="empty-state">
      <i class="fas fa-user-slash"></i>
      <p>No se encontraron barberos que coincidan con la búsqueda</p>
    </div>

    <v-row v-else>
      <v-col v-for="barbero in filteredBarbers" :key="barbero.id" cols="12" sm="6" md="4" lg="3">
        <v-card :class="['barber-card overflow-hidden', !barbero.activo ? 'barber-inactive' : '']" elevation="2" rounded="lg">
          <!-- Banner Superior -->
          <div :class="['card-banner', !barbero.activo ? 'banner-inactive' : '']">
            <v-chip
              v-if="!barbero.activo"
              color="error"
              size="x-small"
              class="status-chip-floating font-weight-bold"
              variant="flat"
            >
              INACTIVO
            </v-chip>
          </div>
          
          <v-card-text class="text-center pt-0 px-4 pb-6">
            <!-- Avatar -->
            <div class="avatar-container">
              <v-avatar size="100" class="barber-avatar" elevation="4">
                <v-img :src="barbero.foto || 'https://via.placeholder.com/150?text=Barber'" cover>
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                      <i class="fas fa-user text-grey-lighten-1 fa-2x"></i>
                    </div>
                  </template>
                </v-img>
              </v-avatar>
            </div>

            <!-- Info -->
            <h3 class="barber-name">{{ barbero.nombre }} {{ barbero.apellido }}</h3>
            <div class="barber-role mb-4">
              <span class="role-pill mr-2">Barbero</span>
              <v-chip 
                :color="barbero.activo ? 'success' : 'grey'" 
                size="x-small" 
                variant="tonal" 
                class="font-weight-bold"
              >
                {{ barbero.activo ? 'ACTIVO' : 'INACTIVO' }}
              </v-chip>
            </div>

            <v-divider class="mb-4 opacity-10" />

            <div class="contact-info">
              <div class="info-item">
                <i class="fas fa-envelope"></i>
                <span class="text-truncate">{{ barbero.email }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-phone"></i>
                <span>{{ barbero.telefono || 'Sin teléfono' }}</span>
              </div>
            </div>
          </v-card-text>

          <!-- Acciones -->
          <div class="card-actions">
            <v-btn icon variant="text" size="small" color="primary" @click="openEditDialog(barbero)">
              <i class="fas fa-pen"></i>
              <v-tooltip activator="parent" location="top">Editar perfil</v-tooltip>
            </v-btn>
            <v-btn icon variant="text" size="small" color="#ee6f38" @click="viewSchedule(barbero)">
              <i class="fas fa-calendar-alt"></i>
              <v-tooltip activator="parent" location="top">Ver Horarios</v-tooltip>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn 
              icon 
              variant="text" 
              size="small" 
              :color="barbero.activo ? 'error' : 'success'" 
              @click="openToggleStatusDialog(barbero)"
            >
              <i :class="['fas', barbero.activo ? 'fa-user-slash' : 'fa-user-check']"></i>
              <v-tooltip activator="parent" location="top">
                {{ barbero.activo ? 'Desactivar' : 'Activar' }} barbero
              </v-tooltip>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: EDITAR BARBERO         -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEdit" max-width="600" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header bg-orange-gradient">
          <div class="d-flex align-center">
            <div class="dialog-icon-box shadow-sm">
              <i class="fas fa-user-edit text-orange"></i>
            </div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0 text-white">Editar Barbero</h3>
              <p class="text-caption mb-0 text-white opacity-80">Actualiza la información del profesional</p>
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
            <v-col cols="12">
              <v-text-field
                v-model="editForm.foto"
                label="URL de la Foto"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-image-outline"
                placeholder="https://..."
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogEdit = false">Cancelar</v-btn>
          <v-btn color="#ee6f38" variant="flat" rounded="lg" class="px-6 text-white" :loading="isSaving" @click="saveBarberEdit">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: CONFIRMAR ELIMINACIÓN  -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogToggleStatus" max-width="450" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div :class="['dialog-header', selectedBarber?.activo ? 'bg-red-gradient' : 'bg-green-gradient']">
          <div class="d-flex align-center">
             <div class="dialog-icon-box shadow-sm">
                <i :class="['fas', selectedBarber?.activo ? 'fa-user-slash text-error' : 'fa-user-check text-success']"></i>
             </div>
             <div>
                <h3 class="text-h6 font-weight-bold mb-0 text-white">
                   {{ selectedBarber?.activo ? 'Desactivar Barbero' : 'Reactivar Barbero' }}
                </h3>
                <p class="text-caption mb-0 text-white opacity-80">
                   {{ selectedBarber?.activo ? 'Restringir acceso al profesional' : 'Habilitar acceso al profesional' }}
                </p>
             </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogToggleStatus = false"></v-btn>
        </div>

        <v-card-text class="pa-8 text-center pt-10 pb-8">
            <div class="mb-4">
              <p class="text-body-1">
                Estás a punto de <strong>{{ selectedBarber?.activo ? 'desactivar' : 'activar' }}</strong> a 
                <strong class="text-black">{{ selectedBarber?.nombre }} {{ selectedBarber?.apellido }}</strong>.
              </p>
              <p class="text-body-2 text-grey-darken-1 mt-2">
                {{ selectedBarber?.activo ? 'Ya no podrá agendar citas ni aparecerá en la página principal.' : 'Volverá a estar disponible para agendar citas.' }}
              </p>
            </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogToggleStatus = false">Cancelar</v-btn>
          <v-btn 
            :color="selectedBarber?.activo ? 'error' : 'success'" 
            variant="flat" 
            rounded="lg" 
            @click="handleToggleStatus" 
            :loading="isStatusLoading" 
            class="px-8 text-white font-weight-bold"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBarberStore } from '@/stores/barber'
import { useRouter } from 'vue-router'

const barberStore = useBarberStore()
const router = useRouter()

const search = ref('')
const dialogToggleStatus = ref(false)
const dialogEdit = ref(false)
const selectedBarber = ref(null)
const isStatusLoading = ref(false)
const isSaving = ref(false)

const editForm = ref({
  id: null,
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  foto: ''
})

const filteredBarbers = computed(() => {
  if (!search.value) return barberStore.barbers
  const q = search.value.toLowerCase()
  return barberStore.barbers.filter(b => 
    b.nombre.toLowerCase().includes(q) || 
    b.apellido.toLowerCase().includes(q) ||
    b.email.toLowerCase().includes(q)
  )
})

const openEditDialog = (barbero) => {
  selectedBarber.value = barbero
  editForm.value = { ...barbero }
  dialogEdit.value = true
}

const saveBarberEdit = async () => {
  if (!editForm.value.id) return
  isSaving.value = true
  try {
    const payload = { ...editForm.value }
    delete payload.id
    await barberStore.updateBarber(editForm.value.id, payload)
    dialogEdit.value = false
  } catch (error) {
    console.error('Error al actualizar barbero:', error)
  } finally {
    isSaving.value = false
  }
}

const viewSchedule = (barbero) => {
  // Aquí podrías redirigir a la vista de horarios
  console.log('Ver horarios de:', barbero.id)
}

const openToggleStatusDialog = (barbero) => {
  selectedBarber.value = barbero
  dialogToggleStatus.value = true
}
 
const handleToggleStatus = async () => {
  if (!selectedBarber.value) return
  isStatusLoading.value = true
  try {
    const newStatus = !selectedBarber.value.activo
    await barberStore.updateBarber(selectedBarber.value.id, { activo: newStatus })
    dialogToggleStatus.value = false
  } catch (error) {
    console.error('Error al cambiar estado del barbero:', error)
  } finally {
    isStatusLoading.value = false
  }
}

onMounted(() => {
  barberStore.getBarbersAdmin()
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
.shadow-sm { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

/* ── Search Bar ── */
.search-bar { max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }

/* ── Barber Card ── */
.barber-card {
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  background: white;
}
.barber-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(238, 111, 56, 0.12) !important;
  border-color: #fde8d8;
}

.card-banner {
  height: 80px;
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
}

.barber-inactive {
  opacity: 0.7;
  filter: grayscale(0.5);
  border-color: #ffcdd2 !important;
}

.banner-inactive {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
}

.status-chip-floating {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.avatar-container {
  margin-top: -50px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.barber-avatar {
  border: 4px solid white;
  background: #fdfdfd;
}

.barber-name {
  font-size: 1.15rem; font-weight: 800; color: #333; margin: 0;
}

.barber-role { margin-top: 4px; }
.role-pill {
  background: #fff8f5; color: #ee6f38;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
  padding: 3px 12px; border-radius: 20px; border: 1px solid #fde8d8;
}

.contact-info {
  display: flex; flex-direction: column; gap: 8px;
}

.info-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.85rem; color: #666; justify-content: center;
}
.info-item i { color: #ee6f38; width: 14px; font-size: 12px; opacity: 0.7; }

/* ── Actions ── */
.card-actions {
  display: flex; align-items: center; padding: 10px 16px;
  background: #fafafa; border-top: 1px solid #f5f5f5;
}

/* ── Empty State ── */
.empty-state {
  text-align: center; padding: 80px 20px; background: white; border-radius: 24px;
}
.empty-state i { font-size: 4rem; color: #fde8d8; margin-bottom: 20px; display: block; }
.empty-state p { font-size: 1.1rem; color: #777; font-weight: 500; }

@media (max-width: 600px) {
  .form-header { flex-direction: column; text-align: center; }
}
</style>