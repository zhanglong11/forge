import Cookies from 'js-cookie'
import api from '@/api'
import { constantRoutes } from '@/router'
import treeForEach from '@/utils/treeForEach'
import toFlat from '@/utils/toFlat'
import path from 'path'
const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  menuList: [],
  // 权限表
  accessList: []
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  changeMenuList(state, list) {
    state.menuList = list
  },
  changeAccess(state, list) {
    state.accessList = list
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  getPermissionList({ commit }) {
    return api.getPermissionList().then(res => {
      // construction
      let list = _.get(_.find(res.data || [], { serviceCode: 'design' }), 'children', [])
      let accessList = toFlat(list)
        .filter(e => e.type === 3)
        .map(e => _.pick(e, ['powerName', 'powerKey']))
      commit('changeAccess', accessList)
      let permissionUrlList = toFlat(list).filter(e => e.url)
      const originalMenuList = _.cloneDeep(constantRoutes)
      // treeForEach(originalMenuList, (item, parent) => {
      //   if (parent) {
      //     item.absolutePath = path.resolve(parent.absolutePath, item.path)
      //     let target = _.find(permissionUrlList, { url: item.absolutePath })
      //     if (item.hidden === undefined) item.hidden = !target
      //   } else {
      //     item.absolutePath = item.path
      //     let target = _.find(permissionUrlList, { url: item.absolutePath })
      //     if (!target) item.hidden = true
      //   }
      // })
      commit('changeMenuList', constantRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
