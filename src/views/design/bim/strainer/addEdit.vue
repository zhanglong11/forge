<!--
 * @Description: task#3052 过滤规则
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-30 09:04:50
 * @LastEditTime: 2020-05-29 08:56:10
 -->
<template>
  <div v-if="visible" class="rule-modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="rule-model-content">
      <div class="rule-model-form">
        <div class="rule-model-content-close">
          <span class="rule-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <header class="rule-model-content-header">
          <span>规则名称：</span>
          <el-input v-model="form.name" class="w-70"></el-input>
        </header>
        <hr class="m-10" />
        <section class="rule-model-content-header">
          <span>选择构件：</span>
          <el-button type="primary" @click="selectAll">框选</el-button>
        </section>
        <section class="rule-model-content-header">
          <span>构件个数：</span>
          <el-input v-model="selectguidsNum" style="width:50%" disabled></el-input>
        </section>
        <section class="rule-model-content-options">
          <hr class="m-10" />
          <ul v-for="(attribute, index) in form.filterConditionList" :key="index">
            <li v-show="index !== 0" class="reduce" style="display: block;">
              <i class="el-icon-remove-outline cursor" @click="reduceRule(attribute, index)"></i>
            </li>
            <li v-show="index !== 0">
              <span>关系：</span>
              <el-select v-model="attribute.logicalOperator" placeholder="请选择条件" class="w-70">
                <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </li>
            <li>
              <span>参数项：</span>
              <el-select v-model="attribute.attributeName" filterable placeholder="请选择" class="w-70">
                <el-option v-for="item in keys" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </li>
            <li>
              <span>条件：</span>
              <el-select
                v-model="attribute.condition"
                filterable
                placeholder="请选择"
                class="w-70"
                @change="
                  e => {
                    conditionChange(e, attribute)
                  }
                "
              >
                <el-option v-for="item in conditionOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </li>
            <li>
              <span>值：</span>
              <el-input v-model="attribute.value" class="w-70" :disabled="attribute.disabled" />
            </li>
            <hr class="m-10" />
          </ul>
          <div class="rule-model-content-end">
            <el-button type="text" icon="el-icon-plus" @click="addNewCondition">添加条件</el-button>
          </div>
        </section>
        <div class="flex-base">
          <el-button @click="guidFilter">过滤</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/filter'
