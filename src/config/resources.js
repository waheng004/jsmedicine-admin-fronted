const commonStatusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const userStatusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const userRoleOptions = [
  { label: '普通用户', value: 'NORMAL' },
  { label: '学员', value: 'STUDENT' },
  { label: '专家', value: 'EXPERT' },
]

const enumGenderOptions = [
  { label: '未知', value: '0' },
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]

const enumCertificationStatusOptions = [
  { label: '未提交', value: '0' },
  { label: '审核中', value: '1' },
  { label: '已通过', value: '2' },
  { label: '已拒绝', value: '3' },
]

const qaStatusOptions = [
  { label: '待处理', value: '0' },
  { label: '已答复', value: '1' },
  { label: '已关闭', value: '2' },
  { label: '待处理', value: 'PENDING' },
  { label: '已答复', value: 'ANSWERED' },
  { label: '已关闭', value: 'CLOSED' },
]

const feedbackStatusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '已处理', value: 'PROCESSED' },
]

const booleanStatusOptions = [
  { label: '否', value: '0' },
  { label: '是', value: '1' },
]

const genderOptions = [
  { label: '未知', value: '0' },
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]

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

const auditFields = [
  {
    key: 'reviewStatus',
    label: '审核状态',
    type: 'select',
    options: reviewStatusOptions,
    defaultValue: '2',
  },
  { key: 'comment', label: '审核意见', type: 'textarea' },
]

const processFields = [{ key: 'processNote', label: '处理备注', type: 'textarea' }]

const commonFieldLabels = {
  id: 'ID',
  name: '名称',
  username: '用户名',
  nickname: '昵称',
  profileSignature: '个人签名',
  realName: '姓名',
  mobile: '手机号',
  email: '邮箱',
  title: '标题',
  content: '内容',
  status: '状态',
  role: '用户身份',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  registeredAt: '注册时间',
  lastLoginAt: '最后登录时间',
  sortOrder: '排序',
  userId: '用户',
  userName: '用户',
  userNickname: '用户',
  expertId: '专家',
  expertName: '专家',
  expertRealName: '专家',
  studentId: '学员',
  studentName: '学员姓名',
  categoryId: '分类',
  categoryName: '分类名称',
  parentId: '父级',
  roleCode: '角色编码',
  roleName: '角色名称',
  description: '描述',
  permissionCode: '权限编码',
  permissionName: '权限名称',
  permissionType: '权限类型',
  routePath: '路由路径',
  apiMethod: '请求方法',
  apiPath: '接口路径',
  targetType: '对象类型',
  targetId: '对象 ID',
  beforeStatus: '变更前状态',
  afterStatus: '变更后状态',
  auditorId: '操作人',
  auditorName: '审核人',
  auditorUsername: '审核人账号',
  auditedAt: '操作时间',
  targetTypeLabel: '对象类型',
  statusType: '状态类型',
  beforeStatusLabel: '变更前状态',
  afterStatusLabel: '变更后状态',
  feedbackType: '反馈类型',
  processStatus: '处理状态',
  processedAt: '处理时间',
  processNote: '处理备注',
  reviewStatus: '审核状态',
  publishStatus: '发布状态',
  publishedAt: '发布时间',
  certificationStatus: '认证状态',
  avatarUrl: '头像',
  authProvider: '登录方式',
  wechatOpenId: '微信 OpenID',
  wechatUnionId: '微信 UnionID',
  profileCompleted: '资料完整',
  gender: '性别',
  age: '年龄',
  birthDate: '出生日期',
  educationLevel: '学历',
  coverUrl: '封面',
  icon: '图标',
  iconUrl: '图标',
  fileUrl: '文件地址',
  fileName: '文件名',
  fileType: '文件类型',
  fileSize: '文件大小',
  audioUrl: '音频地址',
  videoUrl: '视频地址',
  liveUrl: '直播地址',
  playbackUrl: '回放地址',
  contentUrl: '内容地址',
  durationSeconds: '时长',
  courseName: '课程名称',
  lecturerName: '讲师',
  subtitle: '副标题',
  introduction: '简介',
  paperId: '考卷',
  courseId: '课程',
  bookId: '图书',
  podcastId: '播客',
  liveSessionId: '直播',
  bookName: '图书名称',
  author: '作者',
  publisher: '出版社',
  chapterName: '章节名称',
  startPage: '起始页',
  pageCount: '页数',
  totalPages: '总页数',
  paperName: '考卷名称',
  totalScore: '总分',
  passScore: '及格分',
  durationMinutes: '考试时长',
  summary: '摘要',
  authorName: '作者',
  contentType: '内容类型',
  contentTypeLabel: '内容类型',
  learningRequirements: '学习要求',
  itemType: '资源类型',
  itemId: '资源',
  organization: '机构',
  organizationId: '机构',
  organizationName: '机构名称',
  practiceTypeId: '执业类型',
  typeName: '执业类型',
  specialty: '擅长',
  consultEnabled: '是否可咨询',
  consultationNotice: '咨询须知',
  questionType: '题型',
  question: '题目',
  questionId: '题目',
  questions: '题目',
  analysis: '解析',
  difficulty: '难度',
  score: '分值',
  correct: '是否正确',
  correctAnswer: '正确答案',
  optionKey: '选项',
  optionContent: '选项内容',
  options: '选项',
  answers: '回复记录',
  answerContent: '回复内容',
  answeredAt: '答复时间',
  anchorName: '主播',
  liveStatus: '直播状态',
  resourceType: '资源类型',
  resourceId: '资源',
  recordCount: '记录数',
  studentCount: '学员数',
  completedCount: '完成人数',
  totalStudyHours: '总学时',
  averageProgressPercent: '平均进度',
  totalStudents: '学员总数',
  enabledStudents: '启用学员',
  approvedStudents: '已认证学员',
  pendingCertifications: '待审核认证',
  rejectedCertifications: '已拒绝认证',
  linkedUsers: '关联用户数',
  city: '城市',
  cityCode: '城市编码',
  province: '省份',
  provinceCode: '省份编码',
  districtCode: '区县编码',
  approvedStudentCount: '已认证学员',
  enabledStudentCount: '启用学员',
  paperTitle: '试卷名称',
  examCount: '考试次数',
  passedCount: '通过人数',
  passRatePercent: '通过率',
  averageScore: '平均分',
  browseCount: '浏览数',
  favoriteCount: '收藏数',
  shareCount: '分享数',
  uniqueBrowseUsers: '浏览用户数',
  uniqueFavoriteUsers: '收藏用户数',
  uniqueShareUsers: '分享用户数',
  viewCount: '浏览数',
  browseHistoryCount: '浏览记录数',
  studySeconds: '学习时长',
  totalStudySeconds: '总学习时长',
  progressPercent: '进度',
  completed: '是否完成',
  completedAt: '完成时间',
  startedAt: '开始学习时间',
  lastStudiedAt: '最后学习时间',
  enrolledAt: '报名时间',
  submittedAt: '提交时间',
  passed: '是否通过',
  minScore: '最低分',
  maxScore: '最高分',
  startAt: '开始时间',
  endAt: '结束时间',
  startDate: '开始日期',
  endDate: '结束日期',
  contact: '联系方式',
  contactName: '联系人',
  address: '地址',
  district: '区县',
  idCardNo: '身份证号',
  positionTitle: '职称',
  studentNo: '学员编号',
  certificationMaterials: '认证材料',
  certificationFiles: '认证材料',
  materialType: '材料类型',
  fileAssetId: '文件资源',
  sourceUrl: '来源地址',
  certificationSubmittedAt: '认证提交时间',
  certificationReviewedAt: '认证审核时间',
  certificationReviewedBy: '认证审核人',
  rejectReason: '拒绝原因',
  auditComment: '审核意见',
  adminId: '管理员',
  createdBy: '创建人',
  processedBy: '处理人',
  lastLoginIp: '最后登录 IP',
  roles: '角色',
  permissions: '权限',
  permissionCount: '权限数',
  categoryCode: '分类编码',
  categoryIds: '分类',
  chapterTitle: '章节标题',
  chapters: '章节',
  audios: '音频',
  videos: '视频',
  items: '关联项',
  keywords: '关键词',
  linkUrl: '链接地址',
  topicId: '专题',
  source: '来源',
  speakerName: '主讲人',
  tags: '标签',
  sourceId: '来源',
  sourceType: '来源类型',
  resource: '资源',
  targetAvailable: '资源可用',
  targetTitle: '资源标题',
  occurredAt: '发生时间',
  expertCategoryId: '专家分类',
  parentCategoryName: '父级分类',
  level: '层级',
  experienceType: '履历类型',
  experiences: '履历',
  assetType: '资源类型',
  bucketName: '存储桶',
  objectKey: '对象 Key',
  originalName: '原始文件名',
  storageProvider: '存储服务',
  url: '地址',
  user: '用户',
  profile: '资料',
  accessToken: '访问令牌',
  tokenType: '令牌类型',
  expiresIn: '有效期',
  admin: '管理员',
}

