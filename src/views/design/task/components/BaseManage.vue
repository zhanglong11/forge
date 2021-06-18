<template>
  <!--
/**
任务名称：2636/导入基准调整为支持跨项目
开发人员：李建敏
日期：2020-3月-20日
任务类型：1、全新代码（15行）
**/
-->
  <div>
    <el-form v-if="type === 'import'">
      <el-form-item label="项目名称">
        <el-select v-model="activeProjectId">
          <el-option
            v-for="e in projectList"
            :key="e.projectId"
            :value="e.projectId"
            :label="e.projectName"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <!--
  /**
  任务名称：2636/导入基准调整为支持跨项目
  开发人员：李建敏
  日期：2020-3月-20日
  任务类型：2、修改代码（2行）
  **/
  -->
    <vxe-table
      ref="table"
      max-height="360px"
      highlightCurrentRow
      :data="list"
      @current-change="({ row }) => $emit('change', row.id)"
    >
      <vxe-table-column field="planName" title="名称"></vxe-table-column>
      <vxe-table-column field="createTime" title="保存时间"></vxe-table-column>
      <vxe-table-column field="creatorName" title="保存人"></vxe-table-column>
      <vxe-table-column v-if="type === 'manage'" title="操作">
        <el-popconfirm slot-scope="{ row }" title="确定删除吗？" @onConfirm="remove(row)">
          <el-button slot="reference" style="margin-left: 0;" type="text">删除</el-button>
        </el-popconfirm>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
export default {
  name: 'BaseManage',
  props: {
    type: {
      type: String,
      enum: ['manage', 'import'],
      default: 'manage'
    }
  },
  data() {
    return {
      /**
任务名称：2636/导入基准调整为支持跨项目
开发人员：李建敏
日期：2020-3月-20日
任务类型：2、修改代码（3行）
**/

      request() {
        return this.axios.schedule
          .get('schedule/plan/listBase/' + localStorage.getItem('projectId'))
          .then(res => res.data)
      },
      /**
       任务名称：2636/导入基准调整为支持跨项目
       开发人员：李建敏
       日期：2020-3月-20日
       任务类型：2、修改代码（3行）
       **/
      projectList: [],
      activeProjectId: null,
      list: []
    }
  },
  watch: {
    /**
     任务名称：2636/导入基准调整为支持跨项目
     开发人员：李建敏
     日期：2020-3月-20日
     任务类型：2、修改代码（3行）
     **/
    activeProjectId() {
      this.axios.schedule.get('schedule/plan/listBase/' + this.activeProjectId).then(res => (this.list = res.data))
    }
  },
  /**
   任务名称：2636/导入基准调整为支持跨项目
   开发人员：李建敏
   日期：2020-3月-20日
   任务类型：2、修改代码（3行）
   **/
  created() {
    this.getProjectList()
  },
  methods: {
    /**
     任务名称：2636/导入基准调整为支持跨项目
     开发人员：李建敏
     日期：2020-3月-20日
     任务类型：2、全新代码（10行）
     **/
    getProjectList() {
      this.axios.schedule.get('schedule/plan/listProject').then(res => {
        this.projectList = res.data
        if (!res.data.length) return false
        const currentProjectId = localStorage.getItem('projectId')
        if (_.find(res.data, { projectId: currentProjectId })) {
          this.activeProjectId = currentProjectId
        } else {
          this.activeProjectId = res.data[0].projectId
        }
      })
    },
    async remove(row) {
      await this.axios.schedule.get('schedule/plan/deleteBase/' + row.id)
      this.$refs.table.refresh()
    }
  }
}
</script>

<style scoped lang="less"></style>
