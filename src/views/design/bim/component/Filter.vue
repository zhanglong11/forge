<!--
 * @Description: 过滤器下拉
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-05-29 09:36:33
 * @LastEditTime: 2020-05-29 09:37:56
-->
<template>
  <div>
    <header class="filter-res flex-base">
      <span>过滤器：</span>
      <el-select v-model="buildings" placeholder="请选择">
        <el-option v-for="item in resList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>
    </header>
  </div>
</template>

<script>
import filterApi from '@/api/bim/filter'
export default {
  data() {
    return {
      buildings: '',
      resList: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    buildings(e) {
      let item = this.resList.find(item => item.id === e)
      this.bimfishApp.clearSelect()
      this.bimfishApp.select(item.guids, true)
    }
  }
}
</script>

<style lang="scss" scoped></style>
