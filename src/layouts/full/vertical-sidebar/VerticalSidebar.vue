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
  const esBarbero = authStore.user && (authStore.user as any).esBarbero === true;

  switch (role) {
    case 'super-administrador':
      menu.value = menus.menusuperadmin;
      break;
    case 'administrador':
      // Si el Admin es también Barbero, le añadimos su sección de agenda al menú
      const adminMenu = [...menus.menuadministrador];
      if (esBarbero) {
        adminMenu.push({ divider: true });
        adminMenu.push({ header: 'Agenda Personal' });
        adminMenu.push((menus.menubarbero as any[]).find((item) => item.title === 'Mi agenda') || menus.menubarbero[5]); 
      }
      menu.value = adminMenu;
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
const isSuperAdmin = computed(() => {
  return (authStore.user as any)?.Role?.toLowerCase() === 'super-administrador';
});
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
      <div v-if="isSuperAdmin" class="saas-branding d-flex align-center">
        <div class="saas-logo-icon mr-2">
          <i class="fas fa-server"></i>
        </div>
        <div class="saas-text">
          <div class="saas-name">SaaS CONTROL</div>
          <div class="saas-status">DEV OPS</div>
        </div>
      </div>
      <img v-else src="/imagenes/logo/logo2.png" alt="Logo" class="sidebar-logo" />
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
  background-color: rgb(var(--v-theme-surface));
  border-right: 1px solid rgb(var(--v-theme-borderLight)) !important;
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
  border-color: rgb(var(--v-theme-borderLight));
  opacity: 1;
}

/* Customize the scrollbar padding */
.scrollnavbar {
  height: calc(100vh - 90px);
}

/* SaaS Branding Styles */
.saas-branding {
  padding: 10px 15px;
  background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.saas-logo-icon {
  font-size: 24px;
}

.saas-name {
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.saas-status {
  font-size: 0.6rem;
  opacity: 0.7;
  font-weight: 700;
  text-transform: uppercase;
}
</style>