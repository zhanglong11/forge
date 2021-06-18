import designApi from '@/api/design'
import projectOverviewApi from '@/api/design/projectOverview'
import toTree from '@/utils/toTree'
import api from '@/api'
export default {
  namespaced: true,
  state: {
    processGroupList: [],
    processGroupListTree: [],
    processTemplateList: [],
    projectDetail: {}
  },
  mutations: {
    changeProcessGroup(state, list) {
      list.forEach(e => {
        e.label = e.groupName
        e.value = e.id
      })
      state.processGroupList = list
      state.processGroupListTree = toTree(list)
    },
    changeProcessTemplate(state, list) {
      state.processTemplateList = list
    },
    changeProjectDetail(state, obj) {
      state.projectDetail = obj
    }
  },
  actions: {
    getProcessGroup({ commit }) {
      return designApi.getProcessGroupList().then(res => commit('changeProcessGroup', res.data))
    },
    getProcessTemplate({ commit }) {
      return designApi.getProcessTemplateList().then(list => commit('changeProcessTemplate', list))
    },
    async getProjectDetail({ commit }) {
      let res = await projectOverviewApi.getProjectDetails(localStorage.getItem('projectId'))
      commit('changeProjectDetail', res.data)
    }
  }
}
