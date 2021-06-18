/*
 * @Description:设计管理
 * @Author:
 * @Date: 2020-01-09 15:14:24
 */
import Layout from '@/layout/index'

export default {
  path: '/design',
  redirect: '/design/file',
  name: 'Design',
  component: Layout,
  meta: { title: '设计管理', icon: 'el-icon-message' },
  children: [
    {
      path: '',
      meta: { title: '设计管理', icon: 'el-icon-message' },
      component: () => import('@/views/design/index.vue'),
      children: [
        {
          path: 'projectOverview',
          name: 'ProjectOverview',
          component: () => import('@/views/design/projectOverview/index.vue'),
          meta: { title: '项目概况', icon: 'el-icon-info' }
        },
        {
          path: 'task',
          name: 'Task',
          component: () => import('@/views/design/task/index.vue'),
          meta: { title: '任务管理', icon: 'el-icon-s-shop' }
        },
        {
          path: 'file',
          name: 'File',
          component: () => import('@/views/design/file/index.vue'),
          meta: { title: '文件管理', icon: 'el-icon-s-management' }
        },
        {
          path: 'meetingLog',
          name: 'MeetingLog',
          component: () => import('@/views/design/meetingLog/index.vue'),
          meta: { title: '会议记录', icon: 'el-icon-s-comment' }
        },
        {
          path: 'dynamic',
          name: 'Dynamic',
          component: () => import('@/views/design/dynamic/index.vue'),
          meta: { title: '项目动态', icon: 'el-icon-s-order' }
        }
      ]
    },
    {
      path: 'approval',
      name: 'ApprovalManage',
      meta: { title: '审核', icon: 'el-icon-message' },
      component: () => import('@/views/design/index.vue'),
      children: [
        {
          path: '/design/approval',
          name: 'Approval',
          component: () => import('@/views/design/approval/index.vue'),
          meta: { title: '审批', icon: 'el-icon-s-check' }
        },
        {
          path: '/design/process',
          name: 'Process',
          component: () => import('@/views/design/process/index.vue'),
          meta: { title: '流程', icon: 'el-icon-s-opportunity' }
        }
      ]
    },
    {
      path: 'breakingNew',
      name: 'BreakingNew',
      hidden: true,
      component: () => import('@/views/design/breakingNews/index.vue'),
      meta: { title: '大事记' }
    },
    {
      path: 'breakingNewPreview',
      name: 'BreakingNewPreview',
      hidden: true,
      component: () => import('@/views/design/breakingNews/preview.vue'),
      meta: { title: '大事记预览' }
    },
    {
      path: 'message',
      name: 'Message',
      hidden: true,
      meta: {
        title: '消息'
      },
      component: () => import('@/views/message')
    }
  ]
}
