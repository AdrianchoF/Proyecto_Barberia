<template>
  <v-dialog v-model="isOpen" max-width="500" transition="dialog-bottom-transition" class="auth-dialog" :scrim="'rgba(0, 0, 0, 0.8)'">
    <v-card class="auth-card">
      <div class="auth-header">
        <div class="logo-container">
          <img src="/public/imagenes/logo/logo2.png" alt="Logo StyleHub" class="auth-logo" />
        </div>
        <v-btn variant="text" size="small" class="btn-close" @click="cerrarModal" :ripple="false">
          <i class="fas fa-times"></i>
        </v-btn>
      </div>

      <div class="auth-body">
        <v-window v-model="currentView">
          <!-- Vista de Iniciar Sesión -->
          <v-window-item value="login">
            <div class="auth-title-section text-center mb-6">
              <h2 class="auth-title">INICIAR <span class="text-orange">SESIÓN</span></h2>
              <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>
            </div>
            
            <AuthLogin @auth-success="cerrarYRecargar" @change-view="cambiarVista('register')" :is-modal="true" />
            
            <div class="auth-footer text-center mt-6">
              <span class="text-grey">¿No tienes una cuenta?</span>
              <a href="#" class="auth-link ml-2" @click.prevent="cambiarVista('register')">Regístrate aquí</a>
            </div>
          </v-window-item>

          <!-- Vista de Registro -->
          <v-window-item value="register">
             <div class="auth-title-section text-center mb-6">
              <h2 class="auth-title">CREAR <span class="text-orange">CUENTA</span></h2>
              <p class="auth-subtitle">Únete a la mejor experiencia</p>
            </div>

            <AuthRegister @auth-success="cambiarVista('login')" @change-view="cambiarVista('login')" :is-modal="true" />
            
            <div class="auth-footer text-center mt-6">
              <span class="text-grey">¿Ya tienes una cuenta?</span>
              <a href="#" class="auth-link ml-2" @click.prevent="cambiarVista('login')">Inicia sesión</a>
            </div>
          </v-window-item>
        </v-window>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AuthLogin from '@/views/authentication/authForms/AuthLogin.vue';
import AuthRegister from '@/views/authentication/authForms/AuthRegister.vue';

const isOpen = ref(false);
const currentView = ref('login'); // 'login' o 'register'

// Escuchar el evento global para abrir el modal
const handleOpenAuthDialog = (event) => {
  isOpen.value = true;
  // Si se especifica una vista inicial (ej: 'register')
  if (event.detail && event.detail.view) {
    currentView.value = event.detail.view;
  } else {
    currentView.value = 'login';
  }
};

onMounted(() => {
  window.addEventListener('open-auth-dialog', handleOpenAuthDialog);
});

onUnmounted(() => {
  window.removeEventListener('open-auth-dialog', handleOpenAuthDialog);
});

const cerrarModal = () => {
  isOpen.value = false;
  setTimeout(() => {
    currentView.value = 'login'; // Resetear a login al cerrar
  }, 300);
};

const cerrarYRecargar = () => {
  cerrarModal();
  // El AuthLogin ya redirige o carga, pero aquí podemos emitir evento si es necesario
};

const cambiarVista = (vista) => {
  currentView.value = vista;
};

</script>

<style scoped>
.auth-dialog {
  backdrop-filter: blur(10px);
}

.auth-card {
  background: rgba(18, 18, 18, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 20px !important;
  color: white;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

.auth-header {
  position: relative;
  padding: 30px 20px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 0 10px rgba(238, 111, 56, 0.3));
}

.btn-close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: rgba(255, 255, 255, 0.5) !important;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.btn-close:hover {
  color: #ee6f38 !important;
  background: rgba(238, 111, 56, 0.1);
  transform: rotate(90deg);
}

.auth-body {
  padding: 0 40px 40px;
}

.auth-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 5px;
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
  color: #ee6f38;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: white;
  text-decoration: underline;
}

/* Modificar estilos del v-window para transición suave */
:deep(.v-window) {
  overflow: visible;
}
</style>
