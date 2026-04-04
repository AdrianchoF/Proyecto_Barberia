<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Google from '@/assets/images/auth/social-google.svg';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['auth-success', 'change-view']);

const router = useRouter();
const route = useRoute();
const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');

// Control de errores de penalización
const showPenaltyModal = ref(false);
const penaltyMessage = ref('');

onMounted(() => {
  // Verificar si venimos redirigidos por una cuenta desactivada (Google Auth)
  if (route.query.error === 'account_deactivated') {
    penaltyMessage.value = route.query.message as string || 'Tu cuenta ha sido desactivada temporalmente.';
    showPenaltyModal.value = true;
    
    // Limpiar query params sin recargar para que no reaparezca el modal al refrescar
    router.replace({ query: {} });
  }
});
const passwordRules = ref([
  (v: string) => !!v || 'La contraseña es obligatoria',
]);
const emailRules = ref([
  (v: string) => !!v || 'El correo electrónico es obligatorio', 
  (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Formato de correo inválido',
]);

async function validate(values: any, { setErrors }: any) {
  const authStore = useAuthStore();
  
  try {
    const result = await authStore.login({ email: email.value.toLowerCase().trim(), password: password.value });
    
    // 🎯 FORZAR LA CARGA DEL USUARIO
    await authStore.loadUser();
    
    // Si estamos en un Modal, simplemente emitimos éxito para que se cierre
    if (props.isModal) {
      emit('auth-success');
    }
    
    // ✅ VERIFICAR SI VIENE DE RESERVA
    const returnToReserva = sessionStorage.getItem('returnToReserva');
    if (returnToReserva === 'true') {
      sessionStorage.removeItem('returnToReserva');
      if (!props.isModal) router.push('/');
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-reserva-dialog')), props.isModal ? 300 : 100);
      return;
    }
    
    const returnToReservaBarbero = sessionStorage.getItem('returnToReservaBarbero');
    if (returnToReservaBarbero === 'true') {
      sessionStorage.removeItem('returnToReservaBarbero');
      if (!props.isModal) router.push('/'); 
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-reserva-barbero-dialog')), props.isModal ? 300 : 100);
      return;
    }
    
    // REDIRECCIÓN BASADA EN ROL (Admin/Barbero -> Dashboard, Cliente -> Inicio)
    const userRole = (authStore.user as any)?.Role;
    if (userRole === 'cliente') {
      // Solo redirige a '/' si no estamos ya allí o si viene de otra ruta
      if (!props.isModal || router.currentRoute.value.path !== '/') {
        router.push('/');
      }
    } else {
      router.push('/dashboard');
    }
    
  } catch (error: any) {
    // Si es un error de cuenta suspendida/desactivada, lo mostramos en el modal premium
    const msg = error.response?.data?.message || error.message || error;
    if (msg.includes('Cuenta suspendida') || msg.includes('cuenta ha sido desactivada')) {
      penaltyMessage.value = msg;
      showPenaltyModal.value = true;
    } else {
      setErrors({ apiError: msg });
    }
  }
}
</script>

<template>
  <div class="auth-form-wrapper">
    <v-btn block variant="outlined" class="google-btn mb-6" size="large" @click="useAuthStore().loginWithGoogle()">
      <img :src="Google" alt="google" class="google-icon" />
      <span>Continuar con Google</span>
    </v-btn>

    <div class="divider-container mb-6">
      <v-divider class="glass-divider"></v-divider>
      <span class="divider-text">O EMAIL</span>
      <v-divider class="glass-divider"></v-divider>
    </div>

    <Form @submit="validate" class="loginForm" v-slot="{ errors, isSubmitting }">
      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        required
        density="comfortable"
        hide-details="auto"
        variant="outlined"
        color="#ee6f38"
        base-color="rgba(255,255,255,0.3)"
        class="glass-input mb-4"
      >
        <template v-slot:prepend-inner>
          <i class="fas fa-envelope input-icon"></i>
        </template>
      </v-text-field>

      <v-text-field
        v-model="password"
        :rules="passwordRules"
        label="Contraseña"
        placeholder="••••••••"
        required
        density="comfortable"
        variant="outlined"
        color="#ee6f38"
        base-color="rgba(255,255,255,0.3)"
        hide-details="auto"
        :append-inner-icon="show1 ? 'fa:fas fa-eye' : 'fa:fas fa-eye-slash'"
        :type="show1 ? 'text' : 'password'"
        @click:append-inner="show1 = !show1"
        class="glass-input mb-2"
      >
        <template v-slot:prepend-inner>
           <i class="fas fa-lock input-icon"></i>
        </template>
      </v-text-field>

      <div class="d-flex align-center justify-space-between mb-6 auth-options">
        <v-checkbox
          v-model="checkbox"
          label="Recordarme"
          color="#ee6f38"
          hide-details
          density="compact"
          class="glass-checkbox"
        ></v-checkbox>
        <a href="javascript:void(0)" class="forgot-link">¿Olvidaste tu contraseña?</a>
      </div>

      <v-btn 
        color="#ee6f38" 
        :loading="isSubmitting" 
        block 
        size="x-large" 
        :disabled="valid" 
        type="submit"
        class="btn-submit mb-4"
        elevation="0"
      >
        INICIAR SESIÓN
      </v-btn>

      <v-expand-transition>
        <div v-if="errors.apiError" class="mt-2">
          <v-alert type="error" variant="tonal" class="glass-alert text-caption py-2" density="compact">
            {{ errors.apiError }}
          </v-alert>
        </div>
      </v-expand-transition>
    </Form>

    <!-- ══════════════════════════════ -->
    <!-- MODAL PREMIUM: CUENTA PENALIZADA -->
    <!-- ══════════════════════════════ -->
    <v-dialog v-model="showPenaltyModal" max-width="450" persistent rounded="xl">
      <v-card class="penalty-modal overflow-hidden">
        <div class="penalty-header">
          <v-avatar color="rgba(255, 255, 255, 0.1)" size="80" class="mb-4">
             <i class="mdi mdi-account-cancel text-h3 text-white"></i>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold text-white mb-1">Acceso Restringido</h2>
          <p class="text-caption text-white opacity-70">Tu seguridad y el cumplimiento de normas es lo primero</p>
        </div>
        
        <v-card-text class="pa-8 text-center bg-dark">
          <div class="penalty-message-box mb-6">
             <i class="fas fa-exclamation-triangle mr-2 text-warning"></i>
             <p class="penalty-text">{{ penaltyMessage }}</p>
          </div>
          
          <p class="text-body-2 text-white mb-6">
            Si consideras que esto es un error o deseas resolver tu situación actual, 
            por favor comunícate con la administración de la barbería.
          </p>
          
          <v-btn 
            block 
            variant="flat" 
            color="#ee6f38" 
            rounded="lg" 
            size="large"
            @click="showPenaltyModal = false"
            class="font-weight-bold"
          >
            ENTENDIDO
          </v-btn>
          
          <div class="mt-4">
            <a href="https://wa.me/573216549870" target="_blank" class="contact-admin-link">
              <i class="fab fa-whatsapp mr-1"></i> Contactar Administrador
            </a>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* Glassmorphism auth form styles */
.auth-form-wrapper {
  color: white;
  font-family: 'Inter', sans-serif;
}

.google-btn {
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
  border-radius: 12px;
}

.google-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.google-icon {
  width: 20px;
  margin-right: 12px;
}

.divider-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.glass-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  opacity: 1 !important;
  flex: 1;
}

