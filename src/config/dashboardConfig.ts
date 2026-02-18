import {
    CircleIcon,
    WindmillIcon,
    TypographyIcon,
    ShadowIcon,
    PaletteIcon,
    KeyIcon,
    BugIcon,
    DashboardIcon,
    BrandChromeIcon,
    HelpIcon
} from 'vue-tabler-icons';

// Opciones comunes que pueden usar todos los roles
const commonItems = {
  dashboard: {
    title: 'Dashboard Principal',
    icon: DashboardIcon,
    to: '/dashboard/default'
  },
  PaginaPrincipal: {
    title: 'Pagina Principal',
    icon: DashboardIcon,
    to: '/pages/pagina-principal'
  },
  administrador: {
    authentication: {
      title: 'Authentication',
      icon: KeyIcon,
      to: '/auth',
      children: [
        {
          title: 'Login',
          icon: CircleIcon,
          to: '/login1'
        },
        {
          title: 'Register',
          icon: CircleIcon,
          to: '/register'
        }
      ]
    },
    clientes: {
      title: 'Clientes',
      icon: KeyIcon,
      to: '/clientes',
      children: [
        {
          title: 'Lista de Clientes',
          icon: CircleIcon,
          to: '/lista-clientes'
        },
      ]
    },
    barberos: {
      title: 'Barberos',
      icon: KeyIcon,
      to: '/barberos',
      children: [
        {
          title: 'Lista de Barberos',
          icon: CircleIcon,
          to: '/lista-barberos'
        },
        {
          title: 'Crear Barbero',
          icon: CircleIcon,
          to: '/crear-barbero'
        }
      ]
    },
    servicios: {
      title: 'Servicios',
      icon: KeyIcon,
      to: '/servicios',
      children: [
        {
          title: 'Lista de Servicios',
          icon: CircleIcon,
          to: '/lista-servicios'
        },
        {
          title: 'Crear Servicio',
          icon: CircleIcon,
          to: '/crear-servicio'
        }
      ]
    },
    productos: {
      title: 'Productos',
      icon: KeyIcon,
      to: '/productos',
      children: [
        {
          title: 'Lista de Productos',
          icon: CircleIcon,
          to: '/lista-productos'
        },
        {
          title: 'Crear Producto',
          icon: CircleIcon,
          to: '/crear-producto'
        }
      ]
    },
    categoriasProductos: {
      title: 'Categorias de productos',
      icon: KeyIcon,
      to: '/categorias-productos'
    },
    categoriasServicios: {
      title: 'Categorias de servicios',
      icon: KeyIcon,
      to: '/categorias-servicios'
    },
    proveedores: {
      title: 'Proveedores',
      icon: KeyIcon,
      to: '/proveedores'
    },
    dashboardCita: {
      title: 'Dashboard Citas',
      icon: KeyIcon,
      to: '/dashboard-citas'
    },
    gestionCitas: {
      title: 'Gestionar Citas',
      icon: KeyIcon,
      to: '/gestion-citas'
    }
  },
  cliente: {
    authentication: {
      title: 'Authentication',
      icon: KeyIcon,
      to: '/auth',
      children: [
        {
          title: 'Login',
          icon: CircleIcon,
          to: '/login1'
        },
        {
          title: 'Register',
          icon: CircleIcon,
          to: '/register'
        }
      ]
    },
    agendarCita: {
      title: 'Reservar Cita',
      icon: KeyIcon,
      to: '/reservar-cita'
    },
    citas: {
      title: 'Mis Citas',
      icon: KeyIcon,
      to: '/mis-citas',
      children: [
        {
          title: 'Citas actuales',
          icon: CircleIcon,
          to: '/mis-citas'
        },
        {
          title: 'Historial de citas',
          icon: CircleIcon,
          to: '/historial-citas'
        }
      ]
    }
  },
  barbero: {
    authentication: {
      title: 'Authentication',
      icon: KeyIcon,
      to: '/auth',
      children: [
        {
          title: 'Login',
          icon: CircleIcon,
          to: '/login1'
        },
        {
          title: 'Register',
          icon: CircleIcon,
          to: '/register'
        }
      ]
    },
    agendaCitas: {
      title: 'Mi agenda',
      icon: KeyIcon,
      to: '/agenda-citas'
    }
  },
  error404: {
    title: 'Error 404',
    icon: BugIcon,
    to: '/error'
  },
  typography: {
    title: 'Typography',
    icon: TypographyIcon,
    to: '/utils/typography'
  },
  shadows: {
    title: 'Shadows',
    icon: ShadowIcon,
    to: '/utils/shadows'
  },
  colors: {
    title: 'Colors',
    icon: PaletteIcon,
    to: '/utils/colors'
  },
  icons: {
    title: 'Icons',
    icon: WindmillIcon,
    to: '/forms/radio',
    children: [
      {
        title: 'Tabler Icons',
        icon: CircleIcon,
        to: '/icons/tabler'
      },
      {
        title: 'Material Icons',
        icon: CircleIcon,
        to: '/icons/material'
      }
    ]
  },
  samplePage: {
    title: 'Sample Page',
    icon: BrandChromeIcon,
    to: '/starter'
  },
  documentation: {
    title: 'Documentation',
    icon: HelpIcon,
    to: 'https://codedthemes.gitbook.io/berry-vuetify/',
    type: 'external'
  }
};

export default {
    "menuadministrador": [
        { header: 'Menu Administrador' },
        {
        title: "Inicio",
        icon: "mdi-account-multiple",
        to: "/inicio-dashboard"
        },
        { divider: true },
        { header: 'Administración' },
        commonItems.administrador.clientes,
        commonItems.administrador.barberos,
        commonItems.administrador.servicios,
        commonItems.administrador.productos,
        commonItems.administrador.categoriasProductos,
        commonItems.administrador.categoriasServicios,
        commonItems.administrador.proveedores,
        { divider: true },
        { header: 'Gestion de citas' },
        commonItems.administrador.dashboardCita,
        commonItems.administrador.gestionCitas,
        { divider: true },
        commonItems.samplePage,
        commonItems.documentation
    ],

    "menubarbero": [
        { header: 'Menu Barbero' },
        {
        title: "Inicio",
        icon: "mdi-account-multiple",
        to: "/inicio-dashboard"
        },
        { divider: true },
        { header: 'Trabajo' },
        commonItems.barbero.agendaCitas,
        {
        title: "Clientes",
        icon: "mdi-account-multiple",
        to: "/clientes"
        },
        { divider: true },
        { header: 'Utilidades' },
        commonItems.colors,
        commonItems.icons,
        { divider: true },
        commonItems.samplePage
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
        icon: "mdi-history",
        to: "/historial"
        },
        { divider: true },
        { header: 'Cuenta' },
        {
        title: "Mi Perfil",
        icon: "mdi-account-circle",
        to: "/perfil"
        },
        { divider: true },
        commonItems.samplePage
    ]
};