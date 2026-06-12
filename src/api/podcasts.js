import { bodyRequest, pageRequest, request } from './http'

export function listPodcasts(params) {
  return pageRequest('/api/v1/admin/content/podcasts', params)
}

export function createPodcast(body) {
  return bodyRequest('/api/v1/admin/content/podcasts', 'POST', body)
}

export function updatePodcast(id, body) {
  return bodyRequest(`/api/v1/admin/content/podcasts/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deletePodcast(id) {
  return request(`/api/v1/admin/content/podcasts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reviewPodcast(id, body) {
  return bodyRequest(`/api/v1/admin/content/podcasts/${encodeURIComponent(id)}/review`, 'PATCH', body)
}

export function listPodcastAudios(podcastId, params) {
  return pageRequest(`/api/v1/admin/content/podcasts/${encodeURIComponent(podcastId)}/audios`, params)
}

export function createPodcastAudio(body) {
  return bodyRequest('/api/v1/admin/content/podcasts/audios', 'POST', body)
}

export function updatePodcastAudio(id, body) {
  return bodyRequest(`/api/v1/admin/content/podcasts/audios/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deletePodcastAudio(id) {
  return request(`/api/v1/admin/content/podcasts/audios/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
