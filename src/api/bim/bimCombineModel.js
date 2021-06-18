/*
 * @Description:合模
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-18 09:10:14
 * @LastEditTime: 2020-05-18 09:15:05
 */
import axios from '@/utils/axios'
export default {
  // 查询合模列表
  getBimCombineModelList(data) {
    return axios.design.post('/bim/bimCombineModel/list', data)
  },
  // 添加合模
  addBimCombineModel(data) {
    return axios.design.post('/bim/bimCombineModel/add', data)
  },
  // 删除合模
  deleteBimCombineModel(id) {
    return axios.design.get(`/bim/bimCombineModel/delete/${id}`)
  },
  // 获取合模详情
  getBimCombineDetails(id) {
    return axios.design.get(`/bim/bimCombineModel/get/${id}`)
  },
  // 修改合模
  updateBimCombine(data) {
    return axios.design.post('/bim/bimCombineModel/update', data)
  }
}
