<!--
 * @Description: 审批状态
 * @Author:
 * @Date: 2020-01-20 17:22:47
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
      title="审核进度"
      :visible.sync="flowFlag"
      width="60%"
      @close="flowClose"
    >
      <div class="content-body">
        <template>
          <el-table :data="flowData" style="width: 100%" max-height="250" header-align="center">
            <el-table-column prop="processInstanceName" label="流程" align="center">
              <template slot-scope="{ row }">
                <div>{{ row.processInstanceName.split('_')[0] }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="auditorName" label="审批人" align="center">
              <!-- <template slot-scope="scope">
                <span v-for="item in scope.row.auditorList" :key="item.userId">{{ item.name }}</span>
              </template> -->
            </el-table-column>
            <!-- <el-table-column prop="processInstanceDesp" label="审批意见" align="center"> </el-table-column> -->
            <el-table-column prop="auditStatus" label="审批结果" align="center">
              <template slot-scope="{ row }">
                {{
                  _.get(
                    auditStatus.find(item => item.value === row.auditStatus),
                    'label',
                    '-'
                  )
                }}
              </template>
            </el-table-column>
            <el-table-column prop="auditStatus" label="操作" align="center">
              <template slot-scope="{ row }">
                <el-button type="text" @click="watch(row)">流程记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </el-dialog>
    <Progress ref="progress" :visible.sync="historyFlag" :audit="historyObj" />
  </div>
</template>
<script>
import Progress from './processDetails'
import auditStatus from '@/views/design/approval/lib/auditStatus'
export default {
  components: {
    Progress
  },
  props: {},
  data() {
    return {
      historyFlag: false,
      historyObj: {},
      flowFlag: false,
      flowData: [],
      auditStatus: auditStatus
    }
  },
  methods: {
    watch(row) {
      this.historyFlag = true
      this.historyObj = row
    },
    flowClose() {},
    show(data) {
      this.flowFlag = true
      this.flowData = data
    }
  }
}
</script>
<style lang="less" scoped>
.content-body {
  max-height: 400px;
}
</style>
