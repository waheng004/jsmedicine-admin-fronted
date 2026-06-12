<template>
  <section class="stats-page">
    <header class="stats-page__header">
      <div>
        <h2>学时统计</h2>
        <p>按地区筛选并查看学时统计明细。</p>
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

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>学时统计明细</h3>
          <p>当前按{{ dimensionLabel }}维度展示地区学时数据。</p>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>省份</th>
              <th>城市</th>
              <th>区县</th>
              <th>参与学员数</th>
              <th>完成记录数</th>
              <th>总学时</th>
              <th>平均学时</th>
              <th>平均进度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8">加载中...</td>
            </tr>
            <tr v-else-if="regionData.length === 0">
              <td colspan="8">暂无数据</td>
            </tr>
            <tr v-for="item in regionData" v-else :key="`${item.province}-${item.city}-${item.district}`">
              <td>{{ item.province || '--' }}</td>
              <td>{{ item.city || '--' }}</td>
              <td>{{ item.district || '--' }}</td>
              <td>{{ item.studentCount ?? 0 }}</td>
              <td>{{ item.completedCount ?? 0 }}</td>
              <td>{{ formatHours(item.totalStudyHours) }}</td>
              <td>{{ formatPlainHours(item.averageStudyHours) }}</td>
              <td>{{ formatPercent(item.averageProgressPercent) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { listStudyHoursRegions, pageStudentStatistics } from '../../api/statistics'
import { formatHours, formatPercent, formatPlainHours, normalizeRegionTree } from './statistics-shared'

const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const regionData = ref([])
const provinceOptions = ref([])
const cityOptionsByProvince = ref({})
const districtOptionsByProvinceCity = ref({})
const filters = reactive({
  province: '',
  city: '',
  district: '',
})

const cityOptions = computed(() => cityOptionsByProvince.value[filters.province] || [])
const districtOptions = computed(
  () => districtOptionsByProvinceCity.value[`${filters.province}::${filters.city}`] || [],
)
const dimension = computed(() => {
  if (filters.city) return 'district'
  if (filters.province) return 'city'
  return 'province'
})
const dimensionLabel = computed(() => {
  if (dimension.value === 'district') return '区县'
  if (dimension.value === 'city') return '城市'
  return '省份'
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
    const data = await listStudyHoursRegions({
      province: filters.province,
      city: filters.city,
      district: filters.district,
      dimension: dimension.value,
    })
    regionData.value = Array.isArray(data) ? data : []
  } catch (error) {
    message.value = error.message || '学时统计加载失败'
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
