<!--
 * @Description:
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-04-28 09:41:14
 * @LastEditTime: 2020-05-26 18:09:39
 -->
<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-24
@任务类型: 全新代码，添加标注属性面板组件
-->
<template>
  <div class="mark right-content">
    <Drag title="标注" :addFlag="true" @add="addMark">
      <VersionFilter :dataList="listCopy" @selectChange="selectChange" @userChange="userChange" />
      <div class="mark-panel">
        <div v-show="addMarkFlag" style="margin-top: 10px;">
          <div class="mark-toolbar">
            <div class="u-icon u45" @click="setSnap(1)">尺寸</div>
            <div class="u-icon u143" @click="setSnap(2)">角度</div>
            <div class="u-icon u147" @click="setRich(3)">标高</div>
            <div class="u-icon u151" @click="setRich(4)">坐标</div>
          </div>
          <div class="flex-base">
            <el-button @click="quit">退出标注状态</el-button>
            <el-button type="primary" @click="showModal">保存</el-button>
          </div>
        </div>

        <div class="mark-content">
          <MarkItem
            v-for="item in list"
            :key="item.id"
            :item="item"
            @updateLabelList="getBimLabelList"
            @showMarkPoint="showMarkPoint"
            @showMarkSnap="showMarkSnap"
            @hideAll="hideAll"
          />
        </div>
      </div>
    </Drag>
  </div>
</template>

