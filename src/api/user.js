/*
 * @Description:
 * @Version:
 * @Autor:
 * @Date: 2020-02-10 10:26:01
 * @LastEditTime: 2020-03-06 15:00:01
 */
import request from '@/utils/axios'

export function login(data) {
  return request.post('/login', data, {})
}

// 获取项目列表
export function getProjectList(data) {
  return request.post('cim6d/system/project/list', data)
}
// 获取用户信息
export function getUserInfo(data) {
  return request.get('cim6d/system/user/current/get', data)
}
