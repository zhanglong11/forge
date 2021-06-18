/*
 * @Description:构件编辑
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 11:26:15
 * @LastEditTime: 2020-05-14 11:34:39
 */

import axios from '@/utils/axios'
export default {
  /* 构件编辑 start */
  // 添加构件编辑
  addBimComponentEdit(data) {
    return axios.design.post('/bim/bimComponentEdit/add', data)
  },
  // 删除构件编辑
  deleteBimComponentEdit(id) {
    return axios.design.get(`/bim/bimComponentEdit/delete/${id}`)
  },
  // 查看构件编辑详情
  getBimComponentEditDetails(id) {
    return axios.design.get(`/bim/bimComponentEdit/get/${id}`)
  },
  // 获取构件编辑列表
  getBimComponentEditList(data) {
    return axios.design.post('/bim/bimComponentEdit/list', data)
  },
  // 编辑构件编辑
  updateBimComponentEdit(data) {
    return axios.design.post('/bim/bimComponentEdit/update', data)
  }
}
