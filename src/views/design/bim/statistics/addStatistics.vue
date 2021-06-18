<!--
 * @Description: 新增统计分析
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 08:41:47
 * @LastEditTime: 2020-05-28 17:15:56
 -->
<template>
  <div v-if="visible" class="modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="model-content">
      <div class="model-form">
        <div class="model-content-close">
          <span class="model-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <section class="form-content">
          <ul>
            <li class="flex-base">
              <span>分析名称：</span>
              <el-input v-model="form.name" class="w-70"></el-input>
            </li>

            <li class="flex-base">
              <span>选项：</span>
              <el-radio-group v-model="radioValue" @change="radioChange">
                <el-radio :label="1">系统</el-radio>
                <el-radio :label="2">属性</el-radio>
              </el-radio-group>
            </li>
            <li class="flex-base">
              <span>框选：</span>
              <el-button type="primary" @click="selectAll">框选</el-button>
            </li>
            <li class="flex-base">
              <span>框选总数：</span>
              <el-input v-model="selectguidsNum" style="width:65%" disabled></el-input>
            </li>

            <li v-if="radioValue === 1" class="flex-base">
              <span>类型：</span>
              <el-select v-model="form.systemStatisticsType" placeholder="请选择">
                <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </li>
            <li v-if="radioValue === 2" class="flex-base">
              <span>属性：</span>
              <el-select v-model="form.attributeName" placeholder="请选择">
                <el-option v-for="item in keys" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </li>
            <li v-show="radioValue === 2" class="flex-base">
              <span>值：</span>
              <div class="flex-base">
                <el-radio-group v-model="form.attributeStatisticsType">
                  <el-radio :label="1">值</el-radio>
                  <el-radio :label="2">区间</el-radio>
                </el-radio-group>
                <el-input
                  v-if="form.attributeStatisticsType === 2"
                  v-model="sectionListCopy"
                  class="w-50"
                  placeholder="多个值用英文逗号隔开"
                  @input="sectionListChange"
                ></el-input>
              </div>
            </li>
            <li>
              <el-button type="primary" class="w-100" @click="goStatistics">
                分析
              </el-button>
            </li>
          </ul>
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
              <div v-if="echartType === '数据表'" class="echart-data">
                <ul>
                  <li v-for="(item, index) in echartData" :key="index" style="width:90%">
                    <p class="table-title">{{ item.name }}</p>
                    <p class="table-value">{{ item.count }}</p>
                  </li>
                </ul>
              </div>
              <!-- 饼图、直方图 -->
              <Echarts
                v-if="echartType === '饼状图' || echartType === '直方图'"
                ref="addStatistics"
                idSelect="addStatistics"
                :height="300"
                :option="echartOptions"
              />
            </div>
            <el-button type="primary" class="w-100" @click="saveJudge">
              保存
            </el-button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Echarts from '_c/Echarts/index'
