<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userName = authStore.user?.nombre || 'Barber';

const notifications = ref([
  {
    title: `¡Bienvenido, ${userName}!`,
    time: 'Ahora',
    description: 'Gracias por usar StyleHub. Tu panel de control está listo.',
    icon: 'fa-star',
    color: '#ee6f38',
    isNew: true
  }
]);
</script>

<template>
  <div class="notification-container pa-6">
    <div class="d-flex align-center justify-space-between mb-6">
      <h6 class="text-h6 font-weight-bold text-themed">
        Notificaciones
        <v-chip color="orange" variant="flat" size="x-small" class="ml-2 font-weight-black">01</v-chip>
      </h6>
      <span class="text-caption text-orange clickable-link">Marcar todas como leídas</span>
    </div>

    <v-divider class="mb-4 opacity-10"></v-divider>

    <perfect-scrollbar style="max-height: 400px">
      <v-list class="bg-transparent pa-0">
        <v-list-item
          v-for="(item, i) in notifications"
          :key="i"
          class="notification-item mb-3 pa-4 rounded-xl"
          link
        >
          <template v-slot:prepend>
            <div class="icon-circle mr-4" :style="{ background: item.color + '20', color: item.color }">
              <i :class="['fas', item.icon]"></i>
            </div>
          </template>

          <div class="d-flex justify-space-between align-center mb-1">
            <h6 class="text-subtitle-2 font-weight-bold text-themed line-height-1">{{ item.title }}</h6>
            <span class="text-tiny text-themed-secondary">{{ item.time }}</span>
          </div>
          
          <p class="text-caption text-themed-secondary line-height-1-2">{{ item.description }}</p>

          <div v-if="item.isNew" class="mt-2">
            <v-chip size="x-small" color="orange" variant="tonal" class="font-weight-black">NUEVO</v-chip>
          </div>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>

    <v-divider class="my-4 opacity-10"></v-divider>

    <div class="text-center">
      <v-btn variant="text" color="orange" size="small" class="font-weight-black">VER TODAS LAS NOTIFICACIONES</v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification-container {
  background: transparent;
}

.text-themed {
  color: rgb(var(--v-theme-on-surface));
}

.text-themed-secondary {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.clickable-link {
  cursor: pointer;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
}

.notification-item {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.06) !important;
    border-color: #ee6f38;
  }
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.text-tiny {
  font-size: 10px;
}

.line-height-1 {
  line-height: 1.2;
}

.line-height-1-2 {
  line-height: 1.4;
}
</style>
