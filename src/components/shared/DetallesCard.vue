<template>
    <v-dialog :model-value="mostrar" @update:model-value="onDialogToggle" max-width="1000">
        <v-card class="detalle-card">
            <v-row>
                <v-col cols="12" md="6">
                    <v-img :src="producto?.img" aspect-ratio="1" class="imagen-modal" />
                </v-col>
                <v-col cols="12" md="6">
                    <h3 class="titulodialog">{{ producto?.nombre }}</h3>
                    <p class="resumenproduc"> {{ producto?.resumen }} </p>
                    <div class="detallesdelproduc">
                        <h4>Ingredientes</h4>
                            <p> {{ producto?.ingredientes }} </p> 
                        <h4>Modo de uso</h4>
                            <p> {{ producto?.modo_uso }} </p>
                        <h4>Cantidades de presentacion</h4>
                            <p> {{ producto?.cantidades }} </p>
                        <h4>Beneficios</h4>
                            <ul>
                                <li v-for="(beneficio, i) in producto?.beneficios" :key="i"> {{ beneficio }} </li>
                            </ul>
                    </div>
                </v-col>
                <v-btn color="#ee6f38" @click="cerrarDetalles" class="btndialog">Cerrar</v-btn>
            </v-row>
        </v-card>
    </v-dialog>
</template>

<script setup>
    // receive values from parent rather than using legacy store
    const props = defineProps({
        mostrar: Boolean,
        producto: Object
    });
    const emit = defineEmits(['update:mostrar']);

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

    .btndialog {
        margin-bottom: 1%;
        margin-left: 90%;
    }
</style>