<template>
  <v-container fluid class="pt-2">

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- PANEL DE SUPER ADMINISTRADOR (SaaS)                    -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="userRole === 'super-administrador'">
      <v-row>
        <v-col cols="12">
          <v-card class="saas-banner-card mb-4" elevation="4" rounded="xl">
            <div class="banner-content">
              <div class="banner-text">
                <div class="saas-badge">
                  <i class="fas fa-terminal mr-2"></i> Console Access: v1.0.4
                </div>
                <h1 class="welcome-title">Control Center, {{ authStore.user?.nombre }}</h1>
                <p class="welcome-subtitle">
                  Gestión global del ecosistema de barberías. Supervisa suscripciones, 
                  rendimiento del sistema y despliegues.
                </p>
              </div>
              <div class="banner-illustration d-none d-md-flex">
                <i class="fas fa-microchip display-icon"></i>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-card class="saas-kpi" elevation="2" rounded="xl">
            <div class="kpi-icon-wrap bg-indigo-lighten-4">
              <i class="fas fa-store text-indigo"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Barberías Activas</p>
              <h3 class="kpi-value text-indigo">{{ superStore.admins.length }}</h3>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="saas-kpi" elevation="2" rounded="xl">
            <div class="kpi-icon-wrap bg-green-lighten-4">
              <i class="fas fa-dollar-sign text-green"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Ingresos SaaS (Est.)</p>
              <h3 class="kpi-value text-green">$ {{ (superStore.admins.length * 50).toLocaleString() }}</h3>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="saas-kpi" elevation="2" rounded="xl">
            <div class="kpi-icon-wrap bg-red-lighten-4">
              <i class="fas fa-heartbeat text-red"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Estado del Servidor</p>
              <h3 class="kpi-value text-red">ONLINE</h3>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="8">
           <v-card rounded="xl" elevation="2">
             <v-card-title class="pa-5">
               <i class="fas fa-history mr-2"></i> Registro de Actividad SaaS
             </v-card-title>
             <v-card-text class="pa-5">
                <v-list lines="two">
                  <v-list-item v-for="n in 3" :key="n" class="mb-2 border rounded-lg">
                    <template v-slot:prepend>
                       <v-avatar color="indigo-lighten-5">
                          <i class="fas fa-info-circle text-indigo"></i>
                       </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">Nueva Instancia Creada</v-list-item-title>
                    <v-list-item-subtitle>Un nuevo usuario administrador ha sido registrado y activado.</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
             </v-card-text>
           </v-card>
        </v-col>
        <v-col cols="12" md="4">
           <v-card rounded="xl" elevation="2" class="bg-indigo-darken-4 text-white pa-4">
              <h3 class="text-h6 font-weight-bold mb-4">Quick SaaS Access</h3>
              <v-btn block color="white" class="text-indigo mb-3" rounded="lg" to="/gestion-barberias">
                <i class="fas fa-users-cog mr-2"></i> Gestionar Barberías
              </v-btn>
              <v-btn block variant="outlined" color="white" rounded="lg">
                <i class="fas fa-database mr-2"></i> Backups
              </v-btn>
           </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- PANEL DE ADMINISTRADOR                                  -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-else-if="userRole === 'administrador'">
      
      <!-- HERO BANNER -->
      <v-row>
        <v-col cols="12">
          <v-card class="admin-banner-card mb-4" elevation="4" rounded="xl">
            <div class="banner-content">
              <div class="banner-text">
                <div class="greeting-badge">
                  <i class="fas fa-sun mr-2" v-if="isMorning"></i>
                  <i class="fas fa-cloud-sun mr-2" v-else-if="isAfternoon"></i>
                  <i class="fas fa-moon mr-2" v-else></i>
                  {{ saludo }}
                </div>
                <h1 class="welcome-title">Bienvenido, {{ nombreUsuario }}</h1>
                <p class="welcome-subtitle">
                  Aquí tienes el resumen actual de la barbería. 
                  Controla las citas, el equipo, y tu inventario al instante.
                </p>
              </div>
              <div class="banner-illustration d-none d-md-flex">
                <i class="fas fa-chart-pie display-icon"></i>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- KPI METRICS ROW -->
      <v-row>
        <!-- Tarjeta 1: Citas Hoy -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="kpi-card" elevation="2" rounded="xl" @click="router.push('/gestion-citas')">
            <div class="kpi-icon-wrap" style="background-color: rgb(var(--v-theme-lightwarning))">
              <i class="fas fa-calendar-check text-orange"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Total Citas</p>
              <h3 class="kpi-value">
                <v-progress-circular v-if="loadingCitas" indeterminate color="#ee6f38" size="24" width="3"/>
                <span v-else>{{ citasRegistradas }}</span>
              </h3>
            </div>
          </v-card>
        </v-col>

        <!-- Tarjeta 2: Barberos -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="kpi-card" elevation="2" rounded="xl" @click="router.push('/lista-barberos')">
            <div class="kpi-icon-wrap" style="background-color: rgb(var(--v-theme-lightprimary))">
              <i class="fas fa-cut text-blue"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Barberos Activos</p>
              <h3 class="kpi-value">
                <v-progress-circular v-if="loadingBarbers" indeterminate color="#2196F3" size="24" width="3"/>
                <span v-else>{{ barberosActivos }}</span>
              </h3>
            </div>
          </v-card>
        </v-col>

        <!-- Tarjeta 3: Clientes -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="kpi-card" elevation="2" rounded="xl" @click="router.push('/lista-clientes')">
            <div class="kpi-icon-wrap" style="background-color: rgb(var(--v-theme-lightsuccess))">
              <i class="fas fa-users text-green"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Clientes Registrados</p>
              <h3 class="kpi-value">
                <v-progress-circular v-if="loadingClients" indeterminate color="#4CAF50" size="24" width="3"/>
                <span v-else>{{ clientesTotales }}</span>
              </h3>
            </div>
          </v-card>
        </v-col>

        <!-- Tarjeta 4: Productos -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="kpi-card" elevation="2" rounded="xl" @click="router.push('/lista-productos')">
            <div class="kpi-icon-wrap" style="background-color: rgb(var(--v-theme-lightsecondary))">
              <i class="fas fa-box-open text-purple"></i>
            </div>
            <div class="kpi-info">
              <p class="kpi-label">Productos en Inventario</p>
              <h3 class="kpi-value">
                <v-progress-circular v-if="loadingProducts" indeterminate color="#9C27B0" size="24" width="3"/>
                <span v-else>{{ productosTotales }}</span>
              </h3>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- SEGUNDA FILA: ACCESOS RAPIDOS Y ALERTAS DE INVENTARIO -->
      <v-row class="mt-4">
        
        <!-- Acciones Rápidas -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2">
            <v-card-title class="section-title pa-5 pb-0">
              <i class="fas fa-bolt text-warning mr-2"></i> Accesos Rápidos
            </v-card-title>
            <v-card-text class="pa-5 pt-4">
              <v-row>
                <v-col cols="6">
                  <v-btn block height="60" color="primary" variant="tonal" class="quick-btn" to="/crear-barbero" rounded="lg">
                    <i class="fas fa-user-plus mr-2" style="font-size: 18px"></i> Nuevo Barbero
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn block height="60" color="info" variant="tonal" class="quick-btn" to="/crear-servicio" rounded="lg">
                    <i class="fas fa-concierge-bell mr-2" style="font-size: 18px"></i> Crear Servicio
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn block height="60" color="warning" variant="tonal" class="quick-btn" to="/crear-producto" rounded="lg">
                    <i class="fas fa-box mr-2" style="font-size: 18px"></i> Agregar Producto
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn block height="60" color="success" variant="tonal" class="quick-btn" to="/crear-compra" rounded="lg">
                    <i class="fas fa-shopping-cart mr-2" style="font-size: 18px"></i> Nueva Compra
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Alertas de Inventario -->
        <v-col cols="12" md="6">
           <v-card rounded="lg" elevation="2">
            <v-card-title class="section-title pa-5 pb-0">
              <i class="fas fa-exclamation-triangle text-error mr-2"></i> Alertas de Inventario (Bajo Stock)
            </v-card-title>
            <v-card-text class="pa-5 pt-3">
              <v-list v-if="productosBajoStock.length > 0" lines="two" class="bg-transparent pa-0">
                <v-list-item 
                  v-for="prod in productosBajoStock.slice(0, 4)" 
                  :key="prod.id"
                  class="stock-item mb-2"
                  rounded="lg"
                >
                  <template #prepend>
                    <v-avatar color="lighterror" size="40" rounded="md">
                      <i class="fas fa-cube text-error"></i>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">{{ prod.nombre }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption mt-1">
                    Solo quedan <strong class="text-error">{{ prod.stock }}</strong> unidades en inventario
                  </v-list-item-subtitle>
                  <template #append>
                    <v-btn size="small" variant="tonal" color="primary" rounded="lg" to="/crear-compra">Pedir</v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="empty-alerts">
                <i class="fas fa-check-circle"></i>
                <p>Todo en orden. No hay productos con bajo inventario.</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- PANELES SECUNDARIOS (BARBERO / CLIENTE)                 -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-else>
      <v-card class="admin-banner-card mb-4" elevation="4" rounded="xl">
        <div class="banner-content">
          <div class="banner-text">
            <div class="greeting-badge">
              <i class="fas fa-sun mr-2" v-if="isMorning"></i>
              <i class="fas fa-cloud-sun mr-2" v-else-if="isAfternoon"></i>
              <i class="fas fa-moon mr-2" v-else></i>
              {{ saludo }}
            </div>
            <h1 class="welcome-title">Hola, {{ nombreUsuario }}</h1>
            <p class="welcome-subtitle">
               {{ userRole === 'barbero' 
                  ? 'Revisa tu agenda de hoy y prepárate para dar los mejores recortes.' 
                  : 'Explora nuestros servicios y agenda tu cita cuando lo prefieras.' }}
            </p>
          </div>
          <div class="banner-illustration d-none d-md-flex">
            <i class="fas fa-cut display-icon" v-if="userRole === 'barbero'"></i>
            <i class="fas fa-calendar-alt display-icon" v-else></i>
          </div>
        </div>
      </v-card>
    </div>

  </v-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCitaStore } from '@/stores/cita';
