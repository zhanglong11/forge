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
任务名称：2868/修改bug
开发人员：李建敏
日期：2020-3月-2日
任务类型：2、复制修改代码 （30行）
**/-->
<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    width="700px"
    :title="
      (task.taskUniqueId ? (!canEdit && projectStart ? '' : '编辑') : '新建') + (form.type === 1 ? '任务' : '里程碑')
    "
    :visible="visible"
    @opened="refresh"
    @close="close"
  >
    <div id="process-edit">
      <el-form
        ref="form"
        :disabled="!canEdit && projectStart"
        label-positon="left"
        label-width="120px"
        :model="form"
        :rules="rules"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="2">里程碑任务</el-radio>
            <el-radio :label="1">一般任务</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级" prop="parentTaskUniqueId">
          <SelectTask
            v-model="form.parentTaskUniqueId"
            :options="taskList"
            :disableKeys="[form.taskUniqueId]"
          ></SelectTask>
        </el-form-item>
        <el-form-item label="任务编号" prop="wbsCode">
          <el-input v-model="form.wbsCode" style="width: 120px;" disabled></el-input>
        </el-form-item>
        <el-form-item label="前置任务" prop="preTaskId">
          <SelectTask v-model="form.preTaskId" multiple style="width: 100%;" :options="computedTaskList"></SelectTask>
        </el-form-item>
        <el-form-item label="计划开始时间" prop="planStartTime">
          <el-date-picker v-model="form.planStartTime" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="计划结束时间" prop="planEndTime">
          <el-date-picker v-model="form.planEndTime" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </el-form-item>
        <el-form-item label="工期" prop="planDuration">
          <el-input v-model="form.planDuration" style="width: 150px;">
            <template slot="append">天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="人力资源" prop="resourceList">
          <SelectUser v-model="form.resourceList" style="width: 100%;"></SelectUser>
        </el-form-item>
      </el-form>
    </div>
    <span v-if="canEdit || !projectStart" slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">{{ task.taskUniqueId ? '保存' : '创建' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import toFlat from '@/utils/toFlat'
