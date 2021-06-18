// 用户权限
const state = {
  serviceCode: localStorage.getItem('serviceCode') || 'construction',
  webTitle: localStorage.getItem('webTitle') || 'CIM6D' // 标题栏地址
}

const mutations = {
  // 设置通用标题栏
  setWebTitle(state, obj) {
    state.serviceCode = obj.serviceCode
    state.webTitle = obj.webTitle
    localStorage.setItem('serviceCode', obj.serviceCode)
    localStorage.setItem('webTitle', obj.webTitle)
  }
}
const actions = {}

export default {
  state,
  mutations,
  actions
}
