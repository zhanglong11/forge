import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
let configEnv = process.env.VUE_APP_BASE_API // 环境变量

// create an axios instance
const service = axios.create({
  baseURL: `/cim6d-system${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

const settings = axios.create({
  baseURL: `/cim6d-global${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// const design = axios.create({
//   baseURL: `/cim6d-design${configEnv}`, // url = base url + request url
//   // withCredentials: true, // send cookies when cross-domain requests
//   timeout: 10000 // request timeout
// })
const design = axios.create({
  baseURL: `/cim6d-bim-light${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})
const schedule = axios.create({
  baseURL: `/cim6d-schedule${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})
const storage = axios.create({
  baseURL: `/cim6d-file-storage${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})
const bim = axios.create({
  baseURL: `/cim6d-bim-version${configEnv}`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})
const bimLight = axios.create({
  baseURL: `/cim6d-bim-light`, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

addInterceptor(service)
addInterceptor(design)
addInterceptor(settings)
addInterceptor(schedule)
addInterceptor(storage)
addInterceptor(bim)
addInterceptor(bimLight)
function addInterceptor(service) {
  // request interceptor
  service.interceptors.request.use(
    config => {
      // do something before request is sent
      if (store.getters.token) {
        // let each request carry token
        // ['X-Token'] is a custom headers key
        // please modify it according to the actual situation
        config.headers['x-access-token'] = getToken()
      }
      return config
    },
    error => {
      // do something with request error
      console.log(error) // for debug
      return Promise.reject(error)
    }
  )

  // response interceptor
  service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
      const res = response.data
      if (
        response.config.responseType === 'blob' ||
        response.config.url.indexOf('file/commonFile/onlinePreview') > -1
      ) {
        return response
      }
      // if the custom code is not 20000, it is judged as an error.
      if (!res.success && res.code !== 200) {
        Message({
          message: res.message || res.msg || 'Error',
          type: 'error',
          duration: 2 * 1000
        })

        // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
        if (res.code === 50008 || res.code === 50012 || res.code === 50014 || res.code === 1000) {
          // to re-login
          MessageBox.confirm('登录已失效，你可以留在这个页面或者重新登录', '登录失效', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          })
        }
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    },
    error => {
      console.log('err' + error) // for debug
      Message({
        message: error.message,
        type: 'error',
        duration: 2 * 1000
      })
      return Promise.reject(error)
    }
  )
}
export const post = (url, data, config = {}) => {
  return service.post(url, data, config)
}
export const get = (url, data, baseURL = `/cim6d-system${configEnv}`) => {
  return service.get(url, {
    params: data,
    baseURL: baseURL
  })
}
export const bimGet = (url, data) => {
  return service.bim.get(url, {
    params: data
  })
}

service.design = design
service.settings = settings
service.schedule = schedule
service.storage = storage
service.bim = bim
service.bimLight = bimLight
export default service
