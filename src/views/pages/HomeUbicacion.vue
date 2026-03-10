<template>
    <section id="ubicacion-section" class="v-container">
        <h2 class="tituloprincipal">¿COMO LLEGAR? | Nuestra Ubicacion</h2>
        <div class="mapa-ruta">
            <div id="map" class="map">
                <!-- Controles flotantes dentro del mapa -->
                <div class="map-controls">
                    <div class="controls-group">
                        <input v-model="origenTexto" placeholder="Punto de partida" class="input-floating" @keyup.enter="calculateRoute"/>
                        <div class="buttons-row">
                            <button @click="usarMiUbicacion" class="btn-floating btn-location">📍 Mi ubicación</button>
                            <button @click="toggleTracking" :class="['btn-floating', 'btn-tracking', { 'active': isTracking }]"> {{ isTracking ? '🔴 Detener' : '🎯 Seguir' }} </button>
                            <button @click="calculateRoute" class="btn-floating btn-route">🗺️ ¿Cómo llegar?</button>
                        </div>
                        <button v-if="routingControl" @click="clearRoute" class="btn-floating btn-clear">❌ Limpiar ruta</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
    import { onMounted, ref, computed } from 'vue';
    import { useConfiguracionStore } from '@/stores/configuracion';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import 'leaflet-routing-machine';
    import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
    import 'leaflet-control-geocoder';
    import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

    const configStore = useConfiguracionStore();

    // Coordenadas de StyleHub Barber Shop (Dinámicas)
    const barberLat = computed(() => configStore.config?.latitud || 8.752611);
    const barberLng = computed(() => configStore.config?.longitud || -75.884609);
    const barberNombre = computed(() => configStore.config?.nombre || 'StyleHub Barber Shop');

    const origenTexto = ref('');
    let origenCoords = null; // para guardar coordenadas del navegador
    let map;
    let routingControl;
    let userMarker = null;
    let watchId = null; // Para el seguimiento en tiempo real
    let isTracking = ref(false); // Estado del seguimiento

    // Geocodificar dirección usando Nominatim (gratuito)
    async function getCoordsFromAddress(address) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=co&q=${encodeURIComponent(address + ', Colombia')}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch (error) {
            console.error('Error geocoding:', error);
            return null;
        }
    }

    onMounted(async () => {
        // Cargar configuración de la base de datos
        await configStore.fetchConfiguracion();

        // Inicializar mapa
        map = L.map('map', {
            zoomControl: false // Removemos controles default para reposicionarlos
        }).setView([barberLat.value, barberLng.value], 14);

        // Agregar controles de zoom en posición personalizada
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // Capa de tiles gratuita
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Icono personalizado para la barbería
        const barberIcon = L.divIcon({
            className: 'custom-barber-icon',
            html: `
                <div class="marker-pin barber-pin">
                    <div class="marker-icon">✂️</div>
                </div>
            `,
            iconSize: [40, 50],
            iconAnchor: [20, 50],
            popupAnchor: [0, -50]
        });

        // Marcador de la barbería
        const barberMarker = L.marker([barberLat.value, barberLng.value], { icon: barberIcon })
            .addTo(map)
            .bindPopup(`
                <div class="custom-popup">
                    <h3>${barberNombre.value}</h3>
                    <p>📍 Tu destino</p>
                </div>
            `)
            .openPopup();

        // Tooltip permanente para la barbería
        barberMarker.bindTooltip(barberNombre.value, {
            permanent: true,
            direction: 'top',
            offset: [0, -55],
            className: 'custom-tooltip barber-tooltip'
        });
    });

    // obtiene coordenadas del navegador
    function usarMiUbicacion() {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        // Mostrar loading
        origenTexto.value = 'Obteniendo ubicación...';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                updateUserLocation(pos.coords.latitude, pos.coords.longitude);
                origenTexto.value = 'Mi ubicación actual';
            },
            (err) => {
                alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
                origenTexto.value = '';
                console.error('Geolocation error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    function toggleTracking() {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }

        if (isTracking.value) {
            // Detener seguimiento
            stopTracking();
        } else {
            // Iniciar seguimiento
            startTracking();
        }
    }

    function startTracking() {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }

        origenTexto.value = 'Siguiendo ubicación...';
        isTracking.value = true;

        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                updateUserLocation(pos.coords.latitude, pos.coords.longitude);
                origenTexto.value = 'Siguiendo ubicación en tiempo real';
                
                // Actualizar ruta automáticamente si existe una
                if (routingControl) {
                    updateRouteWithNewLocation(pos.coords.latitude, pos.coords.longitude);
                }
            },
            (err) => {
                console.error('Error en seguimiento:', err);
                stopTracking();
                alert('Error en el seguimiento de ubicación');
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000 // Cache por 5 segundos
            }
        );
    }

    function stopTracking() {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        isTracking.value = false;
        
        if (origenTexto.value.includes('Siguiendo')) {
            origenTexto.value = 'Mi ubicación actual';
        }
    }

    function updateUserLocation(lat, lng) {
        origenCoords = [lat, lng];

        // Remover marcador anterior del usuario si existe
        if (userMarker) {
            map.removeLayer(userMarker);
        }

        // Icono para ubicación del usuario
        const userIcon = L.divIcon({
            className: 'custom-user-icon',
            html: `
                <div class="marker-pin user-pin ${isTracking.value ? 'tracking' : ''}">
                    <div class="marker-icon">${isTracking.value ? '🎯' : '📍'}</div>
                </div>
            `,
            iconSize: [35, 45],
            iconAnchor: [17.5, 45],
            popupAnchor: [0, -45]
        });

        // Agregar marcador del usuario
        userMarker = L.marker(origenCoords, { icon: userIcon })
            .addTo(map)
            .bindPopup(`
                <div class="custom-popup">
                    <h3>Tu ubicación</h3>
                    <p>${isTracking.value ? '🎯 Siguiendo en tiempo real' : '📍 Punto de partida'}</p>
                </div>
            `);

        userMarker.bindTooltip(isTracking.value ? 'Siguiendo...' : 'Tu ubicación', {
            permanent: true,
            direction: 'top',
            offset: [0, -50],
            className: `custom-tooltip user-tooltip ${isTracking.value ? 'tracking' : ''}`
        });

        // Solo centrar si no hay ruta activa o si es la primera vez
        if (!routingControl || !isTracking.value) {
            const bounds = L.latLngBounds([origenCoords, [barberLat.value, barberLng.value]]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    function updateRouteWithNewLocation(lat, lng) {
        if (!routingControl) return;

        // Actualizar punto de origen de la ruta
        const newWaypoints = [
            L.latLng(lat, lng),
            L.latLng(barberLat.value, barberLng.value)
        ];

        routingControl.setWaypoints(newWaypoints);
    }

    async function calculateRoute() {
        let startLatLng = null;

        // Determinar coordenadas de origen
        if (origenCoords) {
            startLatLng = L.latLng(origenCoords[0], origenCoords[1]);
        } else if (origenTexto.value && origenTexto.value !== 'Obteniendo ubicación...') {
            const coords = await getCoordsFromAddress(origenTexto.value);
            if (!coords) {
                alert('No se encontró la dirección. Intenta ser más específico o usa tu ubicación actual.');
                return;
            }
            startLatLng = L.latLng(coords[0], coords[1]);

            // Agregar marcador para dirección buscada si no es la ubicación actual
            if (userMarker) {
                map.removeLayer(userMarker);
            }

            const searchIcon = L.divIcon({
                className: 'custom-search-icon',
                html: `
                    <div class="marker-pin search-pin">
                        <div class="marker-icon">🏠</div>
                    </div>
                `,
                iconSize: [35, 45],
                iconAnchor: [17.5, 45],
                popupAnchor: [0, -45]
            });

            userMarker = L.marker(startLatLng, { icon: searchIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="custom-popup">
                        <h3>Punto de partida</h3>
                        <p>📍 ${origenTexto.value}</p>
                    </div>
                `);
        } else {
            alert('Por favor, escribe una dirección o usa tu ubicación actual.');
            return;
        }

        // Limpiar ruta anterior
        if (routingControl) {
            map.removeControl(routingControl);
        }

        // Crear nueva ruta
        routingControl = L.Routing.control({
            waypoints: [
                startLatLng,
                L.latLng(barberLat.value, barberLng.value)
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    { color: '#ee6f38', weight: 6, opacity: 0.8 }
                ]
            },
            createMarker: function() {
                return null; // No crear marcadores automáticos
            },
            addWaypoints: false,
            show: true // Ocultar panel de instrucciones por defecto
        }).addTo(map);

        // Ajustar vista cuando se encuentra la ruta
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            
            // Mostrar información de la ruta
            const totalTime = Math.round(summary.totalTime / 60);
            const totalDistance = (summary.totalDistance / 1000).toFixed(1);
            
            // Agregar popup con información de la ruta
            const routeInfo = L.popup()
                .setLatLng(map.getCenter())
                .setContent(`
                    <div class="route-info">
                        <h3>🛣️ Ruta encontrada</h3>
                        <p><strong>Distancia:</strong> ${totalDistance} km</p>
                        <p><strong>Tiempo estimado:</strong> ${totalTime} min</p>
                    </div>
                `)
                .openOn(map);

            setTimeout(() => {
                map.closePopup(routeInfo);
            }, 5000);
        });

        routingControl.on('routingerror', function() {
            alert('No se pudo calcular la ruta. Intenta con otra dirección.');
        });
    }

    function clearRoute() {
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        
        if (userMarker && !isTracking.value) {
            map.removeLayer(userMarker);
            userMarker = null;
        }
        
        if (!isTracking.value) {
            origenTexto.value = '';
            origenCoords = null;
        }
        
        // Volver a la vista inicial solo si no está siguiendo
        if (!isTracking.value) {
            map.setView([barberLat.value, barberLng.value], 14);
        }
    }

    // Limpiar seguimiento al desmontar el componente
    onMounted(() => {
        stopTracking();
    });

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
        0% { background-position: 200% 0; }
        100% { background-position: 0 0; }
    }

    .mapa-ruta {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 2px solid #ee6f38;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(238, 111, 56, 0.2);
        overflow: hidden;
        background: #fff;
    }

    .map {
        width: 100%;
        height: 500px;
        position: relative;
        border-radius: 10px;
    }

    #ubicacion-section {
        margin-top: 120px;
        position: relative;
        z-index: 1;
    }

    /* Controles flotantes */
    .map-controls {
        position: absolute;
        top: 15px;
        left: 15px;
        z-index: 1000;
        pointer-events: none;
    }

    .controls-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: auto;
    }

    .input-floating {
        padding: 10px 12px;
        border: 2px solid #ee6f38;
        border-radius: 8px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 250px;
        outline: none;
        transition: all 0.3s ease;
    }

    .input-floating:focus {
        border-color: #d55e2d;
        box-shadow: 0 4px 16px rgba(238, 111, 56, 0.3);
        background: rgba(255, 255, 255, 1);
    }

    .buttons-row {
        display: flex;
        gap: 8px;
    }

    .btn-floating {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .btn-location {
        background: rgba(52, 152, 219, 0.9);
        color: white;
        flex: 1;
    }

    .btn-location:hover {
        background: rgba(41, 128, 185, 1);
        transform: translateY(-2px);
    }

    .btn-route {
        background: rgba(238, 111, 56, 0.9);
        color: white;
        flex: 1;
    }

    .btn-route:hover {
        background: rgba(213, 94, 45, 1);
        transform: translateY(-2px);
    }

    .btn-clear {
        background: rgba(231, 76, 60, 0.9);
        color: white;
        font-size: 11px;
        padding: 6px 8px;
    }

    .btn-clear:hover {
        background: rgba(192, 57, 43, 1);
        transform: translateY(-2px);
    }

    /* Estilos para marcadores personalizados */
    :deep(.custom-barber-icon),
    :deep(.custom-user-icon),
    :deep(.custom-search-icon) {
        background: none;
        border: none;
    }

    :deep(.marker-pin) {
        position: relative;
        background: #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :deep(.barber-pin) {
        background: linear-gradient(135deg, #ee6f38, #d55e2d);
        width: 40px;
        height: 40px;
    }

    :deep(.user-pin) {
        background: linear-gradient(135deg, #3498db, #2980b9);
        width: 35px;
        height: 35px;
    }

    :deep(.search-pin) {
        background: linear-gradient(135deg, #27ae60, #229954);
        width: 35px;
        height: 35px;
    }

    :deep(.marker-icon) {
        transform: rotate(45deg);
        font-size: 18px;
        color: white;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    /* Tooltips personalizados */
    :deep(.custom-tooltip) {
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    :deep(.custom-tooltip::before) {
        border-top-color: rgba(0, 0, 0, 0.8);
    }

    :deep(.barber-tooltip) {
        background: linear-gradient(135deg, #ee6f38, #d55e2d);
    }

    :deep(.barber-tooltip::before) {
        border-top-color: #ee6f38;
    }

    :deep(.user-tooltip) {
        background: linear-gradient(135deg, #3498db, #2980b9);
    }

    :deep(.user-tooltip::before) {
        border-top-color: #3498db;
    }

    /* Popups personalizados */
    :deep(.custom-popup) {
        text-align: center;
        font-family: inherit;
    }

    :deep(.custom-popup h3) {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 16px;
    }

    :deep(.custom-popup p) {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    :deep(.route-info) {
        text-align: center;
        padding: 10px;
        background: linear-gradient(135deg, #ee6f38, #d55e2d);
        color: white;
        border-radius: 8px;
    }

    :deep(.route-info h3) {
        margin: 0 0 8px 0;
        font-size: 16px;
    }

    :deep(.route-info p) {
        margin: 4px 0;
        font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .map-controls {
            left: 10px;
            right: 10px;
            top: 10px;
        }

        .input-floating {
            width: 100%;
            max-width: 280px;
        }

        .buttons-row {
            flex-direction: column;
        }

        .btn-floating {
            font-size: 11px;
            padding: 8px 10px;
        }

        .map {
            height: 400px;
        }
    }

    @media (max-width: 480px) {
        .input-floating {
            max-width: 220px;
            font-size: 13px;
        }
        
        .map {
            height: 350px;
        }
    }
</style>