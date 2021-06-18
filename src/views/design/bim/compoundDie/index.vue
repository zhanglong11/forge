<!--
 * @Description: 合模
 * @compoundDie:
 * @Autor: 申豪强
 * @Date: 2020-04-22 19:42:45
 * @LastEditTime: 2020-05-22 16:58:55
 -->
<template>
  <div class="compound-die right-content">
    <Drag :addFlag="true" title="合模" @add="addNew">
      <div v-if="compoundDieList.length === 0" class="no-res">暂无数据</div>
      <ul class="compound-die-content">
        <li v-for="item in compoundDieList" :key="item.id">
          <div
            :class="{
              'compound-die-list-item': true,
              'show-btn': showBtnName === item.id,
              'show-input': item.showInputName
            }"
          >
            <p>{{ item.name }}</p>
            <p>{{ item.creatorName }}</p>
            <p>{{ moment(item.createTime).format('YYYY-MM-DD') }}</p>
            <!-- 编辑框 -->
            <div class="compound-die-list-item-input-box">
              <el-input v-model="item.nameCopy"></el-input>
            </div>
            <!-- 按钮区 -->
            <div class="compound-die-list-item-btn-box">
              <i
                v-show="!item.showInputName"
                :class="showBtnName === item.id ? 'icon-yulan' : 'icon-yulan2'"
                class="icon iconfont"
                @click="
                  e => {
                    e.stopPropagation()
                    select(item)
                  }
                "
              ></i>
              <i
                v-show="!item.showInputName"
                :class="item.showInputName ? 'el-icon-check' : 'el-icon-edit-outline'"
                @click="
                  e => {
                    e.stopPropagation()
                    btnEdit(item)
                  }
                "
              ></i>
            </div>
          </div>
          <div class="handle-edit">
            <!-- <header class="table-content-close">
              <i class="el-icon-circle-close" @click="hideTable"></i>
            </header> -->
            <el-table :data="item.detailList" tooltip-effect="dark" style="width: 100%">
              <el-table-column type="index" width="50" label="序号" align="center"> </el-table-column>
              <el-table-column prop="name" show-overflow-tooltip label="文件名" align="center"> </el-table-column>
              <el-table-column label="修改日期" align="center" width="90">
                <template slot-scope="scope">
                  {{ moment(scope.row.createTime).format('YYYY-MM-DD') }}
                </template>
              </el-table-column>
              <el-table-column prop="createName" label="修改人" align="center" width="60"> </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="cell">
                  <!-- 移动旋转模型 -->
                  <i class="el-icon-location-outline cursor" @click="showMove(item, cell.row, cell)"></i>
                  <i
                    v-if="cell.$index !== 0"
                    class="el-icon-delete-solid cursor"
                    @click="deleteModelItem(item, cell.row)"
                  ></i>
                </template>
              </el-table-column>
            </el-table>
            <footer class="addFooter">
              <div class="footer-left">
                <el-button
                  v-show="item.showInputName"
                  type="primary"
                  @click="
                    e => {
                      e.stopPropagation()
                      addNewByEdit(item)
                    }
                  "
                >
                  + 添加模型
                </el-button>
              </div>
              <div class="footer-right">
                <el-button
                  v-show="item.showInputName"
                  @click="
                    e => {
                      e.stopPropagation()
                      btnCancel(item)
                    }
                  "
                  >取消</el-button
                >
                <el-button
                  v-show="item.showInputName"
                  type="success"
                  @click="
                    e => {
                      e.stopPropagation()
                      saveJudge(item)
                    }
                  "
                  >保存</el-button
                >
              </div>
            </footer>
          </div>
        </li>
      </ul>
    </Drag>
    <SelectFile
      :visible.sync="dialogVisible"
      :taskUniqueId="taskUniqueId"
      @change="handleSelectFileChange"
      @close="fileClose"
    ></SelectFile>
    <MoveChange :visible="moveVisible" :title="title" :editForm="editForm" @close="closeMove" @save="saveMove" />
  </div>
</template>

