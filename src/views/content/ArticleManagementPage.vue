<template>
  <section class="resource-page article-page">
    <div class="resource-header">
      <div>
        <h2>资讯管理</h2>
        <p>帖子列表统一展示资讯状态、封面、标签和审核记录，新增与编辑使用富文本编辑器完成正文维护。</p>
      </div>
      <div class="header-actions">
        <button v-if="canCreateArticle" class="primary-button" type="button" @click="openCreateArticle">
          新增资讯
        </button>
        <button class="ghost-button" type="button" @click="loadArticles">刷新</button>
      </div>
    </div>

    <form class="filter-bar article-filter-bar" @submit.prevent="handleSearch">
      <label class="article-filter-bar__field">
        <span>资讯搜索</span>
        <input v-model.trim="query.keyword" placeholder="按资讯标题搜索" />
      </label>
      <button class="primary-button" type="submit">搜索</button>
      <button class="ghost-button" type="button" @click="resetSearch">重置</button>
    </form>

    <p v-if="message.text" class="page-message" :class="{ 'page-message--error': message.type === 'error' }">
      {{ message.text }}
    </p>

    <div class="table-wrap">
      <table class="data-table article-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>状态</th>
            <th>标题</th>
            <th>封面</th>
            <th>来源</th>
            <th>标签</th>
            <th>浏览量</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9">加载中...</td>
          </tr>
          <tr v-else-if="articles.length === 0">
            <td colspan="9">暂无数据</td>
          </tr>
          <tr v-for="article in articles" v-else :key="article.id">
            <td>{{ article.id }}</td>
            <td>
              <div class="article-status">
                <span class="article-status__badge" :class="reviewStatusBadgeClass(article.reviewStatus)">
                  {{ reviewStatusMap[String(article.reviewStatus ?? '')] || '未知状态' }}
                </span>
                <span class="article-status__badge article-status__badge--publish" :class="publishStatusBadgeClass(article.publishStatus)">
                  {{ publishStatusMap[String(article.publishStatus ?? '')] || '未发布' }}
                </span>
              </div>
            </td>
            <td class="article-table__title">
              <strong>{{ article.title || '-' }}</strong>
              <span>{{ buildSummaryPreview(article.summary, article.content) }}</span>
            </td>
            <td>
              <div v-if="resolveArticleCover(article)" class="image-cell">
                <img class="image-thumb article-table__cover" :src="resolveArticleCover(article)" alt="资讯封面" />
                <a class="image-link" :href="resolveArticleCover(article)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ article.source || article.authorName || '-' }}</td>
            <td class="article-table__tags-cell">
              <div v-if="normalizeTags(article.tags).length" class="article-tags">
                <span v-for="tag in normalizeTags(article.tags)" :key="tag" class="article-tag">{{ tag }}</span>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ article.viewCount ?? 0 }}</td>
            <td>{{ formatDateTime(article.publishedAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="openArticleDetail(article)">查看</button>
              <button v-if="canEditArticle" type="button" @click="openEditArticle(article)">修改</button>
              <button type="button" @click="openAuditLog(article)">审核日志</button>
              <button v-if="canReviewArticle" type="button" @click="openReviewArticle(article)">审核</button>
              <button v-if="canDeleteArticle" class="danger-link" type="button" @click="removeArticle(article)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button type="button" :disabled="articles.length < query.size" @click="changePage(query.page + 1)">下一页</button>
    </footer>

    <div v-if="articleDialog.open" class="modal-backdrop" @click.self="closeArticleDialog">
      <section class="modal article-modal">
        <header>
          <h3>{{ articleDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeArticleDialog">x</button>
        </header>

        <template v-if="articleDialog.mode === 'detail'">
          <dl class="detail-list">
            <template v-for="item in articleDetailEntries" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>
                <template v-if="item.type === 'image'">
                  <div v-if="item.value" class="detail-media">
                    <img class="detail-media__preview" :src="item.value" :alt="`${item.label}预览`" />
                    <a class="detail-media__link" :href="item.value" target="_blank" rel="noreferrer">{{ item.value }}</a>
                  </div>
                  <span v-else>-</span>
                </template>
                <template v-else-if="item.type === 'tags'">
                  <div v-if="item.tags.length" class="article-tags article-tags--detail">
                    <span v-for="tag in item.tags" :key="tag" class="article-tag">{{ tag }}</span>
                  </div>
                  <span v-else>-</span>
                </template>
                <template v-else>{{ item.value }}</template>
              </dd>
            </template>
          </dl>

          <section class="article-detail-preview">
            <div class="article-detail-preview__header">
              <h4>正文预览</h4>
              <span>以只读沙箱方式展示富文本内容</span>
            </div>
            <iframe
              v-if="articleDialog.record?.content"
              class="article-detail-preview__frame"
              sandbox=""
              :srcdoc="articlePreviewDoc"
              title="资讯正文预览"
            />
            <p v-else class="article-detail-preview__empty">暂无正文内容</p>
          </section>
        </template>

        <form v-else class="edit-form article-form" @submit.prevent="submitArticleDialog">
          <template v-if="articleDialog.mode !== 'review'">
            <label>
              <span>标题</span>
              <input v-model.trim="articleDialog.form.title" required maxlength="128" placeholder="请输入资讯标题" />
            </label>
            <label>
              <span>作者</span>
              <input v-model.trim="articleDialog.form.authorName" maxlength="64" placeholder="请输入作者名称" />
            </label>
            <label class="edit-form__full">
              <span>封面</span>
              <div class="cover-upload-field">
                <div class="cover-upload-field__preview">
                  <img
                    v-if="articleDialog.form.coverUrl"
                    class="image-thumb article-table__cover"
                    :src="resolvePublicFileUrl(articleDialog.form.coverUrl)"
                    alt="资讯封面预览"
                  />
                  <span v-else>未上传封面</span>
                </div>
                <div class="cover-upload-field__actions">
                  <input
                    id="article-cover-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleCoverChange"
                  />
                  <button
                    class="ghost-button"
                    type="button"
                    :disabled="articleDialog.uploading"
                    @click="triggerCoverInput"
                  >
                    {{ articleDialog.uploading ? '上传中...' : '上传封面' }}
                  </button>
                  <span v-if="articleDialog.form.coverUrl" class="cover-upload-field__path">{{ articleDialog.form.coverUrl }}</span>
                </div>
              </div>
            </label>
            <label>
              <span>新闻来源</span>
              <input v-model.trim="articleDialog.form.source" maxlength="128" placeholder="请输入新闻来源" />
            </label>
            <label>
              <span>标签</span>
              <input v-model.trim="articleDialog.form.tagsText" maxlength="256" placeholder="多个标签请使用逗号分隔" />
            </label>
            <label>
              <span>发布状态</span>
              <select v-model="articleDialog.form.publishStatus">
                <option v-for="option in publishStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label>
              <span>发布时间</span>
              <input v-model="articleDialog.form.publishedAt" type="datetime-local" />
            </label>
            <label class="edit-form__full">
              <span>摘要</span>
              <textarea v-model.trim="articleDialog.form.summary" maxlength="512" placeholder="请输入资讯摘要" />
            </label>
            <label class="edit-form__full article-form__editor">
              <span>正文</span>
              <div class="article-editor">
                <Toolbar
                  class="article-editor__toolbar"
                  :editor="editorRef"
                  :default-config="toolbarConfig"
                  mode="default"
                />
                <Editor
                  v-model="articleDialog.form.content"
                  class="article-editor__body"
                  :default-config="editorConfig"
                  mode="default"
                  @onCreated="handleEditorCreated"
                />
              </div>
            </label>
          </template>

          <template v-else>
            <label>
              <span>审核状态</span>
              <select v-model="articleDialog.form.reviewStatus" required>
                <option v-for="option in articleReviewActionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="edit-form__full">
              <span>审核意见</span>
              <textarea v-model.trim="articleDialog.form.comment" placeholder="请输入审核意见" />
            </label>
          </template>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeArticleDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="articleDialog.submitting">
              {{ articleDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="auditDialog.open" class="modal-backdrop" @click.self="closeAuditDialog">
      <section class="modal audit-modal">
        <header>
          <h3>{{ auditDialog.article?.title || '资讯' }} - 审核日志</h3>
          <button type="button" aria-label="关闭" @click="closeAuditDialog">x</button>
        </header>

        <div class="video-modal__body">
          <p
            v-if="auditDialog.message.text"
            class="page-message"
            :class="{ 'page-message--error': auditDialog.message.type === 'error' }"
          >
            {{ auditDialog.message.text }}
          </p>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>审核前状态</th>
                  <th>审核后状态</th>
                  <th>审核意见</th>
                  <th>审核人</th>
                  <th>审核时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="auditDialog.loading">
                  <td colspan="6">加载中...</td>
                </tr>
                <tr v-else-if="auditDialog.records.length === 0">
                  <td colspan="6">暂无审核日志</td>
                </tr>
                <tr v-for="record in auditDialog.records" v-else :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>{{ record.beforeStatusLabel || '-' }}</td>
                  <td>{{ record.afterStatusLabel || '-' }}</td>
                  <td class="audit-modal__comment">{{ record.auditComment || '-' }}</td>
                  <td>{{ record.auditorName || record.auditorUsername || '-' }}</td>
                  <td>{{ formatDateTime(record.auditedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pagination-bar video-modal__pagination">
            <span>共 {{ auditDialog.total }} 条</span>
            <button type="button" :disabled="auditDialog.page <= 1" @click="changeAuditPage(auditDialog.page - 1)">
              上一页
            </button>
            <span>第 {{ auditDialog.page }} 页</span>
            <button
              type="button"
              :disabled="auditDialog.records.length < auditDialog.size"
              @click="changeAuditPage(auditDialog.page + 1)"
            >
              下一页
            </button>
            <button class="primary-button" type="button" @click="closeAuditDialog">确定</button>
          </footer>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'

import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getCurrentAdmin } from '../../api/auth'
import {
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  reviewArticle,
  updateArticle,
} from '../../api/articles'
import { uploadCoverFile } from '../../api/content-files'
import { pageRequest, resolvePublicFileUrl } from '../../api/http'
import { getAdminInfo } from '../../utils/auth'

const reviewStatusOptions = [
  { label: '草稿', value: '0' },
  { label: '待审核', value: '1' },
  { label: '已通过', value: '2' },
  { label: '已拒绝', value: '3' },
]

const articleReviewActionOptions = reviewStatusOptions.filter((item) => item.value !== '0')

const publishStatusOptions = [
  { label: '未发布', value: '0' },
  { label: '已发布', value: '1' },
]

const reviewStatusMap = Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label]))
const publishStatusMap = Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label]))

const permissionRules = {
  create: {
    anyOf: ['admin:content:article:create', 'content:article:create', 'article:create'],
    keywordGroups: [
      ['article', 'create'],
      ['content', 'article', 'create'],
    ],
  },
  edit: {
    anyOf: ['admin:content:article:update', 'content:article:update', 'article:update', 'article:edit'],
    keywordGroups: [
      ['article', 'update'],
      ['article', 'edit'],
    ],
  },
  delete: {
    anyOf: ['admin:content:article:delete', 'content:article:delete', 'article:delete'],
    keywordGroups: [
      ['article', 'delete'],
    ],
  },
  review: {
    anyOf: ['admin:content:article:review', 'content:article:review', 'article:review'],
    keywordGroups: [
      ['article', 'review'],
      ['article', 'audit'],
    ],
  },
}

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const articles = ref([])
const total = ref(0)
const loading = ref(false)
const message = reactive({
  text: '',
  type: 'info',
})

const adminPermissions = ref(normalizePermissions(getAdminInfo()?.permissions))
const editorRef = shallowRef(null)

const toolbarConfig = {
  excludeKeys: ['uploadVideo', 'group-video'],
}

const editorConfig = {
  placeholder: '请输入资讯正文',
  autoFocus: false,
}

const articleDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createArticleForm(),
  submitting: false,
  uploading: false,
})

const auditDialog = reactive({
  open: false,
  article: null,
  loading: false,
  records: [],
  total: 0,
  page: 1,
  size: 10,
  message: {
    text: '',
    type: 'info',
  },
})

const canCreateArticle = computed(() => hasPermission(permissionRules.create))
const canEditArticle = computed(() => hasPermission(permissionRules.edit))
const canDeleteArticle = computed(() => hasPermission(permissionRules.delete))
const canReviewArticle = computed(() => hasPermission(permissionRules.review))

const articleDetailEntries = computed(() => {
  if (!articleDialog.record) return []

  return [
    { label: 'ID', value: formatText(articleDialog.record.id) },
    { label: '标题', value: formatText(articleDialog.record.title) },
    { label: '作者', value: formatText(articleDialog.record.authorName) },
    { label: '新闻来源', value: formatText(articleDialog.record.source) },
    { label: '封面', value: resolveArticleCover(articleDialog.record), type: 'image' },
    { label: '审核状态', value: reviewStatusMap[String(articleDialog.record.reviewStatus ?? '')] || '-' },
    { label: '发布状态', value: publishStatusMap[String(articleDialog.record.publishStatus ?? '')] || '-' },
    { label: '标签', tags: normalizeTags(articleDialog.record.tags), type: 'tags' },
    { label: '浏览量', value: formatText(articleDialog.record.viewCount ?? 0) },
    { label: '发布时间', value: formatDateTime(articleDialog.record.publishedAt) },
    { label: '摘要', value: formatText(articleDialog.record.summary) },
  ]
})

const articlePreviewDoc = computed(() => buildPreviewDoc(articleDialog.record?.content || ''))

function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) return []
  return permissions.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
}

