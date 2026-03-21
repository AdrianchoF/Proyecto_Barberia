<template>
  <section id="servicios-section" class="servicios-wrapper">
    <!-- Cinta Promocional Estilizada -->
    <div v-if="cintaServicios && cintaServicios.activo" class="promo-ticker-modern">
      <div class="ticker-content">
        <span v-for="n in 10" :key="n" class="ticker-text">
          <i class="fas fa-star mr-2"></i> {{ cintaServicios.texto }}
        </span>
      </div>
    </div>

    <v-container class="py-16">
      <div class="text-center mb-12 header-animation">
        <span class="section-tagline">NUESTRA EXPERIENCIA</span>
        <h2 class="section-title-modern">SERVICIOS <span class="text-orange">POPULARES</span></h2>
        <div class="title-underline"></div>
      </div>

      <v-row v-if="loading" justify="center" class="py-16">
        <v-progress-circular indeterminate color="#ee6f38" size="70" width="7" />
      </v-row>

      <v-row v-else justify="center" class="g-4">
        <v-col 
          v-for="(servicio, k) in serviciosDestacados" 
          :key="k" 
          cols="12" 
          sm="6" 
          md="4" 
          class="d-flex"
        >
          <v-card 
            class="service-card-glass" 
            rounded="xl" 
            elevation="0"
          >
            <div class="media-container">
              <video 
                v-if="servicio.videoUrl" 
                class="service-video" 
                autoplay 
                muted 
                loop 
                playsinline 
                :key="servicio.videoUrl"
              >
                <source :src="servicio.videoUrl" type="video/mp4" />
              </video>
              <div v-else class="video-placeholder">
                <i class="fas fa-cut"></i>
              </div>
              <div class="service-badge">
                 <i class="fas fa-crown"></i> TOP
              </div>
            </div>

            <v-card-text class="pa-6 pt-8">
              <h3 class="service-name">{{ servicio.nombre }}</h3>
              
              <div class="service-info-row">
                <span class="price-tag"><i class="fas fa-tag"></i> ${{ formatPrecio(servicio.precio) }}</span>
                <span class="time-tag"><i class="far fa-clock"></i> {{ formatDuration(servicio.duracionAprox) }}</span>
              </div>
              
              <p class="service-desc">{{ servicio.descripcion }}</p>

              <v-btn 
                block 
                class="btn-agendar-modern" 
                rounded="pill"
                @click="agendarServicio(servicio.id)"
              >
                RESERVAR AHORA
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-center mt-12">
        <v-btn 
          variant="outlined" 
          color="orange" 
          size="x-large" 
          rounded="xl" 
          class="btn-ver-mas-glass"
          @click="abrirModal"
        >
          VER CATÁLOGO COMPLETO <i class="fas fa-arrow-right ml-3"></i>
        </v-btn>
      </div>
    </v-container>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useServiceStore } from '@/stores/services';
import { useCintaStore } from '@/stores/cintas';

const servicioStore = useServiceStore();
const cintaStore = useCintaStore();
const loading = ref(false);

const serviciosDestacados = computed(() => {
  return servicioStore.services.filter(s => s.esDestacado).slice(0, 3);
});

const cintaServicios = computed(() => {
  return cintaStore.cintas.find(c => c.ubicacion === 'servicios');
});

const formatPrecio = (v) => v?.toLocaleString('es-CO') || '0';

const formatDuration = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return h === '00' ? `${m}m` : `${parseInt(h)}h ${m}m`;
};

const abrirModal = () => {
  window.dispatchEvent(new CustomEvent('open-reserva-dialog'));
};

const agendarServicio = (id) => {
  window.dispatchEvent(new CustomEvent('open-reserva-dialog', { detail: { serviceId: id } }));
};

onMounted(async () => {
  loading.value = true;
  try {
    if (servicioStore.services.length === 0) await servicioStore.getServices();
    if (cintaStore.cintas.length === 0) await cintaStore.getCintas();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.servicios-wrapper {
  background-color: #121212;
  position: relative;
  overflow: hidden;
}

/* 🎨 MODERN TICKER */
.promo-ticker-modern {
  background: linear-gradient(90deg, #ee6f38, #ff8c61);
  padding: 12px 0;
  overflow: hidden;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.ticker-content {
  display: flex;
  white-space: nowrap;
  animation: ticker-animation 30s linear infinite;
}

.ticker-text {
  color: white;
  font-weight: 800;
  font-size: 16px;
  text-transform: uppercase;
  margin-right: 50px;
  letter-spacing: 1px;
}

@keyframes ticker-animation {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 🏛️ SECTION HEADER */
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

/* 💎 GLASS CARDS */
.service-card-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.service-card-glass:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(238, 111, 56, 0.5) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.media-container {
  position: relative;
  height: 280px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.service-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.service-card-glass:hover .service-video {
  transform: scale(1.1);
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.2);
  font-size: 60px;
}

.service-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ee6f38;
  color: white;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 800;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(238, 111, 56, 0.4);
}

.service-name {
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.service-info-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.price-tag, .time-tag {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-tag i, .time-tag i {
  color: #ee6f38;
}

.service-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 25px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-agendar-modern {
  background: #ee6f38 !important;
  color: white !important;
  font-weight: 800 !important;
  height: 50px !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.btn-agendar-modern:hover {
  background: #ff7c4d !important;
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(238, 111, 56, 0.3);
}

.btn-ver-mas-glass {
  border-width: 2px !important;
  font-weight: 700 !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.btn-ver-mas-glass:hover {
  background: rgba(238, 111, 56, 0.1) !important;
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .media-container {
    height: 220px;
  }
}
</style>
