<!--
 * @Description: 修改会议通知
 * @Author:
 * @Date: 2020-01-17 16:27:45
 -->
<!--/**
任务名称：2868/添加3月注释
开发人员：李建敏
日期：2020-3月-4日
任务类型：2、复制修改代码 （20行）
**/-->
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
<!--
  任务名称：1174 || 发起会议选择阶段
  开发人员：申豪强
  日期：2020-03-18
  BUG类型：测试人员提出的系统性BUG
-->
<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    :visible="visible"
    width="740px"
    :title="type === 1 ? '一般会议' : '里程碑会议'"
    @close="close"
    @opened="opened"
  >
    <div class="max-height padding-width">
      <el-form ref="form" :rules="rules" :model="form" label-width="140px">
        <el-form-item label="会议主题" prop="meetingTheme">
          <el-input v-model="form.meetingTheme"></el-input>
        </el-form-item>
        <el-form-item label="阶段" prop="taskId">
          <el-input v-model="form.taskId" style="display:none"></el-input>
          <Stage
            ref="stage"
            :targetTaskUniqueId.sync="form.taskId"
            :value="form.taskId ? { id: form.taskId, label: form.taskName } : null"
            :multiple="false"
            :taskName.sync="form.taskName"
          />
        </el-form-item>
        <el-form-item label="会议地点" prop="address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <!--
        任务名称：1159 || 设计模块-会议记录-修改通知-修改会议时间-保存报错
        开发人员：申豪强
        日期：2020-03-27
        BUG类型：测试人员提出的系统性BUG
       -->
        <el-form-item label="会议开始时间" prop="meetingTime">
          <el-date-picker
            v-model="form.meetingTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="负责人" prop="principalId">
          <el-input v-model="form.principalId" style="display:none"></el-input>
          <SelectUser
            :id.sync="form.principalId"
            :value="form.principalId ? { id: form.principalId, label: form.principalName } : null"
            :name.sync="form.principalName"
            :multiple="false"
          />
          <!-- <SelectUser v-model="form.principal" :multiple="false"></SelectUser> -->
        </el-form-item>
        <el-form-item label="参会人员" prop="participant">
          <SelectUser v-model="form.participant"></SelectUser>
        </el-form-item>
        <el-form-item label="讨论内容" prop="meetingContent">
          <el-input v-model="form.meetingContent" type="textarea"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox>发出会议通知到每个参会人</el-checkbox>
        </el-form-item>
        <el-form-item label="关联文件">
          <el-button type="primary" @click="selectJudge">从工作区中选择</el-button>
          <SelectFile
            :visible.sync="selectFileDialogVisible"
            :taskUniqueId="form.taskId"
            @change="handleSelectFileChange"
          ></SelectFile>
        </el-form-item>
        <el-form-item>
          <!-- 存档文件 -->
          <el-table :data="tableData" style="width: 100%" max-height="250" header-align="center">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
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
</template>

<script>
import api from '@/api/design/meeting'
import Stage from './Stage'
import SelectFile from './SelectFile'
import preview from '@/utils/preview'
export default {
  name: 'Modification',
  components: {
    Stage,
    SelectFile
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
      files: [],
      selectFileDialogVisible: false,
      tableData: [],
      formData: {
        // 备份标记
        // backupFlag:1
        meetingId: ''
      },
      form: {
        participant: [],
        files: [{ name: '文件' }]
      },
      visible: false,
      rules: {
        taskId: [{ required: true, message: '必填' }],
        meetingTheme: [{ required: true, message: '必填' }],
        meetingTime: [{ required: true, message: '必填' }],
        address: [{ required: true, message: '必填' }],
        principalId: [{ required: true, message: '必填' }],
        participant: [{ required: true, message: '必填' }],
        meetingContent: [{ required: true, message: '必填' }]
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
     * @任务编号: 2748 | 普通文件的在线预览
     * @开发人员:申豪强
     * @日期:2020-04-01
     * @代码类型：新功能
     */
    preview(row) {
      preview(row)
    },
    opened() {
      // this.$refs.stage.refresh()
    },
    selectJudge() {
      if (!this.form.taskId) return this.$message.error('请选择阶段')
      this.selectFileDialogVisible = true
    },
    /*
      bug号：1348 | 文件没出来
      开发人员：申豪强
      时间：2020-03-31
      任务类型：tableData变量问题
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
    async getDetails() {
      if (!this.visible) return
      this.formData.meetingId = this.meetingId
      let res = await api.getMeetingDetails(this.meetingId)
      this.form = res.data
      // 参会人员
      if (res.data.participantId && res.data.participantName) {
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
      }
      this.getTable()
    },
    show() {
      this.visible = true
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
      let fileIdList = this.tableData.map(item => item.id)
      form.fileIdList = fileIdList ? fileIdList : []
      this.addModification(form)
    },
    async addModification(form) {
      let res = await api.meetingUpdate(form)
      this.close()
      this.$emit('success')
      return this.$message.success('修改会议通知成功')
    }
  }
}
</script>

<style scoped lang="less">
.max-height {
  max-height: 400px;
  overflow-y: scroll;
}
.padding-width {
  padding: 0 16px 0 0;
}
</style>
