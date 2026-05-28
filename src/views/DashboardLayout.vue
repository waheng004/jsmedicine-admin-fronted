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
        <section
          v-for="group in menuGroups"
          :key="group.title"
          class="menu-group"
          :class="{ 'menu-group--open': isGroupOpen(group.title) }"
        >
          <button
            class="menu-group__trigger"
            type="button"
            :aria-expanded="isGroupOpen(group.title)"
            @click="toggleGroup(group.title)"
          >
            <span class="menu-group__icon" aria-hidden="true">{{ getGroupIcon(group.title) }}</span>
            <span>{{ group.title }}</span>
            <span class="menu-group__arrow" aria-hidden="true">⌃</span>
          </button>

          <div v-show="isGroupOpen(group.title)" class="submenu">
            <RouterLink
              v-for="item in group.items"
              :key="item.route"
              class="submenu-link"
              :to="item.route"
            >
              <span class="submenu-link__icon" aria-hidden="true">{{ getItemIcon(item.title) }}</span>
              <span>{{ item.title }}</span>
            </RouterLink>
          </div>
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
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logout } from '../api/auth'
import { menuGroups } from '../config/resources'
import { clearLoginSession, getAdminInfo, getAuthToken, skipAutoLoginOnce } from '../utils/auth'

const route = useRoute()
const router = useRouter()
const admin = computed(() => getAdminInfo())
const adminName = computed(() => admin.value?.realName || admin.value?.username || '管理员')
const pageTitle = computed(() => route.meta.title || '管理端')
const openGroups = reactive({})

const groupIcons = {
  账户管理: '♟',
  系统管理: '▣',
  首页管理: '◈',
  课程管理: '◒',
  图书管理: '▤',
  内容管理: '▦',
  专家管理: '◉',
  题库管理: '≡',
  统计管理: '◫',
  直播管理: '▶',
  答疑管理: '?',
  反馈管理: '✎',
  知识库: '◇',
}

function getGroupIcon(title) {
  return groupIcons[title] || '▪'
}

function getItemIcon(title) {
  if (title.includes('用户') || title.includes('学员') || title.includes('管理员')) return '♟'
  if (title.includes('分类')) return '▦'
  if (title.includes('列表') || title.includes('记录')) return '▤'
  return '▪'
}

function isGroupOpen(title) {
  return Boolean(openGroups[title])
}

function toggleGroup(title) {
  openGroups[title] = !openGroups[title]
}

function syncOpenGroupByRoute(path) {
  const activeGroup = menuGroups.find((group) => group.items.some((item) => item.route === path))
  if (activeGroup) {
    openGroups[activeGroup.title] = true
  }
}

menuGroups.forEach((group) => {
  openGroups[group.title] = group.items.some((item) => item.route === route.path)
})

watch(
  () => route.path,
  (path) => {
    syncOpenGroupByRoute(path)
  },
)

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
