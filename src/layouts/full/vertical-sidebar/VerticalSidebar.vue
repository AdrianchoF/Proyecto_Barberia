<script setup lang="ts">
import { shallowRef, ref, onMounted, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { useAuthStore } from '@/stores/auth';
import menus from "../../../config/dashboardConfig";
import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';

const customizer = useCustomizerStore();
const authStore = useAuthStore();

type MenuItem = {
  header?: string;
  hiddenOnCollapse?: boolean;
  href?: string;
  title?: string;
  icon?: string | any; 
  divider?: boolean;
  children?: MenuItem[];
};

const menu = ref<MenuItem[]>([]);

onMounted(() => {
  const role = (authStore.user && typeof authStore.user === 'object' && typeof (authStore.user as any).Role === 'string')
    ? ((authStore.user as any).Role as string).toLowerCase()
    : '';
  switch (role) {
    case 'administrador':
      menu.value = menus.menuadministrador;
      break;
    case 'barbero':
      menu.value = menus.menubarbero;
      break;
    case 'cliente':
      menu.value = menus.menucliente;
      break;
    default:
      menu.value = [];
  }
});

const sidebarMenu = computed(() => menu.value);
</script>

<template>
  <v-navigation-drawer
    left
    v-model="customizer.Sidebar_drawer"
    elevation="4"
    width="290"
    rail-width="75"
    mobile-breakpoint="lg"
    app
    class="brand-sidebar"
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!-- Logo -->
    <div class="d-flex justify-center align-center my-6 logo-container">
      <img src="/imagenes/logo/logo2.png" alt="Logo" class="sidebar-logo" />
    </div>
    
    <!-- Menu -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4 pt-0">
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <v-divider class="my-3 sidebar-divider" v-else-if="item.divider" />
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <NavItem :item="item" v-else class="leftPadding" />
        </template>
      </v-list>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<style scoped>
.brand-sidebar {
  background-color: #ffffff;
  border-right: 1px solid #f0f0f0 !important;
}

.logo-container {
  padding: 0 20px;
}

.sidebar-logo {
  width: 140px;
  max-width: 100%;
  transition: all 0.3s;
}

.sidebar-divider {
  border-color: #f0f0f0;
  opacity: 1;
}

/* Customize the scrollbar padding */
.scrollnavbar {
  height: calc(100vh - 90px);
}
</style>