import { useBarberStore } from '@/stores/barber';
import { useClientStore } from '@/stores/client';
import { useProductoStore } from '@/stores/producto';
import { useServiceStore } from '@/stores/services';
import { useSuperAdminStore } from '@/stores/superadmin';

const router = useRouter();
const authStore = useAuthStore();
const citaStore = useCitaStore();
const barberStore = useBarberStore();
const clientStore = useClientStore();
const productoStore = useProductoStore();
const serviceStore = useServiceStore();
const superStore = useSuperAdminStore();

// UI Loaders
const loadingCitas = ref(false);
const loadingBarbers = ref(false);
const loadingClients = ref(false);
const loadingProducts = ref(false);
const loadingServices = ref(false);

const userRole = computed(() => authStore.user?.Role?.toLowerCase() || '');
const nombreUsuario = computed(() => {
  const u = authStore.user;
  if (!u) return 'Usuario';
  return `${u.nombre} ${u.apellido}`;
});

// Time logics for greeting
const currentHour = new Date().getHours();
const isMorning = currentHour < 12;
const isAfternoon = currentHour >= 12 && currentHour < 19;
const saludo = computed(() => {
  if (isMorning) return 'Buenos días';
  if (isAfternoon) return 'Buenas tardes';
  return 'Buenas noches';
});

