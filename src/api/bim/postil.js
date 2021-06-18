/*
 * @Description:批注
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-18 10:52:22
 * @LastEditTime: 2020-05-18 13:48:04
 */
import axios from '@/utils/axios'
export default {
  // 添加批注
  addBimPostil(data) {
    return axios.design.post('/bim/bimPostil/add', data)
  },
  // 删除批注
  deleteBimPostil(id) {
    return axios.design.post(`/bim/bimPostil/delete/${id}`)
  },
  // 列表（条件）查询 bim批注
  getBimPostilList(data) {
    return axios.design.post('/bim/bimPostil/list', data)
  },
  // 发送消息
  sendMessage(data) {
    return axios.design.post('/bim/bimPostil/sendMessage', data)
  },
  // 编辑修改批注
  updateBimPostil(data) {
    return axios.design.post('/bim/bimPostil/update', data)
  },
  // 添加留言
  addBimPostilMessage(data) {
    return axios.design.post('/bim/bimPostilMessage/add', data)
  },
  // 根据id删除留言
  deleteBimPostilMessage(id) {
    return axios.design.post(`/bim/bimPostilMessage/delete/${id}`)
  },
  // 查询一个bim批注下的留言
  getBimPostilMessageList(postilId) {
    return axios.design.post(`/bim/bimPostilMessage/list/${postilId}`)
  }
}
