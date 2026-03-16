<template>
    <v-container class="confirmacion-container d-flex align-start justify-center pt-2">
        <v-card class="booking-card-inner elevation-0" max-width="500" width="100%">
            <!-- 🔹 Contenedor con Scroll Internal -->
            <div class="scroll-confirmacion">
                <v-card-text class="text-center pa-10 pb-5">
                    <div class="mb-4 d-flex justify-center">
                        <div class="icon-wrapper">
                            <i class="fas fa-user-check" style="font-size: 40px; color: white;"></i>
                        </div>
                    </div>
                    <h2 class="titulo-confirmacion" style="color: white;">Confirmar Identidad</h2>
                    <p class="subtitulo-confirmacion" style="color: white;">
                        Verifica tu información para finalizar la reserva
                    </p>
                </v-card-text>

                <!-- Usuario Logueado -->
                <v-card-text v-if="isAuthenticated" class="pa-8 pt-0">
                    <v-alert class="alert-glass mb-8" border="start" border-color="orange">
                        <div class="d-flex align-center">
                            <i class="fa-solid fa-circle-check text-orange mr-4" style="font-size: 24px;"></i>
                            <div>
                                <p class="font-weight-bold mb-0 text-white">¡Sesión activa!</p>
                                <p class="text-caption mb-0 text-grey">Tu cita será agendada con esta cuenta</p>
                            </div>
                        </div>
                    </v-alert>

                    <div class="user-profile-card mb-8">
                        <div class="d-flex align-center">
                            <v-avatar size="70" class="user-avatar mr-5">
                                <v-img v-if="userData.foto" :src="userData.foto"></v-img>
                                <i v-else class="fa-solid fa-user" style="font-size: 30px; color: white;"></i>
                            </v-avatar>
                            <div class="flex-grow-1">
                                <p class="user-name mb-2">
                                    {{ userData.nombre }} {{ userData.apellido }}
                                </p>
                                <div class="user-details d-flex flex-column gap-1">
                                    <span><i class="fa-solid fa-envelope"></i> {{ userData.email }}</span>
                                    <span><i class="fa-solid fa-phone"></i> {{ userData.telefono }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <v-btn block variant="flat" class="btn-secondary mb-6" size="large" @click="cerrarSesion">
                        <i class="fa-solid fa-arrow-right-arrow-left mr-3"></i>
                        Usar Otra Cuenta
                    </v-btn>

                    <v-checkbox v-model="aceptaTerminos" color="orange" hide-details="auto" class="mb-6" style="color: white;">
                        <template v-slot:label>
                            <span class="terms-text">
                                Acepto los
                                <a href="#" class="terms-link">términos</a>
                                y
                                <a href="#" class="terms-link">condiciones</a>
                            </span>
                        </template>
                    </v-checkbox>

                    <div class="footer-note">
                        <i class="fa-solid fa-info-circle text-orange"></i>
                        Recibirás una confirmación por correo y SMS
                    </div>
                </v-card-text>

                <!-- Usuario NO Logueado -->
                <v-card-text v-else class="pa-8 pt-0">
                    <v-alert class="alert-glass mb-8" border="start" border-color="orange">
                        <div class="d-flex align-center">
                            <i class="fa-solid fa-triangle-exclamation text-orange mr-4" style="font-size: 24px;"></i>
                            <div>
                                <p class="font-weight-bold mb-0 text-white">Cuenta requerida</p>
                                <p class="text-caption mb-0 text-white">Inicia sesión o regístrate para continuar</p>
                            </div>
                        </div>
                    </v-alert>

                    <div class="mb-8">
                        <p class="text-subtitle-1 font-weight-bold mb-5 text-white">
                            <i class="fa-solid fa-user-shield text-orange mr-3"></i>
                            ¿Cómo deseas continuar?
                        </p>

                        <v-btn block size="x-large" class="btn-primary mb-4" @click="irALogin">
                            <i class="fa-solid fa-right-to-bracket mr-3"></i>
                            Iniciar Sesión
                        </v-btn>

                        <div class="d-flex align-center my-6">
                            <v-divider color="rgba(255,255,255,0.1)"></v-divider>
                            <span class="px-4 text-white text-caption">o</span>
                            <v-divider color="rgba(255,255,255,0.1)"></v-divider>
                        </div>

                        <v-btn block size="x-large" variant="flat" class="btn-secondary" @click="irARegistro">
                            <i class="fa-solid fa-user-plus mr-3"></i>
                            Crear Cuenta Nueva
                        </v-btn>
                    </div>

                    <div class="user-profile-card">
                        <p class="text-subtitle-2 font-weight-bold mb-4 text-orange" style="color: white;">
                            <i class="fa-solid fa-star mr-2" style="color: yellow;"></i>
                            Beneficios Exclusivos
                        </p>
                        <div class="d-flex flex-column">
                            <div class="benefit-item">
                                <i class="fa-solid fa-check benefit-icon"></i>
                                <span class="user-details">Historial de citas y preferencias</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fa-solid fa-check benefit-icon"></i>
                                <span class="user-details">Reservas en un solo clic</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fa-solid fa-check benefit-icon"></i>
                                <span class="user-details">Acceso a promociones y ofertas</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>

                <v-divider color="rgba(255,255,255,0.05)"></v-divider>
                <v-card-text class="pa-5">
                    <p class="footer-note">
                        <i class="fa-solid fa-lock"></i>
                        Tus datos están seguros y encriptados
                    </p>
                </v-card-text>
            </div>
        </v-card>
    </v-container>
</template>

<script setup>
    import { ref, computed, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import { useAuthStore } from '@/stores/auth';

    const router = useRouter();
    const authStore = useAuthStore();
    const emit = defineEmits(['estado-confirmacion-agendar']);

    const aceptaTerminos = ref(false);

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userData = computed(() => ({
        nombre: authStore.user?.nombre || '',
        apellido: authStore.user?.apellido || '',
        email: authStore.user?.email || '',
        telefono: authStore.user?.telefono || '',
        foto: authStore.user?.foto || null
    }));

    watch(
        [isAuthenticated, aceptaTerminos],
        ([autenticado, terminos]) => {
            const habilitar = autenticado && terminos;
            emit('estado-confirmacion-agendar', habilitar);
        },
        { immediate: true }
    );

    const irALogin = () => {
        sessionStorage.setItem('returnToReservaBarbero', 'true');
        window.dispatchEvent(new CustomEvent('open-auth-dialog', { detail: { view: 'login' } }));
    };

    const irARegistro = () => {
        sessionStorage.setItem('returnToReservaBarbero', 'true');
        window.dispatchEvent(new CustomEvent('open-auth-dialog', { detail: { view: 'register' } }));
    };

    const cerrarSesion = async () => {
        aceptaTerminos.value = false;
        await authStore.logout();
    };

    defineExpose({
        validarConfirmacion: () => {
            if (!isAuthenticated.value) return { valido: false, mensaje: 'Debes iniciar sesión para continuar' };
            if (!aceptaTerminos.value) return { valido: false, mensaje: 'Debes aceptar los términos y condiciones' };
            return { valido: true, datos: userData.value };
        }
    });
</script>

<style scoped>
    .confirmacion-container { padding: 20px; color: white; }
    .scroll-confirmacion { max-height: calc(100vh - 200px); overflow-y: auto; }
    .scroll-confirmacion::-webkit-scrollbar { width: 6px; }
    .scroll-confirmacion::-webkit-scrollbar-thumb { background: rgba(238, 111, 56, 0.3); border-radius: 10px; }

    .booking-card-inner {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 25px !important;
        overflow: hidden;
    }

    .icon-wrapper {
        width: 80px; height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ee6f38, #ff8f5c);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 30px rgba(238, 111, 56, 0.3);
        margin-bottom: 25px;
    }

    .titulo-confirmacion {
        font-size: 1.8rem !important;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 10px !important;
    }

    .subtitulo-confirmacion { color: rgba(255, 255, 255, 0.5); font-size: 0.95rem; }

    .alert-glass {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 15px !important;
        color: white !important;
    }

    .user-profile-card {
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        border-radius: 20px !important;
        padding: 25px !important;
    }

    .user-avatar { border: 3px solid #ee6f38; padding: 4px; }
    .user-name { font-size: 1.3rem; font-weight: 700; color: white !important; }
    .user-details { color: rgba(255, 255, 255, 0.5); font-size: 0.9rem; }
    .user-details i { color: #ee6f38; width: 20px; }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        font-weight: 700;
    }

    .btn-primary {
        background: #ee6f38 !important;
        color: white !important;
        font-weight: 800;
        box-shadow: 0 5px 15px rgba(238, 111, 56, 0.3);
    }

    .benefit-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .benefit-icon { color: #ee6f38; font-size: 14px; }
    .terms-text { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }
    .terms-link { color: #ee6f38; text-decoration: none; font-weight: 700; }
    .footer-note { color: rgba(255, 255, 255, 0.3); font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
    :deep(.v-checkbox .v-label) { opacity: 1 !important; }
</style>