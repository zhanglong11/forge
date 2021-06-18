<!--
 * @Description: 碰撞分析
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-23 18:16:12
 * @LastEditTime: 2020-04-25 16:27:49
 -->
<template>
  <div class="right-content">
    <Drag title="碰撞分析" @close="close">
      <div class="crash-content">
        <div class="crash-content-add">
          <!-- <Upload :isOnlyButton="true" accept=".xml" btnText="+" @input="uploadChange" /> -->
          <div class="xmlFile">
            <i class="el-icon-plus add-plus" style="width:150px" @click="xmlUpload">上传文件</i>
          </div>
          <div class="fileName">
            {{ fileName }}
          </div>
        </div>
      </div>
      <div class="crash-compare-content">
        <div class="crash-table">
          <el-table :data="allCrashMess">
            <el-table-column prop="leftCarashTypeName" label="碰撞名称" align="center"> </el-table-column>
            <el-table-column prop="rightCarashTypeName" label="被碰撞名称" align="center"></el-table-column>
            <el-table-column align="center" label="操作" width="130px">
              <template slot-scope="scope">
                <div class="list-item-btn-box">
                  <el-switch
                    v-model="scope.row.hideView"
                    @change="
                      e => {
                        rowClick(scope.row, e, scope.$index)
                      }
                    "
                  ></el-switch>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </Drag>
    <CrashAnalyzeDialog
      v-if="crashAnalyzeDialogVisible"
      :visible.sync="crashAnalyzeDialogVisible"
      @close="closeAddMove"
    />
  </div>
</template>

