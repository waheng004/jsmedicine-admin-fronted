import { bodyRequest, pageRequest, request } from './http'

export function listTopics(params) {
  return pageRequest('/api/v1/admin/content/topics', params)
}

export function getTopic(id) {
  return request(`/api/v1/admin/content/topics/${encodeURIComponent(id)}`)
}

export function createTopic(body) {
  return bodyRequest('/api/v1/admin/content/topics', 'POST', body)
}

export function updateTopic(id, body) {
  return bodyRequest(`/api/v1/admin/content/topics/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteTopic(id) {
  return request(`/api/v1/admin/content/topics/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reviewTopic(id, body) {
  return bodyRequest(`/api/v1/admin/content/topics/${encodeURIComponent(id)}/review`, 'PATCH', body)
}

export function replaceTopicItems(id, body) {
  return bodyRequest(`/api/v1/admin/content/topics/${encodeURIComponent(id)}/items`, 'PUT', body)
}
