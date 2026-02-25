<template>
    <v-card class="pa-4">
        <v-card-title>Crear producto</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="crearProducto" v-model="valid">
                <v-text-field label="Código del producto" v-model="form.codigo" />
                <v-text-field label="Nombre del producto" v-model="form.nombre" :rules="[v => !!v || 'El nombre es requerido']" required />
                <v-textarea label="Descripción del producto" v-model="form.descripcion" :rules="[v => !!v || 'La descripción es requerida']" auto-grow required />
                <v-text-field label="Precio del producto" v-model.number="form.precio"type="number" prefix="$" step="0.01":rules="[v => !!v || 'El precio es requerido', v => (v && !isNaN(parseFloat(v))) || 'El precio debe ser un número']" required />
                <v-text-field label="Stock del producto" v-model.number="form.stock"type="number":rules="[v => !!v || 'El stock es requerido', v => (v && Number.isInteger(Number(v))) || 'El debe ser un número entero']" required />
                <v-text-field label="Imagen del producto" v-model="form.imagenUrl" :rules="[v => !!v || 'La imagen es requerida']" required />
                <v-select label="Categoría del producto" v-model="form.categoriaId" :items="categorias" item-title="nombre" item-value="id" :rules="[v => !!v || 'La categoría es requerida']" :loading="loading"required/>
                <v-btn color="primary" class="mt-4" type="submit":disabled="!valid">Guardar producto</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarMessage }}
    </v-snackbar>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useProductoStore } from '@/stores/producto'
    import { useCategoriaProductoStore } from '@/stores/CategoriaProducto'

    // Mantener nombre del componente
    defineOptions({ name: 'CrearProducto' })

    const productoStore = useProductoStore()
    const categoriaProductoStore = useCategoriaProductoStore()
    const form = ref({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagenUrl: '',
    categoriaId: null
    })

    const valid = ref(false)
    const snackbar = ref(false)
    const snackbarMessage = ref('')
    const snackbarColor = ref('green')
    const loading = ref(false)
    const categorias = ref([])

    const getCategorias = async () => {
    loading.value = true
    try {
        const data = await categoriaProductoStore.getCategoriasProducto()
        categorias.value = data
        console.log('Categorías cargadas:', data)
    } catch (error) {
        console.error('Error al cargar categorías:', error)
    } finally {
        loading.value = false
    }
    }

    onMounted(() => {
    getCategorias()
    })

    const crearProducto = async () => {
    if (!valid.value) return

    // Asegurar que precio y stock sean números
    const payload = {
        codigo: form.value.codigo || undefined,
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        precio: Number(form.value.precio),
        stock: Number(form.value.stock),
        imagenUrl: form.value.imagenUrl,
        categoriaId: Number(form.value.categoriaId)
    }

    console.log('Enviando payload:', payload)

    try {
        const response = await productoStore.createProducto(payload)
        if (response) {
        snackbarMessage.value = 'Producto creado exitosamente'
        snackbarColor.value = 'green'
        snackbar.value = true
        form.value = {
            nombre: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            imagenUrl: '',
            categoriaId: null
        }
        }
    } catch (error) {
        console.error('Error al crear producto:', error)
        snackbarMessage.value = 'Error al crear el producto'
        snackbarColor.value = 'error'
        snackbar.value = true
    }
    }
</script>