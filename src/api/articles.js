import { bodyRequest, pageRequest, request } from './http'

export function listArticles(params) {
  return pageRequest('/api/v1/admin/content/articles', params)
}

export function getArticle(id) {
  return request(`/api/v1/admin/content/articles/${encodeURIComponent(id)}`)
}

export function createArticle(body) {
  return bodyRequest('/api/v1/admin/content/articles', 'POST', body)
}

export function updateArticle(id, body) {
  return bodyRequest(`/api/v1/admin/content/articles/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteArticle(id) {
  return request(`/api/v1/admin/content/articles/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reviewArticle(id, body) {
  return bodyRequest(`/api/v1/admin/content/articles/${encodeURIComponent(id)}/review`, 'PATCH', body)
}

