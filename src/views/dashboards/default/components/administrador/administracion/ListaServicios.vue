<template>
  <v-container fluid class="py-6">

    <!-- ══════════════════════════════ -->
    <!-- CARD: HEADER                  -->
    <!-- ══════════════════════════════ -->
    <v-card class="brand-card mb-6" elevation="2" rounded="xl">
      <div class="form-header">
        <div class="header-icon"><i class="fas fa-concierge-bell"></i></div>
        <div class="flex-grow-1">
          <h2 class="header-title">Servicios de la Barbería</h2>
          <p class="header-subtitle">Gestiona el catálogo de cortes, precios y servicios destacados</p>
        </div>
        <v-btn class="new-service-btn" to="/crear-servicio" rounded="lg">
          <i class="fas fa-plus mr-2"></i> Nuevo Servicio
        </v-btn>
      </div>
    </v-card>

    <v-progress-linear v-if="servicioStore.loading" color="#ee6f38" indeterminate rounded class="mb-4" />
    
    <v-alert v-if="servicioStore.error" type="error" variant="tonal" rounded="lg" class="mb-4">
      <i class="fas fa-exclamation-circle mr-2"></i> {{ servicioStore.error }}
    </v-alert>

    <!-- ══════════════════════════════ -->
    <!-- TABLA DE SERVICIOS            -->
    <!-- ══════════════════════════════ -->
    <v-card elevation="2" rounded="lg" v-if="!servicioStore.loading">
      <div class="table-header">
        <div class="table-title">
          <i class="fas fa-list mr-2"></i> Lista de Servicios
          <v-chip class="ml-2" size="small" color="#ee6f38" variant="flat">
            {{ servicioStore.services.length }}
          </v-chip>
        </div>
      </div>

      <v-card-text class="pa-4">
        <div v-if="servicioStore.services.length === 0" class="empty-state">
          <i class="fas fa-cut"></i>
          <p>No hay servicios registrados en la plataforma</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="brand-table">
            <thead>
              <tr>
                <th class="th-center" style="width: 60px">Dest.</th>
                <th class="th-left">Servicio</th>
                <th class="th-left th-hide-sm">Categoría</th>
                <th class="th-center">Duración</th>
                <th class="th-right">Precio</th>
                <th class="th-center" style="width: 140px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="servicio in servicioStore.services" :key="servicio.id" class="brand-row" :class="{ 'row-featured': servicio.esDestacado }">
                
                <!-- Destacado Icon -->
                <td class="td-center">
                  <v-btn 
                    icon variant="text" size="small" 
                    :color="servicio.esDestacado ? '#ee6f38' : '#bdbdbd'"
                    @click="handleFeaturedClick(servicio)"
                  >
                    <i :class="servicio.esDestacado ? 'fas fa-star' : 'far fa-star'"></i>
                    <v-tooltip activator="parent" location="top">
                      Configurar Destacado
                    </v-tooltip>
                  </v-btn>
                </td>

                <!-- Nombre y Descripción -->
                <td>
                  <div class="serv-nombre">{{ servicio.nombre }}</div>
                  <div class="serv-desc-container">
                    <div class="serv-desc-text">{{ servicio.descripcion }}</div>
                    <v-tooltip activator="parent" location="bottom" max-width="300">
                      {{ servicio.descripcion }}
                    </v-tooltip>
                  </div>
                </td>

                <!-- Categoría -->
                <td class="th-hide-sm">
                  <span class="category-pill">{{ nombreCategoria(servicio.categoriaId) || servicio.categoria || 'General' }}</span>
                </td>

                <!-- Duración -->
                <td class="td-center">
                  <div class="duration-wrap">
                    <i class="far fa-clock mr-1 text-muted"></i>
                    {{ formatDuracion(servicio.duracionAprox) }}
                  </div>
                </td>

                <!-- Precio -->
                <td class="td-right">
                  <span class="serv-price">${{ formatPrecio(servicio.precio) }}</span>
                </td>

                <!-- Acciones -->
                <td class="td-center">
                  <div class="d-flex justify-center gap-2">
                    <v-btn icon variant="text" size="small" color="primary" @click="openEditDialog(servicio)">
                      <i class="fas fa-pen"></i>
                      <v-tooltip activator="parent" location="top">Editar Servicio</v-tooltip>
                    </v-btn>
                    <v-btn icon variant="text" size="small" color="error" @click="openDeleteDialog(servicio)">
                      <i class="fas fa-trash-alt"></i>
                      <v-tooltip activator="parent" location="top">Eliminar Servicio</v-tooltip>
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
    <!-- DIALOG: EDITAR SERVICIO        -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogEdit" max-width="600" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header">
          <div class="d-flex align-center">
            <div class="dialog-icon"><i class="fas fa-edit text-orange"></i></div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0">Editar Servicio</h3>
              <p class="text-caption mb-0 text-white opacity-80">Modifica los detalles del servicio</p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogEdit = false"></v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="editForm.nombre"
                label="Nombre del Servicio"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-format-title"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="editForm.categoriaId"
                :items="categoriaServicioStore.categoriasServicio"
                item-title="nombre"
                item-value="id"
                label="Categoría"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.precio"
                label="Precio ($)"
                type="number"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prefix="$"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editForm.duracionAprox"
                label="Duración (HH:mm:ss)"
                placeholder="00:30:00"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-clock-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="editForm.descripcion"
                label="Descripción"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogEdit = false">Cancelar</v-btn>
          <v-btn color="#ee6f38" variant="flat" rounded="lg" class="px-6 text-white" :loading="isSaving" @click="saveServiceEdit">
            Actualizar Servicio
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
        <h3 class="text-h5 font-weight-bold mb-2">¿Estás seguro?</h3>
        <p class="text-body-2 text-grey-darken-1 mb-6">
          Estás a punto de eliminar el servicio <br>
          <strong class="text-black">{{ selectedService?.nombre }}</strong>. <br>
          Esta acción no se puede deshacer.
        </p>
        <div class="d-flex gap-3 justify-center">
          <v-btn variant="tonal" color="grey" rounded="xl" @click="dialogDelete = false" class="px-6">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="flat" rounded="xl" @click="handleDelete" :loading="isDeleting" class="px-6">
            Sí, Eliminar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ══════════════════════════════ -->
    <!-- DIALOG: CONFIG DESTACADO      -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="dialogFeatured" max-width="500" persistent rounded="xl">
      <v-card class="dialog-card overflow-hidden">
        <div class="dialog-header">
          <div class="d-flex align-center">
            <div class="dialog-icon"><i class="fas fa-star text-orange"></i></div>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0">Configuración de Destacado</h3>
              <p class="text-caption mb-0 text-white opacity-80">Personaliza cómo se verá en la pagina principal</p>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogFeatured = false"></v-btn>
        </div>

        <v-card-text class="pa-6">
          <div class="featured-info mb-6">
            <h4 class="text-subtitle-1 font-weight-bold color-brand">{{ selectedService?.nombre }}</h4>
            <p class="text-body-2 text-grey">Este servicio se mostrará con un video de fondo en la sección principal de la web si está marcado como destacado.</p>
          </div>

          <v-switch
            v-model="featuredForm.esDestacado"
            color="#ee6f38"
            label="Mostrar como servicio destacado (Max 3)"
            inset
            hide-details
            class="mb-6 font-weight-bold"
          ></v-switch>

          <v-expand-transition>
            <div v-if="featuredForm.esDestacado">
              <v-divider class="mb-6"></v-divider>
              
              <div class="video-preview-section mb-6" v-if="featuredForm.videoUrl">
                 <div class="preview-label mb-2"><i class="fas fa-eye mr-2"></i> Vista previa del video:</div>
                 <div class="video-container rounded-lg overflow-hidden border">
                    <video :src="featuredForm.videoUrl" autoplay muted loop class="w-100 d-block" style="height: 150px; object-fit: cover;"></video>
                 </div>
              </div>

              <v-text-field
                v-model="featuredForm.videoUrl"
                label="URL del Video (MP4)"
                placeholder="Ej: /imagenes/servicios/promo.mp4"
                variant="outlined"
                rounded="lg"
                color="#ee6f38"
                prepend-inner-icon="mdi-video"
              >
                <template #prepend-inner><i class="fas fa-link mr-2" style="color:#ee6f38"></i></template>
              </v-text-field>

              <div class="file-upload-concept p-4 bg-orange-lighten-5 rounded-lg border-dashed text-center">
                 <i class="fas fa-cloud-upload-alt fa-2x mb-2" style="color:#ee6f38"></i>
                 <div class="text-caption font-weight-bold">O sube un archivo directamente</div>
                 <input type="file" ref="fileInput" hidden @change="handleFileUpload">
                 <v-btn color="#ee6f38" variant="tonal" size="small" class="mt-2" @click="$refs.fileInput.click()">
                    Seleccionar Archivo
                 </v-btn>
              </div>
            </div>
          </v-expand-transition>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" rounded="lg" @click="dialogFeatured = false">Cancelar</v-btn>
          <v-btn 
            color="#ee6f38" 
            variant="flat" 
            rounded="lg" 
            class="px-6 text-white" 
            :loading="isSaving"
            @click="saveFeaturedSettings"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useServiceStore } from '@/stores/services';
