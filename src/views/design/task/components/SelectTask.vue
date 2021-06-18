<!--/**
任务名称：2868/添加3月注释
开发人员：李建敏
日期：2020-3月-12日
任务类型：2、复制修改代码 （10行）
**/-->
<template>
  <TreeSelect
    :value="value"
    :options="computedOptions"
    label="name"
    flat
    :multiple="multiple"
    loading-text="加载中..."
    no-options-text="没有选项..."
    no-results-text="没有匹配的选项..."
    :disabled="disabled || (elForm || {}).disabled"
    placeholder="请选择"
    @select="$emit('change')"
    @input="val => $emit('input', val)"
  />
</template>

<script>
import treeForEach from '@/utils/treeForEach'
import treeFilter from '@/utils/treeFilter'
export default {
  name: 'SelectTask',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    value: [String, Number, Array],
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default() {
        return []
      }
    },
    disableKeys: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    computedOptions() {
      let result = _.cloneDeep(this.options)
      treeForEach(result, e => {
        e.id = e.taskUniqueId
        e.label = ['任务', '里程碑'][e.type - 1] + ' ' + e.wbsCode
        e.isDisabled = this.disableKeys.includes(e.taskUniqueId)
        if (e.isDisabled) delete e.children
      })
      return treeFilter(result, e => !e.isDisabled)
    }
  }
}
</script>
<style lang="less">
.vue-treeselect {
  display: inline-block;
  width: 215px;
  font-size: unset;
}
</style>