// Computed Metrics
const citasRegistradas = computed(() => citaStore.citas.length);
const barberosActivos = computed(() => barberStore.barbers.length);
const clientesTotales = computed(() => clientStore.clients.length);
const productosTotales = computed(() => productoStore.productos.length);
const productosBajoStock = computed(() => {
  return productoStore.productos.filter(p => p.stock > 0 && p.stock <= 5).sort((a,b) => a.stock - b.stock);
});

// Cargar datos exclusivamente si el usuario es administrador
onMounted(async () => {
  if (authStore.user?.Role.toLowerCase() === 'administrador') {
    loadingCitas.value = true;
    loadingBarbers.value = true;
    loadingClients.value = true;
    loadingProducts.value = true;
    loadingServices.value = true;

    Promise.allSettled([
      citaStore.obtenerCitas().finally(() => loadingCitas.value = false),
      barberStore.getBarbers().finally(() => loadingBarbers.value = false),
      clientStore.getClients().finally(() => loadingClients.value = false),
      productoStore.getProductos(false).finally(() => loadingProducts.value = false),
      serviceStore.getServices().finally(() => loadingServices.value = false),
    ]);
  }
  
  if (authStore.user?.Role?.toLowerCase() === 'super-administrador') {
    superStore.getAdmins();
  }
});
</script>

