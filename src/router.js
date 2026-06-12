import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './views/LoginPage.vue'
import DashboardLayout from './views/DashboardLayout.vue'
import ResourcePage from './views/ResourcePage.vue'
import CourseManagementPage from './views/course/CourseManagementPage.vue'
import BookManagementPage from './views/book/BookManagementPage.vue'
import ArticleManagementPage from './views/content/ArticleManagementPage.vue'
import PodcastManagementPage from './views/content/PodcastManagementPage.vue'
import TopicManagementPage from './views/content/TopicManagementPage.vue'
import HomeCategoriesPage from './views/home/HomeCategoriesPage.vue'
import HomeContentsPage from './views/home/HomeContentsPage.vue'
import ExpertManagementPage from './views/expert/ExpertManagementPage.vue'
import StudyHoursStatisticsPage from './views/statistics/StudyHoursStatisticsPage.vue'
import StudentStatisticsPage from './views/statistics/StudentStatisticsPage.vue'
import RegionStudentStatisticsPage from './views/statistics/RegionStudentStatisticsPage.vue'
import StudentScoreManagementPage from './views/statistics/StudentScoreManagementPage.vue'
import ExamDashboardPage from './views/statistics/ExamDashboardPage.vue'
import { menuGroups } from './config/resources'
import { getAuthToken } from './utils/auth'

function resolveRouteComponent(resource) {
  if (resource === 'homeCategories') return HomeCategoriesPage
  if (resource === 'homeContents') return HomeContentsPage
  if (resource === 'courses') return CourseManagementPage
  if (resource === 'books' || resource === 'bookCategories') return BookManagementPage
  if (resource === 'articles') return ArticleManagementPage
  if (resource === 'podcasts') return PodcastManagementPage
  if (resource === 'topics') return TopicManagementPage
  if (resource === 'experts' || resource === 'expertCategories') return ExpertManagementPage
  if (resource === 'studyHoursStats') return StudyHoursStatisticsPage
  if (resource === 'studentStats') return StudentStatisticsPage
  if (resource === 'regionStats') return RegionStudentStatisticsPage
  if (resource === 'examScoreStats') return StudentScoreManagementPage
  if (resource === 'examDashboardStats') return ExamDashboardPage
  return ResourcePage
}

const resourceRoutes = menuGroups.flatMap((group) =>
  group.items.map((item) => ({
    path: item.route.replace(/^\//, ''),
    name: item.resource,
    component: resolveRouteComponent(item.resource),
    props: { resourceKey: item.resource },
    meta: { title: item.title },
  })),
)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/account/users',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'books/chapters',
          redirect: '/books',
        },
        {
          path: 'content/podcast-audios',
          redirect: '/content/podcasts',
        },
        ...resourceRoutes,
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getAuthToken()) {
    return { name: 'login' }
  }

  if (to.name === 'login' && getAuthToken()) {
    return { path: '/account/users' }
  }

  return true
})

export default router
