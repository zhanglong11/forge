<!--
 * @Description: 版本对比
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-04-23 15:36:04
 * @LastEditTime: 2020-05-22 11:07:56
 -->
<template>
  <div class="right-content">
    <Drag title="版本对比" @close="close">
      <!-- <div>
        <el-button @click="test">测试</el-button>
      </div> -->
      <div class="compare">
        <div class="compare-select">
          <el-select v-model="leftValue" placeholder="请选择">
            <el-option v-for="item in versionList" :key="item.id" :label="item.fileName" :value="item.id"> </el-option>
          </el-select>
        </div>
        <div class="compare-select">
          <el-select v-model="rightValue" placeholder="请选择">
            <el-option
              v-for="item in versionList"
              :key="item.id"
              :label="item.fileName"
              :value="item.id"
              :disabled="leftValue === item.id"
            >
            </el-option>
          </el-select>
        </div>
        <div class="compare-btn">
          <i class="el-icon-c-scale-to-original" @click="modelCompare"></i>
          <!-- <i class="el-icon-c-scale-to-original" @click="again"></i> -->
        </div>
      </div>
      <div class="compare-box">
        <div v-show="compareInfoFlag" class="compare-box-content">
          <header class="compare-box-close">
            <i class="el-icon-circle-close" @click="hideAll"></i>
          </header>
          <ul>
            <li :class="{ 'compare-box-all': true, active: activeClass === 'all' }" @click="activeLi('all')">
              <p>{{ addList.length + editList.length + deleteList.length }}</p>
              <p>全部</p>
            </li>
            <li :class="{ 'compare-box-add': true, active: activeClass === 'add' }" @click="activeLi('add')">
              <p>{{ addList.length }}</p>
              <p>已添加</p>
            </li>
            <li :class="{ 'compare-box-edit': true, active: activeClass === 'edit' }" @click="activeLi('edit')">
              <p>{{ editList.length }}</p>
              <p>已修改</p>
            </li>
            <li :class="{ 'compare-box-delete': true, active: activeClass === 'delete' }" @click="activeLi('delete')">
              <p>{{ deleteList.length }}</p>
              <p>已删除</p>
            </li>
          </ul>
          <div class="compare-box-list">
            <p
              v-for="item in addList"
              v-show="activeClass === 'add' || activeClass === 'all'"
              :key="item.id"
              class="compare-box-list-item add"
            >
              {{ item.label }}
            </p>
            <p
              v-for="item in editList"
              v-show="activeClass === 'edit' || activeClass === 'all'"
              :key="item.id"
              class="compare-box-list-item edit"
            >
              {{ item.label }}
            </p>
            <p
              v-for="item in deleteList"
              v-show="activeClass === 'delete' || activeClass === 'all'"
              :key="item.id"
              class="compare-box-list-item delete"
            >
              {{ item.label }}
            </p>
          </div>
        </div>
      </div>
    </Drag>
  </div>
</template>

