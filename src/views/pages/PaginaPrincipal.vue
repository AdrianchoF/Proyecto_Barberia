<template>
  <div class="page-container">
    <!-- Menú Lateral Responsivo (Mobile) -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="mobile-drawer"
      color="#121212"
      theme="dark"
    >
      <div class="pa-6 d-flex flex-column h-100">
        <div class="d-flex justify-end mb-8">
          <i class="fas fa-times close-icon" @click="drawer = false"></i>
        </div>
        
        <v-list class="mobile-nav-list bg-transparent pa-0">
          <v-list-item v-for="link in navLinks" :key="link.to" :href="link.to" class="mb-4 text-h5 font-weight-bold mobile-link" @click="drawer = false">
            {{ link.text }}
          </v-list-item>
        </v-list>

        <v-spacer></v-spacer>

        <div class="mobile-footer mt-auto pt-6 border-t">
          <v-btn v-if="!authStore.isAuthenticated" block color="primary" size="large" rounded="xl" @click="abrirAuthModal('login')">
            INICIAR SESIÓN
          </v-btn>
          <div v-else class="d-flex align-center gap-2" @click="irAPerfil">
             <v-avatar size="40">
                <v-img v-if="authStore.user?.foto" :src="authStore.user.foto"></v-img>
                <i v-else class="fas fa-user-circle fa-2x"></i>
             </v-avatar>
             <span class="text-white font-weight-bold ml-2">{{ authStore.user?.nombre }}</span>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Header Principal -->
    <header ref="headerRef" class="header" :class="{ 'scrolled': isScrolled }">
      <div class="header-container">
        <div class="logo">
          <a href="/" class="logo-link" @click.prevent="irAInicio">
            <img src="/public/imagenes/logo/logo2.png" class="logo-img" />
          </a>
        </div>

        <nav class="nav desktop-only main-nav">
          <ul>
            <li v-for="link in navLinks" :key="link.to">
              <a :href="link.to">{{ link.text }}</a>
            </li>
          </ul>
        </nav>

        <div class="header-actions">
          <!-- Carrito siempre visible -->
          <CarritoCompra></CarritoCompra>

          <!-- Acciones de Usuario Desktop -->
          <div class="desktop-only d-flex align-center">
            <v-btn 
              v-if="!authStore.isAuthenticated" 
              class="btn-login" 
              rounded="xl"
              @click="abrirAuthModal('login')"
            >
              INICIAR SESIÓN
            </v-btn>

            <div v-else class="user-menu">
              <v-menu offset-y transition="scale-transition">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="user-pill">
                    <v-avatar size="32" class="pill-avatar">
                      <v-img v-if="authStore.user?.foto" :src="authStore.user.foto"></v-img>
                      <i v-else class="fas fa-user-circle" style="color: white;"></i>
                    </v-avatar>
                    <span class="pill-name">{{ authStore.user?.nombre.split(' ')[0] }}</span>
                    <i class="fas fa-chevron-down pill-chevron"></i>
                  </div>
                </template>

                <v-list class="user-dropdown glass-menu mt-2">
                  <v-list-item class="pa-4 text-center">
                    <v-avatar size="60" class="mb-2 border-orange">
                      <v-img v-if="authStore.user?.foto" :src="authStore.user.foto"></v-img>
                      <i v-else class="fas fa-user-circle fa-3x text-orange" style="color: white;"></i>
                    </v-avatar>
                    <div class="font-weight-bold text-white">{{ authStore.user?.nombre }}</div>
                    <div class="text-caption text-grey">{{ authStore.user?.email }}</div>
                  </v-list-item>
                  
                  <v-divider class="border-grey-darken-3"></v-divider>
                  
                  <v-list-item @click="irADashboard" class="menu-item">
                    <template v-slot:prepend><i class="fas fa-chart-line text-orange mr-3"></i></template>
                    <v-list-item-title>Panel de Control</v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item @click="irAMisCitas" class="menu-item">
                    <template v-slot:prepend><i class="fas fa-calendar-check text-orange mr-3"></i></template>
                    <v-list-item-title>Mis Citas</v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item @click="cerrarSesion" class="menu-item logout-link">
                    <template v-slot:prepend><i class="fas fa-sign-out-alt text-red mr-3"></i></template>
                    <v-list-item-title class="text-red">Cerrar Sesión</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Botón Menú Mobile -->
          <v-btn icon variant="text" class="mobile-only hamburger-btn" @click="drawer = true">
            <i class="fas fa-bars icon-white"></i>
          </v-btn>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="hero-section">
      <v-carousel 
        height="100vh" 
        show-arrows="hover" 
        cycle 
        hide-delimiters 
        class="hero-carousel"
        :interval="6000"
      >
        <v-carousel-item v-for="(image, i) in images" :key="i">
          <div class="hero-slide">
            <div class="overlay"></div>
            <img :src="image" class="hero-bg-img" />
          </div>
        </v-carousel-item>
      </v-carousel>

      <div class="hero-content">
        <div class="hero-text-container">
          <span class="hero-tagline">BIENVENIDO A STYLEHUB</span>
          <h1 class="hero-main-title">ESTILO <span class="text-orange">SIN LÍMITES</span></h1>
          <p class="hero-description">Transformamos tu imagen con precisión y actitud. El arte de la barbería elevado al siguiente nivel.</p>
          
          <div class="hero-buttons">
            <v-btn class="btn-primary-hero" size="x-large" @click="abrirModal">
              <i class="fas fa-calendar-alt mr-2"></i> ¡AGENDA TU CITA YA!
            </v-btn>
            <v-btn variant="outlined" color="white" size="x-large" rounded="xl" href="#servicios-section" class="ml-sm-4 mt-4 mt-sm-0">
              EXPLORAR SERVICIOS
            </v-btn>
          </div>
        </div>

        <a href="#servicios-section" class="scroll-indicator">
          <span>DESLIZA</span>
          <i class="fas fa-chevron-down"></i>
        </a>
      </div>
    </main>

    <div class="reveal-on-scroll">
      <HomeServicios></HomeServicios>
    </div>
    <div class="reveal-on-scroll">
      <HomeBarberos></HomeBarberos>
    </div>
    <div class="reveal-on-scroll">
      <HomeProductos></HomeProductos>
    </div>
    <div class="reveal-on-scroll">
      <HomeUbicacion></HomeUbicacion>
    </div>
    <VistareservaCita v-model="showModal"></VistareservaCita>
    <ModalAuth />
    <FooterPagina></FooterPagina>

    <!-- Botón Volver Arriba -->
    <Transition name="fade">
      <button v-if="showScrollTop" @click="scrollToTop" class="scroll-top-btn" title="Volver arriba">
        <i class="fas fa-chevron-up"></i>
        <span>TOP</span>
      </button>
    </Transition>

    <!-- API whatsapp -->
    <a href="https://api.whatsapp.com/send?phone=TU_NUMERO&text=Hola%20quiero%20más%20información" class="whatsapp-button" target="_blank">
      <i class="fab fa-whatsapp"></i>
      <span class="parrafowhatsapp">Escribemos por Whatsapp</span>
    </a>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import HomeServicios from '@/views/pages/HomeServicios.vue';
