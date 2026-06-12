<template>
  <section class="resource-page topic-page">
    <div class="resource-header">
      <div>
        <h2>专题管理</h2>
        <p>维护专题标题、封面、状态、简介，并在专题配置中维护课程、书本、学员、资讯、播客、题库、考卷关联。</p>
      </div>
      <div class="header-actions">
        <button v-if="canCreateTopic" class="primary-button" type="button" @click="openCreateTopic">
          新增专题
        </button>
        <button class="ghost-button" type="button" @click="loadTopics">刷新</button>
      </div>
    </div>

    <form class="filter-bar topic-filter-bar" @submit.prevent="handleSearch">
      <label class="topic-filter-bar__field">
        <span>专题搜索</span>
        <input v-model.trim="query.keyword" placeholder="按专题名称搜索" />
      </label>
      <button class="primary-button" type="submit">搜索</button>
      <button class="ghost-button" type="button" @click="resetSearch">重置</button>
    </form>

    <p v-if="message.text" class="page-message" :class="{ 'page-message--error': message.type === 'error' }">
      {{ message.text }}
    </p>

    <div class="table-wrap">
      <table class="data-table topic-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>状态</th>
            <th>标题</th>
            <th>封面</th>
            <th>简介</th>
            <th>专题配置</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7">加载中...</td>
          </tr>
          <tr v-else-if="topics.length === 0">
            <td colspan="7">暂无数据</td>
          </tr>
          <tr v-for="topic in topics" v-else :key="topic.id">
            <td>{{ topic.id }}</td>
            <td>
              <div class="topic-status">
                <span class="topic-status__badge" :class="reviewStatusBadgeClass(topic.reviewStatus)">
                  {{ reviewStatusMap[String(topic.reviewStatus ?? '')] || '未知状态' }}
                </span>
                <span class="topic-status__badge topic-status__badge--publish" :class="publishStatusBadgeClass(topic.publishStatus)">
                  {{ publishStatusMap[String(topic.publishStatus ?? '')] || '未发布' }}
                </span>
              </div>
            </td>
            <td class="topic-table__title">
              <strong>{{ topic.title || '-' }}</strong>
              <span>{{ buildSummaryPreview(topic.learningRequirements || topic.summary) }}</span>
            </td>
            <td>
              <div v-if="resolveTopicCover(topic)" class="image-cell">
                <img class="image-thumb topic-table__cover" :src="resolveTopicCover(topic)" alt="专题封面" />
                <a class="image-link" :href="resolveTopicCover(topic)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td class="topic-table__summary">{{ topic.summary || topic.learningRequirements || '-' }}</td>
            <td class="topic-table__configs">
              <div class="topic-table__config-list">
                <button
                  v-for="config in topicConfigTypes"
                  :key="config.value"
                  class="topic-config-button"
                  type="button"
                  @click="openTopicConfigDialog(topic, config.value)"
                >
                  {{ config.label }}
                </button>
              </div>
            </td>
            <td class="row-actions">
              <button type="button" @click="openTopicDetail(topic)">查看</button>
              <button v-if="canEditTopic" type="button" @click="openEditTopic(topic)">修改</button>
              <button type="button" @click="openAuditLog(topic)">审核日志</button>
              <button v-if="canReviewTopic" type="button" @click="openReviewTopic(topic)">审核</button>
              <button v-if="canDeleteTopic" class="danger-link" type="button" @click="removeTopic(topic)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button type="button" :disabled="topics.length < query.size" @click="changePage(query.page + 1)">下一页</button>
    </footer>

    <div v-if="topicDialog.open" class="modal-backdrop" @click.self="closeTopicDialog">
      <section class="modal topic-modal">
        <header>
          <h3>{{ topicDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeTopicDialog">x</button>
        </header>

        <template v-if="topicDialog.mode === 'detail'">
          <dl class="detail-list">
            <template v-for="item in topicDetailEntries" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>
                <template v-if="item.type === 'image'">
                  <div v-if="item.value" class="detail-media">
                    <img class="detail-media__preview" :src="item.value" :alt="`${item.label}预览`" />
                    <a class="detail-media__link" :href="item.value" target="_blank" rel="noreferrer">{{ item.value }}</a>
                  </div>
                  <span v-else>-</span>
                </template>
                <template v-else>{{ item.value }}</template>
              </dd>
            </template>
          </dl>
        </template>

        <form v-else class="edit-form topic-form" @submit.prevent="submitTopicDialog">
          <template v-if="topicDialog.mode !== 'review'">
            <label>
              <span>标题</span>
              <input v-model.trim="topicDialog.form.title" required maxlength="128" placeholder="请输入专题标题" />
            </label>
            <label>
              <span>排序</span>
              <input v-model="topicDialog.form.sortOrder" type="number" min="0" placeholder="请输入排序值" />
            </label>
            <label class="edit-form__full">
              <span>封面</span>
              <div class="cover-upload-field">
                <div class="cover-upload-field__preview">
                  <img
                    v-if="topicDialog.form.coverUrl"
                    class="image-thumb topic-table__cover"
                    :src="resolvePublicFileUrl(topicDialog.form.coverUrl)"
                    alt="专题封面预览"
                  />
                  <span v-else>未上传封面</span>
                </div>
                <div class="cover-upload-field__actions">
                  <input
                    id="topic-cover-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleCoverChange"
                  />
                  <button
                    class="ghost-button"
                    type="button"
                    :disabled="topicDialog.uploading"
                    @click="triggerCoverInput"
                  >
                    {{ topicDialog.uploading ? '上传中...' : '上传封面' }}
                  </button>
                  <span v-if="topicDialog.form.coverUrl" class="cover-upload-field__path">{{ topicDialog.form.coverUrl }}</span>
                </div>
              </div>
            </label>
            <label>
              <span>发布状态</span>
              <select v-model="topicDialog.form.publishStatus">
                <option v-for="option in publishStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label>
              <span>发布时间</span>
              <input v-model="topicDialog.form.publishedAt" type="datetime-local" />
            </label>
            <label class="edit-form__full">
              <span>简介</span>
              <textarea v-model.trim="topicDialog.form.summary" maxlength="512" placeholder="请输入专题简介" />
            </label>
            <label class="edit-form__full">
              <span>学习要求</span>
              <textarea v-model.trim="topicDialog.form.learningRequirements" placeholder="请输入学习要求" />
            </label>
          </template>

          <template v-else>
            <label>
              <span>审核状态</span>
              <select v-model="topicDialog.form.reviewStatus" required>
                <option v-for="option in topicReviewActionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="edit-form__full">
              <span>审核意见</span>
              <textarea v-model.trim="topicDialog.form.comment" placeholder="请输入审核意见" />
            </label>
          </template>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeTopicDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="topicDialog.submitting">
              {{ topicDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="configDialog.open" class="modal-backdrop" @click.self="closeConfigDialog">
      <section class="modal topic-config-modal">
        <header>
          <h3>{{ configDialog.topic?.title || '专题' }} - {{ currentConfigTypeLabel }}</h3>
          <button type="button" aria-label="关闭" @click="closeConfigDialog">x</button>
        </header>

        <div class="topic-config-modal__body">
          <div class="topic-config-modal__toolbar">
            <form class="filter-bar topic-config-modal__filter" @submit.prevent="handleCandidateSearch">
              <label class="topic-config-modal__field">
                <span>{{ currentConfigSearchLabel }}</span>
                <input v-model.trim="configDialog.candidateQuery.keyword" :placeholder="currentConfigSearchPlaceholder" />
              </label>
              <button class="primary-button" type="submit">搜索</button>
              <button class="ghost-button" type="button" @click="resetCandidateSearch">重置</button>
            </form>
            <div class="topic-config-modal__actions">
              <button
                v-if="currentConfigTypeSupported && canConfigureTopic"
                class="primary-button"
                type="button"
                :disabled="configDialog.saving"
                @click="saveCurrentConfigItems"
              >
                {{ configDialog.saving ? '保存中...' : '保存配置' }}
              </button>
            </div>
          </div>

          <p
            v-if="configDialog.message.text"
            class="page-message"
            :class="{ 'page-message--error': configDialog.message.type === 'error' }"
          >
            {{ configDialog.message.text }}
          </p>

          <div class="topic-config-grid">
            <section class="topic-config-panel">
              <div class="topic-config-panel__header">
                <h4>已关联{{ currentConfigTypeLabel }}</h4>
                <span>{{ currentConfigItems.length }} 项</span>
              </div>
              <div class="table-wrap">
                <table class="data-table topic-config-table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>副标题</th>
                      <th>排序</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="currentConfigItems.length === 0">
                      <td colspan="5">暂无关联项</td>
                    </tr>
                    <tr v-for="item in currentConfigItems" v-else :key="`${item.itemType}-${item.itemId}`">
                      <td>{{ item.itemTitle || '-' }}</td>
                      <td>{{ item.itemSubtitle || '-' }}</td>
                      <td>
                        <input
                          v-if="currentConfigTypeSupported && canConfigureTopic"
                          v-model="item.sortOrderInput"
                          class="topic-config-table__sort-input"
                          type="number"
                          min="0"
                        />
                        <span v-else>{{ item.sortOrder ?? 0 }}</span>
                      </td>
                      <td>{{ item.itemAvailable ? '可用' : '不可用' }}</td>
                      <td class="row-actions">
                        <button
                          v-if="currentConfigTypeSupported && canConfigureTopic"
                          class="danger-link"
                          type="button"
                          @click="removeCurrentConfigItem(item)"
                        >
                          删除
                        </button>
                        <span v-else>-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="topic-config-panel">
              <div class="topic-config-panel__header">
                <h4>可选{{ currentConfigTypeLabel }}</h4>
                <span>{{ configDialog.candidateTotal }} 项</span>
              </div>
              <div class="table-wrap">
                <table class="data-table topic-config-table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>{{ currentConfigCandidateSubtitleLabel }}</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="configDialog.loadingCandidates">
                      <td colspan="4">加载中...</td>
                    </tr>
                    <tr v-else-if="configDialog.candidates.length === 0">
                      <td colspan="4">暂无可选数据</td>
                    </tr>
                    <tr v-for="item in configDialog.candidates" v-else :key="item.id">
                      <td>{{ item.title || '-' }}</td>
                      <td>{{ item.subtitle || '-' }}</td>
                      <td>{{ item.statusLabel || '-' }}</td>
                      <td class="row-actions">
                        <button
                          v-if="currentConfigTypeSupported && canConfigureTopic && !isCurrentItemSelected(item.id)"
                          type="button"
                          @click="addCurrentConfigItem(item)"
                        >
                          添加
                        </button>
                        <span v-else>{{ currentConfigTypeSupported ? '已添加' : '-' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer class="pagination-bar topic-config-modal__pagination">
                <span>共 {{ configDialog.candidateTotal }} 条</span>
                <button
                  type="button"
                  :disabled="configDialog.candidateQuery.page <= 1"
                  @click="changeCandidatePage(configDialog.candidateQuery.page - 1)"
                >
                  上一页
                </button>
                <span>第 {{ configDialog.candidateQuery.page }} 页</span>
                <button
                  type="button"
                  :disabled="configDialog.candidates.length < configDialog.candidateQuery.size"
                  @click="changeCandidatePage(configDialog.candidateQuery.page + 1)"
                >
                  下一页
                </button>
              </footer>
            </section>
          </div>
        </div>
      </section>
    </div>

    <div v-if="auditDialog.open" class="modal-backdrop" @click.self="closeAuditDialog">
      <section class="modal audit-modal">
        <header>
          <h3>{{ auditDialog.topic?.title || '专题' }} - 审核日志</h3>
          <button type="button" aria-label="关闭" @click="closeAuditDialog">x</button>
        </header>

        <div class="topic-config-modal__body">
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

          <footer class="pagination-bar topic-config-modal__pagination">
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
import { computed, onMounted, reactive, ref } from 'vue'
import { getCurrentAdmin } from '../../api/auth'
import { uploadCoverFile } from '../../api/content-files'
import { getJsonData, pageRequest, resolvePublicFileUrl } from '../../api/http'
import { getAdminInfo } from '../../utils/auth'
import { createTopic, deleteTopic, getTopic, listTopics, replaceTopicItems, reviewTopic, updateTopic } from '../../api/topics'

const reviewStatusOptions = [
  { label: '草稿', value: '0' },
  { label: '待审核', value: '1' },
  { label: '已通过', value: '2' },
  { label: '已拒绝', value: '3' },
]

const publishStatusOptions = [
  { label: '未发布', value: '0' },
  { label: '已发布', value: '1' },
]

const topicConfigTypes = [
  { label: '课程配置', value: 'course' },
  { label: '书本配置', value: 'book' },
  { label: '学员配置', value: 'student' },
  { label: '资讯配置', value: 'article' },
  { label: '播客配置', value: 'podcast' },
  { label: '题库配置', value: 'question' },
  { label: '考卷配置', value: 'examPaper' },
]

const supportedTopicConfigTypes = new Set(topicConfigTypes.map((item) => item.value))
const topicReviewActionOptions = reviewStatusOptions.filter((item) => item.value !== '0')
const reviewStatusMap = Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label]))
const publishStatusMap = Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label]))