<script>
import Upload from '_c/UploadStorage/index'
import Drag from './component/Drag'
import { getAllLeaf } from '@/utils/index'
import CrashAnalyzeDialog from './component/CrashAnalyzeDialog'
import api from '@/api/bim/statistics'
export default {
  name: 'CrashAnalyze',
  components: {
    Drag,
    CrashAnalyzeDialog
  },
  data() {
    return {
      hideView: false,
      crashAnalyzeDialogVisible: false,
      // 上传后的文件路径
      filePath: null,
      // 文件名
      fileName: '',
      // 左侧分类类型
      leftTypeList: [],
      leftTypeValue: '',
      // 右侧分类类型
      rightTypeList: [],
      rightTypeValue: '',
      // 所有碰撞数据信息{leftCarashTypeName,rightCarashTypeName,green,blue,crashName,leftComponentName,rightComponentName}
      allCrashMess: [],
      viewId: this.$store.state.bim.bim3DArr[0].id,
      bimState: [],
      bimStates: true,
      indexCount: 0
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  created() {
    this.btnDetailList()
    //this.bimfishApp.hideAll()
  },
  methods: {
    async btnDetailList() {
      if (this.viewId) {
        let obj = {
          viewId: this.viewId
        }
        await api.getBimCrashRecordList(obj).then(res => {
          if (res.code === 200) {
            this.resultData(res.data)
          }
        })
      }
    },
    async resultData(data) {
      let bimfishApp = this.$store.state.bim.bimfishApp
      let resultArr = []
      let crashArr = []
      // 元素id
      let idObj = {}
      let obj = {} //存放 id
      //初始化保存碰撞信息
      let clashresultObj = {
        // 左侧碰撞名称，对应类型名字
        leftCarashTypeName: '',
        // 右侧碰撞名称，对应类型名字
        rightCarashTypeName: '',
        // 左侧guid
        guidLeft: '',
        // 右侧guid
        guidRight: ''
      }
      for (let i = 0; i < data.length; i++) {
        obj = {
          green: data[i].secondElementId,
          blue: data[i].firstElementId
        }
        idObj[data[i].secondElementId] = true
        idObj[data[i].firstElementId] = true
        clashresultObj = {
          leftCarashTypeName: data[i].firstElementName,
          rightCarashTypeName: data[i].secondElementName,
          // 左侧guid
          guidLeft: '',
          // 右侧guid
          guidRight: ''
        }
        crashArr.push(clashresultObj)
        resultArr.push(obj)
      }
      // 获取构件树
      let tree = bimfishApp.buildModelTree(bimfishApp.viewer.model)
      // 获取叶子节点
      let list = getAllLeaf(tree.children)
      // 如果有需求：获取要展示的节点dbid集合
      let filterArr = list.filter(item => {
        let nodeId = item.name.split('[')[1].split(']')[0]
        return idObj[nodeId]
      })

      let model = bimfishApp.viewer.model
      //上色
      for (let i = 0; i < resultArr.length; i++) {
        let item = resultArr[i]
        // let green = _.find(filterArr, { name: item.green })
        let green = filterArr.find(child => child.name.indexOf(item.green) > -1)
        if (!green) continue
        // let blue = _.find(filterArr, { name: item.blue })
        let blue = filterArr.find(child => child.name.indexOf(item.blue) > -1)
        crashArr[i].green = green
        crashArr[i].blue = blue
        item.green = green
        item.blue = blue
        // bimfishApp.setThemingColor([green], model, 0, 1)
        // bimfishApp.setThemingColor([blue], model, 0, 0, 1)
      }
      //定位
      let map = await bimfishApp.getGuidMap()
      let modelMap = map[model.id]
      // 默认定位第一组碰撞中的第一个guid
      for (let key in modelMap) {
        for (let i = 0; i < resultArr.length; i++) {
          if (modelMap[key] === crashArr[i]?.green?.dbId) {
            crashArr[i].guidLeft = key
          }
          if (modelMap[key] === crashArr[i]?.blue?.dbId) {
            crashArr[i].guidRight = key
          }
        }
      }
      if (crashArr.length > 0) {
        // bimfishApp.fitViewByGUID(crashArr[0].guidLeft)
        bimfishApp.select(crashArr[0].guidLeft)
      }
      this.allCrashMess = crashArr
      this.allCrashMessCopy = JSON.parse(JSON.stringify(crashArr))
    },
    close() {
      this.$emit('navigationChange')
    },
    closeAddMove() {
      this.btnDetailList()
    },
    // 上传文件
    xmlUpload() {
      this.crashAnalyzeDialogVisible = true
    },
    // 行点击:进行定位
    rowClick(row, e, index) {
      // let bimfishApp = this.$store.state.bim.bimfishApp
      this.$nextTick(() => {
        if (row.guidLeft !== '' && row.guidRight !== '') {
          if (this.bimStates === true) {
            this.bimfishApp.hideAll()
            this.bimStates = false
          }
          let guid = row.guidLeft
          let guids = row.guidRight
          if (e) {
            this.bimState[index] = row.hideView
            setTimeout(() => {
              this.bimfishApp.show([guid])
              this.bimfishApp.show([guids])
              this.bimfishApp.setThemingColor([guid], 0, 0, 1, 1)
              this.bimfishApp.setThemingColor([guids], 1, 0, 0, 1)
            }, 10)
          } else {
            this.bimState[index] = row.hideView
            this.bimfishApp.hide([guid])
            this.bimfishApp.hide([guids])
            this.bimfishApp.clearThemingColorByGUID([row.guidLeft])
            this.bimfishApp.clearThemingColorByGUID([row.guidRight])
            // 检查switch状态
            let result = this.bimState.some(item => item === true)
            if (result === true) {
              return
            } else {
              this.bimfishApp.showAll()
              this.bimfishApp.show([guid])
              this.bimfishApp.show([guids])
              this.bimState = []
              this.bimStates = true
            }
          }
        } else {
          this.$message.warning('碰撞物体不存在')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.crash-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 6px;
  border-radius: 3px;
  background: #fff;
  &-add {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #fff;
    justify-content: initial;
    text-align: center;
    height: 100%;
    line-height: 40px;
    /deep/ .el-button--primary {
      background-color: rgb(85, 202, 134);
      border-color: rgb(85, 202, 134);
      width: 80px;
    }
    > div {
      height: 100%;
    }
  }
  .xmlFile {
    width: 80px;
    position: relative;

    .add-plus {
      position: absolute;
      display: block;
      width: 100%;
      height: 100%;
      z-index: 12;
      /*background: rgb(85, 202, 134);*/
      background-color: #5a92ff;
      line-height: 40px;
      cursor: pointer;
    }
    &-box {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      z-index: 10;
    }
  }
}
.analyze {
  cursor: pointer;
  font-size: 20px;
}
.fileName {
  padding-left: 10px;
  color: black;
}
.crash-type {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  align-items: center;
  margin-top: 20px;
  i {
    font-size: 18px;
    cursor: pointer;
  }
  > div:nth-child(1) {
    width: 30%;
  }
  > div:nth-child(2) {
    width: 30%;
  }
}
.bim-content .el-container .el-aside .right-content .drag-box header.drag-box-title[data-v-3ab32ad4] {
  position: fixed;
  z-index: 20;
  width: 100%;
}
.crash-table {
  border-top: 1px solid #ccc;
  overflow-y: auto;
  position: absolute;
  height: calc(100% - 110px);
  width: 340px;
}
::-webkit-scrollbar {
  width: 10px;
  background-color: #ccc;
}
</style>