const commonValueMaps = {
  status: Object.fromEntries(commonStatusOptions.map((item) => [item.value, item.label])),
  reviewStatus: Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label])),
  publishStatus: Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label])),
  gender: Object.fromEntries(genderOptions.map((item) => [item.value, item.label])),
  consultEnabled: Object.fromEntries(booleanStatusOptions.map((item) => [item.value, item.label])),
  processStatus: { 0: '未处理', 1: '已处理', PENDING: '待处理', PROCESSED: '已处理' },
  certificationStatus: { 0: '未提交', 1: '审核中', 2: '已通过', 3: '已拒绝' },
  questionType: { 1: '单选', 2: '多选', 3: '判断', 4: '问答' },
  difficulty: { 1: '低', 2: '中', 3: '高' },
  liveStatus: { 0: '未开始', 1: '直播中', 2: '已结束', 3: '已取消' },
  qaStatus: { PENDING: '待处理', ANSWERED: '已答复', CLOSED: '已关闭' },
  materialType: { id_card: '身份证', qualification: '资格证明', other: '其他' },
  authProvider: {
    password: '账号密码',
    mobile_sms: '短信登录',
    MOBILE_SMS: '短信登录',
    wechat_miniapp: '微信小程序',
    WECHAT_MINIAPP: '微信小程序',
  },
}

const userValueMaps = {
  ...commonValueMaps,
  status: {
    ...commonValueMaps.status,
    DISABLED: '未启用',
    ENABLED: '启用',
  },
  role: {
    NORMAL: '普通用户',
    STUDENT: '学员',
    EXPERT: '专家',
  },
  gender: {
    ...commonValueMaps.gender,
    UNKNOWN: '未知',
    MALE: '男',
    FEMALE: '女',
  },
}

const studentValueMaps = {
  ...commonValueMaps,
  status: {
    ...commonValueMaps.status,
    DISABLED: '未启用',
    ENABLED: '启用',
  },
  gender: {
    ...commonValueMaps.gender,
    UNKNOWN: '未知',
    MALE: '男',
    FEMALE: '女',
  },
  certificationStatus: {
    ...commonValueMaps.certificationStatus,
    UNSUBMITTED: '未提交',
    PENDING: '审核中',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
  },
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

async function normalizeUserUpdateBody(body) {
  let organizationId = optionalNumber(body.organizationId)
  if (!organizationId && body.organization) {
    try {
      const { getJsonData } = await import('../api/http.js')
      const organizations = await getJsonData(`/api/v1/admin/references/organizations?keyword=${encodeURIComponent(body.organization)}`)
      const exact = (organizations || []).find((item) => item.orgName === body.organization)
      organizationId = exact?.id ?? organizationId
    } catch {}
  }

  let practiceTypeId = optionalNumber(body.practiceTypeId)
  if (!practiceTypeId && body.practiceTypeName) {
    try {
      const { getJsonData } = await import('../api/http.js')
      const practiceTypes = await getJsonData(`/api/v1/admin/references/practice-types?keyword=${encodeURIComponent(body.practiceTypeName)}`)
      const exact = (practiceTypes || []).find((item) => item.typeName === body.practiceTypeName)
      practiceTypeId = exact?.id ?? practiceTypeId
    } catch {}
  }

  return {
    nickname: body.nickname || '',
    profileSignature: body.profileSignature || '',
    status: optionalNumber(body.status),
    role: body.role,
    studentId: optionalNumber(body.studentId),
    province: body.province || '',
    provinceCode: body.provinceCode || '',
    city: body.city || '',
    cityCode: body.cityCode || '',
    district: body.district || '',
    districtCode: body.districtCode || '',
    organization: body.organization || '',
    organizationId,
    practiceTypeId,
  }
}

function normalizeStudentUpsertBody(body) {
  return {
    studentNo: body.studentNo || '',
    realName: body.realName || '',
    gender: String(body.gender ?? '0'),
    age: optionalNumber(body.age) ?? 0,
    educationLevel: body.educationLevel || '',
    mobile: body.mobile || '',
    idCardNo: body.idCardNo || '',
    province: body.province || '',
    provinceCode: body.provinceCode || '',
    city: body.city || '',
    cityCode: body.cityCode || '',
    district: body.district || '',
    districtCode: body.districtCode || '',
    organization: body.organization || '',
    organizationId: optionalNumber(body.organizationId),
    positionTitle: body.positionTitle || '',
    practiceTypeId: optionalNumber(body.practiceTypeId),
    status: String(body.status ?? '1'),
  }
}

function normalizeCommonStatus(value, fallback = '1') {
  return String(value ?? fallback)
}

function pickName(data, keys, fallback) {
  for (const key of keys) {
    if (data?.[key]) return data[key]
  }
  return fallback
}

async function fetchNameMap(ids, path, keys, request) {
  const uniqueIds = [...new Set(ids.filter((id) => id !== null && id !== undefined && id !== ''))]
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const result = await request(path.replace('{id}', encodeURIComponent(id)))
        return [String(id), pickName(result.data, keys, id)]
      } catch {
        return [String(id), id]
      }
    }),
  )

  return Object.fromEntries(entries)
}

const idListFields = [
  {
    key: 'ids',
    label: 'ID 列表',
    type: 'textarea',
    placeholder: '多个 ID 用英文逗号分隔',
    transform: (value) =>
      String(value || '')
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean),
  },
]

