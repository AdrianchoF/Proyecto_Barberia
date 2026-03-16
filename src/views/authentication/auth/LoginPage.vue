<script setup lang="ts">
import AuthLogin from '../authForms/AuthLogin.vue';
</script>

<template>
  <v-container fluid class="auth-page-container fill-height pa-0">
    <v-row no-gutters class="h-100 w-100 align-center justify-center">
      <v-col cols="12" sm="8" md="6" lg="4" class="px-4">
        
        <v-card class="auth-card elevation-24">
          <div class="auth-header text-center">
            <a href="/">
              <img src="/public/imagenes/logo/logo2.png" alt="Logo StyleHub" class="auth-logo" />
            </a>
            <h2 class="auth-title mt-4">HOLA DE NUEVO</h2>
            <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>
          </div>
          
          <v-card-text class="auth-body">
            <AuthLogin :is-modal="false" />
            
            <div class="auth-footer text-center mt-6">
              <span class="text-grey">¿No tienes una cuenta?</span>
              <v-btn variant="text" to="/register" class="auth-link ml-2 px-2 text-none" :ripple="false">
                Regístrate aquí
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page-container {
  background: url('https://wallpapers.com/images/hd/barber-shop-background-d8q2uecwheabpqj0.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
  min-height: 100vh;
}

.auth-page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.8) 100%);
  z-index: 1;
}

.v-row {
  position: relative;
  z-index: 2;
}

.auth-card {
  background: rgba(18, 18, 18, 0.85) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 20px !important;
  color: white;
  overflow: hidden;
  padding: 10px;
}

.auth-header {
  padding: 30px 20px 10px;
}

.auth-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 0 10px rgba(238, 111, 56, 0.3));
  transition: transform 0.3s ease;
}

.auth-logo:hover {
  transform: scale(1.05);
}

.auth-body {
  padding: 0 30px 30px;
}

.auth-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 5px;
  color: white;
}

.auth-subtitle {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.auth-footer {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.auth-link {
  color: #ee6f38 !important;
  font-weight: 700;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: white !important;
  text-decoration: underline;
  background: transparent !important;
}
</style>
