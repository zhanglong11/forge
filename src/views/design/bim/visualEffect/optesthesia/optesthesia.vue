<!--
 * @Description: 视觉方案
 * @Version:
 * @Autor:席阳冰星
 * @Date: 2020-05-08 15:34:59
 * @LastEditTime: 2020-05-26 17:01:34
 -->
<template>
  <div class="scheme">
    <!-- 视觉方案 -->
    <section class="view">
      <div class="flex-base">
        <span>视觉方案</span>
        <i class="el-icon-circle-plus-outline cursor" @click="addView"></i>
      </div>
      <el-table :data="filterList" tooltip-effect="light" style="width:100%;" max-height="200" class="handtab">
        <el-table-column
          prop="name"
          align="center"
          label="方案名称"
          width="65px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="creatorName"
          align="center"
          label="创建者"
          width="60px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column align="center" label="创建时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120px">
          <template slot-scope="scope">
            <div class="list-item-btn-box">
              <i class="el-icon-edit-outline" @click="btnEdit(scope.row)"></i>
              <el-switch
                v-model="scope.row.hideView"
                @change="
                  e => {
                    BimOptesthesiaProgramShowChange(scope.row, e)
                  }
                "
              ></el-switch>
              <i
                class="el-icon-delete-solid"
                @click="btnDelete(scope.row, viewDeleteSure, '是否要删除此视觉方案且包括已绑定的动画方案？')"
              ></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 火焰效果 -->
    <section class="fire">
      <div class="flex-base">
        <span>火焰</span>
        <i class="el-icon-circle-plus-outline cursor" @click="addFire"></i>
      </div>
      <el-table
        :data="fireList"
        tooltip-effect="light"
        style="width:100%; margin-top:5px;"
        max-height="200"
        class="handtab"
      >
        <el-table-column
          prop="name"
          align="center"
          label="火焰名称"
          width="70px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column align="center" label="火焰高度" width="65px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.height }}米
            <div :class="scope.row.showInputName ? 'show-input' : ''">
              <div
                class="list-item-input-box"
                @click="
                  e => {
                    e.stopPropagation()
                  }
                "
              >
                <el-input v-model="scope.row.heightCopy"></el-input>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="130px">
          <template slot-scope="scope">
            <div class="list-item-btn-box">
              <i
                :class="scope.row.showInputName ? 'el-icon-check' : 'el-icon-edit-outline'"
                @click="fireBtnEdit(scope.row)"
              ></i>
              <el-switch
                v-model="scope.row.hideView"
                @change="
                  e => {
                    fireShowChange(scope.row, e)
                  }
                "
              ></el-switch>
              <i v-show="scope.row.showInputName" class="el-icon-close" @click="fireBtnCancel(scope.row)"></i>
              <i
                class="el-icon-delete-solid"
                @click="btnDelete(scope.row, fireDeleteSure, '是否要删除此火焰信息且包括已绑定的动画方案？')"
              ></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 新增视觉方案 -->
    <OptesthesiaAdd
      ref="optesthesiaAdd"
      :visible.sync="visible"
      :editForm="editForm"
      @close="closeModel"
      @updateBimOptesthesiaProgram="getBimOptesthesiaProgramList"
    />
  </div>
</template>

