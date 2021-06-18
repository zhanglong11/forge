<!--
 * @Description: bim轻量化主页
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-04-22 09:40:33
 * @LastEditTime: 2020-05-26 17:43:50

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-23
@任务类型: 修改代码，解决合并冲突，引入批注组件，修改比例(4%)
 -->
<!--
  @任务名称: 3006/版本管理，二三维对比；合并模型，版本对比
  @开发人员: 申豪强
  @修改日期: 2020-04-23
-->
<template>
  <div class="bim-content">
    <el-container>
      <el-main :class="classObject">
        <!--导航栏 -->
        <el-header>
          <BimHeader
            :toggleflag="toggleflag"
            :versionValue="versionValue"
            :versionList="versionList"
            @versionChange="versionChange"
            @togglebtn="togglebtn"
            @navigationChange="navigationChange"
          />
        </el-header>
        <el-main>
          <!-- 中间bim模型 -->
          <BimModel v-if="showNavigation !== 'auxiliary'" ref="BimModel" @loadFish="loadFish" />
          <BimModel v-else ref="BimModel" />
        </el-main>
      </el-main>
      <el-aside :class="sideClass">
        <!-- 版本管理 -->
        <Version
          v-if="showNavigation === 'versionManage'"
          ref="version"
          :departmentId="departmentId"
          :taskUniqueId="taskUniqueId"
          @navigationChange="navigationChange"
          @updateModel="updateModel"
          @getVersionList="getVersionList"
        />
        <!-- 过滤器 -->
        <Strainer v-if="showNavigation === 'strainer'" @navigationChange="navigationChange" />
        <!-- 数据管理 -->
        <DataManagement v-if="showNavigation === 'dataManagement'" @navigationChange="navigationChange" />
        <!-- 视点管理 -->
        <Viewpoint v-if="showNavigation === 'viewpoint'" @navigationChange="navigationChange" />
        <!-- 视觉效果 -->
        <VisualEffect v-if="showNavigation === 'visualEffect'" @navigationChange="navigationChange" />
        <!-- 标注 -->
        <Mark v-if="showNavigation === 'mark'" @navigationChange="navigationChange" />
        <!-- 批注 -->
        <Annotation v-if="showNavigation === 'annotation'" @navigationChange="navigationChange" />
        <!-- 标记 -->
        <Sign v-if="showNavigation === 'sign'" @navigationChange="navigationChange" />
        <!-- 合模 -->
        <CompoundDie
          v-if="showNavigation === 'compoundDie'"
          :departmentId="departmentId"
          :taskUniqueId="taskUniqueId"
          @navigationChange="navigationChange"
          @updateModel="updateModel"
        />
        <!-- 模型对比 -->
        <VersionCompare
          v-if="showNavigation === 'compare'"
          ref="versionCompare"
          @navigationChange="navigationChange"
          @modelCompareLoadModel="modelCompareLoadModel"
        />
        <!-- 碰撞对比 -->
        <CrashAnalyze v-if="showNavigation === 'crash'" @navigationChange="navigationChange" />
        <!-- 构件编辑 -->
        <ComponentEdit v-if="showNavigation === 'componentEdit'" @navigationChange="navigationChange" />
        <!-- 辅助视图：二三维对比 -->
        <Auxiliary
          v-if="showNavigation === 'auxiliary'"
          @navigationChange="navigationChange"
          @changeModel="changeModel"
        />
        <!-- 统计分析 -->
        <Statistics v-if="showNavigation === 'statistics'" @navigationChange="navigationChange" />
      </el-aside>
    </el-container>
  </div>
</template>

