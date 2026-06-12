import router from '../router'
import { clearLoginSession, getAuthHeader } from '../utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || API_BASE_URL || 'https://api-test.arez.cc.cd'
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i

function joinBaseAndPath(base, path) {
  if (!base) return path
  if (base.endsWith('/') && path.startsWith('/')) {
    return `${base.slice(0, -1)}${path}`
  }
  if (!base.endsWith('/') && !path.startsWith('/')) {
    return `${base}/${path}`
  }
  return `${base}${path}`
}

function resolveUrl(path = '', base = '') {
  if (!path) return ''
  if (ABSOLUTE_URL_PATTERN.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  return joinBaseAndPath(base, path)
}

function normalizeValidationDetails(details) {
  if (!details) return []

  if (Array.isArray(details)) {
    return details
      .map((item) => {
        if (typeof item === 'string') return item
        if (!item || typeof item !== 'object') return ''
        const field = item.field || item.name || item.property || item.path || item.param || ''
        const message = item.message || item.defaultMessage || item.error || item.reason || ''
        return [field, message].filter(Boolean).join('：')
      })
      .filter(Boolean)
  }

  if (typeof details === 'object') {
    return Object.entries(details)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((item) => `${field}：${item}`)
        }
        if (value && typeof value === 'object') {
          const message = value.message || value.defaultMessage || value.error || value.reason || ''
          return message ? [`${field}：${message}`] : []
        }
        return value ? [`${field}：${value}`] : []
      })
      .filter(Boolean)
  }

  if (typeof details === 'string') {
    return [details]
  }

  return []
}

function extractErrorMessage(result, response) {
  const details = normalizeValidationDetails(
    result?.details ||
      result?.errors ||
      result?.data?.details ||
      result?.data?.errors ||
      result?.error?.details ||
      result?.error?.errors,
  )

  if (details.length) {
    return details.join('；')
  }

  const message = result?.message || result?.error?.message
  if (message && message !== 'Request validation failed') {
    return message
  }

  if (message === 'Request validation failed') {
    return '提交内容校验失败，请检查必填项和字段格式'
  }

  return `请求失败，状态码 ${response.status}`
}

export function resolveApiUrl(path = '') {
  return resolveUrl(path, API_BASE_URL)
}

export function resolvePublicFileUrl(path = '') {
  return resolveUrl(path, FILE_BASE_URL)
}

export async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  }

  const response = await fetch(resolveApiUrl(path), {
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
    throw new Error(extractErrorMessage(result, response))
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

export async function rawRequest(path, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  }

  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearLoginSession()
    router.replace({ name: 'login' })
    throw new Error('登录已过期，请重新登录')
  }

  if (!response.ok) {
    let message = `请求失败，状态码 ${response.status}`
    try {
      const result = await response.clone().json()
      message = result?.message || message
    } catch {}
    throw new Error(message)
  }

  return response
}

export async function getJsonData(path, options = {}) {
  const response = await rawRequest(path, options)
  const result = await response.json()
  if (result?.success === false) {
    throw new Error(result?.message || '请求失败')
  }
  return result?.data
}
