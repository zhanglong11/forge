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
日期：2020-3月-3日
任务类型：1、全新代码
**/-->
<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    title="详情"
    width="500px"
    destroy-on-close
    :visible="visible"
    @close="$emit('update:visible', false)"
  >
    <div v-if="!_.isEmpty(form)">
      <ul>
        <li>
          <h6>任务名称</h6>
          <p>{{ form.name }}</p>
        </li>
        <li>
          <h6>任务类型</h6>
          <p>{{ ['一般任务', '里程碑'][form.type - 1] }}</p>
        </li>
        <li>
          <h6>父级</h6>
          <p>{{ getTaskName(form.parentTaskUniqueId) }}</p>
        </li>
        <li>
          <h6>任务编号</h6>
          <p>{{ form.wbsCode }}</p>
        </li>
        <li>
          <h6>前置任务</h6>
          <p>{{ getTaskName(form.preTaskId) }}</p>
        </li>
        <li>
          <h6>计划开始时间</h6>
          <p>{{ form.planStartTime | ymd }}</p>
        </li>
        <li>
          <h6>计划结束时间</h6>
          <p>{{ form.planEndTime | ymd }}</p>
        </li>
        <li>
          <h6>工期</h6>
          <p>{{ form.planDuration }}</p>
        </li>
        <li>
          <h6>人力资源</h6>
          <p>{{ form.resourceList && form.resourceList.map(e => e.userName).join('，') }}</p>
        </li>
        <li>
          <h6>实际开始时间</h6>
          <p>{{ form.actualStartTime | ymd }}</p>
        </li>
        <li>
          <h6>实际结束时间</h6>
          <p>{{ form.actualEndTime | ymd }}</p>
        </li>
        <li>
          <h6>实际工期</h6>
          <p>{{ form.realityDuration }}</p>
        </li>
        <li>
          <h6>当前进度</h6>
          <p>{{ form.actualProgress }}</p>
        </li>
        <li>
          <h6>活动状态</h6>
          <p>{{ ['未开始', '进行中', '已结束'][form.status] }}</p>
        </li>
      </ul>
    </div>
    <footer slot="footer"><el-button @click="$emit('update:visible', false)">我知道了</el-button></footer>
  </el-dialog>
</template>

<script>
import treeFind from '@/utils/treeFind'
export default {
  name: 'Detail',
  filters: {
    ymd(val) {
      return val ? moment(val).format('YYYY-MM-DD') : '未设置'
    }
  },
  props: ['form', 'visible', 'list'],
  methods: {
    getTaskName(val) {
      if (val) {
        return val
          .toString()
          .split(',')
          .map(id => {
            const target = treeFind(this.list, e => e.taskUniqueId.toString() === id)
            if (target) {
              return ['一般任务', '里程碑'][target.type - 1] + target.wbsCode
            }
          })
          .join('，')
      }
    }
  }
}
</script>

<style lang="less" scoped>
ul {
  li {
    padding: 5px 0;
    h6,
    p {
      font-size: 15px;
      display: inline-block;
      vertical-align: middle;
    }
    h6 {
      width: 130px;
    }
  }
}
</style>
