<template>
  <div>
    <span class="status-point" :style="{ backgroundColor: activeOption.color }"></span>
    <span>{{ activeOption.label }}</span>
  </div>
</template>

<script>
export default {
  name: 'Status',
  props: {
    options: {
      type: Array,
      default() {
        return [
          { color: '#f54d4d', value: 0, label: '停用' },
          { color: '#009944', value: 1, label: '正常' }
        ]
      }
    },
    value: {
      type: [String, Number]
    }
  },
  computed: {
    activeOption() {
      return _.find(this.options, { value: this.value }, this.options[0]) || { label: '未知' }
    }
  }
}
</script>

<style scoped lang="less">
.status-point {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  & + span {
    margin-left: 5px;
  }
}
</style>
