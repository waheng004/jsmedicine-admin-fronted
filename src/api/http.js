import router from '../router'
import { clearLoginSession, getAuthHeader } from '../utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (response.status === 401) {
    clearLoginSession()
    router.replace({ name: 'login' })
    throw new Error(result?.message || '登录已过期，请重新登录')
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `请求失败，状态码 ${response.status}`)
  }

  return result
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const text = query.toString()
  return text ? `?${text}` : ''
}

export function pageRequest(path, params) {
  return request(`${path}${buildQuery(params)}`)
}

export function bodyRequest(path, method, body) {
  return request(path, {
    method,
    body: JSON.stringify(body),
  })
}
