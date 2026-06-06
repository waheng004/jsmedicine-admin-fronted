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
          :disabled="action.pending"
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
            <td v-for="column in columns" :key="column" :class="{ 'table-cell--image': isImageField(column) }">
              <template v-if="isImageField(column)">
                <div v-if="getImageUrl(record, column)" class="image-cell">
                  <img class="image-thumb" :src="getImageUrl(record, column)" :alt="`${getLabel(column)}预览`" />
                  <a class="image-link" :href="getImageUrl(record, column)" target="_blank" rel="noreferrer">
                    查看原图
                  </a>
                </div>
                <span v-else>-</span>
              </template>
              <template v-else>{{ formatCell(record, column) }}</template>
            </td>
            <td class="row-actions">
              <button type="button" @click="openDetail(record)">查看</button>
              <button v-if="canEdit" type="button" @click="openEdit(record)">修改</button>
              <button
                v-for="linkAction in getLinkActions(record)"
                :key="linkAction.label"
                type="button"
                @click="openLinkAction(linkAction, record)"
              >
                {{ linkAction.label }}
              </button>
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
                :disabled="action.pending"
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

        <dl v-if="modal.mode === 'detail'" class="detail-list">
          <template v-for="item in detailEntries" :key="item.key">
            <dt>{{ item.label }}</dt>
            <dd>
              <template v-if="item.isImage">
                <div v-if="item.rawValue" class="detail-media">
                  <img class="detail-media__preview" :src="item.rawValue" :alt="`${item.label}预览`" />
                  <a class="detail-media__link" :href="item.rawValue" target="_blank" rel="noreferrer">
                    {{ item.rawValue }}
                  </a>
                </div>
                <span v-else>-</span>
              </template>
              <template v-else>{{ item.value }}</template>
            </dd>
          </template>
        </dl>

        <form v-else class="edit-form" @submit.prevent="submitModal">
          <label v-for="field in modal.fields" :key="field.key">
            <span>{{ field.label }}</span>
            <select v-if="field.type === 'select'" v-model="modal.form[field.key]" :required="field.required">
              <option value="">请选择</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <textarea
              v-else-if="field.type === 'textarea' || field.type === 'json'"
              v-model="modal.form[field.key]"
              :placeholder="field.placeholder"
              :required="field.required"
            />
            <div v-else-if="field.type === 'cover-upload'" class="cover-upload-field">
              <div class="cover-upload-field__preview">
                <img
                  v-if="modal.form[field.key]"
                  class="image-thumb"
                  :src="resolvePublicFileUrl(modal.form[field.key])"
                  :alt="`${field.label}预览`"
                />
                <span v-else>未上传封面</span>
              </div>
              <div class="cover-upload-field__actions">
                <input
                  :id="`cover-upload-${field.key}`"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleCoverFileChange(field, $event)"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="Boolean(modal.uploading[field.key])"
                  @click="triggerCoverFileInput(field.key)"
                >
                  {{ modal.uploading[field.key] ? '上传中...' : '上传封面' }}
                </button>
                <span v-if="modal.form[field.key]" class="cover-upload-field__path">{{ modal.form[field.key] }}</span>
              </div>
            </div>
            <input
              v-else
              v-model="modal.form[field.key]"
              :min="field.min"
              :placeholder="field.placeholder"
              :required="field.required"
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
import { useRoute, useRouter } from 'vue-router'
import {
  createResource,
  deleteResource,
  detailResource,
  enrichResourceRecords,
  pageResource,
  runResourceAction,
  updateResource,
} from '../api/resource'
import { uploadCoverFile } from '../api/content-files'
import { rawRequest, resolvePublicFileUrl } from '../api/http'
import { resources } from '../config/resources'

const props = defineProps({
  resourceKey: {
    type: String,
    required: true,
  },
})

const IMAGE_FIELD_KEYS = new Set(['avatarUrl', 'coverUrl', 'iconUrl'])
const router = useRouter()
const route = useRoute()

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
  uploading: {},
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
const detailEntries = computed(() => {
  if (!modal.record) return []

  const hiddenFields = new Set(config.value?.detailHiddenFields || [])

  return Object.keys(modal.record)
    .filter((key) => !hiddenFields.has(key))
    .map((key) => ({
      key,
      label: getLabel(key),
      isImage: isImageField(key),
      rawValue: getImageUrl(modal.record, key),
      value: formatCell(modal.record, key),
    }))
})

