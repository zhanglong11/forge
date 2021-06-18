<template>
  <div v-if="visible" class="modal">
    <div class="model-content">
      <div class="model-form">
        <div class="model-content-close">
          <span class="model-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <div class="result">
          <header class="flex-base">
            <span>分析结果</span>
            <el-radio-group v-model="echartType">
              <el-radio-button label="数据表"></el-radio-button>
              <el-radio-button label="饼状图"></el-radio-button>
              <el-radio-button label="直方图"></el-radio-button>
            </el-radio-group>
          </header>
          <hr />
          <div class="echart-content">
            <!-- 数据表 -->
            <div v-if="echartType === '数据表'" class="echart-data">
              <ul>
                <li v-for="(item, index) in echartData" :key="index" style="width:90%">
                  <p class="table-title">{{ item.xaxis }}</p>
                  <p class="table-value">{{ item.yaxis }}</p>
                </li>
              </ul>
            </div>
            <Echarts
              v-if="echartType === '饼状图' || echartType === '直方图'"
              ref="addStatistics"
              idSelect="addStatistics"
              :height="300"
              :option="echartOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Echarts from '_c/Echarts/index'
import api from '@/api/bim/statistics'
export default {
  name: 'ShowEcharts',
  components: {
    Echarts
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: String
    },
    title: String
  },
  data() {
    return {
      echartData: [],
      transData: [],
      statisticsData: [],
      formId: '',
      echartType: '数据表'
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    echartType(e) {
      if (e === '直方图') {
        this.getBar(this.statisticsData)
      } else if (e === '饼状图') {
        this.getPie(this.statisticsData)
      }
    },
    visible(e) {
      this.formId = this.id
      this.title = this.title
      this.getShowEcharts()
    }
  },
  methods: {
    async getShowEcharts() {
      if (this.formId) {
        let res = await api.getBimStatisticsDetails(this.formId)
        this.statisticsData = res.data
        //let copy = JSON.parse(JSON.stringify(this.statisticsData))
        this.echartData = this.statisticsData
        console.log(this.echartData)
      }
    },
    // 饼图数据
    getPie(data) {
      if (!data) return
      // console.log(data)
      let copy = JSON.parse(JSON.stringify(data))
      let titles = copy.map(item => item.xaxis)
      let filterData = copy.map(item => {
        return {
          name: item.xaxis,
          value: item.yaxis
        }
      })
      this.echartOptions = {
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b}: {c} ({d}%)'
          position: ['50%', '30%'],
          formatter:
            '{a} <br/> ' +
            "<p style='width:70px;overflow:hidden;white-space:normal;word-break:break-all;'>" +
            '{b}: ' +
            '</p>' +
            '总数：{c}({d}%)'
        },
        legend: {
          left: 'center',
          top: 'bottom',
          data: titles,
          textStyle: {
            fontSize: 14
          }
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['30%', '45%'],
            center: ['50%', '30%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: filterData
          }
        ]
      }
    },
    // 柱状数据
    getBar(data) {
      if (!data) return
      let copy = JSON.parse(JSON.stringify(data))
      let titles = copy.map(item => item.xaxis)
      let values = copy.map(item => item.yaxis)
      this.echartOptions = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter:
            "<p style='width:70px;display:block;word-break: break-all;word-wrap: break-word;white-space:pre-wrap'>" +
            '{b} ' +
            '</p>' +
            '总数：{c}'
        },
        xAxis: {
          type: 'category',
          data: titles,
          axisLabel: {
            interval: 0,
            // rotate: 40
            formatter: function(value) {
              if (value.length > 4) {
                return value.substring(0, 4) + '...'
              } else {
                return value
              }
            }
          }
        },
        yAxis: {
          type: 'value'
        },

        series: [
          {
            data: values,
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }
        ]
      }
    },
    close() {
      this.echartType = '数据表'
      this.echartData = [
        {
          data: []
        }
      ]
      this.$emit('closeModals')
      this.bimfishApp.clearSelect()
      this.bimfishApp.viewer.disableSelection(true)
    }
  }
}
</script>
<style lang="less" scoped>
.echart-content {
  height: 309px;
  overflow-y: auto;
}
.echart-data {
  height: 205px;
  ul {
    max-width: 100%;
    //overflow: auto;
    height: 200px;
    overflow-y: auto;
    display: block;
  }
  li {
    min-width: 90%;
    max-width: 100%;
    border-bottom: 1px solid #ccc;
    overflow: hidden;
    // border-right: 1px solid lightgray;
    // text-align: center;
    p {
      word-wrap: break-word;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .table-title {
      float: left;
      width: 50%;
      border-right: 1px solid #999;
      background: lightgray;
      margin-right: 20px;
    }
    .table-value {
      margin-left: 15%;
      overflow: hidden;
    }
  }
}
.w-50 {
  width: 50%;
}
.w-30 {
  width: 30%;
}
.w-70 {
  width: 70%;
}
.w-100 {
  width: 100%;
}
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  .mask {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: transparent;
    /*opacity: 0.5;*/
    z-index: 90;
  }

  .model-content {
    padding: 6px 10px;
    width: 360px;
    position: absolute;
    bottom: 0px;
    right: 0;
    z-index: 100;
    overflow: hidden;
    &-close {
      /*position: absolute;*/
      /*right: 1px;*/
      /*top: -12px;*/
      font-size: 22px;
      overflow: hidden;
      margin-bottom: 10px;
      //position: fixed;

      .model-tit {
        float: left;
        font-size: 14px;
        font-weight: bold;
      }
      i {
        cursor: pointer;
        color: #2e79cc;
        float: right;
      }
    }
  }
  .model-form {
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    padding-top: 10px;
  }
  .result {
    border: 1px solid gray;
    border-radius: 4px;
    margin-top: 10px;
    padding: 4px;
    height: 350px;
    overflow-y: auto;
  }
  @media (max-height: 320px) {
    .result {
      max-height: 250px;
      // overflow-y: auto;
    }
  }
  // @media (min-height: 920px) {
  //   .model-form {
  //     max-height: 372px;
  //     // overflow-y: auto;
  //   }
  // }
}
</style>
