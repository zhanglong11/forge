<template>
  <div>
    <el-form style="margin-top: 15px;" inline>
      <el-form-item label="参考基准" label-width="70px">
        <el-select v-model="activeBaseLine">
          <el-option :value="null" label="无"></el-option>
          <el-option v-for="e in baseLineList" :key="e.id" :value="e.id" :label="e.planName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="视图" class="fr" label-width="40px" style="margin-right: 0;">
        <el-radio-group v-model="viewMode" size="mini">
          <el-radio-button :label="1">月</el-radio-button>
          <el-radio-button :label="2">周</el-radio-button>
          <el-radio-button :label="3">日</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div ref="gantt" style="height: 600px;margin-top: 0px;"></div>
  </div>
</template>

<script>
import '@/assets/js/dhtmlxgantt'
import 'dhtmlx-gantt/codebase/locale/locale_cn.js'
export default {
  name: 'Gantt',
  props: {
    tasks: {
      type: Array,
      required: true,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      gantt: null,
      baseLineList: [],
      activeBaseLine: null,
      activeBaseLineTaskList: [],
      layerId: null,
      viewMode: 3
    }
  },
  watch: {
    tasks() {
      if (!this.gantt) {
        this.setupGanttChart()
      }
      this.updateTasks()
    },
    async activeBaseLine(id) {
      if (id) {
        await this.axios.schedule.get('schedule/plan/taskList/' + id).then(res => {
          this.activeBaseLineTaskList = res.data
        })
      }
      this.render()
    },
    viewMode() {
      this.setScale()
    }
  },
  created() {
    this.axios.design.get('schedule/plan/listBase/' + localStorage.getItem('projectId')).then(res => {
      this.baseLineList = res.data
    })
  },
  methods: {
    setupGanttChart() {
      gantt.config.scale_height = 50
      gantt.config.task_height = 16
      gantt.config.row_height = 40
      gantt.config.min_column_width = 40
      gantt.config.show_grid = false
      gantt.config.show_task_cells = false
      gantt.config.readonly = true
      gantt.config.columns = []
      gantt.init(this.$refs.gantt)
      this.setScale()
      this.render()
      gantt.attachEvent('onTaskDblClick', id => {
        return false
      })
      gantt.attachEvent('onTaskClick', id => {
        this.$emit('taskClick', id)
      })
    },
    render() {
      if (this.layerId) {
        gantt.removeTaskLayer(this.layerId)
      }
      this.layerId = gantt.addTaskLayer(task => {
        if (!this.activeBaseLine) {
          if (task.actual_start && task.actual_end) {
            let sizes = gantt.getTaskPosition(task, task.actual_start, task.actual_end)
            let el = document.createElement('div')
            el.className = 'baseline'
            el.style.left = sizes.left + 'px'
            el.style.width = sizes.width + 'px'
            el.style.top = sizes.top + gantt.config.task_height + 13 + 'px'
            el.style.height = 14 + 'px'
            el.innerHTML = `
<div class="gantt_task_content" style="line-height: 14px;">
<span style="z-index:11;color:#fff;font-weight: bold;">实际</span>
<span style="display: block;
position: absolute;
height: 100%;
width: ${task.progress}%;
background-color: #fe8c00;
top: 0;
z-index:10">
<span style="position: absolute;left: 100%;margin-left: 5px;">${task.progress}%</span>
</span>
</div>`
            el.style.pointerEvents = 'none'
            return el
          }
        } else {
          const baseLineTask = _.find(this.activeBaseLineTaskList, { taskUniqueId: +task.id })
          if (baseLineTask) {
            let sizes = gantt.getTaskPosition(
              task,
              moment(baseLineTask.planStartTime).toDate(),
              moment(baseLineTask.planEndTime).toDate()
            )
            console.log(sizes)
            let el = document.createElement('div')
            el.className = 'baseline'
            el.style.left = sizes.left + 'px'
            el.style.width = sizes.width + 'px'
            el.style.top = sizes.top + gantt.config.task_height + 13 + 'px'
            el.style.height = 14 + 'px'
            el.innerHTML = `<div class="gantt_task_content" style="line-height: 14px;">基准</div>`
            el.style.pointerEvents = 'none'
            return el
          }
        }

        return false
      })
      gantt.render()
    },
    updateTasks() {
      gantt.clearAll()
      let links = []
      this.tasks.forEach(e => {
        e.dependencies.forEach(f => {
          links.push({ id: _.uniqueId(), source: f, target: e.id, type: '1' })
        })
      })
      gantt.parse({
        data: this.tasks,
        links
      })
    },
    setScale() {
      gantt.config.scales = [
        [{ unit: 'month', step: 1, format: '%Y年%M' }],
        [{ unit: 'week', step: 1, format: '%Y年%M%d日', width: 200 }],
        [
          { unit: 'week', step: 1, format: '%F, %Y' },
          { unit: 'day', step: 1, format: '%j, %D' }
        ]
      ][this.viewMode - 1]
      gantt.config.min_column_width = [60, 100, 40][this.viewMode - 1]
      gantt.render()
    }
  }
}
</script>

<style lang="less">
@import '~dhtmlx-gantt/codebase/dhtmlxgantt.css';
.baseline {
  position: absolute;
  border-radius: 2px;
  opacity: 0.6;
  margin-top: -7px;
  height: 12px;
  background: #ffd180;
  border: 1px solid rgb(255, 153, 0);
}
.gantt_task_line,
.gantt_line_wrapper {
  margin-top: -9px;
}

.gantt_side_content {
  margin-bottom: 7px;
}

.gantt_task_link .gantt_link_arrow {
  margin-top: -10px;
}

.gantt_side_content.gantt_right {
  bottom: 0;
}
</style>
