<!--
 * @Description: 内部分享
 * @Version:
 * @Autor:
 * @Date: 2020-02-21 18:00:07
 * @LastEditTime: 2020-02-22 17:05:09
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
      <div style="height:400px;overflow-y: scroll;">
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
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      treeData: [],
      visible: false,
      targetFolderId: '',
      operateType: ''
    }
  },
  methods: {
    async sure() {
      let obj = {
        fileIdList: this.selectedList.filter(item => item.type === 2).map(item => item.id),
        folderIdList: this.selectedList.filter(item => item.type === 1).map(item => item.id),
        operateType: this.operateType,
        targetFolderId: this.targetFolderId
      }
      if (this.targetFolderId) {
        let res = await api.copyMoveFile(obj)
        this.$message.success('操作成功')
        this.visible = false
        this.$emit('success')
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
      this.getShareTreeData()
    },
    close() {
      this.$emit('success')
      this.visible = false
      this.targetFolderId = null
      this.operateType = null
    },
    // 内部共享tree
    async getShareTreeData() {
      let obj = {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId
      }
      let res = await api.getSelectShareTree(obj)
      this.treeData = res.data
    }
    // 复制、移动tree
    // async getMoveTree() {
    //   let obj = {
    //     projectId: localStorage.getItem('projectId'),
    //     taskUniqueId: this.taskUniqueId,
    //     module: this.module
    //   }
    //   let res = await api.getSelectShareTree(obj)
    //   this.treeData = res.data
    // },

    // 存档区
    // async getSelectPigeonholeTree() {
    //   let obj = {
    //     projectId: localStorage.getItem('projectId'),
    //     taskUniqueId: this.taskUniqueId
    //   }
    //   let res = await api.getSelectPigeonholeTree(obj)
    //   this.treeData = res.data
    // },
    // // 自定义区
    // async getDefineTree() {
    //   let obj = {
    //     departmentId: this.departmentId && this.departmentId.length > 3 ? this.departmentId : null,
    //     projectId: localStorage.getItem('projectId'),
    //     taskUniqueId: this.taskUniqueId
    //   }
    //   let res = await api.getTree(obj)
    //   this.treeData = res.data
    // }
  }
}
</script>

<style lang="less" scoped></style>
