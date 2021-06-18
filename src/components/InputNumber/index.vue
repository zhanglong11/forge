<template>
  <el-input :value="value" @input="handleInput" @change="val => $emit('input', parseFloat(val))">
    <template v-if="unit" slot="append">
      {{ unit }}
    </template></el-input
  >
</template>

<script>
export default {
  name: 'InputNumber',
  props: {
    value: [String, Number],
    controls: {
      type: Boolean,
      default: false
    },
    unit: String
  },
  methods: {
    handleInput(val) {
      val = val.toString().replace(/[^\d.]/g, '')
      const splits = val.split('.')
      if (splits.length > 2) {
        val = splits[0] + '.' + splits.slice(1).join('')
      }
      this.$emit('input', val)
    }
  }
}
</script>

<style scoped lang="less"></style>