import SelectTask from './SelectTask'
import treeFind from '@/utils/treeFind'
export default {
  name: 'Edit',
  components: { SelectTask },
  props: {
    visible: Boolean,
    task: Object,
    taskList: Array,
    originList: Array, // flat
    parent: Object,
    projectStart: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      form: {
        name: '',
        type: null, // 1 一般任务  2 里程碑
        preTaskId: [],
        status: 0,
        wbsCode: '',
        parentTaskUniqueId: null,
        resourceList: [],
        planDuration: null,
        planStartTime: null,
        planEndTime: null
      },
      rules: {
        type: [{ required: true, message: '必填' }],
        name: [{ required: true, message: '必填' }],
        parentTaskUniqueId: [{ required: false, message: '必填' }],
        planDuration: [{ required: true, message: '必填' }],
        preTaskId: [
          {
            required: false,
            message: '必填'
          }
        ],
        planStartTime: [
          { required: true, message: '必填' },
          {
            validator: (rule, val, callback) => {
              if (val) {
                if (!this.form.parentTaskUniqueId) {
                  for (let task of this.taskList) {
                    if (
                      task.taskUniqueId !== this.form.taskUniqueId &&
                      moment(val).isSameOrBefore(task.planEndTime) &&
                      moment(val).isSameOrAfter(task.planStartTime)
                    ) {
                      callback(
                        new Error(
                          `与任务${task.name}（ ${moment(task.planStartTime).format('YYYY-MM-DD')} - ${moment(
                            task.planEndTime
                          ).format('YYYY-MM-DD')} ）时间有重叠`
                        )
                      )
                    }
                  }
                } else {
                  let parent = _.find(this.originList, { taskUniqueId: this.form.parentTaskUniqueId })
                  if (parent) {
                    if (moment(val).isBefore(parent.planStartTime) || moment(val).isAfter(parent.planEndTime)) {
                      callback(
                        new Error(
                          `时间必须在父任务范围之内 ( ${moment(parent.planStartTime).format('YYYY-MM-DD')} - ${moment(
                            parent.planEndTime
                          ).format('YYYY-MM-DD')} )`
                        )
                      )
                    }
                  }
                }
              }
              callback()
            }
          }
        ],
        planEndTime: [
          { required: true, message: '必填' },
          {
            validator: (rule, val, callback) => {
              if (moment(val).isSameOrBefore(this.form.planStartTime)) {
                callback(new Error('结束时间必须大于开始时间'))
              }
              if (!this.form.parentTaskUniqueId) {
                for (let task of this.taskList) {
                  if (
                    task.taskUniqueId !== this.form.taskUniqueId &&
                    moment(val).isSameOrBefore(task.planEndTime) &&
                    moment(val).isSameOrAfter(task.planStartTime)
                  ) {
                    callback(
                      new Error(
                        `与任务${task.name}（ ${moment(task.planStartTime).format('YYYY-MM-DD')} - ${moment(
                          task.planEndTime
                        ).format('YYYY-MM-DD')} ）时间有重叠`
                      )
                    )
                  }
                }
              } else {
                let parent = _.find(this.originList, { taskUniqueId: this.form.parentTaskUniqueId })
                if (parent) {
                  if (moment(val).isBefore(parent.planStartTime) || moment(val).isAfter(parent.planEndTime)) {
                    callback(
                      new Error(
                        `时间必须在父任务范围之内 ( ${moment(parent.planStartTime).format('YYYY-MM-DD')} - ${moment(
                          parent.planEndTime
                        ).format('YYYY-MM-DD')} )`
                      )
                    )
                  }
                }
              }
              callback()
            }
          }
        ]
      }
    }
  },
  computed: {
    treeData() {
      return this.$store.state.design.processGroupListTree
    },
    computedTaskList() {
      if (!this.form.parentTaskUniqueId) {
        return this.taskList.map(e => _.omit(e, 'children')).filter(e => e.taskUniqueId !== this.form.taskUniqueId)
      } else {
        let parent = treeFind(this.taskList, e => e.taskUniqueId === this.form.parentTaskUniqueId)
        parent = _.cloneDeep(parent)
        _.forEach(parent.children, e => delete e.children)
        if (_.size(parent.children)) {
          parent.children = parent.children.filter(e => e.taskUniqueId !== this.form.taskUniqueId)
          if (parent.children.length === 0) delete parent.children
        }
        return [parent]
      }
    }
  },
  watch: {
    'form.parentTaskUniqueId'(val) {
      if (!this.visible) return false
      this.calculateWbsCode()
      if (!this.form.taskUniqueId) {
        const parent = _.find(this.originList, { taskUniqueId: val })
        const children = _.filter(this.originList, { parentTaskUniqueId: val })
        const prev = parent ? _.last(children) : _.last(this.taskList)
        if (prev) {
          this.form.planStartTime = moment(prev.planEndTime)
            .add(1, 'days')
            .format('YYYY-MM-DD 00:00:00')
          this.form.planEndTime = moment(prev.planEndTime)
            .add(1, 'days')
            .format('YYYY-MM-DD 23:59:59')
        } else if (parent) {
          this.form.planStartTime = moment(parent.planStartTime).format('YYYY-MM-DD 00:00:00')
          this.form.planEndTime = moment(parent.planStartTime).format('YYYY-MM-DD 23:59:59')
        }
      }
    },
    'form.type'(val) {
      this.rules.parentTaskUniqueId[0].required = val === 1
    },
    'form.wbsCode'(val) {
      this.rules.preTaskId[0].required = val.toString() !== '1' && this.originList.length
    },
    'form.planStartTime'(val) {
      if (val && !this.form.planEndTime) {
        this.form.planEndTime = moment(val).format('YYYY-MM-DD 23:59:59')
      }
    },
    'form.planEndTime'(val) {
      if (val && this.form.planStartTime) {
        this.form.planDuration = moment(val).diff(this.form.planStartTime, 'days') + 1
      }
    }
  },
  methods: {
    calculateWbsCode() {
      let parent = treeFind(this.taskList, e => e.taskUniqueId === this.form.parentTaskUniqueId)
      let baseList = parent ? parent.children || [] : this.taskList
      let current = _.pick(this.form, ['planStartTime'])
      if (!current.planStartTime) current.planStartTime = '9999'
      const index =
        _.sortedIndexBy(
          baseList.filter(e => e.taskUniqueId !== this.form.taskUniqueId),
          current,
          e => e.planStartTime
        ) + 1
      if (parent) {
        this.form.wbsCode = parent.wbsCode + '.' + index
      } else {
        this.form.wbsCode = index
      }
    },
    refresh() {
      if (!this.task.taskUniqueId) {
        if (_.size(this.taskList)) {
          this.form.planStartTime = moment(_.last(this.taskList).planEndTime)
            .add(1, 'days')
            .format('YYYY-MM-DD 00:00:00')
        }
        this.calculateWbsCode()
        return false
      }
      let form = _.cloneDeep(this.task)
      if (form.preTaskId && form.preTaskId !== '0') form.preTaskId = form.preTaskId.split(',').map(e => +e)
      else form.preTaskId = []
      if (!form.parentTaskUniqueId) form.parentTaskUniqueId = null
      if (_.size(form.resourceList)) form.resourceList = form.resourceList.map(e => ({ id: e.userId }))
      this.form = form
    },
    async submit() {
      await this.$refs.form.validate()
      let form = _.cloneDeep(this.form)
      delete form.children
      Object.assign(form, {
        projectId: localStorage.getItem('projectId'),
        projectName: localStorage.getItem('projectName')
      })
      if (_.size(form.preTaskId)) {
        form.preTaskCodes = form.preTaskId.map(id => _.find(this.originList, { taskUniqueId: id }).name).join(',')
        form.preTaskId = form.preTaskId.join(',')
      } else {
        form.preTaskId = 0
      }
      if (!form.parentTaskUniqueId) form.parentTaskUniqueId = 0
      form.planStartTime = moment(form.planStartTime).format('YYYY-MM-DD 00:00:00')
      form.planEndTime = moment(form.planEndTime).format('YYYY-MM-DD 23:59:59')
      if (form.resourceList)
        form.resourceList = form.resourceList.map(e => ({
          organId: e.organId,
          userId: e.id,
          userName: e.name
        }))
      if (this.projectStart) {
        if (!form.taskUniqueId) {
          form.taskUniqueId = _.max(this.originList.map(e => e.taskUniqueId)) + 1 || 1
        }
        if (this.task.taskUniqueId) {
          Object.assign(_.find(this.$parent.list, { taskUniqueId: this.task.taskUniqueId }), form)
          this.$parent.list = this.$parent.list.slice()
        } else {
          this.$parent.list.push(form)
        }
        this.$emit('update:visible', false)
      } else {
        await this.axios.schedule.post('schedule/task/' + (this.task.id ? 'update' : 'add'), form)
        this.$message.success(this.task.taskUniqueId ? '保存成功' : '创建成功')
        this.$emit('update:visible', false)
        this.$parent.refresh()
      }
    },
    async close() {
      await this.$nextTick()
      this.$refs.form.resetFields()
      this.form.taskUniqueId = null
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
