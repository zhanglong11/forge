<!--
 * @Description: 辅助视图
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-24 19:04:04
 * @LastEditTime: 2020-05-26 17:46:17
 -->
<template>
  <!--  <div class="right-content" style="width:40%">-->
  <div class="right-content">
    <Drag title="辅助视图" width="100%">
      <div class="handle-box">
        <div class="handle-box-content">
          <span>视图</span>
          <el-select v-model="viewValue" placeholder="请选择">
            <el-option-group v-for="group in viewOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-option-group>
          </el-select>
        </div>
        <div class="handle-box-btn">
          <!-- 主副互换 -->
          <el-tooltip content="主副互换" placement="top">
            <i class="el-icon-copy-document cursor" @click="deputySwap"></i>
          </el-tooltip>
          <!-- 联动开关 -->
          <el-tooltip content="联动开关" placement="top">
            <el-switch v-model="linkageFlag" @change="linkageFlagChange"> </el-switch>
          </el-tooltip>
        </div>
      </div>
      <div id="viewer-local2d" class="viewer-local2d"></div>
    </Drag>
  </div>
</template>

<script>
let click = -1
import { getParams } from '@/utils/index'
import Drag from './component/Drag'
import fileApi from '@/api/design/file'
import axios from '@/utils/axios'
export default {
  components: {
    Drag
  },
  data() {
    return {
      // 联动开关
      linkageFlag: true,
      // 视图的值
      viewValue: '',
      // 上一次视图的值
      lastViewValue: '',
      viewOptions: [
        {
          label: '3D视图',
          type: 1,
          options: []
        },
        {
          label: '平面视图',
          type: 2,
          options: []
        },
        {
          label: '图纸视图',
          type: 3,
          options: []
        },
        {
          label: '剖面视图',
          type: 4,
          options: []
        },
        {
          label: '立面视图',
          type: 5,
          options: []
        }
      ],
      bimfishApp2D: null,
      viewId: this.$store.state.bim.bim3DArr[0].id,
      type1: 1,
      arrCopy: {}
    }
  },
  computed: {
    bimfishApp3D() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    viewValue(e) {
      let list = [].concat
        .apply(
          [],
          this.viewOptions.map(item => item.options)
        )
        .filter(item => item.id === e)
      if (list.length > 0) {
        this.type1 = list[0].type
        let arr = [
          {
            modelUrl:
              axios.design.defaults.baseURL.replace('/', '') +
              '/noToken/basic/commonFile/get/fdht/bim_' +
              e +
              '/primaryGraphics.f2d',
            id: e
          }
        ]
        setTimeout(() => {
          this.load2dviewer(arr)
        }, 100)
        return
      } else {
        //测试 -默认3d开始
        let arr = [
          {
            id: this.viewId,
            modelUrl:
              axios.design.defaults.baseURL.replace('/', '') +
              '/noToken/basic/commonFile/get/fdht/bim_' +
              this.viewId +
              '/3d.svf'
          }
        ]
        setTimeout(() => {
          this.load2dviewer(arr)
        }, 100)
        return
      }
    }
  },
  destroyed() {
    this.bimfishApp3D.viewer.removeEventListener('selection', this.getBimfishApp3D)
    this.bimfishApp2D.viewer.removeEventListener('selection', this.getBimfishApp2D)
    this.eventTool3d.off('singleclick', () => {})
    this.eventTool2d.off('singleclick', () => {})
  },
  mounted() {
    this.getView()
    this.bimfishApp3D.viewer.disableSelection(false) //场景开启
  },
  methods: {
    // 主副互换：获取右侧、左侧arr，进行重新加载
    deputySwap() {
      // 更改右侧
      this.type1 = 1
      this.lastViewValue = this.viewValue
      let arr3D = this.$store.state.bim.bim3DArr
      this.viewValue = arr3D[0].id
      // if (arr3D[0].id === this.viewOptions[0].options[0].projectFileId) {
      //   //初次，可以判定为3d
      //   //this.viewValue = this.viewOptions[0].options[0].id
      // } else {
      //   this.viewValue = arr3D[0].id
      // }
      // 更换左侧
      setTimeout(() => {
        let arr = []
        for (let item of this.viewOptions) {
          arr = item.options.filter(item => item.id === this.lastViewValue)
          if (arr.length > 0) break
        }
        if (arr.length > 0) {
          let modelArr = [
            {
              modelUrl:
                axios.design.defaults.baseURL.replace('/', '') +
                '/noToken/basic/commonFile/get/fdht/bim_' +
                arr[0].id +
                '/primaryGraphics.f2d',
              id: arr[0].id
            }
          ]
          this.$emit('changeModel', modelArr)
        } else {
          //测试 -默认3d开始
          let modelArr = [
            {
              id: this.viewId,
              modelUrl:
                axios.design.defaults.baseURL.replace('/', '') +
                '/noToken/basic/commonFile/get/fdht/bim_' +
                this.viewId +
                '/3d.svf'
            }
          ]
          this.$emit('changeModel', modelArr)
        }
      }, 10)
    },
    // 联动开关
    linkageFlagChange(e) {
      this.listenClick()
    },
    // 关闭右侧拖拽框
    close() {
      this.$emit('navigationChange')
    },
    getBimfishApp3D(evt) {
      if (!this.linkageFlag) return
      const dbId = evt.dbIdArray[0]
      let model = this.bimfishApp3D.viewer.model
      if (click !== 0) {
        this.bimfishApp3D
          .getGuidBydbID(dbId, model, (error, guid) => {
            let resultGuid = this.optionsTypeL(guid)
            console.log('3d:' + resultGuid)
            this.bimfishApp2D.fitViewByGUID(resultGuid)
          })
          .catch(e => {
            console.log(e)
          })
        this.bimfishApp2D.selectByDbid(dbId, model)
      }
    },
    getBimfishApp2D(evt) {
      if (!this.linkageFlag) return
      const dbidArray = evt.dbIdArray ? evt.dbIdArray[0] : []
      let model = this.bimfishApp2D.findModelByid(this.arrCopy[0].id)
      if (click !== 1) {
        this.bimfishApp2D
          .getGuidBydbID(dbidArray, model, (error, guid) => {
            let resultGuid = this.optionsTypeR(guid)
            console.log('2d:' + resultGuid)
            this.bimfishApp3D.fitViewByGUID(resultGuid)
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    // 监听联动
    listenClick(arr) {
      this.bimfishApp3D.viewer.disableSelection(false) //场景开启
      if (!arr) return
      //let bimfishApp3D = this.bimfishApp3D
      this.bimfishApp3D.viewer.addEventListener('selection', this.getBimfishApp3D, false)
      this.eventTool3d = new BimfishApp.EventTool(this.bimfishApp3D.viewer)
      this.eventTool3d.activate()
      this.eventTool3d.on('singleclick', event => {
        click = 1 // 3d 点击
        console.log('singleclick')
      })
      this.bimfishApp2D.init(() => {
        this.bimfishApp2D.showModel(arr)
        this.arrCopy = arr
        this.bimfishApp2D.viewer.addEventListener('selection', this.getBimfishApp2D, false)

        this.eventTool2d = new BimfishApp.EventTool(this.bimfishApp2D.viewer)
        this.eventTool2d.activate()
        this.eventTool2d.on('singleclick', event => {
          click = 0 // 2d 点击
        })
      })
    },
    //区分视图类型 右侧
    optionsTypeR(guid) {
      if (this.type1 === 3) {
        // 图纸视图
        if (guid.indexOf('0_') === -1) {
          return (guid = '0_' + guid) //视图拼接 0_
        }
      } else if (this.type1 === 1) {
        // 3D
        return (guid = guid.replace('0_', ''))
      }
      return guid //其他类型待定
    },
    //区分视图类型 左侧
    optionsTypeL(guid) {
      if (this.type1 === 3) {
        // 图纸视图
        if (guid.indexOf('0_') === 0) {
          return (guid = guid.replace('0_', ''))
        }
      } else if (this.type1 === 1) {
        return (guid = '0_' + guid) // 3d
      }
      return guid //其他类型待定
    },
    // 加载2D视图
    load2dviewer(arr) {
      this.modelArr = arr
      let key = '465758F8f2B54E72b6956A8ba3625a73'
      let secret = '5De5712e99b0435AB47a41673B2B1F97faf51014C47041fB97cc12c1bEb7b185'
      this.bimfishApp2D = new BimfishApp('viewer-local2d', key, secret, {
        MemoryLimited: true,
        calibrationUnits: 'mm'
      })
      this.listenClick(arr)
    },
    // 获取所有的二三维视图列表
    async getView() {
      // let obj = {
      //   name: '',
      //   sourceFileId: getParams('fileId')
      // }
      let id = this.viewId
      // 获取bim信息
      // let res = await fileApi.getBimViewerList(obj)
      let res = await fileApi.getBimViewerListByViewId(id)
      if (res.data) {
        let list3d = res.data.filter(item => item.type === 1)
        let listPlane = res.data.filter(item => item.type === 2)
        let listPaper = res.data.filter(item => item.type === 3)
        this.viewOptions[0].options = list3d
        this.viewOptions[1].options = listPlane
        this.viewOptions[2].options = listPaper
        if (listPlane.length > 0) {
          this.viewValue = listPlane[0].id
        } else if (listPaper.length > 0) {
          this.viewValue = listPaper[0].id
        } else {
          this.viewValue = list3d[0].id
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.right-content {
  height: 100%;
}
.handle-box-btn {
  i {
    padding-right: 10px;
  }
}
.handle-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &-content {
    margin-bottom: 10px;
  }
}
.viewer-local2d {
  /*height: 100%;*/
  height: calc(100% - 42px);
  margin: 0;
  flex: 1;
  background-color: #f0f8ff;
  position: relative;
}
</style>
