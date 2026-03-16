<template>
    <v-container class="barbero-container">
        <h3 class="titulo-barberos">Tu profesional de confianza</h3>

        <!-- 🔹 Alerta si no hay fecha/hora seleccionada -->
        <v-alert v-if="!reservaStore.tieneFechaYHora" type="info" variant="tonal" class="mb-4 text-orange border-orange">
            Selecciona primero una fecha y hora para ver los barberos disponibles
        </v-alert>

        <!-- 🔹 Lista de barberos disponibles -->
        <div v-else class="scroll-barberos">
            <div v-if="loading" class="text-center py-16">
                <v-progress-circular indeterminate color="primary" size="64" />
                <p class="mt-4 text-grey">Consultando agenda...</p>
            </div>

            <div v-else-if="barberosDisponibles.length === 0" class="text-center py-16">
                <i class="fas fa-user-clock" style="font-size: 80px; color: rgba(255,255,255,0.05);"></i>
                <p class="mt-4 text-grey">No hay barberos disponibles para este horario</p>
                <v-btn variant="text" color="primary" @click="emit('estado-barbero-siguiente', false)">Cambiar horario</v-btn>
            </div>

            <div v-else class="lista-barberos">
                <div 
                    v-for="barbero in barberosDisponibles" 
                    :key="barbero.id" 
                    class="barbero-card" 
                    :class="{ 'barbero-seleccionado': reservaStore.barberoSeleccionado?.id === barbero.id }"
                    @click="seleccionarBarbero(barbero)"
                >
                    <v-btn 
                        size="x-small" 
                        class="btn-seleccionar" 
                        :class="{ 'btn-activo': reservaStore.barberoSeleccionado?.id === barbero.id }"
                        @click.stop="seleccionarBarbero(barbero)"
                    >
                        {{ reservaStore.barberoSeleccionado?.id === barbero.id ? 'Elegido' : 'Elegir' }}
                    </v-btn>

                    <div class="avatar-wrapper">
                        <v-avatar size="100" class="barbero-avatar">
                            <v-img :src="barbero.foto" />
                        </v-avatar>
                    </div>

                    <div class="barbero-info">
                        <span class="nombre-barbero">{{ barbero.nombre }} {{ barbero.apellido }}</span>
                        <v-btn variant="text" size="small" class="sobre-mi-btn" @click.stop="abrirDialog(barbero)">
                            Ver perfil
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>

        <!-- 🔹 Dialog con la información del barbero -->
        <v-dialog v-model="dialogVisible" max-width="500px">
            <v-card>
                <v-card-title class="text-h2">{{ barberoSeleccionado?.nombre }}</v-card-title>
                <v-card-text>
                    <v-avatar size="80" class="mb-4">
                        <v-img :src="barberoSeleccionado?.foto" />
                    </v-avatar>
                    <p>{{ barberoSeleccionado?.descripcion || 'Este barbero aún no tiene una descripción.' }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" text @click="dialogVisible = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { useBarberStore } from '@/stores/barber';
    import { useReservaStore } from '@/stores/reserva';

    const barberoStore = useBarberStore();
    const reservaStore = useReservaStore();
    const emit = defineEmits(['emit-barbero', 'estado-barbero-siguiente'])
    const dialogVisible = ref(false);
    const barberoSeleccionado = ref(null);
    const barberosDisponibles = ref([]);
    const loading = ref(false);

    const abrirDialog = (barbero) => {
        barberoSeleccionado.value = barbero;
        dialogVisible.value = true;
    };

    // ✅ CORREGIDO: Ahora recibe y guarda el objeto barbero completo
    const seleccionarBarbero = (barbero) => {
        if (reservaStore.barberoSeleccionado?.id === barbero.id) {
            // Deseleccionar
            reservaStore.setBarbero(null);
            console.log('❌ Deseleccionando barbero');
            emit('emit-barbero', null);
        } else {
            // Seleccionar - guardar objeto completo
            reservaStore.setBarbero(barbero); // ✅ Guardar objeto completo
            console.log('✅ Barbero seleccionado:', barbero);
            emit('emit-barbero', barbero);
        }
    };

    // 🔹 Cargar barberos cuando haya fecha y hora
    const cargarBarberosDisponibles = async () => {
        if (!reservaStore.tieneFechaYHora) {
            barberosDisponibles.value = [];
            return;
        }

        loading.value = true;
        try {
            const barberos = await barberoStore.getBarberosDisponibles(
                reservaStore.diaSemana,
                reservaStore.horaSeleccionada
            );
            
            console.log('✅ Barberos encontrados:', barberos);
            barberosDisponibles.value = barberos;
        } catch (error) {
            console.error('❌ Error cargando barberos:', error);
            barberosDisponibles.value = [];
        } finally {
            loading.value = false;
        }
    };

    // Watch para emitir si hay barbero o no
    watch(
        () => reservaStore.barberoSeleccionado,
        (barbero) => {
            const habilitar = barbero !== null && barbero !== undefined
            emit('estado-barbero-siguiente', habilitar)
        },
        { immediate: true }
    )

    // 🔹 Watch para recargar cuando cambie fecha/hora
    watch(
        () => [reservaStore.fechaSeleccionada, reservaStore.horaSeleccionada],
        () => {
            cargarBarberosDisponibles();
        },
        { immediate: true }
    );
</script>

<style scoped>
    .barbero-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        color: white;
    }

    .titulo-barberos {
        font-size: 1.8rem !important;
        font-weight: 800;
        color: white;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 30px !important;
    }

    .scroll-barberos {
        max-height: 550px;
        overflow-y: auto;
        padding-right: 15px;
    }

    /* Scrollbar */
    .scroll-barberos::-webkit-scrollbar {
        width: 6px;
    }

    .scroll-barberos::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
    }

    .scroll-barberos::-webkit-scrollbar-thumb {
        background: rgba(238, 111, 56, 0.3);
        border-radius: 10px;
    }

    .scroll-barberos::-webkit-scrollbar-thumb:hover {
        background: #ee6f38;
    }

    .lista-barberos {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 25px;
        margin-top: 20px;
    }

    .barbero-card {
        position: relative;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 20px !important;
        padding: 30px 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .barbero-card:hover {
        background: rgba(255, 255, 255, 0.07) !important;
        border-color: rgba(238, 111, 56, 0.4) !important;
        transform: translateY(-8px);
    }

    .barbero-seleccionado {
        background: rgba(238, 111, 56, 0.1) !important;
        border-color: #ee6f38 !important;
        box-shadow: 0 10px 30px rgba(238, 111, 56, 0.15);
    }

    .avatar-wrapper {
        position: relative;
        margin-bottom: 20px;
    }

    .barbero-avatar {
        border: 3px solid rgba(255, 255, 255, 0.1);
        padding: 4px;
        transition: all 0.3s ease;
    }

    .barbero-seleccionado .barbero-avatar {
        border-color: #ee6f38;
        box-shadow: 0 0 20px rgba(238, 111, 56, 0.3);
    }

    .btn-seleccionar {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        border-radius: 10px !important;
        padding: 4px 12px !important;
        transition: all 0.3s ease;
    }

    .btn-activo {
        background: #ee6f38 !important;
        border-color: #ee6f38 !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(238, 111, 56, 0.3);
    }

    .barbero-info {
        width: 100%;
    }

    .nombre-barbero {
        display: block;
        font-size: 1.2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
    }

    .sobre-mi-btn {
        text-transform: uppercase;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
        color: rgba(255, 255, 255, 0.4);
        transition: color 0.3s ease;
    }

    .sobre-mi-btn:hover {
        color: #ee6f38;
    }

    @media (max-width: 600px) {
        .barbero-container {
            padding: 20px;
        }
        .lista-barberos {
            grid-template-columns: 1fr;
        }
    }
</style>