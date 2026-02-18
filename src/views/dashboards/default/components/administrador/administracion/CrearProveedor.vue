<template>
    <v-card class="pa-4">
        <v-card-title>Crear proveedor</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="crearProveedor" v-model="valid">
                <v-text-field
                    label="Nombre del proveedor"
                    v-model="form.nombre"
                    :rules="[v => !!v || 'El nombre es requerido']"
                    required
                />
                <v-text-field
                    label="Dirección"
                    v-model="form.direccion"
                    :rules="[v => !!v || 'La dirección es requerida']"
                    required
                />
                <v-text-field
                    label="Teléfono"
                    v-model="form.telefono"
                    type="tel"
                    :rules="[v => !!v || 'El teléfono es requerido']"
                    required
                />
                <v-text-field
                    label="Email"
                    v-model="form.email"
                    type="email"
                    :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'El email debe ser válido']"
                    required
                />
                <v-btn color="primary" class="mt-4" type="submit" :disabled="!valid">
                    Guardar proveedor
                </v-btn>
            </v-form>
        </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarMessage }}
    </v-snackbar>
</template>

<script setup>
    import { ref } from 'vue'
    import { useProveedorStore } from '@/stores/proveedor'

    defineOptions({ name: 'CrearProveedor' })

    const proveedorStore = useProveedorStore()
    const form = ref({
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
    })

    const valid = ref(false)
    const snackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('green')

    const crearProveedor = async () => {
        if (!valid.value) return

        try {
            const response = await proveedorStore.createProveedor(form.value)
            if (response) {
                snackbarMessage.value = 'Proveedor creado exitosamente'
                snackbarColor.value = 'green'
                snackbar.value = true
                form.value = {
                    nombre: '',
                    direccion: '',
                    telefono: '',
                    email: ''
                }
            }
        } catch (error) {
            console.error('Error al crear proveedor:', error)
            snackbarMessage.value = proveedorStore.error || 'Error al crear el proveedor'
            snackbarColor.value = 'error'
            snackbar.value = true
        }
    }
</script>