import { getParams } from '@/utils/index'
import api from '@/api/bim/statistics'
export default {
  name: 'AddStatistics',
  components: {
    Echarts
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 编辑form
    editForm: {},
    title: String
  },
  data() {
    return {
      selectguidsNum: 0, //默认0
      sectionListCopy: null,
      echartData: [],
      echartType: '数据表',
      types: [
        {
          value: 1,
          label: '专业分类'
        },
        {
          value: 2,
          label: '系统分类'
        },
        {
          value: 3,
          label: '系统类型'
        },
        {
          value: 4,
          label: '材质'
        }
      ],
      // 属性列表
      keys: [],
      // 选项：1为系统；2为属性
      radioValue: 1,
      form: {
        value: '',
        name: '',
        attributeName: '',
        systemStatisticsType: ''
      },
      echartOptions: {},
      // 从后台获取的统计数据
      statisticsData: [],
      // dbIds: [],
      selectguids: [], //框选按钮选中的构件id
      modelMap: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    editForm() {
      if (_.isEmpty(this.editForm)) return
      this.form = _.cloneDeep(this.editForm)
      this.bimfishApp.clearSelect()
      this.bimfishApp.select(this.form.guids.split(','), true)
      this.radioValue = this.form.category
      this.sectionListCopy = this.form.sectionList
      let firstForm = {
        guids: this.form.guids.split(','),
        // // 区间组，待定
        sectionList: this.sectionListCopy,
        attributeName: this.form.attributeName,
        attributeStatisticsType: this.form.attributeStatisticsType,
        category: this.radioValue,
        name: this.form.name,
        systemStatisticsType: this.form.systemStatisticsType,
        value: this.form.value,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      this.goStatisticsSure(firstForm)
    },
    echartType(e) {
      if (e === '直方图') {
        this.getBar(this.statisticsData)
      } else if (e === '饼状图') {
        this.getPie(this.statisticsData)
      }
    },
    visible(e) {
      if (!e) {
        this.form = {
          value: '',
          name: '',
          attributeName: '',
          systemStatisticsType: ''
        }
        this.radioValue = 1
        this.sectionListCopy = null
        this.bimfishApp.viewer.removeEventListener(
          Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
          this.getAttributeName
        )
        this.statisticsData = []
      } else {
        this.$nextTick(() => {
          this.listenSelection()
          // 获取属性
          //this.getAttributeJudge()
        })
      }
      this.selctMap()
    }
  },
  mounted() {},
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttributeName)
  },
  methods: {
    async selctMap() {
      let map = await this.bimfishApp.getGuidMap()
      let model = this.bimfishApp.viewer.model
      let modelMap = map[model.id]
      this.modelMap = modelMap
    },
    selectAll() {
      this.bimfishApp.viewer.disableSelection(false)
      this.bimfishApp.activeSelect(selection => {
        let dbIds = selection.dbIds[0][1]
        this.selectGuid(dbIds)
      })
      //this.bimfishApp.deactiveSelect()
    },
    selectGuid(dbIds) {
      for (let key in this.modelMap) {
        for (let i = 0; i < dbIds.length; i++) {
          if (this.modelMap[key] === dbIds[i]) {
            this.selectguids[i] = key
          }
        }
      }
      console.log(this.selectguids.length)
      this.bimfishApp.select(this.selectguids, true)
      this.selectguidsNum = this.selectguids.length
      //关闭框选
      // setTimeout(() => {
      //   this.bimfishApp.deactiveSelect()
      // })
      this.selectguids = []
    },
    radioChange(e) {
      this.sectionListCopy = null
      this.form.attributeName = ''
      this.form.systemStatisticsType = ''
      this.sectionListCopy = ''
      this.$set(this.form, 'attributeStatisticsType', null)
    },
    async getAttributeJudge() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) {
        // 获取全部属性
        let allAttr = await api.getAllAttribute(this.form.projectFileId ? this.form.projectFileId : getParams('fileId'))
        if (!allAttr) {
          return
        }
        let arr = [...new Set(allAttr.data.map(item => item.name))].map(item => {
          return {
            value: item,
            label: item
          }
        })
        this.keys = arr
      }
    },
    watchscope(form) {
      console.log(form)
    },
    sectionListChange(e) {
      // 去掉左右空格
      let a = e.replace(/(^\s*)|(\s*$)/g, '')
      // 将中文逗号替换为英文
      e.replace(/，/g, ',')
    },
    attrChange(e) {
      console.log(e)
    },

    // 保存
    async saveJudge() {
      if (!this.form.name) return this.$message.error('统计名称必填')
      if (this.sectionListCopy) {
        let list = this.sectionListCopy.split(',')
        if (list.length > 1) {
          for (let i = 0; i < list.length; i++) {
            let item = list[i]
            if (item >= list[i + 1]) {
              return this.$message.error('请输入正确区间')
            }
          }
        }
      }
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let guids = []
      if (res.selectionGuidArr.length === 0) {
        guids = res.noSelectionGuidArr
      } else {
        guids = res.selectionGuidArr
      }
      console.log(guids)
      let form = {
        sectionList: this.sectionListCopy,
        bimStatisticsResultList: this.statisticsData,
        attributeName: this.form.attributeName,
        attributeStatisticsType: this.form.attributeStatisticsType,
        category: this.radioValue,
        id: this.form.id,
        name: this.form.name,
        systemStatisticsType: this.form.systemStatisticsType,
        value: this.form.value,
        guids: this.form.guids ? this.form.guids : guids.join(','),
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      if (form.id) {
        this.editSure(form)
      } else {
        this.saveSure(form)
      }
    },
    async saveSure(form) {
      let res = await api.addBimStatistics(form)
      this.$message.success('添加成功')
      this.$emit('update')
      this.close()
    },
    async editSure(form) {
      let res = await api.editBimStatistics(form)
      this.$message.success('编辑成功')
      this.$emit('update')
      this.close()
    },
    // 进行分析
    async goStatistics() {
      if (this.sectionListCopy) {
        let list = this.sectionListCopy.split(',')
        if (list.length > 1) {
          for (let i = 0; i < list.length; i++) {
            let item = list[i]
            if (item >= list[i + 1]) {
              return this.$message.error('请输入正确区间')
            }
          }
        }
      }
      if (!this.form.name) return this.$message.error('统计名称必填')
      if (this.radioValue === 1 && !this.form.systemStatisticsType) return this.$message.error('请填写类型')
      if (this.radioValue === 2 && !this.form.attributeName) return this.$message.error('请选择属性')
      if (this.form.attributeStatisticsType === 2 && !this.sectionListCopy) return this.$message.error('请输入区间')

      if (this.radioValue === 2 && !this.form.attributeStatisticsType) return this.$message.error('请选择值或者区间')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()

      let guids = []
      if (res.selectionGuidArr.length === 0) {
        guids = res.noSelectionGuidArr
      } else {
        guids = res.selectionGuidArr
      }
      let form = {
        guids: guids,
        // 区间组，待定
        sectionList: this.sectionListCopy,
        attributeName: this.form.attributeName,
        attributeStatisticsType: this.form.attributeStatisticsType,
        category: this.radioValue,
        name: this.form.name,
        systemStatisticsType: this.form.systemStatisticsType,
        value: this.form.value,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      // return
      this.goStatisticsSure(form)

      // 得到分析数据
    },
    async goStatisticsSure(form) {
      console.log(form)
      let res = await api.goBimStatistics(form)
      if (res.data) {
        // let filterData = res.data.map(item => {
        //   let obj = {
        //     value: '',
        //     name: ''
        //   }
        //   // for (let key in item) {
        //   //   obj.name = key
        //   //   obj.value = item[key]
        //   // }
        //   // return obj
        // })
        this.statisticsData = JSON.parse(JSON.stringify(res.data))
      } else {
        this.$message.error('暂无数据')
        this.statisticsData = []
      }
      this.tableFilter(this.statisticsData)
      if (this.echartType === '直方图') {
        this.getBar(this.statisticsData)
      } else if (this.echartType === '饼状图') {
        this.getPie(this.statisticsData)
      }
    },
    // 生成table数据
    tableFilter(data) {
      if (!data) return
      let copy = JSON.parse(JSON.stringify(data))
      this.echartData = copy
    },
    // 饼图数据
    getPie(data) {
      if (!data) return
      // console.log(data)
      let copy = JSON.parse(JSON.stringify(data))
      let titles = copy.map(item => item.name)
      let filterData = copy.map(item => {
        return {
          name: item.name,
          value: item.count
        }
      })
      this.echartOptions = {
        tooltip: {
          trigger: 'item',
          // formatter: '{a} <br/>{b}: {c} ({d}%)'
          position: ['50%', '30%'],
          formatter:
            '{a} <br/> ' +
            "<p style='width:75px;overflow:hidden;white-space:normal;word-break:break-all;'>" +
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
      let titles = copy.map(item => item.name)
      let values = copy.map(item => item.count)
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
      this.$emit('closeModal')
      this.bimfishApp.clearSelect()
      this.selectguidsNum = 0
      this.bimfishApp.viewer.disableSelection(true)
      //关闭框选
      setTimeout(() => {
        this.bimfishApp.deactiveSelect()
      }, 100)
    },
    closealert() {
      this.$message.warning('请先关闭弹框')
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.viewer.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttributeName)
    },
    // 获取属性值
    getAttributeName() {
      // 选中构件
      let list = this.bimfishApp.viewer.getAggregateSelection()
      if (list.length === 0) return (this.selectguidsNum = 0)
      let filterConditionList = []
      for (let item of list) {
        this.selectguidsNum = item.selection.length
        this.bimfishApp.getBulkProperties(item.model, item.selection, e => {
          if (!e) return
          let arr = e.map(item => item.properties.filter(child => !child.hidden).map(child => child.displayName))
          filterConditionList = [].concat.apply([], arr)
          filterConditionList = Array.from(new Set(filterConditionList))
          this.keys = filterConditionList.map(item => {
            return {
              value: item,
              label: item
            }
          })
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.echart-content {
  height: 209px;
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
    &-close {
      /*position: absolute;*/
      /*right: 1px;*/
      /*top: -12px;*/
      font-size: 22px;
      overflow: hidden;
      margin-bottom: 10px;
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
    .form-content {
      height: 366px;
      overflow-y: auto;
    }
  }
  @media (min-height: 320px) {
    .model-form {
      max-height: 375px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 400px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 920px) {
    .model-form {
      max-height: 430px;
      // overflow-y: auto;
    }
  }
}
.result {
  border: 1px solid gray;
  border-radius: 4px;
  margin-top: 10px;
  padding: 4px;
}
</style>