const missingRequiredPathParams = computed(() =>
  (config.value?.pathParams || [])
    .filter((param) => param.required && !String(pathParams[param.key] || '').trim())
    .map((param) => param.label),
)

function showMessage(text, type = 'info') {
  message.value = text
  messageType.value = type
}

function getPathParamMessage() {
  if (!missingRequiredPathParams.value.length) return ''
  return `请先输入${missingRequiredPathParams.value.join('、')}后再查询`
}

function getLabel(key) {
  const field = config.value.fields?.find((item) => item.key === key)
  return field?.label || config.value.fieldLabels?.[key] || key
}

function getField(key) {
  return config.value.fields?.find((item) => item.key === key)
}

function isImageField(key) {
  const field = getField(key)
  return field?.type === 'image' || IMAGE_FIELD_KEYS.has(key)
}

function getImageUrl(source, key) {
  if (!source || !isImageField(key)) return ''

  let value = source[key]
  if (key === 'avatarUrl') {
    value = source.avatarUrl || source.coverUrl
  } else if (key === 'coverUrl') {
    value = source.coverUrl || source.avatarUrl
  }

  if (typeof value !== 'string' || !value) {
    return ''
  }

  return resolvePublicFileUrl(value)
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
  if (missingRequiredPathParams.value.length) {
    records.value = []
    total.value = 0
    showMessage(getPathParamMessage())
    return
  }

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
    const normalizedRecords = normalizeRecords(data)
    records.value = await enrichResourceRecords(config.value, normalizedRecords)
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
  records.value = []
  total.value = 0
  showMessage(getPathParamMessage())
}

function handleSearch() {
  query.page = 1
  loadData()
}

function changePage(page) {
  query.page = page
  loadData()
}

function syncPathParamsFromRoute() {
  ;(config.value?.pathParams || []).forEach((param) => {
    const queryValue = route.query?.[param.key]
    pathParams[param.key] = typeof queryValue === 'string' ? queryValue : ''
  })

  if (config.value?.searchable && typeof route.query?.keyword === 'string') {
    query.keyword = route.query.keyword
  }
}

function formatCell(record, key) {
  const field = getField(key)
  const value = record?.[key]

  if (field?.format) {
    return field.format(value, record)
  }

  if (field?.options) {
    const option = field.options.find((item) => String(item.value) === String(value))
    if (option) return option.label
  }

  if (config.value.valueMaps?.[key]) {
    return config.value.valueMaps[key][String(value)] || formatValue(value)
  }

  return formatValue(value, key)
}

function formatValue(value, key = '') {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return `${value.length} 项`
  if (typeof value === 'object') return JSON.stringify(value)
  if (key.endsWith('At') && typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('zh-CN', { hour12: false })
    }
  }
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
  modal.uploading = {}
}

function openToolbarAction(action) {
  if (action.pending || !action.api) {
    showMessage('功能待接口接入')
    return
  }

  if (action.fileUpload) {
    openFileUploadAction(action)
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
  modal.uploading = {}
}

function openFileUploadAction(action) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = action.accept || '.xlsx,.xls'
  input.onchange = async () => {
    const [file] = Array.from(input.files || [])
    if (!file) return

    const formData = new FormData()
    formData.append(action.fileFieldName || 'file', file)

    try {
      const response = await rawRequest(action.api, {
        method: action.method || 'POST',
        body: formData,
      })
      const result = await response.json()
      modal.open = true
      modal.title = action.label
      modal.mode = 'detail'
      modal.record = result.data ?? result
      loadData()
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }
  input.click()
}

async function runToolbarResultAction(action) {
  try {
    if (action.fileDownload) {
      await runFileDownloadAction(action)
      showMessage('导出成功')
      return
    }

    const result = await runResourceAction(action, {}, {})
    modal.open = true
    modal.title = action.label
    modal.mode = 'detail'
    modal.record = result.data ?? result
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

async function runFileDownloadAction(action) {
  const params = {
    ...pathParams,
    keyword: query.keyword,
  }
  ;(action.queryKeys || []).forEach((key) => {
    if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
      params[key] = query[key]
    }
  })
  const response = await rawRequest(`${action.api}${buildQueryString(params)}`, { method: action.method || 'GET' })
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = action.fileName || 'download.xlsx'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function buildQueryString(params = {}) {
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, value)
    }
  })
  const text = queryParams.toString()
  return text ? `?${text}` : ''
}

