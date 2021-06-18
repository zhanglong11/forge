/*
 * @Description:bim模型相关接口
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-25 11:33:59
 * @LastEditTime: 2020-05-10 10:15:50
 */
/*
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-26
@任务类型: 修改代码，添加批注列表查询接口、批注新增接口，修改比例(20%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，添加批注删除接口，修改比例(5%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，添加批注编辑接口，修改比例(5%)
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
  },
  /* 版本接口区 end*/
  /* 合模接口区 star*/
  // 添加合模
  fileModelAdd(data) {
    return axios.post('/filemodle/add', data)
  },
  // 删除合模
  deleteFileModel() {
    return axios.design.get('/filemodle/deletemodule', data)
  },
  // 获取合模列表
  getFileModelList() {
    return axios.design.get('/filemodle/getList', data)
  },
  /* 合模接口区 end*/

  /* --------批注接口区-------- start*/
  // 批注列表
  getAnnotationList(data) {
    return axios.design.get('/filepostil/getpostlist', data)
  },
  // 批注新增
  annotationInsert(data) {
    return axios.design.post('/filepostil/insert', data)
  },
  // 批注删除
  deleteAnnotation(data) {
    return axios.design.get('/filepostil/deletepostil', data)
  },
  // 批注编辑
  updateAnnotation(data) {
    return axios.design.post('/filepostil/updatepostil', data)
  }
  /* --------批注接口区-------- end*/
}
