<template>
  <v-container fluid class="py-6">
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header bg-purple-gradient">
        <div class="header-icon"><i class="fas fa-store"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Gestión de Barberías (SaaS)</h2>
          <p class="header-subtitle">Control de administradores y acceso al sistema</p>
        </div>
        <div class="text-right">
           <v-chip color="white" variant="flat" class="text-purple font-weight-bold" v-if="!superStore.loading">
              {{ superStore.admins.length }} Clientes SaaS
           </v-chip>
           <v-btn
             color="white"
             variant="elevated"
             class="ml-3 text-purple font-weight-black px-6"
             rounded="lg"
             @click="openRegisterDialog"
           >
             <i class="fas fa-plus mr-2"></i>
             Nueva Barbería
           </v-btn>
        </div>
      </div>
    </v-card>

    <v-progress-linear v-if="superStore.loading" color="purple" indeterminate rounded class="mb-4" />

    <v-card elevation="2" rounded="lg" v-if="!superStore.loading">
      <v-card-text class="pa-4">
        <div class="table-wrapper">
          <table class="brand-table">
            <thead>
              <tr>
                <th class="th-left">Dueño / Barbería</th>
                <th class="th-left">Contacto</th>
                <th class="th-center">Suscripción</th>
                <th class="th-center">Doble Rol</th>
                <th class="th-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in superStore.admins" :key="admin.id" class="brand-row">
                <td>
                  <div class="d-flex align-center gap-3">
                    <v-avatar size="40" color="purple-lighten-4">
                      <v-img :src="admin.foto || 'https://via.placeholder.com/100?text=Admin'" cover></v-img>
                    </v-avatar>
                    <div>
                      <div class="admin-name">{{ admin.nombre }} {{ admin.apellido }}</div>
                      <div class="text-caption text-grey">Admin ID: #{{ admin.id }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="admin-email"><i class="far fa-envelope mr-1"></i> {{ admin.email }}</div>
                  <div class="admin-phone"><i class="fas fa-phone-alt mr-1"></i> {{ admin.telefono || 'Sin tel.' }}</div>
                </td>
                <td class="td-center">
                  <v-chip
                    :color="admin.activo ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                    @click="toggleActive(admin)"
                    class="cursor-pointer"
                  >
                    {{ admin.activo ? 'PAGO AL DÍA' : 'MOROSO / INACTIVO' }}
                  </v-chip>
                </td>
                <td class="td-center">
                   <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-switch
                        v-bind="props"
                        v-model="admin.esBarbero"
                        color="purple"
                        hide-details
                        density="compact"
                        @change="toggleBarber(admin)"
                      ></v-switch>
                    </template>
                    <span>Habilitar funciones de barbero</span>
                  </v-tooltip>
                </td>
                <td class="td-center">
                  <v-btn icon variant="text" size="small" color="purple" @click="editAdmin(admin)">
                    <i class="fas fa-edit"></i>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialogo de confirmación SaaS -->
    <v-dialog v-model="statusDialog" max-width="450">
        <v-card rounded="xl">
            <v-card-title class="pa-4 bg-purple-gradient text-white">
                <i class="fas fa-shield-alt mr-2"></i> Cambiar Estado de Acceso
            </v-card-title>
            <v-card-text class="pa-4 text-center">
                ¿Estás seguro de que quieres {{ selectedAdmin?.activo ? 'SUSPENDER' : 'ACTIVAR' }} el acceso a la barbería de <strong>{{ selectedAdmin?.nombre }}</strong>?
                <p class="mt-2 text-caption text-grey" v-if="selectedAdmin?.activo">
                    Esto impedirá que el dueño y su equipo entren al sistema.
                </p>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-btn variant="text" @click="statusDialog = false">Cerrar</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="purple" variant="flat" @click="confirmToggleActive" :loading="superStore.loading">
                    Confirmar Cambio
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialogo para registrar administrador -->
    <v-dialog v-model="registerDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-purple-gradient text-white d-flex align-center">
            <i class="fas fa-user-plus mr-3"></i> 
            Registrar Nueva Barbería
            <v-spacer></v-spacer>
            <v-btn icon="fas fa-times" variant="text" color="white" @click="registerDialog = false" size="small"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="registerForm" v-model="formValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newAdmin.nombre"
                  label="Nombre del Dueño"
                  prepend-inner-icon="fas fa-user"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'Nombre es obligatorio']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newAdmin.apellido"
                  label="Apellido"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'Apellido es obligatorio']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newAdmin.email"
                  label="Email (Fundamental para Google Login)"
                  prepend-inner-icon="fas fa-envelope"
                  variant="outlined"
                  type="email"
                  required
                  :rules="[v => !!v || 'Email es obligatorio', v => /.+@.+\..+/.test(v) || 'Email no válido']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newAdmin.telefono"
                  label="Teléfono de Contacto"
                  prepend-inner-icon="fas fa-phone"
                  variant="outlined"
                  placeholder="10 dígitos"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newAdmin.password"
                  label="Contraseña Provisional"
                  prepend-inner-icon="fas fa-lock"
                  variant="outlined"
                  type="password"
                  required
                  :rules="[v => !!v || 'Contraseña es obligatoria', v => v.length >= 6 || 'Mínimo 6 caracteres']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <div class="switch-container pa-3 rounded-lg border mb-4">
                  <v-switch
                    v-model="newAdmin.esBarbero"
                    label="¿Habilitar Modo Barbero?"
                    color="primary"
                    inset
                    hide-details
                    persistent-hint
                    hint="Activa esta opción si el dueño también corta el cabello"
                    class="mt-0"
                  ></v-switch>
                </div>
              </v-col>
            </v-row>
          </v-form>

          <v-alert v-if="superStore.error" type="error" variant="tonal" class="mt-4" closable>
            {{ superStore.error }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="registerDialog = false">Cancelar</v-btn>
          <v-btn
            color="purple"
            variant="flat"
            size="large"
            rounded="lg"
            @click="submitRegister"
            :loading="superStore.loading"
            :disabled="!formValid"
          >
            Crear Administrador
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuperAdminStore } from '@/stores/superadmin'