export const menuGroups = [
  {
    title: '账户管理',
    items: [
      { title: '用户管理', route: '/account/users', resource: 'users' },
      { title: '学员管理', route: '/account/students', resource: 'students' },
    ],
  },
  {
    title: '系统管理',
    items: [
      { title: '管理员管理', route: '/system/admins', resource: 'admins' },
      { title: '角色管理', route: '/system/roles', resource: 'roles' },
      { title: '权限列表', route: '/system/permissions', resource: 'permissions' },
      { title: '审计记录', route: '/system/audit-records', resource: 'auditRecords' },
    ],
  },
  {
    title: '基础数据',
    items: [
      { title: '机构管理', route: '/references/organizations', resource: 'organizations' },
      { title: '执业类型', route: '/references/practice-types', resource: 'practiceTypes' },
    ],
  },
  {
    title: '首页管理',
    items: [
      { title: '分类管理', route: '/home/categories', resource: 'homeCategories' },
      { title: '首页内容', route: '/home/contents', resource: 'homeContents' },
    ],
  },
  {
    title: '课程管理',
    items: [
      { title: '课程列表', route: '/courses', resource: 'courses' },
      { title: '课程视频', route: '/courses/videos', resource: 'courseVideos' },
      { title: '考卷管理', route: '/courses/exam-papers', resource: 'examPapers' },
    ],
  },
  {
    title: '图书管理',
    items: [
      { title: '图书列表', route: '/books', resource: 'books' },
      { title: '图书分类', route: '/books/categories', resource: 'bookCategories' },
      { title: '图书章节', route: '/books/chapters', resource: 'bookChapters' },
    ],
  },
  {
    title: '内容管理',
    items: [
      { title: '资讯管理', route: '/content/articles', resource: 'articles' },
      { title: '播客管理', route: '/content/podcasts', resource: 'podcasts' },
      { title: '播客音频', route: '/content/podcast-audios', resource: 'podcastAudios' },
      { title: '专题管理', route: '/content/topics', resource: 'topics' },
    ],
  },
  {
    title: '专家管理',
    items: [
      { title: '专家列表', route: '/experts', resource: 'experts' },
      { title: '专家分类', route: '/experts/categories', resource: 'expertCategories' },
    ],
  },
  {
    title: '题库管理',
    items: [
      { title: '题目管理', route: '/questions', resource: 'questions' },
      { title: '题库分类', route: '/questions/categories', resource: 'questionCategories' },
    ],
  },
  {
    title: '统计管理',
    items: [
      { title: '学时统计', route: '/statistics/study-hours', resource: 'studyHoursStats' },
      { title: '学员统计', route: '/statistics/students', resource: 'studentStats' },
      { title: '地区统计', route: '/statistics/regions', resource: 'regionStats' },
      { title: '成绩统计', route: '/statistics/exam-scores', resource: 'examScoreStats' },
      { title: '互动统计', route: '/statistics/interactions', resource: 'interactionStats' },
    ],
  },
  {
    title: '直播管理',
    items: [
      { title: '直播列表', route: '/live-sessions', resource: 'liveSessions' },
      { title: '直播视频', route: '/live-sessions/videos', resource: 'liveSessionVideos' },
      { title: '直播流配置', route: '/live-sessions/streaming', resource: 'liveSessionStreaming' },
    ],
  },
  {
    title: '答疑管理',
    items: [{ title: '答疑列表', route: '/qa/questions', resource: 'qaQuestions' }],
  },
  {
    title: '反馈管理',
    items: [{ title: '反馈列表', route: '/feedbacks', resource: 'feedbacks' }],
  },
  {
    title: '知识库',
    items: [
      { title: '知识条目', route: '/knowledge/entries', resource: 'knowledgeEntries' },
      { title: '知识分类', route: '/knowledge/categories', resource: 'knowledgeCategories' },
    ],
  },
]

