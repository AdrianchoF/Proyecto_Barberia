<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';

interface UserResult {
  id: number;
  nombre: string;
  apellido: string;
  role: string;
  foto?: string;
}

interface ServiceResult {
  id: number;
  nombre: string;
  precio: number;
  duracionAprox: string;
}

interface ProductResult {
  id: number;
  nombre: string;
  stock: number;
  precio_venta: number;
}

interface SearchResults {
  users: UserResult[];
  services: ServiceResult[];
  products: ProductResult[];
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const authStore = useAuthStore();
const searchQuery = ref('');
const results = ref<SearchResults>({
  users: [],
  services: [],
  products: []
});
const loading = ref(false);
const searchInput = ref<HTMLElement | null>(null);

const close = () => {
  emit('update:modelValue', false);
  searchQuery.value = '';
  results.value = { users: [], services: [], products: [] };
};

// Debounced search
let timeout: any = null;
watch(searchQuery, (newQuery) => {
  if (timeout) clearTimeout(timeout);
  if (!newQuery || newQuery.length < 2) {
    results.value = { users: [], services: [], products: [] };
    return;
  }

  loading.value = true;
  timeout = setTimeout(async () => {
    try {
      const { data } = await api.get(`/global-search?q=${searchQuery.value}`);
      results.value = data;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      loading.value = false;
    }
  }, 300);
});

const navigateTo = (path: string) => {
  router.push(path);
  close();
};

const handleResultClick = (item: any, type: string) => {
  if (type === 'user') {
    const role = item.role.toLowerCase();
    if (role === 'barbero') navigateTo(`/admin/barberos`); // Or detail page if exists
    else navigateTo(`/admin/clientes`); 
  } else if (type === 'service') {
    navigateTo('/admin/servicios');
  } else if (type === 'product') {
    navigateTo('/admin/productos');
  }
};

// Shortcut Logic (Ctrl+K)
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    emit('update:modelValue', true);
  }
  if (e.key === 'Escape' && props.modelValue) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <v-dialog
    v-model="props.modelValue"
    max-width="650"
    content-class="search-dialog-content"
    @click:outside="close"
  >
    <v-card class="search-card overflow-hidden">
      <!-- Search Input Header -->
      <div class="pa-4 d-flex align-center border-bottom">
        <i class="fas fa-magnifying-glass mr-3 text-primary" style="font-size: 1.2rem;"></i>
        <input
          v-model="searchQuery"
          ref="searchInput"
          type="text"
          placeholder="Busca clientes, servicios, productos o acciones..."
          class="flex-grow-1 search-input-field"
          autofocus
        />
        <v-btn icon variant="text" size="small" @click="close">
          <i class="fas fa-xmark" style="font-size: 1rem;"></i>
        </v-btn>
      </div>

      <v-divider></v-divider>

      <!-- Results Area -->
      <div class="results-container py-2 scrollbar-premium" style="max-height: 450px; overflow-y: auto;">
        
        <!-- Loading State -->
        <div v-if="loading" class="pa-10 text-center">
          <v-progress-circular indeterminate color="primary" size="30"></v-progress-circular>
          <div class="mt-4 text-caption text-themed-secondary">Buscando en la barbería...</div>
        </div>

        <!-- No Results / Empty State -->
        <div v-else-if="!searchQuery" class="pa-6">
          <div class="text-overline mb-4 text-primary font-weight-black">Acciones Rápidas</div>
          <v-row dense>
            <v-col cols="6" sm="4" v-for="action in [
              { title: 'Nueva Cita', icon: 'fa-calendar-plus', color: '#ee6f38', link: '/admin/citas' },
              { title: 'Clientes', icon: 'fa-users', color: '#3498db', link: '/admin/clientes' },
              { title: 'Productos', icon: 'fa-box-open', color: '#9b59b6', link: '/admin/productos' }
            ]" :key="action.title">
              <v-card variant="tonal" class="pa-4 text-center action-card clickable" @click="navigateTo(action.link)">
                <i :class="['fas', action.icon]" :style="{ color: action.color, fontSize: '24px' }" class="mb-2 d-block"></i>
                <div class="text-caption font-weight-bold text-themed">{{ action.title }}</div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Real Results -->
        <template v-else-if="results?.users?.length || results?.services?.length || results?.products?.length">
          <!-- Users -->
          <div v-if="results?.users?.length" class="mb-4">
            <div class="px-4 py-2 text-overline text-primary font-weight-black">Usuarios / Personal</div>
            <v-list class="bg-transparent pa-0">
              <v-list-item
                v-for="user in results.users"
                :key="user.id"
                class="px-4 py-2 result-item"
                @click="handleResultClick(user, 'user')"
              >
                <template v-slot:prepend>
                  <v-avatar size="32" class="mr-3">
                    <v-img v-if="user.foto" :src="user.foto" />
                    <i v-else class="fas fa-user text-grey" style="font-size: 1.2rem;"></i>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold text-themed">
                  {{ user.nombre }} {{ user.apellido }}
                </v-list-item-title>
                <template v-slot:append>
                  <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-black uppercase">
                    {{ user.role }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <!-- Services -->
          <div v-if="results?.services?.length" class="mb-4">
            <div class="px-4 py-2 text-overline text-primary font-weight-bold">Servicios</div>
            <v-list class="bg-transparent pa-0">
              <v-list-item
                v-for="service in results.services"
                :key="service.id"
                class="px-4 py-2 result-item"
                @click="handleResultClick(service, 'service')"
              >
                <template v-slot:prepend>
                   <i class="fas fa-scissors mr-4 text-success" style="font-size: 1.1rem;"></i>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold text-themed">
                  {{ service.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  ${{ service.precio }} | {{ service.duracionAprox }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <!-- Products -->
          <div v-if="results?.products?.length" class="mb-4">
            <div class="px-4 py-2 text-overline text-primary font-weight-bold">Productos</div>
            <v-list class="bg-transparent pa-0">
              <v-list-item
                v-for="product in results.products"
                :key="product.id"
                class="px-4 py-2 result-item"
                @click="handleResultClick(product, 'product')"
              >
                <template v-slot:prepend>
                   <i class="fas fa-box-open mr-4 text-orange" style="font-size: 1.1rem;"></i>
                </template>
                <v-list-item-title class="text-subtitle-2 font-weight-bold text-themed">
                  {{ product.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  Stock: {{ product.stock }} | ${{ product.precio_venta }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </template>

        <!-- No Results Found -->
        <div v-else class="pa-10 text-center opacity-50">
          <i class="fas fa-magnifying-glass-chart mb-4 d-block" style="font-size: 40px;"></i>
          <div class="text-subtitle-1">No se encontraron resultados</div>
          <div class="text-caption">Prueba con otras palabras clave</div>
        </div>
      </div>

      <!-- Footer Info -->
      <v-divider></v-divider>
      <div class="pa-3 px-4 d-flex align-center justify-space-between text-caption opacity-50 bg-secondary-light">
        <div>
          <kbd class="kbd-hint">ENTER</kbd> Seleccionar
          <kbd class="kbd-hint ml-2">ESC</kbd> Cerrar
        </div>
        <div class="font-weight-bold text-primary">STYLEHUB GLOBAL SEARCH</div>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.search-card {
  border-radius: 16px !important;
  background: rgb(var(--v-theme-surface)) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

.search-input-header {
  height: 64px;
}

.search-input-field {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  padding: 8px;
  outline: none;

  &::placeholder {
    color: rgba(var(--v-theme-on-surface), 0.3);
  }
}

.result-item {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.05) !important;
    border-left-color: #ee6f38;
    .text-themed { color: #ee6f38 !important; }
  }
}

.text-themed {
  color: rgb(var(--v-theme-on-surface));
}

.text-themed-secondary {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
}

.action-card {
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    background: rgba(var(--v-theme-primary), 0.1) !important;
  }
}

.kbd-hint {
  background: rgba(var(--v-theme-on-surface), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.bg-secondary-light {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

// Custom Scrollbar
.scrollbar-premium::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-premium::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
}
</style>
