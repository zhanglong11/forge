<!--
 * @Description: 复制、移动
 * @Version:
 * @Autor:
 * @Date: 2020-02-22 16:53:51
 * @LastEditTime: 2020-04-09 14:54:29
 -->
<!--
/*
 弹框的改进：2512
 任务描述 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改：
 1、弹框可移动。
 2、遮挡的页面支持鼠标滚轮上下移动。
 开发人员：李建敏
 日期：2020-3月-16日
 任务类型：2、复制修改代码 1行
*/
-->
<template>
  <div>
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="visible" width="600px" @close="close">
      <div style="height:400px;overflow-y: auto;">
        <div class="task-select">
          <!--
            * @任务编号: 2795 | 文件的跨任务间传递
            * @开发人员:申豪强
            * @日期:2020-04-02
            * @代码类型：功能调整 
          -->
          <el-select v-model="taskUniqueIdCopy" placeholder="请选择">
            <el-option v-for="item in taskList" :key="item.id" :label="item.name" :value="item.taskUniqueId">
            </el-option>
          </el-select>
        </div>
        <el-tree :data="treeData" :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="sure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/design/file'
export default {
  props: {
    taskUniqueId: {},

    module: {},
    selectedList: {},
    departmentId: {}
  },
  data() {
    return {
      // 一级里程碑id
      taskUniqueIdCopy: '',
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      treeData: [],
      visible: false,
      targetFolderId: '',
      operateType: '',
      // 任务数组
      taskList: []
    }
  },
  /*
   * @任务编号: 2795 | 文件的跨任务间传递
   * @开发人员:申豪强
   * @日期:2020-04-02
   * @代码类型：功能调整
   */
  watch: {
    // 赋值给本组件，脱离于props的联系
    taskUniqueId: {
      handler: function(o, n) {
        this.taskUniqueIdCopy = Number(this.taskUniqueId)
      },
      immediate: true
    },
    // 更新树
    taskUniqueIdCopy(val) {
      if (this.departmentId && this.departmentId.length > 3) {
        this.getDefineTree()
      } else if (this.module === 'pigeonhole') {
        this.getSelectPigeonholeTree()
      } else if (this.module === 'share') {
        this.getShareTreeData()
      }
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    async refresh() {
      let res = await this.axios.schedule.get('schedule/task/treeList/' + localStorage.getItem('projectId'))
      this.taskList = res.data.filter(item => item.type === 2)
    },
    // 等待后台添加参数：最好是里程碑任务id
    async sure() {
      let obj = {
        fileIdList: this.selectedList.filter(item => item.type === 2).map(item => item.id),
        folderIdList: this.selectedList.filter(item => item.type === 1).map(item => item.id),
        operateType: this.operateType,
        targetFolderId: this.targetFolderId,
        taskUniqueId: this.taskUniqueIdCopy
      }
      if (this.targetFolderId) {
        let res = await api.copyMoveFile(obj)
        this.$message.success('操作成功')
        this.$emit('success')
        this.visible = false
      } else {
        this.$message.error('请选择文件夹')
      }
    },
    // 节点点击
    handleNodeClick(e) {
      this.targetFolderId = e.id
    },
    show(operateType) {
      this.visible = true
      this.operateType = operateType
      if (this.departmentId && this.departmentId.length > 3) {
        this.getDefineTree()
      } else if (this.module === 'pigeonhole') {
        this.getSelectPigeonholeTree()
      } else if (this.module === 'share') {
        this.getShareTreeData()
      }
    },
    close() {
      this.$emit('success')
      this.visible = false
      this.targetFolderId = null
      this.operateType = null
    },
    // 内部分享
    async getShareTreeData() {
      let obj = {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueIdCopy
      }
      let res = await api.getSelectShareTree(obj)
      this.treeData = res.data
    },
    // 存档区
    async getSelectPigeonholeTree() {
      let obj = {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueIdCopy
      }
      let res = await api.getSelectPigeonholeTree(obj)
      this.treeData = res.data
    },
    // 自定义区
    async getDefineTree() {
      let obj = {
        departmentId: this.departmentId && this.departmentId.length > 3 ? this.departmentId : null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueIdCopy
      }
      let res = await api.getTree(obj)
      this.treeData = res.data
    }
  }
}
</script>

<style lang="less" scoped></style>
