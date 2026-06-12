import { bodyRequest, buildQuery, getJsonData, rawRequest } from './http'

export function getStudyHoursSummary(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/study-hours/summary${buildQuery(params)}`)
}

export function listStudyHoursResources(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/study-hours/resources${buildQuery(params)}`)
}

export function listStudyHoursRegions(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/study-hours/regions${buildQuery(params)}`)
}

export function getStudentSummary(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/students/summary${buildQuery(params)}`)
}

export function pageStudentStatistics(params = {}) {
  return getJsonData(`/api/v1/admin/students${buildQuery(params)}`)
}

export function pageStatisticTopics(params = {}) {
  return getJsonData(`/api/v1/admin/content/topics${buildQuery(params)}`)
}

export function getTopicStudentStatistics(topicId, params = {}) {
  return getJsonData(`/api/v1/admin/statistics/topics/${encodeURIComponent(topicId)}/students${buildQuery(params)}`)
}

export function listRegionStatistics(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/regions${buildQuery(params)}`)
}

export function getExamScoreSummary(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/exam-scores/summary${buildQuery(params)}`)
}

export function listExamPaperScores(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/exam-scores/papers${buildQuery(params)}`)
}

export function pageStudentScores(params = {}) {
  return getJsonData(`/api/v1/admin/statistics/student-scores${buildQuery(params)}`)
}

export function updateStudentScore(studentId, body) {
  return bodyRequest(`/api/v1/admin/statistics/student-scores/${encodeURIComponent(studentId)}`, 'PATCH', body)
}

export function pageExamAssessments(params = {}) {
  return getJsonData(`/api/v1/admin/learning/exam-assessments${buildQuery(params)}`)
}

export function createExamAssessment(body) {
  return bodyRequest('/api/v1/admin/learning/exam-assessments', 'POST', body)
}

export function pageExamPapers(params = {}) {
  return getJsonData(`/api/v1/admin/learning/exam-papers${buildQuery(params)}`)
}

export function getExamAssessmentDashboard(assessmentId, params = {}) {
  return getJsonData(
    `/api/v1/admin/statistics/exam-assessments/${encodeURIComponent(assessmentId)}/dashboard${buildQuery(params)}`,
  )
}

export function pageExamAssessmentParticipants(assessmentId, params = {}) {
  return getJsonData(
    `/api/v1/admin/statistics/exam-assessments/${encodeURIComponent(assessmentId)}/participants${buildQuery(params)}`,
  )
}

export function exportExamAssessmentParticipants(assessmentId, params = {}) {
  return rawRequest(
    `/api/v1/admin/statistics/exam-assessments/${encodeURIComponent(assessmentId)}/participants/export${buildQuery(params)}`,
  )
}
