/*
 * @Description:
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-13 17:41:04
 * @LastEditTime: 2020-05-26 11:37:51
 */
import axios from '@/utils/axios'
import { post, get } from '@/utils/axios'
export default {
  /* 统计分析 start */
  // 添加分析
  addBimStatistics(data) {
    return axios.design.post('/bim/bimStatistics/add', data)
  },
  // 删除记录
  deleteBimStatistics(id) {
    return axios.design.get(`/bim/bimStatistics/delete/${id}`)
  },
  // 查询统计详情
  getBimStatisticsDetails(id) {
    return axios.design.get(`/bim/bimStatistics/get/${id}`)
  },
  // 查询列表
  getBimStatisticsList(data) {
    return axios.design.post('/bim/bimStatistics/list', data)
  },
  // 进行分析
  goBimStatistics(data) {
    return axios.design.post('/bim/bimStatistics/statistics', data)
  },
  // 修改分析
  editBimStatistics(data) {
    return axios.design.post('/bim/bimStatistics/update', data)
  },
  // /获取所有属性
  getAllAttribute(projectFileId) {
    //return axios.design.get(`/bim/attributeItem/list/${projectFileId}`)
  },
  //碰撞分析上传
  // getCrashAnalyzeImport: data => {
  //   return post('/bimCrashRecord/importExcel', data, {
  //     'Content-Type': 'multipart/form-data'
  //   })
  // }
  getCrashAnalyzeImport(data) {
    return axios.design.post('/bimCrashRecord/importExcel', data, {
      'Content-Type': 'application/xml'
    })
  },
  getBimCrashRecordList(data) {
    return axios.design.post('/bimCrashRecord/list', data)
  }
}