import { useCategoriaServicioStore } from '@/stores/CategoriaServicio';

const servicioStore = useServiceStore();
const categoriaServicioStore = useCategoriaServicioStore();

const dialogFeatured = ref(false);
const dialogEdit = ref(false);
const dialogDelete = ref(false);

const selectedService = ref(null);
const isSaving = ref(false);
const isDeleting = ref(false);

const featuredForm = reactive({
  esDestacado: false,
  videoUrl: ''
});

const editForm = reactive({
  id: null,
  nombre: '',
  descripcion: '',
  precio: 0,
  duracionAprox: '',
  categoriaId: null
});

const formatPrecio = (valor) => {
  if (!valor) return '0';
  return Number(valor).toLocaleString('es-CO');
};

const formatDuracion = (time) => {
  if (!time) return '00:00';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  return `${parts[0]}:${parts[1]}`;
};

const nombreCategoria = (id) => {
  if (!id) return '';
  const cat = categoriaServicioStore.categoriasServicio.find(c => c.id === id);
  return cat ? cat.nombre : '';
};

// 🌟 GESTIÓN DE DESTACADOS
const handleFeaturedClick = (servicio) => {
  // ✅ Validación INMEDIATA del límite de 3
  const destacadosAcuales = servicioStore.services.filter(s => s.esDestacado);
  const estaDestacado = !!servicio.esDestacado;
  
  if (!estaDestacado && destacadosAcuales.length >= 3) {
    alert('⚠️ Límite alcanzado: Ya tienes 3 servicios destacados en la página principal. Por favor, desmarca uno primero.');
    return;
  }

  selectedService.value = servicio;
  featuredForm.esDestacado = estaDestacado;
  featuredForm.videoUrl = servicio.videoUrl || '';
  dialogFeatured.value = true;
};

