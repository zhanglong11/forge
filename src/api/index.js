import axios from '@/utils/axios'
export default {
  getOrganList() {
    return axios.post('cim6d/system/project/organ/query/', { projectId: localStorage.getItem('projectId') })
  },
  // 获取用户可用权限
  getPermissionList() {
    return axios.get('/cim6d/system/power/available')
  },
  // 参数树
  queryTreeArg: () => {
    return axios.settings.post('/cim6d/arg/tree', { module: 'construction-2.0' })
  }
}
