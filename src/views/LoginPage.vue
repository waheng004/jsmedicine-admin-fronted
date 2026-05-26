<template>
  <main class="login-page">
    <section class="login-card" aria-label="登录表单">
      <header class="login-card__header">欢迎登录-江苏中医管理后台</header>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-row">
          <span class="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
            </svg>
          </span>
          <input
            v-model.trim="form.username"
            aria-label="用户名"
            autocomplete="username"
            placeholder="请输入用户名"
            type="text"
          />
        </div>

        <div class="input-row input-row--password">
          <span class="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 10V8a5 5 0 0 1 10 0v2" />
              <path d="M6 10h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
            </svg>
          </span>
          <input
            v-model="form.password"
            :type="passwordVisible ? 'text' : 'password'"
            aria-label="密码"
            autocomplete="current-password"
            placeholder="请输入密码"
          />
          <button
            class="password-toggle"
            :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
            type="button"
            @click="passwordVisible = !passwordVisible"
          >
            <svg v-if="passwordVisible" viewBox="0 0 24 24" focusable="false">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" focusable="false">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
              <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.3 3.1" />
              <path d="M6.2 6.7C3.9 8.2 2.5 12 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 4.1-.9" />
            </svg>
          </button>
        </div>

        <label class="remember-row">
          <input v-model="form.remember" type="checkbox" />
          <span>记住帐号密码，下次自动登录</span>
        </label>

        <p v-if="message" class="login-message" role="alert">{{ message }}</p>

        <button class="login-button" :disabled="loading" type="submit">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import {
  clearRememberedAccount,
  getRememberedAccount,
  saveLoginSession,
  saveRememberedAccount,
  shouldSkipAutoLogin,
} from '../utils/auth'

const router = useRouter()
const loading = ref(false)
const autoLoginStarted = ref(false)
const passwordVisible = ref(false)
const message = ref('')
const form = reactive({
  username: '',
  password: '',
  remember: false,
})

async function doLogin({ silent = false } = {}) {
  if (!form.username || !form.password) {
    message.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  message.value = silent ? '正在自动登录...' : ''

  try {
    const result = await login(form.username, form.password)
    saveLoginSession(result.data)

    if (form.remember) {
      saveRememberedAccount(form.username, form.password)
    } else {
      clearRememberedAccount()
    }

    await router.replace({ name: 'success' })
  } catch (error) {
    message.value = silent ? '自动登录失败，请手动登录' : error.message
  } finally {
    loading.value = false
  }
}

function handleSubmit() {
  doLogin()
}

onMounted(() => {
  const account = getRememberedAccount()
  form.username = account.username
  form.password = account.password
  form.remember = account.remembered

  const skipAutoLogin = shouldSkipAutoLogin()

  if (
    account.remembered &&
    account.username &&
    account.password &&
    !skipAutoLogin &&
    !autoLoginStarted.value
  ) {
    autoLoginStarted.value = true
    doLogin({ silent: true })
  }
})
</script>
