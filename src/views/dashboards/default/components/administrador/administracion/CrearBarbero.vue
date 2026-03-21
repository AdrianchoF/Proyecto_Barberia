<template>
  <v-card class="crear-barbero-card" elevation="2" rounded="lg">

    <!-- Header con gradiente naranja -->
    <div class="form-header">
      <div class="header-icon">
        <i class="fas fa-cut"></i>
      </div>
      <div>
        <h2 class="header-title">Nuevo Barbero</h2>
        <p class="header-subtitle">Completa los datos para registrar un barbero en el sistema</p>
      </div>
    </div>

    <v-card-text class="pa-6">
      <v-form @submit.prevent="submitBarber" v-model="valid">

        <!-- SECCIÓN 1: INFORMACIÓN PERSONAL -->
        <div class="section-label">
          <i class="fas fa-user-circle section-icon"></i>
          <span>Información Personal</span>
        </div>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-user field-icon"></i>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.apellido"
              label="Apellido"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'El apellido es requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-user field-icon"></i>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.email"
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'El email es requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-envelope field-icon"></i>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'La contraseña es requerida']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-lock field-icon"></i>
              </template>
              <template #append-inner>
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                ></i>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.telefono"
              label="Teléfono"
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
              v-model="form.foto"
              label="URL de Foto"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :rules="[v => !!v || 'La URL de la foto es requerida']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-image field-icon"></i>
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- SECCIÓN 2: HORARIOS DE TRABAJO -->
        <v-divider class="my-5" />

        <div class="section-label">
          <i class="fas fa-calendar-week section-icon"></i>
          <span>Horarios de Trabajo</span>
        </div>

        <div v-if="form.horarios.length === 0" class="empty-schedule">
          <i class="fas fa-calendar-plus empty-icon"></i>
          <p>No hay horarios asignados. Haz clic en "Agregar Horario" para comenzar.</p>
        </div>

        <div
          v-for="(horario, index) in form.horarios"
          :key="index"
          class="horario-row"
        >
          <div class="horario-badge">{{ index + 1 }}</div>
          <div class="horario-fields">
            <v-select
              v-model="horario.diasemana"
              :items="diasSemana"
              label="Día"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              :rules="[v => !!v || 'Selecciona un día']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-calendar-day field-icon"></i>
              </template>
            </v-select>
            <v-text-field
              v-model="horario.hora_inicio"
              type="time"
              label="Hora inicio"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              :rules="[v => !!v || 'Requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-clock field-icon"></i>
              </template>
            </v-text-field>
            <v-text-field
              v-model="horario.hora_fin"
              type="time"
              label="Hora fin"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              :rules="[v => !!v || 'Requerido']"
              required
            >
              <template #prepend-inner>
                <i class="fas fa-clock field-icon"></i>
              </template>
            </v-text-field>
          </div>
          <v-tooltip text="Eliminar horario" location="top">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="remove-btn" @click="removeHorario(index)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </template>
          </v-tooltip>
        </div>

        <button type="button" class="add-schedule-btn" @click="addHorario">
          <i class="fas fa-plus"></i>
          Agregar Horario
        </button>

        <!-- BOTÓN SUBMIT -->
        <v-divider class="my-5" />
        <v-btn
          type="submit"
          class="submit-btn"
          :disabled="!valid || form.horarios.length === 0"
          :loading="loading"
          size="large"
          rounded="lg"
          block
        >
          <i class="fas fa-check-circle mr-2"></i>
          Crear Barbero
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
  import { ref } from 'vue'
  import { useBarberStore } from '@/stores/barber'

  const form = ref({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    foto: '',
    horarios: []
  })

  const diasSemana = [
    { title: 'Lunes', value: 'lunes' },
    { title: 'Martes', value: 'martes' },
    { title: 'Miércoles', value: 'miercoles' },
    { title: 'Jueves', value: 'jueves' },
    { title: 'Viernes', value: 'viernes' },
    { title: 'Sábado', value: 'sabado' },
    { title: 'Domingo', value: 'domingo' },
  ]

  const valid = ref(false)
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const snackbarColor = ref('success')
  const loading = ref(false)
  const showPassword = ref(false)
  const barberStore = useBarberStore()

  const addHorario = () => {
    form.value.horarios.push({ diasemana: '', hora_inicio: '', hora_fin: '' })
  }

  const removeHorario = (index) => {
    form.value.horarios.splice(index, 1)
  }

  const submitBarber = async () => {
    loading.value = true
    if (!valid.value) { loading.value = false; return }
    try {
      await barberStore.createBarberWithSchedule(form.value)
      snackbarMessage.value = 'Barbero y horarios creados exitosamente'
      snackbarColor.value = 'success'
      snackbar.value = true
      form.value = { nombre: '', apellido: '', email: '', password: '', telefono: '', foto: '', horarios: [] }
    } catch (error) {
      console.error('Error al crear barbero:', error)
      snackbarMessage.value = error?.message || 'Error al crear barbero'
      snackbarColor.value = 'error'
      snackbar.value = true
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.crear-barbero-card {
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

.toggle-password {
  color: #7f8c9a;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}
.toggle-password:hover { color: #ee6f38; }

/* ── Empty schedule ── */
.empty-schedule {
  text-align: center;
  padding: 28px 20px;
  border: 2px dashed #f4c4a8;
  border-radius: 14px;
  color: #9aa3af;
  margin-bottom: 16px;
}
.empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  display: block;
  opacity: 0.5;
  color: #ee6f38;
}
.empty-schedule p { margin: 0; font-size: 0.9rem; }

/* ── Horario row ── */
.horario-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff8f5;
  border: 1px solid #fbdacc;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}
.horario-row:hover { box-shadow: 0 3px 12px rgba(238,111,56,0.12); }

.horario-badge {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #ee6f38;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.horario-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
}

/* ── Remove button ── */
.remove-btn {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 10px;
  border: none;
  background: #ffeaea;
  color: #e53935;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
  font-size: 13px;
}
.remove-btn:hover { background: #ffcccc; transform: scale(1.08); }

/* ── Add schedule button ── */
.add-schedule-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px dashed #ee6f38;
  background: transparent;
  color: #ee6f38;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-bottom: 8px;
  width: 100%;
  justify-content: center;
}
.add-schedule-btn:hover {
  background: #ee6f38;
  color: white;
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
  .horario-fields { grid-template-columns: 1fr; }
  .form-header { flex-direction: column; text-align: center; }
}
</style>