<!--
 * @Description: 动态管理
 * @Author:
 * @Date: 2020-01-19 08:44:28
 -->
<template>
  <div>
    <section>
      <Flow idSelect="Dynamic" :height="350" @taskUniqueIdChange="taskUniqueIdChange" />
    </section>
    <section>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="项目动态" name="first">
          <DynamicTab :taskUniqueId="taskUniqueId" />
        </el-tab-pane>
        <el-tab-pane label="项目大事记" name="second">
          <BreakingNews />
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>
<script>
import Flow from '@/views/design/components/Flow'
import DynamicTab from './tabs/dynamicTab'
import BreakingNews from './tabs/breakingNews'
import api from '@/api/design'
export default {
  name: 'Dynamic',
  components: {
    DynamicTab,
    BreakingNews,
    Flow
  },
  data() {
    return {
      // copy的原始数据，禁止更改
      copy: [],
      activeName: 'first',
      // 回到主线flag：true表示在主线，false表示在单个任务详情
      goBackFlag: true,
      // 节点id
      taskUniqueId: ''
    }
  },
  created() {},
  methods: {
    taskUniqueIdChange(e) {
      this.taskUniqueId = e
    },
    handleClick(e) {}
  }
}
</script>
<style lang="less" scoped></style>
