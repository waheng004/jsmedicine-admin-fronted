<template>
  <section class="stats-page">
    <header class="stats-page__header">
      <div>
        <h2>地区学员统计</h2>
        <p>地区统计接口已补充学时字段，当前可按省、市、区查看地区学员与学时数据。</p>
      </div>
      <button class="stats-button stats-button--ghost" type="button" :disabled="loading" @click="loadData">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <form class="stats-toolbar" @submit.prevent="loadData">
      <div class="stats-filter-grid">
        <label>
          <span>省份</span>
          <select v-model="filters.province" @change="handleProvinceChange">
            <option value="">全部省份</option>
            <option v-for="item in provinceOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>城市</span>
          <select v-model="filters.city" @change="handleCityChange">
            <option value="">全部城市</option>
            <option v-for="item in cityOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>区县</span>
          <select v-model="filters.district">
            <option value="">全部区县</option>
            <option v-for="item in districtOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
      </div>
      <div class="stats-toolbar__actions">
        <button class="stats-button" type="submit">查询</button>
        <button class="stats-button stats-button--ghost" type="button" @click="resetFilters">清空</button>
      </div>
    </form>

    <p v-if="message" class="stats-message" :class="{ 'stats-message--error': messageType === 'error' }">
      {{ message }}
    </p>

    <div class="stats-cards">
      <article class="stats-card">
        <span class="stats-card__label">地区数量</span>
        <strong class="stats-card__value">{{ regions.length }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">学员总数</span>
        <strong class="stats-card__value">{{ totalStudents }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">总学时</span>
        <strong class="stats-card__value">{{ formatHours(totalStudyHours) }}</strong>
      </article>
      <article class="stats-card">
        <span class="stats-card__label">平均学时</span>
        <strong class="stats-card__value">{{ formatPlainHours(averageStudyHours) }}</strong>
      </article>
    </div>

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>各地区柱状图</h3>
          <p>可在学员数、总学时、平均学时、已完成人数之间切换指标。</p>
        </div>
        <div class="stats-switches">
          <button
            v-for="metric in metrics"
            :key="metric.key"
            type="button"
            class="stats-switch"
            :class="{ 'stats-switch--active': selectedMetric === metric.key }"
            @click="selectedMetric = metric.key"
          >
            {{ metric.label }}
          </button>
        </div>
      </div>
      <div v-if="chartData.length" class="stats-bar-chart stats-bar-chart--wide">
        <article v-for="item in chartData" :key="item.label" class="stats-bar-chart__item">
          <div class="stats-bar-chart__value">{{ item.display }}</div>
          <div class="stats-bar-chart__track">
            <div class="stats-bar-chart__bar stats-bar-chart__bar--city" :style="{ height: `${item.height}%` }"></div>
          </div>
          <div class="stats-bar-chart__label">{{ item.label }}</div>
        </article>
      </div>
      <div v-else class="stats-empty">暂无地区学员统计数据</div>
    </section>

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>地区明细</h3>
          <p>当前已展示完整的地区学员与学时字段。</p>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>省份</th>
              <th>城市</th>
              <th>区县</th>
              <th>学员数</th>
              <th>已认证学员数</th>
              <th>启用学员数</th>
              <th>已完成人数</th>
              <th>总学时</th>
              <th>平均学时</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9">加载中...</td>
            </tr>
            <tr v-else-if="regions.length === 0">
              <td colspan="9">暂无数据</td>
            </tr>
            <tr v-for="item in regions" v-else :key="`${item.province}-${item.city}-${item.district}`">
              <td>{{ item.province || '--' }}</td>
              <td>{{ item.city || '--' }}</td>
              <td>{{ item.district || '--' }}</td>
              <td>{{ item.studentCount ?? 0 }}</td>
              <td>{{ item.approvedStudentCount ?? 0 }}</td>
              <td>{{ item.enabledStudentCount ?? 0 }}</td>
              <td>{{ item.completedCount ?? 0 }}</td>
              <td>{{ formatHours(item.totalStudyHours) }}</td>
              <td>{{ formatPlainHours(item.averageStudyHours) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { listRegionStatistics, pageStudentStatistics } from '../../api/statistics'
import { formatHours, formatPlainHours, normalizeRegionTree } from './statistics-shared'

const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const regions = ref([])
const provinceOptions = ref([])
const cityOptionsByProvince = ref({})
const districtOptionsByProvinceCity = ref({})
const selectedMetric = ref('totalStudyHours')
const filters = reactive({
  province: '',
  city: '',
  district: '',
})

const metrics = [
  { key: 'totalStudyHours', label: '总学时', formatter: formatPlainHours },
  { key: 'averageStudyHours', label: '平均学时', formatter: formatPlainHours },
  { key: 'studentCount', label: '学员数', formatter: (value) => Number(value || 0) },
  { key: 'completedCount', label: '已完成人数', formatter: (value) => Number(value || 0) },
]

const cityOptions = computed(() => cityOptionsByProvince.value[filters.province] || [])
const districtOptions = computed(
  () => districtOptionsByProvinceCity.value[`${filters.province}::${filters.city}`] || [],
)

const totalStudents = computed(() =>
  regions.value.reduce((sum, item) => sum + (Number(item.studentCount) || 0), 0),
)
const totalStudyHours = computed(() =>
  regions.value.reduce((sum, item) => sum + (Number(item.totalStudyHours) || 0), 0),
)
const averageStudyHours = computed(() => {
  if (!regions.value.length) return 0
  return totalStudyHours.value / regions.value.length
})

const chartData = computed(() => {
  const maxValue = Math.max(...regions.value.map((item) => Number(item[selectedMetric.value]) || 0), 0)
  if (!maxValue) return []

  const currentMetric = metrics.find((item) => item.key === selectedMetric.value)

  return regions.value.map((item) => {
    const rawValue = Number(item[selectedMetric.value]) || 0
    return {
      label: item.district || item.city || item.province || '未命名地区',
      display: currentMetric?.formatter(rawValue) ?? rawValue,
      height: Math.max((rawValue / maxValue) * 100, 5),
    }
  })
})

onMounted(async () => {
  await Promise.all([loadRegionOptions(), loadData()])
})

async function loadRegionOptions() {
  try {
    const data = await pageStudentStatistics({ page: 1, size: 500 })
    const records = Array.isArray(data?.records) ? data.records : []
    const regionTree = normalizeRegionTree(records)
    provinceOptions.value = regionTree.provinceOptions
    cityOptionsByProvince.value = regionTree.cityOptionsByProvince
    districtOptionsByProvinceCity.value = regionTree.districtOptionsByProvinceCity
  } catch (error) {
    message.value = error.message || '地区选项加载失败'
    messageType.value = 'error'
  }
}

async function loadData() {
  loading.value = true
  message.value = ''

  try {
    const data = await listRegionStatistics({
      province: filters.province,
      city: filters.city,
      district: filters.district,
    })
    regions.value = Array.isArray(data) ? data : []
  } catch (error) {
    message.value = error.message || '地区学员统计加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

function handleProvinceChange() {
  filters.city = ''
  filters.district = ''
}

function handleCityChange() {
  filters.district = ''
}

function resetFilters() {
  filters.province = ''
  filters.city = ''
  filters.district = ''
  loadData()
}
</script>
