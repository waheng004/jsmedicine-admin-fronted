<template>
  <section class="exam-dashboard-page">
    <header class="exam-dashboard-page__header">
      <div class="exam-dashboard-page__header-main">
        <p class="exam-dashboard-page__breadcrumb">当前页面 / 考核数据大屏</p>
        <h2>考核数据大屏</h2>
        <p>按考核场次查看整体进度、题型结构、地区分布和参与明细。</p>
      </div>
      <div class="exam-dashboard-page__header-actions">
        <button class="stats-button" type="button" @click="openCreateDialog">新建考核</button>
        <button class="stats-button stats-button--ghost" type="button" :disabled="listLoading" @click="loadAssessments">
          {{ listLoading ? '场次刷新中...' : '刷新场次' }}
        </button>
        <button class="stats-button" type="button" :disabled="dashboardLoading || !selectedAssessmentId" @click="refreshAll">
          {{ dashboardLoading ? '数据刷新中...' : '刷新大屏' }}
        </button>
      </div>
    </header>

    <p v-if="message" class="stats-message" :class="{ 'stats-message--error': messageType === 'error' }">
      {{ message }}
    </p>

    <section class="stats-panel exam-dashboard-page__selector-panel">
      <div class="exam-dashboard-page__selector-row">
        <label class="exam-dashboard-page__selector exam-dashboard-page__selector--status">
          <span>考核状态</span>
          <select v-model="assessmentQuery.status" @change="handleStatusChange">
            <option v-for="option in assessmentStatusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="exam-dashboard-page__selector">
          <span>选择考核场次</span>
          <select v-model="selectedAssessmentId">
            <option value="">请选择考核场次</option>
            <option v-for="item in filteredAssessments" :key="item.id" :value="String(item.id)">
              {{ item.assessmentName || `考核 ${item.id}` }} · {{ formatAssessmentType(item.assessmentType) }}
            </option>
          </select>
        </label>
      </div>
      <p v-if="!listLoading && filteredAssessments.length === 0" class="exam-dashboard-page__selector-empty">
        暂无考核场次，请先新建考核。
      </p>
    </section>

    <template v-if="selectedAssessmentId">
      <section class="exam-dashboard-page__screen">
        <div class="exam-dashboard-page__screen-left">
          <article class="stats-panel exam-dashboard-page__info-card">
            <div class="exam-dashboard-page__panel-heading exam-dashboard-page__panel-heading--split">
              <span class="exam-dashboard-page__panel-icon exam-dashboard-page__panel-icon--blue">i</span>
              <strong>考核信息</strong>
              <div class="exam-dashboard-page__countdown-mini">
                <span>倒计时</span>
                <strong>{{ formatCountdownCompact(overview.countdownSeconds) }}</strong>
              </div>
            </div>
            <dl class="exam-dashboard-page__info-list">
              <div v-for="row in infoRows" :key="row.label">
                <dt>
                  <span class="exam-dashboard-page__info-icon" :class="`exam-dashboard-page__info-icon--${row.tone}`">{{ row.icon }}</span>
                  <span>{{ row.label }}</span>
                </dt>
                <dd>{{ row.value }}</dd>
              </div>
            </dl>
            <div class="exam-dashboard-page__question-brief">
              <div v-for="item in questionBriefCards" :key="item.questionType" class="exam-dashboard-page__question-brief-item">
                <span class="exam-dashboard-page__question-brief-icon" :class="`exam-dashboard-page__question-brief-icon--${item.tone}`">{{ item.icon }}</span>
                <div class="exam-dashboard-page__question-brief-body">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.questionCount }} 题</span>
                </div>
                <em class="exam-dashboard-page__question-brief-score">{{ formatNumber(item.totalScore) }} 分</em>
              </div>
              <div v-if="normalizedQuestionBreakdown.length === 0" class="exam-dashboard-page__empty-inline">
                暂无题库信息
              </div>
            </div>
          </article>

          <article class="stats-panel exam-dashboard-page__student-card">
            <div class="exam-dashboard-page__panel-heading">
              <span class="exam-dashboard-page__panel-icon exam-dashboard-page__panel-icon--indigo">s</span>
              <strong>考核概览</strong>
            </div>
            <div class="exam-dashboard-page__student-grid">
              <div v-for="card in studentSummaryCards" :key="card.key" class="exam-dashboard-page__student-metric" :class="`exam-dashboard-page__student-metric--${card.tone}`">
                <span class="exam-dashboard-page__student-metric-icon">{{ card.icon }}</span>
                <strong>{{ card.value }}</strong>
                <span>{{ card.label }}</span>
              </div>
            </div>
          </article>
        </div>

        <div class="exam-dashboard-page__screen-right">
          <article class="stats-panel exam-dashboard-page__chart-card">
            <div class="stats-panel__header">
              <div class="exam-dashboard-page__chart-title">
                <h3>应考 / 实考 / 未考人数</h3>
                <span class="exam-dashboard-page__chart-help">?</span>
                <p>按维度查看考核参与进度。</p>
              </div>
              <div class="exam-dashboard-page__chart-controls">
                <label>
                  <span>维度</span>
                  <select v-model="dashboardQuery.dimension" @change="handleDashboardConfigChange">
                    <option v-for="option in dimensionOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>
              </div>
            </div>
            <div class="exam-dashboard-page__chart-legend">
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--expected" />应考人数</span>
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--attend" />实考人数</span>
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--pending" />未考人数</span>
            </div>
            <div v-if="distribution.length > 0" ref="topChartRef" class="exam-dashboard-page__echart" />
            <div v-else class="exam-dashboard-page__empty-inline">暂无柱状图数据</div>
          </article>

          <article class="stats-panel exam-dashboard-page__chart-card">
            <div class="stats-panel__header">
              <div class="exam-dashboard-page__chart-title">
                <h3>考核中 / 完成考核 / 合格人数</h3>
                <span class="exam-dashboard-page__chart-help">?</span>
                <p>按同一维度查看完成情况和合格情况。</p>
              </div>
            </div>
            <div class="exam-dashboard-page__chart-legend">
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--progress" />考核中</span>
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--complete" />完成考核</span>
              <span><i class="exam-dashboard-page__legend-dot exam-dashboard-page__legend-dot--pass" />合格人数</span>
            </div>
            <div v-if="distribution.length > 0" ref="bottomChartRef" class="exam-dashboard-page__echart" />
            <div v-else class="exam-dashboard-page__empty-inline">暂无柱状图数据</div>
          </article>
        </div>
      </section>
      <p class="exam-dashboard-page__footer-note">数据统计截止当前时间，实际数据以系统为准</p>
    </template>

    <section v-else class="stats-panel exam-dashboard-page__empty-state">
      <div class="stats-panel__header">
        <div>
          <h3>还未选择考核场次</h3>
          <p>请先从上方场次列表中选中一个考核，再查看大屏数据。</p>
        </div>
      </div>
    </section>

    <div v-if="createDialog.open" class="stats-modal-backdrop" @click.self="closeCreateDialog">
      <section class="stats-modal exam-dashboard-page__create-modal">
        <header class="stats-modal__header">
          <div>
            <h3>新建考核</h3>
            <p>按后端考核场次契约创建一条可在大屏展示的考核。</p>
          </div>
          <button class="stats-modal__close" type="button" @click="closeCreateDialog">x</button>
        </header>
        <form class="stats-modal__form exam-dashboard-page__create-form" @submit.prevent="submitCreateAssessment">
          <label class="exam-dashboard-page__create-form--full">
            <span>考核名称</span>
            <input v-model.trim="createDialog.form.assessmentName" placeholder="例如：2026 年 6 月针灸理论考核" />
          </label>

          <label>
            <span>考核类型</span>
            <select v-model="createDialog.form.assessmentType">
              <option v-for="option in assessmentTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label>
            <span>试卷</span>
            <select v-model="createDialog.form.paperId">
              <option value="">请选择试卷</option>
              <option v-for="option in examPaperOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label>
            <span>开始时间</span>
            <input v-model="createDialog.form.startAt" type="datetime-local" />
          </label>

          <label>
            <span>结束时间</span>
            <input v-model="createDialog.form.endAt" type="datetime-local" />
          </label>

          <fieldset class="exam-dashboard-page__create-scope">
            <legend>考核范围</legend>
            <div class="exam-dashboard-page__scope-switches">
              <button
                v-for="option in scopeModeOptions"
                :key="option.value"
                class="stats-switch"
                :class="{ 'stats-switch--active': createDialog.form.scopeMode === option.value }"
                type="button"
                @click="changeScopeMode(option.value)"
              >
                {{ option.label }}
              </button>
            </div>

            <div v-if="createDialog.form.scopeMode === 'all'" class="exam-dashboard-page__scope-picker">
              <p class="exam-dashboard-page__scope-summary">当前考核范围：全部学员</p>
            </div>

            <div v-else-if="createDialog.form.scopeMode === 'region'" class="exam-dashboard-page__scope-picker">
              <div class="exam-dashboard-page__scope-grid exam-dashboard-page__scope-grid--dropdowns">
                <div class="exam-dashboard-page__multi-select">
                  <button class="exam-dashboard-page__multi-select-trigger" type="button" @click="toggleScopeDropdown('province')">
                    <span>{{ provinceSummaryText }}</span>
                    <strong>省份</strong>
                  </button>
                  <div v-if="createDialog.openDropdown === 'province'" class="exam-dashboard-page__multi-select-panel">
                    <label class="exam-dashboard-page__scope-option exam-dashboard-page__scope-option--all">
                      <input type="checkbox" :checked="isProvinceAllSelected" @change="toggleAllProvinceSelections" />
                      <span>全选省份</span>
                    </label>
                    <label v-for="item in createDialog.regionOptions.provinces" :key="item.code" class="exam-dashboard-page__scope-option">
                      <input v-model="createDialog.form.provinceCodes" type="checkbox" :value="item.code" @change="handleProvinceSelectionsChange" />
                      <span>{{ item.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="exam-dashboard-page__multi-select">
                  <button class="exam-dashboard-page__multi-select-trigger" type="button" :disabled="availableCityOptions.length === 0" @click="toggleScopeDropdown('city')">
                    <span>{{ citySummaryText }}</span>
                    <strong>城市</strong>
                  </button>
                  <div v-if="createDialog.openDropdown === 'city'" class="exam-dashboard-page__multi-select-panel">
                    <label class="exam-dashboard-page__scope-option exam-dashboard-page__scope-option--all">
                      <input type="checkbox" :checked="isCityAllSelected" @change="toggleAllCitySelections" />
                      <span>全选城市</span>
                    </label>
                    <label v-for="item in availableCityOptions" :key="item.code" class="exam-dashboard-page__scope-option">
                      <input v-model="createDialog.form.cityCodes" type="checkbox" :value="item.code" @change="handleCitySelectionsChange" />
                      <span>{{ item.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="exam-dashboard-page__multi-select">
                  <button class="exam-dashboard-page__multi-select-trigger" type="button" :disabled="availableDistrictOptions.length === 0" @click="toggleScopeDropdown('district')">
                    <span>{{ districtSummaryText }}</span>
                    <strong>区县</strong>
                  </button>
                  <div v-if="createDialog.openDropdown === 'district'" class="exam-dashboard-page__multi-select-panel">
                    <label class="exam-dashboard-page__scope-option exam-dashboard-page__scope-option--all">
                      <input type="checkbox" :checked="isDistrictAllSelected" @change="toggleAllDistrictSelections" />
                      <span>全选区县</span>
                    </label>
                    <label v-for="item in availableDistrictOptions" :key="item.code" class="exam-dashboard-page__scope-option">
                      <input v-model="createDialog.form.districtCodes" type="checkbox" :value="item.code" />
                      <span>{{ item.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <p class="exam-dashboard-page__scope-summary">{{ selectedRegionSummary }}</p>
            </div>

            <div v-else-if="createDialog.form.scopeMode === 'organization'" class="exam-dashboard-page__scope-picker">
              <label class="exam-dashboard-page__create-form--full">
                <span>搜索机构</span>
                <input v-model.trim="createDialog.organizationKeyword" placeholder="输入机构名称后点击搜索" />
              </label>
              <div class="exam-dashboard-page__scope-picker-actions">
                <button class="stats-button stats-button--ghost" type="button" :disabled="createDialog.organizationLoading" @click="searchOrganizations">
                  {{ createDialog.organizationLoading ? '搜索中...' : '搜索机构' }}
                </button>
              </div>
              <div class="exam-dashboard-page__scope-option-list">
                <label v-for="item in createDialog.organizationOptions" :key="item.value" class="exam-dashboard-page__scope-option">
                  <input v-model="createDialog.form.organizationIds" type="checkbox" :value="item.value" />
                  <span>{{ item.label }}</span>
                </label>
                <div v-if="!createDialog.organizationLoading && createDialog.organizationOptions.length === 0" class="exam-dashboard-page__empty-inline">
                  暂无机构可选，请先搜索
                </div>
              </div>
            </div>

            <div v-else class="exam-dashboard-page__scope-picker">
              <label class="exam-dashboard-page__create-form--full">
                <span>搜索学员</span>
                <input v-model.trim="createDialog.studentKeyword" placeholder="输入姓名或手机号后点击搜索" />
              </label>
              <div class="exam-dashboard-page__scope-picker-actions">
                <button class="stats-button stats-button--ghost" type="button" :disabled="createDialog.studentLoading" @click="searchStudents">
                  {{ createDialog.studentLoading ? '搜索中...' : '搜索学员' }}
                </button>
              </div>
              <div class="exam-dashboard-page__scope-option-list">
                <label v-for="item in createDialog.studentOptions" :key="item.value" class="exam-dashboard-page__scope-option">
                  <input v-model="createDialog.form.studentIds" type="checkbox" :value="item.value" />
                  <span>{{ item.label }}</span>
                </label>
                <div v-if="!createDialog.studentLoading && createDialog.studentOptions.length === 0" class="exam-dashboard-page__empty-inline">
                  暂无学员可选，请先搜索
                </div>
              </div>
            </div>
          </fieldset>

          <p class="exam-dashboard-page__create-hint">
            先选择一类考核范围。当前支持全部学员、地区多选、机构多选和学员多选，前端会自动转换成后端需要的范围参数。
          </p>
          <p v-if="createDialog.form.scopeMode === 'all'" class="exam-dashboard-page__scope-summary">
            全部学员当前按“启用且认证通过”的学员口径取值，共 {{ availableStudents.length }} 人。
          </p>

          <div class="stats-modal__actions">
            <button class="stats-button stats-button--ghost" type="button" :disabled="createDialog.submitting" @click="closeCreateDialog">取消</button>
            <button class="stats-button" type="submit" :disabled="createDialog.submitting">
              {{ createDialog.submitting ? '创建中...' : '创建考核' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { pageOrganizations } from '../../api/experts'
import {
  createExamAssessment,
  exportExamAssessmentParticipants,
  getExamAssessmentDashboard,
  pageExamPapers,
  pageExamAssessmentParticipants,
  pageExamAssessments,
  pageStudentStatistics,
} from '../../api/statistics'
import { normalizeRegionTree } from './statistics-shared'

const assessmentTypeOptions = [
  { value: 'formal', label: '正式考核' },
  { value: 'makeup', label: '补考' },
  { value: 'mock', label: '模拟考核' },
]

const assessmentStatusOptions = [
  { value: 'not_started', label: '未开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'ended', label: '已结束' },
]

const participantStatusOptions = [
  { value: 'not_started', label: '未开始' },
  { value: 'absent', label: '缺考' },
  { value: 'in_progress', label: '作答中' },
  { value: 'submitted', label: '正常提交' },
  { value: 'forced_submitted', label: '强制交卷' },
  { value: 'timed_out', label: '超时交卷' },
]

const dimensionOptions = [
  { value: 'province', label: '按省份' },
  { value: 'city', label: '按城市' },
  { value: 'district', label: '按区县' },
  { value: 'organization', label: '按机构' },
]

const bucketOptions = [
  { value: '5', label: '5 分钟' },
  { value: '10', label: '10 分钟' },
  { value: '30', label: '30 分钟' },
]

const scopeModeOptions = [
  { value: 'all', label: '全部学员' },
  { value: 'region', label: '按地区' },
  { value: 'organization', label: '按机构' },
  { value: 'student', label: '按学员' },
]

const listLoading = ref(false)
const dashboardLoading = ref(false)
const participantLoading = ref(false)
const exporting = ref(false)
const message = ref('')
const messageType = ref('info')
const assessments = ref([])
const selectedAssessmentId = ref('')
const currentAssessment = ref(null)
const overview = ref({})
const paperStructure = ref({})
const distribution = ref([])
const trend = ref([])
const latestEvents = ref([])
const participants = ref([])
const participantTotal = ref(0)
const pollingTimer = ref(null)
const examPaperOptions = ref([])
const studentRegionRecords = ref([])
const topChartRef = ref(null)
const bottomChartRef = ref(null)
let topChart = null
let bottomChart = null
const createDialog = reactive({
  open: false,
  submitting: false,
  form: createCreateForm(),
  organizationKeyword: '',
  studentKeyword: '',
  organizationLoading: false,
  studentLoading: false,
  organizationOptions: [],
  studentOptions: [],
  openDropdown: '',
  regionOptions: {
    provinces: [],
    citiesByProvince: {},
    districtsByProvinceCity: {},
  },
})

const assessmentQuery = reactive({
  page: 1,
  size: 12,
  sort: '',
  keyword: '',
  assessmentType: '',
  status: 'in_progress',
  startAt: '',
  endAt: '',
})

const dashboardQuery = reactive({
  dimension: 'province',
  bucketMinutes: '5',
})

const participantQuery = reactive({
  page: 1,
  size: 10,
  status: '',
  dimensionCode: '',
  keyword: '',
})

const metricCards = computed(() => [
  { key: 'expectedCount', label: '应考人数', value: formatNullableNumber(overview.value.expectedCount) },
  { key: 'actualAttendCount', label: '实考人数', value: formatNullableNumber(overview.value.actualAttendCount) },
  { key: 'notStartedCount', label: '未开始人数', value: formatNullableNumber(overview.value.notStartedCount) },
  { key: 'absentCount', label: '缺考人数', value: formatNullableNumber(overview.value.absentCount) },
  { key: 'inProgressCount', label: '考试中人数', value: formatNullableNumber(overview.value.inProgressCount) },
  { key: 'completedCount', label: '已完成人数', value: formatNullableNumber(overview.value.completedCount) },
  { key: 'passCount', label: '合格人数', value: formatNullableNumber(overview.value.passCount) },
  { key: 'failCount', label: '不合格人数', value: formatNullableNumber(overview.value.failCount) },
  { key: 'passRate', label: '合格率', value: formatPercent(overview.value.passRate) },
  { key: 'averageScore', label: '平均分', value: formatNullableNumber(overview.value.averageScore) },
  { key: 'highestScore', label: '最高分', value: formatNullableNumber(overview.value.highestScore) },
  { key: 'lowestScore', label: '最低分', value: formatNullableNumber(overview.value.lowestScore) },
])

const studentSummaryCards = computed(() => [
  { key: 'expectedCount', label: '应考人数', value: formatNullableNumber(overview.value.expectedCount), tone: 'blue', icon: '人' },
  { key: 'actualAttendCount', label: '实考人数', value: formatNullableNumber(overview.value.actualAttendCount), tone: 'teal', icon: '实' },
  { key: 'notStartedCount', label: '未考人数', value: formatNullableNumber(overview.value.notStartedCount), tone: 'orange', icon: '未' },
  { key: 'inProgressCount', label: '考核中', value: formatNullableNumber(overview.value.inProgressCount), tone: 'violet', icon: '考' },
  { key: 'completedCount', label: '完成考核', value: formatNullableNumber(overview.value.completedCount), tone: 'blue-soft', icon: '完' },
  { key: 'passCount', label: '合格人数', value: formatNullableNumber(overview.value.passCount), tone: 'green', icon: '合' },
])

const infoRows = computed(() => [
  {
    label: '考核时间',
    value: formatRangeMinute(overview.value.startAt || currentAssessment.value?.startAt, overview.value.endAt || currentAssessment.value?.endAt),
    icon: '时',
    tone: 'blue',
  },
  {
    label: '试卷信息',
    value: paperStructure.value.paperName || overview.value.paperName || '-',
    icon: '卷',
    tone: 'teal',
  },
  {
    label: '总题数',
    value: `${paperStructure.value.questionCount ?? 0} 题`,
    icon: '题',
    tone: 'orange',
  },
  {
    label: '总分 / 合格分',
    value: formatPaperScore(paperStructure.value.totalScore, paperStructure.value.passScore),
    icon: '分',
    tone: 'violet',
  },
])

const questionBriefCards = computed(() =>
  normalizedQuestionBreakdown.value.map((item, index) => ({
    ...item,
    icon: ['单', '多', '判', '填', '答'][index] || '题',
    tone: ['blue', 'teal', 'orange', 'violet', 'green'][index] || 'blue',
  })),
)

const normalizedQuestionBreakdown = computed(() =>
  (paperStructure.value.questionTypeBreakdown || []).map((item) => ({
    ...item,
    label: formatQuestionType(item.questionType),
  })),
)

const maxDistributionExpected = computed(() =>
  Math.max(...distribution.value.map((item) => Number(item.expectedCount || 0)), 1),
)

const maxTrendValue = computed(() =>
  Math.max(
    ...trend.value.flatMap((item) => [
      Number(item.actualAttendCount || 0),
      Number(item.completedCount || 0),
      Number(item.passCount || 0),
    ]),
    1,
  ),
)

const topChartMax = computed(() =>
  Math.max(
    ...distribution.value.flatMap((item) => [
      Number(item.expectedCount || 0),
      Number(item.actualAttendCount || 0),
      Number(getPendingCount(item) || 0),
    ]),
    1,
  ),
)

const bottomChartMax = computed(() =>
  Math.max(
    ...distribution.value.flatMap((item) => [
      Number(item.inProgressCount || 0),
      Number(item.completedCount || 0),
      Number(item.passCount || 0),
    ]),
    1,
  ),
)

const participantTotalPages = computed(() => Math.max(Math.ceil(participantTotal.value / participantQuery.size), 1))

const filteredAssessments = computed(() => {
  if (!assessmentQuery.status) return assessments.value
  return assessments.value.filter((item) => String(item.status || '').toLowerCase() === assessmentQuery.status)
})

const dimensionCodePlaceholder = computed(() => {
  if (dashboardQuery.dimension === 'organization') return '机构编码'
  if (dashboardQuery.dimension === 'district') return '区县编码'
  if (dashboardQuery.dimension === 'city') return '城市编码'
  return '省份编码'
})

const availableCityOptions = computed(() => {
  const map = new Map()

  createDialog.form.provinceCodes.forEach((provinceCode) => {
    ;(createDialog.regionOptions.citiesByProvince[provinceCode] || []).forEach((item) => {
      map.set(item.code, item)
    })
  })

  return [...map.values()]
})

const availableDistrictOptions = computed(() => {
  const map = new Map()

  createDialog.form.cityCodes.forEach((cityCode) => {
    const provinceCode = createDialog.form.provinceCodes.find((item) =>
      (createDialog.regionOptions.citiesByProvince[item] || []).some((city) => city.code === cityCode),
    )
    if (!provinceCode) return
    ;(createDialog.regionOptions.districtsByProvinceCity[`${provinceCode}::${cityCode}`] || []).forEach((item) => {
      map.set(item.code, item)
    })
  })

  return [...map.values()]
})

const isProvinceAllSelected = computed(
  () => createDialog.regionOptions.provinces.length > 0 && createDialog.form.provinceCodes.length === createDialog.regionOptions.provinces.length,
)

const isCityAllSelected = computed(
  () => availableCityOptions.value.length > 0 && createDialog.form.cityCodes.length === availableCityOptions.value.length,
)

const isDistrictAllSelected = computed(
  () => availableDistrictOptions.value.length > 0 && createDialog.form.districtCodes.length === availableDistrictOptions.value.length,
)

const provinceSummaryText = computed(() => summarizeSelections(createDialog.form.provinceCodes, createDialog.regionOptions.provinces, '全部省份'))
const citySummaryText = computed(() => summarizeSelections(createDialog.form.cityCodes, availableCityOptions.value, '全部城市'))
const districtSummaryText = computed(() => summarizeSelections(createDialog.form.districtCodes, availableDistrictOptions.value, '全部区县'))

const selectedRegionSummary = computed(() => {
  const parts = []
  if (createDialog.form.provinceCodes.length > 0) {
    parts.push(`省份 ${createDialog.form.provinceCodes.length} 个`)
  }
  if (createDialog.form.cityCodes.length > 0) {
    parts.push(`城市 ${createDialog.form.cityCodes.length} 个`)
  }
  if (createDialog.form.districtCodes.length > 0) {
    parts.push(`区县 ${createDialog.form.districtCodes.length} 个`)
  }
  return parts.length > 0 ? `已选择：${parts.join(' / ')}` : '请至少选择一个省份'
})

const availableStudents = computed(() =>
  studentRegionRecords.value.filter((item) => isAvailableStudent(item)),
)

watch(
  () => selectedAssessmentId.value,
  (value) => {
    stopPolling()

    if (!value) {
      currentAssessment.value = null
      overview.value = {}
      paperStructure.value = {}
      distribution.value = []
      trend.value = []
      latestEvents.value = []
      participants.value = []
      participantTotal.value = 0
      return
    }

    participantQuery.page = 1
    refreshAll().catch(() => {})
    startPolling()
  },
)

watch(
  () => distribution.value,
  async () => {
    await nextTick()
    renderCharts()
  },
  { deep: true },
)

watch(
  () => dashboardQuery.dimension,
  async () => {
    await nextTick()
    renderCharts()
  },
)

onMounted(async () => {
  await Promise.all([loadAssessments(), loadCreateReferences()])
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  stopPolling()
  destroyCharts()
  window.removeEventListener('resize', handleResize)
})

async function loadAssessments() {
  listLoading.value = true
  message.value = ''

  try {
    const data = await pageExamAssessments({
      page: assessmentQuery.page,
      size: assessmentQuery.size,
      sort: assessmentQuery.sort,
      keyword: assessmentQuery.keyword,
      assessmentType: assessmentQuery.assessmentType,
      startAt: toIsoDateTime(assessmentQuery.startAt),
      endAt: toIsoDateTime(assessmentQuery.endAt),
    })

    assessments.value = Array.isArray(data?.records) ? data.records : []

    if (!filteredAssessments.value.some((item) => String(item.id) === String(selectedAssessmentId.value))) {
      const first = filteredAssessments.value[0]
      selectedAssessmentId.value = first ? String(first.id) : ''
      currentAssessment.value = first || null
    } else {
      currentAssessment.value = filteredAssessments.value.find((item) => String(item.id) === String(selectedAssessmentId.value)) || currentAssessment.value
    }
  } catch (error) {
    message.value = error.message === 'Exam paper does not exist' ? '当前考核绑定的试卷不存在，请联系后端修复场次与试卷数据。' : (error.message || '考核场次加载失败')
    messageType.value = 'error'
  } finally {
    listLoading.value = false
  }
}

function handleStatusChange() {
  assessmentQuery.page = 1
  message.value = ''
  if (!filteredAssessments.value.some((item) => String(item.id) === String(selectedAssessmentId.value))) {
    const first = filteredAssessments.value[0]
    selectedAssessmentId.value = first ? String(first.id) : ''
    currentAssessment.value = first || null
  } else {
    currentAssessment.value = filteredAssessments.value.find((item) => String(item.id) === String(selectedAssessmentId.value)) || currentAssessment.value
  }
  if (selectedAssessmentId.value) {
    refreshAll().catch(() => {})
  } else {
    destroyCharts()
  }
}

function resetAssessmentFilters() {
  assessmentQuery.page = 1
  assessmentQuery.sort = ''
  assessmentQuery.keyword = ''
  assessmentQuery.assessmentType = ''
  assessmentQuery.status = 'in_progress'
  assessmentQuery.startAt = ''
  assessmentQuery.endAt = ''
  loadAssessments()
}

function selectAssessment(assessmentId) {
  selectedAssessmentId.value = String(assessmentId)
  currentAssessment.value = assessments.value.find((item) => String(item.id) === String(assessmentId)) || null
}

function openCreateDialog() {
  createDialog.open = true
  createDialog.submitting = false
  createDialog.form = createCreateForm()
  createDialog.organizationKeyword = ''
  createDialog.studentKeyword = ''
  createDialog.organizationOptions = []
  createDialog.studentOptions = []
  createDialog.openDropdown = ''
}

function closeCreateDialog() {
  createDialog.open = false
  createDialog.submitting = false
  createDialog.openDropdown = ''
}

async function refreshAll() {
  await Promise.all([loadDashboard(), loadParticipants()])
}

async function loadDashboard() {
  if (!selectedAssessmentId.value) return

  dashboardLoading.value = true
  message.value = ''

  try {
    const data = await getExamAssessmentDashboard(selectedAssessmentId.value, {
      dimension: dashboardQuery.dimension,
      bucketMinutes: dashboardQuery.bucketMinutes,
    })

    overview.value = data?.overview || {}
    paperStructure.value = data?.paperStructure || {}
    distribution.value = Array.isArray(data?.distribution) ? data.distribution : []
    trend.value = Array.isArray(data?.trend) ? data.trend : []
    latestEvents.value = Array.isArray(data?.latestEvents) ? data.latestEvents : []
  } catch (error) {
    message.value = error.message === 'Exam paper does not exist' ? '当前考核绑定的试卷不存在，请联系后端修复后再查看大屏。' : (error.message || '大屏数据加载失败')
    messageType.value = 'error'
  } finally {
    dashboardLoading.value = false
  }
}

async function loadParticipants() {
  if (!selectedAssessmentId.value) return

  participantLoading.value = true
  message.value = ''

  try {
    const data = await pageExamAssessmentParticipants(selectedAssessmentId.value, {
      page: participantQuery.page,
      size: participantQuery.size,
      status: participantQuery.status,
      dimensionCode: participantQuery.dimensionCode,
      keyword: participantQuery.keyword,
    })

    participants.value = Array.isArray(data?.records) ? data.records : []
    participantTotal.value = Number(data?.total || 0)
  } catch (error) {
    message.value = error.message || '参与明细加载失败'
    messageType.value = 'error'
  } finally {
    participantLoading.value = false
  }
}

function applyParticipantFilters() {
  participantQuery.page = 1
  loadParticipants()
}

function resetParticipantFilters() {
  participantQuery.page = 1
  participantQuery.status = ''
  participantQuery.dimensionCode = ''
  participantQuery.keyword = ''
  loadParticipants()
}

function changeParticipantPage(page) {
  participantQuery.page = page
  loadParticipants()
}

function handleDashboardConfigChange() {
  loadDashboard()
}

function changeScopeMode(mode) {
  createDialog.form.scopeMode = mode
  createDialog.form.provinceCodes = []
  createDialog.form.cityCodes = []
  createDialog.form.districtCodes = []
  createDialog.form.organizationIds = []
  createDialog.form.studentIds = []
  createDialog.openDropdown = ''
}

async function submitCreateAssessment() {
  const validationMessage = validateCreateForm()
  if (validationMessage) {
    message.value = validationMessage
    messageType.value = 'error'
    return
  }

  createDialog.submitting = true
  message.value = ''

  try {
    const payload = buildCreatePayload()
    const created = await createExamAssessment(payload)
    closeCreateDialog()
    message.value = '考核创建成功'
    messageType.value = 'info'
    await loadAssessments()

    const createdId = created?.id || created?.assessmentId
    if (createdId !== null && createdId !== undefined && createdId !== '') {
      selectAssessment(createdId)
    }
  } catch (error) {
    message.value = error.message || '考核创建失败'
    messageType.value = 'error'
  } finally {
    createDialog.submitting = false
  }
}

async function handleExport() {
  if (!selectedAssessmentId.value) return

  exporting.value = true
  message.value = ''

  try {
    const response = await exportExamAssessmentParticipants(selectedAssessmentId.value, {
      status: participantQuery.status,
      dimensionCode: participantQuery.dimensionCode,
      keyword: participantQuery.keyword,
    })

    const blob = await response.blob()
    const contentDisposition = response.headers.get('Content-Disposition') || response.headers.get('content-disposition') || ''
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/)
    const filename = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || `assessment-${selectedAssessmentId.value}-participants.xlsx`)
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    message.value = error.message || '导出参与明细失败'
    messageType.value = 'error'
  } finally {
    exporting.value = false
  }
}

function startPolling() {
  stopPolling()
  pollingTimer.value = window.setInterval(() => {
    if (document.hidden || !selectedAssessmentId.value) return
    loadDashboard().catch(() => {})
  }, 15000)
}

function stopPolling() {
  if (pollingTimer.value) {
    window.clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

function formatAssessmentMeta(item) {
  return `${formatAssessmentType(item.assessmentType)} · ${formatAssessmentStatus(item.status)} · ${formatDateTime(item.startAt)}`
}

function formatAssessmentType(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'formal') return '正式考核'
  if (normalized === 'makeup') return '补考'
  if (normalized === 'mock') return '模拟考核'
  return value || '-'
}

function formatAssessmentStatus(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'not_started') return '未开始'
  if (normalized === 'in_progress') return '进行中'
  if (normalized === 'ended') return '已结束'
  if (normalized === 'cancelled') return '已取消'
  if (normalized === 'archived') return '已归档'
  return value || '-'
}

function formatQuestionType(value) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'single_choice' || normalized === 'single' || normalized === '1') return '单选'
  if (normalized === 'multiple_choice' || normalized === 'multiple' || normalized === '2') return '多选'
  if (normalized === 'judge' || normalized === 'true_false' || normalized === '3') return '判断'
  if (normalized === 'fill_blank' || normalized === 'fill' || normalized === '4') return '填空'
  if (normalized === 'qa' || normalized === 'essay' || normalized === '5') return '问答'
  return value || '其他'
}

function formatParticipantStatus(value) {
  const normalized = normalizeParticipantStatus(value)
  if (normalized === 'not_started') return '未开始'
  if (normalized === 'absent') return '缺考'
  if (normalized === 'in_progress') return '作答中'
  if (normalized === 'submitted') return '正常提交'
  if (normalized === 'forced_submitted') return '强制交卷'
  if (normalized === 'timed_out') return '超时交卷'
  return value || '-'
}

function normalizeParticipantStatus(value) {
  return String(value || '').toLowerCase()
}

function normalizeEventType(value) {
  return String(value || '').toLowerCase()
}

function formatEventType(value) {
  const normalized = normalizeEventType(value)
  if (normalized === 'enter') return '进入考试'
  if (normalized === 'submit') return '提交试卷'
  if (normalized === 'timeout') return '超时交卷'
  if (normalized === 'forced_submit') return '强制交卷'
  if (normalized === 'disconnect') return '断线'
  if (normalized === 'reconnect') return '重连'
  if (normalized === 'abnormal_exit') return '异常退出'
  return value || '事件'
}

function formatRange(startAt, endAt) {
  if (!startAt && !endAt) return '-'
  return `${formatDateTime(startAt)} 至 ${formatDateTime(endAt)}`
}

function formatRangeMinute(startAt, endAt) {
  if (!startAt && !endAt) return '-'
  return `${formatDateTimeMinute(startAt)} 至 ${formatDateTimeMinute(endAt)}`
}

function formatDateTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatDateTimeMinute(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatShortTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatCountdown(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return '--'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainSeconds = Math.floor(seconds % 60)
  return `${days}天 ${pad(hours)}:${pad(minutes)}:${pad(remainSeconds)}`
}

function formatCountdownCompact(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return '--'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${pad(hours)}:${pad(minutes)}`
}

function createBarStyle(value, maxValue, maxHeight = 100) {
  const current = Number(value || 0)
  const max = Number(maxValue || 1)
  const ratio = max <= 0 ? 0 : Math.max(current, 0) / max
  return { width: `${Math.max(ratio * 100, current > 0 ? 8 : 0)}%`, height: `${Math.max(ratio * maxHeight, current > 0 ? 8 : 0)}px` }
}

function createColumnStyle(value, maxValue, maxHeight = 260) {
  const current = Number(value || 0)
  const max = Number(maxValue || 1)
  const ratio = max <= 0 ? 0 : Math.max(current, 0) / max
  return { height: `${Math.max(ratio * maxHeight, current > 0 ? 10 : 0)}px` }
}

function formatNullableNumber(value) {
  if (value === null || value === undefined || value === '') return '--'
  return formatNumber(value)
}

function formatNumber(value) {
  const number = Number(value)
  if (Number.isNaN(number)) return '--'
  return Number.isInteger(number) ? String(number) : number.toFixed(2)
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '--'
  const number = Number(value)
  if (Number.isNaN(number)) return '--'
  return `${number.toFixed(2)}%`
}

function formatPaperScore(totalScore, passScore) {
  return `${formatNullableNumber(totalScore)} / ${formatNullableNumber(passScore)}`
}

function formatParticipantRegion(item) {
  return [item.provinceName, item.cityName, item.districtName].filter(Boolean).join(' / ') || '--'
}

function formatPassed(value) {
  if (value === true) return '合格'
  if (value === false) return '不合格'
  return '--'
}

function getPendingCount(item) {
  return Number(item.expectedCount || 0) - Number(item.actualAttendCount || 0)
}

function renderCharts() {
  if (!topChartRef.value || !bottomChartRef.value || distribution.value.length === 0) {
    topChart?.clear()
    bottomChart?.clear()
    return
  }

  if (!topChart) {
    topChart = echarts.init(topChartRef.value)
  }

  if (!bottomChart) {
    bottomChart = echarts.init(bottomChartRef.value)
  }

  const categories = distribution.value.map((item) => item.dimensionName || '-')
  const topSeries = [
    { name: '应考人数', data: distribution.value.map((item) => Number(item.expectedCount || 0)), color: '#3f7bf1' },
    { name: '实考人数', data: distribution.value.map((item) => Number(item.actualAttendCount || 0)), color: '#34c6bf' },
    { name: '未考人数', data: distribution.value.map((item) => Number(getPendingCount(item) || 0)), color: '#ff737a' },
  ]
  const bottomSeries = [
    { name: '考核中', data: distribution.value.map((item) => Number(item.inProgressCount || 0)), color: '#2d6cf0' },
    { name: '完成考核', data: distribution.value.map((item) => Number(item.completedCount || 0)), color: '#37c9c2' },
    { name: '合格人数', data: distribution.value.map((item) => Number(item.passCount || 0)), color: '#ff737a' },
  ]

  topChart.setOption(buildBarOption(categories, topSeries))
  bottomChart.setOption(buildBarOption(categories, bottomSeries))
}

function buildBarOption(categories, series) {
  return {
    animationDuration: 500,
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 40,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(21, 49, 104, 0.96)',
      borderColor: 'rgba(94, 159, 255, 0.26)',
      textStyle: {
        color: '#f8fbff',
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: '#d8e6fa',
        },
      },
      axisLabel: {
        color: '#47628d',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: '#edf3fc',
        },
      },
      axisLabel: {
        color: '#7a8fb4',
        fontSize: 12,
      },
    },
    series: series.map((item) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barWidth: 18,
      itemStyle: {
        color: item.color,
        borderRadius: [8, 8, 0, 0],
      },
      label: {
        show: true,
        position: 'top',
        color: '#28426e',
        fontWeight: 600,
        fontSize: 12,
      },
    })),
  }
}

function handleResize() {
  topChart?.resize()
  bottomChart?.resize()
}

function destroyCharts() {
  topChart?.dispose()
  bottomChart?.dispose()
  topChart = null
  bottomChart = null
}

function createCreateForm() {
  return {
    assessmentName: '',
    assessmentType: 'formal',
    paperId: '',
    startAt: '',
    endAt: '',
    scopeMode: 'all',
    provinceCodes: [],
    cityCodes: [],
    districtCodes: [],
    organizationIds: [],
    studentIds: [],
  }
}

function validateCreateForm() {
  if (!createDialog.form.assessmentName) return '请填写考核名称'
  if (!createDialog.form.paperId) return '请选择试卷'
  if (!createDialog.form.startAt) return '请填写开始时间'
  if (!createDialog.form.endAt) return '请填写结束时间'

  const startAt = new Date(toIsoDateTime(createDialog.form.startAt))
  const endAt = new Date(toIsoDateTime(createDialog.form.endAt))
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return '开始时间或结束时间格式不正确'
  if (startAt >= endAt) return '结束时间必须晚于开始时间'

  if (createDialog.form.scopeMode === 'region' && createDialog.form.provinceCodes.length === 0) {
    return '请选择地区范围，至少需要选择一个省份'
  }

  if (createDialog.form.scopeMode === 'organization' && createDialog.form.organizationIds.length === 0) {
    return '请至少选择一个机构'
  }

  if (createDialog.form.scopeMode === 'student' && createDialog.form.studentIds.length === 0) {
    return '请至少选择一个学员'
  }

  const resolvedStudentIds = resolveScopeStudentIds()
  if ((createDialog.form.scopeMode === 'all' || createDialog.form.scopeMode === 'region' || createDialog.form.scopeMode === 'student') && resolvedStudentIds.length === 0) {
    return '当前范围内没有可用于考核的学员，请检查学员启用状态和认证状态'
  }

  return ''
}

function buildCreatePayload() {
  return {
    assessmentName: createDialog.form.assessmentName,
    paperId: Number(createDialog.form.paperId),
    assessmentType: createDialog.form.assessmentType,
    startAt: toIsoDateTime(createDialog.form.startAt),
    endAt: toIsoDateTime(createDialog.form.endAt),
    provinceCode: null,
    cityCode: null,
    districtCode: null,
    organizationIds: createDialog.form.scopeMode === 'organization' ? createDialog.form.organizationIds.map(Number) : [],
    studentIds: resolveScopeStudentIds(),
  }
}

async function loadCreateReferences() {
  await Promise.all([loadExamPaperOptions(), loadRegionOptions()])
}

async function loadExamPaperOptions() {
  try {
    const data = await pageExamPapers({ page: 1, size: 100 })
    const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : []
    examPaperOptions.value = records.map((item) => ({
      value: String(item.id),
      label: `${item.paperName || '未命名试卷'} (#${item.id})`,
    }))
  } catch {}
}

async function loadRegionOptions() {
  try {
    const data = await pageStudentStatistics({ page: 1, size: 500 })
    const records = Array.isArray(data?.records) ? data.records : []
    studentRegionRecords.value = records
    const regionTree = normalizeRegionTree(records)

    createDialog.regionOptions.provinces = regionTree.provinceOptions.map((name) => ({
      code: findRegionCode(records, { province: name }),
      label: name,
    })).filter((item) => item.code)

    createDialog.regionOptions.citiesByProvince = Object.fromEntries(
      Object.entries(regionTree.cityOptionsByProvince).map(([provinceName, cityNames]) => [
        findRegionCode(records, { province: provinceName }),
        cityNames
          .map((cityName) => ({
            code: findRegionCode(records, { province: provinceName, city: cityName }),
            label: cityName,
          }))
          .filter((item) => item.code),
      ]),
    )

    createDialog.regionOptions.districtsByProvinceCity = Object.fromEntries(
      Object.entries(regionTree.districtOptionsByProvinceCity).map(([key, districtNames]) => {
        const [provinceName, cityName] = key.split('::')
        return [
          `${findRegionCode(records, { province: provinceName })}::${findRegionCode(records, { province: provinceName, city: cityName })}`,
          districtNames
            .map((districtName) => ({
              code: findRegionCode(records, { province: provinceName, city: cityName, district: districtName }),
              label: districtName,
            }))
            .filter((item) => item.code),
        ]
      }),
    )
  } catch {}
}

async function searchOrganizations() {
  createDialog.organizationLoading = true

  try {
    const data = await pageOrganizations({
      page: 1,
      size: 100,
      keyword: createDialog.organizationKeyword,
    })
    const records = Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : []
    createDialog.organizationOptions = records.map((item) => ({
      value: String(item.id),
      label: item.orgName || `机构 #${item.id}`,
    }))
  } catch (error) {
    message.value = error.message || '机构搜索失败'
    messageType.value = 'error'
  } finally {
    createDialog.organizationLoading = false
  }
}

async function searchStudents() {
  createDialog.studentLoading = true

  try {
    const data = await pageStudentStatistics({
      page: 1,
      size: 100,
      keyword: createDialog.studentKeyword,
    })
    const records = (Array.isArray(data?.records) ? data.records : []).filter((item) => isAvailableStudent(item))
    createDialog.studentOptions = records.map((item) => ({
      value: String(item.id),
      label: `${item.realName || `学员 #${item.id}`} · ${item.mobile || '--'}`,
    }))
  } catch (error) {
    message.value = error.message || '学员搜索失败'
    messageType.value = 'error'
  } finally {
    createDialog.studentLoading = false
  }
}

function findRegionCode(records, target) {
  const matched = records.find((item) => {
    const provinceMatched = !target.province || String(item.province || '').trim() === target.province
    const cityMatched = !target.city || String(item.city || '').trim() === target.city
    const districtMatched = !target.district || String(item.district || '').trim() === target.district
    return provinceMatched && cityMatched && districtMatched
  })

  if (!matched) return ''
  if (target.district) return String(matched.districtCode || '').trim()
  if (target.city) return String(matched.cityCode || '').trim()
  return String(matched.provinceCode || '').trim()
}

function resolveScopeStudentIds() {
  if (createDialog.form.scopeMode === 'all') {
    return availableStudents.value
      .map((item) => Number(item.id))
      .filter((item) => Number.isInteger(item) && item > 0)
  }

  if (createDialog.form.scopeMode === 'student') {
    const selectedSet = new Set(createDialog.form.studentIds.map(String))
    return studentRegionRecords.value
      .filter((item) => selectedSet.has(String(item.id)) && isAvailableStudent(item))
      .map((item) => Number(item.id))
      .filter((item) => Number.isInteger(item) && item > 0)
  }

  if (createDialog.form.scopeMode === 'region') {
    const provinceSet = new Set(createDialog.form.provinceCodes)
    const citySet = new Set(createDialog.form.cityCodes)
    const districtSet = new Set(createDialog.form.districtCodes)

    return studentRegionRecords.value
      .filter((item) => {
        if (!isAvailableStudent(item)) return false
        const provinceMatched = provinceSet.size === 0 ? false : provinceSet.has(String(item.provinceCode || '').trim())
        const cityMatched = citySet.size === 0 ? false : citySet.has(String(item.cityCode || '').trim())
        const districtMatched = districtSet.size === 0 ? false : districtSet.has(String(item.districtCode || '').trim())
        return districtMatched || cityMatched || provinceMatched
      })
      .map((item) => Number(item.id))
      .filter((item) => Number.isInteger(item) && item > 0)
  }

  return []
}

function isAvailableStudent(item) {
  const status = String(item?.status ?? '').toUpperCase()
  const certificationStatus = String(item?.certificationStatus ?? '').toUpperCase()
  const enabled = status === '1' || status === 'ENABLED'
  const approved = certificationStatus === '2' || certificationStatus === 'APPROVED'
  return enabled && approved
}

function toggleScopeDropdown(type) {
  createDialog.openDropdown = createDialog.openDropdown === type ? '' : type
}

function toggleAllProvinceSelections() {
  createDialog.form.provinceCodes = isProvinceAllSelected.value ? [] : createDialog.regionOptions.provinces.map((item) => item.code)
  handleProvinceSelectionsChange()
}

function toggleAllCitySelections() {
  createDialog.form.cityCodes = isCityAllSelected.value ? [] : availableCityOptions.value.map((item) => item.code)
  handleCitySelectionsChange()
}

function toggleAllDistrictSelections() {
  createDialog.form.districtCodes = isDistrictAllSelected.value ? [] : availableDistrictOptions.value.map((item) => item.code)
}

function handleProvinceSelectionsChange() {
  const availableCitySet = new Set(availableCityOptions.value.map((item) => item.code))
  createDialog.form.cityCodes = createDialog.form.cityCodes.filter((item) => availableCitySet.has(item))
  handleCitySelectionsChange()
}

function handleCitySelectionsChange() {
  const availableDistrictSet = new Set(availableDistrictOptions.value.map((item) => item.code))
  createDialog.form.districtCodes = createDialog.form.districtCodes.filter((item) => availableDistrictSet.has(item))
}

function summarizeSelections(selectedCodes, options, allLabel) {
  if (selectedCodes.length === 0) return `请选择${allLabel.replace('全部', '')}`
  if (options.length > 0 && selectedCodes.length === options.length) return allLabel
  if (selectedCodes.length === 1) {
    return options.find((item) => item.code === selectedCodes[0])?.label || '已选择 1 项'
  }
  return `已选择 ${selectedCodes.length} 项`
}

function toIsoDateTime(value) {
  if (!value) return ''
  return `${value}:00`
}

function pad(value) {
  return String(value).padStart(2, '0')
}
</script>