<script>
import Drag from '../component/Drag'
import SelectFile from '../component/SelectFile'
import MoveChange from './moveChange'
import fileApi from '@/api/design/file'
import api from '@/api/bim/bimCombineModel'
import { getParams } from '@/utils/index'
export default {
  components: {
    Drag,
    SelectFile,
    MoveChange
  },
  props: {
    // 任务id
    taskUniqueId: {},
    // 哪个模块底下的
    departmentId: {}
  },
  data() {
    return {
      // 编辑form
      editForm: {},
      // 修改坐标
      moveVisible: false,
      // 新增或者编辑展示标志
      addOrEditShow: false,
      dialogVisible: false,
      // 决定哪个li展示btn
      showBtnName: '',
      // 合模列表
      compoundDieList: [],
      // 选中哪个合模文件
      targetId: '',
      modelArr: [],
      addFlag: false,
      fileListLength: 0,
      // 当前模型的信息
      nowInfo: {},
      title: ''
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    },
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    userInfo() {}
  },
  mounted() {
    this.getModelList()
    this.getDetails([getParams('fileId')])
  },
  methods: {
    saveMove(form) {
      let target = {}
      if (this.addFlag) {
        target = this.compoundDieList.find(item => !item.id)
      } else {
        target = this.compoundDieList.find(item => item.id === this.targetId)
      }
      target.detailList[this.moveIndex] = JSON.parse(JSON.stringify(form))
      this.closeMove()
    },
    closeMove() {
      this.moveVisible = false
    },
    showMove(item, row, cell) {
      console.log(item)
      if (item.id) this.targetId = item.id

      this.btnEdit(item, true)
      this.moveIndex = cell.$index
      this.moveVisible = true
      this.title = '参数项'
      this.editForm = JSON.parse(JSON.stringify(row))
    },
    // 过滤条件
    filterCondition(list) {
      return list.filter(item => item.id !== getParams('fileId'))
    },
    // 获取对应文件id的详情:本模块中主要用于获取当前模型信息
    async getDetails(arr) {
      let res = await fileApi.getFileDetailsByArr(arr)
      this.nowInfo = res.data[0]
    },
    select(e) {
      let arr = e.detailList.map(item => {
        return {
          id: item.id,
          modelUrl: item.url
        }
      })
      this.$emit('updateModel', arr)
      this.changeicon(e)
    },
    changeicon(e) {
      if (this.showBtnName !== '' && this.showBtnName === e.id) {
        this.showBtnName = ''
      } else {
        this.showBtnName = e.id
      }
    },
    fileClose() {
      this.dialogVisible = false
      this.targetId = ''
    },
    showModel(arr) {
      this.$emit('updateModel', arr)
    },
    // /获取列表
    async getModelList() {
      let form = {
        projectFileId: getParams('fileId')
      }
      let res = await api.getBimCombineModelList(form)
      this.compoundDieList = res.data
    },
    // 删除
    btnDelete(e) {
      this.$confirm('是否要删除此合模版本', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteModelItemSure(row.id)
      })
    },
    // 删除确认
    async deleteModelItemSure(id) {
      let res = await api.deleteBimCombineModel(id)
      this.getModelList()
      this.$message.success('删除成功')
    },
    // 删除table中的模型
    deleteModelItem(item, row) {
      this.$set(item, 'showInputName', true)
      this.$set(item, 'nameCopy', item.name)
      item.detailList = item.detailList.filter(item => item.id !== row.id)
    },

    // 编辑
    btnEdit(item, flag) {
      if (item.id) {
        this.addFlag = false
      } else {
        this.addFlag = true
      }
      if (item.showInputName) {
        if (flag) return
        item.showInputName = false
      } else {
        this.$set(item, 'nameCopy', item.name)
        this.$set(item, 'showInputName', true)
      }
    },
    // 取消
    btnCancel(item) {
      // if (!item.id) {
      //   this.compoundDieList = this.compoundDieList.filter(item => item.id)
      //   return
      // }
      // item.showInputName = false
      this.getModelList()
    },
    // /新增
    addNew() {
      if (this.compoundDieList.some(item => !item.id)) return this.$message.error('请先保存上一条信息')
      let index = this.compoundDieList.length
      this.addFlag = true
      let obj = {
        showInputName: true,
        name: '00' + (index + 1) + '.合模',
        nameCopy: '00' + (index + 1) + '.合模',
        creatorName: this.userInfo.loginName, //当前操作人
        createTime: moment().format('YYYY-MM-DD'), //当前时间
        detailList: [],
        modelArr: []
      }
      this.compoundDieList.push(obj)
      this.dialogVisible = true
    },
    // 选中文件
    handleSelectFileChange(e) {
      if (!e) return
      this.pushChange(this.addFlag ? 'add' : 'edit', e)
    },
    // 模型文件更改
    pushChange(flag, fileList) {
      let index = this.compoundDieList.length
      let bigItem = null
      let arr = fileList.map(item => {
        return {
          angle: '',
          coordinate: '',
          zoom: '',
          creatorName: item.createName,
          createTime: item.createTime,
          combineFileId: item.id,
          url: '',
          name: item.name,
          viewId: ''
        }
      })

      if (flag === 'edit') {
        //编辑
        bigItem = this.compoundDieList.find(item => item.id === this.targetId)
        bigItem.detailList.push(...arr)
      } else {
        //新增
        bigItem = this.compoundDieList.find(item => !item.id)
        bigItem.detailList.push(...arr)
        if (bigItem.detailList.some(item => item.name.indexOf('当前版本') === -1)) {
          console.log(this.nowInfo)
          bigItem.detailList.unshift({
            name: '当前版本:' + this.nowInfo.fileName,
            createName: this.nowInfo.creatorName,
            createTime: this.nowInfo.createTime,
            angle: '',
            coordinate: '',
            zoom: '',
            combineFileId: this.nowInfo.id,
            url: '',
            viewId: ''
          })
        }
      }
      let i = 0
      // 为了组装模型数据
      for (let item of bigItem.detailList) {
        i += 1
        this.getNowInfo(item, i, bigItem.detailList)
      }
    },

    // 请求数据，将轻量化后的数据push进数组，source是选择的文件对象
    async getNowInfo(source, i, fileList) {
      if (source.url) return
      let obj = {
        name: '',
        sourceFileId: source.combineFileId,
        type: 1
      }
      let res = await fileApi.getBimViewerList(obj)
      // 获取目标模型数据
      let target = res.data.find(item => item.isDefault === 1)

      source.url = target.url
      source.viewId = target.id
      if (i === fileList.length) {
        let arr = fileList.map(item => {
          return {
            id: item.combineFileId,
            modelUrl: item.url
          }
        })
        this.showModel(arr)
        this.addFlag = false
      }
    },
    // 编辑
    addNewByEdit(row) {
      this.dialogVisible = true
      this.targetId = row.id
    },
    // 关闭右侧拖拽框
    close() {
      this.$emit('navigationChange')
    },
    // 保存合模
    saveJudge(item) {
      if (item.detailList.length === 1) return this.$message.error('请添加1个以上的合模文件')
      let form = JSON.parse(JSON.stringify(item))
      let formCopy = {
        batchCode: form.batchCode ? form.batchCode : this.$store.state.bim.batchCode,
        detailList: form.detailList,
        id: form.id,
        name: form.name,
        projectFileId: form.projectFileId ? form.projectFileId : getParams('fileId'),
        projectId: form.projectId ? form.projectId : localStorage.getItem('projectId'),
        version: form.version ? form.version : this.$store.state.bim.versionInfo.version,
        sourceFileId: form.sourceFileId
      }
      if (formCopy.id) {
        this.updateSure(formCopy)
      } else {
        this.saveSure(formCopy)
      }
    },
    async updateSure(form) {
      let res = await api.updateBimCombine(form)
      this.$message.success('编辑成功')
      // this.$emit('update')
      this.getModelList()
    },
    async saveSure(form) {
      let res = await api.addBimCombineModel(form)
      this.$message.success('新增成功')
      this.getModelList()
    },
    // 进入
    mouseenter(item) {
      this.showBtnName = item.id
    },
    // 出来
    mouseleave(item) {
      this.showBtnName = ''
    }
  }
}
</script>

