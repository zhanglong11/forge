/*
 * @Description:会议接口
 * @Author:
 * @Date: 2020-01-19 09:11:06
 */
import { post, get } from '@/utils/axios'
const baseURL = `/cim6d-design${process.env.VUE_APP_BASE_API}`
export default {
  //获取会议列表
  getMeetingList: data => {
    return post('/project/meeting/list', data, { baseURL: baseURL })
  },
  // 添加会议
  addMeeting: data => {
    return post('project/meeting/add', data)
  },
  //获取会议详情
  getMeetingDetails: id => {
    return get('/project/meeting/get/' + id, null, baseURL)
  },
  // 会议结论
  addConclusion: data => {
    return post('project/meeting/conclusion', data, { baseURL: baseURL })
  },
  // 会议修改
  meetingUpdate: data => {
    return post('project/meeting/update', data, { baseURL: baseURL })
  },
  // 获取文件列表
  getMeetingFileList: data => {
    return post('project/meeting/file/list', data, { baseURL: baseURL })
  }
}
