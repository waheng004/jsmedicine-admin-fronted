<template>
  <section class="resource-page expert-page">
    <div class="resource-header">
      <div>
        <h2>专家管理</h2>
        <p>维护专家内容、个人履历与两级专家分类。</p>
      </div>
      <div class="header-actions expert-page__tabs">
        <button
          type="button"
          :class="activeTab === 'content' ? 'primary-button' : 'ghost-button'"
          @click="switchTab('content')"
        >
          专家内容
        </button>
        <button
          type="button"
          :class="activeTab === 'category' ? 'primary-button' : 'ghost-button'"
          @click="switchTab('category')"
        >
          分类管理
        </button>
        <button class="ghost-button" type="button" @click="refreshCurrentTab">刷新</button>
      </div>
    </div>

    <form v-if="activeTab === 'content'" class="filter-bar" @submit.prevent="handleExpertSearch">
      <label>
        <span>专家分类</span>
        <select v-model="expertQuery.categoryId">
          <option value="">全部分类</option>
          <option v-for="item in categoryOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
      <label>
        <span>状态</span>
        <select v-model="expertQuery.status">
          <option value="">全部状态</option>
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
      <label class="expert-page__search">
        <span>专家名称</span>
        <input v-model.trim="expertQuery.keyword" placeholder="请输入专家名称" />
      </label>
      <button class="primary-button" type="submit">搜索</button>
      <button class="ghost-button" type="button" @click="resetExpertSearch">重置</button>
      <div class="expert-page__toolbar">
        <button class="primary-button" type="button" @click="openCreateExpert">添加专家</button>
        <button
          class="ghost-button danger-link"
          type="button"
          :disabled="!selectedExpertIds.length"
          @click="handleBatchDeleteExperts"
        >
          批量删除
        </button>
      </div>
    </form>

    <form v-else class="filter-bar" @submit.prevent="handleCategorySearch">
      <label>
        <span>分类名称</span>
        <input v-model.trim="categoryQuery.keyword" placeholder="请输入专家分类名称" />
      </label>
      <label>
        <span>状态</span>
        <select v-model="categoryQuery.status">
          <option value="">全部状态</option>
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
      <button class="primary-button" type="submit">搜索</button>
      <button class="ghost-button" type="button" @click="resetCategorySearch">重置</button>
      <div class="expert-page__toolbar">
        <button class="primary-button" type="button" @click="openCreateCategory">新增专家分类</button>
      </div>
    </form>

    <p v-if="pageMessage.text" class="page-message" :class="{ 'page-message--error': pageMessage.type === 'error' }">
      {{ pageMessage.text }}
    </p>

    <div v-if="activeTab === 'content'" class="table-wrap">
      <table class="data-table expert-table">
        <thead>
          <tr>
            <th class="expert-table__checkbox">
              <input
                :checked="allExpertsChecked"
                :indeterminate.prop="indeterminateExpertsChecked"
                type="checkbox"
                @change="toggleAllExperts($event)"
              />
            </th>
            <th>名称</th>
            <th>头像</th>
            <th>性别</th>
            <th>出生年月</th>
            <th>手机号码</th>
            <th>头衔</th>
            <th>机构</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="expertLoading">
            <td colspan="10">加载中...</td>
          </tr>
          <tr v-else-if="experts.length === 0">
            <td colspan="10">暂无专家数据</td>
          </tr>
          <tr v-for="expert in experts" v-else :key="expert.id">
            <td class="expert-table__checkbox">
              <input v-model="selectedExpertIds" type="checkbox" :value="expert.id" />
            </td>
            <td>{{ formatText(expert.realName) }}</td>
            <td class="table-cell--image">
              <div v-if="resolveImage(expert.coverUrl || expert.avatarUrl)" class="image-cell">
                <img
                  class="image-thumb expert-table__avatar"
                  :src="resolveImage(expert.coverUrl || expert.avatarUrl)"
                  :alt="`${expert.realName || '专家'}头像`"
                />
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ genderMap[String(expert.gender ?? '')] || '-' }}</td>
            <td>{{ formatBirthMonth(expert.birthDate) }}</td>
            <td>{{ maskMobile(expert.mobile) }}</td>
            <td>{{ formatText(expert.title) }}</td>
            <td>{{ formatText(expert.organization) }}</td>
            <td>
              <span class="expert-page__status" :class="{ 'expert-page__status--enabled': String(expert.status) === '1' }">
                {{ statusMap[String(expert.status ?? '')] || '-' }}
              </span>
            </td>
            <td class="row-actions">
              <button type="button" @click="openEditExpert(expert)">修改</button>
              <button type="button" @click="openExperienceDialog(expert)">履历</button>
              <button class="danger-link" type="button" @click="handleDeleteExpert(expert)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table category-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>排序值</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="categoryLoading">
            <td colspan="5">加载中...</td>
          </tr>
          <tr v-else-if="categories.length === 0">
            <td colspan="5">暂无分类数据</td>
          </tr>
          <tr v-for="category in categories" v-else :key="category.id">
            <td>
              <div class="expert-page__category-name">
                <strong>{{ formatText(category.categoryName) }}</strong>
                <span>{{ category.level === 2 ? `二级科室 · ${formatText(category.parentCategoryName)}` : '一级科室' }}</span>
              </div>
            </td>
            <td>{{ category.sortOrder ?? 0 }}</td>
            <td>{{ formatDateTime(category.createdAt) }}</td>
            <td>{{ formatDateTime(category.updatedAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="openEditCategory(category)">修改</button>
              <button v-if="Number(category.level || 1) === 1" type="button" @click="openChildCategoryDialog(category)">二级科室</button>
              <button class="danger-link" type="button" @click="handleDeleteCategory(category)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ currentTotal }} 条</span>
      <button type="button" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button type="button" :disabled="!hasNextPage" @click="changePage(currentPage + 1)">下一页</button>
    </footer>

    <div v-if="expertDialog.open" class="modal-backdrop" @click.self="closeExpertDialog">
      <section class="modal expert-dialog">
        <header>
          <h3>{{ expertDialog.mode === 'create' ? '新增专家' : '修改专家资料' }}</h3>
          <button type="button" aria-label="关闭" @click="closeExpertDialog">x</button>
        </header>

        <form class="edit-form expert-form" @submit.prevent="submitExpertDialog">
          <label>
            <span>专家名称</span>
            <input v-model.trim="expertDialog.form.realName" maxlength="64" required />
          </label>
          <label>
            <span>绑定用户 ID</span>
            <input v-model="expertDialog.form.userId" min="1" type="number" placeholder="选填" />
          </label>
          <label>
            <span>性别</span>
            <select v-model="expertDialog.form.gender">
              <option v-for="item in genderOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            <span>出生年月</span>
            <input v-model="expertDialog.form.birthDate" type="month" />
          </label>
          <label>
            <span>手机号码</span>
            <input v-model.trim="expertDialog.form.mobile" maxlength="32" />
          </label>
          <label>
            <span>头衔</span>
            <input v-model.trim="expertDialog.form.title" maxlength="128" />
          </label>
          <label>
            <span>机构</span>
            <select v-model="expertDialog.form.organizationId">
              <option value="">请选择机构</option>
              <option v-for="item in organizationOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            <span>执业类型</span>
            <select v-model="expertDialog.form.practiceTypeId">
              <option value="">请选择执业类型</option>
              <option v-for="item in practiceTypeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label class="expert-form__full">
            <span>专家分类</span>
            <div class="expert-page__checkbox-grid">
              <label v-for="item in categoryOptions" :key="item.value" class="expert-page__checkbox-item">
                <input v-model="expertDialog.form.categoryIds" type="checkbox" :value="item.value" />
                <span>{{ item.label }}</span>
              </label>
            </div>
          </label>
          <label class="expert-form__full">
            <span>头像</span>
            <div class="cover-upload-field">
              <div class="cover-upload-field__preview expert-page__cover-preview">
                <img
                  v-if="expertDialog.form.coverUrl"
                  class="detail-media__preview"
                  :src="resolveImage(expertDialog.form.coverUrl)"
                  alt="专家头像预览"
                />
                <span v-else>未上传头像</span>
              </div>
              <div class="cover-upload-field__actions">
                <input
                  id="expert-cover-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleExpertCoverChange"
                />
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="expertDialog.uploading"
                  @click="triggerExpertCoverInput"
                >
                  {{ expertDialog.uploading ? '上传中...' : '上传头像' }}
                </button>
                <span v-if="expertDialog.form.coverUrl" class="cover-upload-field__path">
                  {{ expertDialog.form.coverUrl }}
                </span>
              </div>
            </div>
          </label>
          <label class="expert-form__full">
            <span>擅长</span>
            <textarea v-model.trim="expertDialog.form.specialty" maxlength="255" />
          </label>
          <label class="expert-form__full">
            <span>简介</span>
            <textarea v-model.trim="expertDialog.form.introduction" />
          </label>
          <label>
            <span>状态</span>
            <select v-model="expertDialog.form.status" required>
              <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            <span>可咨询</span>
            <select v-model="expertDialog.form.consultEnabled" required>
              <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label class="expert-form__full">
            <span>咨询须知</span>
            <textarea v-model.trim="expertDialog.form.consultationNotice" maxlength="512" />
          </label>
          <label>
            <span>排序值</span>
            <input v-model="expertDialog.form.sortOrder" min="0" type="number" />
          </label>
          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeExpertDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="expertDialog.submitting">
              {{ expertDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="experienceDialog.open" class="modal-backdrop" @click.self="closeExperienceDialog">
      <section class="modal expert-dialog expert-dialog--wide">
        <header>
          <h3>{{ experienceDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeExperienceDialog">x</button>
        </header>

        <div class="expert-experiences">
          <div class="expert-experiences__header">
            <p>支持维护教育经历、工作经历和成就荣誉。</p>
            <button class="primary-button" type="button" @click="addExperienceRow">新增履历</button>
          </div>

          <div v-if="experienceDialog.records.length === 0" class="expert-page__empty">
            当前暂无履历，可点击“新增履历”补充。
          </div>

          <div
            v-for="(experience, index) in experienceDialog.records"
            :key="experience.localKey"
            class="expert-experience-card"
          >
            <div class="expert-experience-card__header">
              <strong>履历 {{ index + 1 }}</strong>
              <button class="ghost-button danger-link" type="button" @click="removeExperienceRow(index)">删除</button>
            </div>
            <div class="expert-experience-card__grid">
              <label>
                <span>类型</span>
                <select v-model="experience.experienceType">
                  <option v-for="item in experienceTypeOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
              </label>
              <label>
                <span>标题</span>
                <input v-model.trim="experience.title" maxlength="255" required />
              </label>
              <label>
                <span>开始日期</span>
                <input v-model="experience.startDate" type="date" />
              </label>
              <label>
                <span>结束日期</span>
                <input v-model="experience.endDate" type="date" />
              </label>
              <label>
                <span>排序值</span>
                <input v-model="experience.sortOrder" min="0" type="number" />
              </label>
              <label class="expert-experience-card__description">
                <span>描述</span>
                <textarea v-model.trim="experience.description" />
              </label>
            </div>
          </div>
        </div>

        <div class="modal-actions expert-dialog__footer">
          <button class="ghost-button" type="button" @click="closeExperienceDialog">取消</button>
          <button class="primary-button" type="button" :disabled="experienceDialog.submitting" @click="submitExperienceDialog">
            {{ experienceDialog.submitting ? '提交中...' : '保存履历' }}
          </button>
        </div>
      </section>
    </div>

    <div v-if="categoryDialog.open" class="modal-backdrop" @click.self="closeCategoryDialog">
      <section class="modal">
        <header>
          <h3>{{ categoryDialog.mode === 'create' ? '新增专家分类' : '修改专家分类' }}</h3>
          <button type="button" aria-label="关闭" @click="closeCategoryDialog">x</button>
        </header>

        <form class="edit-form" @submit.prevent="submitCategoryDialog">
          <label>
            <span>分类名称</span>
            <input v-model.trim="categoryDialog.form.categoryName" maxlength="64" required />
          </label>
          <label>
            <span>父级分类</span>
            <select v-model="categoryDialog.form.parentId" :disabled="Boolean(categoryDialog.lockedParentId)">
              <option value="">无父级（一级科室）</option>
              <option v-for="item in parentCategoryOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            <span>状态</span>
            <select v-model="categoryDialog.form.status" required>
              <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label>
            <span>排序值</span>
            <input v-model="categoryDialog.form.sortOrder" min="0" type="number" />
          </label>
          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeCategoryDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="categoryDialog.submitting">
              {{ categoryDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="childCategoryDialog.open" class="modal-backdrop" @click.self="closeChildCategoryDialog">
      <section class="modal expert-dialog expert-dialog--wide">
        <header>
          <h3>{{ childCategoryDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeChildCategoryDialog">x</button>
        </header>

        <div class="expert-child-categories">
          <div class="expert-experiences__header">
            <p>当前弹窗只管理所选一级科室下的二级科室。</p>
            <button class="primary-button" type="button" @click="openCreateChildCategory">新增二级科室</button>
          </div>

          <table class="data-table expert-child-categories__table">
            <thead>
              <tr>
                <th>名称</th>
                <th>排序值</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="childCategoryDialog.loading">
                <td colspan="4">加载中...</td>
              </tr>
              <tr v-else-if="childCategoryDialog.records.length === 0">
                <td colspan="4">暂无二级科室</td>
              </tr>
              <tr v-for="item in childCategoryDialog.records" v-else :key="item.id">
                <td>{{ formatText(item.categoryName) }}</td>
                <td>{{ item.sortOrder ?? 0 }}</td>
                <td>{{ statusMap[String(item.status ?? '')] || '-' }}</td>
                <td class="row-actions">
                  <button type="button" @click="openEditCategory(item, childCategoryDialog.parentCategory)">修改</button>
                  <button class="danger-link" type="button" @click="handleDeleteCategory(item, true)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { uploadCoverFile } from '../../api/content-files'
import { resolvePublicFileUrl } from '../../api/http'
import {
  createExpert,
  createExpertCategory,
  deleteExpert,
  deleteExpertCategory,
  getExpertDetail,
  pageExpertCategories,
  pageExperts,
  pageOrganizations,
  pagePracticeTypes,
  replaceExpertCategories,
  replaceExpertExperiences,
  updateExpert,
  updateExpertCategory,
} from '../../api/experts'

const props = defineProps({
  resourceKey: {
    type: String,
    default: 'experts',
  },
})

const router = useRouter()
const route = useRoute()
const activeTab = ref(props.resourceKey === 'expertCategories' ? 'category' : 'content')

const statusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const genderOptions = [
  { label: '未知', value: '0' },
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]

const experienceTypeOptions = [
  { label: '教育经历', value: 'education' },
  { label: '工作经历', value: 'work' },
  { label: '成就荣誉', value: 'achievement' },
]

const statusMap = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]))
const genderMap = Object.fromEntries(genderOptions.map((item) => [item.value, item.label]))

const pageMessage = reactive({
  text: '',
  type: 'info',
})

const expertQuery = reactive({
  page: 1,
  size: 10,
  keyword: '',
  categoryId: '',
  status: '',
})

const categoryQuery = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: '',
})

const experts = ref([])
const expertTotal = ref(0)
const expertLoading = ref(false)
const selectedExpertIds = ref([])

const categories = ref([])
const categoryTotal = ref(0)
const categoryLoading = ref(false)
const categoryOptions = ref([])
const parentCategoryOptions = ref([])

const organizationOptions = ref([])
const practiceTypeOptions = ref([])

const expertDialog = reactive({
  open: false,
  mode: 'create',
  recordId: null,
  submitting: false,
  uploading: false,
  form: createExpertForm(),
})

const experienceDialog = reactive({
  open: false,
  title: '',
  expertId: null,
  submitting: false,
  records: [],
})

const categoryDialog = reactive({
  open: false,
  mode: 'create',
  recordId: null,
  submitting: false,
  lockedParentId: '',
  form: createCategoryForm(),
})

const childCategoryDialog = reactive({
  open: false,
  title: '',
  loading: false,
  parentCategory: null,
  records: [],
})

const currentPage = computed(() => (activeTab.value === 'content' ? expertQuery.page : categoryQuery.page))
const currentTotal = computed(() => (activeTab.value === 'content' ? expertTotal.value : categoryTotal.value))
const currentSize = computed(() => (activeTab.value === 'content' ? expertQuery.size : categoryQuery.size))
const hasNextPage = computed(() => currentPage.value * currentSize.value < currentTotal.value)

const allExpertsChecked = computed(
  () => experts.value.length > 0 && experts.value.every((item) => selectedExpertIds.value.includes(item.id)),
)
const indeterminateExpertsChecked = computed(
  () => selectedExpertIds.value.length > 0 && !allExpertsChecked.value,
)

function createExpertForm(record = {}) {
  return {
    userId: record.userId ?? '',
    realName: record.realName || '',
    gender: String(record.gender ?? '0'),
    birthDate: normalizeMonthValue(record.birthDate),
    mobile: record.mobile || '',
    title: record.title || '',
    organizationId: record.organizationId ?? '',
    practiceTypeId: record.practiceTypeId ?? '',
    specialty: record.specialty || '',
    introduction: record.introduction || '',
    coverUrl: record.coverUrl || record.avatarUrl || '',
    status: String(record.status ?? '1'),
    consultEnabled: String(record.consultEnabled ?? '1'),
    consultationNotice: record.consultationNotice || '',
    sortOrder: record.sortOrder ?? 0,
    categoryIds: Array.isArray(record.categoryIds) ? record.categoryIds.map((item) => Number(item)) : [],
  }
}

function createCategoryForm(record = {}, parentId = '') {
  const fallbackParentId = parentId !== '' ? parentId : record.parentId
  return {
    categoryName: record.categoryName || '',
    parentId: fallbackParentId === null || fallbackParentId === undefined ? '' : String(fallbackParentId),
    status: String(record.status ?? '1'),
    sortOrder: record.sortOrder ?? 0,
  }
}

function showMessage(text, type = 'info') {
  pageMessage.text = text
  pageMessage.type = type
}

function clearMessage() {
  showMessage('')
}

function switchTab(tab) {
  if (tab === 'content') {
    router.push('/experts')
  } else {
    router.push('/experts/categories')
  }
}

function syncActiveTabFromRoute() {
  const nextTab = props.resourceKey === 'expertCategories' || route.path === '/experts/categories' ? 'category' : 'content'
  if (activeTab.value === nextTab) return
  activeTab.value = nextTab
  clearMessage()
}

function formatText(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value)
}

function resolveImage(path) {
  return path ? resolvePublicFileUrl(path) : ''
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function normalizeMonthValue(value) {
  if (!value) return ''
  return String(value).slice(0, 7)
}

function formatBirthMonth(value) {
  const text = normalizeMonthValue(value)
  return text || '-'
}

function maskMobile(value) {
  if (!value) return '-'
  const text = String(value)
  if (text.length < 7) return text
  return `${text.slice(0, 3)}****${text.slice(-4)}`
}

function buildExpertPayload(form) {
  const organization = organizationOptions.value.find((item) => String(item.value) === String(form.organizationId))
  return {
    userId: toOptionalNumber(form.userId),
    realName: form.realName.trim(),
    gender: String(form.gender || '0'),
    birthDate: form.birthDate ? `${form.birthDate}-01` : null,
    mobile: form.mobile.trim(),
    coverUrl: form.coverUrl || '',
    title: form.title.trim(),
    organization: organization?.orgName || '',
    organizationId: toOptionalNumber(form.organizationId),
    practiceTypeId: toOptionalNumber(form.practiceTypeId),
    specialty: form.specialty.trim(),
    introduction: form.introduction.trim(),
    status: String(form.status || '1'),
    consultEnabled: String(form.consultEnabled || '1'),
    consultationNotice: form.consultationNotice.trim(),
    sortOrder: toOptionalNumber(form.sortOrder) ?? 0,
  }
}

function buildCategoryPayload(form) {
  return {
    categoryName: form.categoryName.trim(),
    parentId: toOptionalNumber(form.parentId),
    status: String(form.status || '1'),
    sortOrder: toOptionalNumber(form.sortOrder) ?? 0,
  }
}

function buildExperiencePayload(records) {
  return records.map((item, index) => ({
    experienceType: item.experienceType || 'work',
    title: item.title.trim(),
    description: item.description.trim(),
    startDate: item.startDate || null,
    endDate: item.endDate || null,
    sortOrder: toOptionalNumber(item.sortOrder) ?? index,
  }))
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const result = Number(value)
  return Number.isNaN(result) ? null : result
}

function createExperienceRecord(record = {}) {
  return {
    localKey: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    experienceType: record.experienceType || 'work',
    title: record.title || '',
    description: record.description || '',
    startDate: record.startDate || '',
    endDate: record.endDate || '',
    sortOrder: record.sortOrder ?? 0,
  }
}

async function loadReferenceOptions() {
  try {
    const [organizations, practiceTypes] = await Promise.all([
      pageOrganizations({ page: 1, size: 200 }),
      pagePracticeTypes({ page: 1, size: 200 }),
    ])

    const organizationRecords = Array.isArray(organizations?.records) ? organizations.records : Array.isArray(organizations) ? organizations : []
    const practiceTypeRecords = Array.isArray(practiceTypes?.records) ? practiceTypes.records : Array.isArray(practiceTypes) ? practiceTypes : []

    organizationOptions.value = organizationRecords.map((item) => ({
      value: item.id,
      label: item.orgName || `机构 #${item.id}`,
      orgName: item.orgName || '',
    }))

    practiceTypeOptions.value = practiceTypeRecords.map((item) => ({
      value: item.id,
      label: item.typeName || `执业类型 #${item.id}`,
    }))
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

async function loadCategoryOptions() {
  const data = await pageExpertCategories({ page: 1, size: 200 })
  const records = Array.isArray(data?.records) ? data.records : []
  categoryOptions.value = records.map((item) => ({
    value: item.id,
    label: item.parentCategoryName ? `${item.parentCategoryName} / ${item.categoryName}` : item.categoryName || `分类 #${item.id}`,
    level: item.level,
    parentId: item.parentId,
  }))
  parentCategoryOptions.value = records
    .filter((item) => Number(item.level || 1) === 1)
    .map((item) => ({
      value: item.id,
      label: item.categoryName || `分类 #${item.id}`,
    }))
}

async function loadExperts() {
  expertLoading.value = true
  try {
    const data = await pageExperts({
      page: expertQuery.page,
      size: expertQuery.size,
      keyword: expertQuery.keyword,
      categoryId: toOptionalNumber(expertQuery.categoryId),
      status: expertQuery.status || undefined,
    })
    experts.value = Array.isArray(data?.records) ? data.records : []
    expertTotal.value = Number(data?.total || experts.value.length || 0)
    selectedExpertIds.value = selectedExpertIds.value.filter((id) => experts.value.some((item) => item.id === id))
  } catch (error) {
    experts.value = []
    expertTotal.value = 0
    showMessage(error.message, 'error')
  } finally {
    expertLoading.value = false
  }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    const data = await pageExpertCategories({
      page: categoryQuery.page,
      size: categoryQuery.size,
      keyword: categoryQuery.keyword,
      status: categoryQuery.status || undefined,
    })
    categories.value = Array.isArray(data?.records) ? data.records : []
    categoryTotal.value = Number(data?.total || categories.value.length || 0)
  } catch (error) {
    categories.value = []
    categoryTotal.value = 0
    showMessage(error.message, 'error')
  } finally {
    categoryLoading.value = false
  }
}

async function refreshCurrentTab() {
  clearMessage()
  await Promise.all([loadCategoryOptions(), activeTab.value === 'content' ? loadExperts() : loadCategories()])
}

function changePage(page) {
  if (activeTab.value === 'content') {
    expertQuery.page = page
    loadExperts()
    return
  }

  categoryQuery.page = page
  loadCategories()
}

function handleExpertSearch() {
  expertQuery.page = 1
  loadExperts()
}

function resetExpertSearch() {
  expertQuery.page = 1
  expertQuery.keyword = ''
  expertQuery.categoryId = ''
  expertQuery.status = ''
  loadExperts()
}

function handleCategorySearch() {
  categoryQuery.page = 1
  loadCategories()
}

function resetCategorySearch() {
  categoryQuery.page = 1
  categoryQuery.keyword = ''
  categoryQuery.status = ''
  loadCategories()
}

function toggleAllExperts(event) {
  if (event.target.checked) {
    selectedExpertIds.value = experts.value.map((item) => item.id)
    return
  }
  selectedExpertIds.value = []
}

function openCreateExpert() {
  expertDialog.open = true
  expertDialog.mode = 'create'
  expertDialog.recordId = null
  expertDialog.submitting = false
  expertDialog.uploading = false
  expertDialog.form = createExpertForm()
}

async function openEditExpert(record) {
  try {
    const detail = await getExpertDetail(record.id)
    expertDialog.open = true
    expertDialog.mode = 'edit'
    expertDialog.recordId = record.id
    expertDialog.submitting = false
    expertDialog.uploading = false
    expertDialog.form = createExpertForm(detail || record)
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

function closeExpertDialog() {
  expertDialog.open = false
  expertDialog.submitting = false
  expertDialog.uploading = false
  expertDialog.recordId = null
  expertDialog.form = createExpertForm()
}

async function submitExpertDialog() {
  expertDialog.submitting = true
  try {
    const payload = buildExpertPayload(expertDialog.form)
    let result

    if (expertDialog.mode === 'create') {
      result = await createExpert(payload)
    } else {
      result = await updateExpert(expertDialog.recordId, payload)
    }

    const expertId = result?.data?.id || expertDialog.recordId
    if (expertId) {
      await replaceExpertCategories(expertId, expertDialog.form.categoryIds || [])
    }

    showMessage('专家资料已保存')
    closeExpertDialog()
    await Promise.all([loadExperts(), loadCategoryOptions()])
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    expertDialog.submitting = false
  }
}

async function handleDeleteExpert(record) {
  if (!window.confirm(`确认删除专家《${record.realName || record.id}》吗？`)) return
  try {
    await deleteExpert(record.id)
    showMessage('专家已删除')
    await loadExperts()
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

async function handleBatchDeleteExperts() {
  if (!selectedExpertIds.value.length) return
  if (!window.confirm(`确认删除已选中的 ${selectedExpertIds.value.length} 位专家吗？`)) return

  const failures = []
  for (const expertId of [...selectedExpertIds.value]) {
    try {
      await deleteExpert(expertId)
    } catch (error) {
      failures.push(`专家 #${expertId}：${error.message}`)
    }
  }

  await loadExperts()

  if (failures.length) {
    showMessage(`部分删除失败：${failures.join('；')}`, 'error')
    return
  }

  selectedExpertIds.value = []
  showMessage('批量删除完成')
}

async function openExperienceDialog(record) {
  try {
    const detail = await getExpertDetail(record.id)
    experienceDialog.open = true
    experienceDialog.title = `${detail?.realName || record.realName || '专家'}履历`
    experienceDialog.expertId = record.id
    experienceDialog.submitting = false
    experienceDialog.records = Array.isArray(detail?.experiences)
      ? detail.experiences.map((item) => createExperienceRecord(item))
      : []
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

function closeExperienceDialog() {
  experienceDialog.open = false
  experienceDialog.title = ''
  experienceDialog.expertId = null
  experienceDialog.submitting = false
  experienceDialog.records = []
}

function addExperienceRow() {
  experienceDialog.records.push(createExperienceRecord())
}

function removeExperienceRow(index) {
  experienceDialog.records.splice(index, 1)
}

async function submitExperienceDialog() {
  const invalidRecord = experienceDialog.records.find((item) => !item.title.trim())
  if (invalidRecord) {
    showMessage('履历标题不能为空', 'error')
    return
  }

  experienceDialog.submitting = true
  try {
    await replaceExpertExperiences(experienceDialog.expertId, buildExperiencePayload(experienceDialog.records))
    showMessage('专家履历已保存')
    closeExperienceDialog()
    await loadExperts()
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    experienceDialog.submitting = false
  }
}

function openCreateCategory(parentCategory = null) {
  categoryDialog.open = true
  categoryDialog.mode = 'create'
  categoryDialog.recordId = null
  categoryDialog.submitting = false
  categoryDialog.lockedParentId = parentCategory?.id ? String(parentCategory.id) : ''
  categoryDialog.form = createCategoryForm({}, categoryDialog.lockedParentId)
}

function openEditCategory(record, forcedParentCategory = null) {
  categoryDialog.open = true
  categoryDialog.mode = 'edit'
  categoryDialog.recordId = record.id
  categoryDialog.submitting = false
  categoryDialog.lockedParentId = forcedParentCategory?.id ? String(forcedParentCategory.id) : ''
  categoryDialog.form = createCategoryForm(record, categoryDialog.lockedParentId || '')
}

function openCreateChildCategory() {
  if (!childCategoryDialog.parentCategory) return
  openCreateCategory(childCategoryDialog.parentCategory)
}

function closeCategoryDialog() {
  categoryDialog.open = false
  categoryDialog.mode = 'create'
  categoryDialog.recordId = null
  categoryDialog.submitting = false
  categoryDialog.lockedParentId = ''
  categoryDialog.form = createCategoryForm()
}

async function submitCategoryDialog() {
  categoryDialog.submitting = true
  try {
    const payload = buildCategoryPayload({
      ...categoryDialog.form,
      parentId: categoryDialog.lockedParentId || categoryDialog.form.parentId,
    })

    if (categoryDialog.mode === 'create') {
      await createExpertCategory(payload)
      showMessage('专家分类已新增')
    } else {
      await updateExpertCategory(categoryDialog.recordId, payload)
      showMessage('专家分类已更新')
    }

    closeCategoryDialog()
    await Promise.all([loadCategories(), loadCategoryOptions()])

    if (childCategoryDialog.open && childCategoryDialog.parentCategory?.id) {
      await loadChildCategories(childCategoryDialog.parentCategory)
    }
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    categoryDialog.submitting = false
  }
}

async function handleDeleteCategory(record, skipReloadChildren = false) {
  if (!window.confirm(`确认删除分类《${record.categoryName || record.id}》吗？`)) return
  try {
    await deleteExpertCategory(record.id)
    showMessage('专家分类已删除')
    await Promise.all([loadCategories(), loadCategoryOptions()])

    if (!skipReloadChildren && childCategoryDialog.open && childCategoryDialog.parentCategory?.id) {
      await loadChildCategories(childCategoryDialog.parentCategory)
    }

    if (skipReloadChildren && childCategoryDialog.parentCategory?.id) {
      await loadChildCategories(childCategoryDialog.parentCategory)
    }
  } catch (error) {
    showMessage(error.message, 'error')
  }
}

async function loadChildCategories(category) {
  childCategoryDialog.loading = true
  try {
    const data = await pageExpertCategories({
      page: 1,
      size: 100,
      parentId: category.id,
    })
    childCategoryDialog.records = Array.isArray(data?.records) ? data.records : []
  } catch (error) {
    childCategoryDialog.records = []
    showMessage(error.message, 'error')
  } finally {
    childCategoryDialog.loading = false
  }
}

async function openChildCategoryDialog(category) {
  childCategoryDialog.open = true
  childCategoryDialog.title = `${category.categoryName || '分类'} · 二级科室`
  childCategoryDialog.parentCategory = category
  childCategoryDialog.records = []
  await loadChildCategories(category)
}

function closeChildCategoryDialog() {
  childCategoryDialog.open = false
  childCategoryDialog.title = ''
  childCategoryDialog.loading = false
  childCategoryDialog.parentCategory = null
  childCategoryDialog.records = []
}

function triggerExpertCoverInput() {
  document.getElementById('expert-cover-upload')?.click()
}

async function handleExpertCoverChange(event) {
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

  expertDialog.uploading = true
  try {
    const result = await uploadCoverFile(file, 'expert-cover')
    expertDialog.form.coverUrl = result.coverUrl || ''
    showMessage('头像上传成功')
  } catch (error) {
    showMessage(error.message, 'error')
  } finally {
    expertDialog.uploading = false
    event.target.value = ''
  }
}

onMounted(async () => {
  await Promise.all([loadReferenceOptions(), loadCategoryOptions(), loadExperts(), loadCategories()])
})

watch(
  () => [props.resourceKey, route.path],
  () => {
    syncActiveTabFromRoute()
  },
)
</script>
