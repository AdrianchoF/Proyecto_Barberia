import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import PublicRoutes from './PublicRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: () => import('@/views/pages/maintenance/error/Error403Page.vue')
    },
    MainRoutes,
    PublicRoutes
  ]
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // Siempre intentar cargar usuario si no existe en memoria
  if (!auth.user) {
    try {
      await auth.loadUser();
    } catch (error) {
      console.log('No hay sesión activa');
    }
  }

  // Páginas públicas (no requieren login)
  const publicPages = ['/login', '/login1', '/register'];
  const isPublicPage = publicPages.includes(to.path);

  // Si viene del dashboard y tiene usuario, bloquear ir a login
  if (auth.user && (to.path === '/login' || to.path === '/login1') && from.path.startsWith('/dashboard')) {
    return next(false);
  }

  // La ruta requiere autenticación si tiene `meta.requiresAuth`
  const authRequired = !isPublicPage && to.matched.some(record => record.meta.requiresAuth);

  // Si requiere auth y no hay usuario, redirigir a login
  if (authRequired && !auth.user) {
    try {
      await auth.loadUser();
    } catch (error) {
      auth.returnUrl = to.fullPath;
      return next('/login');
    }
  }

  // Si ya está autenticado e intenta entrar a /login → redirigir
  if (auth.user && to.path === '/login') {
    return next(auth.returnUrl || '/');
  }

  // 🔒 VERIFICACIÓN DE ROL
  const requiredRoles = to.meta.roles as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0 && auth.user) {
    // Normalizar el rol del usuario (puede venir como 'Role' o 'role')
    const userRole = ((auth.user as any).Role || (auth.user as any).role || '').toLowerCase();
    const hasPermission = requiredRoles.includes(userRole);

    if (!hasPermission) {
      console.warn(`🚫 Acceso denegado: ${userRole} intentó acceder a ${to.path} (requiere: ${requiredRoles.join(', ')})`);
      return next('/403');
    }
  }

  next();
});