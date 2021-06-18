<!--/**
任务名称：2868/添加3月注释
开发人员：李建敏
日期：2020-3月-12日
任务类型：2、复制修改代码 （20行）
**/-->
<template>
  <div class="main">
    <el-tree
      ref="tree"
      node-key="id"
      :expand-on-click-node="false"
      highlight-current
      :data="treeData"
      @node-click="handleNodeClick"
    >
    </el-tree>
    <el-form ref="form" :model="form" :rules="rules" label-position="left" label-width="60px">
      <el-form-item label="名称" prop="groupName">
        <el-input v-model="form.groupName"></el-input>
      </el-form-item>
      <el-form-item label="父级" prop="pid">
        <el-cascader
          v-model="form.pid"
          :props="{ emitPath: false, checkStrictly: true }"
          :options="computedTreeData"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="code" prop="groupCode">
        <el-input v-model="form.groupCode"></el-input>
      </el-form-item>
      <el-form-item style="text-align: right;">
        <el-button v-if="form.id" type="danger" @click="remove">删除</el-button>
        <el-button type="primary" @click="submit">{{ form.id ? '保存' : '新建' }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import toTree from '@/utils/toTree'
import treeForEach from '@/utils/treeForEach'
export default {
  name: 'Category',
  data() {
    return {
      list: [],
      form: {},
      rules: {
        groupName: { required: true, message: '必填' },
        groupCode: { required: true, message: '必填' }
      }
    }
  },
  computed: {
    treeData() {
      return this.$store.state.design.processGroupListTree
    },
    computedTreeData() {
      return treeForEach(_.cloneDeep(this.treeData), e => {
        if (e.id === this.form.id) e.disabled = true
      })
    }
  },

  /**
任bug称：1352/ 设计模块-流程-修改分类问题
开发人员：李建敏
日期：2020-3月-31日
任务类型：1、修改（10行）
**/

  methods: {
    async refresh() {
      return this.$store.dispatch('design/getProcessGroup')
    },
    async submit() {
      await this.$refs.form.validate()
      await this.axios.design
        .post('process/group/' + (this.form.id ? 'update' : 'add'), {
          projectId: localStorage.getItem('projectId'),
          ...this.form
        })
        .then(() => {
          this.$message.success(this.form.id ? '保存成功' : '创建')
        })
      await this.refresh()
      await this.$nextTick()
      if (this.form.id) {
        this.$refs.tree.setCurrentKey(this.form.id)
      }
    },
    async remove() {
      this.$confirm('确定要删除吗？').then(res => {
        this.axios.design.get('process/group/delete/' + this.form.id).then(res => this.$message.success('删除成功'))
        this.refresh()
      })
    },
    handleNodeClick(data, node) {
      if (this.form.id === data.id) {
        this.form = {}
        node.isCurrent = false
        this.$refs.form.resetFields()
      } else {
        this.form = _.cloneDeep(data)
      }
    }
  }
}
</script>

<style scoped lang="less">
.main {
  display: flex;
  .el-tree {
    width: 200px;
    margin-right: 25px;
    /deep/ .el-tree-node.is-current > div:first-child {
      background-color: lighten(#5a92ff, 5%);
      color: #fff;
    }
  }
  .el-form {
    flex: 1;
  }
}
</style>
