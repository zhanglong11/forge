/*
 * @Description:
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-03-15 20:59:05
 * @LastEditTime: 2020-03-31 18:11:46
 * 修改内容：新增在线预览接口
 */

import axios from '@/utils/axios'
export default {
  getProcessGroupList() {
    return axios.design.post('process/group/list', {})
  },
  // 发起流程
  flowStar(data) {
    return axios.design.post('process/instance/start', data)
  },
  // 流程模板详情
  getFlowDetails(id) {
    return axios.design.get('/process/template/get/' + id)
  },

  getProcessTemplateList() {
    return axios.design
      .post('process/template/list', {
        projectId: localStorage.getItem('projectId'),
        page: 1,
        rows: 1000
      })
      .then(res => res.data.records)
  },
  // 获取任务信息
  getTaskInfo(projectId) {
    return axios.design.get('schedule/task/flowChart/' + projectId)
  },
  /*
   * @任务编号:2526 || 设计模块调整
   * @开发人员:申豪强
   * @日期:2020-03-16
   * @任务类型:新代码
   */
  // 在线预览
  previewOss(id) {
    return axios.design.get(`file/commonFile/previewOss/${id}`)
  },
  // 直接预览
  getFileDetails: id => {
    return axios.design.get(`file/commonFile/onlinePreview/${id}`, { responseType: 'blob' })
  }
}
