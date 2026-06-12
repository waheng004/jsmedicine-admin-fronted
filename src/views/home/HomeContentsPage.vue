<template>
  <section class="resource-page">
    <div class="resource-header">
      <div>
        <h2>首页内容</h2>
        <p>先选择首页分类，再选择来源模块和具体资源，将其他业务模块内容配置到首页展示。</p>
      </div>
      <div class="header-actions">
        <button class="primary-button" type="button" @click="openConfigModal">配置首页内容</button>
        <button class="ghost-button" type="button" @click="loadData">刷新</button>
      </div>
    </div>

    <form class="filter-bar" @submit.prevent="loadData">
      <label>
        <span>首页分类</span>
        <select v-model="filters.categoryId">
          <option value="">请选择</option>
          <option v-for="item in categories" :key="item.id" :value="String(item.id)">
            {{ item.categoryName }}
          </option>
        </select>
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
            <th>标题</th>
            <th>首页分类</th>
            <th>来源模块</th>
            <th>封面</th>
            <th>资源状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7">加载中...</td>
          </tr>
          <tr v-else-if="records.length === 0">
            <td colspan="7">暂无数据</td>
          </tr>
          <tr v-for="record in records" v-else :key="record.id">
            <td>{{ record.targetTitle || record.title || '-' }}</td>
            <td>{{ record.categoryName || '-' }}</td>
            <td>{{ record.contentTypeLabel || '-' }}</td>
            <td class="table-cell--image">
              <div v-if="record.targetCoverUrl || record.coverUrl" class="image-cell">
                <img class="image-thumb" :src="resolvePublicFileUrl(record.targetCoverUrl || record.coverUrl)" alt="封面预览" />
                <a class="image-link" :href="resolvePublicFileUrl(record.targetCoverUrl || record.coverUrl)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ record.targetAvailable === false ? '资源不可用' : '正常' }}</td>
            <td>{{ formatDate(record.createdAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="handleDelete(record)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>第 {{ page }} 页</span>
      <button type="button" :disabled="page * size >= total" @click="changePage(page + 1)">下一页</button>
    </footer>

    <div v-if="selector.open" class="modal-backdrop" @click.self="closeSelector">
      <section class="modal">
        <header>
          <h3>配置首页内容</h3>
          <button type="button" aria-label="关闭" @click="closeSelector">x</button>
        </header>

        <div class="filter-bar">
          <label>
            <span>首页分类</span>
            <select v-model="selector.categoryId" @change="handleSelectorCategoryChange">
              <option value="">请选择</option>
              <option v-for="item in categories" :key="item.id" :value="String(item.id)">
                {{ item.categoryName }}
              </option>
            </select>
          </label>
          <label>
            <span>来源模块</span>
            <select v-model="selector.contentType" @change="handleSelectorContentTypeChange">
              <option value="">请选择</option>
              <option v-for="option in availableContentTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label>
            <span>关键词</span>
            <input v-model.trim="selector.keyword" placeholder="按资源标题查询" />
          </label>
          <button class="primary-button" type="button" @click="loadCandidates">查询</button>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>选择</th>
                <th>标题</th>
                <th>封面</th>
                <th>副信息</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="selector.loading">
                <td colspan="5">加载中...</td>
              </tr>
              <tr v-else-if="selector.records.length === 0">
                <td colspan="5">暂无可选资源</td>
              </tr>
              <tr v-for="item in selector.records" :key="item.id">
                <td>
                  <input v-model="selector.selectedIds" type="checkbox" :value="item.id" :disabled="item.available === false" />
                </td>
                <td>{{ item.title || '-' }}</td>
                <td class="table-cell--image">
                  <div v-if="item.coverUrl" class="image-cell">
                    <img class="image-thumb" :src="resolvePublicFileUrl(item.coverUrl)" alt="封面预览" />
                  </div>
                  <span v-else>-</span>
                </td>
                <td>{{ item.subtitle || '-' }}</td>
                <td>{{ item.available === false ? '不可用' : '可选' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="pagination-bar">
          <span>共 {{ selector.total }} 条</span>
          <button type="button" :disabled="selector.page <= 1 || selector.loading" @click="changeCandidatePage(selector.page - 1)">上一页</button>
          <span>第 {{ selector.page }} 页</span>
          <button type="button" :disabled="selector.page * selector.size >= selector.total || selector.loading" @click="changeCandidatePage(selector.page + 1)">下一页</button>
        </footer>

        <div class="modal-actions">
          <button class="ghost-button" type="button" @click="closeSelector">取消</button>
          <button class="primary-button" type="button" :disabled="selector.submitting" @click="saveSelection">
            {{ selector.submitting ? '提交中...' : '加入首页' }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { createHomeContent, deleteHomeContent, homeContentTypeOptions, listHomeCategories, listHomeConfigCandidatesByContentType, listHomeContents } from '../../api/home'
import { resolvePublicFileUrl } from '../../api/http'

const records = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const size = 10
const filteredRecords = ref([])
const message = ref('')
const messageType = ref('info')
const categories = ref([])
const filters = reactive({
  categoryId: '',
})

const contentTypeLabelMap = Object.fromEntries(homeContentTypeOptions.map((item) => [item.value, item.label]))
const categoryMap = computed(() => Object.fromEntries(categories.value.map((item) => [String(item.id), item])))
const availableContentTypeOptions = computed(() => homeContentTypeOptions)

const selector = reactive({
  open: false,
  categoryId: '',
  contentType: '',
  keyword: '',
  loading: false,
  submitting: false,
  page: 1,
  size: 10,
  total: 0,
  records: [],
  selectedIds: [],
})

function showMessage(text, type = 'info') {
  message.value = text
  messageType.value = type
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false })
}

async function loadCategories() {
  try {
    const result = await listHomeCategories({ page: 1, size: 200 })
    categories.value = (result?.data?.records || []).filter((item) => !item.parentId)
  } catch (error) {
    categories.value = []
    showMessage(error.message, 'error')
  }
}

async function loadData() {
  loading.value = true
  if (messageType.value !== 'error') {
    showMessage('')
  }
  try {
    const hasCategoryFilter = Boolean(filters.categoryId)
    const result = await listHomeContents({
      page: hasCategoryFilter ? 1 : page.value,
      size: hasCategoryFilter ? 500 : size,
      ...(filters.categoryId ? { categoryId: Number(filters.categoryId) } : {}),
    })
    const mergedRecords = (result?.data?.records || []).map((item) => ({
      ...item,
      categoryName: item.categoryName || categoryMap.value[String(item.categoryId || '')]?.categoryName || '',
      contentTypeLabel: item.contentTypeLabel || contentTypeLabelMap[item.contentType] || item.contentType || '',
    }))

    if (hasCategoryFilter) {
      filteredRecords.value = mergedRecords.filter((item) => String(item.categoryId || '') === String(filters.categoryId))
      total.value = filteredRecords.value.length
      const startIndex = (page.value - 1) * size
      records.value = filteredRecords.value.slice(startIndex, startIndex + size)
      return
    }

    filteredRecords.value = []
    records.value = mergedRecords
    total.value = Number(result?.data?.total || 0)
  } catch (error) {
    filteredRecords.value = []
    records.value = []
    total.value = 0
    showMessage(error.message, 'error')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  filters.categoryId = ''
  page.value = 1
  loadData()
}

function changePage(nextPage) {
  page.value = nextPage
  loadData()
}

function resetCandidateState() {
  selector.page = 1
  selector.total = 0
  selector.records = []
  selector.selectedIds = []
}

function handleSelectorCategoryChange() {
  resetCandidateState()
}

function handleSelectorContentTypeChange() {
  resetCandidateState()
}

function openConfigModal() {
  selector.open = true
  selector.categoryId = filters.categoryId
  selector.contentType = ''
  selector.keyword = ''
  resetCandidateState()
}

function closeSelector() {
  selector.open = false
  selector.loading = false
  selector.submitting = false
}

async function loadCandidates() {
  if (!selector.categoryId) {
    showMessage('请先选择首页分类', 'error')
    return
  }
  if (!selector.contentType) {
    showMessage('请先选择来源模块', 'error')
    return
  }
  selector.loading = true
  try {
    const result = await listHomeConfigCandidatesByContentType(selector.contentType, {
      keyword: selector.keyword,
      page: selector.page,
      size: selector.size,
    })

    selector.records = (result.records || []).map((item) => ({
      ...item,
      title: item.title || item.targetTitle || '',
      coverUrl: item.coverUrl || item.targetCoverUrl || '',
      subtitle: item.subtitle || item.contentTypeLabel || '',
    }))
    selector.total = Number(result.total || 0)
  } catch (error) {
    selector.records = []
    selector.total = 0
    showMessage(error.message || '候选资源查询失败', 'error')
  } finally {
    selector.loading = false
  }
}

function changeCandidatePage(nextPage) {
  selector.page = nextPage
  loadCandidates()
}

async function saveSelection() {
  if (!selector.categoryId) {
    showMessage('请先选择首页分类', 'error')
    return
  }
  if (!selector.contentType) {
    showMessage('请先选择来源模块', 'error')
    return
  }
  if (!selector.selectedIds.length) {
    showMessage('请至少选择一个资源', 'error')
    return
  }
  selector.submitting = true
  try {
    for (const id of selector.selectedIds) {
      const item = selector.records.find((record) => String(record.id) === String(id))
      if (!item || item.available === false) continue
      await createHomeContent({
        categoryId: Number(selector.categoryId),
        contentType: selector.contentType,
        targetId: Number(id),
        title: item.title || '',
        coverUrl: item.coverUrl || '',
        linkUrl: '',
        sortOrder: 0,
        startAt: null,
        endAt: null,
        status: '1',
      })
    }
    showMessage('首页内容配置成功')
    closeSelector()
    loadData()
  } catch (error) {
    const rawMessage = String(error?.message || '')
    if (/unsupported|不支持/i.test(rawMessage)) {
      showMessage('后端当前部署的首页保存接口仍在按旧规则校验，未完全按“分类仅作为展示位容器、来源模块由 contentType 决定”的方案 B 生效。', 'error')
      return
    }
    showMessage(error.message, 'error')
  } finally {
    selector.submitting = false
  }
}

async function handleDelete(record) {
  if (!window.confirm('确认删除该首页内容吗？')) return
  try {
    await deleteHomeContent(record.id)
    showMessage('删除成功')
    loadData()
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

onMounted(async () => {
  await loadCategories()
  await loadData()
})
</script>
