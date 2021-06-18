<template>
  <div>
    <Flow ref="flow" :propList="computedList" height="350"></Flow>
    <div class="tooltips">
      <div>
        <el-button
          v-if="(canEdit || !projectStart) && $access('TaskAdd')"
          type="primary"
          @click="
            () => {
              activeTask = {}
              editDialogVisible = true
            }
          "
          >新建任务</el-button
        >
        <el-dropdown
          v-if="(canEdit || !projectStart) && ($access('ImportProjectFile') || $access('ImportTemplate'))"
          style="margin: 0 10px;"
        >
          <el-button>
            导入任务
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="$access('ImportProjectFile')" @click.native="importProjectDialogVisible = true"
              >导入Project文件</el-dropdown-item
            >
            <el-dropdown-item
              v-if="$access('ImportBaseLineTemplate')"
              importTemplate
              @click.native="importBaseLineDialogVisible = true"
              >导入基准模板</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-if="$access('BaseLineSave')" @click="saveBase">保存基准</el-button>
        <el-button v-if="$access('BaseLineManage')" @click="baseManageDialogVisible = true">基准管理</el-button>
        <el-button @click="refresh">刷新</el-button>
      </div>
      <div
        v-if="canEdit && projectStart && taskListDraft && ($access('taskDraftRestore') || $access('taskDraftDiscard'))"
      >
        <el-alert style="width: 400px;" type="warning" :closable="false">
          <p slot="title">
            有上次保存的草稿，是否要恢复?
            <el-button style="margin-left: 10px;" size="mini" type="primary" @click="restoreDraft"> 恢复</el-button>
            <el-button style="margin-left: 10px;" size="mini" type="danger" @click="discardDraft"> 丢弃草稿</el-button>
          </p>
        </el-alert>
      </div>
    </div>
    <vxe-grid ref="table" :data="computedList" treeConfig resizable row-id="taskUniqueId">
      <vxe-table-column title="任务编号" align="left" tree-node field="wbsCode" width="180px">
        <template v-slot="{ row, level }">
          <span :style="{ fontWeight: level === 0 ? 'bold' : 'normal' }">
            {{ ['任务', '里程碑'][row.type - 1] + ' ' + row.wbsCode }}
          </span>
        </template>
      </vxe-table-column>
      <vxe-table-column title="任务名称" field="name"></vxe-table-column>
      <vxe-table-column title="工期(天)" width="80px" field="planDuration"></vxe-table-column>
      <vxe-table-column
        title="开始时间"
        :formatter="['toDateString', 'yyyy-MM-dd']"
        field="planStartTime"
      ></vxe-table-column>
      <vxe-table-column
        title="完成时间"
        :formatter="['toDateString', 'yyyy-MM-dd']"
        field="planEndTime"
      ></vxe-table-column>
      <vxe-table-column title="前置任务" field="preTaskId" :formatter="formatterPreTaskNames"></vxe-table-column>
      <vxe-table-column
        title="人力资源"
        field="resourceList"
        :formatter="({ cellValue }) => (cellValue || []).map(e => e.userName).join(',')"
      ></vxe-table-column>
      <vxe-table-column
        title="任务状态"
        field="status"
        :formatter="({ cellValue }) => ['未开始', '进行中', '已完成'][cellValue]"
      ></vxe-table-column>
      <vxe-table-column v-if="(projectStart && !canEdit) || !projectStart || canEdit" title="操作" width="200px">
        <template v-slot="{ row }">
          <el-button
            v-if="projectStart && !canEdit && $access('TaskProgressManage')"
            type="text"
            @click="
              () => {
                activeProgressEditTask = row
                progressEditDialogVisible = true
              }
            "
            >编辑进度</el-button
          >
          <el-button
            v-if="row.type === 2 && projectStart && !canEdit && $access('LaunchMilestoneMeeting')"
            type="text"
            @click="
              () => {
                activeMilestone = row
                taskName = row.name
                AddMeetingDialogVisible = true
              }
            "
            >{{ row.beginMeetingId ? '' : '发起开始会议' }}</el-button
          >
          <el-button
            v-if="(!projectStart || canEdit) && $access('TaskEdit')"
            type="text"
            @click="
              () => {
                activeTask = row
                editDialogVisible = true
              }
            "
            >编辑</el-button
          >
          <el-button v-if="(!projectStart || canEdit) && $access('TaskDelete')" type="text" @click="remove(row)"
            >删除</el-button
          >
        </template>
      </vxe-table-column>
    </vxe-grid>

    <Gantt
      ref="gantt"
      view-mode="month"
      :tasks="ganttTaskList"
      style="padding-bottom: 15px;"
      @taskClick="handleGanttTaskClick"
      @task-updated="debugEventLog.push($event)"
      @task-date-updated="debugEventLog.push($event)"
      @task-progress-change="debugEventLog.push($event)"
    />
    <div style="height: 40px;background-color: #edeff2;margin: 0 -20px;"></div>
    <footer v-if="projectStart" v-access="'/design/task/change'" class="main-footer">
      <el-button v-if="!canEdit" size="normal" type="primary" @click="canEdit = true">申请变更</el-button>
      <el-button v-else size="normal" type="primary" @click="submitChangeDialogVisible = true">提交变更</el-button>
      <el-button
        size="normal"
        @click="
          () => {
            canEdit = false
            refresh()
          }
        "
        >取消</el-button
      >
    </footer>

    <Edit
      ref="edit"
      :canEdit="canEdit"
      :task="activeTask"
      :projectStart="projectStart"
      :taskList="computedList"
      :originList="list"
      :visible.sync="editDialogVisible"
    ></Edit>
    <Detail :list="computedList" :form="activeTask" :visible.sync="detailDialogVisible"></Detail>
    <ProgressEdit
      ref="progressEdit"
      :task="activeProgressEditTask"
      active
      :visible.sync="progressEditDialogVisible"
    ></ProgressEdit>
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      title="基准管理"
      :visible.sync="baseManageDialogVisible"
      @close="baseManageDialogVisible = false"
    >
      <BaseManage v-if="baseManageDialogVisible"></BaseManage>
      <footer slot="footer">
        <el-button @click="baseManageDialogVisible = false">我知道了</el-button>
      </footer>
    </el-dialog>
    <AddMeeting
      :type="activeMilestone && activeMilestone.beginMeetingId ? 3 : 2"
      :visible.sync="AddMeetingDialogVisible"
      :taskName="taskName"
      :milestone="activeMilestone"
      @addSuccess="refresh"
    ></AddMeeting>

    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      destroy-on-close
      title="导入project"
      width="500px"
      :visible.sync="importProjectDialogVisible"
      @close="importFile = null"
    >
      <Upload v-model="importFile" accept=".xlsx,.xls,.mpp" raw></Upload>
      <span slot="footer">
        <el-button @click="importProjectDialogVisible = false">取消</el-button>
        <el-button :disabled="!importFile" type="primary" @click="submitImportProject">提交</el-button>
      </span>
    </el-dialog>
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      title="导入基准"
      width="800px"
      :visible.sync="importBaseLineDialogVisible"
    >
      <BaseManage
        v-if="importBaseLineDialogVisible"
        type="import"
        @change="id => (activeImportBaseLineId = id)"
      ></BaseManage>
      <span slot="footer">
        <el-button @click="importBaseLineDialogVisible = false">取消</el-button>
        <el-button :disabled="!activeImportBaseLineId" type="primary" @click="submitImportBaseLine">导入</el-button>
      </span>
    </el-dialog>
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      title="提交变更"
      :visible.sync="submitChangeDialogVisible"
      width="600px"
    >
      <el-form label-width="80px">
        <el-form-item label="变更原因">
          <el-input v-model="changeForm.changeReason" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="审批流程">
          <SelectProcessTemplate v-model="changeForm.processId"></SelectProcessTemplate>
        </el-form-item>
      </el-form>
      <Grid :tableData="processStages" :pagination="false">
        <vxe-table-column title="步骤" field="stageSeq"></vxe-table-column>
        <vxe-table-column
          title="审批人"
          field="auditorList"
          :formatter="({ cellValue }) => cellValue.map(e => e.name).join(',')"
        ></vxe-table-column>
        <vxe-table-column
          title="审批方式"
          field="passFlag"
          :formatter="({ cellValue }) => ['全部同意', '单人同意'][cellValue - 1]"
        ></vxe-table-column>
      </Grid>
      <span slot="footer">
        <el-button @click="submitChangeDialogVisible = false">取消</el-button>
        <el-button :disabled="!changeForm.changeReason && !changeForm.processId" type="primary" @click="submitChange"
          >提交</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import toTree from '@/utils/toTree'
