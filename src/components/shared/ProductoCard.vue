<template>
    <v-card class="producto-card-modern" elevation="0">
        <div class="card-inner">
            <div class="image-container">
                <img :src="producto.imagenUrl || producto.img || defaultImage" :alt="producto.nombre" class="producto-img">
                <div class="price-tag">$ {{ (producto.precio_venta != null ? producto.precio_venta : producto.precio).toLocaleString() }}</div>
            </div>
            
            <v-card-text class="info-producto text-center">
                <h3 class="nombre-producto">{{ producto.nombre }}</h3>
                <div class="spacer-line"></div>
                
                <div class="botones-container mt-4">
                    <v-btn 
                        variant="text" 
                        color="white" 
                        class="btn-action-modern" 
                        @click="emitirverDetalles"
                    >
                        <i class="fas fa-eye mr-2"></i> VER DETALLES
                    </v-btn>
                    
                    <v-btn 
                        block 
                        color="#ee6f38" 
                        class="btn-cart-modern mt-2" 
                        rounded="lg"
                        @click="emitirAgregarCarrito"
                    >
                        <i class="fas fa-shopping-cart mr-2"></i> AGREGAR
                    </v-btn>
                </div>
            </v-card-text>
        </div>
    </v-card>
</template>

<script setup>
    const props = defineProps({
        producto: {
            type: Object,
            required: true
        }
    })

    const emit = defineEmits(['ver-detalles', 'agregar-carrito'])

    const defaultImage = '/public/imagenes/logo/logo2.png'

    const emitirverDetalles = () => {
        emit('ver-detalles', props.producto)
    }

    const emitirAgregarCarrito = () => {
        emit('agregar-carrito', props.producto)
    }
</script>

<style scoped>
    .producto-card-modern {
        background: rgba(255, 255, 255, 0.03) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 20px !important;
        overflow: visible !important; /* Crucial for hover scale */
        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        display: flex;
        flex-direction: column;
        height: 100%; /* Uniform height */
        margin: 10px; /* Space for scaling */
    }

    .card-inner {
        padding: 20px;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .producto-card-modern:hover {
        transform: translateY(-10px) scale(1.02);
        background: rgba(255, 255, 255, 0.07) !important;
        border-color: rgba(238, 111, 56, 0.5) !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        z-index: 10;
    }

    .image-container {
        position: relative;
        width: 100%;
        padding-top: 100%; /* Square aspect ratio */
        border-radius: 15px;
        overflow: hidden;
        margin-bottom: 20px;
        background: rgba(0, 0, 0, 0.2);
    }

    .producto-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 15px;
        transition: transform 0.5s ease;
    }

    .producto-card-modern:hover .producto-img {
        transform: scale(1.1);
    }

    .price-tag {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #ee6f38;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 800;
        font-size: 0.9rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .info-producto {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 !important;
    }

    .nombre-producto {
        font-size: 1.1rem;
        font-weight: 800;
        color: white;
        margin-bottom: 12px;
        line-height: 1.4;
        min-height: 3rem; /* Max 2 lines height approx */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .spacer-line {
        width: 40px;
        height: 2px;
        background: rgba(238, 111, 56, 0.3);
        margin: 0 auto;
    }

    .botones-container {
        margin-top: auto;
    }

    .btn-action-modern {
        font-weight: 700 !important;
        letter-spacing: 1px !important;
        font-size: 0.75rem !important;
    }

    .btn-cart-modern {
        font-weight: 800 !important;
        letter-spacing: 1px !important;
        height: 44px !important;
    }
</style>
