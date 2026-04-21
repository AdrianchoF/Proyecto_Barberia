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

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: GESTIONAR HORARIOS      -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogHorario" max-width="700" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header bg-primary">
          <div class="d-flex align-center w-100">
            <div class="dialog-icon-box shadow-sm">
                <i class="fas fa-calendar-alt text-primary"></i>
            </div>
            <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-0 text-white">Gestionar Horarios</h3>
                <p class="text-caption mb-0 text-white opacity-80">
                  Definiendo la jornada laboral de <strong>{{ selectedBarber?.nombre }}</strong>
                </p>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" @click="dialogHorario = false"></v-btn>
          </div>
        </div>

        <v-card-text class="pa-6 pt-8" style="max-height: 70vh; overflow-y: auto;">
          <!-- Listado de Horarios Existentes -->
          <div v-if="loadingHorarios" class="text-center py-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4 text-grey">Cargando jornadas...</p>
          </div>

          <div v-else>
            <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <i class="fas fa-clock mr-2 text-primary"></i> Horarios Actuales
            </h4>
            
            <div v-if="horariosBarbero.length === 0" class="empty-horarios pa-6 text-center rounded-lg border-dashed mb-6">
              <i class="fas fa-calendar-times mb-3 opacity-30 fa-2x"></i>
              <p class="text-body-1 font-weight-medium text-grey-darken-1">No hay horarios configurados</p>
              <p class="text-caption text-grey">Agregue un día de trabajo abajo para comenzar</p>
            </div>

            <v-table v-else class="mb-6 rounded-lg border overflow-hidden">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="text-left font-weight-bold">Día</th>
                  <th class="text-left font-weight-bold">Entrada</th>
                  <th class="text-left font-weight-bold">Salida</th>
                  <th class="text-center font-weight-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in horariosBarbero" :key="h.id">
                  <td class="text-capitalize font-weight-medium">{{ h.Dia_semana }}</td>
                  <td>{{ h.hora_inicio }}</td>
                  <td>{{ h.hora_fin }}</td>
                  <td class="text-center">
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="eliminarHorario(h.id)"
                      variant="tonal"
                      class="rounded-lg"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-divider class="mb-6"></v-divider>

            <!-- Tabla de Pausas del Barbero -->
            <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <i class="fas fa-pause-circle mr-2 text-primary"></i> Pausas Configuradas
            </h4>

            <div v-if="pausasBarbero.length === 0" class="empty-horarios pa-6 text-center rounded-lg border-dashed mb-6">
              <i class="fas fa-pause-circle mb-3 opacity-30 fa-2x"></i>
              <p class="text-body-1 font-weight-medium text-grey-darken-1">No hay pausas configuradas</p>
              <p class="text-caption text-grey">Agregue una pausa para definir descansos o tiempos libres</p>
              <div class="mt-4">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  size="small"
                  @click="abrirDialogNuevaPausa"
                >
                  <i class="fas fa-plus mr-2"></i> Crear Pausas
                </v-btn>
              </div>
            </div>

            <div v-else>
              <v-table class="mb-4 rounded-lg border overflow-hidden">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th class="text-left font-weight-bold">Tipo</th>
                    <th class="text-left font-weight-bold">Horario</th>
                    <th class="text-left font-weight-bold">Motivo</th>
                    <th class="text-left font-weight-bold">Aplica</th>
                    <th class="text-center font-weight-bold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in pausasBarbero" :key="p.id">
                    <td>
                      <v-chip
                        :color="p.tipo === 'recurrente' ? 'primary' : 'warning'"
                        size="small"
                        variant="flat"
                      >
                        {{ p.tipo === 'recurrente' ? 'Diaria' : 'Ocasional' }}
                      </v-chip>
                    </td>
                    <td class="font-weight-medium">{{ p.hora_inicio }} - {{ p.hora_fin }}</td>
                    <td class="text-truncate" style="max-width: 180px;">{{ p.motivo }}</td>
                    <td>
                      <v-chip size="x-small" variant="tonal" color="grey-darken-1">
                        {{ p.diasAplicables }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon
                        size="small"
                        color="error"
                        @click="abrirEliminarPausa(p.id, p.dia)"
                        variant="tonal"
                        class="rounded-lg"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="d-flex justify-end ga-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  size="small"
                  @click="abrirDialogNuevaPausa"
                >
                  <i class="fas fa-plus mr-2"></i> Agregar Pausa
                </v-btn>
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- Formulario para Nuevo Horario -->
            <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <i class="fas fa-plus-circle mr-2 text-primary"></i> Agregar Nuevo Jornada
            </h4>
            
            <v-form ref="formHorario" v-model="formHorarioValid">
              <v-row>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="nuevoHorario.diasemana"
                    :items="['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']"
                    label="Día"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-select>
                </v-col>
                <v-col cols="6" sm="4">
                  <v-text-field
                    v-model="nuevoHorario.hora_inicio"
                    type="time"
                    label="Hora Inicio"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" sm="4">
                  <v-text-field
                    v-model="nuevoHorario.hora_fin"
                    type="time"
                    label="Hora Fin"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-text-field>
                </v-col>
              </v-row>
              <div class="text-right">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  class="px-6"
                  :disabled="!formHorarioValid"
                  :loading="isAddingHorario"
                  @click="agregarHorario"
                >
                  <i class="fas fa-save mr-2"></i> Agregar Horario
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogHorario = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: GESTIONAR PAUSAS       -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogPausas" max-width="800" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header bg-primary">
          <div class="d-flex align-center w-100">
            <div class="dialog-icon-box shadow-sm">
                <i class="fas fa-pause-circle text-primary"></i>
            </div>
            <div class="flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-0 text-white">Gestionar Pausas</h3>
                <p class="text-caption mb-0 text-white opacity-80">
                  Pausas para {{ selectedBarber?.nombre }} - {{ selectedHorario?.Dia_semana }}
                </p>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" @click="dialogPausas = false"></v-btn>
          </div>
        </div>

        <v-card-text class="pa-6 pt-8" style="max-height: 70vh; overflow-y: auto;">
          <!-- Listado de Pausas Existentes -->
          <div v-if="loadingPausas" class="text-center py-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4 text-grey">Cargando pausas...</p>
          </div>

          <div v-else>
            <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <i class="fas fa-clock mr-2 text-primary"></i> Pausas Configuradas
            </h4>
            
            <div v-if="pausasHorario.length === 0" class="empty-horarios pa-6 text-center rounded-lg border-dashed mb-6">
              <i class="fas fa-pause-circle mb-3 opacity-30 fa-2x"></i>
              <p class="text-body-1 font-weight-medium text-grey-darken-1">No hay pausas configuradas</p>
              <p class="text-caption text-grey">Agregue una pausa abajo para comenzar</p>
            </div>

            <v-table v-else class="mb-6 rounded-lg border overflow-hidden">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="text-left font-weight-bold">Tipo</th>
                  <th class="text-left font-weight-bold">Horario</th>
                  <th class="text-left font-weight-bold">Motivo</th>
                  <th class="text-center font-weight-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pausasHorario" :key="p.id">
                  <td>
                    <v-chip 
                      :color="p.tipo === 'recurrente' ? 'primary' : 'warning'" 
                      size="small" 
                      variant="flat"
                    >
                      {{ p.tipo === 'recurrente' ? 'Diaria' : 'Ocasional' }}
                    </v-chip>
                  </td>
                  <td>{{ p.hora_inicio }} - {{ p.hora_fin }}</td>
                  <td class="text-truncate" style="max-width: 200px;">{{ p.motivo }}</td>
                  <td class="text-center">
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="eliminarPausa(p.id)"
                      variant="tonal"
                      class="rounded-lg"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-divider class="mb-6"></v-divider>

            <!-- Formulario para Nueva Pausa -->
            <h4 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <i class="fas fa-plus-circle mr-2 text-primary"></i> Agregar Nueva Pausa
            </h4>
            
            <v-form ref="formPausa" v-model="formPausaValid">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="nuevaPausa.tipo"
                    :items="[
                      { title: 'Recurrente (Diaria)', value: 'recurrente' },
                      { title: 'Ocasional', value: 'ocasional' }
                    ]"
                    label="Tipo de Pausa"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" v-if="nuevaPausa.tipo === 'ocasional'">
                  <v-text-field
                    v-model="nuevaPausa.fecha"
                    type="date"
                    label="Fecha"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" v-if="nuevaPausa.tipo === 'recurrente'">
                  <v-checkbox
                    v-model="nuevaPausa.todos_los_dias"
                    label="Aplicar todos los días que trabaja"
                    color="primary"
                    density="comfortable"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" sm="3">
                  <v-text-field
                    v-model="nuevaPausa.hora_inicio"
                    type="time"
                    label="Hora Inicio"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-text-field
                    v-model="nuevaPausa.hora_fin"
                    type="time"
                    label="Hora Fin"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="nuevaPausa.motivo"
                    label="Motivo"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="primary"
                    :rules="[v => !!v || 'Campo requerido']"
                    placeholder="Ej: Almuerzo, Cita médica, Compromiso personal..."
                  ></v-text-field>
                </v-col>
              </v-row>
              <div class="text-right">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="lg"
                  class="px-6"
                  :disabled="!formPausaValid"
                  :loading="isAddingPausa"
                  @click="agregarPausa"
                >
                  <i class="fas fa-save mr-2"></i> Agregar Pausa
                </v-btn>
              </div>
            </v-form>

            <!-- Huecos libres sugeridos -->
            <div v-if="huecosLibres.length > 0" class="mt-6">
              <h5 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <i class="fas fa-lightbulb mr-2 text-warning"></i> Huecos Libres Sugeridos
              </h5>
              <p class="text-body-2 text-grey mb-3">
                Si no puedes crear la pausa en el horario deseado, considera estos momentos libres:
              </p>
              <v-chip-group>
                <v-chip
                  v-for="hueco in huecosLibres"
                  :key="hueco.hora_inicio"
                  variant="outlined"
                  color="success"
                  class="ma-1"
                  @click="seleccionarHueco(hueco)"
                >
                  {{ hueco.hora_inicio }} - {{ hueco.hora_fin }}
                </v-chip>
              </v-chip-group>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogPausas = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBarberStore } from '@/stores/barber'
