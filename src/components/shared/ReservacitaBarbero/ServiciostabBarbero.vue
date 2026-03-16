<template>
    <v-container class="servicios-container">
        <div class="header-container">
            <h3 class="text-h4 titulo-servicios">Selecciona un servicio</h3>
            
            <div class="categoria-chips-container">
                <v-chip-group v-model="categoriaActiva" mandatory>
                    <v-chip
                        v-for="categoria in categoriasOrdenadas"
                        :key="categoria.id"
                        :value="categoria.id"
                        :color="categoriaActiva === categoria.id ? '#ee6f38' : 'default'"
                        :variant="categoriaActiva === categoria.id ? 'elevated' : 'outlined'"
                        @click="scrollToCategoria(categoria.id)"
                        class="chip-categoria"
                        size="small"
                        density="comfortable"
                    >
                        {{ categoria.nombre }}
                    </v-chip>
                </v-chip-group>
            </div>
        </div>

        <div class="scroll-servicios" ref="scrollContainer" @scroll="onScroll">
            <div
                v-for="categoria in categoriasOrdenadas"
                :key="categoria.id"
                :ref="el => setCategoriaRef(categoria.id, el)"
                class="categoria-seccion"
                :data-categoria-id="categoria.id"
            >
                <h4 class="categoria-titulo">
                    {{ categoria.nombre }}
                </h4>

                <div class="lista-servicios">
                    <div
                        v-for="servicio in serviciosPorCategoria[categoria.id]"
                        :key="servicio.id"
                        class="servicio-card"
                        :class="{ 'servicio-seleccionado': serviciosSeleccionados.includes(servicio.id) }"
                        @click="toggleSeleccion(servicio.id)"
                    >
                        <div class="card-content">
                            <div class="card-info">
                                <h5 class="servicio-nombre">{{ servicio.nombre }}</h5>
                                <p class="servicio-descripcion">{{ servicio.descripcion }}</p>
                                <div class="servicio-meta">
                                    <span><i class="fas fa-tag"></i> {{ servicio.precio || 'Consultar' }}</span>
                                    <span><i class="fas fa-clock"></i> {{ servicio.duracionAprox }}</span>
                                </div>
                            </div>

                            <v-btn
                                icon
                                size="small"
                                class="btn-seleccionar"
                                @click.stop="toggleSeleccion(servicio.id)"
                            >
                                <i
                                    :class="[
                                        'fa-solid',
                                        serviciosSeleccionados.includes(servicio.id) ? 'fa-check' : 'fa-plus',
                                        serviciosSeleccionados.includes(servicio.id) ? 'icono-seleccionado' : 'icono-normal'
                                    ]"
                                ></i>
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog con detalles -->
        <v-dialog v-model="dialog" max-width="600">
            <v-card v-if="servicioSeleccionado" class="detail-dialog-card">
                <v-card-title class="text-h2">
                    {{ servicioSeleccionado.nombre }}
                </v-card-title>
                <v-card-text>
                    <p>{{ servicioSeleccionado.descripcion }}</p>
                    <br />
                    <p><strong>Precio:</strong> {{ servicioSeleccionado.precio || 'No registrado' }}</p>
                    <p><strong>Duración Aproximada:</strong> {{ servicioSeleccionado.duracionAprox }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="dialog = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
    import { ref, onMounted, watch, computed } from 'vue'
    import { useServiceStore } from '@/stores/services'
    import { useReservaBarberoStore } from '@/stores/reservaBarbero'
    import { useCategoriaServicioStore } from '@/stores/CategoriaServicio'

    const ServicioStore = useServiceStore()
    const reservaBarberoStore = useReservaBarberoStore()
    const categoriaServicioStore = useCategoriaServicioStore()
    
    const emit = defineEmits(['seleccionados', 'estado-servicio-siguiente'])
    
    const dialog = ref(false)
    const servicioSeleccionado = ref(null)
    const serviciosSeleccionados = ref([])
    const categorias = ref([])
    const categoriaActiva = ref(null)
    const scrollContainer = ref(null)
    const categoriaRefs = ref({})
    const isScrolling = ref(false)

    // 🔹 Ordenar categorías - "Combos" de primero
    const categoriasOrdenadas = computed(() => {
        const cats = [...categorias.value]
        return cats.sort((a, b) => {
            if (a.nombre.toLowerCase() === 'combos') return -1
            if (b.nombre.toLowerCase() === 'combos') return 1
            return a.nombre.localeCompare(b.nombre)
        })
    })

    // 🔹 Agrupar servicios por categoría
    const serviciosPorCategoria = computed(() => {
        const agrupados = {}
        categoriasOrdenadas.value.forEach(cat => {
            agrupados[cat.id] = ServicioStore.services.filter(
                servicio => servicio.categoria?.id === cat.id
            )
        })
        return agrupados
    })

    const setCategoriaRef = (categoriaId, el) => {
        if (el) {
            categoriaRefs.value[categoriaId] = el
        }
    }

    const scrollToCategoria = (categoriaId) => {
        const elemento = categoriaRefs.value[categoriaId]
        if (elemento && scrollContainer.value) {
            isScrolling.value = true
            const offsetTop = elemento.offsetTop - 20
            scrollContainer.value.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            })
            
            setTimeout(() => {
                isScrolling.value = false
            }, 800)
        }
    }

    const onScroll = () => {
        if (isScrolling.value) return

        const scrollTop = scrollContainer.value?.scrollTop || 0
        let categoriaVisible = null

        for (const [categoriaId, elemento] of Object.entries(categoriaRefs.value)) {
            if (elemento) {
                const rect = elemento.getBoundingClientRect()
                const containerRect = scrollContainer.value.getBoundingClientRect()
                
                if (rect.top <= containerRect.top + 100 && rect.bottom > containerRect.top) {
                    categoriaVisible = parseInt(categoriaId)
                }
            }
        }

        if (categoriaVisible && categoriaActiva.value !== categoriaVisible) {
            categoriaActiva.value = categoriaVisible
        }
    }

    const toggleSeleccion = (id) => {
        const index = serviciosSeleccionados.value.indexOf(id)
        if (index > -1) {
            serviciosSeleccionados.value.splice(index, 1)
        } else {
            serviciosSeleccionados.value.push(id)
        }
        reservaBarberoStore.setServicios(serviciosSeleccionados.value)
        emit('seleccionados', serviciosSeleccionados.value)
    }

    const abrirDialog = (servicio) => {
        servicioSeleccionado.value = servicio
        dialog.value = true
    }

    watch(serviciosSeleccionados, (nuevoValor) => {
        const habilitarBtnenServicio = nuevoValor.length > 0
        emit('estado-servicio-siguiente', habilitarBtnenServicio)
    }, { deep: true })

    onMounted(async () => {
        await categoriaServicioStore.getCategoriasServicio()
        categorias.value = categoriaServicioStore.categoriasServicio
        
        await ServicioStore.getServices()

        if (categoriasOrdenadas.value.length > 0) {
            categoriaActiva.value = categoriasOrdenadas.value[0].id
        }

        if (reservaBarberoStore.serviciosSeleccionados.length > 0) {
            serviciosSeleccionados.value = [...reservaBarberoStore.serviciosSeleccionados]
        }
    })
