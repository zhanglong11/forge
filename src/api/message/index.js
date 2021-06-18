/*
 * @Description:消息接口
 * @Author:
 * @Date:
 */
import axios from '@/utils/axios'
export default {
  // 获取未读消息条数
  getMessageUnread(data) {
    return axios.post('/common/message/unread/count', data)
  },
  getList(data) {
    return axios.post('common/message/list', data)
  },
  getDetails(id) {
    return axios.design.get('/message/get/' + id)
  },
  deleteById(id) {
    return axios.design.get('message/delete/' + id)
  }
}
