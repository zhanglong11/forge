<!--
 * @Description: task# 数据管理
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-08 13:53:17
 * @LastEditTime: 2020-05-29 09:17:11
 -->
<template>
  <div class="right-content">
    <Drag title="数据管理" @close="close">
      <header class="filter-res flex-base">
        <span>过滤器：</span>
        <el-select v-model="buildings" placeholder="请选择">
          <el-option v-for="item in resList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </header>
      <header class="header">
        <el-button type="primary" class="pluss" @click="selectAll">点选</el-button>
        <div class="desc">
          选择构件
        </div>
      </header>
      <header class="header">
        <div class="plus" @click="addNewExtend">
          <i class="el-icon-plus"></i>
        </div>
        <div class="desc">
          扩展属性
        </div>
      </header>
      <div class="extend-list">
        <ul>
          <li v-for="(item, index) in extendList" :key="index">
            <el-input v-model="item.name" class="input" placeholder="属性名"></el-input>
            <el-input v-model="item.value" class="input" placeholder="属性值"></el-input>
            <i class="el-icon-delete-solid" @click="deleteExtend(item, index)"></i>
          </li>
        </ul>
        <div class="save-btn">
          <el-button type="success" @click="save">保存</el-button>
        </div>
      </div>
    </Drag>
  </div>
</template>

<script>
import api from '@/api/bim/extendedAttributes'
import filterApi from '@/api/bim/filter'
import Drag from './component/Drag'
import { getParams } from '@/utils/index'
export default {
  name: 'DataManagement',
  components: {
    Drag
  },
  data() {
    return {
      extendList: [
        {
          name: '',
          value: ''
        }
      ],
      // 构件集
      buildings: '',
      // 过滤器列表
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
      this.bimfishApp.viewer.disableSelection(false) //开启场景
      let item = this.resList.find(item => item.id === e)
      //this.bimfishApp.clearSelect()
      if (!item) return this.bimfishApp.viewer.disableSelection(true)
      let guid = item.guids[0].split(',')
      this.bimfishApp.select(guid, true)
    }
  },
  mounted() {
    this.listenSelection()
    this.getResList()
    // this.bimfishApp.viewer.disableSelection(false) //开启场景
  },
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
    this.bimfishApp.viewer.removeEventListener('selection', this.addClick)
    this.bimfishApp.viewer.disableSelection(true) //关闭场景
  },
  methods: {
    selectAll() {
      this.bimfishApp.viewer.disableSelection(false) //开启场景
    },
    // 获取过滤器列表
    async getResList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await filterApi.getBimFilterList(form)
      this.resList = res.data
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.viewer.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
      this.bimfishApp.viewer.addEventListener('selection', this.addClick, false)
    },
    async addClick() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) {
        this.buildings = ''
        this.extendList = [
          {
            name: '',
            value: ''
          }
        ]
        return
      }
    },
    getAttribute(e, f) {
      // 只有在单选状态下才会进行请求
      if (e.selections.length !== 1 || e.selections[0].dbIdArray.length !== 1)
        return (this.extendList = [
          {
            name: '',
            value: ''
          }
        ])
      this.getAttributePost()
    },
    async getAttributePost() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let guid = res.selectionGuidArr[0]
      // let viewId = this.$store.state.bim.modelInfo.id
      let viewId = this.$store.state.bim.bim3DArr[0].id
      let attr = await api.getAttributes(viewId, guid)
      if (attr.data) {
        this.extendList = attr.data
          .filter(item => item.displayCategory === '扩展属性')
          .map(item => {
            return {
              name: item.displayName,
              value: item.displayValue
            }
          })
        if (this.extendList.length === 0) {
          return (this.extendList = [
            {
              name: '',
              value: ''
            }
          ])
        }
      } else {
        this.bimfishApp.viewer.disableSelection(true) //
      }
    },
    close() {
      this.$emit('navigationChange')
    },
    // 删除扩展属性
    deleteExtend(item, index) {
      this.extendList = this.extendList.filter((e, i) => i !== index)
    },
    //新增扩展属性
    async addNewExtend() {
      // 主要是看上一个有没有完善
      if (this.extendList.some(item => !item.name)) return this.$message.error('请完善属性项')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) {
        this.$message.error('请选择构件')
      } else {
        this.extendList.push({
          name: '',
          value: ''
        })
      }
    },
    async save() {
      if (this.extendList.some(item => !item.name)) return this.$message.error('请完善属性项')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) {
        this.$message.error('请选择构件')
      } else {
        this.saveSure(res.selectionGuidArr)
      }
    },
    async saveSure(guids) {
      let form = {
        attributeList: this.extendList,
        guids: guids,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.addExtendedAttributesNew(form)
      this.$message.success('操作成功')
      this.bimfishApp.viewer.disableSelection(true) //关闭场景
      this.extendList = [
        {
          name: '',
          value: ''
        }
      ]
      this.bimfishApp.clearSelect()
      this.buildings = ''
    }
  }
}
</script>

<style lang="less" scoped>
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 4px 6px;
}
.filter-res {
  margin-bottom: 10px;
}
.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 6px;
  .plus {
    background: #71a8e4;
    cursor: pointer;
    color: #fff;
    padding: 6px 28px;
    font-size: 21px;
    margin-right: 10px;
  }
  .pluss {
    background: #71a8e4;
    cursor: pointer;
    color: #fff;
    margin-right: 10px;
    font-size: 21px;
    padding: 8px 18px;
  }
}
.extend-list {
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    margin: 4px 0;
    padding: 4px;
    .input {
      width: 40%;
    }
    i {
      cursor: pointer;
    }
  }
}
.save-btn {
  width: 100%;
  text-align: center;
  background: #fff;
  button {
    background: #71a8e4;
    width: 97%;
    margin: 10px 0;
    border-color: #71a8e4;
  }
}
</style>
