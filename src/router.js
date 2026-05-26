import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './views/LoginPage.vue'
import SuccessPage from './views/SuccessPage.vue'
import { getAuthToken } from './utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/success',
      name: 'success',
      component: SuccessPage,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getAuthToken()) {
    return { name: 'login' }
  }

  if (to.name === 'login' && getAuthToken()) {
    return { name: 'success' }
  }

  return true
})

export default router
