<template>
  <section class="resource-page">
    <div class="resource-header">
      <div>
        <h2>{{ config.title }}</h2>
        <p>{{ config.description || '按后端现有接口提供列表、表单和操作入口。' }}</p>
      </div>
      <div class="header-actions">
        <button v-if="canCreate" class="primary-button" type="button" @click="openCreate">
          新增
        </button>
        <button
          v-for="action in config.toolbarActions || []"
          :key="action.label"
          class="ghost-button"
          type="button"
          @click="openToolbarAction(action)"
        >
          {{ action.label }}
        </button>
        <button class="ghost-button" type="button" @click="loadData">刷新</button>
      </div>
    </div>

    <form class="filter-bar" @submit.prevent="handleSearch">
      <label v-for="param in config.pathParams || []" :key="param.key">
        <span>{{ param.label }}</span>
        <input v-model="pathParams[param.key]" :required="param.required" />
      </label>
      <label v-if="config.searchable">
        <span>关键词</span>
        <input v-model.trim="query.keyword" placeholder="按接口支持字段查询" />
      </label>
      <button class="primary-button" type="submit">查询</button>
      <button class="ghost-button" type="button" @click="resetSearch">重置</button>
    </form>

    <p v-if="message" class="page-message" :class="{ 'page-message--error': messageType === 'error' }">
      {{ message }}
    </p>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column">{{ getLabel(column) }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + 1">加载中...</td>
          </tr>
          <tr v-else-if="records.length === 0">
            <td :colspan="columns.length + 1">暂无数据</td>
          </tr>
          <tr v-for="record in records" v-else :key="record.id || JSON.stringify(record)">
            <td v-for="column in columns" :key="column">{{ formatValue(record[column]) }}</td>
            <td class="row-actions">
              <button type="button" @click="openDetail(record)">查看</button>
              <button v-if="canEdit" type="button" @click="openEdit(record)">修改</button>
              <button
                v-if="canDelete"
                class="danger-link"
                type="button"
                @click="handleDelete(record)"
              >
                删除
              </button>
              <button
                v-for="action in config.actions || []"
                :key="action.label"
                type="button"
                @click="openAction(action, record)"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button type="button" :disabled="records.length < query.size" @click="changePage(query.page + 1)">
        下一页
      </button>
    </footer>

    <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
      <section class="modal">
        <header>
          <h3>{{ modal.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeModal">x</button>
        </header>

        <pre v-if="modal.mode === 'detail'" class="detail-json">{{ JSON.stringify(modal.record, null, 2) }}</pre>

        <form v-else class="edit-form" @submit.prevent="submitModal">
          <label v-for="field in modal.fields" :key="field.key">
            <span>{{ field.label }}</span>
            <select v-if="field.type === 'select'" v-model="modal.form[field.key]">
              <option value="">请选择</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <textarea
              v-else-if="field.type === 'textarea' || field.type === 'json'"
              v-model="modal.form[field.key]"
              :placeholder="field.placeholder"
            />
            <input
              v-else
              v-model="modal.form[field.key]"
              :placeholder="field.placeholder"
              :type="field.type || 'text'"
            />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeModal">取消</button>
            <button class="primary-button" type="submit" :disabled="modal.submitting">
              {{ modal.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  createResource,
  deleteResource,
  detailResource,
  pageResource,
  runResourceAction,
  updateResource,
} from '../api/resource'
import { resources } from '../config/resources'

const props = defineProps({
  resourceKey: {
    type: String,
    required: true,
  },
})

const config = computed(() => resources[props.resourceKey])
const records = ref([])
const total = ref(0)
const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const pathParams = reactive({})
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})
const modal = reactive({
  open: false,
  title: '',
  mode: '',
  fields: [],
  record: null,
  action: null,
  form: {},
  submitting: false,
})

const columns = computed(() => config.value?.columns || [])
const canCreate = computed(
  () => !config.value?.readonly && config.value?.allowCreate !== false && Boolean(config.value?.api?.create),
)
const canEdit = computed(
  () => !config.value?.readonly && config.value?.allowEdit !== false && Boolean(config.value?.api?.update),
)
const canDelete = computed(
  () => config.value?.allowDelete !== false && Boolean(config.value?.api?.delete),
)

function showMessage(text, type = 'info') {
  message.value = text
  messageType.value = type
}

function getLabel(key) {
  const field = config.value.fields?.find((item) => item.key === key)
  return field?.label || key
}

function normalizeRecords(data) {
  if (config.value.singleResult) {
    return data ? [data] : []
  }

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.records)) {
    total.value = Number(data.total || 0)
    return data.records
  }

  return data ? [data] : []
}

