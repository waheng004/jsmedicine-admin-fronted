<template>
  <section class="resource-page podcast-page">
    <div class="resource-header">
      <div>
        <h2>播客管理</h2>
        <p>集中维护播客状态、封面、标签、讲师，并在主表内通过弹窗配置对应音频列表。</p>
      </div>
      <div class="header-actions">
        <button v-if="canCreatePodcast" class="primary-button" type="button" @click="openCreatePodcast">
          新增播客
        </button>
        <button class="ghost-button" type="button" @click="loadPodcasts">刷新</button>
      </div>
    </div>

    <form class="filter-bar podcast-filter-bar" @submit.prevent="handleSearch">
      <label class="podcast-filter-bar__field">
        <span>播客搜索</span>
        <input v-model.trim="query.keyword" placeholder="按播客标题搜索" />
      </label>
      <button class="primary-button" type="submit">搜索</button>
      <button class="ghost-button" type="button" @click="resetSearch">重置</button>
    </form>

    <p v-if="message.text" class="page-message" :class="{ 'page-message--error': message.type === 'error' }">
      {{ message.text }}
    </p>

    <div class="table-wrap">
      <table class="data-table podcast-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>状态</th>
            <th>标题</th>
            <th>封面</th>
            <th>标签</th>
            <th>讲师</th>
            <th>排序</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9">加载中...</td>
          </tr>
          <tr v-else-if="podcasts.length === 0">
            <td colspan="9">暂无数据</td>
          </tr>
          <tr v-for="podcast in podcasts" v-else :key="podcast.id">
            <td>{{ podcast.id }}</td>
            <td>
              <div class="podcast-status">
                <span class="podcast-status__badge" :class="reviewStatusBadgeClass(podcast.reviewStatus)">
                  {{ reviewStatusMap[String(podcast.reviewStatus ?? '')] || '未知状态' }}
                </span>
                <span
                  class="podcast-status__badge podcast-status__badge--publish"
                  :class="publishStatusBadgeClass(podcast.publishStatus)"
                >
                  {{ publishStatusMap[String(podcast.publishStatus ?? '')] || '未发布' }}
                </span>
              </div>
            </td>
            <td class="podcast-table__title">
              <strong>{{ podcast.title || '-' }}</strong>
              <span>{{ buildSummaryPreview(podcast.summary) }}</span>
            </td>
            <td>
              <div v-if="resolvePodcastCover(podcast)" class="image-cell">
                <img class="image-thumb podcast-table__cover" :src="resolvePodcastCover(podcast)" alt="播客封面" />
                <a class="image-link" :href="resolvePodcastCover(podcast)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td class="podcast-table__tags-cell">
              <div v-if="normalizeTags(podcast.tags).length" class="podcast-tags">
                <span v-for="tag in normalizeTags(podcast.tags)" :key="tag" class="podcast-tag">{{ tag }}</span>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ podcast.speakerName || '-' }}</td>
            <td>{{ podcast.sortOrder ?? 0 }}</td>
            <td>{{ formatDateTime(podcast.publishedAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="openPodcastDetail(podcast)">查看</button>
              <button v-if="canEditPodcast" type="button" @click="openEditPodcast(podcast)">修改</button>
              <button type="button" @click="openAudioDialog(podcast)">播客音频</button>
              <button type="button" @click="openAuditLog(podcast)">审核日志</button>
              <button v-if="canReviewPodcast" type="button" @click="openReviewPodcast(podcast)">审核</button>
              <button v-if="canDeletePodcast" class="danger-link" type="button" @click="removePodcast(podcast)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button type="button" :disabled="podcasts.length < query.size" @click="changePage(query.page + 1)">下一页</button>
    </footer>

    <div v-if="podcastDialog.open" class="modal-backdrop" @click.self="closePodcastDialog">
      <section class="modal podcast-modal">
        <header>
          <h3>{{ podcastDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closePodcastDialog">x</button>
        </header>

        <template v-if="podcastDialog.mode === 'detail'">
          <dl class="detail-list">
            <template v-for="item in podcastDetailEntries" :key="item.label">
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
                  <div v-if="item.tags.length" class="podcast-tags podcast-tags--detail">
                    <span v-for="tag in item.tags" :key="tag" class="podcast-tag">{{ tag }}</span>
                  </div>
                  <span v-else>-</span>
                </template>
                <template v-else>{{ item.value }}</template>
              </dd>
            </template>
          </dl>
        </template>

        <form v-else class="edit-form podcast-form" @submit.prevent="submitPodcastDialog">
          <template v-if="podcastDialog.mode !== 'review'">
            <label>
              <span>标题</span>
              <input v-model.trim="podcastDialog.form.title" required maxlength="128" placeholder="请输入播客标题" />
            </label>
            <label>
              <span>讲师</span>
              <input v-model.trim="podcastDialog.form.speakerName" maxlength="128" placeholder="请输入讲师名称" />
            </label>
            <label class="edit-form__full">
              <span>封面</span>
              <div class="cover-upload-field">
                <div class="cover-upload-field__preview">
                  <img
                    v-if="podcastDialog.form.coverUrl"
                    class="image-thumb podcast-table__cover"
                    :src="resolvePublicFileUrl(podcastDialog.form.coverUrl)"
                    alt="播客封面预览"
                  />
                  <span v-else>未上传封面</span>
                </div>
                <div class="cover-upload-field__actions">
                  <input
                    id="podcast-cover-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleCoverChange"
                  />
                  <button
                    class="ghost-button"
                    type="button"
                    :disabled="podcastDialog.uploading"
                    @click="triggerCoverInput"
                  >
                    {{ podcastDialog.uploading ? '上传中...' : '上传封面' }}
                  </button>
                  <span v-if="podcastDialog.form.coverUrl" class="cover-upload-field__path">{{ podcastDialog.form.coverUrl }}</span>
                </div>
              </div>
            </label>
            <label>
              <span>标签</span>
              <input v-model.trim="podcastDialog.form.tagsText" maxlength="256" placeholder="多个标签请使用逗号分隔" />
            </label>
            <label>
              <span>排序</span>
              <input v-model="podcastDialog.form.sortOrder" type="number" min="0" placeholder="请输入排序值" />
            </label>
            <label>
              <span>发布状态</span>
              <select v-model="podcastDialog.form.publishStatus">
                <option v-for="option in publishStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label>
              <span>发布时间</span>
              <input v-model="podcastDialog.form.publishedAt" type="datetime-local" />
            </label>
            <label class="edit-form__full">
              <span>摘要</span>
              <textarea v-model.trim="podcastDialog.form.summary" maxlength="512" placeholder="请输入播客摘要" />
            </label>
          </template>

          <template v-else>
            <label>
              <span>审核状态</span>
              <select v-model="podcastDialog.form.reviewStatus" required>
                <option v-for="option in podcastReviewActionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="edit-form__full">
              <span>审核意见</span>
              <textarea v-model.trim="podcastDialog.form.comment" placeholder="请输入审核意见" />
            </label>
          </template>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closePodcastDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="podcastDialog.submitting">
              {{ podcastDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="audioDialog.open" class="modal-backdrop" @click.self="closeAudioDialog">
      <section class="modal podcast-audio-modal">
        <header>
          <h3>{{ audioDialog.podcast?.title || '播客' }} - 音频列表</h3>
          <button type="button" aria-label="关闭" @click="closeAudioDialog">x</button>
        </header>

        <div class="podcast-audio-modal__body">
          <div class="podcast-audio-modal__toolbar">
            <form class="filter-bar podcast-audio-modal__filter" @submit.prevent="handleAudioSearch">
              <label class="podcast-audio-modal__field">
                <span>音频标题</span>
                <input v-model.trim="audioDialog.query.keyword" placeholder="请输入音频标题" />
              </label>
              <button class="primary-button" type="submit">搜索</button>
              <button class="ghost-button" type="button" @click="resetAudioSearch">重置</button>
            </form>
            <button v-if="canManageAudio" class="primary-button" type="button" @click="openCreateAudio">
              新增音频
            </button>
          </div>

          <p
            v-if="audioDialog.message.text"
            class="page-message"
            :class="{ 'page-message--error': audioDialog.message.type === 'error' }"
          >
            {{ audioDialog.message.text }}
          </p>

          <div class="table-wrap">
            <table class="data-table podcast-audio-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>标题</th>
                  <th>排序</th>
                  <th>时长(s)</th>
                  <th>考卷</th>
                  <th>状态</th>
                  <th>音频地址</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="audioDialog.loading">
                  <td colspan="8">加载中...</td>
                </tr>
                <tr v-else-if="audioDialog.records.length === 0">
                  <td colspan="8">暂无音频数据</td>
                </tr>
                <tr v-for="item in audioDialog.records" v-else :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.title || '-' }}</td>
                  <td>{{ item.sortOrder ?? 0 }}</td>
                  <td>{{ item.durationSeconds ?? 0 }}</td>
                  <td>{{ item.paperId || '-' }}</td>
                  <td>
                    <span class="podcast-audio-status" :class="audioStatusBadgeClass(item.status)">
                      {{ audioStatusMap[String(item.status ?? '')] || '未知状态' }}
                    </span>
                  </td>
                  <td class="podcast-audio-table__url">
                    <a v-if="item.audioUrl" :href="resolvePublicFileUrl(item.audioUrl)" target="_blank" rel="noreferrer">
                      {{ item.audioUrl }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td class="row-actions">
                    <button v-if="canManageAudio" type="button" @click="openEditAudio(item)">修改</button>
                    <button v-if="canDeleteAudio" class="danger-link" type="button" @click="removeAudio(item)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pagination-bar podcast-audio-modal__pagination">
            <span>共 {{ audioDialog.total }} 条</span>
            <button type="button" :disabled="audioDialog.query.page <= 1" @click="changeAudioPage(audioDialog.query.page - 1)">
              上一页
            </button>
            <span>第 {{ audioDialog.query.page }} 页</span>
            <button
              type="button"
              :disabled="audioDialog.records.length < audioDialog.query.size"
              @click="changeAudioPage(audioDialog.query.page + 1)"
            >
              下一页
            </button>
            <button class="ghost-button" type="button" @click="closeAudioDialog">关闭</button>
          </footer>
        </div>
      </section>
    </div>

    <div v-if="audioFormDialog.open" class="modal-backdrop" @click.self="closeAudioFormDialog">
      <section class="modal podcast-audio-form-modal">
        <header>
          <h3>{{ audioFormDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeAudioFormDialog">x</button>
        </header>

        <form class="edit-form podcast-audio-form" @submit.prevent="submitAudioFormDialog">
          <label>
            <span>音频标题</span>
            <input v-model.trim="audioFormDialog.form.title" required maxlength="128" placeholder="请输入音频标题" />
          </label>
          <label>
            <span>状态</span>
            <select v-model="audioFormDialog.form.status" required>
              <option v-for="option in audioStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="edit-form__full">
            <span>音频地址</span>
            <input
              v-model.trim="audioFormDialog.form.audioUrl"
              maxlength="512"
              placeholder="粘贴音频地址或上传本地文件"
            />
          </label>
          <label class="edit-form__full">
            <span>本地上传</span>
            <div class="file-upload-field">
              <input
                id="audio-file-upload"
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/*"
                @change="handleAudioFileChange"
              />
              <button
                class="ghost-button"
                type="button"
                :disabled="audioFormDialog.uploading"
                @click="document.getElementById('audio-file-upload')?.click()"
              >
                {{ audioFormDialog.uploading ? '上传中...' : '选择音频文件' }}
              </button>
              <span v-if="audioFormDialog.uploading" class="file-upload-field__status">上传中...</span>
            </div>
          </label>
          <label>
            <span>排序</span>
            <input v-model="audioFormDialog.form.sortOrder" type="number" min="0" placeholder="请输入排序值" />
          </label>
          <label>
            <span>时长(秒)</span>
            <input v-model="audioFormDialog.form.durationSeconds" type="number" min="0" placeholder="请输入时长秒数" />
          </label>
          <label>
            <span>考卷 ID</span>
            <input v-model="audioFormDialog.form.paperId" type="number" min="1" placeholder="选填" />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeAudioFormDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="audioFormDialog.submitting">
              {{ audioFormDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="auditDialog.open" class="modal-backdrop" @click.self="closeAuditDialog">
      <section class="modal audit-modal">
        <header>
          <h3>{{ auditDialog.podcast?.title || '播客' }} - 审核日志</h3>
          <button type="button" aria-label="关闭" @click="closeAuditDialog">x</button>
        </header>

        <div class="podcast-audio-modal__body">
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

          <footer class="pagination-bar podcast-audio-modal__pagination">
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
import { uploadCoverFile, uploadMediaFile } from '../../api/content-files'
import { pageRequest, resolvePublicFileUrl } from '../../api/http'
import {
  createPodcast,
  createPodcastAudio,
  deletePodcast,
  deletePodcastAudio,
  listPodcastAudios,
  listPodcasts,
  reviewPodcast,
  updatePodcast,
  updatePodcastAudio,
} from '../../api/podcasts'
import { getAdminInfo } from '../../utils/auth'

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

const audioStatusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const podcastReviewActionOptions = reviewStatusOptions.filter((item) => item.value !== '0')
const reviewStatusMap = Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label]))
const publishStatusMap = Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label]))
const audioStatusMap = Object.fromEntries(audioStatusOptions.map((item) => [item.value, item.label]))

const permissionRules = {
  create: {
    anyOf: ['admin:content:podcast:create', 'content:podcast:create', 'podcast:create'],
    keywordGroups: [
      ['podcast', 'create'],
      ['content', 'podcast', 'create'],
    ],
  },
  edit: {
    anyOf: ['admin:content:podcast:update', 'content:podcast:update', 'podcast:update', 'podcast:edit'],
    keywordGroups: [
      ['podcast', 'update'],
      ['podcast', 'edit'],
    ],
  },
  delete: {
    anyOf: ['admin:content:podcast:delete', 'content:podcast:delete', 'podcast:delete'],
    keywordGroups: [['podcast', 'delete']],
  },
  review: {
    anyOf: ['admin:content:podcast:review', 'content:podcast:review', 'podcast:review'],
    keywordGroups: [
      ['podcast', 'review'],
      ['podcast', 'audit'],
    ],
  },
  audioManage: {
    anyOf: [
      'admin:content:podcast:audio:create',
      'admin:content:podcast:audio:update',
      'content:podcast:audio:create',
      'content:podcast:audio:update',
      'podcast:audio:create',
      'podcast:audio:update',
    ],
    keywordGroups: [
      ['podcast', 'audio', 'create'],
      ['podcast', 'audio', 'update'],
      ['podcast', 'audio', 'edit'],
    ],
  },
  audioDelete: {
    anyOf: ['admin:content:podcast:audio:delete', 'content:podcast:audio:delete', 'podcast:audio:delete'],
    keywordGroups: [['podcast', 'audio', 'delete']],
  },
}

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const podcasts = ref([])
const total = ref(0)
const loading = ref(false)
const message = reactive({
  text: '',
  type: 'info',
})

const adminPermissions = ref(normalizePermissions(getAdminInfo()?.permissions))

const podcastDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createPodcastForm(),
  submitting: false,
  uploading: false,
})

const audioDialog = reactive({
  open: false,
  podcast: null,
  loading: false,
  records: [],
  total: 0,
  query: {
    page: 1,
    size: 10,
    keyword: '',
  },
  message: {
    text: '',
    type: 'info',
  },
})

const audioFormDialog = reactive({
  open: false,
  mode: 'create',
  title: '',
  record: null,
  form: createAudioForm(),
  submitting: false,
  uploading: false,
})

const auditDialog = reactive({
  open: false,
  podcast: null,
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

const canCreatePodcast = computed(() => hasPermission(permissionRules.create))
const canEditPodcast = computed(() => hasPermission(permissionRules.edit))
const canDeletePodcast = computed(() => hasPermission(permissionRules.delete))
const canReviewPodcast = computed(() => hasPermission(permissionRules.review))
const canManageAudio = computed(() => hasPermission(permissionRules.audioManage) || canEditPodcast.value)
const canDeleteAudio = computed(() => hasPermission(permissionRules.audioDelete) || canDeletePodcast.value)

const podcastDetailEntries = computed(() => {
  if (!podcastDialog.record) return []

  return [
    { label: 'ID', value: formatText(podcastDialog.record.id) },
    { label: '标题', value: formatText(podcastDialog.record.title) },
    { label: '讲师', value: formatText(podcastDialog.record.speakerName) },
    { label: '封面', value: resolvePodcastCover(podcastDialog.record), type: 'image' },
    { label: '审核状态', value: reviewStatusMap[String(podcastDialog.record.reviewStatus ?? '')] || '-' },
    { label: '发布状态', value: publishStatusMap[String(podcastDialog.record.publishStatus ?? '')] || '-' },
    { label: '标签', tags: normalizeTags(podcastDialog.record.tags), type: 'tags' },
    { label: '排序', value: formatText(podcastDialog.record.sortOrder ?? 0) },
    { label: '发布时间', value: formatDateTime(podcastDialog.record.publishedAt) },
    { label: '摘要', value: formatText(podcastDialog.record.summary) },
  ]
})

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

function createPodcastForm(record = null) {
  return {
    title: record?.title || '',
    summary: record?.summary || '',
    coverUrl: record?.coverUrl || '',
    speakerName: record?.speakerName || '',
    tagsText: normalizeTags(record?.tags).join(', '),
    sortOrder: String(record?.sortOrder ?? 0),
    publishStatus: String(record?.publishStatus ?? '0'),
    publishedAt: toDateTimeLocalValue(record?.publishedAt),
    reviewStatus: String(record?.reviewStatus ?? '1'),
    comment: '',
  }
}

function createAudioForm(record = null, podcastId = null) {
  return {
    podcastId: Number(record?.podcastId || podcastId || audioDialog.podcast?.id || 0),
    title: record?.title || '',
    audioUrl: record?.audioUrl || '',
    durationSeconds: String(record?.durationSeconds ?? 0),
    paperId: record?.paperId ? String(record.paperId) : '',
    sortOrder: String(record?.sortOrder ?? 0),
    status: String(record?.status ?? '1'),
  }
}

function readAudioDurationSeconds(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    let settled = false

    function cleanup() {
      audio.removeAttribute('src')
      audio.load()
      URL.revokeObjectURL(objectUrl)
    }

    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      if (settled) return
      settled = true
      const duration = Number(audio.duration)
      cleanup()

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('无法读取音频时长'))
        return
      }

      resolve(Math.max(1, Math.round(duration)))
    }

    audio.onerror = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('音频元数据读取失败'))
    }

    audio.src = objectUrl
  })
}

function showMessage(text, type = 'info') {
  message.text = text
  message.type = type
}

function showAudioMessage(text, type = 'info') {
  audioDialog.message.text = text
  audioDialog.message.type = type
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

function buildSummaryPreview(summary) {
  const text = String(summary || '').trim()
  if (!text) return '暂无摘要'
  return text.length > 48 ? `${text.slice(0, 48)}...` : text
}

function reviewStatusBadgeClass(status) {
  const value = String(status ?? '')
  if (value === '2') return 'podcast-status__badge--success'
  if (value === '3') return 'podcast-status__badge--danger'
  if (value === '1') return 'podcast-status__badge--warning'
  return 'podcast-status__badge--draft'
}

function publishStatusBadgeClass(status) {
  return String(status ?? '') === '1'
    ? 'podcast-status__badge--published'
    : 'podcast-status__badge--unpublished'
}

function audioStatusBadgeClass(status) {
  return String(status ?? '') === '1'
    ? 'podcast-audio-status--enabled'
    : 'podcast-audio-status--disabled'
}

function resolvePodcastCover(podcast) {
  return podcast?.coverUrl ? resolvePublicFileUrl(podcast.coverUrl) : ''
}

function buildPodcastPayload(form, source = null) {
  return {
    title: form.title || '',
    summary: form.summary || '',
    coverUrl: form.coverUrl || '',
    speakerName: form.speakerName || '',
    tags: normalizeTags(form.tagsText).slice(0, 20),
    sortOrder: Number(form.sortOrder || 0),
    reviewStatus: String(source?.reviewStatus ?? '0'),
    publishStatus: String(form.publishStatus || '0'),
    publishedAt: toApiDateTime(form.publishedAt),
  }
}

function buildAudioPayload(form) {
  return {
    podcastId: Number(form.podcastId || audioDialog.podcast?.id || 0),
    title: form.title || '',
    audioUrl: form.audioUrl || '',
    durationSeconds: Number(form.durationSeconds || 0),
    paperId: form.paperId ? Number(form.paperId) : null,
    sortOrder: Number(form.sortOrder || 0),
    status: String(form.status || '1'),
  }
}

async function loadPodcasts() {
  loading.value = true
  showMessage('')

  try {
    const result = await listPodcasts({
      page: query.page,
      size: query.size,
      keyword: query.keyword,
    })
    const data = result?.data || {}
    podcasts.value = Array.isArray(data.records) ? data.records : []
    total.value = Number(data.total || podcasts.value.length || 0)
  } catch (error) {
    podcasts.value = []
    total.value = 0
    showMessage(error.message || '播客列表加载失败', 'error')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadPodcasts()
}

function resetSearch() {
  query.keyword = ''
  query.page = 1
  loadPodcasts()
}

function changePage(page) {
  query.page = page
  loadPodcasts()
}

function openCreatePodcast() {
  podcastDialog.open = true
  podcastDialog.mode = 'create'
  podcastDialog.title = '新增播客'
  podcastDialog.record = null
  podcastDialog.form = createPodcastForm()
}

function openPodcastDetail(podcast) {
  podcastDialog.open = true
  podcastDialog.mode = 'detail'
  podcastDialog.title = '播客详情'
  podcastDialog.record = { ...podcast }
}

function openEditPodcast(podcast) {
  podcastDialog.open = true
  podcastDialog.mode = 'edit'
  podcastDialog.title = '修改播客'
  podcastDialog.record = { ...podcast }
  podcastDialog.form = createPodcastForm(podcast)
}

function openReviewPodcast(podcast) {
  podcastDialog.open = true
  podcastDialog.mode = 'review'
  podcastDialog.title = '播客审核'
  podcastDialog.record = { ...podcast }
  podcastDialog.form = createPodcastForm(podcast)
  podcastDialog.form.reviewStatus = String(podcast.reviewStatus ?? '2')
  podcastDialog.form.comment = ''
}

function closePodcastDialog() {
  podcastDialog.open = false
  podcastDialog.mode = 'detail'
  podcastDialog.title = ''
  podcastDialog.record = null
  podcastDialog.form = createPodcastForm()
  podcastDialog.submitting = false
  podcastDialog.uploading = false
}

async function submitPodcastDialog() {
  podcastDialog.submitting = true

  try {
    if (podcastDialog.mode === 'create') {
      await createPodcast(buildPodcastPayload(podcastDialog.form))
    } else if (podcastDialog.mode === 'edit') {
      await updatePodcast(podcastDialog.record.id, buildPodcastPayload(podcastDialog.form, podcastDialog.record))
    } else if (podcastDialog.mode === 'review') {
      await reviewPodcast(podcastDialog.record.id, {
        reviewStatus: String(podcastDialog.form.reviewStatus || '2'),
        comment: podcastDialog.form.comment || '',
      })
    }

    showMessage('操作成功')
    closePodcastDialog()
    loadPodcasts()
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    podcastDialog.submitting = false
  }
}

function triggerCoverInput() {
  document.getElementById('podcast-cover-upload')?.click()
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
    podcastDialog.uploading = true
    const result = await uploadCoverFile(file, 'podcast-cover')
    podcastDialog.form.coverUrl = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message || '封面上传失败', 'error')
  } finally {
    podcastDialog.uploading = false
    event.target.value = ''
  }
}

async function removePodcast(podcast) {
  if (!window.confirm(`确认删除播客《${podcast.title || podcast.id}》吗？`)) {
    return
  }

  try {
    await deletePodcast(podcast.id)
    showMessage('删除成功')
    loadPodcasts()
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

async function loadAudioRecords() {
  if (!audioDialog.podcast?.id) return

  audioDialog.loading = true
  showAudioMessage('')

  try {
    const result = await listPodcastAudios(audioDialog.podcast.id, {
      page: audioDialog.query.page,
      size: audioDialog.query.size,
      keyword: audioDialog.query.keyword,
    })
    const data = result?.data || {}
    audioDialog.records = Array.isArray(data.records) ? data.records : []
    audioDialog.total = Number(data.total || audioDialog.records.length || 0)
  } catch (error) {
    audioDialog.records = []
    audioDialog.total = 0
    showAudioMessage(error.message || '音频列表加载失败', 'error')
  } finally {
    audioDialog.loading = false
  }
}

function openAudioDialog(podcast) {
  audioDialog.open = true
  audioDialog.podcast = { ...podcast }
  audioDialog.query.page = 1
  audioDialog.query.keyword = ''
  audioDialog.records = []
  audioDialog.total = 0
  showAudioMessage('')
  loadAudioRecords()
}

function closeAudioDialog() {
  audioDialog.open = false
  audioDialog.podcast = null
  audioDialog.loading = false
  audioDialog.records = []
  audioDialog.total = 0
  audioDialog.query.page = 1
  audioDialog.query.keyword = ''
  showAudioMessage('')
}

function handleAudioSearch() {
  audioDialog.query.page = 1
  loadAudioRecords()
}

function resetAudioSearch() {
  audioDialog.query.keyword = ''
  audioDialog.query.page = 1
  loadAudioRecords()
}

function changeAudioPage(page) {
  audioDialog.query.page = page
  loadAudioRecords()
}

function openCreateAudio() {
  audioFormDialog.open = true
  audioFormDialog.mode = 'create'
  audioFormDialog.title = '新增播客音频'
  audioFormDialog.record = null
  audioFormDialog.form = createAudioForm(null, audioDialog.podcast?.id)
}

function openEditAudio(record) {
  audioFormDialog.open = true
  audioFormDialog.mode = 'edit'
  audioFormDialog.title = '修改播客音频'
  audioFormDialog.record = { ...record }
  audioFormDialog.form = createAudioForm(record, audioDialog.podcast?.id)
}

function closeAudioFormDialog() {
  audioFormDialog.open = false
  audioFormDialog.mode = 'create'
  audioFormDialog.title = ''
  audioFormDialog.record = null
  audioFormDialog.form = createAudioForm()
  audioFormDialog.submitting = false
  audioFormDialog.uploading = false
}

async function handleAudioFileChange(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  audioFormDialog.uploading = true
  try {
    const durationSeconds = await readAudioDurationSeconds(file)
    const url = await uploadMediaFile(file, 'podcast-audio')
    audioFormDialog.form.audioUrl = url
    if (!audioFormDialog.form.durationSeconds || Number(audioFormDialog.form.durationSeconds) <= 0) {
      audioFormDialog.form.durationSeconds = String(durationSeconds)
    }
    showAudioMessage('音频上传成功，已自动填写时长')
  } catch (error) {
    showAudioMessage(error.message || '音频上传失败', 'error')
  } finally {
    audioFormDialog.uploading = false
    event.target.value = ''
  }
}

async function submitAudioFormDialog() {
  audioFormDialog.submitting = true

  try {
    if (!audioDialog.podcast?.id) {
      throw new Error('缺少播客上下文，无法保存音频')
    }

    const payload = buildAudioPayload(audioFormDialog.form)

    if (audioFormDialog.mode === 'create') {
      await createPodcastAudio(payload)
    } else {
      await updatePodcastAudio(audioFormDialog.record.id, payload)
    }

    showAudioMessage('音频保存成功')
    closeAudioFormDialog()
    loadAudioRecords()
  } catch (error) {
    showAudioMessage(error.message || '音频保存失败', 'error')
  } finally {
    audioFormDialog.submitting = false
  }
}

async function removeAudio(record) {
  if (!window.confirm(`确认删除音频《${record.title || record.id}》吗？`)) {
    return
  }

  try {
    await deletePodcastAudio(record.id)
    showAudioMessage('删除成功')
    loadAudioRecords()
  } catch (error) {
    showAudioMessage(error.message || '删除失败', 'error')
  }
}

async function loadAuditLogs() {
  if (!auditDialog.podcast?.id) return

  auditDialog.loading = true
  showAuditMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/system/audit-records', {
      page: auditDialog.page,
      size: auditDialog.size,
      targetType: 'podcast',
      targetId: auditDialog.podcast.id,
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

function openAuditLog(podcast) {
  auditDialog.open = true
  auditDialog.podcast = { ...podcast }
  auditDialog.page = 1
  auditDialog.records = []
  auditDialog.total = 0
  loadAuditLogs()
}

function closeAuditDialog() {
  auditDialog.open = false
  auditDialog.podcast = null
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
  loadPodcasts()
  refreshAdminPermissions()
})
</script>

<style scoped>
.podcast-filter-bar {
  justify-content: flex-end;
}

.podcast-filter-bar__field {
  min-width: min(320px, 100%);
}

.podcast-table th,
.podcast-table td,
.podcast-audio-table th,
.podcast-audio-table td {
  vertical-align: top;
}

.podcast-table__title,
.podcast-table__tags-cell,
.podcast-audio-table__url {
  white-space: normal;
}

.podcast-table__title strong,
.podcast-table__title span {
  display: block;
}

.podcast-table__title span {
  margin-top: 6px;
  color: #64748b;
  line-height: 1.5;
}

.podcast-table__cover {
  width: 72px;
  height: 54px;
  border-radius: 8px;
}

.podcast-status {
  display: grid;
  gap: 8px;
}

.podcast-status__badge,
.podcast-audio-status {
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

.podcast-status__badge--draft,
.podcast-audio-status--disabled {
  color: #6b7280;
  background: #f3f4f6;
}

.podcast-status__badge--warning {
  color: #b45309;
  background: #fef3c7;
}

.podcast-status__badge--success,
.podcast-status__badge--published,
.podcast-audio-status--enabled {
  color: #166534;
  background: #dcfce7;
}

.podcast-status__badge--danger,
.podcast-status__badge--unpublished {
  color: #b91c1c;
  background: #fee2e2;
}

.podcast-status__badge--publish {
  min-width: 66px;
}

.podcast-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.podcast-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  color: #0f766e;
  font-size: 12px;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  border-radius: 999px;
}

.podcast-tags--detail {
  padding-right: 12px;
}

.podcast-modal {
  width: min(760px, 100%);
}

.podcast-audio-modal {
  width: min(1080px, 100%);
}

.podcast-audio-form-modal {
  width: min(760px, 100%);
}

.podcast-audio-modal__body {
  padding: 18px;
}

.podcast-audio-modal__toolbar {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.podcast-audio-modal__filter {
  flex: 1;
  justify-content: flex-start;
  padding: 0;
  background: transparent;
  border: 0;
}

.podcast-audio-modal__field {
  min-width: min(320px, 100%);
}

.podcast-audio-modal__pagination {
  padding-right: 0;
  padding-left: 0;
}

.podcast-audio-table__url a {
  color: #0369a1;
  word-break: break-all;
  text-decoration: none;
}

.podcast-audio-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.podcast-audio-form .edit-form__full,
.podcast-form .edit-form__full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .podcast-audio-modal__toolbar {
    flex-direction: column;
  }

  .podcast-audio-modal__filter {
    width: 100%;
  }
}
</style>
