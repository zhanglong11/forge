<!--
 * @Description: 构件管理
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-15 08:58:21
 * @LastEditTime: 2020-05-26 17:02:15
 -->
<template>
  <div>
    <!-- 构件移动 -->
    <section class="view">
      <div class="flex-base">
        <span>构件移动</span>
        <i class="el-icon-circle-plus-outline cursor" @click="addNewMove"></i>
      </div>
      <el-table
        :data="moveComponentList"
        tooltip-effect="light"
        style="width:100%;margin-top:5px"
        max-height="160"
        class="handtab"
      >
        <el-table-column
          prop="name"
          align="center"
          :show-overflow-tooltip="true"
          label="移动名称"
          width="70"
        ></el-table-column>
        <el-table-column
          prop="creatorName"
          align="center"
          label="添加人"
          width="60px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column align="center" label="添加时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120px">
          <template slot-scope="scope">
            <div class="list-item-btn-box">
              <i class="el-icon-edit-outline" @click="btnEdit(scope.row, 'move')"></i>
              <el-switch
                v-model="scope.row.hideView"
                @change="
                  e => {
                    moveShowChange(scope.row, e)
                  }
                "
              ></el-switch>
              <i
                class="el-icon-delete-solid"
                @click="btnDelete(scope.row, moveDeleteSure, '是否要删除此构件移动效果且包括已绑定的动画方案？')"
              ></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 构件旋转 -->
    <section class="view">
      <div class="flex-base">
        <span>构件旋转</span>
        <i class="el-icon-circle-plus-outline cursor" @click="addNewRotate"></i>
      </div>
      <el-table
        :data="rotateComponentList"
        tooltip-effect="light"
        style="width:100%;margin-top:5px"
        max-height="160"
        class="handtab"
      >
        <el-table-column prop="name" align="center" label="旋转名称" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column
          prop="creatorName"
          align="center"
          label="添加人"
          width="60px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column align="center" label="添加时间" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120px">
          <template slot-scope="scope">
            <div class="list-item-btn-box">
              <i class="el-icon-edit-outline" @click="btnEdit(scope.row, 'rotate')"></i>
              <el-switch
                v-model="scope.row.hideView"
                @change="
                  e => {
                    rotateShowChange(scope.row, e)
                  }
                "
              ></el-switch>
              <i
                class="el-icon-delete-solid"
                @click="btnDelete(scope.row, rotateDeleteSure, '是否要删除此构件移动效果且包括已绑定的动画方案？')"
              ></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 新增移动 -->
    <AddMove
      ref="move"
      :nameIndex="moveComponentList.length"
      :title="movetitle"
      :visible="addMoveVisible"
      :editForm="addMoveForm"
      @close="closeAddMove"
      @update="getBimComponentMoveList"
    />
    <!-- 新增旋转 -->
    <AddRotate
      ref="rotate"
      :nameIndex="rotateComponentList.length"
      :title="rotatetitle"
      :visible="addRotateVisible"
      :editForm="addRotateForm"
      @close="closeAddRotate"
      @update="getRotateList"
    />
  </div>
</template>

