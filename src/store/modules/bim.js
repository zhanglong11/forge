/*
 * @Description:
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-23 15:22:50
 * @LastEditTime: 2020-05-20 11:21:44
 */
import api from '@/api/design/bim'
export default {
  namespaced: true,
  state: {
    bimfishApp: null,
    // 当前版本：包含版本号+版本地址
    versionList: [],
    modelInfo: null,
    // 版本组
    batchCode: null,
    // /当前版本
    version: null,
    // /当前版本信息
    versionInfo: null,
    // 3dBIM数组，包含id和url
    bim3DArr: []
  },
  mutations: {
    initBimfishApp(state, app) {
      state.bimfishApp = app
    },
    // 获取版本列表信息
    changeVersionList(state, version) {
      state.versionList = version
    },
    // 保存模型信息
    saveModelInfo(state, info) {
      state.modelInfo = info
    },
    saveNowInfo() {},
    changebatchCode(state, batchCode) {
      state.batchCode = batchCode
    },
    changeVersion(state, version) {
      state.version = version
    },
    changeVersionInfo(state, info) {
      state.versionInfo = info
    },
    save3DViewer(state, arr) {
      state.bim3DArr = arr
    }
  },
  actions: {}
}