.divider-text {
  font-size: 0.75rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

/* INPUTS */
.glass-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 12px;
  box-shadow: none !important;
}

.glass-input :deep(input) {
  color: white !important;
  font-weight: 500;
}

.glass-input :deep(label) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.glass-input :deep(.v-field:hover) {
  background: rgba(255, 255, 255, 0.06) !important;
}

.input-icon {
  color: rgba(238, 111, 56, 0.8);
  margin-right: 8px;
  font-size: 14px;
}

/* Opciones (Recordarme, Olvido) */
.auth-options {
  font-size: 0.85rem;
}

.glass-checkbox :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.85rem;
  opacity: 1 !important;
}

.forgot-link {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #ee6f38;
}

/* Submit Button */
.btn-submit {
  border-radius: 12px !important;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 111, 56, 0.3) !important;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(238, 111, 56, 0.5) !important;
}

/* Alert */
.glass-alert {
  background: rgba(211, 47, 47, 0.1) !important;
  border: 1px solid rgba(211, 47, 47, 0.2) !important;
  color: #ff5252 !important;
  border-radius: 8px;
}

/* Penalty Modal */
.penalty-modal {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  background: #121212 !important;
}

.penalty-header {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  padding: 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.penalty-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
  opacity: 0.1;
}

.bg-dark {
  background: #121212 !important;
}

.penalty-message-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(238, 111, 56, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.penalty-text {
  color: #ffffff;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
}

.contact-admin-link {
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.contact-admin-link:hover {
  color: #ee6f38;
}

.text-warning {
  color: #ee6f38 !important;
}
</style>