<template>
  <el-select :value="value" @change="val => $emit('input', val)">
    <el-option v-for="e in options" :key="e.id" :value="e.id" :label="e.processName"></el-option>
  </el-select>
</template>

<script>
export default {
  name: 'SelectProcessTemplate',
  props: ['value'],
  computed: {
    options() {
      return this.$store.state.design.processTemplateList
    }
  },
  created() {
    if (!_.size(this.$store.state.design.processTemplateList)) {
      this.$store.dispatch('design/getProcessTemplate')
    }
  }
}
</script>

<style scoped lang="less"></style>
