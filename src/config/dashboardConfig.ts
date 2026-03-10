// Opciones comunes que pueden usar todos los roles
const commonItems = {
  dashboard: {
    title: 'Dashboard Principal',
    icon: 'fas fa-chart-line',
    to: '/dashboard/default'
  },
  PaginaPrincipal: {
    title: 'Página Principal',
    icon: 'fas fa-home',
    to: '/pages/pagina-principal'
  },
  administrador: {
    clientes: {
      title: 'Clientes',
      icon: 'fas fa-users',
      to: '/clientes',
      children: [
        {
          title: 'Lista de Clientes',
          icon: 'fas fa-list',
          to: '/lista-clientes'
        },
      ]
    },
    barberos: {
      title: 'Barberos',
      icon: 'fas fa-cut',
      to: '/barberos',
      children: [
        {
          title: 'Lista de Barberos',
          icon: 'fas fa-list',
          to: '/lista-barberos'
        },
        {
          title: 'Crear Barbero',
          icon: 'fas fa-user-plus',
          to: '/crear-barbero'
        }
      ]
    },
    servicios: {
      title: 'Servicios',
      icon: 'fas fa-concierge-bell',
      to: '/servicios',
      children: [
        {
          title: 'Lista de Servicios',
          icon: 'fas fa-list',
          to: '/lista-servicios'
        },
        {
          title: 'Crear Servicio',
          icon: 'fas fa-plus-circle',
          to: '/crear-servicio'
        },
        {
          title: 'Cat. Servicios',
          icon: 'fas fa-layer-group',
          to: '/categorias-servicios'
        }
      ]
    },
    productos: {
      title: 'Productos',
      icon: 'fas fa-box-open',
      to: '/productos',
      children: [
        {
          title: 'Lista de Productos',
          icon: 'fas fa-list',
          to: '/lista-productos'
        },
        {
          title: 'Cat. Productos',
          icon: 'fas fa-tags',
          to: '/categorias-productos'
        }
      ]
    },
    proveedores: {
      title: 'Proveedores',
      icon: 'fas fa-truck',
      to: '/proveedores'
    },
    compras: {
      title: 'Compras a Proveedores',
      icon: 'fas fa-shopping-cart',
      to: '/compras',
      children: [
        {
          title: 'Lista de Compras',
          icon: 'fas fa-list',
          to: '/lista-compras'
        },
        {
          title: 'Nueva Orden',
          icon: 'fas fa-file-invoice-dollar',
          to: '/crear-compra'
        }
      ]
    },
    dashboardCita: {
      title: 'Dashboard Citas',
      icon: 'fas fa-calendar-alt',
      to: '/dashboard-citas'
    },
    gestionCitas: {
      title: 'Gestionar Citas',
      icon: 'fas fa-calendar-check',
      to: '/gestion-citas'
    },
    paginaPrincipal: {
      title: 'Gestión de Página',
      icon: 'fas fa-desktop',
      to: '/config/pagina-principal',
      children: [
        {
          title: 'Cintas Promocionales',
          icon: 'fas fa-ad',
          to: '/config/cintas'
        },
        {
          title: 'Ubicación y Datos',
          icon: 'fas fa-map-marker-alt',
          to: '/config/ubicacion'
        }
      ]
    },
  },
  cliente: {
    agendarCita: {
      title: 'Reservar Cita',
      icon: 'fas fa-calendar-plus',
      to: '/reservar-cita'
    },
    citas: {
      title: 'Mis Citas',
      icon: 'fas fa-calendar-check',
      to: '/mis-citas',
      children: [
        {
          title: 'Citas actuales',
          icon: 'fas fa-clock',
          to: '/mis-citas'
        },
        {
          title: 'Historial de citas',
          icon: 'fas fa-history',
          to: '/historial-citas'
        }
      ]
    }
  },
  barbero: {
    agendaCitas: {
      title: 'Mi agenda',
      icon: 'fas fa-calendar-alt',
      to: '/agenda-citas'
    }
  }
};

export default {
  "menuadministrador": [
    { header: 'Menu Administrador' },
    {
      title: "Dashboard Principal",
      icon: "fas fa-home",
      to: "/inicio-dashboard"
    },
    { divider: true },
    { header: 'Administración' },
    commonItems.administrador.clientes,
    commonItems.administrador.barberos,
    commonItems.administrador.servicios,
    commonItems.administrador.productos,
    { divider: true },
    { header: 'Gestion de citas' },
    commonItems.administrador.dashboardCita,
    commonItems.administrador.gestionCitas,
    { divider: true },
    { header: 'Gestion de compras' },
    commonItems.administrador.compras,
    commonItems.administrador.proveedores,
    { divider: true },
    { header: 'Personalización' },
    commonItems.administrador.paginaPrincipal,
  ],

  "menubarbero": [
    { header: 'Menu Barbero' },
    {
      title: "Inicio",
      icon: "fas fa-home",
      to: "/inicio-dashboard"
    },
    { divider: true },
    { header: 'Trabajo' },
    commonItems.barbero.agendaCitas,
    {
      title: "Clientes",
      icon: "fas fa-users",
      to: "/clientes"
    }
  ],

  "menucliente": [
    { header: 'Menu Cliente' },
    commonItems.dashboard,
    commonItems.PaginaPrincipal,
    { divider: true },
    { header: 'Servicios' },
    commonItems.cliente.agendarCita,
    commonItems.cliente.citas,
    {
      title: "Historial",
      icon: "fas fa-history",
      to: "/historial"
    },
    { divider: true },
    { header: 'Cuenta' },
    {
      title: "Mi Perfil",
      icon: "fas fa-user-circle",
      to: "/perfil"
    }
  ]
};