import { bodyRequest, pageRequest, request } from './http'

export function listCourses(params) {
  return pageRequest('/api/v1/admin/learning/courses', params)
}

export function createCourse(body) {
  return bodyRequest('/api/v1/admin/learning/courses', 'POST', body)
}

export function getCourse(id) {
  return request(`/api/v1/admin/learning/courses/${encodeURIComponent(id)}`)
}

export function updateCourse(id, body) {
  return bodyRequest(`/api/v1/admin/learning/courses/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteCourse(id) {
  return request(`/api/v1/admin/learning/courses/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reviewCourse(id, body) {
  return bodyRequest(`/api/v1/admin/learning/courses/${encodeURIComponent(id)}/review`, 'PATCH', body)
}

export function listCourseVideos(courseId, params) {
  return pageRequest(`/api/v1/admin/learning/courses/${encodeURIComponent(courseId)}/videos`, params)
}

export function createCourseVideo(body) {
  return bodyRequest('/api/v1/admin/learning/courses/videos', 'POST', body)
}

export function updateCourseVideo(id, body) {
  return bodyRequest(`/api/v1/admin/learning/courses/videos/${encodeURIComponent(id)}`, 'PUT', body)
}

export function deleteCourseVideo(id) {
  return request(`/api/v1/admin/learning/courses/videos/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