<style scoped>
/* ── Hero Banner ── */
.admin-banner-card {
  background: linear-gradient(135deg, #ee6f38 0%, #ba4e20 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.admin-banner-card::before {
  content: '';
  position: absolute;
  top: -50%; right: -10%;
  width: 50%; height: 200%;
  background: rgba(255,255,255,0.05);
  transform: rotate(25deg);
  pointer-events: none;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36px 40px;
}

.banner-text {
  max-width: 650px;
  z-index: 1;
}

.greeting-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  backdrop-filter: blur(4px);
  text-transform: uppercase;
}

.welcome-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.05rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.banner-illustration {
  width: 120px;
  height: 120px;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.display-icon {
  font-size: 56px;
  color: white;
  opacity: 0.9;
}

/* ── KPI Cards ── */
.kpi-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border: none !important;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgb(var(--v-theme-surface));
  height: 100%;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important;
  border-color: #ee6f38;
}

.kpi-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 18px;
  flex-shrink: 0;
}

.kpi-info { flex-grow: 1; }

.kpi-label {
  font-size: 0.85rem;
  color: rgb(var(--v-theme-lightText));
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px 0;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: rgb(var(--v-theme-darkText));
  margin: 0;
  line-height: 1.1;
}

/* Colors for KPI Icons */
.bg-orange-light { background: #fff3e0; } .text-orange { color: #f57c00; }
.bg-blue-light { background: #e3f2fd; } .text-blue { color: #1976d2; }
.bg-green-light { background: #e8f5e9; } .text-green { color: #388e3c; }
.bg-purple-light { background: #f3e5f5; } .text-purple { color: #7b1fa2; }
.text-error { color: #d32f2f; }
.text-warning { color: #f57f17; }


/* ── Sections Down Below ── */
.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgb(var(--v-theme-darkText));
}

.quick-btn {
  font-weight: 700 !important;
  letter-spacing: 0.2px;
  text-transform: none;
  font-size: 0.95rem;
}

/* Stock Items */
.stock-item {
  transition: background 0.2s;
  border: none !important;
}
.stock-item:hover { background: rgba(var(--v-theme-on-surface), 0.05); }

.empty-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: rgb(var(--v-theme-lightText));
}
.empty-alerts i { font-size: 48px; color: #4caf50; margin-bottom: 12px; opacity: 0.8; }
.empty-alerts p { font-size: 0.95rem; margin: 0; }

@media (max-width: 600px) {
  .banner-content { padding: 24px; text-align: center; justify-content: center; }
  .welcome-title { font-size: 1.7rem; }
}

/* SaaS Specific Styles */
.saas-banner-card {
  background: linear-gradient(135deg, #1a237e 0%, #311b92 100%);
  color: white;
  border-radius: 24px;
}
.saas-badge {
  display: inline-block;
  background: rgba(255,255,255,0.1);
  padding: 5px 12px;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  margin-bottom: 15px;
}
.saas-kpi {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
}
</style>
