/*
 * @Description:项目概况
 * @Author:
 * @Date: 2020-01-14 10:05:42
 */
import { post, get } from '@/utils/axios'
export default {
  //获取项目详情
  getProjectDetails: id => {
    return get(`/cim6d/system/project/get/${id}`)
  },
  projectStart: id => {
    return get(`/cim6d/system/project/start/${id}`)
  }
}
