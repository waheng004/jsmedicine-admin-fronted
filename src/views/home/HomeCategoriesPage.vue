<template>
  <section class="resource-page">
    <div class="resource-header">
      <div>
        <h2>分类管理</h2>
        <p>维护首页展示位分类。当前分类主要作为首页展示容器使用，具体来源模块在配置首页内容时单独选择。</p>
      </div>
      <div class="header-actions">
        <button class="primary-button" type="button" @click="openCreate">新增</button>
        <button class="ghost-button" type="button" @click="loadData">刷新</button>
      </div>
    </div>

    <form class="filter-bar" @submit.prevent="loadData">
      <label>
        <span>关键词</span>
        <input v-model.trim="keyword" placeholder="按分类名称查询" />
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
            <th>ID</th>
            <th>分类名称</th>
            <th>分类类型</th>
            <th>状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6">加载中...</td>
          </tr>
          <tr v-else-if="records.length === 0">
            <td colspan="6">暂无数据</td>
          </tr>
          <tr v-for="record in records" v-else :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.categoryName || '-' }}</td>
            <td>{{ categoryTypeLabel(record.categoryCode) }}</td>
            <td>{{ record.status === '1' || record.status === 1 ? '启用' : '未启用' }}</td>
            <td>{{ record.sortOrder ?? '-' }}</td>
            <td class="row-actions">
              <button type="button" @click="openContents(record)">查看内容</button>
              <button type="button" @click="openEdit(record)">修改</button>
              <button class="danger-link" type="button" @click="handleDelete(record)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>第 {{ page }} 页</span>
      <button type="button" :disabled="records.length < size" @click="changePage(page + 1)">下一页</button>
    </footer>

    <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
      <section class="modal">
        <header>
          <h3>{{ modal.mode === 'create' ? '新增分类' : '修改分类' }}</h3>
          <button type="button" aria-label="关闭" @click="closeModal">x</button>
        </header>

        <form class="edit-form" @submit.prevent="submitModal">
          <label>
            <span>分类名称</span>
            <input v-model.trim="modal.form.categoryName" required />
          </label>
          <label>
            <span>分类编码</span>
            <input v-model.trim="modal.form.categoryCode" placeholder="例如 TD_HOME_REC" />
          </label>
          <label>
            <span>排序</span>
            <input v-model="modal.form.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>状态</span>
            <select v-model="modal.form.status" required>
              <option value="1">启用</option>
              <option value="0">未启用</option>
            </select>
          </label>
          <label>
            <span>描述</span>
            <textarea v-model="modal.form.description" />
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

    <div v-if="contentsModal.open" class="modal-backdrop" @click.self="closeContentsModal">
      <section class="modal modal--wide">
        <header>
          <h3>{{ contentsModal.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeContentsModal">x</button>
        </header>

        <p v-if="contentsModal.message" class="page-message" :class="{ 'page-message--error': contentsModal.messageType === 'error' }">
          {{ contentsModal.message }}
        </p>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>来源模块</th>
                <th>资源状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="contentsModal.loading">
                <td colspan="5">加载中...</td>
              </tr>
              <tr v-else-if="contentsModal.records.length === 0">
                <td colspan="5">该分类下暂无已配置内容</td>
              </tr>
              <tr v-for="item in contentsModal.records" v-else :key="item.id">
                <td>{{ item.targetTitle || item.title || '-' }}</td>
                <td>{{ item.contentTypeLabel || '-' }}</td>
                <td>{{ item.targetAvailable === false ? '资源不可用' : '正常' }}</td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td class="row-actions">
                  <button class="danger-link" type="button" @click="handleDeleteContent(item, true)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="pagination-bar">
          <span>共 {{ contentsModal.total }} 条</span>
          <button type="button" :disabled="contentsModal.page <= 1" @click="changeContentsPage(contentsModal.page - 1)">上一页</button>
          <span>第 {{ contentsModal.page }} 页</span>
          <button type="button" :disabled="contentsModal.page * contentsModal.size >= contentsModal.total" @click="changeContentsPage(contentsModal.page + 1)">下一页</button>
        </footer>

        <div class="modal-actions">
          <button class="ghost-button" type="button" @click="closeContentsModal">关闭</button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { createHomeCategory, deleteHomeCategory, deleteHomeContent, homeContentTypeOptions, listHomeCategories, listHomeContents, updateHomeCategory } from '../../api/home'

const records = ref([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = 10
const message = ref('')
const messageType = ref('info')
const modal = reactive({
  open: false,
  mode: 'create',
  submitting: false,
  recordId: null,
  form: {
    categoryName: '',
    categoryCode: '',
    sortOrder: '0',
    status: '1',
    description: '',
  },
})
const contentTypeLabelMap = Object.fromEntries(homeContentTypeOptions.map((item) => [item.value, item.label]))
const contentsModal = reactive({
  open: false,
  categoryId: null,
  title: '',
  loading: false,
  page: 1,
  size: 10,
  total: 0,
  records: [],
  message: '',
  messageType: 'info',
})

function categoryTypeLabel(code) {
  return code || '-'
}

function contentTypeLabel(code, fallback = '') {
  return contentTypeLabelMap[code] || fallback || code || '-'
}

function showMessage(text, type = 'info') {
  message.value = text
  messageType.value = type
}

function showContentsMessage(text, type = 'info') {
  contentsModal.message = text
  contentsModal.messageType = type
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false })
}

async function loadData() {
  loading.value = true
  showMessage('')
  try {
    const result = await listHomeCategories({ page: page.value, size, keyword: keyword.value })
    records.value = result?.data?.records || []
    total.value = Number(result?.data?.total || 0)
  } catch (error) {
    records.value = []
    total.value = 0
    showMessage(error.message, 'error')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  keyword.value = ''
  page.value = 1
  loadData()
}

function changePage(nextPage) {
  page.value = nextPage
  loadData()
}

function openCreate() {
  modal.open = true
  modal.mode = 'create'
  modal.recordId = null
  modal.form = {
    categoryName: '',
    categoryCode: '',
    sortOrder: '0',
    status: '1',
    description: '',
  }
}

function openEdit(record) {
  modal.open = true
  modal.mode = 'edit'
  modal.recordId = record.id
  modal.form = {
    categoryName: record.categoryName || '',
    categoryCode: record.categoryCode || '',
    sortOrder: String(record.sortOrder ?? 0),
    status: String(record.status ?? '1'),
    description: record.description || '',
  }
}

function closeModal() {
  modal.open = false
  modal.submitting = false
}

async function loadContentsData() {
  if (!contentsModal.categoryId) return
  contentsModal.loading = true
  showContentsMessage('')
  try {
    const result = await listHomeContents({
      page: contentsModal.page,
      size: contentsModal.size,
      categoryId: Number(contentsModal.categoryId),
    })
    contentsModal.records = (result?.data?.records || []).map((item) => ({
      ...item,
      contentTypeLabel: item.contentTypeLabel || contentTypeLabel(item.contentType),
    }))
    contentsModal.total = Number(result?.data?.total || 0)
  } catch (error) {
    contentsModal.records = []
    contentsModal.total = 0
    showContentsMessage(error.message, 'error')
  } finally {
    contentsModal.loading = false
  }
}

function openContents(record) {
  contentsModal.open = true
  contentsModal.categoryId = record.id
  contentsModal.title = `${record.categoryName || '首页分类'}内容`
  contentsModal.page = 1
  contentsModal.total = 0
  contentsModal.records = []
  contentsModal.message = ''
  loadContentsData()
}

function closeContentsModal() {
  contentsModal.open = false
  contentsModal.loading = false
}

function changeContentsPage(nextPage) {
  contentsModal.page = nextPage
  loadContentsData()
}

async function submitModal() {
  modal.submitting = true
  try {
    const body = {
      categoryName: modal.form.categoryName || '',
      categoryCode: modal.form.categoryCode || '',
      parentId: null,
      description: modal.form.description || '',
      sortOrder: Number(modal.form.sortOrder || 0),
      status: String(modal.form.status || '1'),
    }
    if (modal.mode === 'create') {
      await createHomeCategory(body)
    } else {
      await updateHomeCategory(modal.recordId, body)
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

async function handleDeleteContent(record, fromContentsModal = false) {
  if (!window.confirm('确认删除该首页内容吗？')) return
  try {
    await deleteHomeContent(record.id)
    if (fromContentsModal) {
      showContentsMessage('删除成功')
      loadContentsData()
    } else {
      showMessage('删除成功')
    }
    loadData()
  } catch (error) {
    if (fromContentsModal) {
      showContentsMessage(error.message, 'error')
    } else {
      showMessage(error.message, 'error')
    }
  }
}

async function handleDelete(record) {
  if (!window.confirm('确认删除该分类吗？')) return
  try {
    await deleteHomeCategory(record.id)
    showMessage('删除成功')
    loadData()
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

loadData()
</script>