const baseFields = [
  { key: 'id', label: 'ID', readonly: true },
  { key: 'title', label: '标题' },
  { key: 'name', label: '名称' },
  { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
  { key: 'sortOrder', label: '排序', type: 'number' },
]

function resource(config) {
  return {
    searchable: true,
    pageSize: 10,
    fields: baseFields,
    actions: [],
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fieldLabels: commonFieldLabels,
    valueMaps: commonValueMaps,
    ...config,
  }
}

export const resources = {
  users: resource({
    title: '用户管理',
    description: '查看和修改小程序端用户信息，可维护状态、身份、学员绑定、地区和机构信息。',
    api: {
      list: '/api/v1/admin/users',
      detail: '/api/v1/admin/users/{id}',
      update: '/api/v1/admin/users/{id}',
    },
    allowCreate: false,
    allowDelete: false,
    useDetailForEdit: true,
    bodyTransform: normalizeUserUpdateBody,
    valueMaps: userValueMaps,
    linkActions: [
      { label: '学员信息', path: '/account/students', paramKey: 'studentId', queryKey: 'keyword' },
    ],
    columns: ['id', 'avatarUrl', 'username', 'nickname', 'mobile', 'email', 'role', 'studentName', 'status', 'registeredAt'],
    fields: [
      { key: 'nickname', label: '昵称', required: true },
      { key: 'profileSignature', label: '个人签名', type: 'textarea', required: true },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions, defaultValue: '1', required: true },
      { key: 'role', label: '用户身份', type: 'select', options: userRoleOptions, defaultValue: 'NORMAL', required: true },
      { key: 'studentId', label: '绑定学员 ID', type: 'number' },
      { key: 'province', label: '省份' },
      { key: 'city', label: '城市' },
      { key: 'district', label: '区县' },
      { key: 'organization', label: '机构' },
      { key: 'practiceTypeName', label: '执业类型' },
    ],
    actions: [
      {
        label: '修改状态',
        api: '/api/v1/admin/users/{id}/status',
        method: 'PATCH',
        fields: [{ key: 'status', label: '状态', type: 'select', options: commonStatusOptions }],
      },
    ],
  }),
  organizations: resource({
    title: '机构管理',
    api: {
      list: '/api/v1/admin/references/organizations',
      detail: '/api/v1/admin/references/organizations/{id}',
      create: '/api/v1/admin/references/organizations',
      update: '/api/v1/admin/references/organizations/{id}',
      delete: '/api/v1/admin/references/organizations/{id}',
    },
    columns: ['id', 'orgCode', 'orgName', 'orgType', 'provinceCode', 'cityCode', 'districtCode', 'status', 'sortOrder'],
    fields: [
      { key: 'orgCode', label: '机构编码' },
      { key: 'orgName', label: '机构名称' },
      { key: 'orgType', label: '机构类型' },
      { key: 'provinceCode', label: '省份编码' },
      { key: 'cityCode', label: '城市编码' },
      { key: 'districtCode', label: '区县编码' },
      { key: 'address', label: '地址' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
      { key: 'sortOrder', label: '排序', type: 'number' },
    ],
  }),
  practiceTypes: resource({
    title: '执业类型',
    api: {
      list: '/api/v1/admin/references/practice-types',
      detail: '/api/v1/admin/references/practice-types/{id}',
      create: '/api/v1/admin/references/practice-types',
      update: '/api/v1/admin/references/practice-types/{id}',
      delete: '/api/v1/admin/references/practice-types/{id}',
    },
    columns: ['id', 'typeCode', 'typeName', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'typeCode', label: '类型编码' },
      { key: 'typeName', label: '类型名称' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
      { key: 'sortOrder', label: '排序', type: 'number' },
    ],
  }),
  students: resource({
    title: '学员管理',
    description: '查看、新增、维护和删除学员信息，可审核学员认证。',
    api: {
      list: '/api/v1/admin/students',
      detail: '/api/v1/admin/students/{id}',
      create: '/api/v1/admin/students',
      update: '/api/v1/admin/students/{id}',
      delete: '/api/v1/admin/students/{id}',
    },
    bodyTransform: normalizeStudentUpsertBody,
    useDetailForEdit: true,
    valueMaps: studentValueMaps,
    async enrichRecords(records, { request }) {
      const userAvatars = await Promise.all(
        [...new Set(records.map((record) => record.userId).filter((id) => id !== null && id !== undefined && id !== ''))].map(async (userId) => {
          try {
            const result = await request(`/api/v1/admin/users/${encodeURIComponent(userId)}`)
            return [String(userId), result?.data?.avatarUrl || '']
          } catch {
            return [String(userId), '']
          }
        }),
      )

      const avatarMap = Object.fromEntries(userAvatars)
      return records.map((record) => ({
        ...record,
        avatarUrl: record.avatarUrl || avatarMap[String(record.userId)] || '',
      }))
    },
    columns: ['id', 'avatarUrl', 'studentNo', 'realName', 'gender', 'age', 'mobile', 'province', 'city', 'certificationStatus', 'status'],
    fields: [
      { key: 'studentNo', label: '学员编号' },
      { key: 'realName', label: '真实姓名', required: true },
      { key: 'gender', label: '性别', type: 'select', options: enumGenderOptions, defaultValue: '0', required: true },
      { key: 'age', label: '年龄', type: 'number', defaultValue: 0, min: 0, required: true },
      { key: 'educationLevel', label: '学历' },
      { key: 'mobile', label: '手机号' },
      { key: 'idCardNo', label: '身份证号' },
      { key: 'province', label: '省份' },
      { key: 'provinceCode', label: '省份编码' },
      { key: 'city', label: '城市' },
      { key: 'cityCode', label: '城市编码' },
      { key: 'district', label: '区县' },
      { key: 'districtCode', label: '区县编码' },
      { key: 'organization', label: '机构' },
      { key: 'organizationId', label: '机构 ID', type: 'number' },
      { key: 'positionTitle', label: '职称' },
      { key: 'practiceTypeId', label: '执业类型 ID', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: userStatusOptions, defaultValue: '1', required: true },
    ],
    actions: [
      {
        label: '审核认证',
        api: '/api/v1/admin/students/{id}/certification',
        method: 'PATCH',
        fields: [
          {
            key: 'certificationStatus',
            label: '认证状态',
            type: 'select',
            options: enumCertificationStatusOptions,
          },
          { key: 'rejectReason', label: '拒绝原因', type: 'textarea' },
        ],
      },
    ],
    toolbarActions: [
      {
        label: '批量删除学员',
        api: '/api/v1/admin/students/batch-delete',
        method: 'POST',
        wrapArrayKey: 'ids',
        fields: idListFields,
      },
      { label: '导入学员', api: '/api/v1/admin/students/import', method: 'POST', fileUpload: true, accept: '.xlsx,.xls', fileFieldName: 'file' },
      { label: '导出学员', api: '/api/v1/admin/students/export', method: 'GET', resultOnly: true, fileDownload: true, fileName: 'students-export.xlsx', queryKeys: ['status', 'certificationStatus'] },
    ],
  }),
  admins: resource({
    title: '管理员管理',
    description: '新增、修改管理员，维护状态、重置密码、绑定角色。',
    api: {
      list: '/api/v1/admin/system/admins',
      detail: '/api/v1/admin/system/admins/{id}',
      create: '/api/v1/admin/system/admins',
      update: '/api/v1/admin/system/admins/{id}',
      delete: '/api/v1/admin/system/admins/{id}',
    },
    bodyTransform: (body) => ({
      username: body.username || '',
      password: body.password || '',
      realName: body.realName || '',
      mobile: body.mobile || '',
      email: body.email || '',
      avatarUrl: body.avatarUrl || '',
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'avatarUrl', 'username', 'realName', 'mobile', 'email', 'status', 'lastLoginAt'],
    fields: [
      { key: 'username', label: '用户名' },
      { key: 'password', label: '密码', type: 'password' },
      { key: 'realName', label: '姓名' },
      { key: 'mobile', label: '手机号' },
      { key: 'email', label: '邮箱' },
      { key: 'avatarUrl', label: '头像' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
    actions: [
      {
        label: '修改状态',
        api: '/api/v1/admin/system/admins/{id}/status',
        method: 'PATCH',
        fields: [{ key: 'status', label: '状态', type: 'select', options: commonStatusOptions }],
      },
      {
        label: '重置密码',
        api: '/api/v1/admin/system/admins/{id}/password/reset',
        method: 'PATCH',
        fields: [{ key: 'password', label: '新密码', type: 'password' }],
      },
      {
        label: '绑定角色',
        api: '/api/v1/admin/system/admins/{id}/roles',
        method: 'PUT',
        wrapArrayKey: 'ids',
        fields: idListFields,
      },
    ],
  }),
  roles: resource({
    title: '角色管理',
    description: '维护角色信息、状态并绑定权限。',
    api: {
      list: '/api/v1/admin/system/roles',
      detail: '/api/v1/admin/system/roles/{id}',
      create: '/api/v1/admin/system/roles',
      update: '/api/v1/admin/system/roles/{id}',
      delete: '/api/v1/admin/system/roles/{id}',
    },
    bodyTransform: (body) => ({
      roleCode: body.roleCode || '',
      roleName: body.roleName || '',
      description: body.description || '',
      status: normalizeCommonStatus(body.status),
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
    }),
    columns: ['id', 'roleCode', 'roleName', 'description', 'status', 'sortOrder'],
    fields: [
      { key: 'roleCode', label: '角色编码' },
      { key: 'roleName', label: '角色名称' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
      { key: 'sortOrder', label: '排序', type: 'number' },
    ],
    actions: [
      {
        label: '修改状态',
        api: '/api/v1/admin/system/roles/{id}/status',
        method: 'PATCH',
        fields: [{ key: 'status', label: '状态', type: 'select', options: commonStatusOptions }],
      },
      {
        label: '绑定权限',
        api: '/api/v1/admin/system/roles/{id}/permissions',
        method: 'PUT',
        wrapArrayKey: 'ids',
        fields: idListFields,
      },
    ],
  }),
  permissions: resource({
    title: '权限列表',
    description: '查看系统权限配置。',
    api: { list: '/api/v1/admin/system/permissions' },
    columns: ['id', 'permissionCode', 'permissionName', 'permissionType', 'routePath', 'apiMethod', 'apiPath'],
    readonly: true,
  }),
  auditRecords: resource({
    title: '审计记录',
    description: '查看后台操作审计记录。',
    api: { list: '/api/v1/admin/system/audit-records' },
    columns: ['id', 'targetTypeLabel', 'targetId', 'beforeStatusLabel', 'afterStatusLabel', 'auditorName', 'auditedAt'],
    readonly: true,
  }),
  homeCategories: resource({
    title: '首页分类',
    api: {
      list: '/api/v1/admin/content/home/categories',
      create: '/api/v1/admin/content/home/categories',
      update: '/api/v1/admin/content/home/categories/{id}',
      delete: '/api/v1/admin/content/home/categories/{id}',
    },
    bodyTransform: (body) => ({
      parentId: optionalNumber(body.parentId),
      categoryName: body.categoryName || '',
      categoryCode: body.categoryCode || '',
      iconUrl: body.iconUrl || '',
      description: body.description || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'categoryName', 'categoryCode', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
      { key: 'categoryCode', label: '分类编码' },
      { key: 'iconUrl', label: '图标 URL' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  homeContents: resource({
    title: '首页内容',
    api: {
      list: '/api/v1/admin/content/home/contents',
      create: '/api/v1/admin/content/home/contents',
      update: '/api/v1/admin/content/home/contents/{id}',
      delete: '/api/v1/admin/content/home/contents/{id}',
    },
    bodyTransform: (body) => ({
      categoryId: optionalNumber(body.categoryId),
      contentType: body.contentType || '',
      targetId: optionalNumber(body.targetId),
      title: body.title || '',
      coverUrl: body.coverUrl || '',
      linkUrl: body.linkUrl || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      startAt: body.startAt || null,
      endAt: body.endAt || null,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'title', 'contentTypeLabel', 'targetTitle', 'targetAvailable', 'categoryId', 'status', 'sortOrder'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'contentType', label: '内容类型', type: 'select', options: [
        { label: '课程', value: 'course' },
        { label: '图书', value: 'book' },
        { label: '播客', value: 'podcast' },
        { label: '专题', value: 'topic' },
        { label: '直播', value: 'live' },
      ] },
      { key: 'targetId', label: '目标 ID', type: 'number' },
      { key: 'title', label: '标题' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'home-content-cover' },
      { key: 'linkUrl', label: '链接 URL' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'startAt', label: '开始时间', type: 'datetime-local' },
      { key: 'endAt', label: '结束时间', type: 'datetime-local' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  courses: resource({
    title: '课程列表',
    api: {
      list: '/api/v1/admin/learning/courses',
      detail: '/api/v1/admin/learning/courses/{id}',
      create: '/api/v1/admin/learning/courses',
      update: '/api/v1/admin/learning/courses/{id}',
      delete: '/api/v1/admin/learning/courses/{id}',
    },
    bodyTransform: (body) => ({
      courseName: body.courseName || '',
      subtitle: body.subtitle || '',
      coverUrl: body.coverUrl || '',
      lecturerName: body.lecturerName || '',
      introduction: body.introduction || '',
      paperId: optionalNumber(body.paperId),
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'courseName', 'lecturerName', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'courseName', label: '课程名称' },
      { key: 'subtitle', label: '副标题' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'course-cover' },
      { key: 'lecturerName', label: '讲师' },
      { key: 'introduction', label: '简介', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    linkActions: [{ label: '课程视频', path: '/courses/videos', paramKey: 'id', queryKey: 'courseId' }],
    actions: [{ label: '审核', api: '/api/v1/admin/learning/courses/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  courseVideos: resource({
    title: '课程视频',
    description: '需要输入课程 ID 查询对应视频；新增视频接口已提供。',
    api: {
      list: '/api/v1/admin/learning/courses/{courseId}/videos',
      create: '/api/v1/admin/learning/courses/videos',
      update: '/api/v1/admin/learning/courses/videos/{id}',
      delete: '/api/v1/admin/learning/courses/videos/{id}',
    },
    bodyTransform: (body) => ({
      courseId: optionalNumber(body.courseId),
      title: body.title || '',
      paperId: optionalNumber(body.paperId),
      videoUrl: body.videoUrl || '',
      durationSeconds: optionalNumber(body.durationSeconds) ?? 0,
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    pathParams: [{ key: 'courseId', label: '课程 ID', required: true }],
    columns: ['id', 'courseId', 'title', 'paperId', 'videoUrl', 'durationSeconds', 'sortOrder', 'status'],
    fields: [
      { key: 'courseId', label: '课程 ID', type: 'number' },
      { key: 'title', label: '视频标题' },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'videoUrl', label: '视频 URL' },
      { key: 'durationSeconds', label: '时长秒数', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  books: resource({
    title: '图书列表',
    api: {
      list: '/api/v1/admin/learning/books',
      detail: '/api/v1/admin/learning/books/{id}',
      create: '/api/v1/admin/learning/books',
      update: '/api/v1/admin/learning/books/{id}',
      delete: '/api/v1/admin/learning/books/{id}',
    },
    bodyTransform: (body) => ({
      categoryId: optionalNumber(body.categoryId),
      bookName: body.bookName || '',
      author: body.author || '',
      publisher: body.publisher || '',
      coverUrl: body.coverUrl || '',
      introduction: body.introduction || '',
      totalPages: optionalNumber(body.totalPages) ?? 0,
      paperId: optionalNumber(body.paperId),
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'bookName', 'author', 'totalPages', 'categoryId', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'bookName', label: '图书名称' },
      { key: 'author', label: '作者' },
      { key: 'publisher', label: '出版社' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'book-cover' },
      { key: 'totalPages', label: '总页数', type: 'number', min: 0 },
      { key: 'introduction', label: '简介', type: 'textarea' },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    linkActions: [{ label: '图书章节', path: '/books/chapters', paramKey: 'id', queryKey: 'bookId' }],
    actions: [{ label: '审核', api: '/api/v1/admin/learning/books/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  bookCategories: resource({
    title: '图书分类',
    api: {
      list: '/api/v1/admin/learning/book-categories',
      create: '/api/v1/admin/learning/book-categories',
      update: '/api/v1/admin/learning/book-categories/{id}',
      delete: '/api/v1/admin/learning/book-categories/{id}',
    },
    bodyTransform: (body) => ({
      parentId: optionalNumber(body.parentId),
      categoryName: body.categoryName || '',
      description: body.description || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'categoryName', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  bookChapters: resource({
    title: '图书章节',
    api: {
      list: '/api/v1/admin/learning/books/{bookId}/chapters',
      create: '/api/v1/admin/learning/books/chapters',
      update: '/api/v1/admin/learning/books/chapters/{id}',
      delete: '/api/v1/admin/learning/books/chapters/{id}',
    },
    bodyTransform: (body) => ({
      bookId: optionalNumber(body.bookId),
      parentId: optionalNumber(body.parentId),
      chapterTitle: body.chapterTitle || '',
      content: body.content || '',
      startPage: optionalNumber(body.startPage),
      pageCount: optionalNumber(body.pageCount) ?? 0,
      paperId: optionalNumber(body.paperId),
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    pathParams: [{ key: 'bookId', label: '图书 ID', required: true }],
    columns: ['id', 'bookId', 'chapterTitle', 'startPage', 'pageCount', 'parentId', 'paperId', 'sortOrder', 'status'],
    fields: [
      { key: 'bookId', label: '图书 ID', type: 'number' },
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'chapterTitle', label: '章节名称' },
      { key: 'content', label: '内容', type: 'textarea' },
      { key: 'startPage', label: '起始页', type: 'number', min: 1 },
      { key: 'pageCount', label: '页数', type: 'number', min: 0 },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  examPapers: resource({
    title: '考卷管理',
    api: {
      list: '/api/v1/admin/learning/exam-papers',
      detail: '/api/v1/admin/learning/exam-papers/{id}',
      create: '/api/v1/admin/learning/exam-papers',
      update: '/api/v1/admin/learning/exam-papers/{id}',
      delete: '/api/v1/admin/learning/exam-papers/{id}',
    },
    bodyTransform: (body) => ({
      paperName: body.paperName || '',
      description: body.description || '',
      totalScore: optionalNumber(body.totalScore) ?? 0,
      passScore: optionalNumber(body.passScore) ?? 0,
      durationMinutes: optionalNumber(body.durationMinutes) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'paperName', 'totalScore', 'passScore', 'durationMinutes', 'status'],
    fields: [
      { key: 'paperName', label: '考卷名称' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'totalScore', label: '总分', type: 'number' },
      { key: 'passScore', label: '及格分', type: 'number' },
      { key: 'durationMinutes', label: '考试时长', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
    actions: [
      {
        label: '替换题目',
        api: '/api/v1/admin/learning/exam-papers/{id}/questions',
        method: 'PUT',
        fields: [{ key: 'questions', label: '题目 JSON 数组', type: 'json', placeholder: '[{\"questionId\":1,\"sortOrder\":1}]' }],
      },
    ],
  }),
  articles: resource({
    title: '资讯管理',
    api: {
      list: '/api/v1/admin/content/articles',
      create: '/api/v1/admin/content/articles',
      update: '/api/v1/admin/content/articles/{id}',
      delete: '/api/v1/admin/content/articles/{id}',
    },
    bodyTransform: (body) => ({
      title: body.title || '',
      summary: body.summary || '',
      coverUrl: body.coverUrl || '',
      content: body.content || '',
      authorName: body.authorName || '',
      source: body.source || '',
      tags: body.tags || [],
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'title', 'authorName', 'viewCount', 'reviewStatus', 'publishStatus', 'publishedAt'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'article-cover' },
      { key: 'content', label: '正文', type: 'textarea' },
      { key: 'authorName', label: '作者' },
      { key: 'source', label: '来源' },
      { key: 'tags', label: '标签 JSON 数组', type: 'json', placeholder: '[\"养生\",\"针灸\"]' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    actions: [{ label: '审核', api: '/api/v1/admin/content/articles/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  podcasts: resource({
    title: '播客管理',
    api: {
      list: '/api/v1/admin/content/podcasts',
      create: '/api/v1/admin/content/podcasts',
      update: '/api/v1/admin/content/podcasts/{id}',
      delete: '/api/v1/admin/content/podcasts/{id}',
    },
    bodyTransform: (body) => ({
      title: body.title || '',
      summary: body.summary || '',
      coverUrl: body.coverUrl || '',
      speakerName: body.speakerName || '',
      tags: body.tags || [],
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'title', 'speakerName', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'podcast-cover' },
      { key: 'speakerName', label: '主讲人' },
      { key: 'tags', label: '标签 JSON 数组', type: 'json', placeholder: '[\"夜读\",\"经络\"]' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    linkActions: [{ label: '播客音频', path: '/content/podcast-audios', paramKey: 'id', queryKey: 'podcastId' }],
    actions: [{ label: '审核', api: '/api/v1/admin/content/podcasts/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  podcastAudios: resource({
    title: '播客音频',
    api: {
      list: '/api/v1/admin/content/podcasts/{podcastId}/audios',
      create: '/api/v1/admin/content/podcasts/audios',
      update: '/api/v1/admin/content/podcasts/audios/{id}',
      delete: '/api/v1/admin/content/podcasts/audios/{id}',
    },
    bodyTransform: (body) => ({
      podcastId: optionalNumber(body.podcastId),
      title: body.title || '',
      paperId: optionalNumber(body.paperId),
      audioUrl: body.audioUrl || '',
      durationSeconds: optionalNumber(body.durationSeconds) ?? 0,
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    pathParams: [{ key: 'podcastId', label: '播客 ID', required: true }],
    columns: ['id', 'podcastId', 'title', 'paperId', 'audioUrl', 'durationSeconds', 'sortOrder', 'status'],
    fields: [
      { key: 'podcastId', label: '播客 ID', type: 'number' },
      { key: 'title', label: '音频标题' },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'audioUrl', label: '音频 URL' },
      { key: 'durationSeconds', label: '时长秒数', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  topics: resource({
    title: '专题管理',
    api: {
      list: '/api/v1/admin/content/topics',
      create: '/api/v1/admin/content/topics',
      update: '/api/v1/admin/content/topics/{id}',
      delete: '/api/v1/admin/content/topics/{id}',
    },
    bodyTransform: (body) => ({
      title: body.title || '',
      summary: body.summary || '',
      learningRequirements: body.learningRequirements || '',
      coverUrl: body.coverUrl || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'title', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'learningRequirements', label: '学习要求', type: 'textarea' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'topic-cover' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    actions: [
      { label: '审核', api: '/api/v1/admin/content/topics/{id}/review', method: 'PATCH', fields: auditFields },
      {
        label: '配置关联项',
        api: '/api/v1/admin/content/topics/{id}/items',
        method: 'PUT',
        fields: [{ key: 'items', label: '关联项 JSON 数组', type: 'json', placeholder: '[{\"itemType\":\"course\",\"itemId\":1,\"sortOrder\":1}]' }],
      },
    ],
  }),
  files: resource({
    title: '文件资源',
    api: {
      list: '/api/v1/admin/content/files',
      create: '/api/v1/admin/content/files',
      delete: '/api/v1/admin/content/files/{id}',
    },
    allowEdit: false,
    columns: ['id', 'fileName', 'fileUrl', 'fileType', 'fileSize', 'createdAt'],
    fields: [
      { key: 'fileName', label: '文件名' },
      { key: 'fileUrl', label: '文件 URL' },
      { key: 'fileType', label: '文件类型' },
      { key: 'fileSize', label: '文件大小', type: 'number' },
    ],
  }),
  experts: resource({
    title: '专家管理',
    description: '维护专家基础资料、封面、履历和分类关系。',
    api: {
      list: '/api/v1/admin/experts',
      detail: '/api/v1/admin/experts/{id}',
      create: '/api/v1/admin/experts',
      update: '/api/v1/admin/experts/{id}',
      delete: '/api/v1/admin/experts/{id}',
    },
    bodyTransform: (body) => ({
      userId: optionalNumber(body.userId),
      realName: body.realName || '',
      coverUrl: body.coverUrl || '',
      gender: String(body.gender ?? '0'),
      birthDate: body.birthDate || null,
      mobile: body.mobile || '',
      title: body.title || '',
      organization: body.organization || '',
      organizationId: optionalNumber(body.organizationId),
      practiceTypeId: optionalNumber(body.practiceTypeId),
      specialty: body.specialty || '',
      introduction: body.introduction || '',
      status: normalizeCommonStatus(body.status),
      consultEnabled: normalizeCommonStatus(body.consultEnabled),
      consultationNotice: body.consultationNotice || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
    }),
    detailHiddenFields: ['avatarUrl'],
    columns: ['id', 'coverUrl', 'realName', 'gender', 'mobile', 'title', 'organization', 'status', 'consultEnabled', 'sortOrder'],
    fields: [
      { key: 'userId', label: '绑定用户 ID', type: 'number' },
      { key: 'realName', label: '姓名' },
      { key: 'coverUrl', label: '专家头像', type: 'cover-upload', usage: 'expert-cover' },
      { key: 'gender', label: '性别', type: 'select', options: enumGenderOptions },
      { key: 'birthDate', label: '出生日期', type: 'date' },
      { key: 'mobile', label: '手机号' },
      { key: 'title', label: '职称' },
      { key: 'organization', label: '机构' },
      { key: 'organizationId', label: '机构 ID', type: 'number' },
      { key: 'practiceTypeId', label: '执业类型 ID', type: 'number' },
      { key: 'specialty', label: '擅长' },
      { key: 'introduction', label: '简介', type: 'textarea' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
      { key: 'consultEnabled', label: '是否可咨询', type: 'select', options: commonStatusOptions },
      { key: 'consultationNotice', label: '咨询须知', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
    ],
    actions: [
      {
        label: '替换分类',
        api: '/api/v1/admin/experts/{id}/categories',
        method: 'PUT',
        fields: idListFields,
      },
      {
        label: '替换履历',
        api: '/api/v1/admin/experts/{id}/experiences',
        method: 'PUT',
        fields: [{ key: 'experiences', label: '履历 JSON 数组', type: 'json', placeholder: '[{\"title\":\"主任医师\",\"description\":\"...\"}]' }],
      },
    ],
  }),
  expertCategories: resource({
    title: '专家分类',
    api: {
      list: '/api/v1/admin/experts/categories',
      create: '/api/v1/admin/experts/categories',
      update: '/api/v1/admin/experts/categories/{id}',
      delete: '/api/v1/admin/experts/categories/{id}',
    },
    bodyTransform: (body) => ({
      parentId: optionalNumber(body.parentId),
      categoryName: body.categoryName || '',
      description: body.description || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'categoryName', 'parentCategoryName', 'level', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级分类 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  questions: resource({
    title: '题目管理',
    api: {
      list: '/api/v1/admin/learning/questions',
      detail: '/api/v1/admin/learning/questions/{id}',
      create: '/api/v1/admin/learning/questions',
      update: '/api/v1/admin/learning/questions/{id}',
      delete: '/api/v1/admin/learning/questions/{id}',
    },
    bodyTransform: (body) => ({
      categoryId: optionalNumber(body.categoryId),
      questionType: String(body.questionType ?? '1'),
      title: body.title || '',
      analysis: body.analysis || '',
      difficulty: String(body.difficulty ?? '1'),
      score: body.score === '' || body.score === null || body.score === undefined ? 0 : Number(body.score),
      status: normalizeCommonStatus(body.status),
      options: body.options || [],
    }),
    columns: ['id', 'title', 'questionType', 'difficulty', 'score', 'status'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'questionType', label: '题型', type: 'select', options: [{ label: '单选', value: '1' }, { label: '多选', value: '2' }, { label: '判断', value: '3' }, { label: '问答', value: '4' }] },
      { key: 'title', label: '题干', type: 'textarea' },
      { key: 'analysis', label: '解析', type: 'textarea' },
      { key: 'difficulty', label: '难度', type: 'select', options: [{ label: '低', value: '1' }, { label: '中', value: '2' }, { label: '高', value: '3' }] },
      { key: 'score', label: '分值', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
      { key: 'options', label: '选项 JSON 数组', type: 'json', placeholder: '[{\"optionKey\":\"A\",\"optionContent\":\"选项\",\"correct\":true,\"sortOrder\":1}]' },
    ],
    actions: [
      {
        label: '替换选项',
        api: '/api/v1/admin/learning/questions/{id}/options',
        method: 'PUT',
        fields: [{ key: 'options', label: '选项 JSON 数组', type: 'json', placeholder: '[{\"optionKey\":\"A\",\"optionContent\":\"选项\",\"correct\":true,\"sortOrder\":1}]' }],
      },
    ],
  }),
  questionCategories: resource({
    title: '题库分类',
    api: {
      list: '/api/v1/admin/learning/question-categories',
      create: '/api/v1/admin/learning/question-categories',
      update: '/api/v1/admin/learning/question-categories/{id}',
      delete: '/api/v1/admin/learning/question-categories/{id}',
    },
    bodyTransform: (body) => ({
      parentId: optionalNumber(body.parentId),
      categoryName: body.categoryName || '',
      description: body.description || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'categoryName', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  liveSessions: resource({
    title: '直播管理',
    api: {
      list: '/api/v1/admin/live-sessions',
      detail: '/api/v1/admin/live-sessions/{id}',
      create: '/api/v1/admin/live-sessions',
      update: '/api/v1/admin/live-sessions/{id}',
      delete: '/api/v1/admin/live-sessions/{id}',
    },
    bodyTransform: (body) => ({
      title: body.title || '',
      coverUrl: body.coverUrl || '',
      speakerName: body.speakerName || '',
      anchorName: body.anchorName || '',
      tags: body.tags || [],
      liveUrl: body.liveUrl || '',
      playbackUrl: body.playbackUrl || '',
      startAt: body.startAt || null,
      endAt: body.endAt || null,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      liveStatus: normalizeCommonStatus(body.liveStatus, '0'),
    }),
    columns: ['id', 'coverUrl', 'title', 'speakerName', 'anchorName', 'reviewStatus', 'liveStatus', 'startAt', 'endAt'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'live-cover' },
      { key: 'speakerName', label: '主讲人' },
      { key: 'anchorName', label: '主播' },
      { key: 'tags', label: '标签 JSON 数组', type: 'json', placeholder: '[\"直播\",\"答疑\"]' },
      { key: 'liveUrl', label: '直播 URL' },
      { key: 'playbackUrl', label: '回放 URL' },
      { key: 'startAt', label: '开始时间', type: 'datetime-local' },
      { key: 'endAt', label: '结束时间', type: 'datetime-local' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'liveStatus', label: '直播状态', type: 'select', options: [{ label: '未开始', value: '0' }, { label: '直播中', value: '1' }, { label: '已结束', value: '2' }, { label: '已取消', value: '3' }] },
    ],
    actions: [{ label: '审核', api: '/api/v1/admin/live-sessions/{id}/review', method: 'PATCH', fields: auditFields }],
    toolbarActions: [
      {
        label: '批量删除直播',
        api: '/api/v1/admin/live-sessions/batch-delete',
        method: 'POST',
        wrapArrayKey: 'ids',
        fields: idListFields,
      },
    ],
    linkActions: [
      { label: '直播视频', path: '/live-sessions/videos', paramKey: 'id', queryKey: 'liveSessionId' },
      { label: '流配置', path: '/live-sessions/streaming', paramKey: 'id', queryKey: 'id' },
    ],
  }),
  liveSessionStreaming: resource({
    title: '直播流配置',
    api: {
      list: '/api/v1/admin/live-sessions/{id}/streaming',
    },
    pathParams: [{ key: 'id', label: '直播 ID', required: true }],
    columns: ['streamName', 'publishUrl', 'httpFlvUrl', 'hlsUrl', 'callbackUrl', 'liveUrl', 'playbackUrl', 'reviewStatus', 'liveStatus'],
    readonly: true,
    singleResult: true,
  }),
  liveSessionVideos: resource({
    title: '直播视频',
    api: {
      list: '/api/v1/admin/live-sessions/{liveSessionId}/videos',
      create: '/api/v1/admin/live-sessions/videos',
      update: '/api/v1/admin/live-sessions/videos/{id}',
      delete: '/api/v1/admin/live-sessions/videos/{id}',
    },
    bodyTransform: (body) => ({
      liveSessionId: optionalNumber(body.liveSessionId),
      title: body.title || '',
      videoUrl: body.videoUrl || '',
      durationSeconds: optionalNumber(body.durationSeconds) ?? 0,
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    pathParams: [{ key: 'liveSessionId', label: '直播 ID', required: true }],
    columns: ['id', 'liveSessionId', 'title', 'videoUrl', 'durationSeconds', 'sortOrder', 'status'],
    fields: [
      { key: 'liveSessionId', label: '直播 ID', type: 'number' },
      { key: 'title', label: '视频标题' },
      { key: 'videoUrl', label: '视频地址' },
      { key: 'durationSeconds', label: '时长秒数', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  qaQuestions: resource({
    title: '答疑管理',
    api: {
      list: '/api/v1/admin/interaction/qa/questions',
      detail: '/api/v1/admin/interaction/qa/questions/{id}',
      delete: '/api/v1/admin/interaction/qa/questions/{id}',
    },
    columns: ['id', 'title', 'userName', 'expertName', 'status'],
    fields: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'title', label: '标题' },
      { key: 'userName', label: '用户' },
      { key: 'expertName', label: '专家' },
      { key: 'status', label: '状态', type: 'select', options: qaStatusOptions },
      { key: 'content', label: '问题内容', type: 'textarea' },
    ],
    detailHiddenFields: ['userId', 'studentId', 'expertId', 'expertCategoryId'],
    valueMaps: {
      ...commonValueMaps,
      status: Object.fromEntries(qaStatusOptions.map((item) => [item.value, item.label])),
    },
    async enrichRecords(records, { request }) {
      const userNames = await fetchNameMap(
        records.map((record) => record.userId),
        '/api/v1/admin/users/{id}',
        ['nickname', 'username', 'mobile'],
        request,
      )
      const expertNames = await fetchNameMap(
        records.map((record) => record.expertId),
        '/api/v1/admin/experts/{id}',
        ['realName', 'nickname', 'title'],
        request,
      )

      return records.map((record) => ({
        ...record,
        userName: record.userNickname || record.nickname || userNames[String(record.userId)] || record.userId,
        expertName: record.expertName || record.expertRealName || expertNames[String(record.expertId)] || record.expertId,
        status: record.statusLabel || record.statusCode || record.status,
      }))
    },
    readonly: true,
    actions: [
      {
        label: '回复',
        api: '/api/v1/admin/interaction/qa/questions/{id}/answers',
        method: 'POST',
        fields: [
          { key: 'expertId', label: '专家 ID', type: 'number' },
          { key: 'content', label: '回复内容', type: 'textarea' },
          { key: 'auditComment', label: '备注', type: 'textarea' },
        ],
      },
    ],
  }),
  feedbacks: resource({
    title: '反馈管理',
    api: {
      list: '/api/v1/admin/interaction/feedbacks',
      detail: '/api/v1/admin/interaction/feedbacks/{id}',
      delete: '/api/v1/admin/interaction/feedbacks/{id}',
    },
    columns: ['nickname', 'avatarUrl', 'mobile', 'feedbackType', 'contact', 'createdAt'],
    valueMaps: {
      ...commonValueMaps,
      status: Object.fromEntries(feedbackStatusOptions.map((item) => [item.value, item.label])),
    },
    readonly: true,
    actions: [{ label: '处理反馈', api: '/api/v1/admin/interaction/feedbacks/{id}/process', method: 'PATCH', fields: processFields }],
  }),
  knowledgeEntries: resource({
    title: '知识库条目',
    api: {
      list: '/api/v1/admin/knowledge/entries',
      detail: '/api/v1/admin/knowledge/entries/{id}',
      create: '/api/v1/admin/knowledge/entries',
      update: '/api/v1/admin/knowledge/entries/{id}',
      delete: '/api/v1/admin/knowledge/entries/{id}',
    },
    bodyTransform: (body) => ({
      categoryId: optionalNumber(body.categoryId),
      title: body.title || '',
      summary: body.summary || '',
      coverUrl: body.coverUrl || '',
      content: body.content || '',
      keywords: body.keywords || '',
      source: body.source || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      reviewStatus: normalizeCommonStatus(body.reviewStatus, '0'),
      publishStatus: normalizeCommonStatus(body.publishStatus, '0'),
      publishedAt: body.publishedAt || null,
    }),
    columns: ['id', 'title', 'categoryId', 'reviewStatus', 'publishStatus'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'coverUrl', label: '封面', type: 'cover-upload', usage: 'knowledge-cover' },
      { key: 'content', label: '内容', type: 'textarea' },
      { key: 'keywords', label: '关键词' },
      { key: 'source', label: '来源' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
    actions: [{ label: '审核', api: '/api/v1/admin/knowledge/entries/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  knowledgeCategories: resource({
    title: '知识库分类',
    api: {
      list: '/api/v1/admin/knowledge/categories',
      create: '/api/v1/admin/knowledge/categories',
      update: '/api/v1/admin/knowledge/categories/{id}',
      delete: '/api/v1/admin/knowledge/categories/{id}',
    },
    bodyTransform: (body) => ({
      parentId: optionalNumber(body.parentId),
      categoryName: body.categoryName || '',
      categoryCode: body.categoryCode || '',
      description: body.description || '',
      sortOrder: optionalNumber(body.sortOrder) ?? 0,
      status: normalizeCommonStatus(body.status),
    }),
    columns: ['id', 'categoryName', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
      { key: 'categoryCode', label: '分类编码' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
    ],
  }),
  studyHoursStats: resource({
    title: '学时统计',
    api: { list: '/api/v1/admin/statistics/study-hours/resources' },
    columns: ['resourceType', 'recordCount', 'studentCount', 'completedCount', 'totalStudyHours', 'averageProgressPercent'],
    readonly: true,
    toolbarActions: [
      {
        label: '查看汇总',
        api: '/api/v1/admin/statistics/study-hours/summary',
        method: 'GET',
        resultOnly: true,
      },
    ],
  }),
  studentStats: resource({
    title: '学员统计',
    api: { list: '/api/v1/admin/statistics/students/summary' },
    columns: ['totalStudents', 'enabledStudents', 'approvedStudents', 'pendingCertifications', 'rejectedCertifications', 'linkedUsers'],
    readonly: true,
    singleResult: true,
  }),
  regionStats: resource({
    title: '地区统计',
    api: { list: '/api/v1/admin/statistics/regions' },
    columns: ['province', 'city', 'studentCount', 'approvedStudentCount', 'enabledStudentCount'],
    readonly: true,
  }),
  examScoreStats: resource({
    title: '成绩统计',
    api: { list: '/api/v1/admin/statistics/exam-scores/papers' },
    columns: ['paperId', 'paperTitle', 'examCount', 'studentCount', 'passedCount', 'passRatePercent', 'averageScore'],
    readonly: true,
    toolbarActions: [
      {
        label: '查看汇总',
        api: '/api/v1/admin/statistics/exam-scores/summary',
        method: 'GET',
        resultOnly: true,
      },
    ],
  }),
  interactionStats: resource({
    title: '互动统计',
    api: { list: '/api/v1/admin/statistics/content-interactions' },
    columns: ['resourceType', 'resourceId', 'browseCount', 'favoriteCount', 'shareCount', 'uniqueBrowseUsers'],
    readonly: true,
  }),
}

export function getResourceByRoute(path) {
  const item = menuGroups.flatMap((group) => group.items).find((menuItem) => menuItem.route === path)
  return item ? resources[item.resource] : null
}
