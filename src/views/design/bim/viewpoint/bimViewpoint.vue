<!--
 * @Description: task#3053 视点管理
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-05-06 17:33:18
 * @LastEditTime: 2020-06-05 17:04:25
 -->
<template>
  <div class="right-content">
    <Drag title="视点漫游" @close="close">
      <VersionFilter :userList="userList" @selectChange="selectChange" @userChange="userChange" />
      <section class="viewpoint">
        <header class="flex-base">
          <span>视点管理</span>
          <span><i class="el-icon-circle-plus-outline cursor" @click="addNewViewpoint"></i></span>
        </header>
        <div v-if="viewPointList.length === 0" class="no-res">
          暂无数据
        </div>
        <el-row>
          <el-col v-for="item in viewPointList" :key="item.id" :span="24" :class="{ cursor: true }">
            <el-card :body-style="{ padding: '0px' }">
              <div class="view-list-img" @click="selectview(item)">
                <img :src="item.img" alt="" />
              </div>
              <div class="view-list">
                <div class="view-list-item">
                  <div class="itembox">
                    <label>视点名称：</label><span>{{ item.name }}</span>
                  </div>
                  <div class="itembox">
                    <label>添加人：</label><span>{{ item.creatorName }}</span>
                  </div>
                  <div class="itembox">
                    <label>添加时间：</label><span>{{ moment(item.updateTime).format('YYYY-MM-DD') }}</span>
                  </div>
                  <div class="view-list-item-btn-box">
                    <i
                      :class="item.showInputName ? 'el-icon-check' : 'el-icon-edit-outline'"
                      @click="btnEdit(item)"
                    ></i>
                    <i v-show="item.showInputName" class="el-icon-close" @click="btnCancel(item)"></i>
                    <i class="el-icon-delete-solid" @click="btnDelete(item, viewDelete, '是否要删除此视点信息？')"></i>
                  </div>
                  <div :class="{ 'show-input': item.showInputName }">
                    <div
                      class="view-list-item-input-box"
                      @click="
                        e => {
                          e.stopPropagation()
                        }
                      "
                    >
                      <el-input v-model="item.nameCopy" class="point"></el-input>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </section>
      <section class="roam">
        <header class="flex-base">
          <span>漫游管理</span>
          <span><i class="el-icon-circle-plus-outline cursor" @click="addNewRoam"></i></span>
        </header>
        <el-table :data="roamList" tooltip-effect="light" style="width:100%;" max-height="200" class="handtab">
          <el-table-column
            prop="name"
            align="center"
            label="漫游名称"
            width="70px"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column
            prop="creatorName"
            align="center"
            label="添加人"
            width="70px"
            :show-overflow-tooltip="true"
          ></el-table-column>
          <el-table-column align="center" label="添加时间" width="80px" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <div class="roam-list-item-btn-box">
                <i class="el-icon-edit-outline" @click="selectRoam(scope.row)"></i>
                <i class="el-icon-view" @click="btnplay(scope.row)"></i>
                <i
                  class="el-icon-delete-solid"
                  @click="btnDelete(scope.row, roamDeleteSure, '是否要删除此漫游信息？')"
                ></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 编辑框 -->
        <!--<div class="view-list-item-input-box" @click="e => {e.stopPropagation()}">
          <el-input v-model="item.nameCopy"></el-input>
        </div>-->
      </section>
      <addRoam
        ref="play"
        :visible="addRoamVisible"
        :editForm="editForm"
        @close="addRoamClose"
        @updateRoam="getRoamList"
      />
    </Drag>
  </div>
</template>

