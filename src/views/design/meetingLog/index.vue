<!--
 * @Description: 会议记录
 * @Author:
 * @Date: 2020-01-10 15:43:35
 -->
<template>
  <div>
    <section>
      <Flow idSelect="MeetingLog" :height="350" @taskUniqueIdChange="taskUniqueIdChange" />
    </section>
    <section>
      <el-tabs v-model="activeName">
        <el-tab-pane label="里程碑会议" name="first">
          <Milestone
            ref="milestone"
            :taskUniqueId="taskUniqueId"
            @showDetais="showDetais"
            @showConclusion="showConclusion"
            @showModification="showModification"
          />
        </el-tab-pane>
        <el-tab-pane label="一般会议" name="second">
          <Ordinary
            ref="ordinary"
            :taskUniqueId="taskUniqueId"
            @showDetais="showDetais"
            @showConclusion="showConclusion"
            @showModification="showModification"
          />
        </el-tab-pane>
      </el-tabs>
    </section>
    <!-- 会议详情 -->
    <Details ref="details" :type="type" :meetingId="meetingId" />
    <!-- 会议结论 -->
    <Conclusion
      ref="conclusion"
      :taskUniqueId="taskUniqueId"
      :type="type"
      :meetingId="meetingId"
      @success="changeSuccess"
    />
    <!-- 修改会议通知 -->
    <Modification ref="modification" :type="type" :meetingId="meetingId" @success="changeSuccess" />
  </div>
</template>

<script>
import Conclusion from './components/conclusion'
import Modification from './components/modification'
import Details from './components/details'
import Flow from '@/views/design/components/Flow'
import Milestone from './milestone'
import Ordinary from './ordinary'
export default {
  name: 'MeetingLog',
  components: {
    Milestone,
    Ordinary,
    Flow,
    Details,
    Conclusion,
    Modification
  },
  data() {
    return {
      activeName: 'first',
      type: null,
      // 会议id
      meetingId: '',
      // 里程碑id
      taskUniqueId: ''
    }
  },
  methods: {
    changeSuccess() {
      this.$refs.milestone.getList()
      this.$refs.ordinary.getList()
    },
    // 里程碑任务更改
    taskUniqueIdChange(e) {
      this.taskUniqueId = e
      this.$refs.milestone.getList()
      this.$refs.ordinary.getList()
    },
    showDetais(type, id) {
      this.type = type
      this.meetingId = id
      this.$refs.details.show()
    },
    // 展示会议结论
    showConclusion(type, id) {
      this.type = type
      this.meetingId = id
      this.$refs.conclusion.show()
    },
    // 展示会议通知
    showModification(type, id) {
      this.type = type
      this.meetingId = id
      this.$refs.modification.show()
    }
  }
}
</script>

<style lang="less" scoped></style>