<script>
import OptesthesiaAdd from './optesthesiaAdd'
import api from '@/api/bim/visualEffect'
import { getParams } from '@/utils/index'
export default {
  components: {
    OptesthesiaAdd
  },
  // 均为过滤用
  props: {
    // 版本号
    version: {},
    // 创建人
    creatUser: {},
    // /项目号
    projectId: {},
    // 项目文件号
    projectFileId: {}
  },
  data() {
    return {
      hideView: false,
      // 火焰点位
      postion: null,
      eventTool: '',
      fireShowBtnName: '',
      // 决定哪个li展示编辑btn
      showBtnName: '',
      // 过滤之后的数组
      filterList: [],
      filterListCopy: [],
      fireList: [],
      fireListCopy: [],
      // 编辑参数
      editForm: {},
      // 编辑框显示与否
      visible: false,
      // 删除新增火焰
      clearAdd: false
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    version: {
      immediate: true,
      handler: function() {
        // 获取视觉方案
        this.getBimOptesthesiaProgramList()
        // 获取火焰列表
        this.getFireList()
      }
    },
    filterListCopy: {
      immediate: true,
      handler: function() {
        this.updateUser()
      }
    },
    fireListCopy: {
      immediate: true,
      handler: function() {
        this.updateUser()
      }
    },
    creatUser() {
      console.log('创建人更改' + this.creatUser)
      if (this.creatUser === '全部' || !this.creatUser) {
        this.filterList = JSON.parse(JSON.stringify(this.filterListCopy))
        this.fireList = JSON.parse(JSON.stringify(this.fireListCopy))
      } else {
        this.filterList = this.filterListCopy.filter(item => item.creatorName === this.creatUser)
        this.fireList = this.fireListCopy.filter(item => item.creatorName === this.creatUser)
      }
    }
  },
  mounted() {},
  methods: {
    updateUser() {
      if (this.filterList.length > 0 && this.fireList.length > 0) {
        let arr = [...new Set([...this.filterListCopy, ...this.fireListCopy].map(item => item.creatorName))].map(
          (item, index) => {
            return {
              value: index,
              label: item
            }
          }
        )
        arr.unshift({ value: '', label: '全部' })
        this.$emit('updateUser', arr)
      }
    },
    BimOptesthesiaProgramShowChange(item, e) {
      let guids = item.componentGuids.split(',')
      if (e) {
        //this.bimfishApp.select(guids, true)
        this.bimfishApp.viewer.disableSelection(false)
        this.editForm = JSON.parse(JSON.stringify(item))
        setTimeout(async () => {
          this.$refs.optesthesiaAdd.modelPreview(guids)
        }, 10)
      } else {
        this.BimOptesthesiaProgramClear(guids)
        setTimeout(() => {
          this.bimfishApp.viewer.disableSelection(true)
        }, 100)
      }
    },
    // model关闭要执行的操作
    BimOptesthesiaProgramClear(guids) {
      // 清空颜色+去除材质+清空选中
      this.bimfishApp.clearSelect()
      this.bimfishApp.clearThemingColorByGUID(guids)
      this.bimfishApp.show(guids)
      this.bimfishApp.viewer.impl.createOverlayScene(guids, '')
      this.bimfishApp.viewer.impl.invalidate(true)
    },
    // 获取视觉方案list
    async getBimOptesthesiaProgramList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimOptesthesiaProgram(form)
      this.filterList = res.data
      this.filterListCopy = JSON.parse(JSON.stringify(res.data))
    },
    fireShowChange(item, e) {
      if (e) {
        this.showFire(item)
      } else {
        this.bimfishApp.removeFirePoint(item.id)
      }
    },
    // 获取火焰列表
    async getFireList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getFireList(form)
      this.fireList = res.data
      this.fireListCopy = JSON.parse(JSON.stringify(res.data))
      if (this.clearAdd) {
        //如果新增
        let target = res.data[0]
        console.log(res)
        console.log(target)
        this.showFire(target)
        this.clearAdd = false
      }
    },
    // 新增火焰
    addFire() {
      this.$message.info('点击模型视图添加火焰')
      this.bimfishApp.pickPosition(e => {
        if (e) {
          let id = new Date().valueOf()
          this.bimfishApp.addFirePoint(id, e.point, { width: 10, height: 10 })
          this.postion = e.point
          this.saveFire(e.point, id)
          this.offFire()
        }
      })
    },
    // 展示火焰
    showFire(item) {
      this.bimfishApp.addFirePoint(item.id, JSON.parse(item.position), {
        width: (Number(item.height) * 10).toFixed(1),
        height: (Number(item.height) * 10).toFixed(1)
      })
    },
    // 退出新增火焰效果
    offFire() {
      this.bimfishApp.closePickPosition()
      this.bimfishApp.eventTool.off('singleclick', () => {})
    },
    async saveFire(point, fireId) {
      let index = this.fireList.length + 1
      let form = {
        height: 1,
        name: '火焰' + index,
        position: JSON.stringify(point),
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.addFire(form)
      this.$message.success('新增成功')
      this.bimfishApp.removeFirePoint(fireId)
      this.clearAdd = true
      this.getFireList()
    },
    // 新增方案
    addView() {
      this.visible = true
      this.editForm = {}
    },
    // 点击li，效果待定
    selectModel(item) {},
    addNew() {
      this.visible = true
    },
    // 视觉方案进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 火焰进入列表item
    fireMouseenter(item) {
      this.fireShowBtnName = item.id
    },
    fireMouseleave(item) {
      this.fireShowBtnName = ''
    },
    // 方案编辑
    btnEdit(item) {
      this.selectModel()
      this.editForm = JSON.parse(JSON.stringify(item))
      let guids = item.componentGuids.split(',')
      this.bimfishApp.select(guids, true)
      this.visible = true
      setTimeout(() => {
        this.$refs.optesthesiaAdd.modelPreview(guids)
      }, 300)
      this.bimfishApp.viewer.disableSelection(false) //场景开启
    },
    fireBtnEdit(item) {
      if (item.showInputName) {
        item.showInputName = false
        console.log(window.isNaN(item.heightCopy))
        if (window.isNaN(item.heightCopy)) return this.$message.error('请填写整数或者1位小数')
        if (parseFloat(item.heightCopy) <= 0) return this.$message.error('火焰高度不能小于0米')
        if (item.heightCopy === '' || item.heightCopy === null) return this.$message.error('火焰高度不能小于0米')
        // 编辑确认
        this.fireEditSure(item)
      } else {
        this.$set(item, 'heightCopy', item.height)
        this.$set(item, 'showInputName', true)
      }
    },
    // 编辑确认
    async fireEditSure(item) {
      console.log(item)
      let form = {
        height: Number(item.heightCopy).toFixed(1) > 0 ? Number(item.heightCopy).toFixed(1) : 1,
        id: item.id
      }
      let res = await api.editFire(form)
      this.$message.success('编辑成功')
      this.getFireList()
    },
    // 取消编辑
    fireBtnCancel(item) {
      item.showInputName = false
    },
    // 删除
    btnDelete(row, callBack, text) {
      this.$confirm(text, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          callBack(row.id)
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 视觉方案删除
    async viewDeleteSure(id) {
      console.log('视觉方案删除')
      let res = await api.deleteBimOptesthesiaProgram(id)
      this.$message.success('删除成功')
      this.getBimOptesthesiaProgramList()
    },
    // 火焰删除
    async fireDeleteSure(id) {
      this.bimfishApp.removeFirePoint(id)
      let res = await api.deleteFire(id)
      this.$message.success('删除成功')
      this.getFireList()
    },
    // 删除确认
    nameDelete(id) {},
    // 关闭模态窗口
    closeModel() {
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
/deep/::-webkit-scrollbar {
  width: 16px; // 横向滚动条
  // height: 16px; // 纵向滚动条
}
//滚动条的滑块
/deep/::-webkit-scrollbar-thumb {
  background-color: #ddd;
  background-clip: padding-box;
  border-radius: 7px;
}
.scheme {
  height: calc(100% - 112px);
}
.view,
.fire {
  height: calc(50% - 10px);
  margin-bottom: 5px;
}
.flex-base {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  i.cursor {
    display: inline-block;
    color: #2e79cc;
    font-size: 22px;
    line-height: 32px;
  }
}
.list {
  &-item {
    margin-top: 10px;
    line-height: 40px;
    border: 1px solid lightgray;
    border-radius: 5px;
    position: relative;
    padding: 0;
    background: #fff;
    &-btn-box {
      width: 100%;
      position: absolute;
      /*background: lightgrey;*/
      right: 0;
      top: 0;
      left: 0;
      text-align: center;
      display: block;
      i {
        font-size: 18px;
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
        line-height: 40px;
      }
      .el-switch {
        top: -4px;
      }
    }
    &-input-box {
      width: calc(100% - 4px);
      position: absolute;
      top: 4px;
      display: none;
    }
  }
}
.show-btn {
  .list-item-btn-box {
    display: block;
  }
}
.show-input {
  .list-item-input-box {
    display: block;
  }
}
</style>