<style lang="less" scoped>
.mask {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background: #000;
  opacity: 0.5;
}
.table-content-close {
  position: absolute;
  z-index: 10;
  right: -2px;
  top: -8px;
  font-size: 23px;
  i {
    cursor: pointer;
  }
}
.table-content {
  /*position: fixed;*/
  /*padding: 10px;*/
  /*bottom: 10px;*/
  /*width:330px;*/
}
.addFooter {
  display: flex;
  padding: 0 8px;
  justify-content: space-between;
  text-align: center;
  // cursor: pointer;
  line-height: 40px;
  background: #fff;
  border-radius: 0 0 4px 4px;
}
.cursor {
  cursor: pointer;
  font-size: 18px;
}
.compound-die {
  &-content {
    max-height: 500px;
    overflow-y: auto;
    li {
      cursor: pointer;
      &:nth-child(1) .compound-die-list-item {
        margin-top: 0;
      }
    }
    .compound-die-list-item {
      display: flex;
      justify-content: space-between;
      p {
        text-align: center;
        float: left;
      }
      p:nth-child(1) {
        width: 30%;
      }
      p:nth-child(2) {
        width: 20%;
      }
      p:nth-child(3) {
        width: 25%;
      }
    }
  }

  .compound-die-list-item {
    margin-top: 10px;
    line-height: 44px;
    border-bottom: 1px solid lightgray;
    border-radius: 5px 5px 0 0;
    position: relative;
    padding: 0 4px;
    background: #fff;
    &-btn-box {
      width: 25%;
      /*position: absolute;*/
      /*background: lightgrey;*/
      right: 0;
      text-align: center;
      display: block;
      float: left;
      i {
        font-size: 20px;
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
      }
      .icon {
        font-size: 22px;
        color: #5a92ff;
      }
    }
    &-input-box {
      width: 30%;
      position: absolute;
      display: none;
    }
  }
  .handle-edit {
    /deep/.el-table__header {
      width: 340px !important;
      table-layout: inherit !important;
    }
    /deep/.el-table__body {
      width: 340px !important;
      table-layout: inherit !important;
    }
  }
  .show-btn {
    .compound-die-list-item-btn-box {
      display: block;
    }
  }
  .show-input {
    .compound-die-list-item-input-box {
      display: block;
    }
  }
}
</style>
