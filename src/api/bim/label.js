/*
 * @Description:标注
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-12 17:46:47
 * @LastEditTime: 2020-05-12 17:50:25
 */
import axios from '@/utils/axios'
export default {
  /* 标注接口区 start */
  // 添加标注
  addBimLabel(data) {
    return axios.design.post('/bim/bimLabel/add', data)
  },
  // 删除标注
  deleteBimLabel(id) {
    return axios.design.post(`/bim/bimLabel/delete/${id}`)
  },
  // 查询列表
  getBimLabelList(data) {
    return axios.design.post(`bim/bimLabel/list`, data)
  },
  // 更新标注
  updateBimLabel(data) {
    return axios.design.post('/bim/bimLabel/update', data)
  },
  //详情接口
  detailBimLabel(id) {
    return axios.design.post(`/bim/bimLabel/get/${id}`)
  }
  /* 标注接口区 end */
}
