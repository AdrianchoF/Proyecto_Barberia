<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { useAuthStore } from '@/stores/auth';

// Dropdown Components
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import SearchDialog from './SearchDialog.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore();
const showSearchDialog = ref(false);

const user = computed(() => authStore.user as any);
const userName = computed(() => user.value?.nombre || 'Admin');
const userRole = computed(() => user.value?.Role || 'Administrator');
const userPhoto = computed(() => user.value?.foto || null);

// Role Badge Color
const roleColor = computed(() => {
  switch (userRole.value.toLowerCase()) {
    case 'administrador': return '#ee6f38';
    case 'barbero': return '#3498db';
    case 'cliente': return '#2ecc71';
    default: return '#95a5a6';
  }
});
</script>

<template>
  <v-app-bar elevation="0" height="70" class="header-glass">
    <!-- Sidebar Toggle (Desktop) -->
    <v-btn
      class="hidden-md-and-down ml-4"
      icon
      variant="text"
      @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
    >
      <i class="fas fa-bars-staggered header-icon" style="font-size: 20px;"></i>
    </v-btn>

    <!-- Sidebar Toggle (Mobile) -->
    <v-btn
      class="hidden-lg-and-up ml-2"
      icon
      variant="text"
      @click.stop="customizer.SET_SIDEBAR_DRAWER"
    >
      <i class="fas fa-bars-staggered header-icon" style="font-size: 20px;"></i>
    </v-btn>

    <!-- Search / Quick Search -->
    <div class="search-container d-none d-md-flex align-center ml-4 px-4 clickable" @click="showSearchDialog = true">
      <i class="fas fa-search mr-3 search-icon" style="font-size: 14px;"></i>
      <span class="text-caption search-text">Búsqueda rápida...</span>
      <v-spacer></v-spacer>
      <kbd class="search-kbd">⌘K</kbd>
    </div>

    <!-- Mobile Search Toggle -->
    <v-btn
      class="hidden-lg-and-up ml-2"
      icon
      variant="text"
      @click="showSearchDialog = true"
    >
      <i class="fas fa-search header-icon" style="font-size: 18px;"></i>
    </v-btn>

    <!-- Global Search Dialog -->
    <SearchDialog v-model="showSearchDialog" />

    <v-spacer />

    <!-- Right Side Actions -->
    <div class="d-flex align-center pr-4">
      
      <!-- Notifications -->
      <v-menu :close-on-content-click="false" transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn icon variant="text" class="mx-2 notification-btn" v-bind="props">
            <v-badge dot color="orange" offset-x="2" offset-y="2">
              <i class="fas fa-bell header-icon" style="font-size: 20px;"></i>
            </v-badge>
          </v-btn>
        </template>
        <v-sheet rounded="xl" width="350" elevation="24" class="dropdown-sheet mt-2">
          <NotificationDD />
        </v-sheet>
      </v-menu>

      <!-- User Profile -->
      <v-menu :close-on-content-click="false" transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn class="profile-pill-btn px-2 ml-2" variant="text" v-bind="props">
            <div class="d-flex align-center">
              <div class="text-right d-none d-sm-flex flex-column mr-3">
                <span class="text-subtitle-2 font-weight-bold line-height-1 text-themed">{{ userName }}</span>
                <span class="role-badge" :style="{ color: roleColor }">{{ userRole }}</span>
              </div>
              <v-avatar size="40" class="header-avatar">
                <v-img v-if="userPhoto" :src="userPhoto" :alt="userName" cover />
                <i v-else class="fas fa-user-circle header-icon" style="font-size: 32px;"></i>
              </v-avatar>
            </div>
          </v-btn>
        </template>
        <v-sheet rounded="xl" width="330" elevation="24" class="dropdown-sheet mt-2">
          <ProfileDD />
        </v-sheet>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<style scoped lang="scss">
.header-glass {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(12px) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important;
  transition: all 0.3s ease;
}

.search-container {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  height: 42px;
  width: 250px;
  transition: all 0.3s ease;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    border-color: #ee6f38;
  }
}

.search-text {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8 !important;
  font-weight: 600;
}

.search-icon {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.5;
}

.text-themed {
  color: rgb(var(--v-theme-on-surface)) !important;
}

.search-kbd {
  background: rgba(var(--v-theme-on-surface), 0.1);
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.line-height-1 {
  line-height: 1.2;
}

.role-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.header-avatar {
  border: 2px solid #ee6f38;
  background: rgba(var(--v-theme-on-surface), 0.05) !important;
  transition: all 0.3s ease;
}

.header-icon {
  color: rgb(var(--v-theme-on-surface));
  transition: all 0.3s ease;
}

.profile-pill-btn:hover .header-avatar {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(238, 111, 56, 0.3);
}

.dropdown-sheet {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
  overflow: hidden;
}

.notification-btn {
  transition: all 0.3s ease;
  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.05);
    .header-icon {
      color: #ee6f38;
    }
  }
}

.search-sheet {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
}
</style>
