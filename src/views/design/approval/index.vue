<template>
  <div>
    <el-tabs v-model="moduleType">
      <el-tab-pane label="待我审批的" name="1"></el-tab-pane>
      <el-tab-pane label="我发起的" name="2"></el-tab-pane>
      <el-tab-pane label="我已审批的" name="3"></el-tab-pane>
      <el-tab-pane label="抄送我的" name="4"></el-tab-pane>
    </el-tabs>
    <div class="tooltips">
      <el-form inline>
        <el-form-item v-if="moduleType !== '2'" label="发起人">
          <SelectUser v-model="filterForm.applyUserId" :multiple="false" valueFormat="id"></SelectUser>
        </el-form-item>
        <el-form-item label="审批类型">
          <el-select v-model="filterForm.auditType">
            <el-option v-for="e in auditTypeList" :key="e.value" :value="e.value" :label="e.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filterForm.date"
            style="width: 230px;"
            type="daterange"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="() => $refs.table.refresh()">搜索</el-button>
          <el-button @click="() => $refs.table.reset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Grid ref="table" :request="request" :filterForm.sync="filterForm">
      <vxe-table-column width="60px" type="seq" title="序号"></vxe-table-column>
      <vxe-table-column
        align="center"
        show-overflow="title"
        title="审批事项名称"
        field="processInstanceName"
      ></vxe-table-column>
      <vxe-table-column
        align="center"
        show-overflow="title"
        title="简述"
        field="processInstanceDesp"
      ></vxe-table-column>
      <vxe-table-column width="80px" align="center" title="发起人" field="creatorName"></vxe-table-column>
      <vxe-table-column width="150px" align="center" title="发起时间" field="createTime"></vxe-table-column>
      <vxe-table-column width="120px" align="center" title="待办人" field="auditorName"></vxe-table-column>
      <vxe-table-column width="100px" align="center" title="审批状态" field="auditStatus">
        <Status slot-scope="{ row }" :options="auditStatus" :value="row.auditStatus"></Status>
      </vxe-table-column>
      <vxe-table-column width="120px" align="center" title="操作" field="title">
        <template slot-scope="{ row }">
          <el-button
            v-if="$access('ApprovalDetail')"
            type="text"
            @click="
              () => {
                editType = 'detail'
                activeAudit = row
                editDialogVisible = true
              }
            "
            >详情</el-button
          >
          <el-button
            v-if="moduleType === '1' && $access('ApprovalEdit')"
            type="text"
            @click="
              () => {
                editType = 'audit'
                activeAudit = row
                editDialogVisible = true
              }
            "
            >审批</el-button
          >
        </template>
      </vxe-table-column>
    </Grid>
    <Edit :type="editType" :audit="activeAudit" :visible.sync="editDialogVisible"></Edit>
  </div>
</template>

<script>
import Edit from './components/Edit'
import auditStatus from './lib/auditStatus'
import auditTypeList from '../lib/auditTypeList'

export default {
  name: 'Approval',
  components: { Edit },
  data() {
    return {
      moduleType: localStorage.getItem('lastActiveDesignApprovalModuleType') || '1',
      editDialogVisible: false,
      activeAudit: {},
      editType: 'detail',
      filterForm: {
        date: null,
        auditType: null,
        projectId: localStorage.getItem('projectId')
      },
      auditTypeList,
      auditStatus,
      request: body => {
        const urlList = [
          'process/task/todo',
          'process/instance/mine',
          'process/task/finished',
          'process/instance/carbon'
        ]
        if (_.size(body.date) === 2) {
          body.startTime = body.date[0] + ' 00:00:00'
          body.endTime = body.date[1] + ' 23:59:59'
        }
        if (this.moduleType === '2') body = _.omit(body, 'creator')
        delete body.date
        return this.axios.design.post(urlList[this.moduleType - 1], body).then(res => res.data)
      }
    }
  },
  watch: {
    moduleType(val) {
      localStorage.setItem('lastActiveDesignApprovalModuleType', val)
      this.$refs.table.reset()
    }
  },
  methods: {
    refresh() {
      this.$refs.table.refresh()
    }
  }
}
</script>
