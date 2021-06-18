<template>
  <div>
    <div class="tooltips">
      <el-form inline>
        <el-form-item label="发起人">
          <SelectUser v-model="filterForm.creator"></SelectUser>
        </el-form-item>
        <el-form-item label="审批类型">
          <SelectProcessTemplate v-model="filterForm.auditType" style="width: 120px;"></SelectProcessTemplate>
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
            type="text"
            @click="
              () => {
                editType = 'detail'
                activeAudit = row
                editDialogVisible = true
              }
            "
            >详情
          </el-button>
          <el-button
            type="text"
            @click="
              () => {
                editType = 'audit'
                activeAudit = row
                editDialogVisible = true
              }
            "
            >审批
          </el-button>
        </template>
      </vxe-table-column>
    </Grid>
    <Edit :type="editType" :audit="activeAudit" :visible.sync="editDialogVisible"></Edit>
  </div>
</template>
<script>
import SelectProcessTemplate from '@/views/design/components/SelectProcessTemplate'
import Edit from '@/views/design/approval/components/Edit'
export default {
  name: 'Mine',
  components: { SelectProcessTemplate, Edit },
  data() {
    return {
      filterForm: {
        projectId: localStorage.getItem('projectId')
      },
      editDialogVisible: false,
      editType: null,
      activeAudit: null,
      request: body => {
        if (_.size(body.date) === 2) {
          body.startTime = body.date[0] + ' 00:00:00'
          body.endTime = body.date[1] + ' 23:59:59'
        }
        delete body.date
        return this.axios.design.post('process/instance/mine', body).then(res => res.data)
      }
    }
  }
}
</script>
