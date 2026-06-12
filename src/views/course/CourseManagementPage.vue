<template>
  <section class="resource-page course-page">
    <div class="resource-header">
      <div>
        <h2>课程管理</h2>
        <p>课程封面、讲师信息、审核和课程视频统一收口在当前页面，视频内直接配置考卷，不再拆分独立菜单。</p>
      </div>
      <div class="header-actions">
        <button v-if="canCreateCourse" class="primary-button" type="button" @click="openCreateCourse">
          新增课程
        </button>
        <button class="ghost-button" type="button" @click="loadCourses">刷新</button>
      </div>
    </div>

    <form class="filter-bar" @submit.prevent="handleSearch">
      <label>
        <span>课程搜索</span>
        <input v-model.trim="query.keyword" placeholder="按课程名称搜索" />
      </label>
      <button class="primary-button" type="submit">查询</button>
      <button class="ghost-button" type="button" @click="resetSearch">重置</button>
    </form>

    <p v-if="message.text" class="page-message" :class="{ 'page-message--error': message.type === 'error' }">
      {{ message.text }}
    </p>

    <div class="table-wrap">
      <table class="data-table course-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>课程名称</th>
            <th>封面</th>
            <th>讲师</th>
            <th>讲师头像</th>
            <th>审核状态</th>
            <th>发布状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9">加载中...</td>
          </tr>
          <tr v-else-if="courses.length === 0">
            <td colspan="9">暂无数据</td>
          </tr>
          <tr v-for="course in courses" v-else :key="course.id">
            <td>{{ course.id }}</td>
            <td class="course-table__name">
              <strong>{{ course.courseName || '-' }}</strong>
              <span v-if="course.subtitle">{{ course.subtitle }}</span>
            </td>
            <td>
              <div v-if="resolveCourseCover(course)" class="image-cell">
                <img class="image-thumb image-thumb--course" :src="resolveCourseCover(course)" alt="课程封面" />
                <a class="image-link" :href="resolveCourseCover(course)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ course.lecturerName || '-' }}</td>
            <td>
              <div v-if="resolveLecturerAvatar(course)" class="image-cell">
                <img class="image-thumb image-thumb--avatar" :src="resolveLecturerAvatar(course)" alt="讲师头像" />
                <a class="image-link" :href="resolveLecturerAvatar(course)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ reviewStatusMap[String(course.reviewStatus ?? '')] || '-' }}</td>
            <td>{{ publishStatusMap[String(course.publishStatus ?? '')] || '-' }}</td>
            <td>{{ course.sortOrder ?? 0 }}</td>
            <td class="row-actions">
              <button type="button" @click="openCourseDetail(course)">显示详情</button>
              <button v-if="canEditCourse" type="button" @click="openEditCourse(course)">修改</button>
              <button v-if="canManageVideos" type="button" @click="openVideoManager(course)">课程视频</button>
              <button type="button" @click="openAuditLog(course)">审核日志</button>
              <button v-if="canReviewCourse" type="button" @click="openReviewCourse(course)">审核操作</button>
              <button v-if="canDeleteCourse" class="danger-link" type="button" @click="deleteCourse(course)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ total }} 条</span>
      <button type="button" :disabled="query.page <= 1" @click="changePage(query.page - 1)">上一页</button>
      <span>第 {{ query.page }} 页</span>
      <button type="button" :disabled="courses.length < query.size" @click="changePage(query.page + 1)">下一页</button>
    </footer>

    <div v-if="courseDialog.open" class="modal-backdrop" @click.self="closeCourseDialog">
      <section class="modal course-modal">
        <header>
          <h3>{{ courseDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeCourseDialog">x</button>
        </header>

        <dl v-if="courseDialog.mode === 'detail'" class="detail-list">
          <template v-for="item in courseDetailEntries" :key="item.label">
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

        <form v-else class="edit-form" @submit.prevent="submitCourseDialog">
          <label v-if="courseDialog.mode !== 'review'">
            <span>课程名称</span>
            <input v-model.trim="courseDialog.form.courseName" required maxlength="128" />
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>副标题</span>
            <input v-model.trim="courseDialog.form.subtitle" maxlength="255" />
          </label>
          <label v-if="courseDialog.mode !== 'review'" class="edit-form__full">
            <span>课程封面</span>
            <div class="cover-upload-field">
              <div class="cover-upload-field__preview">
                <img
                  v-if="courseDialog.form.coverUrl"
                  class="image-thumb image-thumb--course"
                  :src="resolvePublicFileUrl(courseDialog.form.coverUrl)"
                  alt="课程封面预览"
                />
                <span v-else>未上传封面</span>
              </div>
              <div class="cover-upload-field__actions">
                <input
                  id="course-cover-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleCourseCoverChange"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="courseDialog.uploading"
                  @click="triggerCourseCoverInput"
                >
                  {{ courseDialog.uploading ? '上传中...' : '上传封面' }}
                </button>
                <span v-if="courseDialog.form.coverUrl" class="cover-upload-field__path">{{ courseDialog.form.coverUrl }}</span>
              </div>
            </div>
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>讲师</span>
            <input v-model.trim="courseDialog.form.lecturerName" maxlength="64" />
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>讲师头像</span>
            <div class="cover-upload-field">
              <div class="cover-upload-field__preview">
                <img
                  v-if="courseDialog.form.lecturerAvatarUrl"
                  class="image-thumb image-thumb--avatar"
                  :src="resolvePublicFileUrl(courseDialog.form.lecturerAvatarUrl)"
                  alt="讲师头像预览"
                />
                <span v-else>未上传头像</span>
              </div>
              <div class="cover-upload-field__actions">
                <input
                  id="lecturer-avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleLecturerAvatarChange"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="courseDialog.uploading"
                  @click="triggerLecturerAvatarInput"
                >
                  {{ courseDialog.uploading ? '上传中...' : '上传头像' }}
                </button>
                <span v-if="courseDialog.form.lecturerAvatarUrl" class="cover-upload-field__path">{{ courseDialog.form.lecturerAvatarUrl }}</span>
              </div>
            </div>
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>发布状态</span>
            <select v-model="courseDialog.form.publishStatus">
              <option v-for="option in publishStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>排序</span>
            <input v-model="courseDialog.form.sortOrder" type="number" min="0" />
          </label>
          <label v-if="courseDialog.mode !== 'review'">
            <span>发布时间</span>
            <input v-model="courseDialog.form.publishedAt" type="datetime-local" />
          </label>
          <label v-if="courseDialog.mode === 'review'">
            <span>审核状态</span>
            <select v-model="courseDialog.form.reviewStatus" required>
              <option v-for="option in reviewStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="courseDialog.mode === 'review'" class="edit-form__full">
            <span>审核意见</span>
            <textarea v-model.trim="courseDialog.form.comment" placeholder="请输入审核意见" />
          </label>
          <label v-if="courseDialog.mode !== 'review'" class="edit-form__full">
            <span>简介</span>
            <textarea v-model.trim="courseDialog.form.introduction" placeholder="请输入课程简介" />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeCourseDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="courseDialog.submitting">
              {{ courseDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="videoDialog.open" class="modal-backdrop" @click.self="closeVideoDialog">
      <section class="modal video-modal">
        <header>
          <h3>课程视频列表</h3>
          <button type="button" aria-label="关闭" @click="closeVideoDialog">x</button>
        </header>

        <div class="video-modal__body">
          <div class="video-modal__toolbar">
            <p>{{ videoDialog.course?.courseName || '当前课程' }} 的视频和考卷配置都在这里完成。</p>
            <button v-if="canManageVideos" class="primary-button" type="button" @click="openCreateVideo">
              新增视频
            </button>
          </div>

          <p
            v-if="videoDialog.message.text"
            class="page-message"
            :class="{ 'page-message--error': videoDialog.message.type === 'error' }"
          >
            {{ videoDialog.message.text }}
          </p>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>排序</th>
                  <th>标题</th>
                  <th>创建时间</th>
                  <th>时长(秒)</th>
                  <th>考卷</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="videoDialog.loading">
                  <td colspan="8">加载中...</td>
                </tr>
                <tr v-else-if="videoDialog.records.length === 0">
                  <td colspan="8">暂无视频数据</td>
                </tr>
                <tr v-for="video in videoDialog.records" v-else :key="video.id">
                  <td>{{ video.id }}</td>
                  <td>{{ video.sortOrder ?? 0 }}</td>
                  <td>{{ video.title || '-' }}</td>
                  <td>{{ formatDateTime(video.createdAt) }}</td>
                  <td>{{ video.durationSeconds ?? 0 }}</td>
                  <td>{{ resolvePaperName(video.paperId) }}</td>
                  <td>{{ commonStatusMap[String(video.status ?? '')] || '-' }}</td>
                  <td class="row-actions">
                    <button type="button" @click="openVideoDetail(video)">显示详情</button>
                    <button v-if="canManageVideos" type="button" @click="openEditVideo(video)">修改</button>
                    <button v-if="canManageVideos" type="button" @click="openConfigureVideoPaper(video)">考卷配置</button>
                    <button v-if="canManageVideos" class="danger-link" type="button" @click="deleteVideo(video)">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pagination-bar video-modal__pagination">
            <span>共 {{ videoDialog.total }} 条</span>
            <button type="button" :disabled="videoDialog.page <= 1" @click="changeVideoPage(videoDialog.page - 1)">
              上一页
            </button>
            <span>第 {{ videoDialog.page }} 页</span>
            <button
              type="button"
              :disabled="videoDialog.records.length < videoDialog.size"
              @click="changeVideoPage(videoDialog.page + 1)"
            >
              下一页
            </button>
            <button class="primary-button" type="button" @click="closeVideoDialog">确定</button>
          </footer>
        </div>
      </section>
    </div>

    <div v-if="auditDialog.open" class="modal-backdrop" @click.self="closeAuditDialog">
      <section class="modal audit-modal">
        <header>
          <h3>{{ auditDialog.course?.courseName || '课程' }} - 审核日志</h3>
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

    <div v-if="videoEntryDialog.open" class="modal-backdrop modal-backdrop--stacked" @click.self="closeVideoEntryDialog">
      <section class="modal video-entry-modal">
        <header>
          <h3>{{ videoEntryDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeVideoEntryDialog">x</button>
        </header>

        <dl v-if="videoEntryDialog.mode === 'detail'" class="detail-list">
          <template v-for="item in videoDetailEntries" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </template>
        </dl>

        <form v-else class="edit-form" @submit.prevent="submitVideoEntryDialog">
          <template v-if="videoEntryDialog.mode !== 'paper'">
            <label>
              <span>视频标题</span>
              <input v-model.trim="videoEntryDialog.form.title" required maxlength="128" />
            </label>
            <label>
              <span>视频地址</span>
              <input v-model.trim="videoEntryDialog.form.videoUrl" maxlength="512" placeholder="粘贴视频地址或上传本地文件" />
            </label>
            <label>
              <span>本地上传</span>
              <div class="file-upload-field">
                <input
                  id="video-file-upload"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  @change="handleVideoFileChange"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="videoEntryDialog.uploading"
                  @click="document.getElementById('video-file-upload')?.click()"
                >
                  {{ videoEntryDialog.uploading ? '上传中...' : '选择视频文件' }}
                </button>
                <span v-if="videoEntryDialog.uploading" class="file-upload-field__status">上传中...</span>
              </div>
            </label>
            <label>
              <span>时长(秒)</span>
              <input v-model="videoEntryDialog.form.durationSeconds" type="number" min="0" />
            </label>
            <label>
              <span>排序</span>
              <input v-model="videoEntryDialog.form.sortOrder" type="number" min="0" />
            </label>
            <label>
              <span>状态</span>
              <select v-model="videoEntryDialog.form.status" required>
                <option v-for="option in commonStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </template>

          <label :class="{ 'edit-form__full': videoEntryDialog.mode === 'paper' }">
            <span>关联考卷</span>
            <select v-if="examPaperOptions.length > 0" v-model="videoEntryDialog.form.paperId">
              <option value="">不配置</option>
              <option v-for="option in examPaperOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <input v-else v-model="videoEntryDialog.form.paperId" type="number" min="1" placeholder="请输入考卷 ID" />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeVideoEntryDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="videoEntryDialog.submitting">
              {{ videoEntryDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getCurrentAdmin } from '../../api/auth'
import { uploadCoverFile, uploadMediaFile } from '../../api/content-files'
import {
  createCourse,
  createCourseVideo,
  deleteCourse as deleteCourseApi,
  deleteCourseVideo as deleteCourseVideoApi,
  getCourse,
  listCourses,
  listCourseVideos,
  reviewCourse,
  updateCourse,
  updateCourseVideo,
} from '../../api/courses'
import { pageRequest, resolvePublicFileUrl } from '../../api/http'
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

const commonStatusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const reviewStatusMap = Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label]))
const publishStatusMap = Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label]))
const commonStatusMap = Object.fromEntries(commonStatusOptions.map((item) => [item.value, item.label]))

const permissionRules = {
  create: {
    anyOf: ['admin:learning:course:create', 'learning:course:create', 'course:create'],
    keywordGroups: [
      ['course', 'create'],
      ['learning', 'course', 'create'],
    ],
  },
  edit: {
    anyOf: ['admin:learning:course:update', 'learning:course:update', 'course:update', 'course:edit'],
    keywordGroups: [
      ['course', 'update'],
      ['course', 'edit'],
    ],
  },
  delete: {
    anyOf: ['admin:learning:course:delete', 'learning:course:delete', 'course:delete'],
    keywordGroups: [
      ['course', 'delete'],
    ],
  },
  review: {
    anyOf: ['admin:learning:course:review', 'learning:course:review', 'course:review'],
    keywordGroups: [
      ['course', 'review'],
      ['course', 'audit'],
    ],
  },
  manageVideos: {
    anyOf: [
      'admin:learning:course:video',
      'admin:learning:course:update',
      'learning:course:video',
      'course:video',
      'course:update',
    ],
    keywordGroups: [
      ['course', 'video'],
      ['course', 'update'],
    ],
  },
}

const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const courses = ref([])
const total = ref(0)
const loading = ref(false)
const message = reactive({
  text: '',
  type: 'info',
})

const adminPermissions = ref(normalizePermissions(getAdminInfo()?.permissions))

const courseDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createCourseForm(),
  submitting: false,
  uploading: false,
})

