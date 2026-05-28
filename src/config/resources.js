const commonStatusOptions = [
  { label: '禁用', value: '0' },
  { label: '启用', value: '1' },
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
  { key: 'auditComment', label: '审核意见', type: 'textarea' },
]

const processFields = [{ key: 'processNote', label: '处理备注', type: 'textarea' }]

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
      { title: '文件资源', route: '/content/files', resource: 'files' },
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
    items: [{ title: '直播列表', route: '/live-sessions', resource: 'liveSessions' }],
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
    ...config,
  }
}

export const resources = {
  users: resource({
    title: '用户管理',
    description: '查看小程序端用户信息，可维护用户状态。',
    api: {
      list: '/api/v1/admin/users',
      detail: '/api/v1/admin/users/{id}',
    },
    allowCreate: false,
    allowEdit: false,
    allowDelete: false,
    columns: ['id', 'username', 'nickname', 'mobile', 'email', 'status', 'registeredAt'],
    fields: [
      { key: 'id', label: 'ID', readonly: true },
      { key: 'username', label: '用户名' },
      { key: 'nickname', label: '昵称' },
      { key: 'mobile', label: '手机号' },
      { key: 'email', label: '邮箱' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
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
  students: resource({
    title: '学员管理',
    description: '查看和维护学员信息，认证审核接口已提供；新增、删除、导入、导出暂待后端接口加入。',
    api: {
      list: '/api/v1/admin/students',
      detail: '/api/v1/admin/students/{id}',
      update: '/api/v1/admin/students/{id}',
    },
    allowCreate: false,
    allowDelete: false,
    columns: ['id', 'studentNo', 'realName', 'mobile', 'province', 'city', 'certificationStatus', 'status'],
    fields: [
      { key: 'studentNo', label: '学员编号' },
      { key: 'realName', label: '真实姓名' },
      { key: 'mobile', label: '手机号' },
      { key: 'idCardNo', label: '身份证号' },
      { key: 'province', label: '省份' },
      { key: 'city', label: '城市' },
      { key: 'district', label: '区县' },
      { key: 'organization', label: '单位' },
      { key: 'positionTitle', label: '职称' },
      { key: 'status', label: '状态', type: 'select', options: commonStatusOptions },
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
            options: [
              { label: '未提交', value: '0' },
              { label: '审核中', value: '1' },
              { label: '已通过', value: '2' },
              { label: '已拒绝', value: '3' },
            ],
          },
          { key: 'auditComment', label: '审核意见', type: 'textarea' },
        ],
      },
    ],
    toolbarActions: [
      { label: '导入学员', pending: true },
      { label: '导出学员', pending: true },
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
    },
    allowDelete: false,
    columns: ['id', 'username', 'realName', 'mobile', 'email', 'status', 'lastLoginAt'],
    fields: [
      { key: 'username', label: '用户名' },
      { key: 'password', label: '密码', type: 'password' },
      { key: 'realName', label: '姓名' },
      { key: 'mobile', label: '手机号' },
      { key: 'email', label: '邮箱' },
      { key: 'avatarUrl', label: '头像 URL' },
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
    },
    allowDelete: false,
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
    columns: ['id', 'targetType', 'targetId', 'beforeStatus', 'afterStatus', 'auditorId', 'auditedAt'],
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
    columns: ['id', 'title', 'contentType', 'targetId', 'categoryId', 'status', 'sortOrder'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'contentType', label: '内容类型' },
      { key: 'targetId', label: '目标 ID', type: 'number' },
      { key: 'title', label: '标题' },
      { key: 'coverUrl', label: '封面 URL' },
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
    columns: ['id', 'courseName', 'lecturerName', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'courseName', label: '课程名称' },
      { key: 'subtitle', label: '副标题' },
      { key: 'coverUrl', label: '封面 URL' },
      { key: 'lecturerName', label: '讲师' },
      { key: 'introduction', label: '简介', type: 'textarea' },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
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
    pathParams: [{ key: 'courseId', label: '课程 ID', required: true }],
    columns: ['id', 'courseId', 'title', 'videoUrl', 'durationSeconds', 'sortOrder', 'status'],
    fields: [
      { key: 'courseId', label: '课程 ID', type: 'number' },
      { key: 'title', label: '视频标题' },
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
    columns: ['id', 'bookName', 'author', 'categoryId', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'bookName', label: '图书名称' },
      { key: 'author', label: '作者' },
      { key: 'publisher', label: '出版社' },
      { key: 'coverUrl', label: '封面 URL' },
      { key: 'introduction', label: '简介', type: 'textarea' },
      { key: 'paperId', label: '考卷 ID', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
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
    pathParams: [{ key: 'bookId', label: '图书 ID', required: true }],
    columns: ['id', 'bookId', 'chapterName', 'parentId', 'paperId', 'sortOrder', 'status'],
    fields: [
      { key: 'bookId', label: '图书 ID', type: 'number' },
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'chapterName', label: '章节名称' },
      { key: 'contentUrl', label: '内容 URL' },
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
    columns: ['id', 'title', 'authorName', 'reviewStatus', 'publishStatus', 'publishedAt'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'coverUrl', label: '封面 URL' },
      { key: 'content', label: '正文', type: 'textarea' },
      { key: 'authorName', label: '作者' },
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
    columns: ['id', 'title', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'coverUrl', label: '封面 URL' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
      { key: 'publishedAt', label: '发布时间', type: 'datetime-local' },
    ],
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
    pathParams: [{ key: 'podcastId', label: '播客 ID', required: true }],
    columns: ['id', 'podcastId', 'title', 'audioUrl', 'durationSeconds', 'sortOrder', 'status'],
    fields: [
      { key: 'podcastId', label: '播客 ID', type: 'number' },
      { key: 'title', label: '音频标题' },
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
    columns: ['id', 'title', 'reviewStatus', 'publishStatus', 'sortOrder'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'learningRequirements', label: '学习要求', type: 'textarea' },
      { key: 'coverUrl', label: '封面 URL' },
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
    api: {
      list: '/api/v1/admin/experts',
      detail: '/api/v1/admin/experts/{id}',
      create: '/api/v1/admin/experts',
      update: '/api/v1/admin/experts/{id}',
      delete: '/api/v1/admin/experts/{id}',
    },
    columns: ['id', 'realName', 'title', 'organization', 'status', 'consultEnabled', 'sortOrder'],
    fields: [
      { key: 'realName', label: '姓名' },
      { key: 'avatarUrl', label: '头像 URL' },
      { key: 'title', label: '职称' },
      { key: 'organization', label: '机构' },
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
    columns: ['id', 'categoryName', 'status', 'sortOrder'],
    fields: [
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
    columns: ['id', 'title', 'anchorName', 'reviewStatus', 'liveStatus', 'startAt', 'endAt'],
    fields: [
      { key: 'title', label: '标题' },
      { key: 'coverUrl', label: '封面 URL' },
      { key: 'anchorName', label: '主播' },
      { key: 'liveUrl', label: '直播 URL' },
      { key: 'playbackUrl', label: '回放 URL' },
      { key: 'startAt', label: '开始时间', type: 'datetime-local' },
      { key: 'endAt', label: '结束时间', type: 'datetime-local' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'liveStatus', label: '直播状态', type: 'select', options: [{ label: '未开始', value: '0' }, { label: '直播中', value: '1' }, { label: '已结束', value: '2' }, { label: '已取消', value: '3' }] },
    ],
    actions: [{ label: '审核', api: '/api/v1/admin/live-sessions/{id}/review', method: 'PATCH', fields: auditFields }],
  }),
  qaQuestions: resource({
    title: '答疑管理',
    api: {
      list: '/api/v1/admin/interaction/qa/questions',
      detail: '/api/v1/admin/interaction/qa/questions/{id}',
      delete: '/api/v1/admin/interaction/qa/questions/{id}',
    },
    columns: ['id', 'title', 'userId', 'expertId', 'status', 'createdAt'],
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
    columns: ['id', 'userId', 'feedbackType', 'content', 'processStatus', 'createdAt'],
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
    columns: ['id', 'title', 'categoryId', 'reviewStatus', 'publishStatus'],
    fields: [
      { key: 'categoryId', label: '分类 ID', type: 'number' },
      { key: 'title', label: '标题' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'content', label: '内容', type: 'textarea' },
      { key: 'reviewStatus', label: '审核状态', type: 'select', options: reviewStatusOptions },
      { key: 'publishStatus', label: '发布状态', type: 'select', options: publishStatusOptions },
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
    columns: ['id', 'categoryName', 'parentId', 'status', 'sortOrder'],
    fields: [
      { key: 'parentId', label: '父级 ID', type: 'number' },
      { key: 'categoryName', label: '分类名称' },
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
