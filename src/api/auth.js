const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  let result = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `请求失败，状态码 ${response.status}`)
  }

  return result
}

export function login(username, password) {
  return request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(token) {
  return request('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
