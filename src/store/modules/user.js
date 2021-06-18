/*
 * @Description:
 * @Version:
 * @Autor:
 * @Date: 2020-02-10 10:26:01
 * @LastEditTime: 2020-03-31 17:49:34
 */

import { login, getUserInfo } from '@/api/user'
import message from '@/api/message'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  userId: '',
  userInfo: {},
  // 未读消息
  unreadNum: 0
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERID: (state, id) => {
    state.userId = id
  },
  SET_USER_INFO: (state, info) => {
    state.userInfo = info
  },
  SET_UNREAD_NUM: (state, info) => {
    state.unreadNum = info
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return login(userInfo).then(res => {
      commit('SET_TOKEN', res.data)
      setToken(res.data)
    })
  },

  // get info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo(state.token)
        .then(res => {
          console.log(res)
          commit('SET_NAME', res.data.nickName)
          commit('SET_AVATAR', res.data.headImage)
          commit('SET_USERID', res.data.id)
          commit('SET_USER_INFO', res.data)
          resolve(res.data)
        })
        .catch(error => {
          removeToken()
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit }) {
    commit('SET_TOKEN', '')
    removeToken()
    resetRouter()
    commit('SET_NAME', '')
    commit('SET_AVATAR', '')
    localStorage.clear()
    sessionStorage.clear()
    location.reload()
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },
  /*
   * @bug编号: 1446 | 更新未读
   * @开发人员:申豪强
   * @日期:2020-03-31
   * @bug类型：系统bug
   */
  upDateUndreadNum({ commit }) {
    return message.getMessageUnread({}).then(res => {
      commit('SET_UNREAD_NUM', res.data)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
