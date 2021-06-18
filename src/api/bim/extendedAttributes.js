/*
 * @Description:扩展属性
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-20 17:22:17
 * @LastEditTime: 2020-05-25 13:59:52
 */
import axios from '@/utils/axios'
export default {
  // 添加扩展属性
  addExtendedAttributes(data) {
    return axios.bimLight.post('/feign/bim/extendAttributes', data)
  },
  addExtendedAttributesNew(data) {
    return axios.design.post('/bim/dataManagement/add', data)
  },
  // 获取构件属性
  getAttributes(viewId, componentGuid) {
    return axios.design.post(`/bim/component/${viewId}/getSingleComponentAttribute/${componentGuid}`)
  }
}
