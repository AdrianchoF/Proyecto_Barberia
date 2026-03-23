<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const user = computed(() => authStore.user as any);
const userRole = computed(() => user.value?.Role || 'Usuario');
const userName = computed(() => user.value?.nombre || 'Invitado');
const userLastName = computed(() => user.value?.apellido || '');
const userEmail = computed(() => user.value?.email || '');
const userPhoto = computed(() => user.value?.foto || null);

// Role Badge Style
const roleTheme = computed(() => {
  switch (userRole.value.toLowerCase()) {
    case 'administrador': return { color: '#ee6f38', icon: 'fa-shield-halved' };
    case 'barbero': return { color: '#3498db', icon: 'fa-cut' };
    case 'cliente': return { color: '#2ecc71', icon: 'fa-user' };
    default: return { color: '#95a5a6', icon: 'fa-circle-user' };
  }
});
</script>

<template>
  <div class="pa-6 profile-container">
    <!-- User Info Header -->
    <div class="d-flex align-center mb-6">
      <v-avatar size="60" class="profile-avatar-large mr-4">
        <v-img v-if="userPhoto" :src="userPhoto" :alt="userName" cover />
        <i v-else class="fas fa-user-circle" style="font-size: 50px; color: #ee6f38;"></i>
      </v-avatar>
      <div>
        <h4 class="text-h6 font-weight-bold mb-0 text-themed">{{ userName }} {{ userLastName }}</h4>
        <div class="d-flex align-center mt-1">
          <v-chip size="x-small" :color="roleTheme.color" variant="flat" class="px-2 font-weight-black">
            <i :class="['fas', roleTheme.icon, 'mr-1']"></i>
            {{ userRole }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Contact Info -->
    <div class="user-meta-info mb-6 pa-3 rounded-lg">
      <div class="d-flex align-center mb-2">
        <i class="fas fa-envelope mr-3 opacity-50 text-themed" style="width: 16px;"></i>
        <span class="text-caption text-themed-secondary">{{ userEmail }}</span>
      </div>
      <div v-if="user?.telefono" class="d-flex align-center">
        <i class="fas fa-phone mr-3 opacity-50 text-themed" style="width: 16px;"></i>
        <span class="text-caption text-themed-secondary">{{ user.telefono }}</span>
      </div>
    </div>

    <v-divider class="mb-4 theme-divider"></v-divider>

    <!-- Menu Actions -->
    <v-list class="bg-transparent pa-0">
      <v-list-item
        rounded="lg"
        class="mb-2 menu-item"
        link
      >
        <template v-slot:prepend>
          <div class="icon-box mr-4">
            <i class="fas fa-user-gear"></i>
          </div>
        </template>
        <v-list-item-title class="text-subtitle-2 font-weight-bold text-themed">Mi Perfil</v-list-item-title>
        <v-list-item-subtitle class="text-caption text-themed-secondary">Ajustes de cuenta</v-list-item-subtitle>
      </v-list-item>

      <v-list-item
        v-if="userRole.toLowerCase() === 'cliente'"
        rounded="lg"
        class="mb-2 menu-item"
        link
      >
        <template v-slot:prepend>
          <div class="icon-box mr-4">
            <i class="fas fa-calendar-check"></i>
          </div>
        </template>
        <v-list-item-title class="text-subtitle-2 font-weight-bold text-themed">Mis Citas</v-list-item-title>
        <v-list-item-subtitle class="text-caption text-themed-secondary">Gestionar reservas</v-list-item-subtitle>
      </v-list-item>

      <v-divider class="my-4 theme-divider"></v-divider>

      <v-list-item
        @click="handleLogout"
        rounded="lg"
        class="logout-item"
        link
      >
        <template v-slot:prepend>
          <div class="icon-box logout-icon-box mr-4">
            <i class="fas fa-arrow-right-from-bracket"></i>
          </div>
        </template>
        <v-list-item-title class="text-subtitle-2 font-weight-black text-error">CERRAR SESIÓN</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped lang="scss">
.profile-container {
  background: transparent;
}

.text-themed {
  color: rgb(var(--v-theme-on-surface));
}

.text-themed-secondary {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.theme-divider {
  border-color: rgba(var(--v-border-color), 0.1) !important;
}

.profile-avatar-large {
  border: 3px solid #ee6f38;
  padding: 3px;
  background: rgba(var(--v-theme-on-surface), 0.05) !important;
}

.user-meta-info {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.menu-item {
  transition: all 0.2s ease;
  color: rgb(var(--v-theme-on-surface)) !important;
  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.05) !important;
    .icon-box {
      color: #ee6f38;
      background: rgba(238, 111, 56, 0.1);
    }
  }
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition: all 0.2s ease;
  font-size: 16px;
}

.logout-item {
  &:hover {
    background: rgba(244, 67, 54, 0.05) !important;
    .logout-icon-box {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }
  }
}

.logout-icon-box {
  color: #f44336;
}
</style>