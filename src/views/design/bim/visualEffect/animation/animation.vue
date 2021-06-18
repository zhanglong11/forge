<!--
 * @Description: 动画方案
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-08 15:39:22
 * @LastEditTime: 2020-05-26 17:39:14
 -->
<template>
  <div>
    <section class="animation">
      <div class="flex-base">
        <span>动画方案</span>
        <i class="el-icon-circle-plus-outline cursor" @click="addAnimation"></i>
      </div>
      <el-table
        :data="filterList"
        tooltip-effect="light"
        style="width:100%;margin-top:5px"
        max-height="400"
        class="handtab"
      >
        <el-table-column prop="name" align="center" show-overflow-tooltip label="动画名称"></el-table-column>
        <el-table-column
          prop="creatorName"
          align="center"
          label="添加人"
          width="60px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column align="center" label="添加时间" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ moment(scope.row.createTime).format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="120px">
          <template slot-scope="scope">
            <div class="list-item-btn-box">
              <i class="el-icon-edit-outline" @click="btnEdit(scope.row)"></i>
              <el-switch
                v-model="scope.row.hideView"
                @change="
                  e => {
                    showAnimation(scope.row, e)
                  }
                "
              ></el-switch>
              <i
                class="el-icon-delete-solid"
                @click="btnDelete(scope.row, viewDeleteSure, '是否要删除此动画方案？')"
              ></i>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <AddAnimation
      ref="Animation"
      :title="anmititle"
      :visible="visible"
      :editId="editId"
      :index="filterList.length"
      @close="addAnimationClose"
      @updateBimCartoon="updateBimCartoon"
    />
  </div>
</template>

<script>
import api from '@/api/bim/visualEffect'
import AddAnimation from './addAnimation'
export default {
  components: {
    AddAnimation
  },
  // 均为过滤用
  props: {
    // 版本号
    version: {},
    // 创建人
    creatUser: {},
    // /项目号
    projectId: {},
    // 项目文件号
    projectFileId: {}
  },
  data() {
    return {
      // 过滤之后的数组
      filterList: [],
      filterListCopy: [],
      // 编辑参数
      editId: '',
      // 编辑框显示与否
      visible: false,
      showBtnName: '',
      anmititle: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    version: {
      immediate: true,
      handler: function() {
        this.getAnimationList()
      }
    },
    filterListCopy: {
      immediate: true,
      handler: function() {
        this.updateUser()
      }
    },
    creatUser() {
      if (this.creatUser === '全部' || !this.creatUser) {
        this.filterList = JSON.parse(JSON.stringify(this.filterListCopy))
      } else {
        this.filterList = this.filterListCopy.filter(item => item.creatorName === this.creatUser)
      }
    }
  },
  methods: {
    updateUser() {
      console.log('更新userList')
      if (this.filterListCopy.length > 0) {
        let arr = [...new Set([...this.filterListCopy].map(item => item.creatorName))].map((item, index) => {
          return {
            value: index,
            label: item
          }
        })
        arr.unshift({ value: '', label: '全部' })
        this.$emit('updateUser', arr)
      }
    },
    // 删除
    btnDelete(row, callBack, text) {
      this.$confirm(text, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          callBack(row.id)
        })
        .catch(() => {
          console.log('取消')
        })
    },
    // 删除动画
    async viewDeleteSure(id) {
      let res = await api.deleteBimCartoon(id)
      this.$message.success('删除成功')
      this.getAnimationList()
    },
    showAnimation(item, flag) {
      console.log(item)
      //let guids = item.componentGuids.split(',')
      if (flag) {
        this.bimfishApp.viewer.disableSelection(false)
        this.editId = item.id
        this.$refs.Animation.getBimOptesthesiaProgramList()
        this.$refs.Animation.getFireList()
        this.$refs.Animation.getRotateList()
        this.$refs.Animation.getBimComponentMoveList()
        setTimeout(() => {
          this.$refs.Animation.getDetails()
        }, 10)
        setTimeout(() => {
          this.$refs.Animation.modelPreview(true)
        }, 1000)
      } else {
        this.$refs.Animation.clearAll()
        //this.BimOptesthesiaProgramClear(guids)
        this.bimfishApp.viewer.disableSelection(true)
      }
    },
    addAnimationClose() {
      this.visible = false
      this.editId = ''
    },
    updateBimCartoon() {
      this.getAnimationList()
      this.addAnimationClose()
    },
    // 新增动画方案
    addAnimation() {
      this.visible = true
      this.anmititle = '新增动画方案'
      this.editId = ''
      this.bimfishApp.viewer.disableSelection(false)
    },
    // 点击li，效果待定
    selectModel(item) {},
    // 视觉方案进入列表item
    mouseenter(item) {
      this.showBtnName = item.id
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 方案编辑
    btnEdit(item) {
      this.bimfishApp.viewer.disableSelection(false)
      this.visible = true
      this.anmititle = '编辑动画方案'
      this.editId = item.id
    },
    // 获取动画列表
    async getAnimationList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimCartoonList(form)
      this.filterList = res.data
      this.filterListCopy = JSON.parse(JSON.stringify(res.data))
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
.flex-base {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  i.cursor {
    color: #2e79cc;
    font-size: 22px;
    line-height: 32px;
  }
}
.list {
  &-item {
    margin-top: 10px;
    line-height: 40px;
    border: 1px solid lightgray;
    border-radius: 5px;
    position: relative;
    padding: 0 4px;
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
      width: 30%;
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
</style>
