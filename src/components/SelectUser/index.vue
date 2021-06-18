<!--
 * @Description:
 * @Version:
 * @Autor:
 * @Date: 2020-02-17 09:09:38
 * @LastEditTime: 2020-03-04 10:18:35
 -->
<template>
  <TreeSelect
    :value="value"
    :options="treeData"
    label="name"
    :multiple="multiple"
    :valueFormat="valueFormat"
    loading-text="加载中..."
    no-options-text="没有选项..."
    no-results-text="没有匹配的选项..."
    :disabled="disabled || (elForm || {}).disabled"
    placeholder="请选择"
    disable-branch-nodes
    @input="
      val => {
        $emit('input', val)
        $emit('update:id', val && val.id)
        $emit('update:name', val && val.label)
      }
    "
  />
</template>

<script>
export default {
  name: 'SelectUser',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    multiple: {
      type: Boolean,
      default: true
    },
    value: [String, Number, Array, Object],
    disabled: {
      type: Boolean,
      default: false
    },
    valueFormat: {
      type: String,
      default: 'object',
      enum: ['id', 'object']
    },
    disableKeys: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    treeData() {
      return this.$store.state.departmentUserList.filter(e => _.size(e.children))
    }
  },
  created() {
    !this.treeData.length && this.$store.dispatch('getDepartmentUserList')
  }
}
</script>
<style lang="less">
.vue-treeselect {
  display: inline-block;
  width: 100%;
  font-size: unset;
}
.el-form--inline {
  .vue-treeselect {
    width: 215px;
  }
}
</style>
