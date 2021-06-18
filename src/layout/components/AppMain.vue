<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.fullPath
    }
  }
}
</script>

<style scoped lang="less">
.app-main {
  /*50 = navbar  */
  width: 100%;
  position: relative;
  padding: 20px;
  overflow: hidden;
  > div {
    margin-top: 20px;
    background-color: #fff;
    min-height: calc(100vh - 90px);
    padding: 20px;
  }
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>