<script>
import api from '@/api/bim/viewpointRoaming'
import Drag from '../component/Drag'
import addRoam from './roamAdd'
import VersionFilter from '../component/versionFilterSelf'
import { getParams } from '@/utils/index'
export default {
  name: 'Viewpoint',
  components: {
    Drag,
    addRoam,
    VersionFilter
  },
  data() {
    return {
      addRoamVisible: false,
      showBtnName: '',
      viewPointList: [],
      // 漫游列表
      roamList: [],
      // 编辑漫游form
      editForm: {},
      // 版本号
      version: '',
      // 创建人
      creatUser: '',
      // 创建人列表
      userList: [],
      // 备份，禁止修改
      viewPointListCopy: [],
      roamListCopy: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    // version() {
    //   this.userList = []
    //   this.getBimViewpointList()
    //   setTimeout(() => {
    //     this.getRoamList()
    //   }, 10)
    // }
  },
  created() {
    this.getBimViewpointList()
    setTimeout(() => {
      this.getRoamList()
    }, 10)
  },
  methods: {
    btnplay(item) {
      console.log(item)
      this.editForm = JSON.parse(JSON.stringify(item))
      setTimeout(() => {
        this.$refs.play.play()
      }, 100)
    },
    // 创建人由前端过滤
    userChange(name) {
      if (!name || name === '全部') {
        this.viewPointList = JSON.parse(JSON.stringify(this.viewPointListCopy))
        this.roamList = JSON.parse(JSON.stringify(this.roamListCopy))
        return
      }
      this.viewPointList = this.viewPointListCopy.filter(item => item.creatorName === name)
      this.roamList = this.roamListCopy.filter(item => item.creatorName === name)
    },
    // 版本由后端过滤
    selectChange(info) {
      this.version = info.version
    },
    // 获取视点列表
    async getBimViewpointList() {
      let from = {
        // batchCode: this.$store.state.bim.batchCode,
        creatorName: this.creatUser,
        name: '',
        img: '',
        viewId: this.$store.state.bim.bim3DArr[0].id
        // version: this.version
      }
      let res = await api.getBimViewpointList(from)
      this.viewPointList = res.data
      this.viewPointListCopy = JSON.parse(JSON.stringify(res.data))
      let list = [...new Set(res.data.map(item => item.creatorName))].map((item, index) => {
        return {
          value: index,
          label: item
        }
      })
      list.unshift({ value: '', label: '全部' })
      this.userList = list
    },
    // 获取漫游列表
    async getRoamList() {
      let from = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getRoamList(from)
      this.roamList = res.data
      let list = [...new Set(res.data.map(item => item.creatorName))].map((item, index) => {
        return {
          value: index,
          label: item
        }
      })
      let arr = [...this.userList, ...list]
      console.log(arr)
      this.userList = [...new Set(arr.map(item => item.label))].map((item, index) => {
        return {
          value: index,
          label: item
        }
      })
      this.roamListCopy = JSON.parse(JSON.stringify(res.data))
    },
    // 查看漫游信息
    selectRoam(item) {
      this.editForm = item
      this.addRoamVisible = true
      this.bimfishApp.viewer.disableSelection(false) //开启场景
    },
    selectview(item) {
      this.bimfishApp.viewer.restoreState(JSON.parse(item.viewpoint))
    },
    // 关闭新增漫游
    addRoamClose() {
      this.editForm = {}
      this.addRoamVisible = false
    },
    // 进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 视点编辑
    btnEdit(item) {
      if (item.showInputName) {
        item.showInputName = false
        // 编辑确认
        let obj = {
          batchCode: this.$store.state.bim.batchCode,
          id: item.id,
          name: item.nameCopy
        }
        this.viewEdit(obj)
      } else {
        this.$set(item, 'nameCopy', item.name)
        this.$set(item, 'showInputName', true)
      }
    },
    // 编辑确认
    async viewEdit(obj) {
      let res = await api.bimViewpointEdit(obj)
      this.$message.success('编辑成功')
      this.getBimViewpointList()
    },
    // 取消编辑
    btnCancel(item) {
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
    // 视点删除确认
    async viewDelete(id) {
      let res = await api.bimViewpointDelete(id)
      this.$message.success('删除成功')
      this.getBimViewpointList()
    },
    // 漫游删除确认
    async roamDeleteSure(id) {
      console.log('删除漫游')
      let res = await api.deleteRoam(id)
      this.$message.success('删除成功')
      this.getRoamList()
    },
    // 右侧菜单框关闭
    close() {
      this.editForm = {}
      this.$emit('navigationChange')
    },

    // 用于添加确定：props：是额外的参数
    showModal(title, msg, callBack, props) {
      this.$prompt(msg, title, {
        customClass: 'message',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '不能为空'
      })
        .then(({ value }) => {
          // 成功操作
          callBack(value, props)
        })
        .catch(() => {
          // 取消操作
        })
    },
    // 新增视点
    addNewViewpoint() {
      this.showModal('添加视点', '视点名称', this.addPoint)
    },
    async addPoint(name, row) {
      console.log(name + '--' + row)
      let info = this.bimfishApp.viewer.getState()
      let viewInfo = JSON.stringify(info)
      // 截图
      html2canvas($('#lo-viewer')[0], {
        allowTaint: true, //允许污染
        taintTest: true, //在渲染前测试图片
        useCORS: true //使用跨域(当allowTaint为true时这段代码没什么用)
      }).then(canvas => {
        let context = canvas.getContext('2d')
        context.mozImageSmoothingEnabled = false
        context.webkitImageSmoothingEnabled = false
        context.msImageSmoothingEnabled = false
        context.imageSmoothingEnabled = false
        let dataUrl = canvas.toDataURL('image/jpeg', 0.2)
        let obj = {
          img: dataUrl,
          name: name,
          viewId: this.$store.state.bim.bim3DArr[0].id,
          viewpoint: viewInfo
        }

        // 这是等待上传的base64图片
        this.addPointSure(obj)
      })
    },
    // /新增视点确定
    async addPointSure(obj) {
      let res = await api.bimViewpointAdd(obj)
      this.$message.success('新增成功')
      this.bimfishApp.viewer.disableSelection(true) //
      this.getBimViewpointList()
    },
    // 新增漫游
    addNewRoam() {
      this.addRoamVisible = true
      this.editForm = {}
      this.bimfishApp.viewer.disableSelection(false) //开启场景
    }
  }
}
</script>

<style lang="less" scoped>
/deep/::-webkit-scrollbar {
  width: 16px; // 横向滚动条
  height: 16px; // 纵向滚动条
}
//滚动条的滑块
/deep/::-webkit-scrollbar-thumb {
  background-color: #ccc;
  background-clip: padding-box;
  border-radius: 7px;
}
.handtab {
  overflow: auto;
}
::-webkit-scrollbar-track {
  background-color: #fff;
}
.no-res {
  text-align: center;
  background: #fff;
  border-radius: 4px;
  padding: 4px;
}
.viewpoint,
.roam {
  height: calc(50% - 20px);
  overflow: auto;
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
    line-height: 34px;
  }
}
.el-row {
  height: 340px;
  overflow-y: auto;
  .el-col {
    margin-bottom: 15px;
    .view-list-img {
      width: 140px;
      float: left;
      img {
        width: 100%;
        height: 110px;
        display: block;
      }
    }
    .view-list {
      float: right;
      width: calc(100% - 150px);
      &-item {
        padding: 5px 0;
        position: relative;
        height: 110px;
        .itembox {
          width: 100%;
          line-height: 26px;
          label {
            font-size: 14px;
            overflow: hidden;
          }
          span {
            font-size: 14px;
            float: right;
            width: 94px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          &:nth-child(2) label {
            letter-spacing: 0.26rem;
          }
        }
        &-btn-box {
          position: absolute;
          right: 5px;
          bottom: 0px;
          text-align: right;
          display: inline-block;
          i {
            font-size: 20px;
            padding-left: 5px;
            padding-right: 5px;
            cursor: pointer;
          }
        }
        &-input-box {
          width: 60%;
          position: absolute;
          display: none;
          top: 6px;
          right: 6px;
        }
      }
      .show-input {
        .view-list-item-input-box {
          display: block;
        }
      }
    }
  }
}
.roam-list-item {
  margin-top: 10px;
  line-height: 40px;
  border: 1px solid lightgray;
  border-radius: 5px;
  position: relative;
  padding: 0;
  background: #fff;
  &-btn-box {
    width: 100%;
    height: 100%;
    position: absolute;
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
  }
  &-input-box {
    width: 30%;
    position: absolute;
    display: none;
  }
}
.show-roam-input {
  .rule-list-item-input-box {
    display: block;
  }
}
@media (max-height: 969px) {
  .el-row {
    max-height: 240px;
    overflow-y: auto;
  }
}
</style>
