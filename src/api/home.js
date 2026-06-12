import { bodyRequest, buildQuery, getJsonData, request } from './http'

export function listHomeCategories(params = {}) {
  return request(`/api/v1/admin/content/home/categories${buildQuery(params)}`)
}

export function createHomeCategory(body) {
  return bodyRequest('/api/v1/admin/content/home/categories', 'POST', body)
}

export function updateHomeCategory(id, body) {
  return bodyRequest(`/api/v1/admin/content/home/categories/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteHomeCategory(id) {
  return request(`/api/v1/admin/content/home/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function listHomeContents(params = {}) {
  return request(`/api/v1/admin/content/home/contents${buildQuery(params)}`)
}

export function createHomeContent(body) {
  return bodyRequest('/api/v1/admin/content/home/contents', 'POST', body)
}

export function updateHomeContent(id, body) {
  return bodyRequest(`/api/v1/admin/content/home/contents/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteHomeContent(id) {
  return request(`/api/v1/admin/content/home/contents/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function listHomeConfigCandidates(params = {}) {
  return request(`/api/v1/admin/content/home/candidates${buildQuery(params)}`)
}

export async function listHomeConfigCandidatesByContentType(contentType, params = {}) {
  const config = homeCandidateSourceMap[contentType]
  if (!config) {
    throw new Error('不支持的来源模块')
  }

  const data = await getJsonData(`${config.api}${buildQuery(params)}`)
  return {
    records: (data?.records || []).map((item) => ({
      id: item.id,
      title: config.title(item),
      coverUrl: item.coverUrl || '',
      subtitle: config.subtitle(item),
      available: true,
    })),
    total: Number(data?.total || 0),
    page: Number(data?.page || params.page || 1),
    size: Number(data?.size || params.size || 10),
  }
}

export const homeContentTypeOptions = [
  { label: '资讯', value: 'article' },
  { label: '课程', value: 'course' },
  { label: '图书', value: 'book' },
  { label: '知识库', value: 'knowledge' },
  { label: '播客', value: 'podcast' },
  { label: '专题', value: 'topic' },
  { label: '直播', value: 'live' },
]

export const homeCategoryTypeOptions = [
  { label: '资讯', value: 'article' },
  { label: '课程', value: 'course' },
  { label: '专题', value: 'topic' },
  { label: '图书', value: 'book' },
  { label: '知识库', value: 'knowledge' },
  { label: '播客', value: 'podcast' },
  { label: '直播', value: 'live' },
]

const homeCandidateSourceMap = {
  article: {
    api: '/api/v1/admin/content/articles',
    title: (item) => item.title || '',
    subtitle: (item) => item.summary || item.source || '',
  },
  course: {
    api: '/api/v1/admin/learning/courses',
    title: (item) => item.courseName || item.title || '',
    subtitle: (item) => item.lecturerName || item.subtitle || '',
  },
  book: {
    api: '/api/v1/admin/learning/books',
    title: (item) => item.bookName || item.title || '',
    subtitle: (item) => item.author || '',
  },
  knowledge: {
    api: '/api/v1/admin/knowledge/entries',
    title: (item) => item.title || '',
    subtitle: (item) => item.summary || item.source || '',
  },
  podcast: {
    api: '/api/v1/admin/content/podcasts',
    title: (item) => item.title || '',
    subtitle: (item) => item.speakerName || '',
  },
  topic: {
    api: '/api/v1/admin/content/topics',
    title: (item) => item.title || '',
    subtitle: (item) => item.summary || '',
  },
  live: {
    api: '/api/v1/admin/live-sessions',
    title: (item) => item.title || '',
    subtitle: (item) => item.speakerName || item.anchorName || '',
  },
}
