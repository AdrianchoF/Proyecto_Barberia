<template>
  <section id="ubicacion-section" class="location-wrapper py-16">
    <v-container>
      <!-- Header de la Sección -->
      <div class="text-center mb-12 header-animation">
        <span class="section-tagline">ENCUÉNTRANOS</span>
        <h2 class="section-title-modern">¿CÓMO <span class="text-orange">LLEGAR?</span></h2>
        <div class="title-underline"></div>
      </div>

      <v-row class="mt-8">
        <!-- Columna del Mapa -->
        <v-col cols="12" lg="8" class="mb-8 mb-lg-0">
          <div class="map-container-glass">
            <div id="map-home" class="map-element"></div>
            
            <!-- Controles Flotantes sobre el Mapa (Glassmorphism) -->
            <div class="map-overlay-controls">
              <div class="search-box-glass">
                <input 
                  v-model="origenTexto" 
                  placeholder="Tu dirección o barrio..." 
                  class="search-input"
                  @keyup.enter="calculateRoute"
                />
                <v-btn icon variant="text" color="orange" @click="calculateRoute">
                  <i class="fas fa-search"></i>
                </v-btn>
              </div>
              
              <div class="quick-actions mt-3">
                <v-btn size="small" rounded="pill" color="#ee6f38" class="mr-2 px-4 action-btn btn-orange" @click="usarMiUbicacion">
                  <i class="fas fa-location-arrow mr-1"></i> MI UBICACIÓN
                </v-btn>
                <v-btn 
                  size="small" 
                  rounded="pill" 
                  :color="isTracking ? 'error' : 'white'" 
                  class="btn-tracking px-4 action-btn"
                  @click="toggleTracking"
                >
                  <i class="fas fa-crosshairs mr-1"></i> {{ isTracking ? 'DETENER RASTREO' : 'SEGUIR RASTREO' }}
                </v-btn>
                <v-btn v-if="routingControl" size="small" rounded="pill" color="white" class="ml-2 px-4 action-btn" @click="clearRoute">
                  <i class="fas fa-times mr-1"></i> LIMPIAR
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Columna de Información -->
        <v-col cols="12" lg="4">
          <v-card class="contact-card-glass pa-8" rounded="xl" elevation="0">
            <h3 class="contact-title mb-6">StyleHub <span class="text-orange">Barber Shop</span></h3>
            
            <div class="contact-list">
              <div class="contact-item">
                <div class="icon-circle">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-content">
                  <span class="label">UBICACIÓN</span>
                  <p class="value">{{ barberNombre }}</p>
                  <small class="sub-value">Montería, Córdoba</small>
                </div>
              </div>

              <div class="contact-item">
                <div class="icon-circle">
                  <i class="fas fa-phone-alt"></i>
                </div>
                <div class="info-content">
                  <span class="label">RESERVACIONES</span>
                  <p class="value">+57 123 456 7890</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="icon-circle">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="info-content">
                  <span class="label">HORARIOS</span>
                  <p class="value">Lunes - Sábado</p>
                  <small class="sub-value">8:00 AM - 8:00 PM</small>
                </div>
              </div>
            </div>

            <v-divider class="my-8 border-grey-darken-3"></v-divider>

            <v-btn 
              block 
              class="btn-google-maps" 
              size="x-large" 
              rounded="xl" 
              @click="openInGoogleMaps"
            >
              <i class="fab fa-google-play mr-2"></i> ABRIR EN GOOGLE MAPS
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useConfiguracionStore } from '@/stores/configuracion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const configStore = useConfiguracionStore();

// Coordenadas Dinámicas
const barberLat = computed(() => configStore.config?.latitud || 8.752611);
const barberLng = computed(() => configStore.config?.longitud || -75.884609);
const barberNombre = computed(() => configStore.config?.nombre || 'StyleHub Barber Shop');

const origenTexto = ref('');
const isTracking = ref(false);
let map = null;
let routingControl = null;
let userMarker = null;
let barberMarker = null;
let watchId = null;
let origenCoords = null;

const barberIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

const userIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const initMap = () => {
  if (map) map.remove();

  map = L.map('map-home', {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView([barberLat.value, barberLng.value], 15);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  barberMarker = L.marker([barberLat.value, barberLng.value], { icon: barberIcon })
    .addTo(map)
    .bindPopup(`<b>${barberNombre.value}</b>`)
    .openPopup();
};

const getCoordsFromAddress = async (address) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
  } catch (e) { return null; }
};

