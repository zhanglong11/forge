<!--
 * @Description: 地址选择插件
 * @Version: 1.0
 * @Autor: 申豪强
 * @Date: 2020-03-16 15:31:18
 * @LastEditTime: 2020-03-16 17:01:42
 -->
<!--
 * @任务编号: 1170 || 修复项目概况无法查看具体的省市区地址
 * @开发人员:申豪强
 * @日期:2020-03-16
 * @任务类型: 其它人修改代码引起的BUG
 * 备注：隔壁json文件是地址库，不计入代码量
 -->
<template>
  <div>
    <el-cascader v-model="area" :options="options" style="width:100%" @change="handleChange"></el-cascader>
  </div>
</template>

<script>
import addressList from './addressList'
export default {
  props: {
    value: {
      type: String
    }
  },
  data() {
    return {
      options: addressList,
      area: []
    }
  },
  watch: {
    value: {
      handler: function(n, o) {
        if (n) {
          this.area = n.split('_')
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleChange(e) {
      this.$emit('update', e.join('_'))
    }
  }
}
</script>
<style lang="less" scoped></style>
