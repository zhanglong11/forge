<!--
 * @Description: 一般会议与里程碑会议分开
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-03-17 17:16:03
 * @LastEditTime: 2020-04-02 09:47:55
 -->
<!--
  任务名称：1174 || 发起会议选择阶段
  开发人员：申豪强
  日期：2020-03-18
  BUG类型：测试人员提出的系统性BUG
-->
<template>
  <el-dialog
    v-dialogDrag
    :visible="visible"
    width="700px"
    destroy-on-close
    title="一般会议"
    @opened="opened"
    @close="close"
  >
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item label="会议主题" prop="meetingTheme">
        <el-input v-model="form.meetingTheme"></el-input>
      </el-form-item>
      <el-form-item label="阶段" prop="taskId">
        <el-input v-model="form.taskId" style="display:none"></el-input>
        <!-- 自测bug：传taskName 申豪强 2020-03-27 -->
        <Stage ref="stage" :targetTaskUniqueId.sync="form.taskId" :taskName.sync="form.taskName" />
      </el-form-item>
      <el-form-item label="会议时间" prop="meetingTime">
        <el-date-picker
          v-model="form.meetingTime"
          type="datetime"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="会议地点" prop="address">
        <el-input v-model="form.address"></el-input>
      </el-form-item>
      <el-form-item label="负责人" prop="principalId">
        <el-input v-model="form.principalId" style="display:none"></el-input>
        <SelectUser
          :id.sync="form.principalId"
          :value="form.principalId ? { id: form.principalId, label: form.principalName } : null"
          :name.sync="form.principalName"
          :multiple="false"
        ></SelectUser>
      </el-form-item>
      <el-form-item label="参会人员" prop="participant">
        <SelectUser v-model="form.participant"></SelectUser>
      </el-form-item>
      <el-form-item label="讨论内容" prop="meetingContent">
        <el-input v-model="form.meetingContent" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
      </el-form-item>
      <el-form-item label="关联文件">
        <el-button type="primary" @click="selectJudge">从工作区中选择</el-button>
        <SelectFile
          :visible.sync="selectFileDialogVisible"
          :taskUniqueId="form.taskId"
          @change="handleSelectFileChange"
        ></SelectFile>
      </el-form-item>
      <el-form-item label="关联文件">
        <el-table :data="files" style="width: 100%" max-height="250" header-align="center">
          <el-table-column align="center" type="index" width="50px"></el-table-column>
          <el-table-column prop="name" label="文件列表" align="center">
            <template slot-scope="{ row }">
              <el-button type="text" size="small" @click="preview(row)">{{ row.name }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" @click="remove(scope.$index, files)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item prop="sendMeetingNotice">
        <el-checkbox v-model="form.sendMeetingNotice" :true-label="1" :false-label="0"
          >发出会议通知到每个参会人</el-checkbox
        >
      </el-form-item>
    </el-form>
    <!-- 存档文件 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submit">创建</el-button>
    </span>
  </el-dialog>
</template>

<script>
import indexApi from '@/api/design/index'
import Stage from './Stage'
import SelectFile from './SelectFile'
import preview from '@/utils/preview'
export default {
  name: 'AddMeeting',
  components: {
    SelectFile,
    Stage
  },
  props: {
    taskName: {},
    visible: {
      type: Boolean,
      default: false
    },
    // 一般会议大里程碑id
    taskUniqueId: {}
  },
  data() {
    return {
      targetTaskUniqueId: '',
      files: [],
      selectFileDialogVisible: false,
      form: {
        type: 1,
        projectId: localStorage.getItem('projectId'),
        participant: [],
        address: '',
        approverId: '',
        approverName: '',
        fileIdList: [],
        meetingConclusion: null,
        meetingContent: '',
        meetingSummary: '',
        meetingTheme: '',
        meetingTime: '',
        participantId: '',
        participantName: '',
        principalId: '',
        principalName: '',
        sendMeetingNotice: null,
        status: null,
        taskId: '',
        taskName: ''
      },
      rules: {
        meetingTheme: [{ required: true, message: '必填' }],
        meetingTime: [{ required: true, message: '必填' }],
        taskId: [{ required: true, message: '必填' }],
        address: [{ required: true, message: '必填' }],
        principalId: [{ required: true, message: '必填' }],
        participant: [{ required: true, message: '必填' }],
        meetingContent: [{ required: true, message: '必填' }]
      }
    }
  },
  methods: {
    /*
     * @任务编号: 2748 | 普通文件的在线预览
     * @开发人员:申豪强
     * @日期:2020-03-30
     * @代码类型：新功能
     */
    // 预览
    async preview(row) {
      preview(row)
    },
    selectJudge() {
      if (!this.form.taskId) return this.$message.error('请选择阶段')
      this.selectFileDialogVisible = true
    },
    close() {
      this.$emit('update:visible', false)
      this.$refs.form.resetFields()
      this.files = []
    },
    opened() {
      this.$refs.stage.refresh()
    },
    remove(index, rows) {
      rows.splice(index, 1)
    },
    /*
     * @任务编号: 2748 | 普通文件的在线预览
     * @开发人员:申豪强
     * @日期:2020-04-01
     * @代码类型：新功能
     */
    handleSelectFileChange(arr) {
      if (arr.length === 0) return
      let files = arr.map(item => {
        let obj = {
          name: item.name,
          id: item.id,
          commonFileId: item.commonFileId
        }
        return obj
      })

      this.files.push(...files)
    },
    async submit() {
      await this.$refs.form.validate()
      let form = _.cloneDeep(this.form)
      if (_.size(form.participant)) {
        form.participantId = form.participant.map(e => e.id).join(',')
        form.participantName = form.participant.map(e => e.name).join(',')
      }
      form.taskId = form.taskId.toString()
      let fileIdList = this.files.map(item => item.id)
      form.fileIdList = fileIdList ? fileIdList : []
      this.axios.design
        .post('project/meeting/add', {
          ...form
        })
        .then(res => {
          this.$message.success('发起成功')
          this.$emit('update:visible', false)
          this.$emit('addSuccess')
          this.$refs.form.resetFields()
          this.files = []
        })
    }
  }
}
</script>

<style scoped lang="less"></style>