import HomeBarberos from '@/views/pages/HomeBarberos.vue';
import HomeProductos from '@/views/pages/HomeProductos.vue';
import HomeUbicacion from './HomeUbicacion.vue';
import CarritoCompra from '@/components/shared/CarritoCompra.vue';
import VistareservaCita from './VistareservaCita.vue';
import FooterPagina from './FooterPagina.vue';
import ModalAuth from '@/components/shared/ModalAuth.vue';

const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(false);
const isScrolled = ref(false);
const showModal = ref(false);
const showScrollTop = ref(false);

const navLinks = [
  { text: 'SERVICIOS', to: '#servicios-section' },
  { text: 'BARBEROS', to: '#barberos-section' },
  { text: 'PRODUCTOS', to: '#productos-section' },
  { text: 'UBICACIÓN', to: '#ubicacion-section' },
  { text: '¿QUIÉNES SOMOS?', to: '#servicios-section' }
];

const images = [
  'https://img.freepik.com/fotos-premium/hombre-sentado-silla-barbero-mientras-barbero-corta-cabello-precision-barbero-cortando-cuidadosamente-barba-cliente-precision_538213-114313.jpg?w=996',
  'https://www.blac.media/wp-content/uploads/2022/11/pexels-rodnae-productions-7697394-scaled.jpg',
  'https://wallpapers.com/images/hd/barber-shop-background-d8q2uecwheabpqj0.jpg',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?cs=srgb&dl=pexels-thgusstavo-1813272.jpg&fm=jpg',
  'https://s1.abcstatics.com/media/summum/2018/11/30/nathon-oski-546863-unsplash-k0MG--1248x698@abc.jpg',
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
  showScrollTop.value = window.scrollY > 800; // Se activa cerca de la sección de barberos
};

