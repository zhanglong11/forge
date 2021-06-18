<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-25
@任务类型: 全新代码，添加标记属性面板组件
-->
<!--
@任务名称: 3098|标记功能修改
@开发人员: 席阳冰星
@修改日期: 2020-05-25
@任务类型:
-->
<template>
  <div class="sign right-content">
    <Drag title="标记" @close="close">
      <div class="sign-panel">
        <el-collapse v-model="activeName">
          <el-collapse-item v-for="item in stageList" :key="item.id" :name="item.id">
            <template slot="title">
              <div class="item-title">
                <div class="title-name">{{ item.stageName }}</div>
                <div>
                  <el-button
                    type="text"
                    style="margin-right: 10px;"
                    @click="
                      e => {
                        e.stopPropagation()
                        showAddSign(item)
                      }
                    "
                    >添加</el-button
                  >
                  <el-switch
                    v-model="item.toggle"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    style="margin-right: 6px;"
                    @click.native="
                      e => {
                        e.stopPropagation()
                        handleToggle(item)
                      }
                    "
                  >
                  </el-switch>
                </div>
              </div>
            </template>

            <div class="sign-items-content">
              <div v-for="sItem in item.signList" :key="sItem.id" class="sign-item" @click="showMark(sItem, true)">
                <div class="sign-item-top">
                  <div>{{ sItem.stampName }}</div>
                  <div>
                    <span class="tag-default" :class="statusList[sItem.status - 1]['class']">{{
                      statusList[sItem.status - 1]['label']
                    }}</span>
                    <el-button
                      type="text"
                      @click="
                        e => {
                          e.stopPropagation()
                          deleteMark(sItem.id)
                        }
                      "
                      >删除</el-button
                    >
                  </div>
                </div>
                <div class="sign-item-bottom">
                  <div>标记人：{{ sItem.creatorName }}</div>
                  <div>接收人</div>
                  <div>{{ moment(sItem.createTime).format('YYYY-MM-DD') }}</div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </Drag>

    <EditSignModal
      :visible="visibleEditSign"
      :stageName="stageName"
      :title="title"
      :position="position"
      :editForm="editForm"
      @closeSignModal="closeSignModal"
      @saveMark="saveMark"
    />
  </div>
</template>

