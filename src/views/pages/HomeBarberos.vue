<template>
  <section id="barberos-section" class="barber-wrapper py-16">
    <v-container fluid>
      <div class="text-center mb-12 header-animation">
        <span class="section-tagline">NUESTROS MAESTROS</span>
        <h2 class="section-title-modern">ARTISTAS DEL <span class="text-orange">ESTILO</span></h2>
        <div class="title-underline"></div>
        <p class="section-sub-desc mx-auto mt-6">
          "En StyleHub, nuestros barberos no solo dominan las tijeras, entienden tu actitud. 
          Déjalo en manos de quienes viven para transformar tu imagen."
        </p>
      </div>

      <v-row v-if="barberStore.loading" justify="center" class="my-10">
        <v-progress-circular indeterminate color="#ee6f38" size="64" />
      </v-row>

      <!-- Scroll Horizontal Nativo y Pulido -->
      <div v-else class="barber-scroll-area">
        <div class="barber-track" :class="{ 'center-content': barberStore.barbers?.length <= 4 }">
          <div 
            v-for="barbero in barberStore.barbers" 
            :key="barbero.id" 
            class="barber-item"
          >
            <v-card class="barber-profile-card" rounded="xl" elevation="0">
              <div class="image-wrapper">
                <v-img 
                  :src="barbero.foto || '/imagenes/barberos/default.png'" 
                  cover
                  class="profile-img"
                  height="380"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-darken-4">
                      <v-progress-circular indeterminate color="orange" />
                    </div>
                  </template>
                </v-img>
                <div class="barber-experience-badge">
                  <i class="fas fa-medal mr-1"></i> E XP
                </div>
              </div>

              <v-card-text class="card-content">
                <h3 class="barber-name">{{ barbero.nombre }} {{ barbero.apellido }}</h3>
                <span class="barber-role">Barbero Profesional</span>
                
                <div class="social-links-mini">
                   <v-btn icon size="x-small" variant="text" color="white" class="social-btn-card"><i class="fab fa-instagram"></i></v-btn>
                   <v-btn icon size="x-small" variant="text" color="white" class="social-btn-card"><i class="fab fa-facebook-f"></i></v-btn>
                </div>

                <v-btn 
                  block 
                  class="btn-book-barber" 
                  rounded="pill"
                  variant="flat"
                  @click="agendarCon(barbero)"
                >
                  RESERVAR TURNO
                </v-btn>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>

      <!-- Indicador de Scroll Visual (Solo Mobile) -->
      <div v-if="barberStore.barbers?.length > 1" class="scroll-helper mobile-only mt-6">
        <i class="fas fa-arrows-alt-h mr-2"></i> Desliza para conocer al equipo
      </div>
    </v-container>

    <VistareservacitaBarbero v-model="showModal" />

    <v-snackbar v-model="mostrarError" color="error" timeout="4000" location="top">
      <i class="fas fa-exclamation-circle mr-2"></i> {{ mensajeError }}
    </v-snackbar>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBarberStore } from '@/stores/barber';
import { useReservaBarberoStore } from '@/stores/reservaBarbero';
import VistareservacitaBarbero from './VistareservacitaBarbero.vue';

const barberStore = useBarberStore();
const reservaBarberoStore = useReservaBarberoStore();
const showModal = ref(false);
const mostrarError = ref(false);
const mensajeError = ref('');

const agendarCon = async (barbero) => {
  try {
    reservaBarberoStore.resetReserva();
    const horarios = await barberStore.getHorariosBarbero(barbero.id);
    if (!horarios || horarios.length === 0) {
      mensajeError.value = `${barbero.nombre} no tiene horarios disponibles hoy.`;
      mostrarError.value = true;
      return;
    }
    reservaBarberoStore.inicializarConBarbero(barbero, horarios);
    showModal.value = true;
  } catch (error) {
    mensajeError.value = 'Error al cargar horarios. Intenta de nuevo.';
    mostrarError.value = true;
  }
};

watch(showModal, (val) => {
  if (!val) reservaBarberoStore.resetReserva();
});

onMounted(async () => {
  await barberStore.getBarbers();
});
</script>

<style scoped>
.barber-wrapper {
  background-color: #121212;
  position: relative;
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

.section-sub-desc {
  max-width: 700px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.6;
}

/* 🌀 SCROLL AREA */
.barber-scroll-area {
  width: 100%;
  overflow-x: auto;
  padding: 30px 20px 50px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.barber-scroll-area::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.barber-track {
  display: flex;
  gap: 30px;
  padding: 0 5%;
  min-width: max-content;
}

.center-content {
  justify-content: center;
  padding: 0;
}

.barber-item {
  width: 320px;
}

/* 🎨 PROFILE CARD GLASS */
.barber-profile-card {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.4s ease;
  overflow: hidden;
  height: 100%;
}

.barber-profile-card:hover {
  transform: translateY(-12px);
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(238, 111, 56, 0.5) !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.profile-img {
  transition: transform 0.6s ease;
}

.barber-profile-card:hover .profile-img {
  transform: scale(1.08);
}

.barber-experience-badge {
  position: absolute;
  bottom: 0px;
  right: 0px;
  background: #ee6f38;
  color: white;
  padding: 6px 15px;
  font-size: 12px;
  font-weight: 800;
  z-index: 2;
  border-top-left-radius: 20px;
}

.card-content {
  padding: 24px !important;
  text-align: center;
}

.barber-name {
  font-weight: 800;
  font-size: 1.4rem;
  color: white;
  margin-bottom: 4px;
}

.barber-role {
  font-size: 0.85rem;
  color: #ee6f38;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 15px;
}

.social-links-mini {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-book-barber {
  background: transparent !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.1) !important;
  font-weight: 800 !important;
  height: 48px !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.barber-profile-card:hover .btn-book-barber {
  background: #ee6f38 !important;
  border-color: #ee6f38 !important;
  color: white !important;
}

.scroll-helper {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  font-weight: 600;
}

.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-only {
    display: block;
  }
  .barber-track {
    padding: 0 20px;
  }
}

@media (max-width: 600px) {
  .barber-item {
    width: 280px;
  }
}
</style>
