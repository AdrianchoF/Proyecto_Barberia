<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const password = ref('');
const email = ref('');
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
    
  } catch (error: unknown) {
    setErrors({ apiError: error });
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
</style>