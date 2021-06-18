<!--
 * @Description: echarts组件
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-05-14 10:14:35
 * @LastEditTime: 2020-05-14 11:00:54
 -->
<template>
  <div>
    <div :id="idSelect" :style="{ width: '100%', height: height + 'px' }"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { on, off } from '@/utils/index'

export default {
  props: {
    // 移入移除事件flag
    mouseoverFlag: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 100
    },
    // echarts选项
    option: {
      default: {}
    },
    // 这是需要初始化的id,保证每个都不同
    idSelect: {
      default: ''
    }
  },
  data() {
    return {
      // echart实例
      myChart: null
    }
  },
  watch: {
    option: {
      handler: function(val) {
        if (this.myChart) {
          this.myChart.clear()
          this.myChart.setOption(val)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.drawLine()
      // 移入移除事件
      if (this.myChart && this.mouseoverFlag) {
        this.myChart.on('mouseover', data => {
          this.$emit('mouseover', data)
        })
      }
      if (this.myChart) {
        this.myChart.on('click', data => {
          this.$emit('click', data)
        })
      }
    })
  },
  beforeDestroy() {
    off(window, 'resize', this.resize)
  },
  methods: {
    reset() {
      this.myChart.clear()
      this.myChart.setOption(this.option)
    },
    resize() {
      console.log(this.myChart)
      this.myChart.resize()
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let ID = this.idSelect
      this.myChart = echarts.init(document.getElementById(ID))
      this.myChart.setOption(this.option)
      on(window, 'resize', this.resize)
    }
  }
}
</script>

<style scoped></style>
