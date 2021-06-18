<!--
 * @Description: 构件编辑
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 11:11:33
 * @LastEditTime: 2020-05-25 16:06:44
 -->
<template>
  <div class="right-content">
    <Drag title="构件编辑" :addFlag="true" @add="addNew">
      <VersionFilter :dataList="elementListCopy" @selectChange="selectChange" @userChange="userChange" />
      <section class="element">
        <el-table
          :data="elementList"
          tooltip-effect="light"
          style="width:100%;margin-top:10px"
          max-height="480"
          class="handtab"
        >
          <el-table-column prop="name" align="center" label="构件名称" width="70"></el-table-column>
          <el-table-column prop="creatorName" align="center" label="添加人" width="70"></el-table-column>
          <el-table-column align="center" label="添加时间">
            <template slot-scope="scope">
              {{ moment(scope.row.createTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="120px">
            <template slot-scope="scope">
              <div class="view-list-item-btn-box">
                <i
                  :class="scope.row.showInputName ? 'el-icon-check' : 'el-icon-edit-outline'"
                  @click="btnEdit(scope.row)"
                ></i>
                <el-switch
                  v-model="scope.row.hideView"
                  @change="
                    e => {
                      componentEditChange(scope.row, e)
                    }
                  "
                ></el-switch>
                <i class="el-icon-delete-solid" @click="btnDelete(scope.row)"></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>
      <AddComponentEdit
        ref="addComponentEdit"
        :visible="visible"
        :title="title"
        :editId="editId"
        :name="'构件' + (elementList.length + 1)"
        @close="addComponentEditClose"
        @update="getBimComponentEditList"
      />
    </Drag>
  </div>
</template>

<script>
import Drag from '../component/Drag'
import VersionFilter from '../component/versionFilter'
import api from '@/api/bim/bimComponentEdit'
import AddComponentEdit from './addComponentEdit'
export default {
  name: 'ComponentEdit',
  components: { Drag, VersionFilter, AddComponentEdit },
  data() {
    return {
      userList: [],
      showBtnName: '',
      elementList: [{}],
      elementListCopy: [],
      version: '',
      projectFileId: '',
      visible: false,
      editId: '',
      title: ''
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
        this.getBimComponentEditList()
      }
    }
  },
  methods: {
    addComponentEditClose(item) {
      this.editId = ''
      this.visible = false
      this.bimfishApp.viewer.disableSelection(true)
      if (!item) return
      //let copy = JSON.parse(JSON.stringify(item))
      //this.componentEditChange(copy, false)
    },
    async getBimComponentEditList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimComponentEditList(form)
      this.elementList = res.data
      this.elementListCopy = JSON.parse(JSON.stringify(res.data))
    },
    addNew() {
      this.visible = true
      this.title = '新增构件编辑'
    },
    // 进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    selectChange(info) {
      this.version = info.version
      this.projectFileId = info.projectFileId
    },
    // 创建人由前端过滤
    userChange(list) {
      this.elementList = list
    },
    close() {
      this.$emit('navigationChange')
    },
    btnEdit(item) {
      console.log(item)
      this.visible = true
      this.title = '编辑构件'
      this.editId = item.id
      this.bimfishApp.select(item.componentGuids.split(','), true)
      //let copy = JSON.parse(JSON.stringify(item))
      //this.componentEditChange(copy, true)
      this.bimfishApp.viewer.disableSelection(false)
    },
    // 删除
    btnDelete(row) {
      this.$confirm('是否要删除此构件编辑', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteSure(row.id)
        })
        .catch(() => {
          console.log('取消')
        })
    },
    componentEditChange(item, e) {
      console.log(item, e)
      let coordinate = item.coordinate.split(',')
      let angle = item.angle.split(',')
      let zoom = item.zoom.split(',')
      let form = {
        x: coordinate[0],
        y: coordinate[1],
        z: coordinate[2],
        rx: angle[0],
        ry: angle[1],
        rz: angle[2],
        sx: zoom[0],
        sy: zoom[1],
        sz: zoom[2]
      }
      if (e) {
        // 展示
        this.bimfishApp.viewer.disableSelection(false)
        this.bimfishApp.select(item.componentGuids.split(','), true)
        setTimeout(() => {
          this.$refs.addComponentEdit.onInputChanged(form, 'coordinate')
          this.$refs.addComponentEdit.onInputChanged(form, 'angle')
          this.$refs.addComponentEdit.onInputChanged(form, 'zoom')
          this.$refs.addComponentEdit.setLastRotateForm({
            rxLast: form.rx,
            ryLast: form.ry,
            rzLast: form.rz
          })
        }, 100)
      } else {
        // 隐藏:回到原位
        this.$refs.addComponentEdit.setLastRotateForm({
          rxLast: form.rx,
          ryLast: form.ry,
          rzLast: form.rz
        })
        this.$refs.addComponentEdit.reset('coordinate')
        this.$refs.addComponentEdit.reset('angle')
        this.$refs.addComponentEdit.reset('zoom')
        setTimeout(() => {
          this.bimfishApp.clearSelect()
          this.bimfishApp.viewer.disableSelection(true)
        }, 100)
      }
    },
    async deleteSure(id) {
      let res = await api.deleteBimComponentEdit(id)
      this.$message.success('删除成功')
      this.getBimComponentEditList()
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
.element {
  margin-top: 10px;
}
.flex-base {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.view-list {
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
      display: none;
    }
  }
  .show-btn {
    .view-list-item-btn-box {
      display: block;
    }
  }
  .show-input {
    .view-list-item-input-box {
      display: block;
    }
  }
}
</style>
