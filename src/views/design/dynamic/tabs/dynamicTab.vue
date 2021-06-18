<!--
 * @Description: 项目动态tabs
 * @Author: 
 * @Date: 2020-01-19 08:58:04
 -->
<template>
  <div>
    <div v-if="$access('DynamicAdd')" class="form">
      <el-form ref="dynamicForm" :model="dynamicForm" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="dynamicForm.title" style="width:500px"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="dynamicForm.content" type="textarea" style="width:500px"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="dynamicForm.type" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="sendJudge">发布通告</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Table
      ref="table"
      v-loading="tableLoading"
      :tableData="tableData"
      :pageQuery="pageQuery"
      :total="total"
      rowId="id"
      :columns="tableColumn"
      @selectionChange="selectionChange"
      @getList="getList"
      @pageChange="pageChange"
      @sizeChange="sizeChange"
    />
  </div>
</template>
<script>
import PageMixin from '@/mixins/pageMixin'
import api from '@/api/design/dynamic'
export default {
  mixins: [PageMixin],
  props: {
    // 里程碑id
    taskUniqueId: {}
  },
  data() {
    return {
      typeList: [
        {
          label: '通告',
          value: 1
        },
        {
          label: '任务',
          value: 2
        },
        {
          label: '会议',
          value: 3
        }
      ],
      dynamicForm: {
        title: '',
        content: '',
        taskId: ''
      },
      rules: {
        content: { required: true, message: '内容必填', trigger: 'blur' },
        title: { required: true, message: '标题必填', trigger: 'blur' },
        type: { required: true, message: '类型必选', trigger: 'change' }
      },
      pageQuery: {
        taskUniqueId: this.taskUniqueId,
        projectId: localStorage.getItem('projectId')
      },
      tableColumn: [
        {
          prop: 'type',
          label: '类型',
          render: (h, { row }) => {
            let label = _.get(
              this.typeList.find(item => item.value === row.type),
              'label',
              '-'
            )
            return h('div', {}, label)
          }
        },

        { prop: 'title', label: '标题' },
        { prop: 'content', label: '内容简述' },
        { prop: 'creatorName', label: '发布人' },
        { prop: 'createTime', label: '时间' }
      ],
      request: api.getDynamicList
    }
  },
  watch: {
    taskUniqueId() {
      this.getList()
    }
  },
  methods: {
    sendJudge() {
      this.$refs['dynamicForm'].validate(valid => {
        if (valid) {
          this.sendAnnunciate()
        }
      })
    },
    async sendAnnunciate() {
      let obj = {
        content: this.dynamicForm.content,
        projectId: localStorage.getItem('projectId'),
        title: this.dynamicForm.title,
        type: this.dynamicForm.type,
        taskId: this.taskUniqueId
      }
      let res = await api.addDynamic(obj)
      this.$message.success('新增成功')
      this.$refs.dynamicForm.resetFields()
      this.getList()
    }
  }
}
</script>
<style lang="less" scoped></style>
