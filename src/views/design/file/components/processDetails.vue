<!--
 * @Description: 流程详情
 * @Version:
 * @Autor:
 * @Date: 2020-03-11 10:23:20
 * @LastEditTime: 2020-03-11 10:28:47
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
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    width="900px"
    title="审核进度"
    :visible="visible"
    @open="refresh"
    @close="close"
  >
    <ul class="description">
      <li>
        <label>审批状态</label>
        <Status :options="auditStatus" :value="detail.auditStatus"></Status>
      </li>
      <li>
        <label>审批类型</label>
        <span>{{ _.get(_.find(auditType, { value: detail.auditType }), 'label', '未知') }}</span>
      </li>
      <li>
        <label>审批事项</label>
        <span>{{ detail.processInstanceName }}</span>
      </li>
      <li>
        <label>简述</label>
        <span>{{ detail.processInstanceDesp }}</span>
      </li>
      <li>
        <label>发起人</label>
        <span>{{ detail.creatorName }}</span>
      </li>
      <li>
        <label>发起时间</label>
        <span>{{ detail.createTime }}</span>
      </li>
    </ul>

    <vxe-grid border :data="detail.stages" :span-method="colspanMethod">
      <vxe-table-column width="60px" title="序号" field="stageSeq"></vxe-table-column>
      <vxe-table-column width="120px" title="阶段名" field="stageName"></vxe-table-column>
      <vxe-table-column width="80px" title="审批人" field="auditorName"></vxe-table-column>
      <vxe-table-column width="80px" title="审批结果" field="auditResult">
        <Status slot-scope="{ row }" :options="auditResult" :value="row.auditResult"></Status>
      </vxe-table-column>
      <vxe-table-column title="审批意见" field="auditOpinion"></vxe-table-column>
      <vxe-table-column width="120px" title="抄送">
        <template v-slot>
          <ul>
            <li v-for="e in detail.carbonList" :key="e.userId" style="margin-left: 0;">{{ e.name }}</li>
          </ul>
        </template>
      </vxe-table-column>
    </vxe-grid>
  </el-dialog>
</template>

<script>
import auditResult from '@/views/design/approval/lib/auditResult'
import auditStatus from '@/views/design/approval/lib/auditStatus'
import auditType from '@/views/design/approval/lib/auditType'
export default {
  name: 'History',
  props: {
    visible: {
      default: false,
      type: Boolean
    },
    audit: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      detail: {},
      auditResult,
      auditStatus,
      auditType
    }
  },
  methods: {
    refresh() {
      console.log('执行')
      this.axios.design.post('process/instance/detail/' + this.audit.id).then(res => {
        res.data.stages = _.flatten(
          res.data.stages.map(e => {
            e.auditorRecords.forEach((f, index) => {
              f.groupLength = e.auditorRecords.length
              f.hidden = !!index
            })
            return e.auditorRecords
          })
        )
        this.detail = res.data
      })
    },
    close() {
      this.$emit('update:visible', false)
      this.detail = {}
    },
    colspanMethod({ row, rowIndex, column, columnIndex, data }) {
      if ([0, 1].includes(columnIndex)) {
        if (row.hidden) {
          return {
            rowspan: 0,
            colspan: 0
          }
        } else {
          return {
            rowspan: row.groupLength,
            colspan: 1
          }
        }
      }

      if (columnIndex === 5) {
        if (rowIndex === 0) {
          return {
            rowspan: data.length,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }

      return {
        rowspan: 1,
        colspan: 1
      }
    }
  }
}
</script>

<style scoped lang="less">
.description {
  margin-bottom: 10px;
  li {
    > * {
      display: inline-block;
      vertical-align: middle;
    }
    label:first-child {
      width: 70px;
      text-align: left;
      margin: 8px;
      &:after {
        content: '：';
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
}
</style>