const saveFeaturedSettings = async () => {
  if (!selectedService.value) return;

  isSaving.value = true;
  try {
    await servicioStore.updateService(selectedService.value.id, {
      esDestacado: featuredForm.esDestacado,
      videoUrl: featuredForm.videoUrl
    });
    dialogFeatured.value = false;
  } catch (error) {
    console.error('Error saving settings:', error);
  } finally {
    isSaving.value = false;
  }
};

// 📝 GESTIÓN DE EDICIÓN
const openEditDialog = (servicio) => {
  selectedService.value = servicio;
  Object.assign(editForm, {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precio: servicio.precio,
    duracionAprox: servicio.duracionAprox,
    categoriaId: servicio.categoriaId
  });
  dialogEdit.value = true;
};

const saveServiceEdit = async () => {
  if (!editForm.id) return;
  isSaving.value = true;
  try {
    const payload = { ...editForm };
    payload.precio = parseFloat(payload.precio) || 0;
    
    // Asegurar que la duración tenga el formato correcto (HH:mm:ss) si solo se envían HH:mm
    if (/^\d{2}:\d{2}$/.test(payload.duracionAprox)) {
      payload.duracionAprox = payload.duracionAprox + ':00';
    }

    delete payload.id;
    await servicioStore.updateService(editForm.id, payload);
    dialogEdit.value = false;
  } catch (error) {
    console.error('Error updating service:', error);
  } finally {
    isSaving.value = false;
  }
};