const topicConfigSourceMap = {
  course: {
    label: '课程',
    api: '/api/v1/admin/learning/courses',
    title: (item) => item.courseName || item.title || '',
    subtitle: (item) => item.lecturerName || item.subtitle || '',
    statusLabel: (item) => reviewStatusMap[String(item.reviewStatus ?? '')] || '-',
    searchLabel: '课程名称',
    searchPlaceholder: '请输入课程名称',
    candidateSubtitleLabel: '讲师/副标题',
  },
  book: {
    label: '书本',
    api: '/api/v1/admin/learning/books',
    title: (item) => item.bookName || item.title || '',
    subtitle: (item) => item.author || item.publisher || '',
    statusLabel: (item) => reviewStatusMap[String(item.reviewStatus ?? '')] || '-',
    searchLabel: '书本名称',
    searchPlaceholder: '请输入书本名称',
    candidateSubtitleLabel: '作者/出版社',
  },
  student: {
    label: '学员',
    api: '/api/v1/admin/students',
    title: (item) => item.realName || '',
    subtitle: (item) => item.mobile || item.organization || '',
    statusLabel: (item) => String(item.status ?? '') === '1' ? '启用' : '未启用',
    searchLabel: '学员手机号',
    searchPlaceholder: '请输入学员手机号',
    candidateSubtitleLabel: '手机号/单位',
  },
  article: {
    label: '资讯',
    api: '/api/v1/admin/content/articles',
    title: (item) => item.title || '',
    subtitle: (item) => item.authorName || item.source || '',
    statusLabel: (item) => reviewStatusMap[String(item.reviewStatus ?? '')] || '-',
    searchLabel: '资讯标题',
    searchPlaceholder: '请输入资讯标题',
    candidateSubtitleLabel: '作者/来源',
  },
  podcast: {
    label: '播客',
    api: '/api/v1/admin/content/podcasts',
    title: (item) => item.title || '',
    subtitle: (item) => item.speakerName || '',
    statusLabel: (item) => reviewStatusMap[String(item.reviewStatus ?? '')] || '-',
    searchLabel: '播客标题',
    searchPlaceholder: '请输入播客标题',
    candidateSubtitleLabel: '讲师',
  },
  question: {
    label: '题库',
    api: '/api/v1/admin/learning/questions',
    title: (item) => item.title || '',
    subtitle: (item) => item.analysis || '',
    statusLabel: (item) => String(item.status ?? '') === '1' ? '启用' : '未启用',
    searchLabel: '题目标题',
    searchPlaceholder: '请输入题目标题',
    candidateSubtitleLabel: '解析',
  },
  examPaper: {
    label: '考卷',
    api: '/api/v1/admin/learning/exam-papers',
    title: (item) => item.paperName || '',
    subtitle: (item) => item.description || '',
    statusLabel: (item) => String(item.status ?? '') === '1' ? '启用' : '未启用',
    searchLabel: '考卷名称',
    searchPlaceholder: '请输入考卷名称',
    candidateSubtitleLabel: '描述',
  },
}

