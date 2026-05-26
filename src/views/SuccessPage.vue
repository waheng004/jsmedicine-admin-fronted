<template>
  <main class="success-page">
    <section class="success-box">
      <h1>登录成功</h1>
      <p v-if="adminName">当前登录：{{ adminName }}</p>
      <a href="#" @click.prevent="handleLogout">退出登录</a>
      <p v-if="message" class="logout-message">{{ message }}</p>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../api/auth'
import { clearLoginSession, getAdminInfo, getAuthToken, skipAutoLoginOnce } from '../utils/auth'

const router = useRouter()
const message = ref('')
const admin = getAdminInfo()
const adminName = computed(() => admin?.realName || admin?.username || '')

async function handleLogout() {
  const token = getAuthToken()
  message.value = ''

  try {
    if (token) {
      await logout(token)
    }
  } catch (error) {
    message.value = error.message
  } finally {
    clearLoginSession()
    skipAutoLoginOnce()
    router.replace({ name: 'login' })
  }
}
</script>