async function loadData() {
  if (!config.value) return

  loading.value = true
  showMessage('')

  try {
    const params = {
      ...pathParams,
      page: query.page,
      size: query.size,
      keyword: query.keyword,
    }
    const result = await pageResource(config.value, params)
    const data = result.data
    records.value = normalizeRecords(data)
    if (!data?.records) {
      total.value = records.value.length
    }
  } catch (error) {
    records.value = []
    total.value = 0
    showMessage(error.message, 'error')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  query.keyword = ''
  query.page = 1
  Object.keys(pathParams).forEach((key) => {
    pathParams[key] = ''
  })
  loadData()
}

function handleSearch() {
  query.page = 1
  loadData()
}

function changePage(page) {
  query.page = page
  loadData()
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return `${value.length} 项`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function initForm(fields, record = {}) {
  return fields.reduce((form, field) => {
    const value = record[field.key] ?? field.defaultValue ?? ''
    form[field.key] = field.type === 'json' && typeof value !== 'string' ? JSON.stringify(value || [], null, 2) : value
    return form
  }, {})
}

function openCreate() {
  modal.open = true
  modal.title = `新增${config.value.title}`
  modal.mode = 'create'
  modal.fields = config.value.fields || []
  modal.record = null
  modal.action = null
  modal.form = initForm(modal.fields)
}

function openToolbarAction(action) {
  if (action.pending || !action.api) {
    showMessage('待接口加入', 'error')
    return
  }

  if (action.resultOnly) {
    runToolbarResultAction(action)
    return
  }

  modal.open = true
  modal.title = action.label
  modal.mode = 'toolbarAction'
  modal.fields = action.fields || []
  modal.record = {}
  modal.action = action
  modal.form = initForm(modal.fields)
}

async function runToolbarResultAction(action) {
  try {
    const result = await runResourceAction(action, {}, {})
    modal.open = true
    modal.title = action.label
    modal.mode = 'detail'
    modal.record = result.data ?? result
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

async function openDetail(record) {
  try {
    const result = await detailResource(config.value, record)
    modal.record = result.data || record
  } catch {
    modal.record = record
  }

  modal.open = true
  modal.title = `${config.value.title}详情`
  modal.mode = 'detail'
}

function openEdit(record) {
  modal.open = true
  modal.title = `修改${config.value.title}`
  modal.mode = 'edit'
  modal.fields = config.value.fields || []
  modal.record = record
  modal.action = null
  modal.form = initForm(modal.fields, record)
}

function openAction(action, record) {
  if (action.pending || !action.api) {
    showMessage('待接口加入', 'error')
    return
  }

  modal.open = true
  modal.title = action.label
  modal.mode = 'action'
  modal.fields = action.fields || []
  modal.record = record
  modal.action = action
  modal.form = initForm(modal.fields, record)
}

function closeModal() {
  modal.open = false
  modal.submitting = false
}

function normalizeBody(fields, form) {
  return fields.reduce((body, field) => {
    let value = form[field.key]
    if (field.transform) {
      value = field.transform(value)
    } else if (field.type === 'number' && value !== '') {
      value = Number(value)
    } else if (field.type === 'json') {
      value = value ? JSON.parse(value) : []
    }

    if (value !== '') {
      body[field.key] = value
    }
    return body
  }, {})
}

async function submitModal() {
  modal.submitting = true

  try {
    const body = normalizeBody(modal.fields, modal.form)

    if (modal.mode === 'create') {
      await createResource(config.value, body)
    } else if (modal.mode === 'edit') {
      await updateResource(config.value, modal.record, body)
    } else if (modal.mode === 'action' || modal.mode === 'toolbarAction') {
      const actionBody = Object.keys(body).length === 1 && Array.isArray(Object.values(body)[0])
        ? Object.values(body)[0]
        : body
      await runResourceAction(modal.action, modal.record, actionBody)
    }

    showMessage('操作成功')
    closeModal()
    loadData()
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    modal.submitting = false
  }
}

async function handleDelete(record) {
  if (!window.confirm('确认删除该记录吗？')) {
    return
  }

  try {
    await deleteResource(config.value, record)
    showMessage('删除成功')
    loadData()
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

watch(
  () => props.resourceKey,
  () => {
    query.page = 1
    query.keyword = ''
    Object.keys(pathParams).forEach((key) => delete pathParams[key])
    ;(config.value.pathParams || []).forEach((param) => {
      pathParams[param.key] = ''
    })
    loadData()
  },
)

onMounted(() => {
  ;(config.value.pathParams || []).forEach((param) => {
    pathParams[param.key] = ''
  })
  loadData()
})
</script>
