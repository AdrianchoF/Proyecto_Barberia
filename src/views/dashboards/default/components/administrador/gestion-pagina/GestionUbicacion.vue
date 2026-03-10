<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" elevation="4">
          <v-card-title class="pa-6 pb-0 d-flex align-center">
            <div class="icon-box mr-4">
              <i class="fas fa-map-marked-alt text-white"></i>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold">Ajustes del Mapa</h2>
              <p class="text-subtitle-2 text-grey-darken-1 mb-0">Selecciona la ubicación exacta de tu barbería en el mapa</p>
            </div>
          </v-card-title>

          <v-divider class="my-4 mx-6"></v-divider>

          <v-card-text class="pa-6">
            <v-alert
              type="success"
              variant="tonal"
              border="start"
              rounded="lg"
              class="mb-6"
            >
              <template #prepend>
                <i class="fas fa-mouse-pointer text-success mr-3" style="font-size: 24px"></i>
              </template>
              <strong>¡Es muy fácil!</strong> Solo tienes que hacer <strong>clic en el mapa</strong> o <strong>arrastrar el marcador</strong> naranja hasta la ubicación de tu local. Las coordenadas se actualizarán solas.
            </v-alert>

            <v-row class="mb-4">
              <v-col cols="12">
                <v-text-field
                  v-model="busquedaDireccion"
                  label="Buscar dirección exacta (Calle, Carrera, Barrio...)"
                  prepend-inner-icon="fas fa-search-location"
                  variant="outlined"
                  rounded="lg"
                  color="primary"
                  placeholder="Ej: Carrera 4 # 12-30, Monteria"
                  @keyup.enter="buscarDireccion"
                  hide-details
                >
                  <template #append-inner>
                    <v-btn
                      variant="flat"
                      color="primary"
                      rounded="lg"
                      size="small"
                      @click="buscarDireccion"
                      :loading="buscando"
                    >
                      <i class="fas fa-search mr-1"></i> Buscar
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <!-- Mapa Interactivo -->
              <v-col cols="12" md="8">
                <div id="admin-map" class="admin-map-container"></div>
              </v-col>

              <!-- Panel Lateral -->
              <v-col cols="12" md="4">
                 <v-form ref="form" v-if="configStore.config">
                    <v-text-field
                      v-model="formulario.nombre"
                      label="Nombre en el marcador"
                      prepend-inner-icon="fas fa-tag"
                      variant="outlined"
                      rounded="lg"
                      color="primary"
                      hint="Este nombre aparecerá cuando alguien toque el marcador en la web principal."
                      persistent-hint
                      class="mb-4"
                    ></v-text-field>

                    <v-item-group class="mb-6">
                       <v-card variant="tonal" color="grey" border rounded="lg" class="pa-4">
                          <div class="d-flex align-center mb-2">
                             <i class="fas fa-location-arrow mr-2 opacity-60"></i>
                             <span class="text-caption font-weight-bold text-uppercase">Coordenadas Actuales</span>
                          </div>
                          <div class="d-flex justify-space-between text-body-2">
                             <span>Latitud:</span>
                             <span class="font-weight-bold">{{ formulario.latitud.toFixed(6) }}</span>
                          </div>
                          <div class="d-flex justify-space-between text-body-2 mt-1">
                             <span>Longitud:</span>
                             <span class="font-weight-bold">{{ formulario.longitud.toFixed(6) }}</span>
                          </div>
                       </v-card>
                    </v-item-group>

                    <v-btn
                      block
                      color="primary"
                      size="large"
                      rounded="lg"
                      elevation="2"
                      :loading="configStore.loading"
                      @click="guardarCambios"
                    >
                      <i class="fas fa-save mr-2"></i> Actualizar Ubicación
                    </v-btn>

                    <p class="text-center text-caption text-grey mt-4">
                      <i class="fas fa-check-circle mr-1"></i> Los cambios se reflejarán inmediatamente en la página principal.
                    </p>
                 </v-form>

                 <div v-else-if="configStore.loading" class="d-flex flex-column align-center justify-center pa-10">
                    <v-progress-circular indeterminate color="primary" size="48" width="4"></v-progress-circular>
                    <p class="mt-4 text-grey">Cargando...</p>
                 </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" rounded="pill">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import { useConfiguracionStore } from '@/stores/configuracion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const configStore = useConfiguracionStore();
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const busquedaDireccion = ref('');
const buscando = ref(false);

let map: L.Map | null = null;
let marker: L.Marker | null = null;

const formulario = reactive({
  nombre: '',
  latitud: 8.752611,
  longitud: -75.884609,
});

const buscarDireccion = async () => {
  if (!busquedaDireccion.value.trim()) return;
  
  buscando.value = true;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&q=${encodeURIComponent(busquedaDireccion.value)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      formulario.latitud = lat;
      formulario.longitud = lon;

      if (map && marker) {
        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 16);
      }
      
      snackbarText.value = 'Dirección encontrada';
      snackbarColor.value = 'success';
      snackbar.value = true;
    } else {
      snackbarText.value = 'No se encontró la dirección. Intenta ser más específico.';
      snackbarColor.value = 'warning';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error buscando dirección:', error);
    snackbarText.value = 'Error al conectar con el servicio de mapas';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    buscando.value = false;
  }
};

onMounted(async () => {
  await configStore.fetchConfiguracion();
  if (configStore.config) {
    formulario.nombre = configStore.config.nombre;
    formulario.latitud = Number(configStore.config.latitud);
    formulario.longitud = Number(configStore.config.longitud);
  }
  
  // Esperar al siguiente tick para asegurar que el div del mapa existe
  await nextTick();
  initMap();
});

const initMap = () => {
  if (map) return;

  map = L.map('admin-map').setView([formulario.latitud, formulario.longitud], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Icono para la barbería (naranja para que resalte)
  const barberIcon = L.divIcon({
    className: 'custom-admin-marker',
    html: `
        <div class="marker-pin-admin">
            <div class="marker-icon-admin">✂️</div>
        </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });

  // Crear marcador draggable
  marker = L.marker([formulario.latitud, formulario.longitud], { 
    icon: barberIcon,
    draggable: true 
  }).addTo(map);

  // Evento cuando se arrastra el marcador
  marker.on('dragend', (e: L.LeafletEvent) => {
    const latLng = (e.target as L.Marker).getLatLng();
    formulario.latitud = latLng.lat;
    formulario.longitud = latLng.lng;
  });

  // Evento al hacer clic en el mapa
  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    formulario.latitud = lat;
    formulario.longitud = lng;
    if (marker) {
      marker.setLatLng([lat, lng]);
    }
  });
};

const guardarCambios = async () => {
  const exito = await configStore.updateConfiguracion(formulario);
  if (exito) {
    snackbarText.value = '¡Ubicación actualizada con éxito!';
    snackbarColor.value = 'success';
  } else {
    snackbarText.value = configStore.error || 'Error al guardar';
    snackbarColor.value = 'error';
  }
  snackbar.value = true;
};
</script>

<style scoped>
.icon-box {
  background: linear-gradient(135deg, #ee6f38, #ba4e20);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(238, 111, 56, 0.3);
}

.admin-map-container {
  height: 450px;
  width: 100%;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  z-index: 1;
}

/* Estilos para el marcador personalizado igual al de la principal pero ajustado */
:deep(.custom-admin-marker) {
    background: none;
    border: none;
}

:deep(.marker-pin-admin) {
    position: relative;
    background: #ee6f38;
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
}

:deep(.marker-icon-admin) {
    transform: rotate(45deg);
    font-size: 18px;
    color: white;
}

.opacity-60 { opacity: 0.6; }
</style>
