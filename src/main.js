/**
 弹框的改进：2512  任务描述
 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改：
 1、弹框可移动。
 2、遮挡的页面支持鼠标滚轮上下移动。
 开发人员：李建敏
 日期：2020-3月-16日
 任务类型：2、复制修改代码 1行
 **/
import Vue from 'vue'
import 'normalize.css/normalize.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss' // global css
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import App from './App'
import store from './store'
import router from './router'
import '@/icons' // icon
import '@/permission' // permission control
import axios from '@/utils/axios'
import _ from 'lodash'
import remove from '@/utils/remove'
import 'xe-utils'
import 'vxe-table/lib/index.css'
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'
import Upload from '@/components/Upload'
import Download from '@/components/Download'
import Preview from '@/components/Preview'
import Table from '@/components/Table'
import InputNumber from '@/components/InputNumber'
import moment from 'moment'
import 'moment/locale/zh-cn'
import api from '@/api'
import './assets/font/iconfont.css'
import './assets/font/iconfont'

import 'xe-utils'
import VXETable from 'vxe-table'
import TreeSelect from '@riophae/vue-treeselect'
import SelectUser from '@/components/SelectUser'
import Status from '@/components/Status'
import Grid from '@/components/Grid'
import privilege from '@/directive/privilege'
import copy from '@/directive/copy'
import '@/directive/dialogDrag'
import '@/directive/bimPropDrag' // 任务号：3004、修改人：董渊海、修改时间：2020-04-22
moment.locale('zh-cn')
Vue.use(ElementUI, {
  size: 'small'
})
Vue.use(Table)
Vue.prototype.axios = axios

Vue.prototype._ = _
Vue.prototype.$api = api
window._ = _
Vue.prototype.moment = moment
Vue.prototype.log = console.log
Vue.prototype.$access = function(powerKey) {
  // return _.find(this.$store.state.app.accessList, { powerKey })
  return true
}
window.moment = moment
Vue.prototype.$remove = remove

Vue.component('TreeSelect', TreeSelect)
Vue.component(Grid.name, Grid)
Vue.component(Upload.name, Upload)
Vue.component(Download.name, Download)
Vue.component(Preview.name, Preview)
Vue.component(SelectUser.name, SelectUser)
Vue.component(Status.name, Status)
Vue.component(InputNumber.name, InputNumber)
Vue.use(VXETable, { size: 'small', align: 'center', resizable: true })
VXETable.use(VXETablePluginElement)
/*
获取系统参数分组数据
group 分组参数
this.$getArgList(group)
*/
const getLabel = (options, value) => _.get(_.find(options, { value }), 'label', '-')
Vue.prototype.$getArgList = group =>
  store.state.config[group] && store.state.config[group].children.filter(item => !item.deleteFlag)
/*
  通过value 获取系统参数label
  group 分组参数
  value 参数编码
  this.$getLabelFromArg(group, value)
  */
Vue.prototype.$getLabelFromArg = (group, value) =>
  getLabel(store.state.config[group] && store.state.config[group].children, value + '')

Vue.prototype.$getLabel = getLabel
Vue.config.productionTip = false
/**
 * 权限全局指令 v-privilege="options"
 */

Vue.directive('access', privilege)
Vue.directive('copy', copy)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