function hasPermission(rule) {
  const permissions = adminPermissions.value
  if (!permissions.length) return true
  if (
    permissions.includes('*') ||
    permissions.includes('all') ||
    permissions.includes('*:*') ||
    permissions.includes('admin:*') ||
    permissions.includes('super:*')
  ) {
    return true
  }

  const anyOf = (rule?.anyOf || []).map((item) => item.toLowerCase())
  if (anyOf.some((item) => permissions.includes(item))) {
    return true
  }

  return (rule?.keywordGroups || []).some((keywords) =>
    permissions.some((permission) => keywords.every((keyword) => permission.includes(keyword.toLowerCase()))),
  )
}

function createArticleForm(record = null) {
  return {
    title: record?.title || '',
    summary: record?.summary || '',
    coverUrl: record?.coverUrl || '',
    content: record?.content || '',
    authorName: record?.authorName || '',
    source: record?.source || '',
    tagsText: normalizeTags(record?.tags).join(', '),
    publishStatus: String(record?.publishStatus ?? '0'),
    publishedAt: toDateTimeLocalValue(record?.publishedAt),
    reviewStatus: String(record?.reviewStatus ?? '1'),
    comment: '',
  }
}

function showMessage(text, type = 'info') {
  message.text = text
  message.type = type
}

