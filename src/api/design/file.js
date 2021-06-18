/*
 * @Description:
 * @Author:
 * @Date: 2020-01-15 16:01:52
 */
import { post, get } from '@/utils/axios'
import { pick } from 'xe-utils/methods'
import axios from '@/utils/axios'
const baseURL = `/cim6d-design${process.env.VUE_APP_BASE_API}`
export default {
  // 获取一级菜单下拉
  getFirstList: data => {
    return post('/cim6d/system/project/organ/query', data)
  },
  //获取文档
  getFileList: data => {
    return post('/file/fileManage/list', data, { baseURL: baseURL })
  },
  //新增文件夹
  addFolder: data => {
    return post('/file/fileManage/addFolder', data, { baseURL: baseURL })
  },
  // 重命名
  rename: data => {
    return post(`/file/fileManage/rename`, data, { baseURL: baseURL })
  },
  //新增文件
  saveFile: data => {
    return post('/file/projectFile/saveFile', data, { baseURL: baseURL })
  },
  // 批量新增文件
  batchSaveFile: data => {
    return post('/file/projectFile/batchSaveFile', data, { baseURL: baseURL })
  },
  // 下载文件
  download: data => {
    return post('/file/commonFile/download/' + data, {}, { baseURL: baseURL, responseType: 'blob' })
  },
  // 删除文件
  deleteFile: ({ id, type }) => {
    return get(`/file/projectFile/${id}/delete/${type}`, {}, baseURL)
  },
  // 查询外部协作
  externalCollaborationList: data => {
    return post('/file/fileManage/externalCollaborationList', data, { baseURL: baseURL })
  },
  // 文件移动、复制、内部共享
  copyMoveFile: data => {
    return post('/file/projectFile/copyMoveFile', data, { baseURL: baseURL })
  },
  getTree: data => {
    return post('/file/projectFile/selectDepartmentFolderTree', data, { baseURL: baseURL })
  },
  // 外部协作操作
  handleExternalCollaboration: data => {
    return post('/file/projectFile/externalCollaboration', data, { baseURL: baseURL })
  },
  // 文件历史流程查询
  getHistoryList(id) {
    return post(`process/instance/file/history/list/${id}`, {}, { baseURL: baseURL })
  },
  // 根据提取码获取外部协作
  selectExternalCollaborationFile(data) {
    return get(`/file/projectFile/selectExternalCollaborationFile`, data, baseURL)
  },
  // 设置文档权限
  setAccess(data) {
    return post('file/projectFile/setFolderAccess', data, { baseURL: baseURL })
  },
  // 查询权限
  getAccess(id) {
    return post(`/file/projectFile/${id}/selectFolderAccess`, {}, { baseURL: baseURL })
  },
  // 查看内部共享树结构
  getSelectShareTree(data) {
    return post(`/file/projectFile/selectShareTree`, data, { baseURL: baseURL })
  },
  // 查看存档区文件树
  getSelectPigeonholeTree(data) {
    return post(`/file/projectFile/selectPigeonholeTree`, data, { baseURL: baseURL })
  },
  // 轻量化转换
  changeConvertRecordByFileId(id, projectId) {
    return get(`/file/commonFile/convertSubmit/${id}/${projectId}`, {}, `/cim6d-design${process.env.VUE_APP_BASE_API}`)
  },
  // 轻量化预览
  getConvertRecordByFileId(id) {
    return get(`/getConvertRecordByFileId/${id}`, {}, '/bimfish')
  },
  // 外部协作删除
  deleteOut(id) {
    return post(`/file/fileManage/${id}/deleteExternalCollaboration`, {}, { baseURL: baseURL })
  },
  //获取某文件夹的权限
  getFolderAccess(data) {
    return post('file/fileManage/selectParentFolderAccess', data, { baseURL: baseURL })
  },
  // 获取文件详情
  getFileDetails(id) {
    return axios.design.get(`file/commonFile/get/${id}`, {})
  },
  // bim视图列表
  getBimViewerList(data) {
    //return axios.design.post(`/bim/bimView/list`, data)
  },
  // 传数组获取文件详情
  getFileDetailsByArr(data) {
    return axios.design.post('/file/projectFile/getInfo', data)
  },
  //根据id查询辅助视图
  getBimViewerListByViewId(id) {
    return axios.design.post(`/bim/assistView/get/${id}`)
  }
}