// 🗑️ GESTIÓN DE ELIMINACIÓN
const openDeleteDialog = (servicio) => {
  selectedService.value = servicio;
  dialogDelete.value = true;
};

const handleDelete = async () => {
  if (!selectedService.value) return;
  isDeleting.value = true;
  try {
    await servicioStore.deleteService(selectedService.value.id);
    dialogDelete.value = false;
  } catch (error) {
    console.error('Error deleting service:', error);
  } finally {
    isDeleting.value = false;
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Simulación: en un entorno real aquí se subiría a S3/Firebase
    featuredForm.videoUrl = `/imagenes/servicios/${file.name}`;
    alert(`Simulación: Archivo "${file.name}" seleccionado localmente.`);
  }
};


onMounted(async () => {
  if (categoriaServicioStore.categoriasServicio.length === 0) {
    await categoriaServicioStore.getCategoriasServicio();
  }
  await servicioStore.getServices();
});
</script>

<style scoped>
/* ── Estilos Base ── */
.brand-card { border: none; overflow: hidden; }

/* ── Form Header ── */
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

.new-service-btn {
  background: white !important; color: #ee6f38 !important;
  font-weight: 700 !important; text-transform: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* ── Table Styling ── */
.table-header {
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: space-between;
}
.table-title { font-size: 1.1rem; font-weight: 700; color: #333; display: flex; align-items: center; }

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
.row-featured { background: #fff9f5 !important; }

.serv-nombre { font-weight: 700; color: #333; font-size: 0.95rem; margin-bottom: 2px; }

.serv-desc-container {
  max-width: 320px;
  cursor: help;
}

.serv-desc-text {
  font-size: 0.8rem;
  color: #777;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.serv-price { font-weight: 800; color: #ee6f38; font-size: 1rem; }

.category-pill {
  background: #f8f9fa !important; border: 1px solid #e9ecef;
  color: #666 !important; font-weight: 700 !important; font-size: 0.7rem !important;
  height: 24px;
}

.duration-wrap { font-size: 0.85rem; color: #555; font-weight: 600; }

/* ── Dialog ── */
.dialog-header {
  background: linear-gradient(135deg, #ee6f38 0%, #d45a22 100%);
  padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;
}
.dialog-icon {
  width: 44px; height: 44px; background: white; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; margin-right: 16px;
  font-size: 20px;
}
.text-orange { color: #ee6f38; }
.color-brand { color: #ee6f38; }

.bg-orange-lighten-5 { background-color: #fff8f1; }
.border-dashed { border: 2px dashed #ee6f38; }

/* ── Empty State ── */
.empty-state {
  text-align: center; padding: 80px 20px;
}
.empty-state i { font-size: 4rem; color: #fde8d8; margin-bottom: 20px; display: block; }
.empty-state p { font-size: 1.1rem; color: #777; font-weight: 500; }

@media (max-width: 768px) {
  .th-hide-sm { display: none; }
}
</style>