<script>
import api from '@/api/bim/version'
import Auxiliary from './auxiliary'
import Version from './bimVersion'
import Mark from './mark/bimMark'
import Annotation from './annotation/annotation'
import Sign from './sign/bimSign'
import BimModel from './component/Bim'
import CompoundDie from './compoundDie/index'
import VersionCompare from './versionCompare'
import CrashAnalyze from './crashAnalyze'
import fileApi from '@/api/design/file'
import VisualEffect from './visualEffect/index.vue'
import Strainer from './strainer/bimStrainer'
import Viewpoint from './viewpoint/bimViewpoint'
import DataManagement from './dataManagement'
import Statistics from './statistics/bimStatistic'
import ComponentEdit from './componentEdit/bimEdit'
import BimHeader from './component/BimHeader'
import axios from '@/utils/axios'
export default {
  components: {
    BimHeader,
    Version,
    Mark,
    Annotation,
    Sign,
    BimModel,
    CompoundDie,
    VersionCompare,
    CrashAnalyze,
    Auxiliary,
    VisualEffect,
    Strainer,
    Viewpoint,
    DataManagement,
    Statistics,
    ComponentEdit
  },
  data() {
    return {
      // 当前加载的模型列表
      models: [],
      departmentId: '8a57c3274bba439a9a77f68e7f100af2',
      taskUniqueId: '2',
      // 展示哪些
      showNavigation: 'versionManage',
      // 版本信息
      versionValue: null,
      // 对比标志
      compareFlag: false,
      // 表示上一次菜单点击
      lastShowNavigation: '',
      // 版本列表
      versionList: [],
      toggleflag: false
    }
  },
  computed: {
    classObject: function() {
      return {
        main: this.toggleflag && this.showNavigation !== 'auxiliary',
        mainleft: this.toggleflag && this.showNavigation === 'auxiliary'
      }
    },
    sideClass: function() {
      return {
        nosider: !this.toggleflag,
        sideright: this.toggleflag && this.showNavigation === 'auxiliary'
      }
    },
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    showNavigation(e) {
      this.bimfishApp.showAll()
      if (
        e === 'auxiliary' ||
        this.lastShowNavigation === 'auxiliary' ||
        this.lastShowNavigation === 'compoundDie' ||
        this.lastShowNavigation === 'compare'
      ) {
        this.getBimInfo()
      }
    }
  },
  mounted() {
    // 初始化版本列表
    this.$store.dispatch('user/getInfo')
    this.getBimInfo()
  },
  methods: {
    togglebtn() {
      this.toggleflag = this.toggleflag ? false : true
    },
    // 二三维对比
    changeModel(arr) {
      this.$refs.BimModel.load3dviewer(arr)
    },
    async getVersionList() {
      let form = {
        // projectFileId: this.getParams('fileId'),
        // projectId: localStorage.getItem('projectId')
        // batchCode: this.$store.state.bim.batchCode
      }
      let res = await api.getVersionList(form)
      this.$store.commit('bim/changeVersionList', res.data)
      this.versionList = res.data
      if (!this.versionList || this.versionList.length === 0) {
        //默认添加一个版本，即为当前版本
        this.$refs.version.getBimInfo(obj, { id: obj.projectFileId, name: res.data[0].name })
      } else {
        let target = this.versionList.filter(item => item.projectFileId === this.getParams('fileId'))[0]
        this.$store.commit('bim/changebatchCode', target.batchCode)
        this.$store.commit('bim/changeVersion', target.id)
        this.$store.commit('bim/changeVersionInfo', target)
        this.versionValue = target.id
      }
    },

    // 获取地址栏参数
    getParams(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      // let r = window.location.search.substr(1).match(reg)
      if (!window.location.href.split('?')[1]) return null
      if (!window.location.href.split('?')[1].match) {
        return
      }
      let r = window.location.href.split('?')[1].match(reg)
      if (r !== null) {
        return unescape(r[2])
      }
      return null
    },
    async getBimInfo() {
      let obj = {
        name: '',
        sourceFileId: this.getParams('fileId'),
        type: 1,
        // projectFileId: this.getParams('fileId')
        viewModelId: this.$store.state.bim.bim3DArr[0].id
      }
      this.departmentId = this.getParams('departmentId')
      this.taskUniqueId = this.getParams('taskUniqueId')
      // 获取bim信息
      let res = await fileApi.getBimViewerList(obj)
      if (!res) {
        return
      }
      // let res = await fileApi.getBimViewerListByViewId(id)
      // 加载模型
      if (res.data && res.data.length > 0) {
        let target = res.data[0]
        // 存储当前模型数据
        this.$store.commit('bim/saveModelInfo', target)
        let arr = [
          {
            id: target.id,
            modelUrl: target.url
          }
        ]
        //   let arr = [
        //   {
        //     id: 'c5fc3c9bc81647d3913e84760b81db02',
        //     modelUrl:
        //       axios.design.defaults.baseURL.replace('/', '') +
        //       '/noToken/basic/commonFile/get/fdht/bim_c5fc3c9bc81647d3913e84760b81db02/3d.svf'
        //   }
        // ]
        // this.$refs.BimModel.load3dviewer(arr)
        // 只加载第一个
        this.$refs.BimModel.load3dviewer(arr)
        this.getVersionList()
      }
    },
    // 加载完毕:判断model数量，加载完毕，再进行对比
    loadFish(e) {
      let bimfishApp = this.$store.state.bim.bimfishApp
      let model = e
      if (this.models.length === 2 && model.id === this.models[1].id) {
        // 进行对比
        bimfishApp.viewer.getObjectTree(e => {
          bimfishApp.modelCompareSystem(this.models[0], this.models[1], (add, deleteArr, modelModifyId) => {})
          bimfishApp.compareModel(this.models[0], this.models[1], (add, deleteArr, modelModifyId) => {
            this.$refs.versionCompare.showMess(add, deleteArr, modelModifyId)
          })
        })
        return
      }
    },
    // 版本更改：更新当前的模型地址
    versionChange(e) {
      let target = this.versionList.filter(item => item.id === e)[0]
      window.location.href =
        window.location.origin +
        `#/lightWeight?taskUniqueId=${this.taskUniqueId}&departmentId=${this.departmentId}&fileId=${target.projectFileId}`
      // '#/lightWeight?taskUniqueId=2&departmentId=36102996882464004&fileId=bdf43a59d7f945439093f04e0aca9cdd'
      let arr = [
        {
          id: e,
          modelUrl: target.url
        }
      ]
      this.updateModel(arr)
    },
    // 更新模型
    updateModel(arr) {
      this.$refs.BimModel.load3dviewer(arr)
    },
    // 模型对比
    modelCompareLoadModel(arr) {
      let bimfishApp = this.$store.state.bim.bimfishApp
      this.$refs.BimModel.load3dviewer(arr, e => {
        let models = Object.values(e)
        this.models = models
      })
    },
    // 左侧菜单栏点击选择
    navigationChange(e) {
      if (!e) {
        this.showNavigation = null
      } else {
        // 获取顶部版本信息，直接展示顶部版本
        this.lastShowNavigation = this.showNavigation
        let toggle = this.toggleflag
        if (!toggle) {
          this.toggleflag = true
        }
        setTimeout(() => {
          this.showNavigation = e.key
        }, 0)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.bim-content {
  height: 100%;
  width: 100%;
  .el-container {
    width: 100%;
    height: 100%;
    .el-main {
      padding: 0;
      position: relative;
      transition: all 0.5s ease-in-out;
      &.main {
        width: calc(100% - 360px) !important;
      }
      .mainleft {
        width: 60% !important;
      }
      .el-header {
        padding: 0;
        height: 60px;
      }
      .el-main {
        position: absolute;
        top: 60px;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
    .el-aside {
      width: 360px !important;
      background-color: #dadada;
      transition: all 0.5s ease-in-out;
      &.nosider {
        width: 0px !important;
      }
      &.sideright {
        width: 40% !important;
      }
      /*滚动条样式设置*/
      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
      &::-webkit-scrollbar-thumb {
        background: transparent;
        background-clip: padding-box;
        border: 3px solid transparent;
        border-radius: 7px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: transparent;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      &::-webkit-scrollbar-track:hover {
        background: transparent;
      }
    }
  }
}
</style>
<style lang="less">
.calc-height {
  height: calc(100% - 60px);
}
/*
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-23
@任务类型: 修改代码，添加canvas样式细节，修改比例(15%)
*/
#bim-canvas {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  z-index: 99999;
}
#draw-canvas {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  z-index: 100001;
}
#graffiti {
  position: absolute;
  bottom: 10px;
  left: 0;
  z-index: 100002;
}
</style>