const permissionRules = {
  create: {
    anyOf: ['admin:content:topic:create', 'content:topic:create', 'topic:create'],
    keywordGroups: [
      ['topic', 'create'],
      ['content', 'topic', 'create'],
    ],
  },
  edit: {
    anyOf: ['admin:content:topic:update', 'content:topic:update', 'topic:update', 'topic:edit'],
    keywordGroups: [
      ['topic', 'update'],
      ['topic', 'edit'],
    ],
  },
  delete: {
    anyOf: ['admin:content:topic:delete', 'content:topic:delete', 'topic:delete'],
    keywordGroups: [['topic', 'delete']],
  },
  review: {
    anyOf: ['admin:content:topic:review', 'content:topic:review', 'topic:review'],
    keywordGroups: [
      ['topic', 'review'],
      ['topic', 'audit'],
    ],
  },
  config: {
    anyOf: ['admin:content:topic:items', 'admin:content:topic:update', 'content:topic:items', 'topic:items', 'topic:update'],
    keywordGroups: [
      ['topic', 'item'],
      ['topic', 'config'],
      ['topic', 'update'],
    ],
  },
}

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const topics = ref([])
const total = ref(0)
const loading = ref(false)
const topicItemsCache = reactive({})
const message = reactive({
  text: '',
  type: 'info',
})

