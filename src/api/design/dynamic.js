/*
 * @Description:动态模块接口
 * @Author:
 * @Date: 2020-01-19 09:11:06
 */
import { post, get } from '@/utils/axios'
const baseURL = `/cim6d-design${process.env.VUE_APP_BASE_API}`
export default {
  //获取动态列表
  getDynamicList: data => {
    return post('/project/trend/list', data, { baseURL: baseURL })
  },
  addDynamic: data => {
    return post('/project/trend/add', data, { baseURL: baseURL })
  },
  // 大事记新增
  addBreakingNews: data => {
    return post('/project/event/add', data, { baseURL: baseURL })
  },
  // 大事记新增
  editBreakingNews: data => {
    return post('/project/event/update', data, { baseURL: baseURL })
  },
  //获取大事记列表
  getBreakList: data => {
    return post('/project/event/list', data, { baseURL: baseURL })
  },
  //删除大事记
  deleteBreak: id => {
    return get(`/project/event/delete/${id}`, {}, baseURL)
  },
  // 大事记详情
  breakingNewsDetails: id => {
    return get(`/project/event/get/${id}`, {}, baseURL)
  }
}