<script>
import Drag from '../component/Drag'
import EditSignModal from './editSignModal'
import fileApi from '@/api/design/file'
import api from '@/api/bim/mark'
import { getParams } from '@/utils/index'
export default {
  components: { Drag, EditSignModal },
  data() {
    return {
      statusList: [
        {
          value: 1,
          label: '未确认',
          class: 'not-sure'
        },
        {
          value: 2,
          label: '已确认',
          class: 'has-sure'
        },
        {
          value: 3,
          label: '已解决',
          class: 'has-solve'
        },
        {
          value: 4,
          label: '已关闭',
          class: 'has-close'
        }
      ],
      // 默认展开某项
      activeName: '1',
      visibleEditSign: false,
      targetId: '',
      // 阶段列表
      stageList: [],
      // 当前位置
      position: null,
      // 当前阶段名
      stageName: '',
      // 编辑内容
      editForm: {},
      title: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    bimfishApp() {},
    visibleEditSign(e) {
      if (!e) this.bimfishApp.viewer.impl.canvas.removeEventListener('click', this.handleMouseClick)
    }
  },
  mounted() {
    this.getStageList()
  },
  methods: {
    // 删除标记
    async deleteMark(id) {
      this.$confirm('确定要删除此标记吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.deleteMark(id).then(res => {
            this.$message.success('删除成功')
            let item = this.bimfishApp.imageMark[id]
            if (item) item.setVisible(false)
            this.successCallBack()
          })
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 操作成功callbacl
    successCallBack() {
      this.editSuccessCallBack()
    },
    // 获取所有流程列表
    async getStageList() {
      let res = await fileApi.getHistoryList(getParams('fileId'))
      console.log(res)
      // 没有流程，则展示审核前区
      this.stageList = [
        {
          stageName: '审核前'
        }
      ]
      if (res.data && res.data.length > 0) {
        // 可能有多个流程，暂时默认取第一个
        this.getList(res.data[0].id)
      }
    },
    // 获取单个流程列表
    async getList(id) {
      let res = await this.axios.design.post('process/instance/detail/' + id)
      this.stageList.push(...res.data.stages)
      for (let item of this.stageList) {
        this.getMarkList(item, item.stageName)
      }
    },
    // 获取单流程中的mark列表
    async getMarkList(item, stageName) {
      let form = {
        batchCode: this.$store.state.bim.batchCode,
        projectFileId: getParams('fileId'),
        projectId: localStorage.getItem('projectId'),
        stageName: stageName,
        version: this.$store.state.bim.versionInfo.version
      }
      let res = await api.getMarkList(form)
      this.$set(item, 'signList', res.data)
    },
    deleteItem(bigItem, smallItem) {
      let bigIndex = bigItem.signList.findIndex(item => item.id === smallItem.id)
      bigItem.splice(bigIndex, 1)
    },
    showMark(item, flag = true) {
      let form = JSON.parse(JSON.stringify(item))
      this.editForm = form
      this.stageName = form.stageName
      this.visibleEditSign = true
      // 未确认、已确认、已解决、已关闭
      let textureList = [
        '/static/bim/notSure.png',
        '/static/bim/makeSure.png',
        '/static/bim/finish.png',
        '/static/bim/close.png'
      ]
      // 先隐藏一波
      // if (flag) this.hideAllMark()

      this.bimfishApp.addDrawableIconMarkerByPos(
        form.id,
        textureList[form.status - 1],
        JSON.parse(form.position),
        ({ screenPoint, id }) => {
          console.log('id:', id)
        },
        true
      )
    },
    // 保存当前form
    async saveMark(e) {
      if (e.id) {
        this.editSure(e)
      } else {
        this.addSure(e)
      }
    },
    editSuccessCallBack() {
      this.closeSignModal()
      let bimfishApp = this.bimfishApp
      for (let key in bimfishApp.imageMark) {
        let item = bimfishApp.imageMark[key]
        item.setVisible(false)
      }
      this.getStageList()
    },
    async editSure(form) {
      let res = await api.updateMark(form)
      this.$message.success('修改成功')
      this.editSuccessCallBack()
    },
    async addSure(form) {
      let res = await api.addMark(form)
      this.$message.success('新增成功')
      this.editSuccessCallBack()
    },
    // 隐藏所有2d标记
    hideAllMark(id) {
      if (id) {
        let item = this.bimfishApp.imageMark[id]
        item.setVisible(false)
      } else {
        for (let key in this.bimfishApp.imageMark) {
          let item = this.bimfishApp.imageMark[key]
          item.setVisible(false)
        }
      }
    },
    // switch切换
    handleToggle(e) {
      if (!e.toggle) {
        //隐藏改item底下所有的标记
        if (!e.signList) return
        for (let sign of e.signList) {
          let item = this.bimfishApp.imageMark[sign.id]
          if (item) item.setVisible(false)
        }
      } else {
        let textureList = [
          '/static/bim/notSure.png',
          '/static/bim/makeSure.png',
          '/static/bim/finish.png',
          '/static/bim/close.png'
        ]
        if (!e.signList) return
        for (let sign of e.signList) {
          this.bimfishApp.addDrawableIconMarkerByPos(
            sign.id,
            textureList[sign.status - 1],
            JSON.parse(sign.position),
            ({ screenPoint, id }) => {
              console.log('id:', id)
            },
            true
          )
        }
      }
    },
    // 点击事件监听
    initListen() {
      this.bimfishApp.pickPosition(e => {
        if (e) {
          let id = new Date().valueOf()
          console.log(e)
          this.position = e.point
          this.handleMouseClick(e.point, id)
          this.offAddMark()
        }
      })
    },
    // 退出新增效果
    offAddMark() {
      if (this.bimfishApp.eventTool) {
        this.bimfishApp.closePickPosition()
        this.bimfishApp.eventTool.off('singleclick', () => {})
      }
    },
    // 获取选中的构件的guid：用于测试
    getSelectionGuid() {
      this.bimfishApp.getComponentGuid(function(err, guid) {
        console.log('guid:', guid)
      })
    },
    handleMouseClick(pos, id) {
      let bimfishApp = this.bimfishApp
      // 保存的是position
      bimfishApp.addDrawableIconMarkerByPos(id, '/static/bim/finish.png', pos, ({ screenPoint, i }) => {})
    },
    // 根据gui进行文件标
    markByGuid(guidArray) {
      let bimfishApp = this.bimfishApp
      const icon = '/static/bim/finish.png'
      const pos = {
        x: -52.10022736554026,
        y: 198.79972297698254,
        z: -33.95395402589435
      }
      bimfishApp.addDrawableIconMarkerByGUID(
        ['cdba488d-b9a4-44b7-95ac-472b2888a03c-0006d971'],
        icon,
        ({ screenPoint, guid }) => {
          console.log('screenPoint:', screenPoint, guid)
        }
      )
    },
    // 新增
    showAddSign(e) {
      this.stageName = e.stageName
      this.visibleEditSign = true
      this.title = '新增标记'
      // 隐藏所有的标记
      if (this.bimfishApp) {
        for (let key in this.bimfishApp.imageMark) {
          let item = this.bimfishApp.imageMark[key]
          item.setVisible(false)
        }
      }

      // 监听canvas点击事件：添加标记
      this.initListen()
    },
    // model消失
    closeSignModal() {
      let bimfishApp = this.bimfishApp
      // 去除监听事件
      this.offAddMark()
      this.visibleEditSign = false
      this.editForm = {}
      this.hideAllMark()
      this.bimfishApp.imageMark = {}
    },
    close() {
      this.$emit('navigationChange')
    }
  }
}
</script>

<style lang="less" scoped>
@notSure: red;
@hasSure: rgb(254, 148, 0);
@hasSolve: rgb(85, 202, 134);
@hasclose: rgb(153, 153, 153);
.tag-default {
  padding: 4px 6px;
  background: red;
  color: #fff;
  border-radius: 5px;
  margin-right: 10px;
}
.not-sure {
  background: @notSure;
}
.has-sure {
  background: @hasSure;
}
.has-solve {
  background: @hasSolve;
}
.has-close {
  background: @hasclose;
}

.sign {
  .sign-panel {
    /*height: 100%;*/
    max-height: 480px;
    overflow-y: auto;
    .item-title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .title-name {
        font-weight: bold;
        margin-left: 10px;
      }
    }
    .sign-items-content {
      cursor: pointer;
      .sign-item {
        font-size: 14px;
        border: solid 1px #e5e5e5;
        margin: 12px 4px;
        border-radius: 4px;
        padding: 4px;
        .sign-item-top {
          display: flex;
          justify-content: space-between;
        }
        .sign-item-bottom {
          display: flex;
          justify-content: space-between;
          div:nth-child(1),
          div:nth-child(2) {
            width: 30%;
          }
        }
      }
    }

    /deep/ .el-collapse-item__content {
      padding-bottom: 0px;
    }
  }
}
</style>
