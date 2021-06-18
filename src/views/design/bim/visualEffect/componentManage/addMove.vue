<!--
 * @Description: 构件移动
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-15 09:07:46
 * @LastEditTime: 2020-05-26 10:24:05
 -->
<template>
  <div v-if="visible" class="modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="model-content">
      <div class="model-form">
        <div class="model-content-close">
          <span class="model-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <section class="form-content">
          <header class="flex-base">
            <span>路径名称</span>
            <el-input v-model="form.name" class="w-70"></el-input>
          </header>
          <!-- <div class="flex-base">
            <span>移动方式：</span>
            <el-select v-model="form.moveWay" placeholder="请选择" class="w-70">
              <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </div> -->

          <section class="sectoion-move">
            <div class="addNew">
              <span style="display: inline-block;margin-right:30px">点选点位:</span>
              <el-button type="primary" style="width:68%" @click="addNewPoint">
                新增点位
                <i class="el-icon-plus"></i>
              </el-button>
            </div>
            <vxe-table :data="tableData">
              <vxe-table-column field="pointName" title="点位"></vxe-table-column>
              <vxe-table-column field="heightDifference" title="相对高差">
                <template slot-scope="cell">
                  <el-input
                    v-model="cell.row.heightDifference"
                    @change="
                      e => {
                        heightDifferenceChange(cell.row, e)
                      }
                    "
                  >
                    <template slot="append">mm</template>
                  </el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column field="moveSpeed" title="移动速度">
                <template slot-scope="cell">
                  <el-input v-if="cell.rowIndex !== 0" v-model="cell.row.moveSpeed">
                    <template slot="append">m/s</template>
                  </el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column title="" width="40">
                <template slot-scope="item">
                  <el-button type="text" @click="reduce(item)"><i class="el-icon-close"></i></el-button>
                </template>
              </vxe-table-column>
            </vxe-table>
          </section>
          <div class="flex-bases" style="border-bottom:1px solid #ccc;margin-bottom: 4px;">
            <span>选择构件：</span>
            <el-button type="primary" class="flex-bases-btn" @click="selectAll">点选</el-button>
            <el-checkbox
              v-model="form.status"
              :true-label="1"
              :false-label="2"
              :disabled="disabled"
              style="left:28%"
              @change="StatusClick"
              >是否闭合</el-checkbox
            >
          </div>
        </section>
        <div class="save-btn flex-base">
          <el-button type="primary" @click="preview">预览</el-button>
          <el-button type="success" @click="saveJudge">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SegmentsRunner, { MovingLineSegmentsGroup } from '../../../../../../public/static/lib/facilities/segmentsRunner'
