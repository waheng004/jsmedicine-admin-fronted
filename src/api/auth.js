import { request } from './http'

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

export function getCurrentAdmin() {
  return request('/api/v1/auth/me')
}

export function getLoginStatus() {
  return request('/api/v1/auth/status')
}