<script>
import AddRotate from './addRotate'
import AddMove from './addMove'
import api from '@/api/bim/visualEffect'
export default {
  name: '',
  components: {
    AddMove,
    AddRotate
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
      moveComponentList: [],
      moveComponentListCopy: [],
      rotateComponentList: [],
      rotateComponentListCopy: [],
      moveEditForm: {},
      moveVisible: false,
      showBtnName: '',
      // 新增旋转
      addRotateVisible: false,
      // 新增移动
      addMoveVisible: false,
      addRotateForm: {},
      addMoveForm: {},
      movetitle: '',
      rotatetitle: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    // version: {
    //   handler: function() {
    //     this.getRotateList()
    //     this.getBimComponentMoveList()
    //   }
    // },
    moveComponentListCopy: {
      immediate: true,
      handler: function() {
        this.updateUser()
      }
    },
    rotateComponentListCopy: {
      immediate: true,
      handler: function() {
        this.updateUser()
      }
    },
    creatUser() {
      console.log(this.creatUser)
      if (this.creatUser === '全部' || !this.creatUser) {
        this.moveComponentList = JSON.parse(JSON.stringify(this.moveComponentListCopy))
        this.rotateComponentList = JSON.parse(JSON.stringify(this.rotateComponentListCopy))
      } else {
        this.moveComponentList = this.moveComponentListCopy.filter(item => item.creatorName === this.creatUser)
        this.rotateComponentList = this.rotateComponentListCopy.filter(item => item.creatorName === this.creatUser)
      }
    }
  },
  mounted() {
    this.getRotateList()
    this.getBimComponentMoveList()
  },
  methods: {
    updateUser() {
      //console.log('更新userList')
      if (this.moveComponentListCopy.length > 0 && this.rotateComponentListCopy.length > 0) {
        let arr = [
          ...new Set([...this.moveComponentListCopy, ...this.rotateComponentListCopy].map(item => item.creatorName))
        ].map((item, index) => {
          return {
            value: index,
            label: item
          }
        })
        arr.unshift({ value: '', label: '全部' })
        this.$emit('updateUser', arr)
      }
    },
    closeAddMove() {
      this.bimfishApp.clearSelect()
      this.addMoveVisible = false
      this.bimfishApp.viewer.disableSelection(true)
    },
    closeAddRotate() {
      this.addRotateVisible = false
      this.bimfishApp.viewer.disableSelection(true)
    },
    // 新增旋转
    addNewRotate() {
      //this.addRotateForm = {}
      this.addRotateVisible = true
      this.rotatetitle = '新增构件旋转'
    },
    // 获取旋转构件列表
    async getRotateList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimComponentRotationList(form)
      this.rotateComponentList = res.data
      this.rotateComponentListCopy = JSON.parse(JSON.stringify(res.data))
    },
    // 新增移动
    addNewMove() {
      this.addMoveVisible = true
      this.addRotateForm = {}
      this.movetitle = '新增构件移动'
    },
    // 获取构件移动列表
    async getBimComponentMoveList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimComponentMoveList(form)
      this.moveComponentList = res.data
      this.moveComponentListCopy = JSON.parse(JSON.stringify(res.data))
    },
    // 构件移动-进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 构件移动编辑
    btnEdit(item, flag) {
      this.bimfishApp.viewer.disableSelection(false)
      this.bimfishApp.clearSelect()
      this.bimfishApp.select(item.componentGuids.split(','), true)
      if (flag === 'rotate') {
        this.addRotateVisible = true
        this.rotatetitle = '编辑构件旋转'
        this.addRotateForm = JSON.parse(JSON.stringify(item))
      } else {
        this.addMoveVisible = true
        this.movetitle = '编辑构件移动'
        this.addMoveForm = JSON.parse(JSON.stringify(item))
      }
    },
    // 移动
    moveShowChange(item, f) {
      if (f) {
        this.bimfishApp.viewer.disableSelection(false)
        this.bimfishApp.select(item.componentGuids.split(','), true)
        this.addMoveForm = JSON.parse(JSON.stringify(item))
        setTimeout(() => {
          this.$refs.move.preview()
        }, 1000)
      } else {
        this.$refs.move.preview(f)
        setTimeout(() => {
          this.$refs.move.clearAll(item.bimComponentMoveDetaiEntityList)
        }, 100)
        //this.bimfishApp.clearSelect()
        this.bimfishApp.viewer.disableSelection(true)
      }
    },
    // 旋转
    rotateShowChange(item, f) {
      if (f) {
        this.bimfishApp.viewer.disableSelection(false)
        this.bimfishApp.clearSelect()
        this.bimfishApp.select(item.componentGuids.split(','), true)
        this.addRotateForm = JSON.parse(JSON.stringify(item))
        console.log(this.addRotateForm)
        setTimeout(() => {
          this.$refs.rotate.preview()
        }, 1000)
      } else {
        this.$refs.rotate.preview(f, 0)
        setTimeout(() => {
          //this.bimfishApp.clearSelect()
          this.$refs.rotate.clearAll()
        }, 100)
        //this.$refs.rotate.clearAll()
        this.bimfishApp.viewer.disableSelection(true)
      }
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
    // 移动删除确认
    async moveDeleteSure(id) {
      let res = await api.deleteComponentMove(id)
      this.$message.success('删除成功')
      this.getBimComponentMoveList()
    },
    // /旋转删除确认
    async rotateDeleteSure(id) {
      let res = await api.deleteBimComponentRotation(id)
      this.$message.success('删除成功')
      this.getRotateList()
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
  margin-bottom: 10px;
}
.flex-base {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  i.cursor {
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
      width: 30%;
      position: absolute;
      display: none;
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
      left: 30%;
    }
  }
}
</style>