onMounted(async () => {
  window.addEventListener('scroll', handleScroll);
  if (!authStore.user) {
    try {
      await authStore.loadUser();
    } catch (e) {}
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const irADashboard = () => router.push('/dashboard');
const irAMisCitas = () => router.push('/mis-citas');
const irAPerfil = () => router.push('/perfil');
const cerrarSesion = async () => {
  await authStore.logout();
  window.location.href = '/';
};
const abrirModal = () => showModal.value = true;

const abrirAuthModal = (view = 'login') => {
  if (drawer.value) drawer.value = false;
  window.dispatchEvent(new CustomEvent('open-auth-dialog', { detail: { view } }));
};

const irAInicio = () => window.location.href = '/';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 🌀 Scroll Reveal Logic
onMounted(() => {
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --primary-orange: #ee6f38;
  --dark-bg: #121212;
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}

.page-container {
  font-family: 'Outfit', sans-serif !important;
  background-color: #121212;
  color: white;
  min-height: 100vh;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--dark-bg);
}

::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
  border: 3px solid var(--dark-bg);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-orange);
}

.page-container {
  font-family: 'Outfit', sans-serif;
  background-color: var(--dark-bg);
  color: white;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 📱 MOBILE DRAWER */
.mobile-drawer {
  background: rgba(18, 18, 18, 0.95) !important;
  backdrop-filter: blur(10px);
}

.close-icon {
  font-size: 24px;
  cursor: pointer;
  color: #ee6f38;
}

.mobile-drawer {
  background-color: #121212 !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-link {
  color: white !important;
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
}

.mobile-nav-list, .mobile-nav-list .v-list-item {
  background-color: transparent !important;
  color: white !important;
}

:deep(.v-navigation-drawer__content) {
  background-color: #121212 !important;
}

:deep(.v-list) {
  background: transparent !important;
}

/*  NAVIGATION HEADER */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 20px 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.scrolled {
  padding: 10px 0;
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.icon-white {
  color: white !important;
  font-size: 24px;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.logo {
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.logo-img {
  height: 125px;
  width: auto;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

.header.scrolled .logo-img {
  height: 90px;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 30px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav ul li a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 1px;
  position: relative;
  transition: color 0.3s ease;
}

.nav ul li a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #ee6f38;
  transition: width 0.3s ease;
}

.nav ul li a:hover {
  color: #ee6f38;
}

.nav ul li a:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-login {
  background: #ee6f38 !important;
  color: white !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border-radius: 50px !important;
}

.btn-login:hover {
  background: white !important;
  color: #ee6f38 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(238, 111, 56, 0.4);
}

/* USER PILL */
.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 5px 15px 5px 5px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ee6f38;
}

.pill-name {
  font-weight: 600;
  font-size: 14px;
}

.glass-menu {
  background: rgba(18, 18, 18, 0.98) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px !important;
  color: white !important;
}

.user-dropdown .v-list-item-title {
  color: white !important;
  font-weight: 600;
}

.user-dropdown .text-grey {
  color: rgba(255, 255, 255, 0.6) !important;
}

.menu-item {
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(238, 111, 56, 0.1);
}

/* HERO SECTION */
.hero-section {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.hero-slide {
  position: relative;
  height: 100%;
  width: 100%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.4) 0%, rgba(18, 18, 18, 0.9) 100%);
  z-index: 1;
}

.hero-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  text-align: center;
  padding: 0 20px;
}

.hero-text-container {
  max-width: 900px;
}

.hero-tagline {
  display: block;
  font-weight: 700;
  color: #ee6f38;
  letter-spacing: 5px;
  margin-bottom: 25px;
  font-size: clamp(1rem, 3vw, 1.5rem);
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.9);
  text-transform: uppercase;
}

.hero-main-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 25px;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 40px;
}

.btn-primary-hero {
  background-color: #ee6f38 !important;
  color: white !important;
  font-weight: 800 !important;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border-radius: 50px !important;
}

.btn-primary-hero:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(238, 111, 56, 0.5);
}

.hero-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-decoration: none;
  gap: 10px;
  opacity: 0.6;
  animation: bounce 2s infinite;
}

.scroll-indicator:hover {
  opacity: 1;
}

.scroll-indicator span {
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 600;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 🌀 REVEAL ANIMATIONS */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.reveal-active {
  opacity: 1;
  transform: translateY(0);
}

/* RESPONSIVITY UTILS */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 1024px) {
  .header-container { padding: 0 20px; }
  .desktop-only { display: none; }
  .mobile-only { display: block; }

  .hero-main-title {
    margin-top: 50px;
  }
}

@media (max-width: 600px) {
  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }
  .hero-buttons .v-btn {
    width: 100%;
  }
}

.whatsapp-button {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 99;
  background: #25d366;
  color: white;
  padding: 12px 25px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.whatsapp-button:hover {
  transform: translateY(-5px) scale(1.05);
  background: #20ba5a;
}

/* 🔝 SCROLL TOP BUTTON */
.scroll-top-btn {
  position: fixed;
  bottom: 25px;
  left: 25px;
  z-index: 99;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 55px;
  height: 55px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.scroll-top-btn:hover {
  background: #ee6f38;
  border-color: #ee6f38;
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(238, 111, 56, 0.4);
}

.scroll-top-btn i {
  font-size: 18px;
  margin-bottom: 2px;
}

.scroll-top-btn span {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
