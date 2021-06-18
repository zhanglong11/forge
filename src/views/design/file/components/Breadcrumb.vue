<!--
 * @Description: 面包屑当前位置
 * @Version: 
 * @Autor: 
 * @Date: 2020-02-21 09:34:35
 * @LastEditTime: 2020-03-11 11:55:45
 -->
<template>
  <div>
    <div class="flex">
      <span>当前位置：</span>
      <el-breadcrumb>
        <el-breadcrumb-item v-for="(item, index) in list" :key="item.id">
          <span v-if="index !== 0" class="point" @click.capture="breadcrumbClick(item, index)">{{ item.name }}</span>
          <span v-else>{{ item.name }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>

<script>
import api from '@/api/design/file'
import treeFindPath from '@/utils/treeFindPath'
export default {
  props: {
    targetObj: {},
    module: {},
    // 里程碑标题
    taskTitle: {},
    taskUniqueId: {},
    // 一级菜单id
    departmentId: {}
  },
  data() {
    return {
      // 用于找到历史路径
      treeData: [],
      // 历史路径
      list: []
    }
  },
  watch: {
    // 一级菜单更改:树结构也要更改,路径要初始化
    departmentId: {
      handler: function(n, o) {
        this.getTreeData()
        this.initPath()
      },
      immediate: true
    },
    // 里程碑id更新，树结构也要重新更改，路径同样初始化
    taskUniqueId: {
      handler: function(n, o) {
        this.getTreeData()
        this.initPath()
      }
    }
  },
  methods: {
    initPath() {
      if (!this.taskUniqueId) return
      let arr = [
        {
          id: '',
          pid: '',
          name: this.taskTitle
        },
        {
          id: null,
          pid: '0',
          name: this.targetObj.name
        }
      ]
      this.list = arr
    },
    // 获取历史路径信息
    getHistoryPath(id, name) {
      let arr = [
        {
          id: '',
          pid: '',
          name: this.taskTitle
        }
      ]
      let data = treeFindPath(this.treeData, e => e.id === id)
      if (data.length > 0) {
        data.unshift(...arr)
        this.list = data
      } else {
        console.log(name)
      }
    },
    // 面包屑点击
    breadcrumbClick(item, index) {
      console.log(item)
      let pid = item.id
      if (index === 1) {
        pid = '0'
      }
      this.getHistoryPath(item.id)
      this.$emit('updateTable', pid)
    },
    async getTreeData() {
      console.log(this.taskUniqueId)
      // 为空则为回到主线
      if (!this.taskUniqueId) return (this.list = [])
      let obj = {
        departmentId: this.departmentId && this.departmentId.length > 3 ? this.departmentId : null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId
      }
      console.log(this.departmentId)
      if (this.departmentId === '2') {
        //存档区
        obj.module = this.module
        let res = await api.getSelectPigeonholeTree(obj)
        this.treeData = res.data
      } else if (this.departmentId === '3') {
        // 共享区
        obj.module = this.module
        let res = await api.getSelectShareTree(obj)
        this.treeData = res.data
      } else {
        let res = await api.getTree(obj)
        this.treeData = res.data
      }
    }
  }
}
</script>

<style lang="less" scoped>
.point {
  cursor: pointer;
  color: #409eff;
}
.flex {
  padding: 0 0 10px 0;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #909399;
  /deep/ .el-breadcrumb__item:last-child .el-breadcrumb__inner {
    color: #909399;
  }
  /deep/ .el-breadcrumb__inner {
    color: #909399;
  }
}
</style>
