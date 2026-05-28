import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './views/LoginPage.vue'
import DashboardLayout from './views/DashboardLayout.vue'
import DashboardHome from './views/DashboardHome.vue'
import ResourcePage from './views/ResourcePage.vue'
import { menuGroups } from './config/resources'
import { getAuthToken } from './utils/auth'

const resourceRoutes = menuGroups.flatMap((group) =>
  group.items.map((item) => ({
    path: item.route.replace(/^\//, ''),
    name: item.resource,
    component: ResourcePage,
    props: { resourceKey: item.resource },
    meta: { title: item.title },
  })),
)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardHome,
          meta: { title: '工作桌面' },
        },
        ...resourceRoutes,
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getAuthToken()) {
    return { name: 'login' }
  }

  if (to.name === 'login' && getAuthToken()) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
