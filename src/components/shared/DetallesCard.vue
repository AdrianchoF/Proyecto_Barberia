<template>
    <v-dialog :model-value="mostrar" @update:model-value="onDialogToggle" max-width="1000">
        <v-card class="detalle-card">
            <v-row>
                <v-col cols="12" md="6">
                    <v-img :src="producto?.img || producto?.imagenUrl" aspect-ratio="1" class="imagen-modal" />
                </v-col>
                <v-col cols="12" md="6">
                    <h3 class="titulodialog">{{ producto?.nombre }}</h3>

                    <!-- Descripción pública (obligatoria) -->
                    <p class="resumenproduc">{{ producto?.descripcionPublica || producto?.resumen }}</p>

                    <!-- Detalles opcionales: solo se muestran si tienen contenido -->
                    <div class="detallesdelproduc" v-if="tieneDetalles">

                        <template v-if="producto?.ingredientes">
                            <h4>Ingredientes</h4>
                            <p>{{ producto.ingredientes }}</p>
                        </template>

                        <template v-if="producto?.modo_uso">
                            <h4>Modo de uso</h4>
                            <p>{{ producto.modo_uso }}</p>
                        </template>

                        <template v-if="producto?.cantidades">
                            <h4>Cantidades de presentación</h4>
                            <p>{{ producto.cantidades }}</p>
                        </template>

                        <template v-if="producto?.beneficios?.length">
                            <h4>Beneficios</h4>
                            <ul>
                                <li v-for="(beneficio, i) in producto.beneficios" :key="i">{{ beneficio }}</li>
                            </ul>
                        </template>

                    </div>
                </v-col>

                <v-btn color="#ee6f38" @click="cerrarDetalles" class="btndialog">Cerrar</v-btn>
            </v-row>
        </v-card>
    </v-dialog>
</template>

<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        mostrar: Boolean,
        producto: Object
    });
    const emit = defineEmits(['update:mostrar']);

    // Solo muestra la sección de detalles si al menos uno tiene contenido
    const tieneDetalles = computed(() => {
        const p = props.producto;
        if (!p) return false;
        return !!(
            p.ingredientes ||
            p.modo_uso ||
            p.cantidades ||
            (Array.isArray(p.beneficios) && p.beneficios.length)
        );
    });

    const onDialogToggle = (val) => {
        if (!val) emit('update:mostrar', false);
    };

    const cerrarDetalles = () => {
        emit('update:mostrar', false);
    };
</script>

<style scoped>
    .detalle-card {
        padding: 20px;
    }

    .imagen-modal {
        width: 90%;
        height: auto;
        border-radius: 8px;
    }

    .titulodialog {
        text-align: center;
        margin-bottom: 1%;
    }

    .resumenproduc {
        font-size: 15px;
    }

    .detallesdelproduc {
        margin-top: 1%;
    }

    .detallesdelproduc h4 {
        margin-top: 12px;
        margin-bottom: 4px;
    }

    .btndialog {
        margin-bottom: 1%;
        margin-left: 90%;
    }
</style>