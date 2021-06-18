<!--
 * @Description: 阶段
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-03-17 17:51:38
 * @LastEditTime: 2020-03-18 18:03:17
 -->
<!--
  任务名称：1174 || 发起会议选择阶段更改
  开发人员：申豪强
  日期：2020-03-16
  BUG类型：测试人员提出的系统性BUG
-->
<template>
  <div>
    <TreeSelect
      :value="value"
      :options="treeData"
      :multiple="multiple"
      :valueFormat="valueFormat"
      loading-text="加载中..."
      no-options-text="没有选项..."
      no-results-text="没有匹配的选项..."
      :disabled="disabled"
      placeholder="请选择"
      disable-branch-nodes
      @input="input"
    />
  </div>
</template>

<script>
export default {
  props: {
    // 用于赋值操作
    value: [String, Number, Array, Object],
    //  是否多选
    multiple: {},
    // 过滤
    valueFormat: {
      type: String,
      default: 'object',
      enum: ['id', 'object']
    },
    // 是否禁选
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      treeData: []
    }
  },
  mounted() {
    this.refresh()
  },
  methods: {
    /*
     *任务名称：1174 || 发起会议新增阶段
     *开发人员：申豪强
     *日期：2020-03-16
     *BUG类型：测试人员提出的系统性BUG
     */
    input(val) {
      console.log(val)
      this.$emit('input', val)
      this.$emit('update:taskName', val && val.label)
      this.$emit('update:targetTaskUniqueId', val && val.id)
    },
    handleNodeClick(e) {
      console.log(e)
    },
    toTree(data) {
      let result = []
      if (!Array.isArray(data)) {
        return result
      }
      let map = {}
      data.forEach(item => {
        map[item.taskUniqueId] = item
      })
      data.forEach(item => {
        let parent = map[item.parentTaskUniqueId]
        if (parent) {
          ;(parent.children || (parent.children = [])).push(item)
        } else {
          result.push(item)
        }
      })
      return result
    },
    async refresh() {
      let res = await this.axios.schedule.get('schedule/task/treeList/' + localStorage.getItem('projectId'))
      // 这是总list
      let list = res.data || []

      this.treeData = list
        .filter(item => item.type === 2)
        .map(item => {
          item.id = item.taskUniqueId.toString()
          item.label = item.name
          return item
        })
      console.log(this.treeData)
    }
  }
}
</script>

<style lang="less" scoped></style>