import { useRouter } from 'vue-router'

const barberStore = useBarberStore()
const router = useRouter()

const search = ref('')
const dialogToggleStatus = ref(false)
const dialogEdit = ref(false)
const dialogHorario = ref(false)
const selectedBarber = ref(null)
const isStatusLoading = ref(false)
const isSaving = ref(false)
const loadingHorarios = ref(false)
const isAddingHorario = ref(false)
const horariosBarbero = ref([])
const formHorarioValid = ref(false)
const formHorario = ref(null)

// Variables para pausas
const dialogPausas = ref(false)
const selectedHorario = ref(null)
const pausasHorario = ref([])
const loadingPausas = ref(false)
const isAddingPausa = ref(false)
const formPausaValid = ref(false)
const formPausa = ref(null)
const huecosLibres = ref([])
const loadingHuecos = ref(false)

const nuevaPausa = ref({
  tipo: 'recurrente',
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
  motivo: '',
  todos_los_dias: true
})

const nuevoHorario = ref({
  diasemana: '',
  hora_inicio: '',
  hora_fin: ''
})

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

// Computed: pausasBarbero se deriva automáticamente de horariosBarbero
const pausasBarbero = computed(() => {
    const pausasConDia = []
    const pausasYaAgregadas = new Set()

    for (const horario of horariosBarbero.value) {
        if (horario.pausas && horario.pausas.length > 0) {
            for (const pausa of horario.pausas) {
                const clave = `${pausa.hora_inicio}-${pausa.hora_fin}-${pausa.tipo}-${pausa.todos_los_dias}`

                if (pausa.todos_los_dias && pausasYaAgregadas.has(clave)) {
                    continue
                }

                let diasAplicables
                if (pausa.todos_los_dias) {
                    diasAplicables = 'Todos los días'
                } else if (pausa.tipo === 'ocasional' && pausa.fecha) {
                    // Para pausas ocasionales, mostrar el día y la fecha
                    const fechaObj = new Date(`${pausa.fecha}T00:00:00`)
                    const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
                    const diaNombre = diasNombres[fechaObj.getDay()]
                    const fechaFormateada = fechaObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    diasAplicables = `${diaNombre} - ${fechaFormateada}`
                } else {
                    diasAplicables = horario.Dia_semana
                }

                pausasConDia.push({
                    ...pausa,
                    dia: horario.Dia_semana,
                    diasAplicables,
                    horarioId: horario.id
                })

                if (pausa.todos_los_dias) {
                    pausasYaAgregadas.add(clave)
                }
            }
        }
    }

    return pausasConDia.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
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

const viewSchedule = async (barbero) => {
  selectedBarber.value = barbero
  dialogHorario.value = true
  fetchHorarios()
}

const fetchHorarios = async () => {
    if (!selectedBarber.value) return
    loadingHorarios.value = true
    try {
        const horarios = await barberStore.getHorariosBarbero(selectedBarber.value.id)
        horariosBarbero.value = horarios
        // pausasBarbero se actualiza automáticamente (es computed de horariosBarbero)

        if (selectedHorario.value) {
            const horarioActualizado = horariosBarbero.value.find(h => String(h.id) === String(selectedHorario.value.id))
            if (horarioActualizado) {
                selectedHorario.value = horarioActualizado
            }
        }
    } catch (error) {
        console.error('Error cargando horarios:', error)
        horariosBarbero.value = []
    } finally {
        loadingHorarios.value = false
    }
}

// Cuando se cierra el dialog de pausas, refrescar horarios para que pausasBarbero se actualice
watch(dialogPausas, (newVal) => {
    if (!newVal) {
        fetchHorarios()
    }
})

const agregarHorario = async () => {
    if (!selectedBarber.value || !formHorarioValid.value) return
    isAddingHorario.value = true
    try {
        const payload = {
            barberoId: selectedBarber.value.id,
            diasemana: nuevoHorario.value.diasemana,
            hora_inicio: nuevoHorario.value.hora_inicio,
            hora_fin: nuevoHorario.value.hora_fin
        }
        await barberStore.addHorario(payload)
        // Limpiar form y recargar
        nuevoHorario.value = { diasemana: '', hora_inicio: '', hora_fin: '' }
        if (formHorario.value) formHorario.value.resetValidation()
        await fetchHorarios()
    } catch (error) {
        alert(error || 'Error al agregar horario. Verifique que las horas no se crucen.')
        console.error('Error al agregar:', error)
    } finally {
        isAddingHorario.value = false
    }
}

const eliminarHorario = async (horarioId) => {
    if (!confirm('¿Estás seguro de eliminar esta jornada laboral?')) return
    try {
        await barberStore.removeHorario(horarioId)
        await fetchHorarios()
    } catch (error) {
        console.error('Error al eliminar:', error)
    }
}

// Funciones para gestionar pausas
const abrirDialogNuevaPausa = async () => {
    // Por defecto, seleccionar el primer horario del barbero
    if (horariosBarbero.value.length > 0) {
        selectedHorario.value = horariosBarbero.value[0]
    }
    dialogPausas.value = true
    await fetchPausas()
}

const gestionarPausas = (horario) => {
    selectedHorario.value = horario
    dialogPausas.value = true
    fetchPausas()
}

const fetchPausas = async () => {
    if (!selectedHorario.value) return
    loadingPausas.value = true
    try {
        const horarioActualizado = horariosBarbero.value.find(h => String(h.id) === String(selectedHorario.value.id))
        if (horarioActualizado) {
            selectedHorario.value = horarioActualizado
        }
        // Las pausas están incluidas en el horario cuando se carga
        pausasHorario.value = selectedHorario.value.pausas || []
    } catch (error) {
        console.error('Error cargando pausas:', error)
        pausasHorario.value = []
    } finally {
        loadingPausas.value = false
    }
}

const abrirEliminarPausa = (pausaId, dia) => {
    const pausaAEliminar = pausasBarbero.value.find(p => p.id === pausaId)
    if (pausaAEliminar) {
        eliminarPausaRecurrente(pausaId, pausaAEliminar, dia)
    }
}

const eliminarPausaRecurrente = async (pausaId, pausa, dia) => {
    if (!confirm(`¿Estás seguro de eliminar la pausa de ${pausa.diasAplicables}?`)) return
    
    // Si es recurrente con todos_los_días, eliminar de TODOS los horarios
    if (pausa.tipo === 'recurrente' && pausa.todos_los_dias) {
        try {
            let eliminacionExitosa = false
            for (const horario of horariosBarbero.value) {
                try {
                    await barberStore.removePausa(horario.id, pausaId)
                    eliminacionExitosa = true
                } catch (err) {
                    // Continuar intentando con otros horarios
                }
            }
            if (eliminacionExitosa) {
                await fetchHorarios()
                await fetchPausas()
            }
        } catch (error) {
            console.error('Error al eliminar pausa recurrente:', error)
            alert('Error al eliminar la pausa')
        }
    } else {
        // Para pausas ocasionales o de un solo día
        selectedHorario.value = horariosBarbero.value.find(h => h.Dia_semana === dia)
        if (selectedHorario.value) {
            await eliminarPausa(pausaId)
        }
    }
}

const agregarPausa = async () => {
    if (!selectedHorario.value || !formPausaValid.value) return
    isAddingPausa.value = true
    huecosLibres.value = []

    // Para pausas ocasionales, buscar el horario correcto según el día de la fecha seleccionada
    let horarioId = selectedHorario.value.id
    if (nuevaPausa.value.tipo === 'ocasional' && nuevaPausa.value.fecha) {
        const fechaDate = new Date(`${nuevaPausa.value.fecha}T00:00:00`)
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
        const diaSemana = dias[fechaDate.getDay()]

        const horarioDelDia = horariosBarbero.value.find(h => h.Dia_semana === diaSemana)
        if (!horarioDelDia) {
            alert(`El barbero no tiene horario configurado para el día ${diaSemana}. No se puede crear la pausa.`)
            isAddingPausa.value = false
            return
        }
        horarioId = horarioDelDia.id
        selectedHorario.value = horarioDelDia
    }

    try {
        const payload = {
            tipo: nuevaPausa.value.tipo,
            hora_inicio: nuevaPausa.value.hora_inicio,
            hora_fin: nuevaPausa.value.hora_fin,
            motivo: nuevaPausa.value.motivo,
            todos_los_dias: nuevaPausa.value.tipo === 'recurrente' ? nuevaPausa.value.todos_los_dias : undefined,
            fecha: nuevaPausa.value.tipo === 'ocasional' ? nuevaPausa.value.fecha : undefined,
        }

        await barberStore.addPausa(horarioId, payload)
        await fetchHorarios()

        const horarioActualizado = horariosBarbero.value.find(h => h.id === horarioId)
        if (horarioActualizado) {
            selectedHorario.value = horarioActualizado
        }

        // Limpiar form y recargar
        nuevaPausa.value = {
            tipo: 'recurrente',
            fecha: '',
            hora_inicio: '',
            hora_fin: '',
            motivo: '',
            todos_los_dias: true
        }
        if (formPausa.value) formPausa.value.resetValidation()
        await fetchPausas()
    } catch (error) {
        // Si hay error, buscar huecos libres
        await buscarHuecosLibres()
        alert(error || 'Error al agregar pausa. Verifique que no se solape con citas existentes.')
        console.error('Error al agregar pausa:', error)
    } finally {
        isAddingPausa.value = false
    }
}

const buscarHuecosLibres = async () => {
    if (!selectedBarber.value) return
    loadingHuecos.value = true
    try {
        const fecha = nuevaPausa.value.tipo === 'ocasional' ? nuevaPausa.value.fecha : new Date().toISOString().split('T')[0]
        const duracion = calcularDuracionPausa()
        huecosLibres.value = await barberStore.getHuecosLibres(selectedBarber.value.id, fecha, duracion)
    } catch (error) {
        console.error('Error buscando huecos libres:', error)
        huecosLibres.value = []
    } finally {
        loadingHuecos.value = false
    }
}

const calcularDuracionPausa = () => {
    const inicio = nuevaPausa.value.hora_inicio
    const fin = nuevaPausa.value.hora_fin
    if (!inicio || !fin) return 60
    const minutosInicio = horaAMinutos(inicio)
    const minutosFin = horaAMinutos(fin)
    return minutosFin - minutosInicio
}

const horaAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
}

const seleccionarHueco = (hueco) => {
    nuevaPausa.value.hora_inicio = hueco.hora_inicio
    nuevaPausa.value.hora_fin = hueco.hora_fin
}

const eliminarPausa = async (pausaId) => {
    if (!confirm('¿Estás seguro de eliminar esta pausa?')) return
    try {
        await barberStore.removePausa(selectedHorario.value.id, pausaId)
        await fetchHorarios()
        await fetchPausas()
    } catch (error) {
        console.error('Error al eliminar pausa:', error)
        // Recargar en caso de inconsistencia
        await fetchHorarios()
        await fetchPausas()
    }
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

.empty-horarios {
    border: 2px dashed #f0f0f0;
    transition: all 0.3s ease;
}
.empty-horarios:hover {
    border-color: #ee6f38;
    background: #fff8f5;
}
.border-dashed {
    border: 2px dashed #e0e0e0;
}
.text-error { color: #d32f2f !important; }
.text-success { color: #2e7d32 !important; }

@media (max-width: 600px) {
  .form-header { flex-direction: column; text-align: center; }
}
</style>