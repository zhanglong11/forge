/*
 * @Description:视点漫游
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-11 10:49:23
 * @LastEditTime: 2020-05-11 15:20:05
 */
import axios from '@/utils/axios'
export default {
  /* ----视点管理---- start*/
  // 新增视点
  bimViewpointAdd(data) {
    return axios.design.post('bimViewpoint/add', data)
  },
  // 视点列表
  getBimViewpointList(data) {
    return axios.design.post('/bimViewpoint/list', data)
  },
  //删除视点
  bimViewpointDelete(id) {
    return axios.design.post(`/bimViewpoint/delete/${id}`)
  },
  // 视点编辑
  bimViewpointEdit(data) {
    return axios.design.post('/bimViewpoint/update', data)
  },
  /* ----视点管理---- end*/
  /* ----漫游管理---- start*/
  // 漫游列表
  getRoamList(data) {
    return axios.design.post('/bimRoam/list', data)
  },
  // 新增漫游
  addRoam(data) {
    return axios.design.post('/bimRoam/add', data)
  },
  // 删除漫游信息
  deleteRoam(roamId) {
    return axios.design.post(`/bimRoam/delete/${roamId}`)
  },
  // 漫游信息编辑
  editRoam(data) {
    return axios.design.post('/bimRoam/update', data)
  }
  /* ----漫游管理---- end*/
}
