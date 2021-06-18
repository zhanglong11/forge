/*
 * @Description:评论接口
 * @Author:
 * @Date: 2020-01-19 09:11:06
 */
import { post, get } from '@/utils/axios'
const baseURL = `/cim6d-design${process.env.VUE_APP_BASE_API}`
export default {
  //获取评论列表
  getCommentList: data => {
    return post('/project/comment/list', data, { baseURL: baseURL })
  },
  // 新增评论
  addComment: data => {
    return post('/project/comment/add', data, { baseURL: baseURL })
  }
}
