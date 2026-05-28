import { getCookie, removeCookie, setCookie } from './cookie'

const TOKEN_COOKIE = 'jsmedicine_admin_token'
const TOKEN_TYPE_COOKIE = 'jsmedicine_admin_token_type'
const USERNAME_COOKIE = 'jsmedicine_admin_username'
const PASSWORD_COOKIE = 'jsmedicine_admin_password'
const REMEMBER_COOKIE = 'jsmedicine_admin_remember'
const ADMIN_COOKIE = 'jsmedicine_admin_info'
const SKIP_AUTO_LOGIN_KEY = 'jsmedicine_skip_auto_login_once'
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7

export function getAuthToken() {
  return getCookie(TOKEN_COOKIE)
}

export function getAuthHeader() {
  const token = getAuthToken()
  const tokenType = getCookie(TOKEN_TYPE_COOKIE) || 'Bearer'

  return token ? { Authorization: `${tokenType} ${token}` } : {}
}

export function saveLoginSession(data) {
  const maxAge = Number(data?.expiresIn) || DEFAULT_MAX_AGE

  setCookie(TOKEN_COOKIE, data?.accessToken || '', maxAge)
  setCookie(TOKEN_TYPE_COOKIE, data?.tokenType || 'Bearer', maxAge)

  if (data?.admin) {
    setCookie(ADMIN_COOKIE, JSON.stringify(data.admin), maxAge)
  }
}

export function clearLoginSession() {
  removeCookie(TOKEN_COOKIE)
  removeCookie(TOKEN_TYPE_COOKIE)
  removeCookie(ADMIN_COOKIE)
}

export function saveRememberedAccount(username, password) {
  setCookie(REMEMBER_COOKIE, '1', DEFAULT_MAX_AGE)
  setCookie(USERNAME_COOKIE, username, DEFAULT_MAX_AGE)
  setCookie(PASSWORD_COOKIE, password, DEFAULT_MAX_AGE)
}

export function clearRememberedAccount() {
  removeCookie(REMEMBER_COOKIE)
  removeCookie(USERNAME_COOKIE)
  removeCookie(PASSWORD_COOKIE)
}

export function getRememberedAccount() {
  const remembered = getCookie(REMEMBER_COOKIE) === '1'

  return {
    remembered,
    username: remembered ? getCookie(USERNAME_COOKIE) : '',
    password: remembered ? getCookie(PASSWORD_COOKIE) : '',
  }
}

export function getAdminInfo() {
  const rawAdmin = getCookie(ADMIN_COOKIE)
  if (!rawAdmin) {
    return null
  }

  try {
    return JSON.parse(rawAdmin)
  } catch {
    return null
  }
}

export function skipAutoLoginOnce() {
  sessionStorage.setItem(SKIP_AUTO_LOGIN_KEY, '1')
}

export function shouldSkipAutoLogin() {
  const shouldSkip = sessionStorage.getItem(SKIP_AUTO_LOGIN_KEY) === '1'

  if (shouldSkip) {
    sessionStorage.removeItem(SKIP_AUTO_LOGIN_KEY)
  }

  return shouldSkip
}
