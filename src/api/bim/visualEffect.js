/*
 * @Description:视觉效果
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-11 16:19:53
 * @LastEditTime: 2020-05-21 13:47:57
 */
import axios from '@/utils/axios'
export default {
  /* ----视觉方案---- start */
  // 新增视觉
  addBimOptesthesiaProgram(data) {
    return axios.design.post('/BimOptesthesiaProgram/add', data)
  },
  // 删除方案
  deleteBimOptesthesiaProgram(id) {
    return axios.design.get(`/BimOptesthesiaProgram/delete/${id}`)
  },
  // 方案详情
  getBimOptesthesiaProgramDetails(id) {
    return axios.design.get(`/BimOptesthesiaProgram/get/${id}`)
  },
  // 方案列表
  getBimOptesthesiaProgram(data) {
    return axios.design.post('/BimOptesthesiaProgram/list', data)
  },
  // 方案编辑
  editBimOptesthesiaProgram(data) {
    return axios.design.post('BimOptesthesiaProgram/update', data)
  },
  // 方案激活
  activeBimOptesthesiaProgram(id) {
    return axios.design.post(`/BimOptesthesiaProgram/isActive/${id}`)
  },
  /* ----视觉方案---- end */
  /* ----火焰管理---- start */
  // 新增火焰
  addFire(data) {
    return axios.design.post('/BimFire/add', data)
  },
  // 删除火焰
  deleteFire(id) {
    return axios.design.get(`/BimFire/delete/${id}`)
  },
  // 火焰列表
  getFireList(data) {
    return axios.design.post('/BimFire/list', data)
  },
  // 火焰编辑
  editFire(data) {
    return axios.design.post('/BimFire/update', data)
  },
  // 获取火焰详情
  getFireDetails(id) {
    return axios.design.get(`/BimFire/get/${id}`)
  },
  /* ---- 火焰管理 ---- end */
  /* ---- 构件移动 ---- end */
  // 删除构件移动
  deleteComponentMove(id) {
    return axios.design.get(`/BimComponentMove/delete/${id}`)
  },
  // 构件添加
  bimComponentMoveAdd(data) {
    return axios.design.post('/BimComponentMove/add', data)
  },
  // 构件详情
  getBimComponentDetails(id) {
    return axios.design.get(`/BimComponentMove/get/${id}`)
  },
  // 构件列表
  getBimComponentMoveList(data) {
    return axios.design.post('/BimComponentMove/list', data)
  },
  // 构件修改
  bimComponentMoveUpdate(data) {
    return axios.design.post('/BimComponentMove/update', data)
  },
  /* ---- 构件移动 ---- end */
  /* ---- 构件旋转 ---- start */
  // 获取旋转构件列表
  getBimComponentRotationList(data) {
    return axios.design.post('/BimComponentRotation/list', data)
  },
  // 新增旋转构件
  addNewBimComponentRotation(data) {
    return axios.design.post('/BimComponentRotation/add', data)
  },
  // 删除旋转构件
  deleteBimComponentRotation(id) {
    return axios.design.get(`/BimComponentRotation/delete/${id}`)
  },
  // 获取构件详情
  getBimComponentRotationDetails(id) {
    return axios.design.get(`/BimComponentRotation/get/${id}`)
  },
  // bim构件旋转编辑
  updateBimComponentRotation(data) {
    return axios.design.post('/BimComponentRotation/update', data)
  },
  /* ---- 构件旋转 ---- end */
  /* ---- 动画方案 ---- start */
  // 添加动画方案
  addBimCartoon(data) {
    return axios.design.post('/BimCartoon/add', data)
  },
  // 删除动画方案
  deleteBimCartoon(id) {
    return axios.design.get(`/BimCartoon/delete/${id}`)
  },
  // 获取动画详情
  getBimCartoonDetails(id) {
    return axios.design.get(`/BimCartoon/get/${id}`)
  },
  // 获取动画列表
  getBimCartoonList(data) {
    return axios.design.post('/BimCartoon/list', data)
  },
  // 修改动画方案
  bimCartoonUpdate(data) {
    return axios.design.post('/BimCartoon/update', data)
  }
  /* ----动画方案---- end */
}