const calculateRoute = async () => {
  let start = null;
  if (origenCoords) {
    start = L.latLng(origenCoords[0], origenCoords[1]);
  } else if (origenTexto.value) {
    const coords = await getCoordsFromAddress(origenTexto.value);
    if (!coords) return alert('No se encontró la dirección.');
    start = L.latLng(coords[0], coords[1]);
  } else {
    return alert('Ingresa una dirección o usa tu ubicación.');
  }

  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [start, L.latLng(barberLat.value, barberLng.value)],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: '#ee6f38', weight: 6, opacity: 0.8 }] },
    createMarker: () => null,
    show: true,
    collapsible: true
  }).addTo(map);

  // Marcador de usuario
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker(start, { icon: userIcon }).addTo(map).bindPopup('Tu ubicación');

  const bounds = L.latLngBounds([start, [barberLat.value, barberLng.value]]);
  map.fitBounds(bounds, { padding: [50, 50] });
};

const usarMiUbicacion = () => {
  if (!navigator.geolocation) return alert('Geolocalización no soportada');
  origenTexto.value = 'Obteniendo ubicación...';
  navigator.geolocation.getCurrentPosition((pos) => {
    origenCoords = [pos.coords.latitude, pos.coords.longitude];
    origenTexto.value = 'Mi ubicación actual';
    calculateRoute();
  });
};

const toggleTracking = () => {
  if (isTracking.value) {
    navigator.geolocation.clearWatch(watchId);
    isTracking.value = false;
  } else {
    isTracking.value = true;
    watchId = navigator.geolocation.watchPosition((pos) => {
      origenCoords = [pos.coords.latitude, pos.coords.longitude];
      if (routingControl) calculateRoute();
    });
  }
};

const clearRoute = () => {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  origenTexto.value = '';
  origenCoords = null;
  map.setView([barberLat.value, barberLng.value], 15);
};

const openInGoogleMaps = () => {
  window.open(`https://www.google.com/maps?q=${barberLat.value},${barberLng.value}`, '_blank');
};

onMounted(async () => {
  await configStore.fetchConfiguracion();
  initMap();
});

onUnmounted(() => {
  if (map) map.remove();
  if (watchId) navigator.geolocation.clearWatch(watchId);
});
</script>

<style scoped>
.location-wrapper {
  background-color: #121212;
}

.section-tagline {
  color: #ee6f38;
  font-weight: 700;
  letter-spacing: 3px;
  font-size: 13px;
  display: block;
  margin-bottom: 8px;
}

.section-title-modern {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: white;
  margin-bottom: 15px;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: #ee6f38;
  margin: 0 auto;
  border-radius: 2px;
}

/* 🖼️ MAP CONTAINER */
.map-container-glass {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

.map-element {
  height: 550px;
  width: 100%;
  border-radius: 22px;
  z-index: 1;
}

/* 🎮 MAP CONTROLS OVERLAY */
.map-overlay-controls {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 1000;
  max-width: calc(100% - 60px);
}

.search-box-glass {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.75); /* Darker background for light map */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 5px 10px 5px 20px;
  width: 320px;
  max-width: 100%;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  font-weight: 800 !important;
  font-size: 11px !important;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;
  color: black !important; /* Force black text for all except orange/error */
}

.btn-orange, .v-btn--color-error {
  color: white !important;
}

:deep(.leaflet-routing-container) {
  background: white !important;
  color: #333 !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  border: none !important;
  max-width: 280px !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  font-family: 'Outfit', sans-serif !important;
  padding: 15px !important;
}

:deep(.leaflet-routing-alt) {
  max-height: none !important;
}

:deep(.leaflet-routing-instruction-distance) {
  color: #ee6f38 !important;
  font-weight: bold;
}

/* 💎 CONTACT CARD */
.contact-card-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: white !important;
  height: 100%;
}

.contact-title {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.2;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.contact-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.icon-circle {
  width: 45px;
  height: 45px;
  background: rgba(238, 111, 56, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-circle i {
  color: #ee6f38;
  font-size: 18px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 11px;
  font-weight: 800;
  color: #ee6f38;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.sub-value {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.btn-google-maps {
  background: white !important;
  color: #121212 !important;
  font-weight: 800 !important;
  transition: all 0.3s ease;
}

.btn-google-maps:hover {
  background: #ee6f38 !important;
  color: white !important;
  transform: translateY(-3px);
}

@media (max-width: 1264px) {
  .map-element {
    height: 450px;
  }
}

@media (max-width: 600px) {
  .map-element {
    height: 350px;
  }
  .search-box-glass {
    width: 100%;
  }
  .map-overlay-controls {
    top: 20px;
    left: 20px;
  }
}
</style>