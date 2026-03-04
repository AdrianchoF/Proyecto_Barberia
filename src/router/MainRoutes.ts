import CrearBarbero from '@/views/dashboards/default/components/administrador/administracion/CrearBarbero.vue';
import CategoriasProducto from '@/views/dashboards/default/components/administrador/administracion/CategoriasProducto.vue';
import CategoriasServicio from '@/views/dashboards/default/components/administrador/administracion/CategoriasServicio.vue';
import CrearServicio from '@/views/dashboards/default/components/administrador/administracion/CrearServicio.vue';
import ListaBarberos from '@/views/dashboards/default/components/administrador/administracion/ListaBarberos.vue';
import ListaCategoriasproducto from '@/views/dashboards/default/components/administrador/administracion/ListaCategoriasproducto.vue';
import ListaCategoriasservicio from '@/views/dashboards/default/components/administrador/administracion/ListaCategoriasservicio.vue';
import ListaClientes from '@/views/dashboards/default/components/administrador/administracion/ListaClientes.vue';
import ListaProductos from '@/views/dashboards/default/components/administrador/administracion/ListaProductos.vue';
import ListaServicios from '@/views/dashboards/default/components/administrador/administracion/ListaServicios.vue';
import Proveedores from '@/views/dashboards/default/components/administrador/administracion/Proveedores.vue';
import ListaCompras from '@/views/dashboards/default/components/administrador/administracion/ListaCompras.vue';
import CrearCompra from '@/views/dashboards/default/components/administrador/administracion/CrearCompra.vue';
import DashboardCitas from '@/views/dashboards/default/components/administrador/gestion-de-citas/DashboardCitas.vue';
import GestionarCitas from '@/views/dashboards/default/components/administrador/gestion-de-citas/GestionarCitas.vue';
import GestionCintas from '@/views/dashboards/default/components/administrador/gestion-pagina/GestionCintas.vue';
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
      path: '/pages/pagina-principal',
      name: 'PaginaPrincipal',
      component: PaginaPrincipal
    },
    {
      path: '/inicio-dashboard',
      name: 'DefaultDashboard',
      component: DefaultDashboard
    },
    {
      path: '/crear-barbero',
      name: 'CrearBarbero',
      component: CrearBarbero
    },
    {
      path: '/crear-servicio',
      name: 'CrearServicio',
      component: CrearServicio
    },
    {
      path: '/categorias-productos',
      name: 'CategoriasProducto',
      component: CategoriasProducto
    },
    {
      path: '/categorias-servicios',
      name: 'CategoriasServicio',
      component: CategoriasServicio
    },
    {
      path: '/lista-barberos',
      name: 'ListaBarberos',
      component: ListaBarberos
    },
    {
      path: '/lista-clientes',
      name: 'ListaClientes',
      component: ListaClientes
    },
    {
      path: '/lista-servicios',
      name: 'ListaServicios',
      component: ListaServicios
    },
    {
      path: '/lista-productos',
      name: 'ListaProductos',
      component: ListaProductos
    },

    {
      path: '/proveedores',
      name: 'Proveedores',
      component: Proveedores
    },
    {
      path: '/lista-compras',
      name: 'ListaCompras',
      component: ListaCompras
    },
    {
      path: '/crear-compra',
      name: 'CrearCompra',
      component: CrearCompra
    },
    {
      path: '/dashboard-citas',
      name: 'DashboardCitas',
      component: DashboardCitas
    },
    {
      path: '/gestion-citas',
      name: 'GestionarCitas',
      component: GestionarCitas
    },
    {
      path: '/config/cintas',
      name: 'GestionCintas',
      component: GestionCintas
    },
    {
      name: 'Starter',
      path: '/starter',
      component: () => import('@/views/StarterPage.vue')
    },
    {
      name: 'Tabler Icons',
      path: '/icons/tabler',
      component: () => import('@/views/utilities/icons/TablerIcons.vue')
    },
    {
      name: 'Material Icons',
      path: '/icons/material',
      component: () => import('@/views/utilities/icons/MaterialIcons.vue')
    },
    {
      name: 'Typography',
      path: '/utils/typography',
      component: () => import('@/views/utilities/typography/TypographyPage.vue')
    },
    {
      name: 'Shadows',
      path: '/utils/shadows',
      component: () => import('@/views/utilities/shadows/ShadowPage.vue')
    },
    {
      name: 'Colors',
      path: '/utils/colors',
      component: () => import('@/views/utilities/colors/ColorPage.vue')
    },
    {
      path: '/modalseleccion-reserva',
      name: 'ModalseleccionReserva',
      component: ModalseleccionReserva,
      meta: { requiresAuth: true }
    },
    {
      path: '/reservar-cita',
      name: 'ReservarCita',
      component: ReservarCita
    },
    {
      path: '/mis-citas',
      name: 'VistaCitasActuales',
      component: VistaCitasActuales
    },
    {
      path: '/historial-citas',
      name: 'VistaHistorialCitas',
      component: VistaHistorialCitas
    },
    {
      path: '/agenda-citas',
      name: 'VistaAgenda',
      component: VistaAgenda
    }
  ],
};

export default MainRoutes;