function showAuditMessage(text, type = 'info') {
  auditDialog.message.text = text
  auditDialog.message.type = type
}

function formatText(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function toDateTimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toApiDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((item) => String(item || '').trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSummaryPreview(summary, content) {
  const text = String(summary || '').trim() || stripHtml(content)
  if (!text) return '暂无摘要'
  return text.length > 48 ? `${text.slice(0, 48)}...` : text
}

function reviewStatusBadgeClass(status) {
  const value = String(status ?? '')
  if (value === '2') return 'article-status__badge--success'
  if (value === '3') return 'article-status__badge--danger'
  if (value === '1') return 'article-status__badge--warning'
  return 'article-status__badge--draft'
}

function publishStatusBadgeClass(status) {
  return String(status ?? '') === '1'
    ? 'article-status__badge--published'
    : 'article-status__badge--unpublished'
}

function resolveArticleCover(article) {
  return article?.coverUrl ? resolvePublicFileUrl(article.coverUrl) : ''
}

function buildPreviewDoc(content) {
  const html = String(content || '').trim()
  return `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            margin: 0;
            padding: 20px;
            color: #1f2937;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", Arial, sans-serif;
            line-height: 1.7;
            word-break: break-word;
            background: #ffffff;
          }
          img, video, iframe, table {
            max-width: 100%;
          }
          table {
            border-collapse: collapse;
          }
          table td, table th {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
          }
          blockquote {
            margin: 0;
            padding-left: 12px;
            color: #475569;
            border-left: 4px solid #cbd5e1;
          }
          pre {
            padding: 12px;
            overflow: auto;
            background: #f8fafc;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>${html || '<p>暂无正文内容</p>'}</body>
    </html>
  `
}

function buildArticlePayload(form, source = null) {
  return {
    title: form.title || '',
    summary: form.summary || '',
    coverUrl: form.coverUrl || '',
    content: form.content || '',
    authorName: form.authorName || '',
    source: form.source || '',
    tags: normalizeTags(form.tagsText).slice(0, 20),
    reviewStatus: String(source?.reviewStatus ?? '0'),
    publishStatus: String(form.publishStatus || '0'),
    publishedAt: toApiDateTime(form.publishedAt),
  }
}

async function loadArticles() {
  loading.value = true
  showMessage('')

  try {
    const result = await listArticles({
      page: query.page,
      size: query.size,
      keyword: query.keyword,
    })
    const data = result?.data || {}
    articles.value = Array.isArray(data.records) ? data.records : []
    total.value = Number(data.total || articles.value.length || 0)
  } catch (error) {
    articles.value = []
    total.value = 0
    showMessage(error.message || '资讯列表加载失败', 'error')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadArticles()
}

function resetSearch() {
  query.keyword = ''
  query.page = 1
  loadArticles()
}

function changePage(page) {
  query.page = page
  loadArticles()
}

function openCreateArticle() {
  articleDialog.open = true
  articleDialog.mode = 'create'
  articleDialog.title = '新增资讯'
  articleDialog.record = null
  articleDialog.form = createArticleForm()
}

async function openArticleDetail(article) {
  try {
    const result = await getArticle(article.id)
    articleDialog.record = result?.data ? { ...article, ...result.data } : { ...article }
  } catch {
    articleDialog.record = { ...article }
  }

  articleDialog.open = true
  articleDialog.mode = 'detail'
  articleDialog.title = '资讯详情'
}

async function openEditArticle(article) {
  const source = { ...article }

  articleDialog.open = true
  articleDialog.mode = 'edit'
  articleDialog.title = '修改资讯'
  articleDialog.record = source
  articleDialog.form = createArticleForm(source)
}

function openReviewArticle(article) {
  articleDialog.open = true
  articleDialog.mode = 'review'
  articleDialog.title = '资讯审核'
  articleDialog.record = { ...article }
  articleDialog.form = createArticleForm(article)
  articleDialog.form.reviewStatus = String(article.reviewStatus ?? '2')
  articleDialog.form.comment = ''
}

function closeArticleDialog() {
  articleDialog.open = false
  articleDialog.mode = 'detail'
  articleDialog.title = ''
  articleDialog.record = null
  articleDialog.form = createArticleForm()
  articleDialog.submitting = false
  articleDialog.uploading = false
}

async function submitArticleDialog() {
  articleDialog.submitting = true

  try {
    if (articleDialog.mode === 'create') {
      await createArticle(buildArticlePayload(articleDialog.form))
    } else if (articleDialog.mode === 'edit') {
      await updateArticle(articleDialog.record.id, buildArticlePayload(articleDialog.form, articleDialog.record))
    } else if (articleDialog.mode === 'review') {
      await reviewArticle(articleDialog.record.id, {
        reviewStatus: String(articleDialog.form.reviewStatus || '2'),
        comment: articleDialog.form.comment || '',
      })
    }

    showMessage('操作成功')
    closeArticleDialog()
    loadArticles()
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    articleDialog.submitting = false
  }
}

function triggerCoverInput() {
  document.getElementById('article-cover-upload')?.click()
}

async function handleCoverChange(event) {
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
    articleDialog.uploading = true
    const result = await uploadCoverFile(file, 'article-cover')
    articleDialog.form.coverUrl = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message || '封面上传失败', 'error')
  } finally {
    articleDialog.uploading = false
    event.target.value = ''
  }
}

async function removeArticle(article) {
  if (!window.confirm(`确认删除资讯《${article.title || article.id}》吗？`)) {
    return
  }

  try {
    await deleteArticle(article.id)
    showMessage('删除成功')
    loadArticles()
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

async function loadAuditLogs() {
  if (!auditDialog.article?.id) return

  auditDialog.loading = true
  showAuditMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/system/audit-records', {
      page: auditDialog.page,
      size: auditDialog.size,
      targetType: 'article',
      targetId: auditDialog.article.id,
    })
    const data = result?.data || {}
    auditDialog.records = Array.isArray(data.records) ? data.records : []
    auditDialog.total = Number(data.total || auditDialog.records.length || 0)
  } catch (error) {
    auditDialog.records = []
    auditDialog.total = 0
    showAuditMessage(error.message || '审核日志加载失败', 'error')
  } finally {
    auditDialog.loading = false
  }
}

