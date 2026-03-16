<template>
  <section id="nosotros-section" class="nosotros-wrapper">
    <v-container class="py-16">
      <div class="text-center mb-12 header-animation">
        <span class="section-tagline">NUESTRA HISTORIA</span>
        <h2 class="section-title-modern">¿QUIÉNES <span class="text-orange">SOMOS?</span></h2>
        <div class="title-underline"></div>
      </div>

      <v-row align="center" class="mt-8">
        <!-- Columna de Imagen -->
        <v-col cols="12" md="6" class="reveal-on-scroll">
          <div class="image-stack">
            <div class="main-image-container">
              <v-img
                src="https://i.pinimg.com/736x/14/24/b0/1424b074d240494a95e728a09282e688.jpg"
                alt="Nosotros"
                class="rounded-xl main-image"
                cover
                height="500"
              ></v-img>
              <div class="experience-badge">
                <span class="number">10+</span>
                <span class="text">AÑOS DE<br>EXPERIENCIA</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Columna de Texto -->
        <v-col cols="12" md="6" class="reveal-on-scroll">
          <div class="content-card-glass pa-8">
            <p class="about-text mb-8">
              En <span class="text-orange font-weight-bold">StyleHub</span>, no solo cortamos cabello; esculpimos confianza. 
              Fundada con la pasión por el arte de la barbería clásica fusionada con las tendencias más vanguardistas del mundo moderno. 
              Nuestro compromiso es brindar una experiencia de cuidado personal excepcional en un ambiente diseñado para el hombre actual.
            </p>

            <v-row class="g-4 mb-8">
              <v-col cols="12" sm="6">
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fas fa-eye"></i>
                  </div>
                  <div>
                    <h3 class="info-title">Visión</h3>
                    <p class="info-desc">Ser la cadena de barberías líder en innovación y estilo, marcando tendencia en cada ciudad.</p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fas fa-bullseye"></i>
                  </div>
                  <div>
                    <h3 class="info-title">Misión</h3>
                    <p class="info-desc">Transformar la imagen de nuestros clientes a través de la excelencia técnica y un servicio personalizado.</p>
                  </div>
                </div>
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap gap-4 mt-4">
              <v-btn
                variant="outlined"
                color="orange"
                rounded="pill"
                class="btn-policies"
                @click="dialog = true"
              >
                <i class="fas fa-scroll mr-2"></i> POLÍTICAS DE LA BARBERÍA
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialog de Políticas -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card class="glass-dialog pa-6">
        <v-card-title class="d-flex justify-between align-center">
          <span class="text-h5 font-weight-bold text-orange" style="color: white;">POLÍTICAS DEL SITIO</span>
          <v-btn icon variant="text" @click="dialog = false">
            <i class="fas fa-times text-white"></i>
          </v-btn>
        </v-card-title>
        <v-divider class="border-grey-darken-3 mb-4"></v-divider>
        <v-card-text class="text-grey-lighten-1 policy-content">
          <h4 class="text-white mb-2">1. Reservas y Cancelaciones</h4>
          <p class="mb-4" style="color: white;">Para garantizar un servicio puntual, solicitamos a nuestros clientes llegar 5 minutos antes de su cita. Las cancelaciones deben realizarse con al menos 2 horas de anticipación.</p>
          
          <h4 class="text-white mb-2">2. Higiene y Seguridad</h4>
          <p class="mb-4" style="color: white;">Cumplimos estrictamente con los protocolos de bioseguridad. Todas nuestras herramientas son esterilizadas después de cada uso.</p>
          
          <h4 class="text-white mb-2">3. Garantía de Servicio</h4>
          <p class="mb-4" style="color: white;">Si no quedas satisfecho con tu corte, tienes un plazo de 24 horas para regresar por ajustes sin costo adicional.</p>
          
          <h4 class="text-white mb-2">4. Privacidad</h4>
          <p style="color: white;">Tus datos personales son utilizados exclusivamente para la gestión de tus citas y mejorar tu experiencia con nosotros.</p>
        </v-card-text>
        <v-card-actions class="justify-end mt-4">
          <v-btn color="orange" variant="flat" rounded="pill" @click="dialog = false" block>
            ENTENDIDO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const dialog = ref(false);
</script>

<style scoped>
.nosotros-wrapper {
  background-color: #121212;
  position: relative;
  overflow: hidden;
}

/* 🏛️ SECTION HEADER (Similar a Servicios) */
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

/* 🖼️ IMAGE STACK */
.image-stack {
  position: relative;
  padding-right: 20px;
}

.main-image-container {
  position: relative;
  overflow: visible;
}

.main-image {
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.main-image:hover {
  transform: scale(1.02);
}

.experience-badge {
  position: absolute;
  bottom: -30px;
  right: -20px;
  background: #ee6f38;
  padding: 20px 30px;
  border-radius: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 15px 35px rgba(238, 111, 56, 0.4);
  z-index: 2;
  animation: float 4s ease-in-out infinite;
}

.experience-badge .number {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
}

.experience-badge .text {
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
  margin-top: 5px;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

/* 💎 CONTENT CARD */
.content-card-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px;
}

.about-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.info-icon {
  width: 45px;
  height: 45px;
  background: rgba(238, 111, 56, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ee6f38;
  font-size: 20px;
  flex-shrink: 0;
}

.info-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.info-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.btn-policies {
  font-weight: 700 !important;
  letter-spacing: 1px;
  height: 48px !important;
  transition: all 0.3s ease;
}

.btn-policies:hover {
  background: rgba(238, 111, 56, 0.1) !important;
  transform: translateY(-2px);
}

/* 🌀 DIALOG STYLE */
.glass-dialog {
  background: rgba(18, 18, 18, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 24px !important;
}

.policy-content {
  max-height: 400px;
  overflow-y: auto;
}

.policy-content::-webkit-scrollbar {
  width: 6px;
}

.policy-content::-webkit-scrollbar-thumb {
  background: rgba(238, 111, 56, 0.3);
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 960px) {
  .image-stack {
    margin-bottom: 60px;
    padding-right: 0;
  }
}
</style>