import { getParams } from '@/utils/index'
import api from '@/api/bim/visualEffect'
import animateMove from '@/mixins/animateMove'
export default {
  name: 'AddMove',
  components: {},
  mixins: [animateMove],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editForm: {},
    title: String,
    nameIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      form: {
        name: '构件移动' + (this.nameIndex + 1),
        rotationSpeed: '',
        rotationAngle: '',
        moveWay: ''
      },
      types: [
        // {
        //   value: 1,
        //   label: '随方向转动'
        // },
        {
          value: 2,
          label: '水平移动'
        }
      ],
      tableData: [],
      copeRes: [],
      moveState: 1, //预览初始状态
      status: 2, // 默认不闭合
      pointSelct: [], //移动构件位置
      indexItem: 1,
      startStua: '',
      disabled: false
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    editForm() {
      if (_.isEmpty(this.editForm)) return
      this.form = _.cloneDeep(this.editForm)
      console.log(this.form)
      this.startStua = this.form.status
      console.log(this.startStua)
      this.$set(this.form, 'moveWay', this.form.bimComponentMoveDetaiEntityList[0].moveWay)
      // this.form.moveWay = this.form.bimComponentMoveDe / taiEntityList[0].moveWay
      this.tableData = JSON.parse(JSON.stringify(this.form.bimComponentMoveDetaiEntityList))
      this.bimfishApp.clearSelect()
      this.tableData.forEach(row => {
        let position = JSON.parse(row.position)
        this.handleMouseClick(position, row.id)
      })
      return
      this.bimfishApp.select(this.form.componentGuids.split(','), true)
    },
    visible(e) {
      if (e) {
        if (_.isEmpty(this.editForm)) {
          this.form.name = '构件移动' + (this.nameIndex + 1)
        }
      }
    }
  },
  methods: {
    //开启场景选择
    selectAll() {
      if (this.tableData.length < 2) return this.$message.error('请添加两个以上的点位')
      this.bimfishApp.viewer.disableSelection(false)
      // this.bimfishApp.viewer.setClickConfig('click', 'onObject', 'focus')
      // this.bimfishApp.viewer.setClickConfig('click', 'offObject', 'selectOnly')
      this.disabled = false
      this.bimfishApp.pickPosition(e => {
        this.pointSelct = e.point
        // this.bimfishApp.viewer.select(e.dbId, e.model)
      })
      this.form.status = 2
    },
    //是否闭合选择
    StatusClick(e) {
      //新增
      if (_.isEmpty(this.editForm)) {
        if (e === 1) {
          if (this.pointSelct.length === 0) {
            this.$message.error('重点构件')
            this.form.status = 2
            return
          }
          this.updateStatus()
        } else if (e === 2) {
          this.tableData.splice(this.tableData.length - 1, 1)
        }
      } else if (!_.isEmpty(this.editForm)) {
        //编辑修改
        //初始未闭合状态
        if (this.startStua === 2) {
          if (e === 1) {
            if (this.pointSelct.length === 0) {
              this.$message.error('重点构件')
              this.disabled = true
              return
            }
            this.updateStatus()
          } else if (e === 2) {
            this.tableData.splice(this.tableData.length - 1, 1)
          }
        } else if (this.startStua === 1) {
          //初始闭合状态
          if (e === 2) {
            let deletes = this.tableData[this.tableData.length - 1]
            this.tableData.splice(this.tableData.length - 1, 1)
            if (deletes.id) {
              this.bimfishApp.imageMark[deletes.id].setVisible(false)
            }
          } else {
            if (this.pointSelct.length === 0) {
              this.$message.error('重点构件')
              this.disabled = true
              return
            }
            this.updateStatus()
          }
        }
      }
    },
    //闭合状态改变末点添加
    updateStatus() {
      this.tableData.push({
        pointName: '末位点',
        moveSpeed: 10,
        heightDifference: 0, //e.point.z
        position: JSON.stringify(this.pointSelct),
        indexItem: this.tableData.length + 1
      })
      this.moveState = 1
    },
    async preview(f) {
      this.form.moveWay = 2
      if (!this.form.moveWay) return this.$message.error('请选择移动方式')
      //水平方向移动
      this.moveState = 0
      if (this.tableData.length < 2) return this.$message.error('请添加两个以上的点位')
      let movePath = []
      let endPath = []
      console.log(this.tableData)
      for (let i = 0; i < this.tableData.length; i++) {
        let nowItem = this.tableData[i]
        let nextItem = this.tableData[i + 1]
        if (nextItem) {
          let s = JSON.parse(nowItem.position)
          let e = JSON.parse(nextItem.position)
          movePath.push({
            start: new THREE.Vector3(s.x, s.y, s.z),
            end: new THREE.Vector3(e.x, e.y, e.z),
            speed: nextItem.moveSpeed
          })
        }
      }
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let selection = res.selections[0]
      // 先考虑单模下 applyTransform(transform, model, fragId)
      // 初始化位置
      let initPosition = JSON.parse(this.tableData[0].position)
      let dbids = selection.dbIdArray
      const fragList = selection.model.getFragmentList()
      let FragIdToDbid = fragList.fragments.fragId2dbId
      for (let dbid of dbids) {
        let fragIds = []
        for (let frag in FragIdToDbid) {
          if (FragIdToDbid[frag] === dbid) {
            fragIds.push(frag)
          }
        }
        let center = null
        //闭合
        console.log(this.form.status)
        if (this.form.status === 1) {
          if (f === false) {
            this.moveState = 1
            this.close()
            return
          }
          //闭合调用
          setTimeout(() => {
            this.moveBegain(movePath, selection.model, fragIds, movePath[movePath.length - 1].end)
          }, 10)
          this.moveState = 1
        } else {
          //非闭合状态下
          //水平方向移动
          if (f === false) {
            movePath[0].speed = 0 //关闭速度设置为0
            setTimeout(() => {
              this.clearAll()
            }, 100)
          }
          //获取构件的中心位置
          this.bimfishApp.getComponentCenter(dbid, selection.model, e => {
            let poss = {
              x: initPosition.x - e.x,
              y: initPosition.y - e.y,
              z: initPosition.z - e.z
            }
            center = e //中心点三维对象
            console.log(fragIds)
            this.positionChange(selection.model, fragIds, poss)
            setTimeout(() => {
              this.moveBegain(movePath, selection.model, fragIds, center)
            }, 10)
          })
        }
      }
    },
    moveBegain(movePath, model, fragIdsArray, center) {
      // return
      let runner = new SegmentsRunner()
      let taskControl = runner.runWith(
        movePath,
        pos => {
          let position = {
            x: pos.x - center.x,
            y: pos.y - center.y,
            z: pos.z - center.z
          }
          this.positionChange(model, fragIdsArray, position)
        },
        dir => {
          console.log('dir change:', dir)
        },
        () => {
          console.log('done')
        }
      )
    },
    // 更改相对高度，则删除标记，再新增
    heightDifferenceChange(row, e) {
      if (row.id) {
        let position = JSON.parse(row.position)
        position.z = e
        this.bimfishApp.imageMark[row.id].setVisible(false)
        this.bimfishApp.imageMark[row.id] = null
        row.position = JSON.stringify(position)
        this.handleMouseClick(position, row.id)
      }
    },
    reduce(item) {
      let index = item.rowIndex
      this.tableData = this.tableData.filter((item, i) => i !== index)
      console.log(this.bimfishApp.imageMark[item.row.id])
      if (this.bimfishApp.imageMark[item.row.id]) {
        this.bimfishApp.imageMark[item.row.id].setVisible(false)
      }
    },
    // 清除还原
    clearAll(newTable) {
      //this.form.bimComponentMoveDetaiEntityList[0].moveWay
      this.form = {
        name: '构件移动' + (this.nameIndex + 1),
        rotationSpeed: '',
        rotationAngle: '',
        moveWay: ''
      }
      // this.tableData = []
      if (newTable) {
        newTable.forEach(item => {
          if (this.bimfishApp.imageMark[item.id]) {
            this.bimfishApp.imageMark[item.id].setVisible(false)
          }
        })
      } else {
        this.tableData.forEach(item => {
          if (this.bimfishApp.imageMark[item.id]) {
            this.bimfishApp.imageMark[item.id].setVisible(false)
          }
        })
        this.bimfishApp.imageMark = {}
      }

      this.tableData = []
      this.moveState = 1
      this.pointSelct = []
      this.bimfishApp.clearSelect()
      this.bimfishApp.viewer.disableSelection(true) //关闭场景
    },
    // 关闭当前model
    close() {
      //console.log(this.moveState)
      if (this.moveState === 0) {
        this.preview(false)
      } else {
        this.clearAll()
      }
      this.$emit('close')
      this.indexItem = 1
    },
    closealert() {
      this.$message.warning('请先关闭弹出框')
    },
    // 新增点位
    addNewPoint() {
      this.bimfishApp.pickPosition(e => {
        if (e) {
          let id = new Date().valueOf()
          this.handleMouseClick(e.point, id)
          this.offAddMark()
          let index = this.tableData.length + 1
          this.tableData.push({
            pointName: '点位' + index,
            moveSpeed: 10,
            heightDifference: 0, //e.point.z
            id: id,
            position: JSON.stringify(e.point),
            indexItem: this.indexItem++
          })
        }
        return this.offAddMark()
      })
    },
    handleMouseClick(pos, id) {
      let bimfishApp = this.bimfishApp
      // 保存的是position
      bimfishApp.addDrawableIconMarkerByPos(id, '/static/bim/finish.png', pos, ({ screenPoint, i }) => {})
    },
    // 退出新增效果
    offAddMark() {
      if (this.bimfishApp.eventTool) {
        this.bimfishApp.clearSelect()
        this.bimfishApp.closePickPosition()
        this.bimfishApp.eventTool.off('singleclick', () => {})
      }
    },
    // 保存
    async saveJudge() {
      if (!this.form.name) return this.$message.error('路径名称必填')
      if (this.tableData.length < 2) return this.$message.error('请添加两个以上的点位')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) return this.$message.error('请选择构件')
      this.tableData.forEach(item => (item.moveWay = this.form.moveWay))
      console.log(this.tableData)
      let form = {
        bimComponentMoveDetaiEntityList: this.tableData,
        componentGuids: res.selectionGuidArr.join(','),
        name: this.form.name,
        id: this.form.id,
        status: this.form.status || 2
      }
      if (form.id) {
        this.bimComponentMoveUpdate(form)
        //this.clearAll()
      } else {
        Object.assign(form, {
          isActive: 0,
          viewId: this.$store.state.bim.bim3DArr[0].id
        })
        this.bimComponentMoveAdd(form)
        //this.clearAll()
      }
    },
    // 更新旋转
    async bimComponentMoveUpdate(form) {
      let res = await api.bimComponentMoveUpdate(form)
      this.$message.success('编辑成功')
      //this.close()
      this.$emit('update')
    },
    // 新增旋转
    async bimComponentMoveAdd(form) {
      let res = await api.bimComponentMoveAdd(form)
      this.$message.success('新增成功')
      //this.close()
      this.$emit('update')
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.vxe-table.size--small .vxe-body--column:not(.col--ellipsis),
.vxe-table.size--small .vxe-footer--column:not(.col--ellipsis),
.vxe-table.size--small .vxe-header--column:not(.col--ellipsis) {
  padding: 6px 0;
}
/deep/.vxe-table--body-wrapper.body--wrapper {
  height: 84px;
  overflow-y: auto;
}
/dee/.el-checkbox__input {
  padding-top: 8px;
}
/deep/.el-checkbox__label {
  padding-top: 8px;
}
.sectoion-move {
  height: 192px;
  // overflow-y: auto;
}
.save-btn {
  button {
    width: 100%;
  }
}
.hr-split {
  margin-bottom: 4px;
}
.w-70 {
  width: 70%;
}
.m-10 {
  margin: 10px 0;
}
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.flex-bases {
  display: flex;
  padding-bottom: 4px;
  .flex-bases-btn {
    margin-left: 17px;
  }
}
.addNew {
  padding: 10px 0;
  button {
    width: 100%;
  }
}
.form-content {
  li {
    padding-bottom: 12px;
  }
  /deep/.vxe-table--main-wrapper {
    height: 126px;
    // overflow-y: auto;
  }
}
.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  /deep/ .el-input-group__append {
    padding: 0 4px;
  }
  .mask {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: transparent;
    /*opacity: 0.5;*/
    z-index: 90;
  }

  .model-content {
    padding: 6px 10px;
    width: 360px;
    position: absolute;
    bottom: 0px;
    right: 0;
    z-index: 100;
    &-close {
      /*position: absolute;*/
      /*right: 1px;*/
      /*top: -12px;*/
      font-size: 24px;
      overflow: hidden;
      margin-bottom: 10px;
      .model-tit {
        float: left;
        font-size: 14px;
        font-weight: bold;
      }
      i {
        cursor: pointer;
        color: #2e79cc;
        float: right;
      }
    }
  }
  .model-form {
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    padding-top: 10px;
    position: relative;
    z-index: 100;
  }
  @media (min-height: 320px) {
    .model-form {
      max-height: 300px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 360px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 965px) {
    .model-form {
      max-height: 364px;
      // overflow-y: auto;
    }
  }
}
</style>
