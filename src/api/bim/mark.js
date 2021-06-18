/*
 * @Description:标记
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-18 18:24:48
 * @LastEditTime: 2020-05-18 18:36:15
 */
import axios from '@/utils/axios'
export default {
  // 新增标记
  addMark(data) {
    return axios.design.post('/bim/bimStamp/add', data)
  },
  // /获取标记列表
  getMarkList(data) {
    return axios.design.post('/bim/bimStamp/list', data)
  },
  // 删除标记
  deleteMark(id) {
    return axios.design.get(`/bim/bimStamp/delete/${id}`)
  },
  // 标记编辑
  updateMark(data) {
    return axios.design.post('/bim/bimStamp/update', data)
  },
  // 标记详情
  getMarkDetails(id) {
    return axios.design.post(`/bim/bimStamp/get/${id}`)
  }
}
