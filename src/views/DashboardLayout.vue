<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="brand">
        <span class="brand__mark">中</span>
        <div>
          <strong>中医在线</strong>
          <small>管理端</small>
        </div>
      </div>

      <nav class="admin-menu" aria-label="管理端菜单">
        <RouterLink class="menu-link menu-link--home" to="/dashboard">工作桌面</RouterLink>
        <section v-for="group in menuGroups" :key="group.title" class="menu-group">
          <h2>{{ group.title }}</h2>
          <RouterLink
            v-for="item in group.items"
            :key="item.route"
            class="menu-link"
            :to="item.route"
          >
            {{ item.title }}
          </RouterLink>
        </section>
      </nav>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <div>
          <p>当前页面</p>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="admin-user">
          <span>{{ adminName }}</span>
          <a href="#" @click.prevent="handleLogout">退出登录</a>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '../api/auth'
import { menuGroups } from '../config/resources'
import { clearLoginSession, getAdminInfo, getAuthToken, skipAutoLoginOnce } from '../utils/auth'

const route = useRoute()
const router = useRouter()
const admin = computed(() => getAdminInfo())
const adminName = computed(() => admin.value?.realName || admin.value?.username || '管理员')
const pageTitle = computed(() => route.meta.title || '管理端')

async function handleLogout() {
  const token = getAuthToken()

  try {
    if (token) {
      await logout(token)
    }
  } finally {
    clearLoginSession()
    skipAutoLoginOnce()
    router.replace({ name: 'login' })
  }
}
</script>