<script>
import VersionFilter from '../component/versionFilter'
import Drag from '../component/Drag'
import MarkItem from './markItem'
import { MeasureManager } from '../../../../../public/static/lib/facilities/pointMeasureManager/index.js'
import api from '@/api/bim/label'
import { getParams } from '@/utils/index'
export default {
  components: {
    Drag,
    MarkItem,
    VersionFilter
  },
  data() {
    return {
      list: [],
      listCopy: [],
      userList: [],
      pm: null,
      addMarkFlag: false,
      version: null,
      projectFileId: '',
      projectId: '',
      creatorName: '',
      flag: [],
      i: 0,
      // 定位
      position: null,
      detailList: [],
      form: {
        // 属性数组
        detailList: [
          {
            content: ''
          }
        ],
        name: ''
      }
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    // 版本切换
    version: {
      immediate: true,
      handler: function() {
        this.getBimLabelList()
      }
    }
  },
  mounted() {
    this.pm = new MeasureManager(this.bimfishApp.viewer)
  },
  methods: {
    hideAll() {
      if (this.pm) {
        this.pm.hideAll()
      }
    },
    // 展示隐藏尺寸和角度
    showMarkSnap(item, flag) {
      if (flag) {
        this.loadSnapData(item)
      } else {
        if (this.pm._indicators && this.pm._indicators.length > 0) {
          this.pm._indicators.map(indicater => {
            if (indicater.dataId === item.id) {
              indicater.destory()
            }
          })
        }
      }
    },
    loadSnapData(data) {
      if (!this.pm) return
      let points = JSON.parse(data.content)
      for (let i = 0; i < points.length; i++) {
        points[i].id = data.id
        this.$nextTick(() => {
          this.pm.loadMeasurementData(points)
        })
      }
    },
    // /展示隐藏标高和坐标
    showMarkPoint(item, flag) {
      if (flag) {
        this.addRichTextMarkerByPos(item.id, JSON.parse(item.content), item.type)
      } else {
        let target = this.bimfishApp.richTextMarks[item.id]
        if (target) target.setVisible(false)
      }
    },
    // 标高和坐标
    setRich(flag) {
      if (this.pm) {
        this.pm.endAdding()
      }
      this.flag[this.i++] = flag
      this.bimfishApp.pickPosition(e => {
        if (e) {
          let id = new Date().valueOf()
          this.position = e.point
          this.addRichTextMarkerByPos(id, e.point, flag)
          this.offPick()
        }
      })
    },
    addRichTextMarkerByPos(id, pos, flag) {
      if (typeof pos === 'string') {
        pos = JSON.parse(pos)
      }
      let html = ''
      if (flag === 3) {
        //标高：点
        html = `<div class="elevation">标高：${pos.z}mm</div>`
      } else if (flag === 4) {
        //坐标
        html = `<div class="elevation pos">
         <p>X坐标：${pos.x}</p>
         <p>Y坐标：${pos.y}</p>
         <p>Z坐标：${pos.z}</p>
         </div>`
      }
      this.bimfishApp.addRichTextMarkerByPos(id, pos, html)
    },
    // 退出
    offPick() {
      this.bimfishApp.closePickPosition()
      this.bimfishApp.eventTool.off('singleclick', () => {})
    },
    // 获取列表
    async getBimLabelList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id,
        creatorName: this.creatorName
      }
      let res = await api.getBimLabelList(form)
      this.list = res.data
      this.listCopy = JSON.parse(JSON.stringify(res.data))
    },
    userChange(e) {
      this.list = e
    },
    selectChange(v) {
      this.version = v.version
      this.projectFileId = v.projectFileId
      this.projectId = v.projectId
    },
    // 新增标注
    addMark() {
      this.addMarkFlag = true
      this.bimfishApp.viewer.disableSelection(false)
    },
    // 保存
    showModal() {
      this.$prompt('输入标注名称', {
        customClass: 'message',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '不能为空'
      })
        .then(({ value }) => {
          // 成功操作
          this.save(value)
        })
        .catch(() => {
          // 取消操作
        })
    },
    //保存方法
    async save(value) {
      this.i = 0
      let data = null
      let nameFlag = null
      this.flag.forEach(item => {
        if (item === 1 || item === 2) {
          data = this.pm.getMeasurementData()
        } else {
          if (typeof this.position === 'string') {
            data = this.position
          } else {
            data = JSON.stringify(this.position)
          }
        }
        this.detailList.push({
          content: JSON.stringify(data),
          id: '',
          labelId: '',
          type: item
        })
      })
      let form = {
        detailList: this.detailList,
        isActive: 0,
        viewId: this.$store.state.bim.bim3DArr[0].id,
        name: value
      }
      for (let key in this.bimfishApp.richTextMarks) {
        let item = this.bimfishApp.richTextMarks[key]
        if (item) item.setVisible(false)
      }
      let res = await api.addBimLabel(form)
      this.$message.success('保存成功')
      this.getBimLabelList()
      this.quit()
      this.clearkAll()
      setTimeout(() => {
        this.bimfishApp.viewer.disableSelection(true)
      }, 100)
    },
    clearkAll() {
      this.form = {
        detailList: [],
        isActive: 0,
        name: ''
      }
      this.flag = []
      this.detailList = []
    },
    quit() {
      this.addMarkFlag = false
      if (this.pm) {
        this.pm.hideAll()
        this.pm.endAdding()
      }
      for (let key in this.bimfishApp.richTextMarks) {
        let item = this.bimfishApp.richTextMarks[key]
        if (item) item.setVisible(false)
      }
      this.clearkAll()
      this.bimfishApp.clearSelect()
      setTimeout(() => {
        this.bimfishApp.viewer.disableSelection(true)
      }, 100)
    },
    setSnap(flag) {
      this.flag[this.i++] = flag
      if (this.pm) {
        this.pm.hideAll()
        this.pm.endAdding()
      }
      //this.pm = new MeasureManager(this.bimfishApp.viewer)
      if (!this.pm) return
      if (flag === 1) {
        this.pm.setMeasureType(Bimfish.Viewing.MeasureCommon.MeasurementTypes['MEASUREMENT_DISTANCE'])
      } else if (flag === 2) {
        this.pm.setMeasureType(Bimfish.Viewing.MeasureCommon.MeasurementTypes['MEASUREMENT_ANGLE'])
      } else if (flag === 3) {
        this.pm.setMeasureType(Bimfish.Viewing.MeasureCommon.MeasurementTypes['MEASUREMENT_ELEVATION'])
      } else if (flag === 4) {
        this.pm.setMeasureType(Bimfish.Viewing.MeasureCommon.MeasurementTypes['MEASUREMENT_COORDINATE'])
      }
      this.pm.startAdding()
    },
    getSnapData() {
      let data = this.pm.getMeasurementData()
    },
    close() {
      this.$emit('navigationChange')
    }
  }
}
</script>

<style lang="less" scoped>
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.mark {
  .mark-panel {
    height: 100%;
    .mark-toolbar {
      display: flex;
      justify-content: space-between;
      background: #fff;
      border-radius: 4px;
      font-size: 12px;
      padding: 6px;

      .u-icon {
        background-repeat: no-repeat;
        background-size: contain;
        padding: 4px 0px 4px 26px;
        cursor: pointer;
      }
      .u45 {
        background-image: url('/static/bim/u45.png');
      }
      .u143 {
        background-image: url('/static/bim/u143.png');
        background-size: 16px 16px;
        background-position: 6px center;
      }
      .u147 {
        background-image: url('/static/bim/u147.png');
        background-size: 24px 24px;
        background-position: 2px center;
      }
      .u151 {
        background-image: url('/static/bim/u151.png');
        background-size: 22px 20px;
        background-position: 2px center;
      }
    }

    .mark-content {
      height: calc(100% - 42px);
      margin-top: 10px;
      overflow: auto;
      .handle {
        .el-switch {
          margin-right: 5px;
          top: -1px;
        }
      }
    }
  }
}
</style>
