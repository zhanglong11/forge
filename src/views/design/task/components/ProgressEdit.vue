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
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    width="700px"
    :title="`编辑进度(${task.name})`"
    :visible="visible"
    @close="close"
  >
    <div id="process-edit">
      <el-form ref="form" label-positon="left" label-width="120px" :model="form" :rules="rules">
        <el-form-item label="实际开始时间" prop="actualStartTime">
          <el-date-picker v-model="form.actualStartTime" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="实际结束时间" prop="actualEndTime">
          <el-date-picker v-model="form.actualEndTime" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="实际工期" prop="realityDuration">
          <input-number v-model="form.realityDuration" unit="天" style="width: 150px;"> </input-number>
        </el-form-item>
        <el-form-item label="当前进度" prop="actualProgress">
          <input-number v-model="form.actualProgress" unit="%" style="width: 150px;"> </input-number>
        </el-form-item>
        <el-form-item v-if="task.type === 1" label="活动状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">未开始</el-radio>
            <el-radio :label="1">进行中</el-radio>
            <el-radio :label="2">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">{{ task.taskUniqueId ? '保存' : '创建' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ProgressEdit',
  props: {
    visible: Boolean,
    task: Object
  },
  data() {
    return {
      form: {
        actualProgress: 0,
        status: 0,
        realityDuration: null,
        actualStartTime: null,
        actualEndTime: null
      },
      rules: {
        actualProgress: [
          { required: true, message: '必填' },
          {
            validator(rule, val, callback) {
              if (val > 100) {
                callback(new Error('非法'))
              }
              callback()
            },
            message: '非法'
          }
        ],
        status: [{ required: true, message: '必填' }],
        realityDuration: [{ required: true, message: '必填' }],
        actualStartTime: [{ required: true, message: '必填' }],
        actualEndTime: [
          { required: true, message: '必填' },
          {
            validator: (rule, val, callback) => {
              if (moment(val).isBefore(this.form.actualStartTime)) {
                callback(new Error('结束时间必须大于开始时间'))
              }
              callback()
            }
          }
        ]
      }
    }
  },
  computed: {},
  watch: {
    task(val) {
      this.form = Object.assign(
        {},
        this.form,
        _.pick(val, ['actualProgress', 'status', 'realityDuration', 'actualStartTime', 'actualEndTime', 'id'])
      )
    },
    'form.actualEndTime'(val) {
      if (val && this.form.actualStartTime) {
        this.form.realityDuration = moment(val).diff(this.form.actualStartTime, 'days') + 1
      }
    }
  },
  methods: {
    /**
     任务名称：2868/修改bug
     开发人员：李建敏
     日期：2020-3月-2日
     任务类型：2、复制修改代码 （5行）
     **/
    async submit() {
      await this.$refs.form.validate()
      let form = _.cloneDeep(this.form)
      form.actualStartTime = moment(form.actualStartTime).format('YYYY-MM-DD 00:00:00')
      form.actualEndTime = moment(form.actualEndTime).format('YYYY-MM-DD 23:59:59')
      await this.axios.schedule.post('schedule/task/updateOnWay/', form)
      this.$message.success('编辑成功')
      this.$emit('update:visible', false)
      this.$parent.refresh()
    },
    async close() {
      await this.$nextTick()
      this.$refs.form.resetFields()
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped lang="less">
.el-table {
  overflow: visible;
  /deep/ .cell {
    overflow: visible;
  }
  /deep/ .el-table__body-wrapper {
    overflow: visible;
  }
}
</style>