import statisticsApi from '@/api/bim/statistics'
import { getParams } from '@/utils/index'
export default {
  name: 'AddEdit',
  props: {
    visible: Boolean,
    // 编辑form
    editId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '',
      form: {
        // 属性数组
        filterConditionList: [
          {
            logicalOperator: null,
            attributeName: '',
            condition: '',
            value: ''
          }
        ]
      },
      saveData: [],
      keys: [],
      conditionOptions: [
        {
          label: '等于',
          value: 'EQUAL'
        },
        {
          label: '小于',
          value: 'LESS_THAN'
        },
        {
          label: '小于等于',
          value: 'LESS_THAN_EQUAL'
        },
        {
          label: '大于',
          value: 'GREATER_THAN'
        },
        {
          label: '大于等于',
          value: 'GREATER_THAN_EQUAL'
        },
        {
          label: '包含',
          value: 'CONTAIN'
        },
        {
          label: '不包含',
          value: 'NO_CONTAIN'
        },
        {
          label: '开头是',
          value: 'START_WITH'
        },
        {
          label: '开头不是',
          value: 'NO_START_WITH'
        },
        {
          label: '结尾是',
          value: 'END_WITH'
        },
        {
          label: '结尾不是',
          value: 'NO_END_WITH'
        },
        {
          label: '为空',
          value: 12
        },
        {
          label: '不为空',
          value: 13
        }
      ],
      types: [
        {
          label: '且',
          value: 'AND'
        },
        {
          label: '或',
          value: 'OR'
        }
      ],
      selectguids: [], //框选按钮选中的构件id
      modelMap: [],
      selectguidsNum: 0 //选中构件的个数
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    visible(val) {
      console.log('显示与否:' + val)
      if (!val) {
        this.form = {
          // 属性数组
          filterConditionList: [
            {
              logicalOperator: null,
              attributeName: '',
              condition: '',
              value: ''
            }
          ]
        }
        this.bimfishApp.viewer.removeEventListener(
          Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
          this.getAttributeNames
        )
      } else {
        this.$nextTick(() => {
          this.listenSelection()
          if (this.editId) {
            this.getDetails()
            this.title = '编辑过滤规则'
          } else {
            this.title = '新增过滤规则'
          }
          //this.getAttributeJudge()
        })
      }
      this.selctMap()
    }
  },
  mounted() {
    // this.bimfishApp.viewer.disableSelection(false) //场景开启
  },
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(
      Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.getAttributeNames
    )
  },
  methods: {
    async selctMap() {
      let map = await this.bimfishApp.getGuidMap()
      let model = this.bimfishApp.viewer.model
      let modelMap = map[model.id]
      this.modelMap = modelMap
    },
    selectAll() {
      this.bimfishApp.viewer.disableSelection(false) //场景开启
      this.bimfishApp.activeSelect(selection => {
        let dbIds = selection.dbIds[0][1]
        this.selectGuid(dbIds)
      })
      //this.bimfishApp.deactiveSelect()
    },
    selectGuid(dbIds) {
      if (!dbIds) return
      for (let key in this.modelMap) {
        for (let i = 0; i < dbIds.length; i++) {
          if (this.modelMap[key] === dbIds[i]) {
            this.selectguids[i] = key
          }
        }
      }
      console.log(this.selectguids)
      this.bimfishApp.select(this.selectguids, true)
      this.selectguidsNum = this.selectguids.length
      this.selectguids = []
    },
    reduceRule(item, index) {
      this.form.filterConditionList = this.form.filterConditionList.filter((t, i) => i !== index)
    },
    async getAttributeJudge() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) {
        // 获取全部属性
        let allAttr = await statisticsApi.getAllAttribute(
          this.form.projectFileId ? this.form.projectFileId : getParams('fileId')
        )

        let arr = [...new Set(allAttr.data.map(item => item.name))].map(item => {
          return {
            value: item,
            label: item
          }
        })
        this.keys = arr
      }
    },
    async getDetails() {
      let res = await api.getFilterDetails(this.editId)
      this.form = res.data
      console.log(this.form)
      this.saveData = this.form.guids
      let guidsNum = this.form.guids[0].split(',')
      this.selectguidsNum = guidsNum.length
      if (!this.form.filterConditionList) this.form.filterConditionList = []
    },
    async addBimFilter() {},
    // /条件更改
    conditionChange(e, item) {
      // 为空、不为空
      if (e === 13 || e === 12) {
        //为空+不为空
        this.$set(item, 'disabled', true)
      } else {
        this.$set(item, 'disabled', false)
      }
    },
    // 新增条件
    addNewCondition() {
      this.form.filterConditionList.push({
        logicalOperator: '',
        condition: '',
        value: '',
        attributeName: ''
      })
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.viewer.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttributeNames)
    },
    // 关闭当前model
    close() {
      this.$emit('close')
      this.selectguidsNum = 0
      this.bimfishApp.clearSelect()
      //关闭框选
      setTimeout(() => {
        this.bimfishApp.deactiveSelect()
      }, 100)
    },
    closealert() {
      this.$message({
        type: 'warning',
        message: '请先关闭弹框',
        duration: 1500,
        offset: 60
      })
    },
    // 保存
    async save() {
      // form属性数组，如果关系没选，不能提交
      if (
        this.form.filterConditionList.length > 1 &&
        this.form.filterConditionList.some((item, index) => index !== 0 && !item.logicalOperator)
      ) {
        return this.$message.error('请选择属性关系')
      }
      if (!this.form.name) return this.$message.error('名称必填')
      console.log(this.saveData)
      if (this.saveData.length > 0) {
        this.saveSure(this.saveData)
      } else {
        this.$message.error('请选择构件')
      }
    },
    // /保存确认
    async saveSure(guids) {
      let form = {
        filterConditionList: this.form.filterConditionList,
        guids: guids,
        name: this.form.name,
        id: this.form.id,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      if (form.id) {
        let res = await api.updateBimFilter(form)
        this.$message.success('保存成功')
      } else {
        let res = await api.addBimFilter(form)
        this.$message.success('保存成功')
      }
      this.$emit('updata')
      this.close()
    },
    // 点击过滤22：发请求给后台进行过滤
    async guidFilter() {
      if (this.editId) {
        this.guidFilterSure(this.form, true)
      } else {
        let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
        let selectionGuidArr = []
        if (res.selectionGuidArr.length > 0) {
          // 选中的构件guid
          selectionGuidArr = res.selectionGuidArr
          this.guidFilterSure(selectionGuidArr, false)
        } else {
          this.$message.error('请选择构件')
        }
      }
      // 将获取的selectionGuidArr与属性对象传给后台
    },
    async guidFilterSure(guids, flag) {
      let form = {}
      if (flag) {
        Object.assign(form, {
          conditionList: this.form.filterConditionList,
          guids: this.form.guids,
          viewId: this.$store.state.bim.bim3DArr[0].id
        })
      } else {
        Object.assign(form, {
          conditionList: this.form.filterConditionList,
          guids: guids,
          viewId: this.$store.state.bim.bim3DArr[0].id
        })
      }
      let res = await api.searchBimFilter(form)
      //this.bimfishApp.clearSelect()
      console.log(res.data)
      this.bimfishApp.select(res.data, true)
      this.saveData = res.data
      console.log(res)
      this.selectguidsNum = res.data.length //过滤后的数量
    },
    // 获取属性值
    getAttributeNames() {
      // 选中构件
      let list = this.bimfishApp.viewer.getAggregateSelection()
      console.log(list)
      if (list.length === 0) return (this.selectguidsNum = 0)
      let conditionList = []
      for (let item of list) {
        this.bimfishApp.getBulkProperties(item.model, item.selection, e => {
          if (!e) return
          let arr = e.map(item => item.properties.filter(child => !child.hidden).map(child => child.displayName))
          conditionList = [].concat.apply([], arr)
          conditionList = Array.from(new Set(conditionList))
          this.keys = conditionList.map(item => {
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
.rule-model-content-options {
  height: 180px;
  overflow-y: auto;
}
.reduce {
  text-align: right;
}
.w-70 {
  width: 70%;
}
.m-10 {
  margin: 10px 0;
}
.rule-modal {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  width: 100%;
  overflow: hidden;
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
  .flex-base {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4px;
  }
  .rule-model-content {
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
      /*font-size: 24px;*/
      font-size: 22px;
      overflow: hidden;
      margin-bottom: 10px;
      .rule-tit {
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
    &-header {
      .flex-base;
    }
    &-handles {
      display: flex;
    }
    &-options {
      li {
        .flex-base;
      }
    }
    &-end {
      .flex-base;
    }
  }
  .rule-model-form {
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    position: relative;
    z-index: 100;
    padding-top: 10px;
    max-height: 399px;
    overflow-y: auto;
    /*滚动条样式设置*/
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      background-clip: padding-box;
      border: 3px solid transparent;
      border-radius: 7px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: transparent;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
    &::-webkit-scrollbar-track:hover {
      background: transparent;
    }
  }
}
</style>