<script>
import Drag from './component/Drag'
import fileApi from '@/api/design/file'
export default {
  name: 'VersionCompare',
  components: {
    Drag
  },
  data() {
    return {
      added: [],
      // 默认进来不展示面板
      compareInfoFlag: false,
      //默认全选
      activeClass: 'all',
      leftValue: '',
      rightValue: '',
      // 对比列表
      compareList: [],
      // 新增列表
      addList: [
        // {
        //   label: '新增构件名1',
        //   id: '1'
        // }
      ],
      // 删除列表
      deleteList: [
        // {
        //   label: '删除构件名1',
        //   id: '3'
        // },
        // {
        //   label: '删除构件名1',
        //   id: '2'
        // }
      ],
      // 修改列表
      editList: [
        // {
        //   label: '修改构件名1',
        //   id: '5'
        // },
        // {
        //   label: '修改构件名1',
        //   id: '6'
        // }
      ]
    }
  },
  computed: {
    versionList: {
      get() {
        return this.$store.state.bim.versionList
      }
    },
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    compareList(e) {
      if (e.length === 2) {
        this.$emit('modelCompareLoadModel', e)
        // 请求数据
        this.compareInfoFlag = true
      }
    }
  },
  mounted() {
    // this.again()
  },
  methods: {
    // 激活对应类
    activeLi(e) {
      this.activeClass = e
    },
    close() {
      this.$emit('navigationChange')
    },
    test() {
      this.bimfishApp.getComponentGuid((err, guid) => {
        console.log('guid:', guid)
        this.bimfishApp.getPropertyByGUID(guid, (e, f) => {
          console.log(f)
        })
      })
    },
    showMess(addIdArr, deleteIdArr, editIdArr) {
      let addList = []
      let deleteList = []
      let editList = []
      let bimfishApp = this.bimfishApp
      for (let item of addIdArr) {
        bimfishApp.getPropertyByGUID(item, (e, f) => {
          let name = f.find(
            i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
          )
            ? f.find(
                i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
              ).displayValue
            : '构件名称'
          addList.push({ label: name ? name : '构件名称', id: item })
        })
      }
      for (let item of deleteIdArr) {
        bimfishApp.getPropertyByGUID(item, (e, f) => {
          let name = f.find(
            i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
          )
            ? f.find(
                i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
              ).displayValue
            : '构件名称'
          deleteList.push({ label: name ? name : '构件名称', id: item })
        })
      }
      for (let item of editIdArr) {
        bimfishApp.getPropertyByGUID(item, (e, f) => {
          let name = f.find(
            i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
          )
            ? f.find(
                i => i.displayName === '名称' || i.displayName === '系统名称' || i.displayName.indexOf('类型') > -1
              ).displayValue
            : '构件名称'
          editList.push({ label: name ? name : '构件名称', id: item })
        })
      }
      this.addList = addList
      this.deleteList = deleteList
      this.editList = editList
    },
    again() {
      let bimfishApp = this.bimfishApp
      let models = Object.values(bimfishApp._pendingModels)
      setTimeout(() => {
        bimfishApp.modelCompareSystem(models[0], models[1], f => {
          setTimeout(() => {
            console.log(f)
            this.added = f.added
            // this.addList = Object.keys(f.added)
            // this.editList = Object.keys(f.modified)
            // this.deleteList = Object.keys(f.removed)
            if (Object.values(this.added).length > 0) {
              console.log('获取属性')
              bimfishApp.getBulkProperties(models[0], Object.values(this.added), r => {
                console.log(r)
              })
            }
          }, 0)
        })
      }, 1000)
    },
    // /获取bim信息
    async getBimInfo(projectFileId) {
      let obj = {
        name: '',
        sourceFileId: projectFileId,
        type: 1
      }
      // 获取bim信息
      let res = await fileApi.getBimViewerList(obj)
      if (res.data) {
        let arr = res.data.map(item => {
          let obj = {
            id: item.projectFileId,
            modelUrl: item.url
          }
          return obj
        })
        console.log(arr[0])
        this.compareList.push(arr[0])
      }
    },
    // 对比开始
    modelCompare() {
      if (!this.leftValue || !this.rightValue) return this.$message.error('版本必选')
      if (this.leftValue === this.rightValue) return this.$message.error('版本不能一样')
      // 加载两个版本文件
      let bimfishApp = this.bimfishApp
      console.log(this.leftValue)
      let leftModel = this.versionList.filter(item => item.id === this.leftValue)[0]
      let rightModel = this.versionList.filter(item => item.id === this.rightValue)[0]
      this.getBimInfo(leftModel.projectFileId)
      this.getBimInfo(rightModel.projectFileId)
    },
    hideAll() {
      this.compareInfoFlag = false
    }
  }
}
</script>

<style lang="less" scoped>
.active {
  border: 4px solid lightcoral;
}
.compare {
  display: flex;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  margin-bottom: 10px;
  border-radius: 4px;
  .compare-select {
    width: 38%;
  }
  .compare-btn {
    font-size: 26px;
    cursor: pointer;
  }
}
.compare-box {
  &-content {
    background: #fff;
    padding: 10px;
    border-radius: 4px;
    position: relative;
  }
  &-close {
    position: absolute;
    z-index: 10;
    right: -8px;
    top: -14px;
    font-size: 23px;
    i {
      cursor: pointer;
    }
  }
  ul {
    display: flex;
    justify-content: space-around;
    padding-bottom: 20px;
    border-bottom: 1px solid lightgrey;
    li {
      height: 60px;
      color: #fff;
      width: 20%;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      p:nth-child(1) {
        padding-top: 3px;
      }
    }
  }
  &-all {
    background: rgb(22, 155, 213);
  }
  &-add {
    background: rgb(85, 202, 134);
  }
  &-edit {
    background: rgb(255, 153, 51);
  }
  &-delete {
    background: rgb(255, 59, 48);
  }
}
.compare-box-list {
  &-item {
    padding-top: 4px;
    padding-left: 13px;
    padding-right: 13px;
    position: relative;
    &:before {
      content: '';
      background: red;
      height: 18px;
      top: 7px;
      position: absolute;
      left: 0;
      width: 5px;
    }
  }
  .add {
    &::before {
      background: rgb(85, 202, 134);
    }
  }
  .edit {
    &::before {
      background: rgb(255, 153, 51);
    }
  }
  .delete {
    &::before {
      background: rgb(255, 59, 48);
    }
  }
}
</style>
