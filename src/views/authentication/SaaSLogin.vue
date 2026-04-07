<script setup lang="ts">
import AuthLogin from './authForms/AuthLogin.vue';
</script>

<template>
  <v-container fluid class="saas-login-container fill-height pa-0">
    <div class="background-grid"></div>
    <v-row no-gutters class="h-100 w-100 align-center justify-center position-relative">
      <v-col cols="12" sm="8" md="6" lg="4" class="px-4">
        
        <v-card class="saas-card elevation-24">
          <div class="saas-header text-center">
            <div class="saas-icon-box">
              <i class="fas fa-server"></i>
            </div>
            <h1 class="saas-title mt-4">SaaS Control Center</h1>
            <p class="saas-subtitle">Developer & Operations Access</p>
          </div>
          
          <v-card-text class="saas-body">
            <!-- Usamos el mismo componente de login pero el diseño superior es diferente -->
            <AuthLogin :is-modal="false" />
            
            <div class="saas-footer text-center mt-6">
              <p class="text-caption text-grey">
                <i class="fas fa-shield-alt mr-1"></i> 
                Acceso restringido a personal autorizado.
              </p>
            </div>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.saas-login-container {
  background: radial-gradient(circle at center, #1a237e 0%, #0d1117 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 0;
}

.saas-card {
  background: rgba(13, 17, 23, 0.8) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(103, 58, 183, 0.3) !important;
  border-radius: 24px !important;
  color: white;
  padding: 10px;
  box-shadow: 0 0 40px rgba(106, 27, 154, 0.2);
}

.saas-header {
  padding: 40px 20px 20px;
}

.saas-icon-box {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #6a1b9a 0%, #311b92 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 30px;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.saas-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.saas-subtitle {
  color: #b39ddb;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.saas-body {
  padding: 20px 35px 35px;
}

.saas-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 25px;
}

/* Sobreescribir estilos de Vuetify si es necesario */
:deep(.v-btn--variant-flat) {
    background: linear-gradient(135deg, #6a1b9a 0%, #311b92 100%) !important;
}
</style>
