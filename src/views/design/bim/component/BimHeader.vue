<template>
  <!-- 顶部导航栏 -->
  <header class="header">
    <div class="logo">
      <img src="~@/assets/logo.png" height="60" alt="" />
    </div>
    <div class="version-list">
      <el-select v-model="versionValue" placeholder="请选择" @change="versionChange">
        <el-option v-for="item in versionList" :key="item.id" :label="item.fileName" :value="item.id"> </el-option>
      </el-select>
    </div>
    <!-- 左侧菜单栏 -->
    <NavigationHeader @navigationChange="navigationChange" />
    <el-tooltip class="item" effect="dark" :content="toggleflag ? '收起' : '展开'" placement="bottom">
      <i :class="toggleflag ? 'el-icon-s-unfold' : 'el-icon-s-fold'" @click="togglebtn"></i>
    </el-tooltip>
  </header>
</template>
<script>
import NavigationHeader from './NavigationHeader'
export default {
  name: 'BimHeader',
  components: {
    NavigationHeader
  },
  props: {
    toggleflag: {
      type: Boolean
    },
    versionValue: {
      type: String || Number
    },
    versionList: {
      type: Array
    }
  },
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    // 版本更改：更新当前的模型地址
    versionChange(e) {
      this.$emit('versionChange', e)
    },
    togglebtn() {
      this.$emit('togglebtn')
    },
    // 左侧菜单栏点击选择
    navigationChange(e) {
      this.$emit('navigationChange', e)
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  background: #5085bf;
  position: relative;
  .logo {
    height: 60px;
  }
  .version-list {
    padding-left: 10px;
  }
  i {
    position: absolute;
    right: 0;
    display: inline-block;
    width: 50px;
    height: 100%;
    line-height: 58px;
    text-align: center;
    cursor: pointer;
    color: #fff;
    font-size: 22px;
    border-left: 2px solid #6192c7;
  }
}
</style>
