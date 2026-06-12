<template>
  <section class="stats-page">
    <header class="stats-page__header">
      <div>
        <h2>学员统计</h2>
        <p>按专题维度查看学员统计与明细，支持城市、区县、关键词和学习状态筛选。</p>
      </div>
      <button class="stats-button stats-button--ghost" type="button" :disabled="loading" @click="loadData">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <form class="stats-toolbar" @submit.prevent="applyFilters">
      <div class="stats-filter-grid stats-filter-grid--wide">
        <label>
          <span>专题</span>
          <select v-model="query.topicId">
            <option value="">请选择专题</option>
            <option v-for="item in topics" :key="item.id" :value="String(item.id)">
              {{ item.title }}
            </option>
          </select>
        </label>
        <label>
          <span>城市</span>
          <select v-model="query.city" @change="handleCityChange">
            <option value="">全部城市</option>
            <option v-for="item in cityOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>区县</span>
          <select v-model="query.district">
            <option value="">全部区县</option>
            <option v-for="item in districtOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>学习状态</span>
          <select v-model="query.learningStatus">
            <option value="">全部状态</option>
            <option value="learning">学习中</option>
            <option value="completed">已完成</option>
            <option value="not_started">未学习</option>
          </select>
        </label>
        <label>
          <span>关键词</span>
          <input v-model.trim="query.keyword" placeholder="姓名 / 手机号 / 工作单位" />
        </label>
      </div>
      <div class="stats-toolbar__actions">
        <button class="stats-button" type="submit">筛选</button>
        <button class="stats-button stats-button--ghost" type="button" @click="resetFilters">重置</button>
      </div>
    </form>

    <p v-if="message" class="stats-message" :class="{ 'stats-message--error': messageType === 'error' }">
      {{ message }}
    </p>

    <div class="stats-cards">
      <article class="stats-card">
        <span class="stats-card__label">总学员数</span>
        <strong class="stats-card__value">{{ currentSummary.totalStudents ?? baseSummary.totalStudents ?? '--' }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">专题学员数</span>
        <strong class="stats-card__value">{{ currentSummary.topicStudents ?? (query.topicId ? 0 : '请选择专题') }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">专题学习中学员数</span>
        <strong class="stats-card__value">{{ currentSummary.learningStudents ?? (query.topicId ? 0 : '请选择专题') }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">专题未学习学员数</span>
        <strong class="stats-card__value">{{ currentSummary.notStartedStudents ?? (query.topicId ? 0 : '请选择专题') }}</strong>
      </article>
      <article class="stats-card stats-card--accent">
        <span class="stats-card__label">专题已完成学员数</span>
        <strong class="stats-card__value">{{ currentSummary.completedStudents ?? (query.topicId ? 0 : '请选择专题') }}</strong>
      </article>
    </div>

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>学员列表</h3>
          <p>已接入专题维度学员明细接口，可直接查看学时与学习状态。</p>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>性别</th>
              <th>联系方式</th>
              <th>年龄</th>
              <th>文化程度</th>
              <th>工作单位</th>
              <th>职业类型</th>
              <th>学时</th>
              <th>学习状态</th>
              <th>是否学习本专题</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10">加载中...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="10">{{ query.topicId ? '暂无数据' : '请先选择专题' }}</td>
            </tr>
            <tr v-for="item in records" v-else :key="item.studentId">
              <td>{{ item.realName || '--' }}</td>
              <td>{{ formatGender(item.gender) }}</td>
              <td>{{ maskMobile(item.mobile) }}</td>
              <td>{{ item.age ?? '--' }}</td>
              <td>{{ item.educationLevel || '--' }}</td>
              <td>{{ item.organization || '--' }}</td>
              <td>{{ item.practiceTypeName || '--' }}</td>
              <td>{{ formatPlainHours(item.studyHours) }}</td>
              <td>{{ item.topicLearningStatusLabel || formatTopicLearningStatus(item.topicLearningStatus) }}</td>
              <td>{{ formatTopicLearningLabel(item) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="stats-pagination">
        <span>共 {{ total }} 条</span>
        <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
        <span>第 {{ query.page }} / {{ totalPages }} 页</span>
        <button type="button" :disabled="query.page >= totalPages" @click="changePage(query.page + 1)">下一页</button>
      </footer>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getStudentSummary, getTopicStudentStatistics, pageStatisticTopics, pageStudentStatistics } from '../../api/statistics'
import {
  formatGender,
  formatPlainHours,
  formatTopicLearningLabel,
  formatTopicLearningStatus,
  getAllCityOptions,
  getDistrictOptions,
  maskMobile,
} from './statistics-shared'

const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const baseSummary = ref({})
const currentSummary = ref({})
const topics = ref([])
const citySourceRecords = ref([])
const records = ref([])
const total = ref(0)
const query = reactive({
  topicId: '',
  city: '',
  district: '',
  keyword: '',
  learningStatus: '',
  page: 1,
  size: 10,
})

const cityOptions = computed(() => getAllCityOptions(citySourceRecords.value))
const districtOptions = computed(() => getDistrictOptions(citySourceRecords.value, query.city))
const totalPages = computed(() => Math.max(Math.ceil(total.value / query.size), 1))

onMounted(loadData)

async function loadData() {
  loading.value = true
  message.value = ''

  try {
    const [summaryData, topicData, studentData] = await Promise.all([
      getStudentSummary(),
      pageStatisticTopics({ page: 1, size: 100 }),
      pageStudentStatistics({ page: 1, size: 500 }),
    ])

    baseSummary.value = summaryData || {}
    topics.value = Array.isArray(topicData?.records) ? topicData.records : []
    citySourceRecords.value = Array.isArray(studentData?.records) ? studentData.records : []

    if (query.topicId) {
      await loadTopicStatistics()
    } else {
      currentSummary.value = {}
      records.value = []
      total.value = 0
    }
  } catch (error) {
    message.value = error.message || '学员统计加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function loadTopicStatistics() {
  if (!query.topicId) {
    currentSummary.value = {}
    records.value = []
    total.value = 0
    return
  }

  const data = await getTopicStudentStatistics(query.topicId, {
    page: query.page,
    size: query.size,
    keyword: query.keyword,
    city: query.city,
    district: query.district,
    learningStatus: query.learningStatus,
  })

  currentSummary.value = data?.summary || {}
  records.value = Array.isArray(data?.records) ? data.records : []
  total.value = Number(data?.total || 0)
}

async function applyFilters() {
  query.page = 1
  loading.value = true
  message.value = ''

  try {
    await loadTopicStatistics()
  } catch (error) {
    message.value = error.message || '专题学员统计加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

function handleCityChange() {
  query.district = ''
}

function resetFilters() {
  query.topicId = ''
  query.city = ''
  query.district = ''
  query.keyword = ''
  query.learningStatus = ''
  query.page = 1
  currentSummary.value = {}
  records.value = []
  total.value = 0
}

async function changePage(page) {
  query.page = Math.min(Math.max(page, 1), totalPages.value)
  loading.value = true
  message.value = ''
  try {
    await loadTopicStatistics()
  } catch (error) {
    message.value = error.message || '专题学员统计加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
