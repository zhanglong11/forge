/*
 * @Description:
 * @Author:
 * @Date: 2020-01-09 18:05:43
 */
/**
 任务名称：2868/添加3月注释
 开发人员：李建敏
 日期：2020-3月-4日
 任务类型：2、复制修改代码 （20行）
 **/
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import bim from './modules/bim'
import design from './modules/design'
import treeForEach from '@/utils/treeForEach'
import api from '@/api'
import userPower from './modules/user-power' // 用户权限

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    design,
    bim,
    userPower
  },
  getters,
  state: {
    departmentUserList: [],
    departmentList: [],
    // bug 1174 改为由store获取list
    stageList: [],
    config: JSON.parse(localStorage.getItem('systemConfig') || '{}') // 全局参数缓存
  },
  mutations: {
    changeDepartmentUserList(state, list) {
      state.departmentUserList = list
    },
    changeDepartmentList(state, list) {
      state.departmentList = list
    },
    changeStageList(state, list) {
      state.stageList = list
    },
    changeConfig(state, list) {
      localStorage.setItem('systemConfig', JSON.stringify(list))
      state.config = list
    }
  },
  actions: {
    /**
     任务名称：2868/添加3月注释
     开发人员：李建敏
     日期：2020-3月-4日
     任务类型：2、复制修改代码 （20行）
     **/
    getDepartmentUserList: _.throttle(
      async ({ commit }) => {
        let data = await api.getOrganList().then(res => res.data || [])
        if (_.get(data, '0.children.0')) {
          data = data[0].children
        }
        treeForEach(data, (e, parent) => {
          e.label = e.name
          if (!e.children) e.children = []
          if (e.type === 2) {
            e.organId = parent?.id
          }
          if (e.type === 3) {
            e.organId = parent.organId
            e.organName = parent.name
            e.id = e.userId
            delete e.children
          }
        })
        commit('changeDepartmentUserList', data)
      },
      10,
      { trailing: false }
    ),
    async getDepartmentList({ commit }) {
      let obj = {
        projectId: localStorage.getItem('projectId')
      }
      let data = await api.getDepartList(obj).then(res => res.data[0].children)

      commit('changeDepartmentList', data)
    },
    async getStageList({ commit }) {
      let res = await this.axios.schedule.get('schedule/task/treeList/' + localStorage.getItem('projectId'))
      let list = res.data
        .filter(item => item.type === 2)
        .map(item => {
          item.id = item.taskUniqueId.toString()
          item.label = item.name
          return item
        })
      commit('changeStageList', list)
    },
    //获取系统参数
    setSystemConfigStorage({ commit }) {
      return api.queryTreeArg().then(result => {
        const datas = result.data || []
        const list = {}
        datas.map(items => {
          const listItems = {
            id: items.id,
            label: items.argText,
            value: items.argCode,
            argGroup: items.argGroup,
            children: []
          }
          if (items.children) {
            items.children.map(item => {
              const newItem = {
                label: item.argText,
                value: item.argCode,
                argGroup: item.argGroup,
                deleteFlag: item.deleteFlag
              }
              listItems.children.push(newItem)
            })
          }
          list[items.argCode] = listItems
        })
        // localStorage.setItem('systemConfig', JSON.stringify(list))
        // state.config = list
        commit('changeConfig', list)
      })
    }
  }
})

export default store
