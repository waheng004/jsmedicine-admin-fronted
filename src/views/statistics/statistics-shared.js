const genderMap = {
  '0': '未知',
  '1': '男',
  '2': '女',
}

const resourceTypeMap = {
  article: '资讯',
  book: '图书',
  course: '课程',
  podcast: '播客',
  topic: '专题',
}

const scoreStatusMap = {
  pass: '合格',
  fail: '不合格',
  none: '暂无',
}

export const scoreFieldDefinitions = [
  { key: 'theoryTrainingStatus', label: '集中理论面授成绩' },
  { key: 'clinicalPracticeStatus', label: '临床实践成绩' },
  { key: 'practicalAssessmentStatus', label: '实践能力考核成绩' },
  { key: 'theoryAssessmentStatus', label: '理论考核成绩' },
  { key: 'onlineTrainingStatus', label: '线上培训成绩' },
]

export const scoreStatusOptions = [
  { value: 'none', label: '暂无' },
  { value: 'pass', label: '合格' },
  { value: 'fail', label: '不合格' },
]

export function formatGender(value) {
  return genderMap[String(value ?? '')] || '未知'
}

export function formatResourceType(value) {
  if (!value) return '-'
  return resourceTypeMap[String(value)] || String(value)
}

export function formatHours(value) {
  if (value === null || value === undefined || value === '') return '--'
  const number = Number(value)
  if (Number.isNaN(number)) return '--'
  return `${number.toFixed(number >= 100 ? 0 : 1)} 学时`
}

export function formatPlainHours(value) {
  if (value === null || value === undefined || value === '') return '--'
  const number = Number(value)
  if (Number.isNaN(number)) return '--'
  return number.toFixed(number >= 100 ? 0 : 1)
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '--'
  const number = Number(value)
  if (Number.isNaN(number)) return '--'
  return `${number.toFixed(1)}%`
}

export function maskMobile(value) {
  const text = String(value || '')
  if (text.length < 7) return text || '--'
  return `${text.slice(0, 3)}****${text.slice(-4)}`
}

export function normalizeRegionTree(records = []) {
  const provinces = new Map()

  records.forEach((record) => {
    const provinceName = String(record.province || '').trim()
    const cityName = String(record.city || '').trim()
    const districtName = String(record.district || '').trim()

    if (!provinceName && !cityName && !districtName) {
      return
    }

    if (!provinces.has(provinceName)) {
      provinces.set(provinceName, new Map())
    }

    const cities = provinces.get(provinceName)
    if (!cities.has(cityName)) {
      cities.set(cityName, new Set())
    }

    if (districtName) {
      cities.get(cityName).add(districtName)
    }
  })

  const provinceOptions = [...provinces.keys()].filter(Boolean).sort(sortZhText)
  const cityOptionsByProvince = {}
  const districtOptionsByProvinceCity = {}

  provinceOptions.forEach((provinceName) => {
    const cities = provinces.get(provinceName)
    const cityOptions = [...cities.keys()].filter(Boolean).sort(sortZhText)
    cityOptionsByProvince[provinceName] = cityOptions

    cityOptions.forEach((cityName) => {
      const districts = [...cities.get(cityName)].filter(Boolean).sort(sortZhText)
      districtOptionsByProvinceCity[`${provinceName}::${cityName}`] = districts
    })
  })

  return {
    provinceOptions,
    cityOptionsByProvince,
    districtOptionsByProvinceCity,
  }
}

export function getAllCityOptions(records = []) {
  return [...new Set(records.map((item) => String(item.city || '').trim()).filter(Boolean))].sort(sortZhText)
}

export function getDistrictOptions(records = [], city = '') {
  const normalizedCity = String(city || '').trim()
  return [
    ...new Set(
      records
        .filter((item) => !normalizedCity || String(item.city || '').trim() === normalizedCity)
        .map((item) => String(item.district || '').trim())
        .filter(Boolean),
    ),
  ].sort(sortZhText)
}

export function paginateRecords(records = [], page = 1, size = 10) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeSize = Math.max(Number(size) || 10, 1)
  const start = (safePage - 1) * safeSize
  return records.slice(start, start + safeSize)
}

export function buildPracticeTypeMap(records = []) {
  return Object.fromEntries(
    records
      .filter((item) => item && item.id !== null && item.id !== undefined)
      .map((item) => [String(item.id), item.typeName || item.name || `类型 ${item.id}`]),
  )
}

export function getScoreStatusLabel(value) {
  return scoreStatusMap[value] || '暂无'
}

export function getScoreStatusClass(value) {
  if (value === 'pass') return 'score-badge--pass'
  if (value === 'fail') return 'score-badge--fail'
  return 'score-badge--none'
}

export function formatTopicLearningLabel(record) {
  if (record?.topicLearningStatusLabel) return record.topicLearningStatusLabel
  if (record?.isLearningCurrentTopic === true) return '是'
  if (record?.isLearningCurrentTopic === false) return '否'
  return '--'
}

export function formatTopicLearningStatus(value, fallback = '--') {
  if (!value) return fallback
  const normalized = String(value).toLowerCase()
  if (normalized === 'learning') return '学习中'
  if (normalized === 'completed') return '已完成'
  if (normalized === 'not_started' || normalized === 'not-started') return '未学习'
  return String(value)
}

function sortZhText(a, b) {
  return String(a).localeCompare(String(b), 'zh-Hans-CN')
}
