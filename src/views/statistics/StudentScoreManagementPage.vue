<template>
  <section class="stats-page">
    <header class="stats-page__header">
      <div>
        <h2>学员成绩管理</h2>
        <p>已接入学员成绩明细查询与保存接口，可直接维护五类成绩状态。</p>
      </div>
      <button class="stats-button stats-button--ghost" type="button" :disabled="loading" @click="loadData">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <p v-if="message" class="stats-message" :class="{ 'stats-message--error': messageType === 'error' }">
      {{ message }}
    </p>

    <form class="stats-toolbar" @submit.prevent="applyFilters">
      <div class="stats-filter-grid">
        <label>
          <span>关键词</span>
          <input v-model.trim="query.keyword" placeholder="姓名 / 手机号" />
        </label>
      </div>
      <div class="stats-toolbar__actions">
        <button class="stats-button" type="submit">搜索</button>
        <button class="stats-button stats-button--ghost" type="button" @click="resetFilters">重置</button>
      </div>
    </form>

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>成绩明细表</h3>
          <p>当前已直接使用后端学员成绩明细接口，支持逐条修改保存。</p>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table stats-table--dense">
          <thead>
            <tr>
              <th>姓名</th>
              <th>性别</th>
              <th>手机</th>
              <th v-for="field in scoreFieldDefinitions" :key="field.key">{{ field.label }}</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="scoreFieldDefinitions.length + 4">加载中...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td :colspan="scoreFieldDefinitions.length + 4">暂无数据</td>
            </tr>
            <tr v-for="item in records" v-else :key="item.studentId">
              <td>{{ item.realName || '--' }}</td>
              <td>{{ formatGender(item.gender) }}</td>
              <td>{{ maskMobile(item.mobile) }}</td>
              <td v-for="field in scoreFieldDefinitions" :key="field.key">
                <span class="score-badge" :class="getScoreStatusClass(item[field.key])">
                  {{ getScoreStatusLabel(item[field.key]) }}
                </span>
              </td>
              <td>
                <button class="stats-link-button" type="button" @click="openEditor(item)">修改</button>
              </td>
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

    <section class="stats-panel">
      <div class="stats-panel__header">
        <div>
          <h3>试卷成绩汇总</h3>
          <p>保留试卷维度汇总数据，便于和学员维度成绩状态对照查看。</p>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>试卷</th>
              <th>考试场次</th>
              <th>参考学员数</th>
              <th>通过人数</th>
              <th>通过率</th>
              <th>平均分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paperScores.length === 0">
              <td colspan="6">暂无试卷汇总数据</td>
            </tr>
            <tr v-for="item in paperScores" :key="item.paperId">
              <td>{{ item.paperTitle || `试卷 ${item.paperId}` }}</td>
              <td>{{ item.examCount ?? 0 }}</td>
              <td>{{ item.studentCount ?? 0 }}</td>
              <td>{{ item.passedCount ?? 0 }}</td>
              <td>{{ item.passRatePercent === undefined ? '--' : `${Number(item.passRatePercent).toFixed(1)}%` }}</td>
              <td>{{ item.averageScore === undefined ? '--' : Number(item.averageScore).toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="editor.open" class="stats-modal-backdrop" @click.self="closeEditor">
      <section class="stats-modal">
        <header class="stats-modal__header">
          <div>
            <h3>修改学员成绩</h3>
            <p>{{ editor.studentName }}</p>
          </div>
          <button class="stats-modal__close" type="button" @click="closeEditor">x</button>
        </header>
        <form class="stats-modal__form" @submit.prevent="saveScores">
          <label v-for="field in scoreFieldDefinitions" :key="field.key">
            <span>{{ field.label }}</span>
            <select v-model="editor.form[field.key]">
              <option v-for="option in scoreStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <div class="stats-modal__actions">
            <button class="stats-button stats-button--ghost" type="button" @click="closeEditor">取消</button>
            <button class="stats-button" type="submit" :disabled="editor.submitting">
              {{ editor.submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listExamPaperScores,
  pageStudentScores,
  updateStudentScore,
} from '../../api/statistics'
import {
  formatGender,
  getScoreStatusClass,
  getScoreStatusLabel,
  maskMobile,
  scoreFieldDefinitions,
  scoreStatusOptions,
} from './statistics-shared'

const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const records = ref([])
const total = ref(0)
const paperScores = ref([])
const query = reactive({
  keyword: '',
  page: 1,
  size: 10,
})
const editor = reactive({
  open: false,
  studentId: null,
  studentName: '',
  form: {},
  submitting: false,
})

const totalPages = computed(() => Math.max(Math.ceil(total.value / query.size), 1))

onMounted(loadData)

async function loadData() {
  loading.value = true
  message.value = ''

  try {
    const [scoreData, paperData] = await Promise.all([
      pageStudentScores({
        page: query.page,
        size: query.size,
        keyword: query.keyword,
      }),
      listExamPaperScores({ page: 1, size: 20 }).catch(() => []),
    ])

    records.value = Array.isArray(scoreData?.records) ? scoreData.records : []
    total.value = Number(scoreData?.total || 0)
    paperScores.value = Array.isArray(paperData) ? paperData : []
  } catch (error) {
    message.value = error.message || '学员成绩管理加载失败'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

function openEditor(student) {
  editor.open = true
  editor.studentId = student.studentId
  editor.studentName = student.realName || '未命名学员'
  editor.form = Object.fromEntries(
    scoreFieldDefinitions.map((field) => [field.key, student[field.key] || 'none']),
  )
}

function closeEditor() {
  editor.open = false
  editor.studentId = null
  editor.studentName = ''
  editor.form = {}
  editor.submitting = false
}

async function saveScores() {
  editor.submitting = true
  message.value = ''

  try {
    await updateStudentScore(editor.studentId, editor.form)
    const updatedFields = { ...editor.form }
    records.value = records.value.map((item) =>
      item.studentId === editor.studentId ? { ...item, ...updatedFields } : item,
    )
    message.value = '学员成绩已保存'
    messageType.value = 'info'
    closeEditor()
  } catch (error) {
    message.value = error.message || '学员成绩保存失败'
    messageType.value = 'error'
    editor.submitting = false
  }
}

async function applyFilters() {
  query.page = 1
  await loadData()
}

async function resetFilters() {
  query.keyword = ''
  query.page = 1
  await loadData()
}

async function changePage(page) {
  query.page = Math.min(Math.max(page, 1), totalPages.value)
  await loadData()
}
</script>
