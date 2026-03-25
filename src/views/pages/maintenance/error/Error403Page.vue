<template>
  <div class="error-page d-flex align-center justify-center">
    <div class="text-center error-card pa-12">
      <!-- Icon -->
      <div class="icon-wrapper mb-6">
        <i class="fas fa-shield-halved"></i>
      </div>

      <!-- Code -->
      <h1 class="error-code mb-2">403</h1>
      <h2 class="error-title mb-4">Acceso Denegado</h2>
      <p class="error-desc mb-8">
        No tienes permisos para ver esta página.<br />
        Si crees que esto es un error, contacta con el administrador.
      </p>

      <v-btn
        color="orange"
        variant="flat"
        size="large"
        class="font-weight-black px-8"
        @click="goBack"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        Volver al inicio
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => {
  // Redirigir al dashboard correspondiente según el rol
  const role = (authStore.user as any)?.Role?.toLowerCase() || (authStore.user as any)?.role?.toLowerCase();
  if (role === 'administrador') {
    router.push('/dashboard/default');
  } else if (role === 'barbero') {
    router.push('/agenda-citas');
  } else {
    router.push('/reservar-cita');
  }
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.error-card {
  max-width: 500px;
}

.icon-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(238, 111, 56, 0.1);
  border: 2px solid rgba(238, 111, 56, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 42px;
  color: #ee6f38;
}

.error-code {
  font-size: 80px;
  font-weight: 900;
  color: #ee6f38;
  line-height: 1;
  letter-spacing: -4px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.error-desc {
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  line-height: 1.7;
}
</style>