</script>

<style scoped>
    .servicios-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        color: white;
    }

    .header-container {
        margin-bottom: 40px;
    }

    .titulo-servicios {
        font-size: 1.8rem !important;
        font-weight: 800;
        color: white;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 25px !important;
    }

    .categoria-chips-container {
        background: rgba(255, 255, 255, 0.03);
        padding: 10px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .chip-categoria {
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.7rem !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .chip-categoria:hover {
        border-color: #ee6f38 !important;
        background: rgba(238, 111, 56, 0.1);
    }

    .scroll-servicios {
        max-height: calc(100vh - 380px);
        overflow-y: auto;
        padding-right: 15px;
        padding-bottom: 2px;
    }

    .scroll-servicios::-webkit-scrollbar {
        width: 6px;
    }
    .scroll-servicios::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
    }
    .scroll-servicios::-webkit-scrollbar-thumb {
        background: rgba(238, 111, 56, 0.3);
        border-radius: 10px;
    }
    .scroll-servicios::-webkit-scrollbar-thumb:hover {
        background: #ee6f38;
    }

    .categoria-seccion {
        margin-bottom: 45px;
        scroll-margin-top: 30px;
    }

    .categoria-titulo {
        color: #ee6f38;
        font-weight: 700;
        font-size: 1.1rem !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px !important;
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .categoria-titulo::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(238, 111, 56, 0.3), transparent);
    }

    .lista-servicios {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .servicio-card {
        position: relative;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 15px !important;
        padding: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        overflow: hidden;
    }

    .servicio-card:hover {
        background: rgba(255, 255, 255, 0.07) !important;
        border-color: rgba(238, 111, 56, 0.4) !important;
        transform: translateX(8px);
    }

    .servicio-seleccionado {
        background: rgba(238, 111, 56, 0.1) !important;
        border-color: #ee6f38 !important;
        box-shadow: 0 0 20px rgba(238, 111, 56, 0.15);
    }

    .card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-info {
        flex: 1;
    }

    .servicio-nombre {
        font-size: 1.1rem !important;
        font-weight: 700;
        color: white;
        margin-bottom: 4px !important;
        padding: 0 !important;
    }

    .servicio-descripcion {
        font-size: 0.85rem !important;
        color: rgba(255, 255, 255, 0.5) !important;
        line-height: 1.4;
        margin-bottom: 12px !important;
        padding: 0 !important;
    }

    .servicio-meta {
        display: flex;
        gap: 20px;
        font-size: 0.8rem;
        color: #ee6f38 !important;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .servicio-meta i {
        margin-right: 6px;
        opacity: 0.8;
    }

    .btn-seleccionar {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        border-radius: 10px !important;
        width: 38px;
        height: 38px;
        transition: all 0.3s ease;
    }

    .servicio-seleccionado .btn-seleccionar {
        background: #ee6f38 !important;
        border-color: #ee6f38 !important;
        color: white !important;
    }

    .icono-seleccionado { color: white; }
    .icono-normal { color: rgba(255, 255, 255, 0.3); }

    .detail-dialog-card {
        background: #121212 !important;
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 25px !important;
    }

    @media (max-width: 600px) {
        .servicios-container { padding: 20px; }
    }
</style>