async function openDetail(record) {
  try {
    const result = await detailResource(config.value, record)
    modal.record = result.data ? { ...record, ...result.data } : record
  } catch {
    modal.record = record
  }

  modal.open = true
  modal.title = `${config.value.title}详情`
  modal.mode = 'detail'
}

async function openEdit(record) {
  let editRecord = record

  if (config.value.useDetailForEdit) {
    try {
      const result = await detailResource(config.value, record)
      editRecord = result.data ? { ...record, ...result.data } : record
    } catch (error) {
      showMessage(error.message, 'error')
      return
    }
  }

  modal.open = true
  modal.title = `修改${config.value.title}`
  modal.mode = 'edit'
  modal.fields = config.value.fields || []
  modal.record = editRecord
  modal.action = null
  modal.form = initForm(modal.fields, editRecord)
  modal.uploading = {}
}

function openAction(action, record) {
  if (action.pending || !action.api) {
    showMessage('功能待接口接入')
    return
  }

  modal.open = true
  modal.title = action.label
  modal.mode = 'action'
  modal.fields = action.fields || []
  modal.record = record
  modal.action = action
  modal.form = initForm(modal.fields, record)
  modal.uploading = {}
}

function getLinkActions(record) {
  return (config.value.linkActions || []).filter((action) => {
    const value = record?.[action.paramKey]
    return value !== null && value !== undefined && value !== ''
  })
}

function openLinkAction(action, record) {
  const value = record?.[action.paramKey]
  if (value === null || value === undefined || value === '') {
    showMessage(`${action.label}缺少必要参数`, 'error')
    return
  }

  const targetPath = action.path
  const queryParams = action.queryKey ? { [action.queryKey]: String(value) } : {}
  router.push({ path: targetPath, query: queryParams })
}

function triggerCoverFileInput(fieldKey) {
  document.getElementById(`cover-upload-${fieldKey}`)?.click()
}

async function handleCoverFileChange(field, event) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showMessage('仅支持 jpg、png、webp 格式封面', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage('封面大小不能超过 5MB', 'error')
    event.target.value = ''
    return
  }

  try {
    modal.uploading[field.key] = true
    const result = await uploadCoverFile(file, field.usage)
    modal.form[field.key] = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    modal.uploading[field.key] = false
    event.target.value = ''
  }
}

function closeModal() {
  modal.open = false
  modal.submitting = false
  modal.uploading = {}
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

    if (value !== '' && value !== undefined) {
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
      await createResource(config.value, buildResourceBody(body))
    } else if (modal.mode === 'edit') {
      await updateResource(config.value, modal.record, buildResourceBody(body))
    } else if (modal.mode === 'action' || modal.mode === 'toolbarAction') {
      const actionBody = buildActionBody(body, modal.action)
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

function buildResourceBody(body) {
  return config.value.bodyTransform ? config.value.bodyTransform(body, modal) : body
}

function buildActionBody(body, action) {
  const bodyKeys = Object.keys(body)
  const onlyValue = bodyKeys.length === 1 ? body[bodyKeys[0]] : null

  if (action?.wrapArrayKey && Array.isArray(onlyValue)) {
    return { [action.wrapArrayKey]: onlyValue }
  }

  if (Array.isArray(onlyValue)) {
    return onlyValue
  }

  return body
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
  () => [props.resourceKey, route.fullPath],
  () => {
    query.page = 1
    query.keyword = ''
    Object.keys(pathParams).forEach((key) => delete pathParams[key])
    ;(config.value.pathParams || []).forEach((param) => {
      pathParams[param.key] = ''
    })
    syncPathParamsFromRoute()
    loadData()
  },
)

onMounted(() => {
  ;(config.value.pathParams || []).forEach((param) => {
    pathParams[param.key] = ''
  })
  syncPathParamsFromRoute()
  loadData()
})
</script>
