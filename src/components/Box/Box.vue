<template>
  <div class="box">
    <header>{{ title }}</header>
    <div class="box-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {}
  }
}
</script>

<style lang="less" scoped>
.box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  header {
    border-bottom: 1px solid #dcdfe6;
    padding: 8px 11px;
    font-size: 14px;
  }
  .box-content {
    padding: 8px 11px;
  }
}
</style>
