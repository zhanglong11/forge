<!--
 * @Description: 版本管理
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-04-22 09:31:55
 * @LastEditTime: 2020-05-28 09:22:29

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-22
@任务类型: 修改代码，修改版本管理盒子样式细节，修改比例(2%)
 -->
<!--
  @任务名称: 3006/版本管理，二三维对比；合并模型，版本对比
  @开发人员: 申豪强
  @修改日期: 2020-04-23
-->
<template>
  <div class="version  right-content">
    <!-- 右侧可拖拽框 -->
    <Drag :addFlag="true" title="版本管理" @add="addNew">
      <el-table
        :data="versionList"
        tooltip-effect="light"
        style="width:100%;"
        class="handtab"
        @cell-mouse-enter="mouseenter"
        @cell-mouse-leave="mouseleave"
      >
        <el-table-column align="center" label="版本号" width="60px">
          <template slot-scope="scope">
            <div :class="scope.row.showInputName ? 'show-input' : ''">
              <div class="version-list-item-input-box">
                <el-input v-model="scope.row.versionCopy"></el-input>
              </div>
            </div>
            {{ scope.row.version }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fileName"
          show-overflow-tooltip
          align="center"
          label="文件名"
          width="85px"
        ></el-table-column>
        <el-table-column
          prop="creatorName"
          show-overflow-tooltip
          align="center"
          label="上传人"
          width="65px"
        ></el-table-column>
        <el-table-column align="center" label="修改时间">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
            <div :class="showBtnName === scope.row.id ? 'show-btn' : ''">
              <div class="version-list-item-btn-box">
                <i
                  :class="scope.row.showInputName ? 'el-icon-check' : 'el-icon-edit-outline'"
                  @click="btnEdit(scope.row)"
                ></i>
                <i v-show="scope.row.showInputName" class="el-icon-close" @click="btnCancel(scope.row)"></i>
                <i class="el-icon-delete-solid" @click="btnDelete(scope.row)"></i>
                <i class="el-icon-camera" @click="selectVersion(scope.row)"></i>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Drag>
    <SelectFile
      :visible.sync="dialogVisible"
      :taskUniqueId="taskUniqueId"
      :onlyOne="true"
      @change="handleSelectFileChange"
      @close="handleClose"
    ></SelectFile>
  </div>
</template>

<script>
import fileApi from '@/api/design/file'
import api from '@/api/bim/version'
import Drag from './component/Drag'
import SelectFile from './component/SelectFile'
import { getParams } from '@/utils/index'
export default {
  components: {
    Drag,
    SelectFile
  },
  props: {
    // 任务id
    taskUniqueId: {
      default: '1'
    },
    // 哪个模块底下的
    departmentId: {
      default: '8a57c3274bba439a9a77f68e7f100af2'
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      dialogVisible: false,
      // 决定哪个li展示btn
      showBtnName: '',
      treeData: []
    }
  },
  computed: {
    versionList: {
      get() {
        return this.$store.state.bim.versionList
      }
    }
  },
  methods: {
    // 选择版本
    async selectVersion(item) {
      let obj = {
        name: '',
        sourceFileId: item.projectFileId,
        type: 1
      }
      let res = await fileApi.getBimViewerList(obj)
      if (res.data) {
        let target = res.data.find(item => item.isDefault === 1)
        let arr = [
          {
            id: target.id,
            modelUrl: window.location.origin + target.url
          }
        ]
        this.$emit('updateModel', arr)
      }
    },
    // 打开新增页面
    addNew() {
      this.dialogVisible = true
      this.getTreeData()
    },
    // 获取版本信息+新增版本
    async getBimInfo(obj, projectFileId) {
      // 查看此文件是否有3d文件
      let res = await fileApi.getBimViewerList(obj)
      // 新增版本
      if (res.data) {
        let params = {
          projectFileId: projectFileId ? projectFileId : getParams('fileId'),
          projectId: localStorage.getItem('projectId'),
          batchCode: this.versionList.length > 0 ? this.versionList[0].batchCode : null
        }
        this.addNewSubmit(params)
      }
    },
    // 模态窗口选择文件
    handleSelectFileChange(e) {
      if (e.length !== 1) return this.$message.error('只能选择一个文件')
      // 走接口获取地址参数
      let obj = {
        name: '',
        sourceFileId: e[0].id,
        type: 1
      }
      if (this.versionList.some(item => item.projectFileId === e[0].id)) return this.$message.error('该文件已存在')
      this.getBimInfo(obj, e[0].id)
    },
    // 新增版本确认
    async addNewSubmit(obj) {
      let res = await api.versionInsert(obj)
      this.$emit('getVersionList')
      this.$message.success('新增成功')
    },
    // 版本编辑
    btnEdit(item) {
      console.log(item)
      if (item.showInputName) {
        item.showInputName = false
        // 编辑确认
        if (window.isNaN(item.versionCopy)) return this.$message.error('请填写整数或者1位小数')
        if (item.versionCopy.split('.')[1] && item.versionCopy.split('.')[1].length > 1)
          return this.$message.error('请填写整数或者1位小数')
        let obj = {
          batchCode: item.batchCode,
          id: item.id,
          projectFileId: item.projectFileId,
          projectId: item.projectId,
          version: Number(item.versionCopy).toFixed(1)
        }
        this.versionEdit(obj)
      } else {
        this.$set(item, 'versionCopy', item.version)
        this.$set(item, 'showInputName', true)
      }
    },
    // 取消编辑
    btnCancel(item) {
      item.showInputName = false
    },
    // 版本编辑确认
    async versionEdit(obj) {
      let res = await api.versionEdit(obj)
      this.$emit('getVersionList')
      this.$message.success('编辑成功')
    },
    // 版本删除
    btnDelete(row) {
      this.$confirm('是否要删除此版本', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(row)
        if (row.projectFileId === getParams('fileId')) {
          return this.$message.error('不能删除本模型版本')
        }
        // return
        this.versionDelete(row.id)
      })
    },
    // 版本删除确认
    async versionDelete(id) {
      let res = await api.versionDelete(id)
      this.$emit('getVersionList')
      this.$message.success('删除成功')
    },
    // 编辑、新增成功后改变当前版本
    // changeVersionList() {
    //   this.$store.dispatch('bim/getVersionList')
    // },
    // 树节点选中
    nodeClick(e) {
      this.handleClose()
    },
    // 获取树节点
    async getTreeData() {
      console.log(this.taskUniqueId)
      if (!this.taskUniqueId) return this.$message.error('未选择任务')
      let obj = {
        departmentId: this.departmentId && this.departmentId.length > 3 ? this.departmentId : null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId
      }
      console.log(this.departmentId)
      if (this.departmentId === '2') {
        //存档区
        obj.module = this.module
        let res = await fileApi.getSelectPigeonholeTree(obj)
        this.treeData = res.data
      } else if (this.departmentId === '3') {
        // 共享区
        obj.module = this.module
        let res = await fileApi.getSelectShareTree(obj)
        this.treeData = res.data
      } else {
        // 自定义模块
        let res = await fileApi.getTree(obj)
        this.treeData = res.data
      }
    },

    // 模态窗口关闭
    handleClose() {
      this.dialogVisible = false
    },

    // 关闭右侧整个model
    close() {
      this.$emit('navigationChange')
    },
    // 进入列表item
    mouseenter(row) {
      this.showBtnName = row.id
    },
    mouseleave(row) {
      this.showBtnName = ''
    }
  }
}
</script>

<style lang="less" scoped>
.noMess {
  text-align: center;
  line-height: 36px;
}
.tree-content {
  max-height: 300px;
  overflow: auto;
}
.version {
  .version-list-item {
    /*margin-top: 10px;*/
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
      background: lightgrey;
      right: 0;
      top: 0;
      left: 0;
      text-align: center;
      display: none;
      i {
        font-size: 20px;
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
        line-height: 40px;
      }
    }
    &-input-box {
      position: absolute;
      display: none;
      top: 4px;
    }
  }
  .show-btn {
    .version-list-item-btn-box {
      display: block;
    }
  }
  .show-input {
    .version-list-item-input-box {
      display: block;
    }
  }
}
</style>
