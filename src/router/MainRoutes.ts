import CrearBarbero from '@/views/dashboards/default/components/administrador/administracion/CrearBarbero.vue';
import CategoriasProducto from '@/views/dashboards/default/components/administrador/administracion/CategoriasProducto.vue';
import CategoriasServicio from '@/views/dashboards/default/components/administrador/administracion/CategoriasServicio.vue';
import CrearServicio from '@/views/dashboards/default/components/administrador/administracion/CrearServicio.vue';
import ListaBarberos from '@/views/dashboards/default/components/administrador/administracion/ListaBarberos.vue';
import ListaClientes from '@/views/dashboards/default/components/administrador/administracion/ListaClientes.vue';
import ListaProductos from '@/views/dashboards/default/components/administrador/administracion/ListaProductos.vue';
import ListaServicios from '@/views/dashboards/default/components/administrador/administracion/ListaServicios.vue';
import Proveedores from '@/views/dashboards/default/components/administrador/administracion/Proveedores.vue';
import ListaCompras from '@/views/dashboards/default/components/administrador/administracion/ListaCompras.vue';
import CrearCompra from '@/views/dashboards/default/components/administrador/administracion/CrearCompra.vue';
import DashboardCitas from '@/views/dashboards/default/components/administrador/gestion-de-citas/DashboardCitas.vue';
import GestionarCitas from '@/views/dashboards/default/components/administrador/gestion-de-citas/GestionarCitas.vue';
import GestionCintas from '@/views/dashboards/default/components/administrador/gestion-pagina/GestionCintas.vue';
import GestionUbicacion from '@/views/dashboards/default/components/administrador/gestion-pagina/GestionUbicacion.vue';
import VistaAgenda from '@/views/dashboards/default/components/barbero/VistaAgenda.vue';
import ModalseleccionReserva from '@/views/dashboards/default/components/cliente/ModalseleccionReserva.vue';
import ReservarCita from '@/views/dashboards/default/components/cliente/ReservarCita.vue';
import VistaCitasActuales from '@/views/dashboards/default/components/cliente/VistaCitasActuales.vue';
import VistaHistorialCitas from '@/views/dashboards/default/components/cliente/VistaHistorialCitas.vue';
import DefaultDashboard from '@/views/dashboards/default/DefaultDashboard.vue';
import PaginaPrincipal from '@/views/pages/PaginaPrincipal.vue';

const MainRoutes = {
  path: '/dashboard',
  meta: {
    requiresAuth: true
  },
  redirect: '/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    // ─── COMPARTIDAS (todos los roles autenticados) ───────────────────────────
    {
      name: 'LandingPage',
      path: '/dashboard',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      path: '/inicio-dashboard',
      name: 'DefaultDashboard',
      component: DefaultDashboard
    },

    // ─── ADMINISTRADOR ────────────────────────────────────────────────────────
    {
      path: '/crear-barbero',
      name: 'CrearBarbero',
      component: CrearBarbero,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/crear-servicio',
      name: 'CrearServicio',
      component: CrearServicio,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/categorias-productos',
      name: 'CategoriasProducto',
      component: CategoriasProducto,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/categorias-servicios',
      name: 'CategoriasServicio',
      component: CategoriasServicio,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/lista-barberos',
      name: 'ListaBarberos',
      component: ListaBarberos,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/lista-clientes',
      name: 'ListaClientes',
      component: ListaClientes,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/lista-servicios',
      name: 'ListaServicios',
      component: ListaServicios,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/lista-productos',
      name: 'ListaProductos',
      component: ListaProductos,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/proveedores',
      name: 'Proveedores',
      component: Proveedores,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/lista-compras',
      name: 'ListaCompras',
      component: ListaCompras,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/crear-compra',
      name: 'CrearCompra',
      component: CrearCompra,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/dashboard-citas',
      name: 'DashboardCitas',
      component: DashboardCitas,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/gestion-citas',
      name: 'GestionarCitas',
      component: GestionarCitas,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/config/cintas',
      name: 'GestionCintas',
      component: GestionCintas,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },
    {
      path: '/config/ubicacion',
      name: 'GestionUbicacion',
      component: GestionUbicacion,
      meta: { requiresAuth: true, roles: ['administrador'] }
    },

    // ─── SUPER ADMINISTRADOR (Dev Team) ─────────────────────────────────────
    {
      path: '/gestion-barberias',
      name: 'GestionAdministradores',
      component: () => import('@/views/dashboards/default/components/superadmin/GestionAdministradores.vue'),
      meta: { requiresAuth: true, roles: ['super-administrador'] }
    },

    // ─── BARBERO ──────────────────────────────────────────────────────────────
    {
      path: '/agenda-citas',
      name: 'VistaAgenda',
      component: VistaAgenda,
      meta: { requiresAuth: true, roles: ['barbero'] }
    },

    // ─── CLIENTE ──────────────────────────────────────────────────────────────
    {
      path: '/modalseleccion-reserva',
      name: 'ModalseleccionReserva',
      component: ModalseleccionReserva,
      meta: { requiresAuth: true, roles: ['cliente'] }
    },
    {
      path: '/reservar-cita',
      name: 'ReservarCita',
      component: ReservarCita,
      meta: { requiresAuth: true, roles: ['cliente'] }
    },
    {
      path: '/mis-citas',
      name: 'VistaCitasActuales',
      component: VistaCitasActuales,
      meta: { requiresAuth: true, roles: ['cliente'] }
    },
    {
      path: '/historial-citas',
      name: 'VistaHistorialCitas',
      component: VistaHistorialCitas,
      meta: { requiresAuth: true, roles: ['cliente'] }
    },
  ],
};

export default MainRoutes;
