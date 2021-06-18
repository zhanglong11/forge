<!--
 * @Description: 
 * @Author: 
 * @Date: 2020-01-21 08:33:18
 -->
<template>
  <div>
    <BreakingNews :list="list" />
  </div>
</template>
<script>
import api from '@/api/design/dynamic'
import BreakingNews from '_c/BreakingNews/index'
export default {
  name: 'BreakingNewPreview',
  components: {
    BreakingNews
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      let res = await api.getBreakList({ rows: 0, page: 0, projectId: localStorage.getItem('projectId') })
      this.list = res.data.records
      console.log(res)
    }
  }
}
</script>
<style lang="less" scoped></style>