import toFlat from '@/utils/toFlat'
import treeForEach from '@/utils/treeForEach'
import treeFilter from '@/utils/treeFilter'
import compareTaskList from '@/utils/compareTaskList'
import Edit from './components/Edit'
import Detail from './components/Detail'
import ProgressEdit from './components/ProgressEdit'
import BaseManage from './components/BaseManage'
import Gantt from '../components/Gantt'
import AddMeeting from '@/views/design/components/AddMeeting'
import Flow from '../components/Flow'
import SelectProcessTemplate from '../components/SelectProcessTemplate'
import treeFind from '@/utils/treeFind'
export default {
  name: 'Task',
  components: { Edit, Detail, ProgressEdit, BaseManage, Gantt, AddMeeting, Flow, SelectProcessTemplate },
  data() {
    return {
      originList: [],
      list: [],
      taskName: '',
      activeTask: {},
      activeMilestone: null,
      activeProgressEditTask: {},
      progressEditDialogVisible: false,
      editDialogVisible: false,
      detailDialogVisible: false,
      baseManageDialogVisible: false,
      AddMeetingDialogVisible: false,
      importProjectDialogVisible: false,
      importBaseLineDialogVisible: false,
      submitChangeDialogVisible: false,
      debugEventLog: [],
      changeForm: {},
      importFile: null,
      activeImportBaseLineId: null,
      filterForm: {
        type: 1
      },
      canEdit: false,
      taskListDraft: null
    }
  },
  computed: {
    computedList() {
      let data = _.cloneDeep(this.list)
      let list = toTree(data, 'parentTaskUniqueId', 'planStartTime', 'taskUniqueId', false)
      treeForEach(list, (item, parent, index) => {
        if (!parent) {
          item.wbsCode = index + 1
        } else {
          item.wbsCode = parent.wbsCode + '.' + (index + 1)
        }
      })
      return list
    },
    projectStart() {
      return this.projectDetail?.projectStatus === '2'
    },
    processStages() {
      return _.get(_.find(this.$store.state.design.processTemplateList, { id: this.changeForm.processId }), 'stages')
    },
    projectDetail() {
      return this.$store.state.design.projectDetail
    },
    ganttTaskList() {
      return _.sortBy(this.list, 'planStartTime').map(e => ({
        id: '' + e.taskUniqueId,
        rowId: e.id,
        text: e.name,
        actual_start: e.actualStartTime && moment(e.actualStartTime).toDate(),
        actual_end: e.actualEndTime && moment(e.actualEndTime).toDate(),
        start_date: moment(e.planStartTime).toDate(),
        end_date: moment(e.planEndTime).toDate(),
        progress: e.actualProgress,
        // parent: e.parentTaskUniqueId,
        dependencies: e.preTaskId ? e.preTaskId.split(',') : [],
        linkType: e.preTaskId === e.parentTaskUniqueId.toString() ? '1' : '0'
      }))
    }
  },
  watch: {
    projectStart() {
      this.$refs.table.refreshColumn()
    },
    list() {
      let changeData = compareTaskList(this.list, _.cloneDeep(this.originList))
      if (changeData.addTaskList.length || changeData.deleteIds.length || changeData.updateTaskList.length) {
        sessionStorage.setItem('taskListDraft-' + localStorage.getItem('projectId'), JSON.stringify(this.list))
        localStorage.setItem('taskListDraft-' + localStorage.getItem('projectId'), JSON.stringify(this.list))
      }
    },
    canEdit: function(val) {
      if (val) {
        if (sessionStorage.getItem('taskListDraft-' + localStorage.getItem('projectId'))) {
          this.list = JSON.parse(localStorage.getItem('taskListDraft-' + localStorage.getItem('projectId')))
          this.$message.success('已从缓存中恢复上次未提交的内容；可以点击刷新按钮使用服务器上的任务')
        } else {
          let exists = localStorage.getItem('taskListDraft-' + localStorage.getItem('projectId'))
          if (exists) this.taskListDraft = JSON.parse(exists)
        }
      }
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    refresh() {
      return this.axios.schedule.get('schedule/task/treeList/' + localStorage.getItem('projectId')).then(res => {
        res.data = res.data || []
        this.originList = _.cloneDeep(res.data)
        this.list = res.data
      })
    },
    saveBase() {
      this.$prompt('请输入名称', '保存基准', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.{2,300}/,
        inputErrorMessage: '必填'
      }).then(({ value }) => {
        this.axios.schedule
          .post('schedule/plan/saveBase', { planName: value, projectId: localStorage.getItem('projectId') })
          .then(res => {
            this.$message.success('保存基准成功')
            this.$refs.gantt.getBaseLineList()
          })
      })
    },
    loadData() {
      this.$refs.table.$refs.xTable.loadData(this.computedList)
    },
    remove(row) {
      if (this.projectStart) {
        this.list = this.list.filter(e => !(e.ancestorIds || []).concat(e.id).includes(row.id))
        this.loadData()
      } else {
        if (_.size(row.children)) {
          this.$message.error('先删除下级任务才可以删除此任务')
        } else {
          this.$confirm('确定要删除吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.axios.schedule.get('schedule/task/deleteById/' + row.id).then(res => {
              this.$message.success('删除成功')
              this.refresh()
            })
          })
        }
      }
    },
    handleGanttTaskClick(taskUniqueId) {
      this.activeTask = _.find(this.list, { taskUniqueId: +taskUniqueId })
      this.detailDialogVisible = true
    },
    submitImportProject() {
      let formData = new FormData()
      formData.append('projectId', localStorage.getItem('projectId'))
      formData.append('projectName', localStorage.getItem('projectName'))
      formData.append('file', this.importFile)
      this.axios.schedule.post('schedule/plan/importProject', formData).then(res => {
        this.$message.success('导入成功')
        this.importProjectDialogVisible = false
        this.refresh()
      })
    },
    submitImportBaseLine() {
      this.axios.schedule
        .get('schedule/plan/applyBase/' + this.activeImportBaseLineId + '/' + localStorage.getItem('projectId'))
        .then(res => {
          this.$message.success('导入基准成功')
          this.importBaseLineDialogVisible = false
          this.refresh()
        })
    },
    submitChange() {
      let list = _.cloneDeep(this.list)
      treeForEach(list, e => delete e.ancestorIds)
      let changeData = compareTaskList(list, _.cloneDeep(this.originList))
      this.axios.schedule
        .post('schedule/plan/submitAudit', {
          ...changeData,
          ...this.changeForm,
          projectId: localStorage.getItem('projectId'),
          planId: _.first(this.list).planId
        })
        .then(res => {
          this.$message.success('提交成功')
          this.submitChangeDialogVisible = false
        })
    },
    formatterPreTaskNames({ cellValue: taskIds }) {
      if (taskIds && taskIds !== '0') {
        return taskIds
          .split(',')
          .map(e => {
            const target = treeFind(this.list, f => f.taskUniqueId === +e)
            if (target) {
              return ['任务', '里程碑'][target.type - 1] + ' ' + target.wbsCode
            }
          })
          .join('，')
      } else {
        return ''
      }
    },
    discardDraft() {
      sessionStorage.removeItem('taskListDraft-' + localStorage.getItem('projectId'))
      localStorage.removeItem('taskListDraft-' + localStorage.getItem('projectId'))
      this.taskListDraft = null
    },
    restoreDraft() {
      this.list = _.cloneDeep(this.taskListDraft)
      this.taskListDraft = null
    }
  }
}
</script>

<style scoped lang="less">
.main-footer {
  position: fixed;
  z-index: 100;
  background-color: #fff;
  width: calc(100vw - 270px);
  bottom: 0;
  left: 230px;
  padding: 10px 20px;
  box-shadow: 0 -3px 8px rgba(70, 70, 70, 0.64);
}
</style>
