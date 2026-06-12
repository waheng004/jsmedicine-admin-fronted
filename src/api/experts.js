import { bodyRequest, buildQuery, getJsonData, request } from './http'

export function pageExperts(params = {}) {
  return getJsonData(`/api/v1/admin/experts${buildQuery(params)}`)
}

export function getExpertDetail(expertId) {
  return getJsonData(`/api/v1/admin/experts/${encodeURIComponent(expertId)}`)
}

export function createExpert(payload) {
  return bodyRequest('/api/v1/admin/experts', 'POST', payload)
}

export function updateExpert(expertId, payload) {
  return bodyRequest(`/api/v1/admin/experts/${encodeURIComponent(expertId)}`, 'PUT', payload)
}

export function deleteExpert(expertId) {
  return request(`/api/v1/admin/experts/${encodeURIComponent(expertId)}`, { method: 'DELETE' })
}

export function replaceExpertCategories(expertId, categoryIds) {
  return bodyRequest(
    `/api/v1/admin/experts/${encodeURIComponent(expertId)}/categories`,
    'PUT',
    categoryIds.map((item) => Number(item)),
  )
}

export function replaceExpertExperiences(expertId, experiences) {
  return bodyRequest(`/api/v1/admin/experts/${encodeURIComponent(expertId)}/experiences`, 'PUT', experiences)
}

export function pageExpertCategories(params = {}) {
  return getJsonData(`/api/v1/admin/experts/categories${buildQuery(params)}`).catch((error) => {
    if (error?.message === 'Expert category does not exist') {
      return {
        records: [],
        total: 0,
        page: Number(params.page || 1),
        size: Number(params.size || 10),
      }
    }

    throw error
  })
}

export function createExpertCategory(payload) {
  return bodyRequest('/api/v1/admin/experts/categories', 'POST', payload)
}

export function updateExpertCategory(categoryId, payload) {
  return bodyRequest(`/api/v1/admin/experts/categories/${encodeURIComponent(categoryId)}`, 'PUT', payload)
}

export function deleteExpertCategory(categoryId) {
  return request(`/api/v1/admin/experts/categories/${encodeURIComponent(categoryId)}`, { method: 'DELETE' })
}

export function pageOrganizations(params = {}) {
  return getJsonData(`/api/v1/admin/references/organizations${buildQuery(params)}`)
}

export function pagePracticeTypes(params = {}) {
  return getJsonData(`/api/v1/admin/references/practice-types${buildQuery(params)}`)
}