function openAuditLog(article) {
  auditDialog.open = true
  auditDialog.article = article
  auditDialog.page = 1
  auditDialog.records = []
  auditDialog.total = 0
  loadAuditLogs()
}

function closeAuditDialog() {
  auditDialog.open = false
  auditDialog.article = null
  auditDialog.loading = false
  auditDialog.records = []
  auditDialog.total = 0
  auditDialog.page = 1
  showAuditMessage('')
}

function changeAuditPage(page) {
  auditDialog.page = page
  loadAuditLogs()
}

function handleEditorCreated(editor) {
  editorRef.value = editor
}

async function refreshAdminPermissions() {
  try {
    const result = await getCurrentAdmin()
    adminPermissions.value = normalizePermissions(result?.data?.permissions)
  } catch {}
}

onMounted(() => {
  loadArticles()
  refreshAdminPermissions()
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped>
.article-filter-bar {
  justify-content: flex-end;
}

.article-filter-bar__field {
  min-width: min(320px, 100%);
}

.article-table th,
.article-table td {
  vertical-align: top;
}

.article-table__title,
.article-table__tags-cell {
  white-space: normal;
}

.article-table__title strong,
.article-table__title span {
  display: block;
}

.article-table__title span {
  margin-top: 6px;
  color: #64748b;
  line-height: 1.5;
}

.article-table__cover {
  width: 72px;
  height: 54px;
  border-radius: 8px;
}

.article-status {
  display: grid;
  gap: 8px;
}

.article-status__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
}

.article-status__badge--draft {
  color: #8a5a00;
  background: #fff7ed;
}

.article-status__badge--warning {
  color: #92400e;
  background: #fef3c7;
}

.article-status__badge--success,
.article-status__badge--published {
  color: #166534;
  background: #dcfce7;
}

.article-status__badge--danger,
.article-status__badge--unpublished {
  color: #b91c1c;
  background: #fee2e2;
}

.article-status__badge--publish {
  min-width: 64px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.article-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  background: #dbeafe;
  border-radius: 999px;
}

.article-tags--detail {
  padding: 4px 0;
}

.article-modal {
  width: min(1120px, calc(100vw - 48px));
}

.video-modal__body {
  padding: 18px;
}

.video-modal__pagination {
  margin-top: 16px;
  padding-right: 0;
  padding-left: 0;
  border: 0;
}

.audit-modal {
  width: min(1080px, 100%);
}

.audit-modal__comment {
  white-space: normal;
  overflow-wrap: anywhere;
}

.article-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.article-form__editor {
  grid-column: 1 / -1;
}

.article-editor {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.article-editor__toolbar {
  border-bottom: 1px solid #e5e7eb;
}

.article-editor__body {
  height: 360px;
  overflow-y: hidden;
}

.article-detail-preview {
  padding: 0 18px 18px;
}

.article-detail-preview__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 0 10px;
}

.article-detail-preview__header h4,
.article-detail-preview__header span {
  margin: 0;
}

.article-detail-preview__header span {
  color: #64748b;
  font-size: 12px;
}

.article-detail-preview__frame {
  width: 100%;
  min-height: 320px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
}

.article-detail-preview__empty {
  margin: 0;
  padding: 18px;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
}

:deep(.w-e-text-container [data-slate-editor]) {
  min-height: 300px;
}

@media (max-width: 900px) {
  .article-filter-bar {
    justify-content: stretch;
  }

  .article-filter-bar__field {
    min-width: 100%;
  }

  .article-modal {
    width: min(100%, calc(100vw - 24px));
  }

  .article-form {
    grid-template-columns: 1fr;
  }
}
</style>
