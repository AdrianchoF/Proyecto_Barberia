<template>
    <v-container fluid class="py-6">
        <!-- Título -->
        <h1 class="text-h4 mb-6">Gestionar Proveedores</h1>

        <!-- Card con Formulario -->
        <v-card class="mb-6 pa-6">
            <v-card-title class="text-h6 mb-4">Crear nuevo proveedor</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="crearProveedor" v-model="validCrear">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                label="Nombre del proveedor"
                                v-model="form.nombre"
                                :rules="[v => !!v || 'El nombre es requerido']"
                                required
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                label="Teléfono"
                                v-model="form.telefono"
                                type="tel"
                                :rules="[v => !!v || 'El teléfono es requerido']"
                                required
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                label="Email"
                                v-model="form.email"
                                type="email"
                                :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'El email debe ser válido']"
                                required
                            />
                        </v-col>
                        <v-col cols="12" sm="6"></v-col>
                        <v-col cols="12">
                            <v-text-field
                                label="Dirección"
                                v-model="form.direccion"
                                :rules="[v => !!v || 'La dirección es requerida']"
                                required
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-btn color="primary" class="mt-2" type="submit" :disabled="!validCrear" :loading="proveedorStore.loading">
                                <i class="fas fa-plus me-2"></i>
                                Guardar proveedor
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- Card con Tabla de Proveedores -->
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center text-h6 mb-4">
                Lista de Proveedores
                <v-btn
                    size="small"
                    color="primary"
                    @click="recargarProveedores"
                    :loading="proveedorStore.loading"
                    icon
                >
                    <i class="fas fa-sync"></i>
                </v-btn>
            </v-card-title>

            <v-card-text>
                <!-- Loading -->
                <v-progress-linear v-if="proveedorStore.loading" indeterminate color="primary" />

                <!-- Error -->
                <v-alert v-if="proveedorStore.error" type="error" class="mb-4">
                    {{ proveedorStore.error }}
                </v-alert>

                <!-- No hay proveedores -->
                <v-alert v-if="!proveedorStore.loading && proveedorStore.proveedores.length === 0" type="info" class="mb-4">
                    No hay proveedores disponibles
                </v-alert>

                <!-- Tabla de proveedores -->
                <v-table v-if="proveedorStore.proveedores.length > 0" class="elevation-1">
                    <thead>
                        <tr>
                            <th class="text-left">Nombre</th>
                            <th class="text-left">Dirección</th>
                            <th class="text-left">Teléfono</th>
                            <th class="text-left">Email</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="proveedor in proveedorStore.proveedores" :key="proveedor.id">
                            <td>{{ proveedor.nombre }}</td>
                            <td>{{ proveedor.direccion }}</td>
                            <td>{{ proveedor.telefono }}</td>
                            <td>{{ proveedor.email }}</td>
                            <td class="text-center">
                                <v-btn
                                    size="small"
                                    color="warning"
                                    variant="text"
                                    @click="editarProveedor(proveedor)"
                                    title="Editar"
                                    icon
                                >
                                    <i class="fas fa-edit"></i>
                                </v-btn>
                                <v-btn
                                    size="small"
                                    color="error"
                                    variant="text"
                                    @click="confirmarEliminar(proveedor)"
                                    title="Eliminar"
                                    icon
                                >
                                    <i class="fas fa-trash"></i>
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>

        <!-- Dialog para editar -->
        <v-dialog v-model="dialogEditar" persistent max-width="500">
            <v-card>
                <v-card-title>Editar proveedor</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="guardarEdicion" v-model="validEditar">
                        <v-text-field
                            label="Nombre del proveedor"
                            v-model="formEditar.nombre"
                            :rules="[v => !!v || 'El nombre es requerido']"
                            required
                        />
                        <v-text-field
                            label="Dirección"
                            v-model="formEditar.direccion"
                            :rules="[v => !!v || 'La dirección es requerida']"
                            required
                        />
                        <v-text-field
                            label="Teléfono"
                            v-model="formEditar.telefono"
                            type="tel"
                            :rules="[v => !!v || 'El teléfono es requerido']"
                            required
                        />
                        <v-text-field
                            label="Email"
                            v-model="formEditar.email"
                            type="email"
                            :rules="[v => !!v || 'El email es requerido', v => /.+@.+\..+/.test(v) || 'El email debe ser válido']"
                            required
                        />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="dialogEditar = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="guardarEdicion" :disabled="!validEditar" :loading="proveedorStore.loading">
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog para confirmar eliminación -->
        <v-dialog v-model="dialogEliminar" persistent max-width="400">
            <v-card>
                <v-card-title>Confirmar eliminación</v-card-title>
                <v-card-text>
                    ¿Está seguro de que desea eliminar el proveedor <strong>{{ proveedorAEliminar?.nombre }}</strong>?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="dialogEliminar = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="error" variant="text" @click="eliminarProveedor" :loading="proveedorStore.loading">
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar para mensajes -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
            {{ snackbarMessage }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useProveedorStore } from '@/stores/proveedor'

    defineOptions({ name: 'Proveedores' })

    const proveedorStore = useProveedorStore()
    const form = ref({
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
    })

    const validCrear = ref(false)
    const dialogEditar = ref(false)
    const dialogEliminar = ref(false)
    const validEditar = ref(false)
    const snackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('green')
    const proveedorAEliminar = ref(null)
    const formEditar = ref({
        id: null,
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
    })

    onMounted(async () => {
        await recargarProveedores()
    })

    const recargarProveedores = async () => {
        await proveedorStore.getProveedores()
    }

    const crearProveedor = async () => {
        if (!validCrear.value) return

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

    const editarProveedor = (proveedor) => {
        formEditar.value = { ...proveedor }
        dialogEditar.value = true
    }

    const guardarEdicion = async () => {
        if (!validEditar.value) return

        try {
            await proveedorStore.updateProveedor(formEditar.value.id, {
                nombre: formEditar.value.nombre,
                direccion: formEditar.value.direccion,
                telefono: formEditar.value.telefono,
                email: formEditar.value.email
            })
            snackbarMessage.value = 'Proveedor actualizado exitosamente'
            snackbarColor.value = 'green'
            snackbar.value = true
            dialogEditar.value = false
        } catch (error) {
            console.error('Error al actualizar proveedor:', error)
            snackbarMessage.value = proveedorStore.error || 'Error al actualizar el proveedor'
            snackbarColor.value = 'error'
            snackbar.value = true
        }
    }

    const confirmarEliminar = (proveedor) => {
        proveedorAEliminar.value = proveedor
        dialogEliminar.value = true
    }

    const eliminarProveedor = async () => {
        try {
            await proveedorStore.deleteProveedor(proveedorAEliminar.value.id)
            snackbarMessage.value = 'Proveedor eliminado exitosamente'
            snackbarColor.value = 'green'
            snackbar.value = true
            dialogEliminar.value = false
            proveedorAEliminar.value = null
        } catch (error) {
            console.error('Error al eliminar proveedor:', error)
            snackbarMessage.value = proveedorStore.error || 'Error al eliminar el proveedor'
            snackbarColor.value = 'error'
            snackbar.value = true
        }
    }
</script>
