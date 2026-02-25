<template>
    <div>
        <div class="promo-ticker">
            <div class="promo-track">
                <span>👉🏻 POR LA COMPRA DE MAS DE 3 PRODUCTOS DE NUESTRA SECCION OBTEN UN 10% EN EL TOTAL DE LA COMPRA 🤑🚨</span>
            </div>
        </div>
    </div>
    <section id="productos-section" class="v-container">
        <h2 class="tituloprincipal">PRODUCTOS QUE NECESITAS | Los mas top</h2>

        <!-- Tabs para las categorías -->
        <v-tabs v-model="Tabactivado" align-tabs="center" color="black">
            <v-tab v-for="(categoria, index) in categorias" :key="index" class="tab-categoria">
                {{ categoria.nombre }}
            </v-tab>
        </v-tabs>

        <!-- Contenido de las pestañas -->
        <v-window v-model="Tabactivado">
            <v-window-item v-for="(categoria, index) in categorias" :key="index">
                <div class="productos-grid">
                    <ProductoCard v-for="producto in categoria.productos" :key="producto.id" :producto="producto" @ver-detalles="emitirverDetalles" @agregar-carrito="AgregaralCarrito"></ProductoCard>
                </div>
            </v-window-item>
        </v-window>

        <DetallesCard
            :mostrar="mostrarDetalles"
            :producto="productoSeleccionado"
            @update:mostrar="val => mostrarDetalles = val"
        />
    </section>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useProductoStore } from '@/stores/producto'
    import { useCarritoStore } from '@/stores/carrito'
    import ProductoCard from '@/components/shared/ProductoCard.vue'
    import DetallesCard from '@/components/shared/DetallesCard.vue'

    // Estado local
    const Tabactivado = ref(0)
    const mostrarDetalles = ref(false)
    const productoSeleccionado = ref(null)

    // Stores
    const productoStore = useProductoStore()
    const carritoStore = useCarritoStore()

    const categorias = computed(() => {
        const map = {}
        productoStore.productos.forEach(p => {
            if (!p.publicado) return
            const nombre = p.categoria?.nombre || 'Sin categoría'
            if (!map[nombre]) {
                map[nombre] = { nombre, productos: [] }
            }
            map[nombre].productos.push(p)
        })
        return Object.values(map)
    })

    const emitirverDetalles = (producto) => {
        productoSeleccionado.value = producto
        mostrarDetalles.value = true
    }

    const AgregaralCarrito = (producto) => {
        carritoStore.agregar(producto)
    }

    onMounted(async () => {
        await productoStore.getProductos(true)
    })
</script>

<style scoped>
    .tituloprincipal {
        text-align: center;
        font-size: 2rem;
        margin-bottom: 30px;
        font-weight: bold;
        margin-top: 3%;
    }

    .tituloprincipal::after {
        content: '';
        display: block;
        width: 300px;
        height: 4px;
        margin: 8px auto 0 auto;
        background: linear-gradient(to right, #000, #fff, #000);
        border-radius: 2px;
        background-size: 200%;
        animation: animateGradient 3s linear infinite;
    }

    @keyframes animateGradient {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: 0 0;
        }
    }

    .v-container {
        width: 100%;
        padding: 20px;
    }

    .tab-categoria {
        font-weight: bold;
        margin: 0 10px;
        font-size: 1rem;
        letter-spacing: 1px;
    }

    .tab-categoria:hover {
        color: #ee6f38;
    }

    .productos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 24px;
        padding: 24px 12px;
        margin-top: 22px;
    }

    .promo-ticker {
        position: relative;
        top: -15px; /* Sube la cinta visualmente */
        z-index: 10;
        margin-bottom: -90px; /* Evita que el contenido se solape */
        height: 35px; /* Aumenta el valor a tu gusto */
        line-height: 15px; /* Centra verticalmente el texto */
        font-size: 20px; /* También puedes aumentar el tamaño del texto */
        overflow: hidden;
        background-color: #ee6f38;
        color: white;
        font-weight: bold;
        white-space: nowrap;
        padding: 10px 0;
    }

    .promo-track {
        text-align: center;
        font-size: 18px;
    }

    @media (max-width: 768px) {
        .tituloprincipal {
            font-size: 1.5rem;
            margin-top: 5%;
        }

        .productos-grid {
            grid-template-columns: 1fr;
            padding: 10px;
        }

        .tab-categoria {
            font-size: 0.9rem;
        }
    }
</style>