const adminPermissions = ref(normalizePermissions(getAdminInfo()?.permissions))

const topicDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createTopicForm(),
  submitting: false,
  uploading: false,
})

const configDialog = reactive({
  open: false,
  topic: null,
  configType: 'course',
  loadingCandidates: false,
  saving: false,
  items: [],
  candidates: [],
  candidateTotal: 0,
  candidateQuery: {
    page: 1,
    size: 10,
    keyword: '',
  },
  message: {
    text: '',
    type: 'info',
  },
})

const auditDialog = reactive({
  open: false,
  topic: null,
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

const canCreateTopic = computed(() => hasPermission(permissionRules.create))
const canEditTopic = computed(() => hasPermission(permissionRules.edit))
const canDeleteTopic = computed(() => hasPermission(permissionRules.delete))
const canReviewTopic = computed(() => hasPermission(permissionRules.review))
const canConfigureTopic = computed(() => hasPermission(permissionRules.config) || canEditTopic.value)

const topicDetailEntries = computed(() => {
  if (!topicDialog.record) return []

  return [
    { label: 'ID', value: formatText(topicDialog.record.id) },
    { label: '标题', value: formatText(topicDialog.record.title) },
    { label: '封面', value: resolveTopicCover(topicDialog.record), type: 'image' },
    { label: '审核状态', value: reviewStatusMap[String(topicDialog.record.reviewStatus ?? '')] || '-' },
    { label: '发布状态', value: publishStatusMap[String(topicDialog.record.publishStatus ?? '')] || '-' },
    { label: '简介', value: formatText(topicDialog.record.summary) },
    { label: '学习要求', value: formatText(topicDialog.record.learningRequirements) },
    { label: '排序', value: formatText(topicDialog.record.sortOrder ?? 0) },
    { label: '发布时间', value: formatDateTime(topicDialog.record.publishedAt) },
  ]
})

const currentConfigMeta = computed(() => topicConfigSourceMap[configDialog.configType] || topicConfigSourceMap.course)
const currentConfigItems = computed(() =>
  configDialog.items.filter((item) => normalizeTopicItemType(item.itemType) === configDialog.configType),
)
const currentConfigTypeLabel = computed(() => currentConfigMeta.value.label)
const currentConfigSearchLabel = computed(() => currentConfigMeta.value.searchLabel)
const currentConfigSearchPlaceholder = computed(() => currentConfigMeta.value.searchPlaceholder)
const currentConfigCandidateSubtitleLabel = computed(() => currentConfigMeta.value.candidateSubtitleLabel)
const currentConfigTypeSupported = computed(() => supportedTopicConfigTypes.has(configDialog.configType))

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

function createTopicForm(record = null) {
  return {
    title: record?.title || '',
    summary: record?.summary || '',
    learningRequirements: record?.learningRequirements || '',
    coverUrl: record?.coverUrl || '',
    sortOrder: String(record?.sortOrder ?? 0),
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

function showConfigMessage(text, type = 'info') {
  configDialog.message.text = text
  configDialog.message.type = type
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

function buildSummaryPreview(summary) {
  const text = String(summary || '').trim()
  if (!text) return '暂无简介'
  return text.length > 48 ? `${text.slice(0, 48)}...` : text
}

function reviewStatusBadgeClass(status) {
  const value = String(status ?? '')
  if (value === '2') return 'topic-status__badge--success'
  if (value === '3') return 'topic-status__badge--danger'
  if (value === '1') return 'topic-status__badge--warning'
  return 'topic-status__badge--draft'
}

function publishStatusBadgeClass(status) {
  return String(status ?? '') === '1'
    ? 'topic-status__badge--published'
    : 'topic-status__badge--unpublished'
}

function resolveTopicCover(topic) {
  return topic?.coverUrl ? resolvePublicFileUrl(topic.coverUrl) : ''
}

function buildTopicPayload(form, source = null) {
  return {
    title: form.title || '',
    summary: form.summary || '',
    learningRequirements: form.learningRequirements || '',
    coverUrl: form.coverUrl || '',
    sortOrder: Number(form.sortOrder || 0),
    reviewStatus: String(source?.reviewStatus ?? '0'),
    publishStatus: String(form.publishStatus || '0'),
    publishedAt: toApiDateTime(form.publishedAt),
  }
}

function normalizeTopicItemType(value) {
  const text = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '')

  if (!text) return ''
  if (text === 'course') return 'course'
  if (text === 'book') return 'book'
  if (text === 'podcast') return 'podcast'
  if (text === 'student') return 'student'
  if (text === 'article') return 'article'
  if (text === 'question') return 'question'
  if (text === 'exampaper' || text === 'paper') return 'examPaper'
  return text
}

function normalizeTopicItem(item) {
  return {
    ...item,
    itemType: normalizeTopicItemType(item?.itemType),
    sortOrderInput: String(item.sortOrder ?? 0),
  }
}

function syncTopicItems(topicId, items) {
  const normalizedItems = Array.isArray(items) ? items.map(normalizeTopicItem) : []
  topicItemsCache[topicId] = normalizedItems

  topics.value = topics.value.map((topic) =>
    Number(topic.id) === Number(topicId)
      ? {
          ...topic,
          items: normalizedItems,
        }
      : topic,
  )

  if (configDialog.topic && Number(configDialog.topic.id) === Number(topicId)) {
    configDialog.topic = {
      ...configDialog.topic,
      items: normalizedItems,
    }
  }

  if (topicDialog.record && Number(topicDialog.record.id) === Number(topicId)) {
    topicDialog.record = {
      ...topicDialog.record,
      items: normalizedItems,
    }
  }
}

function formatCandidateItem(raw, configType) {
  const meta = topicConfigSourceMap[configType]
  return {
    id: raw.id,
    title: meta.title(raw),
    subtitle: meta.subtitle(raw),
    statusLabel: meta.statusLabel(raw),
    raw,
  }
}

async function loadTopics() {
  loading.value = true
  showMessage('')

  try {
    const result = await listTopics({
      page: query.page,
      size: query.size,
      keyword: query.keyword,
    })
    const data = result?.data || {}
    const nextRecords = Array.isArray(data.records) ? data.records : []
    const previousById = new Map(topics.value.map((topic) => [Number(topic.id), topic]))
    topics.value = nextRecords.map((topic) => {
      const previous = previousById.get(Number(topic.id))
      const cachedItems = topicItemsCache[topic.id]
      if (Array.isArray(topic.items)) {
        if (topic.items.length > 0) {
          topicItemsCache[topic.id] = topic.items.map(normalizeTopicItem)
          return {
            ...topic,
            items: topicItemsCache[topic.id],
          }
        }
        if (Array.isArray(cachedItems) && cachedItems.length > 0) {
          return {
            ...topic,
            items: cachedItems,
          }
        }
        return topic
      }
      if (Array.isArray(cachedItems)) {
        return {
          ...topic,
          items: cachedItems,
        }
      }
      if (Array.isArray(previous?.items)) {
        return {
          ...topic,
          items: previous.items,
        }
      }
      return topic
    })
    total.value = Number(data.total || topics.value.length || 0)
  } catch (error) {
    topics.value = []
    total.value = 0
    showMessage(error.message || '专题列表加载失败', 'error')
  } finally {
    loading.value = false
  }
}

async function loadTopicDetail(topicId) {
  const result = await getTopic(topicId)
  const detail = result?.data || {}
  const items = Array.isArray(detail.items) ? detail.items : []

  syncTopicItems(topicId, items)

  return {
    ...detail,
    items,
  }
}

function handleSearch() {
  query.page = 1
  loadTopics()
}

function resetSearch() {
  query.keyword = ''
  query.page = 1
  loadTopics()
}

function changePage(page) {
  query.page = page
  loadTopics()
}

function openCreateTopic() {
  topicDialog.open = true
  topicDialog.mode = 'create'
  topicDialog.title = '新增专题'
  topicDialog.record = null
  topicDialog.form = createTopicForm()
}

function openTopicDetail(topic) {
  const cachedItems = topicItemsCache[topic.id]
  topicDialog.open = true
  topicDialog.mode = 'detail'
  topicDialog.title = '专题详情'
  topicDialog.record = {
    ...topic,
    items: Array.isArray(cachedItems) ? cachedItems : topic.items,
  }
}

function openEditTopic(topic) {
  const cachedItems = topicItemsCache[topic.id]
  topicDialog.open = true
  topicDialog.mode = 'edit'
  topicDialog.title = '修改专题'
  topicDialog.record = {
    ...topic,
    items: Array.isArray(cachedItems) ? cachedItems : topic.items,
  }
  topicDialog.form = createTopicForm(topicDialog.record)
}

function openReviewTopic(topic) {
  const cachedItems = topicItemsCache[topic.id]
  topicDialog.open = true
  topicDialog.mode = 'review'
  topicDialog.title = '专题审核'
  topicDialog.record = {
    ...topic,
    items: Array.isArray(cachedItems) ? cachedItems : topic.items,
  }
  topicDialog.form = createTopicForm(topicDialog.record)
  topicDialog.form.reviewStatus = String(topicDialog.record.reviewStatus ?? '2')
  topicDialog.form.comment = ''
}

function closeTopicDialog() {
  topicDialog.open = false
  topicDialog.mode = 'detail'
  topicDialog.title = ''
  topicDialog.record = null
  topicDialog.form = createTopicForm()
  topicDialog.submitting = false
  topicDialog.uploading = false
}

async function submitTopicDialog() {
  topicDialog.submitting = true

  try {
    if (topicDialog.mode === 'create') {
      await createTopic(buildTopicPayload(topicDialog.form))
    } else if (topicDialog.mode === 'edit') {
      await updateTopic(topicDialog.record.id, buildTopicPayload(topicDialog.form, topicDialog.record))
    } else if (topicDialog.mode === 'review') {
      await reviewTopic(topicDialog.record.id, {
        reviewStatus: String(topicDialog.form.reviewStatus || '2'),
        comment: topicDialog.form.comment || '',
      })
    }

    showMessage('操作成功')
    closeTopicDialog()
    loadTopics()
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    topicDialog.submitting = false
  }
}

function triggerCoverInput() {
  document.getElementById('topic-cover-upload')?.click()
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
    topicDialog.uploading = true
    const result = await uploadCoverFile(file, 'topic-cover')
    topicDialog.form.coverUrl = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message || '封面上传失败', 'error')
  } finally {
    topicDialog.uploading = false
    event.target.value = ''
  }
}

async function removeTopic(topic) {
  if (!window.confirm(`确认删除专题《${topic.title || topic.id}》吗？`)) {
    return
  }

  try {
    await deleteTopic(topic.id)
    showMessage('删除成功')
    loadTopics()
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

function resetConfigState(topic, configType) {
  configDialog.topic = { ...topic }
  configDialog.configType = configType
  const cachedItems = topicItemsCache[topic.id]
  const sourceItems = Array.isArray(cachedItems) ? cachedItems : topic.items
  configDialog.items = Array.isArray(sourceItems) ? sourceItems.map(normalizeTopicItem) : []
  configDialog.candidates = []
  configDialog.candidateTotal = 0
  configDialog.candidateQuery.page = 1
  configDialog.candidateQuery.keyword = ''
  showConfigMessage('')
}

async function loadCandidates() {
  const meta = currentConfigMeta.value
  if (!meta?.api) return

  configDialog.loadingCandidates = true

  try {
    const data = await getJsonData(`${meta.api}?page=${configDialog.candidateQuery.page}&size=${configDialog.candidateQuery.size}${configDialog.candidateQuery.keyword ? `&keyword=${encodeURIComponent(configDialog.candidateQuery.keyword)}` : ''}`)
    const records = Array.isArray(data?.records) ? data.records : []
    configDialog.candidates = records.map((item) => formatCandidateItem(item, configDialog.configType))
    configDialog.candidateTotal = Number(data?.total || configDialog.candidates.length || 0)
  } catch (error) {
    configDialog.candidates = []
    configDialog.candidateTotal = 0
    showConfigMessage(error.message || '可选资源加载失败', 'error')
  } finally {
    configDialog.loadingCandidates = false
  }
}

async function openTopicConfigDialog(topic, configType) {
  configDialog.open = true
  resetConfigState(topic, configType)
  try {
    const detail = await loadTopicDetail(topic.id)
    configDialog.topic = {
      ...configDialog.topic,
      ...detail,
      items: Array.isArray(detail.items) ? detail.items.map(normalizeTopicItem) : [],
    }
    configDialog.items = Array.isArray(detail.items) ? detail.items.map(normalizeTopicItem) : []
  } catch (error) {
    showConfigMessage(error.message || '专题详情加载失败', 'error')
  }
  await loadCandidates()
}

function closeConfigDialog() {
  configDialog.open = false
  configDialog.topic = null
  configDialog.items = []
  configDialog.candidates = []
  configDialog.candidateTotal = 0
  configDialog.candidateQuery.page = 1
  configDialog.candidateQuery.keyword = ''
  configDialog.loadingCandidates = false
  configDialog.saving = false
  showConfigMessage('')
}

function handleCandidateSearch() {
  configDialog.candidateQuery.page = 1
  loadCandidates()
}

function resetCandidateSearch() {
  configDialog.candidateQuery.keyword = ''
  configDialog.candidateQuery.page = 1
  loadCandidates()
}

function changeCandidatePage(page) {
  configDialog.candidateQuery.page = page
  loadCandidates()
}

function isCurrentItemSelected(itemId) {
  return currentConfigItems.value.some((item) => Number(item.itemId) === Number(itemId))
}

function addCurrentConfigItem(candidate) {
  if (!currentConfigTypeSupported.value || !canConfigureTopic.value) return
  if (isCurrentItemSelected(candidate.id)) return

  configDialog.items.push(
    normalizeTopicItem({
      itemType: normalizeTopicItemType(configDialog.configType),
      itemId: candidate.id,
      sortOrder: currentConfigItems.value.length + 1,
      itemAvailable: true,
      itemTitle: candidate.title,
      itemSubtitle: candidate.subtitle,
      itemCoverUrl: '',
      reviewStatus: null,
      publishStatus: null,
    }),
  )
}

function removeCurrentConfigItem(target) {
  if (!canConfigureTopic.value) return
  configDialog.items = configDialog.items.filter(
    (item) =>
      !(
        normalizeTopicItemType(item.itemType) === normalizeTopicItemType(target.itemType) &&
        Number(item.itemId) === Number(target.itemId)
      ),
  )
}

async function saveCurrentConfigItems() {
  if (!configDialog.topic?.id || !currentConfigTypeSupported.value || !canConfigureTopic.value) {
    return
  }

  configDialog.saving = true

  try {
    const payload = configDialog.items
      .filter((item) => supportedTopicConfigTypes.has(normalizeTopicItemType(item.itemType)))
      .map((item, index) => ({
        itemType: normalizeTopicItemType(item.itemType),
        itemId: Number(item.itemId),
        sortOrder: Number(item.sortOrderInput || item.sortOrder || index + 1),
      }))

    const result = await replaceTopicItems(configDialog.topic.id, payload)
    const items = Array.isArray(result?.data) ? result.data : []
    configDialog.items = items.map(normalizeTopicItem)
    syncTopicItems(configDialog.topic.id, items)
    showConfigMessage('专题配置保存成功')
    await loadTopics()
  } catch (error) {
    showConfigMessage(error.message || '专题配置保存失败', 'error')
  } finally {
    configDialog.saving = false
  }
}

async function loadAuditLogs() {
  if (!auditDialog.topic?.id) return

  auditDialog.loading = true
  showAuditMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/system/audit-records', {
      page: auditDialog.page,
      size: auditDialog.size,
      targetType: 'topic',
      targetId: auditDialog.topic.id,
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

function openAuditLog(topic) {
  auditDialog.open = true
  auditDialog.topic = { ...topic }
  auditDialog.page = 1
  auditDialog.records = []
  auditDialog.total = 0
  loadAuditLogs()
}

function closeAuditDialog() {
  auditDialog.open = false
  auditDialog.topic = null
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

async function refreshAdminPermissions() {
  try {
    const result = await getCurrentAdmin()
    adminPermissions.value = normalizePermissions(result?.data?.permissions)
  } catch {}
}

onMounted(() => {
  loadTopics()
  refreshAdminPermissions()
})
</script>

<style scoped>
.topic-filter-bar {
  justify-content: flex-end;
}

.topic-filter-bar__field {
  min-width: min(320px, 100%);
}

.topic-table th,
.topic-table td,
.topic-config-table th,
.topic-config-table td {
  vertical-align: top;
}

.topic-table__title,
.topic-table__summary {
  white-space: normal;
}

.topic-table__configs {
  min-width: 360px;
  max-width: none;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.topic-table__title strong,
.topic-table__title span {
  display: block;
}

.topic-table__title span {
  margin-top: 6px;
  color: #64748b;
  line-height: 1.5;
}

.topic-table__cover {
  width: 88px;
  height: 58px;
  border-radius: 8px;
}

.topic-status {
  display: grid;
  gap: 8px;
}

.topic-status__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
}

.topic-status__badge--draft {
  color: #6b7280;
  background: #f3f4f6;
}

.topic-status__badge--warning {
  color: #b45309;
  background: #fef3c7;
}

.topic-status__badge--success,
.topic-status__badge--published {
  color: #166534;
  background: #dcfce7;
}

.topic-status__badge--danger,
.topic-status__badge--unpublished {
  color: #b91c1c;
  background: #fee2e2;
}

.topic-status__badge--publish {
  min-width: 66px;
}

.topic-table__config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-config-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  color: #ffffff;
  cursor: pointer;
  background: #348fe7;
  border: 0;
  border-radius: 6px;
}

.topic-config-button:hover {
  background: #1f7ed7;
}

.topic-modal {
  width: min(760px, 100%);
}

.topic-config-modal {
  width: min(1320px, 100%);
}

.topic-config-modal__body {
  padding: 18px;
}

.topic-config-modal__toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.topic-config-modal__filter {
  flex: 1;
  justify-content: flex-start;
  padding: 0;
  background: transparent;
  border: 0;
}

.topic-config-modal__field {
  min-width: min(320px, 100%);
}

.topic-config-modal__actions {
  display: flex;
  gap: 12px;
}

.topic-config-modal__hint {
  margin: 0 0 14px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 12px;
}

.topic-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.topic-config-panel {
  min-width: 0;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
}

.topic-config-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.topic-config-panel__header h4 {
  margin: 0;
  font-size: 16px;
}

.topic-config-table__sort-input {
  width: 92px;
}

.topic-config-modal__pagination {
  padding: 14px 16px 16px;
}

@media (max-width: 1100px) {
  .topic-config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .topic-config-modal__toolbar {
    flex-direction: column;
  }

  .topic-config-modal__filter {
    width: 100%;
  }
}
</style>
