<!--
 * @Description: 会议结论
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-02-17 09:09:38
 * @LastEditTime: 2020-04-02 09:45:42
 * 修改会议参会人文件bug
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
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      :visible="visible"
      width="740px"
      :title="type === 1 ? '一般会议' : '里程碑会议'"
      @close="close"
    >
      <div class="max-height max-width">
        <el-form ref="form" :rules="rules" :model="form" label-width="120px">
          <el-form-item label="会议主题">{{ form.meetingTheme }}</el-form-item>
          <el-form-item label="会议开始时间">{{ form.meetingTime }}</el-form-item>
          <el-form-item label="会议地点">{{ form.address }}</el-form-item>
          <el-form-item label="负责人">{{ form.principalName }}</el-form-item>
          <el-form-item label="实际参会人员" prop="participant">
            <SelectUser v-model="form.participant"></SelectUser>
          </el-form-item>
          <el-form-item label="讨论内容" prop="meetingContent">
            <el-input v-model="form.meetingContent" type="textarea"></el-input>
          </el-form-item>
          <el-form-item label="会议纪要" prop="meetingSummary">
            <el-input v-model="form.meetingSummary" type="textarea"></el-input>
          </el-form-item>
          <el-form-item label="会议结论" prop="meetingConclusion">
            <el-radio-group v-model="form.meetingConclusion">
              <el-radio :label="1">通过</el-radio>
              <el-radio :label="2">不通过</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="结论批准人" prop="approverId">
            <!-- 
                任务号：无| 优化调整审批人组件 
                开发人员：申豪强 
                时间：2020-04-01
                任务类型：优化代码 
              -->
            <el-input v-model="form.approverId" style="display:none"></el-input>
            <SelectUser
              :id.sync="form.approverId"
              :multiple="false"
              :value="form.approverId ? { id: form.approverId, label: form.approverName } : null"
              :name.sync="form.approverName"
            ></SelectUser>
          </el-form-item>
          <el-form-item prop="sendMeetingNotice">
            <el-checkbox v-model="form.sendMeetingNotice" :true-label="1" :false-label="0"
              >发出会议结论到消息</el-checkbox
            >
          </el-form-item>
          <el-form-item label="关联文件">
            <div class="flex">
              <!-- 多选 -->
              <US class="upload-file" :multiple="true" :isOnlyButton="true" @input="uploadSuccess" />
              <!-- <Upload :isOnlyButton="true" class="upload-file" :multiple="multiple" @input="uploadSuccess"></Upload> -->
              <div>
                <el-button type="primary" @click="selectFiles">从工作区中选择</el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <!-- 存档文件 -->
            <el-table :data="tableData" style="width: 100%" max-height="250" header-align="center">
              <el-table-column type="index" width="50" label="序号"></el-table-column>
              <!-- 
                任务号：2748| 新增预览功能 
                开发人员：申豪强 
                时间：2020-03-31
                任务类型：新增功能 
              -->
              <el-table-column prop="name" label="文件列表" align="center">
                <template slot-scope="{ row }">
                  <el-button type="text" size="small" @click="preview(row)">{{ row.name }}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <el-button type="text" @click="remove(scope.$index, tableData)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </span>
    </el-dialog>
    <SelectFile
      :visible.sync="selectFileDialogVisible"
      :taskUniqueId="form.taskId"
      @change="handleSelectFileChange"
    ></SelectFile>
  </div>
</template>

<script>
import US from '_c/UploadStorage/index'
import SelectFile from './SelectFile'
import api from '@/api/design/meeting'
import indexApi from '@/api/design/index'
import preview from '@/utils/preview'
export default {
  name: 'Conclusion',
  components: {
    SelectFile,
    US
  },
  props: {
    type: {
      type: Number,
      default: 1 //   1 普通会议  2 里程碑会议
    },
    // 会议id
    meetingId: {
      default: ''
    }
  },
  data() {
    return {
      // 这是文件多选标志
      multiple: true,
      selectFileDialogVisible: false,
      tableData: [],
      form: {
        approverIdInfo: {},
        participant: [],
        principal: null,
        files: [{ name: '文件' }]
      },
      visible: false,
      rules: {
        approverId: [{ required: true, message: '审批人必填' }],
        meetingTheme: [{ required: true, message: '必填' }],
        meetingTime: [{ required: true, message: '必填' }],
        address: [{ required: true, message: '必填' }],
        principal: [{ required: true, message: '必填' }],
        participant: [{ required: true, message: '必填' }],
        meetingContent: [{ required: true, message: '必填' }],
        meetingConclusion: [{ required: true, message: '必选' }]
      }
    }
  },
  watch: {
    visible: {
      handler: 'getDetails',
      immediate: true
    }
  },
  methods: {
    /* 
      任务号：2748| 新增预览功能 
      开发人员：申豪强 
      时间：2020-04-01
      任务类型：新增功能 
    */
    // 预览
    async preview(row) {
      preview(row)
    },
    selectFiles() {
      this.selectFileDialogVisible = true
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

      this.tableData.push(...files)
    },
    remove(index, rows) {
      rows.splice(index, 1)
    },
    /*
      bug号：1335 | 支持一次多文件传输 
      开发人员：申豪强 
      时间：2020-04-01
      bug类型：需求bug
    */
    uploadSuccess(e) {
      if (e.length === 0) return
      let list = e.map(item => {
        let obj = {
          name: item.name,
          id: item.id
        }
        return obj
      })
      this.tableData.push(...list)
    },
    show() {
      this.visible = true
    },
    async getDetails() {
      if (!this.visible) return
      let res = await api.getMeetingDetails(this.meetingId)
      this.form = res.data
      if (!res.data.participantId) return

      let participant = []
      let ids = res.data.participantId.split(',')
      let names = res.data.participantName.split(',')
      for (let i = 0; i < res.data.participantId.split(',').length; i++) {
        let item = {
          id: ids[i],
          name: names[i],
          label: names[i]
        }
        participant.push(item)
      }
      this.form.participant = participant
      this.getTable()
    },
    // 获取文件列表
    async getTable() {
      let res = await api.getMeetingFileList({
        meetingId: this.meetingId,
        page: null,
        rows: null
      })
      if (res.data) {
        this.tableData = res.data.map(item => {
          let obj = {
            name: item.fileName,
            id: item.id,
            commonFileId: item.commonFileId
          }
          return obj
        })
      }
    },
    close() {
      this.visible = false
      this.tableData = []
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    async submit() {
      await this.$refs.form.validate()
      let form = _.cloneDeep(this.form)
      if (_.size(form.participant)) {
        form.participantId = form.participant.map(e => e.id).join(',')
        form.participantName = form.participant.map(e => e.name).join(',')
      }
      if (form.principal) {
        form.principalId = form.principal.id
        form.principalName = form.principal.name
      }
      // 批准人
      // if (form.approverIdInfo) {
      //   form.approverId = form.approverIdInfo.id
      //   form.approverName = form.approverIdInfo.name
      // }
      form.type = this.type
      let fileIdList = this.tableData.map(item => item.id)
      form.fileIdList = fileIdList ? fileIdList : []
      this.addConclusion(form)
    },
    async addConclusion(form) {
      let res = await api.addConclusion(form)
      this.close()
      this.$emit('success')
      return this.$message.success('会议结论填写成功')
    }
  }
}
</script>

<style scoped lang="less">
.flex {
  display: flex;
}
.upload-file {
  /deep/ .el-upload {
    width: 120px;
  }
}
.max-height {
  max-height: 400px;
  overflow-y: scroll;
}
.max-width {
  padding: 0 16px 0 0;
}
</style>