const videoDialog = reactive({
  open: false,
  course: null,
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

const auditDialog = reactive({
  open: false,
  course: null,
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

const videoEntryDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createVideoForm(),
  submitting: false,
  uploading: false,
})

const examPaperOptions = ref([])

const canCreateCourse = computed(() => hasPermission(permissionRules.create))
const canEditCourse = computed(() => hasPermission(permissionRules.edit))
const canDeleteCourse = computed(() => hasPermission(permissionRules.delete))
const canReviewCourse = computed(() => hasPermission(permissionRules.review))
const canManageVideos = computed(() => hasPermission(permissionRules.manageVideos) || canEditCourse.value)

const courseDetailEntries = computed(() => {
  if (!courseDialog.record) return []

  return [
    { label: 'ID', value: formatText(courseDialog.record.id) },
    { label: '课程名称', value: formatText(courseDialog.record.courseName) },
    { label: '副标题', value: formatText(courseDialog.record.subtitle) },
    { label: '封面', value: resolveCourseCover(courseDialog.record), type: 'image' },
    { label: '讲师', value: formatText(courseDialog.record.lecturerName) },
    { label: '讲师头像', value: resolveLecturerAvatar(courseDialog.record), type: 'image' },
    { label: '简介', value: formatText(courseDialog.record.introduction) },
    { label: '审核状态', value: reviewStatusMap[String(courseDialog.record.reviewStatus ?? '')] || '-' },
    { label: '发布状态', value: publishStatusMap[String(courseDialog.record.publishStatus ?? '')] || '-' },
    { label: '发布时间', value: formatDateTime(courseDialog.record.publishedAt) },
    { label: '排序', value: formatText(courseDialog.record.sortOrder ?? 0) },
  ]
})

const videoDetailEntries = computed(() => {
  if (!videoEntryDialog.record) return []

  return [
    { label: 'ID', value: formatText(videoEntryDialog.record.id) },
    { label: '所属课程 ID', value: formatText(videoEntryDialog.record.courseId) },
    { label: '标题', value: formatText(videoEntryDialog.record.title) },
    { label: '创建时间', value: formatDateTime(videoEntryDialog.record.createdAt) },
    { label: '视频地址', value: formatText(videoEntryDialog.record.videoUrl) },
    { label: '时长(秒)', value: formatText(videoEntryDialog.record.durationSeconds ?? 0) },
    { label: '关联考卷', value: resolvePaperName(videoEntryDialog.record.paperId) },
    { label: '状态', value: commonStatusMap[String(videoEntryDialog.record.status ?? '')] || '-' },
    { label: '排序', value: formatText(videoEntryDialog.record.sortOrder ?? 0) },
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

function showMessage(text, type = 'info') {
  message.text = text
  message.type = type
}

function showVideoMessage(text, type = 'info') {
  videoDialog.message.text = text
  videoDialog.message.type = type
}

function showAuditMessage(text, type = 'info') {
  auditDialog.message.text = text
  auditDialog.message.type = type
}

function createCourseForm(record = null) {
  return {
    courseName: record?.courseName || '',
    subtitle: record?.subtitle || '',
    coverUrl: record?.coverUrl || '',
    lecturerName: record?.lecturerName || '',
    lecturerAvatarUrl: record?.lecturerAvatarUrl || '',
    introduction: record?.introduction || '',
    sortOrder: record?.sortOrder ?? 0,
    publishStatus: String(record?.publishStatus ?? '0'),
    publishedAt: toDateTimeLocalValue(record?.publishedAt),
    reviewStatus: String(record?.reviewStatus ?? '2'),
    comment: '',
  }
}

function createVideoForm(record = null) {
  return {
    title: record?.title || '',
    videoUrl: record?.videoUrl || '',
    durationSeconds: record?.durationSeconds ?? 0,
    paperId: record?.paperId === null || record?.paperId === undefined ? '' : String(record.paperId),
    sortOrder: record?.sortOrder ?? 0,
    status: String(record?.status ?? '1'),
  }
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

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

function resolveCourseCover(course) {
  return course?.coverUrl ? resolvePublicFileUrl(course.coverUrl) : ''
}

function resolveLecturerAvatar(course) {
  if (!course?.lecturerAvatarUrl) return ''
  const url = course.lecturerAvatarUrl
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  return resolvePublicFileUrl(url)
}

function resolvePaperName(paperId) {
  if (paperId === null || paperId === undefined || paperId === '') return '未配置'
  const option = examPaperOptions.value.find((item) => String(item.value) === String(paperId))
  return option?.label || `考卷 #${paperId}`
}

function readVideoDurationSeconds(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Math.round(Number(video.duration) || 0)
      URL.revokeObjectURL(objectUrl)
      resolve(duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('无法读取视频时长，请确认文件格式是否正确'))
    }

    video.src = objectUrl
  })
}

async function loadCourses() {
  loading.value = true
  showMessage('')

  try {
    const result = await listCourses({
      page: query.page,
      size: query.size,
      keyword: query.keyword,
    })

    const data = result?.data || {}
    courses.value = Array.isArray(data.records) ? data.records : []
    total.value = Number(data.total || courses.value.length || 0)
  } catch (error) {
    courses.value = []
    total.value = 0
    showMessage(error.message || '课程加载失败', 'error')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadCourses()
}

function resetSearch() {
  query.keyword = ''
  query.page = 1
  loadCourses()
}

function changePage(page) {
  query.page = page
  loadCourses()
}

async function refreshAdminPermissions() {
  try {
    const result = await getCurrentAdmin()
    adminPermissions.value = normalizePermissions(result?.data?.permissions)
  } catch {}
}

async function fetchCourseDetail(course) {
  const result = await getCourse(course.id)
  return result?.data ? { ...course, ...result.data } : { ...course }
}

function openCreateCourse() {
  courseDialog.open = true
  courseDialog.mode = 'create'
  courseDialog.title = '新增课程'
  courseDialog.record = null
  courseDialog.form = createCourseForm()
}

async function openCourseDetail(course) {
  try {
    courseDialog.record = await fetchCourseDetail(course)
  } catch {
    courseDialog.record = { ...course }
  }

  courseDialog.open = true
  courseDialog.mode = 'detail'
  courseDialog.title = '课程详情'
}

async function openEditCourse(course) {
  try {
    courseDialog.record = await fetchCourseDetail(course)
  } catch (error) {
    showMessage(error.message || '课程详情加载失败', 'error')
    return
  }

  courseDialog.open = true
  courseDialog.mode = 'edit'
  courseDialog.title = '修改课程'
  courseDialog.form = createCourseForm(courseDialog.record)
}

async function openReviewCourse(course) {
  try {
    courseDialog.record = await fetchCourseDetail(course)
  } catch (error) {
    showMessage(error.message || '课程详情加载失败', 'error')
    return
  }

  courseDialog.open = true
  courseDialog.mode = 'review'
  courseDialog.title = '课程审核'
  courseDialog.form = createCourseForm(courseDialog.record)
}

function closeCourseDialog() {
  courseDialog.open = false
  courseDialog.record = null
  courseDialog.form = createCourseForm()
  courseDialog.submitting = false
  courseDialog.uploading = false
}

function buildCoursePayload(form, source = null) {
  return {
    courseName: form.courseName || '',
    subtitle: form.subtitle || '',
    coverUrl: form.coverUrl || '',
    lecturerName: form.lecturerName || '',
    lecturerAvatarUrl: form.lecturerAvatarUrl || source?.lecturerAvatarUrl || '',
    introduction: form.introduction || '',
    paperId: optionalNumber(source?.paperId),
    sortOrder: optionalNumber(form.sortOrder) ?? 0,
    reviewStatus: String(source?.reviewStatus ?? '0'),
    publishStatus: String(form.publishStatus ?? source?.publishStatus ?? '0'),
    publishedAt: toApiDateTime(form.publishedAt),
  }
}

async function submitCourseDialog() {
  courseDialog.submitting = true

  try {
    if (courseDialog.mode === 'create') {
      await createCourse(buildCoursePayload(courseDialog.form))
    } else if (courseDialog.mode === 'edit') {
      await updateCourse(
        courseDialog.record.id,
        buildCoursePayload(courseDialog.form, courseDialog.record),
      )
    } else if (courseDialog.mode === 'review') {
      await reviewCourse(courseDialog.record.id, {
        reviewStatus: String(courseDialog.form.reviewStatus || '2'),
        comment: courseDialog.form.comment || '',
      })
    }

    showMessage('操作成功')
    closeCourseDialog()
    loadCourses()
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    courseDialog.submitting = false
  }
}

function triggerCourseCoverInput() {
  document.getElementById('course-cover-upload')?.click()
}

async function handleCourseCoverChange(event) {
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
    courseDialog.uploading = true
    const result = await uploadCoverFile(file, 'course-cover')
    courseDialog.form.coverUrl = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message || '封面上传失败', 'error')
  } finally {
    courseDialog.uploading = false
    event.target.value = ''
  }
}

function triggerLecturerAvatarInput() {
  document.getElementById('lecturer-avatar-upload')?.click()
}

async function handleLecturerAvatarChange(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showMessage('仅支持 jpg、png、webp 格式头像', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage('头像大小不能超过 5MB', 'error')
    event.target.value = ''
    return
  }

  try {
    courseDialog.uploading = true
    const result = await uploadCoverFile(file, 'course-cover')
    courseDialog.form.lecturerAvatarUrl = result.coverUrl || ''
    showMessage('讲师头像上传成功')
  } catch (error) {
    showMessage(error.message || '头像上传失败', 'error')
  } finally {
    courseDialog.uploading = false
    event.target.value = ''
  }
}

async function deleteCourse(course) {
  if (!window.confirm(`确认删除课程《${course.courseName || course.id}》吗？`)) {
    return
  }

  try {
    await deleteCourseApi(course.id)
    showMessage('删除成功')
    loadCourses()
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

async function loadExamPaperOptions() {
  try {
    const result = await pageRequest('/api/v1/admin/learning/exam-papers', {
      page: 1,
      size: 100,
    })
    const records = Array.isArray(result?.data?.records) ? result.data.records : []
    examPaperOptions.value = records.map((item) => ({
      label: `${item.paperName || '未命名考卷'} (#${item.id})`,
      value: String(item.id),
    }))
  } catch {}
}

async function loadVideos() {
  if (!videoDialog.course?.id) return

  videoDialog.loading = true
  showVideoMessage('')

  try {
    const result = await listCourseVideos(videoDialog.course.id, {
      page: videoDialog.page,
      size: videoDialog.size,
    })
    const data = result?.data || {}
    videoDialog.records = Array.isArray(data.records) ? data.records : []
    videoDialog.total = Number(data.total || videoDialog.records.length || 0)
  } catch (error) {
    videoDialog.records = []
    videoDialog.total = 0
    showVideoMessage(error.message || '课程视频加载失败', 'error')
  } finally {
    videoDialog.loading = false
  }
}

async function loadAuditLogs() {
  if (!auditDialog.course?.id) return

  auditDialog.loading = true
  showAuditMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/system/audit-records', {
      page: auditDialog.page,
      size: auditDialog.size,
      targetType: 'course',
      targetId: auditDialog.course.id,
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

async function openVideoManager(course) {
  videoDialog.open = true
  videoDialog.course = course
  videoDialog.page = 1
  videoDialog.message.text = ''
  await Promise.all([loadVideos(), loadExamPaperOptions()])
}

function closeVideoDialog() {
  videoDialog.open = false
  videoDialog.course = null
  videoDialog.loading = false
  videoDialog.records = []
  videoDialog.total = 0
  videoDialog.page = 1
  videoDialog.message.text = ''
  closeVideoEntryDialog()
}

async function openAuditLog(course) {
  auditDialog.open = true
  auditDialog.course = course
  auditDialog.page = 1
  auditDialog.message.text = ''
  await loadAuditLogs()
}

function closeAuditDialog() {
  auditDialog.open = false
  auditDialog.course = null
  auditDialog.loading = false
  auditDialog.records = []
  auditDialog.total = 0
  auditDialog.page = 1
  auditDialog.message.text = ''
}

function changeVideoPage(page) {
  videoDialog.page = page
  loadVideos()
}

function changeAuditPage(page) {
  auditDialog.page = page
  loadAuditLogs()
}

function openCreateVideo() {
  videoEntryDialog.open = true
  videoEntryDialog.mode = 'create'
  videoEntryDialog.title = '新增课程视频'
  videoEntryDialog.record = null
  videoEntryDialog.form = createVideoForm()
}

function openVideoDetail(video) {
  videoEntryDialog.open = true
  videoEntryDialog.mode = 'detail'
  videoEntryDialog.title = '课程视频详情'
  videoEntryDialog.record = { ...video }
}

function openEditVideo(video) {
  videoEntryDialog.open = true
  videoEntryDialog.mode = 'edit'
  videoEntryDialog.title = '修改课程视频'
  videoEntryDialog.record = { ...video }
  videoEntryDialog.form = createVideoForm(video)
}

function openConfigureVideoPaper(video) {
  videoEntryDialog.open = true
  videoEntryDialog.mode = 'paper'
  videoEntryDialog.title = '配置视频考卷'
  videoEntryDialog.record = { ...video }
  videoEntryDialog.form = createVideoForm(video)
}

function closeVideoEntryDialog() {
  videoEntryDialog.open = false
  videoEntryDialog.mode = 'detail'
  videoEntryDialog.title = ''
  videoEntryDialog.record = null
  videoEntryDialog.form = createVideoForm()
  videoEntryDialog.submitting = false
  videoEntryDialog.uploading = false
}

async function handleVideoFileChange(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  videoEntryDialog.uploading = true
  try {
    const durationSeconds = await readVideoDurationSeconds(file)
    const url = await uploadMediaFile(file, 'course-video')
    videoEntryDialog.form.videoUrl = url
    if (!videoEntryDialog.form.durationSeconds || Number(videoEntryDialog.form.durationSeconds) <= 0) {
      videoEntryDialog.form.durationSeconds = String(durationSeconds)
    }
    showVideoMessage('视频上传成功，已自动填写时长')
  } catch (error) {
    showVideoMessage(error.message || '视频上传失败', 'error')
  } finally {
    videoEntryDialog.uploading = false
    event.target.value = ''
  }
}

function buildVideoPayload(form, source = null) {
  return {
    courseId: optionalNumber(source?.courseId ?? videoDialog.course?.id),
    title: form.title || source?.title || '',
    videoUrl: form.videoUrl || source?.videoUrl || '',
    durationSeconds: optionalNumber(form.durationSeconds) ?? optionalNumber(source?.durationSeconds) ?? 0,
    paperId: optionalNumber(form.paperId),
    sortOrder: optionalNumber(form.sortOrder) ?? optionalNumber(source?.sortOrder) ?? 0,
    status: String(form.status || source?.status || '1'),
  }
}

async function submitVideoEntryDialog() {
  videoEntryDialog.submitting = true

  try {
    if (videoEntryDialog.mode === 'create') {
      await createCourseVideo(buildVideoPayload(videoEntryDialog.form))
    } else {
      await updateCourseVideo(
        videoEntryDialog.record.id,
        buildVideoPayload(videoEntryDialog.form, videoEntryDialog.record),
      )
    }

    showVideoMessage('操作成功')
    closeVideoEntryDialog()
    loadVideos()
  } catch (error) {
    showVideoMessage(error.message || '操作失败', 'error')
  } finally {
    videoEntryDialog.submitting = false
  }
}

async function deleteVideo(video) {
  if (!window.confirm(`确认删除视频《${video.title || video.id}》吗？`)) {
    return
  }

  try {
    await deleteCourseVideoApi(video.id)
    showVideoMessage('删除成功')
    loadVideos()
  } catch (error) {
    showVideoMessage(error.message || '删除失败', 'error')
  }
}

onMounted(() => {
  refreshAdminPermissions()
  loadCourses()
})
</script>

<style scoped>
.course-page__name {
  min-width: 180px;
  white-space: normal;
}

.course-page__name strong,
.course-page__name span {
  display: block;
}

.course-page__name span {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.course-table__name {
  white-space: normal;
}

.course-table__muted {
  color: #94a3b8;
  font-size: 12px;
}

.image-thumb--course {
  width: 64px;
  height: 44px;
  border-radius: 8px;
}

.image-thumb--avatar {
  border-radius: 999px;
}

.course-modal {
  width: min(820px, 100%);
}

.video-modal {
  width: min(1180px, 100%);
}

.video-modal__body {
  padding: 18px;
}

.video-modal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.video-modal__toolbar p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.video-modal__pagination {
  margin-top: 16px;
  padding-right: 0;
  padding-left: 0;
  border: 0;
}

.video-modal__link-cell {
  max-width: 260px;
  white-space: normal;
  overflow-wrap: anywhere;
}

.video-entry-modal {
  width: min(760px, 100%);
}

.audit-modal {
  width: min(1080px, 100%);
}

.audit-modal__comment {
  white-space: normal;
  overflow-wrap: anywhere;
}

.modal-backdrop--stacked {
  z-index: 30;
  background: rgba(15, 23, 42, 0.58);
}

.edit-form__full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .video-modal__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
