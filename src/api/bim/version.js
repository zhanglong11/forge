/*
 * @Description:
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-11 10:49:23
 * @LastEditTime: 2020-05-11 10:50:31
 */
import axios from '@/utils/axios'
export default {
  /* 版本接口区 star*/
  // 新增版本
  versionInsert(data) {
    return axios.design.post('/bimVersion/add', data)
  },
  // 版本列表
  getVersionList(data) {
    return axios.design.post('/bimVersion/list', data)
  },
  //删除版本
  versionDelete(id) {
    return axios.design.post(`/bimVersion/delete/${id}`)
  },
  // 版本编辑
  versionEdit(data) {
    return axios.design.post('/bimVersion/update', data)
  }
}
