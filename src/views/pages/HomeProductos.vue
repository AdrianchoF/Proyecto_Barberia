<template>
  <section id="productos-section" class="products-wrapper">
    <!-- Cinta Promocional Inferior -->
    <div v-if="cintaProductos && cintaProductos.activo" class="promo-ticker-modern">
      <div class="ticker-content">
        <span v-for="n in 10" :key="n" class="ticker-text">
          <i class="fas fa-shopping-bag mr-2"></i> {{ cintaProductos.texto }}
        </span>
      </div>
    </div>

    <v-container class="py-16 main-products-container">
      <div class="text-center mb-12 header-animation">
        <span class="section-tagline">PRODUCTOS DE CALIDAD</span>
        <h2 class="section-title-modern">NUESTRA <span class="text-orange">GALERÍA</span></h2>
        <div class="title-underline"></div>
      </div>

      <!-- Sistema de Tabs Moderno -->
      <v-tabs
        v-model="tab"
        bg-color="transparent"
        color="#ee6f38"
        align-tabs="center"
        class="modern-tabs mb-10"
        hide-slider
      >
        <v-tab 
          v-for="categoria in categorias" 
          :key="categoria.id" 
          :value="categoria.id"
          class="category-tab"
        >
          <i :class="getIcon(categoria.id)" class="mr-2"></i>
          {{ categoria.nombre }}
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
          <v-row v-if="loading" justify="center" class="py-10">
            <v-progress-circular indeterminate color="#ee6f38" size="50" />
          </v-row>
          
          <v-row v-else-if="productosFiltrados.length > 0" class="product-grid">
            <v-col 
              v-for="producto in productosFiltrados" 
              :key="producto.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
              class="d-flex"
            >
              <ProductoCard 
                :producto="producto" 
                @ver-detalles="abrirDetalles"
                @agregar-carrito="agregarAlCarrito"
              />
            </v-col>
          </v-row>
          
          <v-row v-else justify="center" class="py-10">
            <div class="empty-state">
               <i class="fas fa-box-open fa-3x mb-4 opacity-30"></i>
               <p>No hay productos en esta categoría por ahora.</p>
            </div>
          </v-row>
        </v-window-item>
      </v-window>
    </v-container>
    
    <DetallesCard 
      v-model:mostrar="showDetalles" 
      :producto="productoSeleccionado" 
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCategoriaProductoStore } from '@/stores/CategoriaProducto';
import { useProductoStore } from '@/stores/producto';
import { useCintaStore } from '@/stores/cintas';
import { useCarritoStore } from '@/stores/carrito';
import ProductoCard from '@/components/shared/ProductoCard.vue';
import DetallesCard from '@/components/shared/DetallesCard.vue';

const categoriaStore = useCategoriaProductoStore();
const productoStore = useProductoStore();
const cintaStore = useCintaStore();
const carritoStore = useCarritoStore();

const tab = ref(null);
const loading = ref(false);
const showDetalles = ref(false);
const productoSeleccionado = ref(null);

const categorias = computed(() => categoriaStore.categoriasProducto);
const productosFiltrados = computed(() => {
  const base = productoStore.productos.filter(p => p.publicado);
  if (!tab.value) return base;
  return base.filter(p => p.categoriaId === tab.value);
});

const cintaProductos = computed(() => {
  return cintaStore.cintas.find(c => c.ubicacion === 'productos');
});

const abrirDetalles = (producto) => {
  productoSeleccionado.value = producto;
  showDetalles.value = true;
};

const agregarAlCarrito = (producto) => {
  carritoStore.agregarProducto(producto);
};

const getIcon = (id) => {
  const icons = {
    1: 'fas fa-cut',
    2: 'fas fa-spray-can',
    3: 'fas fa-user-tie'
  };
  return icons[id] || 'fas fa-tag';
};

onMounted(async () => {
  loading.value = true;
  try {
    if (categoriaStore.categoriasProducto.length === 0) await categoriaStore.getCategoriasProducto();
    if (productoStore.productos.length === 0) await productoStore.getProductos(true); // onlyPublished = true
    if (cintaStore.cintas.length === 0) await cintaStore.getCintas();
    
    if (categorias.value.length > 0) {
      tab.value = categorias.value[0].id;
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
    .products-wrapper {
        background-color: #0a0a0a;
        padding-bottom: 80px;
    }

    .main-products-container {
        margin-top: 40px;
    }

    .promo-ticker-modern {
        height: 45px;
        line-height: 45px;
        font-size: 18px;
        overflow: hidden;
        background: linear-gradient(90deg, #ee6f38, #ff8c5a);
        color: white;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .ticker-content {
        display: inline-block;
        animation: scroll-ticker 30s linear infinite;
    }

    @keyframes scroll-ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    .product-grid {
        margin: 0 -15px;
    }

    .category-tab {
        font-weight: 700 !important;
        letter-spacing: 1px;
        transition: all 0.3s ease;
    }

    .section-tagline {
        color: #ee6f38;
        font-weight: 700;
        letter-spacing: 3px;
        font-size: 13px;
        display: block;
        margin-bottom: 8px;
    }

    .section-title-modern {
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 900;
        color: white;
        margin-bottom: 15px;
    }
</style>
