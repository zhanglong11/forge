<!--
 * @Description: 选择文件，从文件管理中选择
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-03-15 20:27:55
 * @LastEditTime: 2020-05-22 09:07:35
 -->

<template>
  <el-dialog v-dialogDrag :lock-scroll="false" width="800px" append-to-body :visible="visible" @close="closeDialog">
    <el-tabs v-model="filterForm.departmentId">
      <el-tab-pane v-for="e in departmentList" :key="e.id" :name="e.id" :label="e.name"></el-tab-pane>
    </el-tabs>
    <el-breadcrumb separator="/" style="margin: 5px 0;">
      <el-breadcrumb-item>
        <el-button
          type="text"
          @click="
            () => {
              pathList = []
              refresh()
            }
          "
          >根目录</el-button
        >
      </el-breadcrumb-item>
      <el-breadcrumb-item v-for="(e, index) in pathList" :key="e.id">
        <el-button v-if="index !== pathList.length - 1" type="text" @click="pathList.splice(index + 1, 1)">
          {{ e.name }}</el-button
        >
        <el-button v-else type="text">
          <span style="color:#333;">{{ e.name }}</span>
        </el-button>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <vxe-grid
      ref="table"
      v-loading="loading"
      :data="list"
      :checkboxConfig="{
        checkMethod: ({ row }) => row.type === 2
      }"
      @checkbox-change="({ selection }) => (selectedList = selection)"
    >
      <vxe-table-column type="checkbox" width="60"></vxe-table-column>
      <vxe-table-column
        width="60px"
        title="类型"
        field="type"
        :formatter="({ cellValue: type }) => ['文件夹', '文件'][type - 1]"
      ></vxe-table-column>
      <vxe-table-column title="名称">
        <template v-slot="{ row }">
          <el-button v-if="row.type === 1" type="text" @click="pathList.push(row)">{{ row.name }}</el-button>
          <span v-else>{{ row.name }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column width="120px" title="文件大小" field="fileSize">
        <template slot-scope="{ row }">
          <div>
            {{ row.fileSize ? filesize(row.fileSize) : null }}
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column width="100px" title="上传人" field="createName"></vxe-table-column>
      <vxe-table-column width="160px" title="上传时间" field="createTime"></vxe-table-column>
    </vxe-grid>
    <footer slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :disabled="!selectedList.length" @click="submit">确定</el-button>
    </footer>
  </el-dialog>
</template>

<script>
import filesize from 'filesize'
import api from '@/api/design/file'
export default {
  name: 'SelectFile',
  props: {
    addTableFlag: {
      type: Boolean,
      default: false
    },
    // 任务id
    taskUniqueId: {},
    // 显示flag
    visible: {
      type: Boolean,
      default: false
    },
    // 是否只能选择一个文件
    onlyOne: {},
    // 过滤条件
    filterCondition: {
      type: Function
    }
  },
  data() {
    return {
      loading: false,
      filterForm: {
        departmentId: null,
        module: 'unit',
        isClickQuery: 0
      },
      departmentList: [],
      pathList: [],
      list: [],
      selectedList: [],
      dropList: []
    }
  },
  computed: {
    userInfo() {
      if (_.isEmpty(this.$store.state.user.userInfo)) {
        this.$store.dispatch('user/getInfo')
      }
      return this.$store.state.user.userInfo
    }
  },
  watch: {
    pathList(val) {
      _.size(val) && this.refresh()
    },
    visible(val) {
      console.log('显示状态' + val)
      this.selectedList = []
      val && this.getDepartmentList()
    },
    userInfo() {}
  },
  methods: {
    closeDialog() {
      this.$emit('close')
    },
    getDepartmentList() {
      api.getFirstList({ projectId: localStorage.getItem('projectId') }).then(res => {
        console.log(res)
        let arr = []
        if (res.data && res.data.length > 0) {
          if (this.userInfo.companyAdminFlag) {
            arr = res.data
          } else {
            arr = res.data.filter(item => {
              return item.userList.some(child => child.id === this.userInfo.id)
            })
          }
        }
        this.departmentList = arr
        this.filterForm.departmentId = _.first(arr)?.id
        this.pathList = []
        this.refresh()
      })
    },
    filesize,
    refresh() {
      this.$refs.table && this.$refs.table.setAllCheckboxRow(false)
      this.loading = true
      let form = Object.assign({}, this.filterForm, {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId,
        pid: _.get(_.last(this.pathList), 'id', 0)
      })
      api
        .getFileList(form)
        .then(res => {
          if (this.filterCondition) {
            // 这里应该最少有两个条件，即为已经轻量化的文件，另一个是额外的
            this.list = this.filterCondition(res.data)
          } else {
            this.list = res.data
          }
        })
        .finally(() => (this.loading = false))
    },
    submit() {
      if (this.onlyOne && this.selectedList.length !== 1) return this.$message.error('只能选择一个文件')
      if (
        this.selectedList.every(
          item =>
            item.name.indexOf('.rvt') > -1 ||
            item.name.indexOf('.p3d') > -1 ||
            item.name.indexOf('.dwg') > -1 ||
            item.name.indexOf('.stp') > -1
        )
      ) {
        this.$emit('change', this.selectedList)
        this.$emit('update:visible', false)
      } else {
        this.$message.error('只能选择rvt、p3d、dwg、stp格式的文件')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tabs /deep/ .el-tabs__header {
  margin-bottom: 0;
}
</style>
