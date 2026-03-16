<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Google from '@/assets/images/auth/social-google.svg';
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
const show1 = ref(false);
const valid = ref(false);

const password = ref('');
const email = ref('');
const nombre = ref('');
const apellido = ref('');
const telefono = ref('');

const passwordRules = ref([
  (v: string) => !!v || 'La contraseña es obligatoria',
  (v: string) => v.length >= 8 || 'Mínimo 8 caracteres',
  (v: string) => v.length <= 20 || 'Máximo 20 caracteres',
  (v: string) => /[A-Z]/.test(v) || 'Debe incluir al menos una mayúscula',
  (v: string) => /[a-z]/.test(v) || 'Debe incluir al menos una minúscula',
  (v: string) => /\d/.test(v) || 'Debe incluir al menos un número',
  (v: string) => /[@$!%*?&]/.test(v) || 'Debe incluir al menos un símbolo (@$!%*?&)',
]);

const emailRules = ref([
  (v: string) => !!v || 'El correo electrónico es obligatorio',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Formato de correo no válido',
]);

const registerRules = ref([
  (v: string) => !!v || 'Requerido'
]);

async function handleRegister(values: any, { setErrors }: any) {
  try {
    const authStore = useAuthStore();
    await authStore.register({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      telefono: telefono.value,
    });

    if (props.isModal) {
      emit('auth-success');
    } else {
      router.push('/login1');
    }
    
  } catch (error: any) {
    console.error('Error al registrar:', error);
    setErrors({ apiError: error.message || String(error) });
  }
}
</script>

<template>
  <div class="auth-form-wrapper">
    <v-btn block variant="outlined" class="google-btn mb-6" size="large">
      <img :src="Google" alt="google" class="google-icon" />
      <span>Registrarse con Google</span>
    </v-btn>

    <div class="divider-container mb-6">
      <v-divider class="glass-divider"></v-divider>
      <span class="divider-text">O EMAIL</span>
      <v-divider class="glass-divider"></v-divider>
    </div>

    <Form @submit="handleRegister" class="registerForm" v-slot="{ errors, isSubmitting }">
      <v-row class="ma-0 mb-n4">
        <v-col cols="12" sm="6" class="pl-0 pr-sm-2 pr-0">
          <v-text-field
            v-model="nombre"
            :rules="registerRules"
            label="Nombre"
            required
            density="comfortable"
            hide-details="auto"
            variant="outlined"
            color="#ee6f38"
            base-color="rgba(255,255,255,0.3)"
            class="glass-input mb-4"
          >
            <template v-slot:prepend-inner>
              <i class="fas fa-user input-icon"></i>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="pr-0 pl-sm-2 pl-0">
          <v-text-field
            v-model="apellido"
             :rules="registerRules"
            label="Apellido"
            required
            density="comfortable"
            hide-details="auto"
            variant="outlined"
            color="#ee6f38"
            base-color="rgba(255,255,255,0.3)"
            class="glass-input mb-4"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-text-field
        v-model="email"
        :rules="emailRules"
        label="Correo electrónico"
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
        required
        density="comfortable"
        variant="outlined"
        color="#ee6f38"
        base-color="rgba(255,255,255,0.3)"
        hide-details="auto"
        :append-inner-icon="show1 ? 'fa:fas fa-eye' : 'fa:fas fa-eye-slash'"
        :type="show1 ? 'text' : 'password'"
        @click:append-inner="show1 = !show1"
        class="glass-input mb-4"
      >
        <template v-slot:prepend-inner>
          <i class="fas fa-lock input-icon"></i>
        </template>
      </v-text-field>

      <v-text-field
        v-model="telefono"
        :rules="registerRules"
        label="Teléfono"
        required
        density="comfortable"
        variant="outlined"
        color="#ee6f38"
        base-color="rgba(255,255,255,0.3)"
        hide-details="auto"
        class="glass-input mb-2"
        type="tel"
      >
        <template v-slot:prepend-inner>
          <i class="fas fa-phone input-icon"></i>
        </template>
      </v-text-field>

      <div class="d-flex align-center justify-start mb-6 auth-options">
        <v-checkbox
          v-model="checkbox"
          :rules="[(v: any) => !!v || 'Debes aceptar los términos y condiciones']"
          label="He leído y acepto los"
          color="#ee6f38"
          hide-details="auto"
          density="compact"
          class="glass-checkbox mt-0"
        >
        </v-checkbox>
        <a href="#" class="terms-link text-caption ml-1">Términos y condiciones</a>
      </div>

      <v-btn 
        color="#ee6f38" 
        :loading="isSubmitting" 
        block 
        size="x-large" 
        :disabled="!checkbox" 
        type="submit"
        class="btn-submit mb-4"
        elevation="0"
      >
        REGISTRARSE
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

/* Opciones (Terms) */
.auth-options {
  font-size: 0.85rem;
}

.glass-checkbox :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.85rem;
  opacity: 1 !important;
}

.terms-link {
  color: #ee6f38;
  text-decoration: none;
  transition: color 0.3s ease;
  font-weight: 600;
  padding-bottom: 2px;
}

.terms-link:hover {
  text-decoration: underline;
  color: white;
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

.btn-submit:hover:not(:disabled) {
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
