/*
 * @Description:过滤器
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-20 14:56:49
 * @LastEditTime: 2020-05-26 14:37:04
 */
import axios from '@/utils/axios'
export default {
  // /添加过滤器
  addBimFilter(data) {
    return axios.design.post('/bim/bimFilter/add', data)
  },
  // 删除过滤器
  deleteFilter(id) {
    return axios.design.get(`/bim/bimFilter/delete/${id}`)
  },
  // 过滤详情
  getFilterDetails(id) {
    return axios.design.get(`/bim/bimFilter/get/${id}`)
  },
  // 点击按钮过滤器列表
  getBimFilterList(data) {
    return axios.design.post('/bim/bimFilter/list', data)
  },
  // 根据过滤器搜索
  searchBimFilter(data) {
    return axios.design.post('/bim/bimFilter/search', data)
  },
  // 修改过滤器
  updateBimFilter(data) {
    return axios.design.post('/bim/bimFilter/update', data)
  },
  // 进行过滤
  goFilter(data) {
    return axios.bimLight.post('/feign/bim/bimFilter/search', data)
  }
}
