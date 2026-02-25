<template>
    <div>
        <v-icon class="fa-solid fa-cart-shopping carrito" @click="activarCarrito"></v-icon>
        <DetallesCompra :dialog="estadoCarrito" @update:dialog="estadoCarrito = $event"></DetallesCompra>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { useCarritoStore } from '@/stores/carrito'
    import DetallesCompra from '@/components/shared/DetallesCompra.vue'

    const estadoCarrito = ref(false)
    const carritoStore = useCarritoStore()

    const activarCarrito = () => {
        // open dialog in child component via prop, we could also toggle store but we'll keep prop
        estadoCarrito.value = true
    }
</script>

<style scoped>
    .carrito {
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s ease;
        
    }

    .carrito:hover {
        color: #ee6f38;
    } 
</style>