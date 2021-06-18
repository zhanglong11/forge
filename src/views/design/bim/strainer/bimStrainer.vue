<!--
 * @Description: task#3052 过滤器
 * @Autor: 席阳冰星
 * @Date: 2020-04-29 11:33:26
 * @LastEditTime: 2020-05-26 15:22:07
 -->
<template>
  <div class="right-content">
    <Drag title="过滤器" :addFlag="true" @add="addNew">
      <VersionFilter :dataList="filterListCopy" @selectChange="selectChange" @userChange="userChange" />
      <el-table
        :data="filterList"
        tooltip-effect="light"
        style="width:100%; margin-top: 10px"
        max-height="436"
        class="handtab"
      >
        <el-table-column
          prop="name"
          align="center"
          label="规则名称"
          width="75px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="creatorName"
          align="center"
          label="添加人"
          width="70px"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column align="center" label="修改时间" width="85px" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ moment(scope.row.updateTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="100px">
          <template slot-scope="scope">
            <div class="show-btn">
              <div class="rule-list-item-btn-box">
                <i
                  :class="iconflag === scope.row.id ? 'icon-yulan' : 'icon-yulan2'"
                  class="icon iconfont"
                  @click="
                    e => {
                      selectModel(scope.row)
                    }
                  "
                ></i>
                <i class="el-icon-edit-outline" @click="btnEdit(scope.row)"></i>
                <i class="el-icon-delete-solid" @click="btnDelete(scope.row)"></i>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <AddEdit ref="addEdit" :visible="visible" :editId="editId" @close="closeModel" @updata="getBimFilterList" />
    </Drag>
  </div>
</template>

<script>
import api from '@/api/bim/filter'
import AddEdit from './addEdit'
import Drag from '../component/Drag'
import VersionFilter from '../component/versionFilter'
export default {
  components: {
    Drag,
    AddEdit,
    VersionFilter
  },
  data() {
    return {
      // 决定哪个li展示编辑btn
      showBtnName: '',
      // 过滤之后的数组
      filterList: [],
      // 编辑参数
      editId: '',
      // 编辑框显示与否
      visible: false,
      version: null,
      projectFileId: null,
      projectId: null,
      filterListCopy: [],
      iconflag: '',
      Guids: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    version(e) {
      this.getBimFilterList()
    },
    getSelect() {
      console.log('chufa')
    }
  },
  mounted() {
    this.listenSelection()
    this.getBimFilterList()
    this.bimfishApp.viewer.disableSelection(true) //关闭场景
  },
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
  },
  methods: {
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.viewer.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
    },
    getAttribute(e, f) {
      if (e.selections.length === 0) {
        this.iconflag = ''
        this.bimfishApp.viewer.disableSelection(true) //关闭场景
        return
      }
    },
    // 获取过滤器列表
    async getBimFilterList() {
      let form = {}
      let res = await api.getBimFilterList(form)
      console.log(res)
      this.filterList = res.data
      this.filterListCopy = JSON.parse(JSON.stringify(res.data))
    },
    selectChange(info) {},
    userChange(list) {
      this.filterList = list
    },
    // 刷新
    refresh(item) {
      console.log('刷新')
    },
    // 根据guid进行选中
    selectModel(item) {
      if (this.iconflag !== '' && this.iconflag === item.id) {
        this.bimfishApp.clearSelect()
        this.iconflag = ''
        this.bimfishApp.viewer.disableSelection(true) //关闭场景
      } else {
        this.bimfishApp.viewer.disableSelection(false) //开启场景
        let guids = item.guids.join(',')
        this.bimfishApp.select(guids.split(','), true)
        this.iconflag = item.id
        // this.bimfishApp.viewer.disableSelection(true)
      }
    },
    close() {
      this.editId = ''
      this.$emit('navigationChange')
    },
    addNew() {
      console.log('新增')
      this.visible = true
    },
    // 进入列表item
    mouseenter(row) {
      this.showBtnName = row.id
    },
    mouseleave(row) {
      this.showBtnName = ''
    },
    // 编辑
    btnEdit(item) {
      // this.$set(item, 'ruleCopy', item.rule)
      // this.$set(item, 'showInputName', true)
      this.bimfishApp.viewer.disableSelection(false) //开启场景
      this.bimfishApp.clearSelect()
      let guids = item.guids.join(',')
      this.bimfishApp.select(guids.split(','), true)
      this.editId = item.id
      this.visible = true
    },
    // 编辑确认
    ruleEdit(obj) {},
    // 取消编辑
    btnCancel(item) {
      item.showInputName = false
    },
    // 删除
    btnDelete(row) {
      this.$confirm('是否要删除此过滤条件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 删除确认
          this.deleteSure(row.id)
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 删除确认
    async deleteSure(id) {
      let res = await api.deleteFilter(id)
      this.$message.success('删除成功')
      this.getBimFilterList()
    },
    // 关闭模态窗口
    closeModel() {
      this.editId = ''
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
/deep/::-webkit-scrollbar {
  width: 16px; // 横向滚动条
  // height: 16px; // 纵向滚动条
}
//滚动条的滑块
/deep/::-webkit-scrollbar-thumb {
  background-color: #ddd;
  background-clip: padding-box;
  border-radius: 7px;
}
.rule-list-item {
  margin-top: 10px;
  line-height: 40px;
  border: 1px solid lightgray;
  border-radius: 5px;
  position: relative;
  padding: 0;
  background: #fff;
  &-btn-box {
    width: 100%;
    height: 100%;
    position: absolute;
    /*background: lightgrey;*/
    right: 0;
    top: 0;
    left: 0;
    text-align: center;
    display: none;
    i {
      font-size: 20px;
      padding-left: 5px;
      padding-right: 5px;
      cursor: pointer;
      line-height: 40px;
    }
    .icon {
      font-size: 20px;
      color: #5a92ff;
    }
  }
  &-input-box {
    width: 30%;
    position: absolute;
    display: none;
  }
}
.show-btn {
  .rule-list-item-btn-box {
    display: block;
  }
}
.show-input {
  .rule-list-item-input-box {
    display: block;
  }
}
@media (max-height: 720px) {
  /deep/.el-table {
    max-height: 320px !important;
  }
}
@media (max-height: 320px) {
  /deep/.el-table {
    max-height: 160px !important;
  }
}
</style>