const superStore = useSuperAdminStore()
const statusDialog = ref(false)
const registerDialog = ref(false)
const formValid = ref(false)
const registerForm = ref(null)
const selectedAdmin = ref(null)

const newAdmin = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  esBarbero: false
})

onMounted(() => {
  superStore.getAdmins()
})

const openRegisterDialog = () => {
    superStore.error = null // Limpiar errores previos al abrir
    newAdmin.value = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        esBarbero: false
    }
    registerDialog.value = true
}

const submitRegister = async () => {
    if (!formValid.value) return
    try {
        await superStore.registerAdmin(newAdmin.value)
        registerDialog.value = false
    } catch (e) {
        console.error('Error al registrar:', e)
    }
}

const toggleActive = (admin) => {
  selectedAdmin.value = admin
  statusDialog.value = true
}

const confirmToggleActive = async () => {
    if (!selectedAdmin.value) return
    try {
        await superStore.updateAdmin(selectedAdmin.value.id, { activo: !selectedAdmin.value.activo })
        statusDialog.value = false
    } catch (e) {
        console.error(e)
    }
}

const toggleBarber = async (admin) => {
    try {
        await superStore.updateAdmin(admin.id, { esBarbero: admin.esBarbero })
    } catch (e) {
        // Revertir si falla
        admin.esBarbero = !admin.esBarbero
    }
}

const editAdmin = (admin) => {
    // Implementar si se requiere editar datos basicos
    console.log('Editar admin:', admin)
}
</script>

<style scoped>
.bg-purple-gradient {
  background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%) !important;
}
.text-purple { color: #6a1b9a !important; }

.brand-card { border: none; overflow: hidden; }
.form-header {
  display: flex; align-items: center; gap: 16px;
  padding: 24px;
  color: white;
}
.header-icon {
  width: 52px; height: 52px; min-width: 52px;
  border-radius: 14px; background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.header-title { font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.header-subtitle { font-size: 0.9rem; margin: 2px 0 0; opacity: 0.9; }

/* Tabla */
.brand-table { width: 100%; border-collapse: collapse; }
.brand-table th { padding: 16px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #999; border-bottom: 2px solid #f5f5f5; text-align: left; }
.brand-table td { padding: 16px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
.th-center, .td-center { text-align: center !important; }
.brand-row:hover { background: #f9f5ff; }

.admin-name { font-weight: 700; color: #333; }
.admin-email, .admin-phone { font-size: 0.85rem; color: #666; }
.cursor-pointer { cursor: pointer; }

.gap-3 { gap: 12px; }
.gap-1 { gap: 4px; }

.switch-container {
  background-color: rgba(var(--v-theme-on-surface), 0.03);
  transition: all 0.3s ease;
}
.switch-container:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
</style>
