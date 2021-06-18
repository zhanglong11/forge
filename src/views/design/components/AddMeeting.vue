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
<!--/**
任务名称：2868/添加3月注释
开发人员：李建敏
日期：2020-3月-4日
任务类型：2、复制修改代码 （20行）
**/-->
<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    :visible="visible"
    width="700px"
    destroy-on-close
    :title="['一般会议', '里程碑开始会议', '里程碑结束会议'][type - 1]"
    @close="$emit('update:visible', false)"
  >
    <el-form ref="form" :rules="rules" :model="form" label-width="80px">
      <el-form-item label="会议主题" prop="meetingTheme">
        <el-input v-model="form.meetingTheme"></el-input>
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
        <!--        <Upload style="display: inline-block;margin-right: 15px;" :isOnlyButton="true" @input="uploadSuccess"></Upload>-->
        <el-button type="primary" @click="selectFileDialogVisible = true">从工作区中选择</el-button>
        <SelectFile
          :visible.sync="selectFileDialogVisible"
          :milestone="milestone"
          :taskUniqueId="taskUniqueId"
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
import SelectFile from './SelectFile'
import preview from '@/utils/preview'
export default {
  name: 'AddMeeting',
  components: { SelectFile },
  props: {
    taskName: {},
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      default: 1 //   1 普通会议  2 里程碑会议
    },
    milestone: Object,
    // 一般会议里程碑id
    taskUniqueId: {}
  },
  data() {
    return {
      files: [],
      selectFileDialogVisible: false,
      form: {
        participant: []
      },
      rules: {
        meetingTheme: [{ required: true, message: '必填' }],
        meetingTime: [{ required: true, message: '必填' }],
        address: [{ required: true, message: '必填' }],
        principalId: [{ required: true, message: '必填' }],
        participant: [{ required: true, message: '必填' }],
        meetingContent: [{ required: true, message: '必填' }]
      }
    }
  },
  methods: {
    preview(row) {
      preview(row)
    },
    uploadSuccess(e, f) {
      if (e.code === 200) {
        this.files.push({ name: f[0].name, id: e.data })
      }
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
      // this.files = _.unionBy(this.files, arr, 'id')
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
    /**
     任务名称：2868/添加3月注释
     开发人员：李建敏
     日期：2020-3月-4日
     任务类型：2、复制修改代码 （6行）
     **/
    async submit() {
      await this.$refs.form.validate()
      let form = _.cloneDeep(this.form)
      if (_.size(form.participant)) {
        form.participantId = form.participant.map(e => e.id).join(',')
        form.participantName = form.participant.map(e => e.name).join(',')
      }
      if (this.milestone) form.taskId = this.milestone.taskUniqueId
      if (this.taskUniqueId) form.taskId = this.taskUniqueId
      let fileIdList = this.files.map(item => item.id)
      form.fileIdList = fileIdList ? fileIdList : []
      if (this.type !== 1) form.taskName = this.taskName
      this.axios.design
        .post('project/meeting/add', {
          type: this.type,
          projectId: localStorage.getItem('projectId'),
          ...form
        })
        .then(res => {
          if (this.milestone) {
            this.axios.schedule.post('schedule/task/updateMeeting', {
              taskId: this.milestone.id,
              ...(this.milestone.beginMeetingId ? { endMeetingId: res.data } : { beginMeetingId: res.data })
            })
          }
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
