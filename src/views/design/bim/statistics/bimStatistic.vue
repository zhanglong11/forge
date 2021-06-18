<!--
 * @Description: task#未建立任务 统计分析
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-13 17:24:00
 * @LastEditTime: 2020-05-25 16:09:45
 -->
<template>
  <div class="right-content">
    <Drag title="统计分析" :addFlag="true" @add="addNew">
      <VersionFilter :dataList="filterListCopy" @selectChange="selectChange" @userChange="userChange" />
      <section class="view">
        <el-table
          :data="filterList"
          tooltip-effect="light"
          style="width: 100%;margin-top: 10px"
          max-height="441"
          class="handtab"
        >
          <el-table-column prop="name" align="center" label="统计名称" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column
            prop="creatorName"
            align="center"
            label="添加人"
            width="60"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column align="center" label="添加时间" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ moment(scope.row.createTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="scope">
              <div class="list-item-btn-box">
                <i class="el-icon-edit-outline" @click="btnEdit(scope.row)"></i>
                <i class="el-icon-view" @click="bimOptesthesiaProgramShowChange(scope.row)"></i>
                <i class="el-icon-delete-solid" @click="btnDelete(scope.row)"></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>
      <AddStatistics
        :visible="visible"
        :title="title"
        :editForm="editForm"
        @closeModal="closeModal"
        @update="getBimStatisticsList"
      />
      <ShowEcharts :id="echartsid" :title="title" :visible="echastrvisible" @closeModals="closeModals" />
    </Drag>
  </div>
</template>

<script>
import VersionFilter from '../component/versionFilter'
import Drag from '../component/Drag'
import api from '@/api/bim/statistics'
import AddStatistics from './addStatistics'
import ShowEcharts from './showEcharts'
export default {
  name: 'Statistics',
  components: {
    Drag,
    VersionFilter,
    AddStatistics,
    ShowEcharts
  },
  data() {
    return {
      showBtnName: '',
      version: '',
      projectFileId: '',
      projectId: '',
      userList: [],
      filterList: [],
      filterListCopy: [],
      visible: false,
      editForm: [],
      title: '',
      echastrvisible: false,
      echartsid: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    version() {
      this.userList = []
      this.getBimStatisticsList()
    }
  },
  created() {
    this.getBimStatisticsList()
    // this.bimfishApp.viewer.setClickConfig('click', 'offObject', 'selectOnly')
  },
  methods: {
    //查看统计分析结果
    bimOptesthesiaProgramShowChange(e) {
      this.bimfishApp.viewer.disableSelection(false)
      let bimfishApp = this.$store.state.bim.bimfishApp
      this.echartsid = e.id
      this.echastrvisible = true
      this.title = '查看统计分析'
      let guids = e.guids.split(',')
      bimfishApp.select(guids, true)
    },
    closeModal() {
      this.visible = false
    },
    closeModals() {
      this.echastrvisible = false
    },
    // 编辑
    btnEdit(item) {
      this.bimfishApp.viewer.disableSelection(false)
      this.editForm = JSON.parse(JSON.stringify(item))
      this.visible = true
      this.title = '编辑统计分析'
    },
    // 版本更新：过滤条件更新
    selectChange(v) {
      this.version = v.version
      this.projectFileId = v.projectFileId
      this.projectId = v.projectId
    },
    userChange(e) {
      this.filterList = e
    },
    async getBimStatisticsList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimStatisticsList(form)
      this.filterList = res.data
      this.filterListCopy = JSON.parse(JSON.stringify(res.data))
    },
    addNew() {
      this.visible = true
      this.title = '新增统计分析'
    },
    close() {
      this.$emit('navigationChange')
    },
    // 进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 删除
    btnDelete(row) {
      this.$confirm('是否要删除此分析', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteSure(row.id)
        })
        .catch(() => {
          console.log('取消')
        })
    },
    async deleteSure(id) {
      let res = await api.deleteBimStatistics(id)
      this.$message.success('删除成功')
      this.getBimStatisticsList()
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
.no-res {
  margin-top: 10px;
}
.view,
.fire {
  height: calc(50% - 10px);
}
.flex-base {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.list {
  &-item {
    margin-top: 10px;
    line-height: 40px;
    border: 1px solid lightgray;
    border-radius: 5px;
    position: relative;
    padding: 0;
    background: #fff;
    &-btn-box {
      width: 100%;
      position: absolute;
      /*background: lightgrey;*/
      right: 0;
      top: 0;
      left: 0;
      text-align: center;
      display: block;
      i {
        font-size: 18px;
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
        line-height: 40px;
      }
      .el-switch {
        top: -4px;
      }
    }
    &-input-box {
      width: calc(100% - 4px);
      position: absolute;
      display: none;
    }
  }
  .show-btn {
    .list-item-btn-box {
      display: block;
    }
  }
  .show-input {
    .list-item-input-box {
      display: block;
      left: 30%;
    }
  }
}
@media (max-height: 720px) {
  /deep/.el-table {
    max-height: 320px !important;
  }
}
@media (max-height: 968px) {
  /deep/.el-table {
    max-height: 400px !important;
  }
}
</style>
