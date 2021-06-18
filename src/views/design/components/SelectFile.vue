<!--
 * @Description:
 * @Version:
 * @Autor: 李建敏
 * @Date: 2020-03-15 20:59:05
 * @LastEditTime: 2020-03-16 17:55:50
 * 修改人：申豪强
 * 修改内容：新增taskUniqueId，作为一般会议的参数
 * 时间：2020-03-15
 -->

<!--
/*
 弹框的改进：2512
 任务描述 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改：
 1、弹框可移动。
 2、遮挡的页面支持鼠标滚轮上下移动。
 开发人员：李建敏
 日期：2020-3月-16日
 任务类型：2、复制修改代码 1行
*/
-->

<template>
  <el-dialog
    v-dialogDrag
    :lock-scroll="false"
    width="800px"
    append-to-body
    :visible="visible"
    @close="$emit('update:visible', false)"
  >
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
      <vxe-table-column
        width="120px"
        title="文件大小"
        field="fileSize"
        :formatter="({ cellValue }) => filesize(cellValue)"
      ></vxe-table-column>
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
  props: ['milestone', 'visible', 'taskUniqueId'],
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
      selectedList: []
    }
  },
  /**
   bug名称：1347/  任务管理-发起会议-添加文件时的访问权限应该与文件区权限一致
   开发人员：李建敏
   日期：2020-3月-31日
   任务类型：1、修改（5行）
   **/
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  watch: {
    'filterForm.departmentId'() {
      this.pathList = []
      this.refresh()
    },
    pathList(val) {
      _.size(val) && this.refresh()
    },
    visible(val) {
      val && this.getDepartmentList()
    }
  },
  methods: {
    /**
     bug名称：1347/  任务管理-发起会议-添加文件时的访问权限应该与文件区权限一致
     开发人员：李建敏
     日期：2020-3月-31日
     任务类型：1、修改（5行）
     **/
    /**
     任务名称：2868/修改bug
     开发人员：李建敏
     日期：2020-3月-2日
     任务类型：2、复制修改代码 （8行）
     **/
    getDepartmentList() {
      api.getFirstList({ projectId: localStorage.getItem('projectId') }).then(res => {
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
      })
    },
    filesize,
    refresh() {
      this.$refs.table && this.$refs.table.setAllCheckboxRow(false)
      this.loading = true
      let form = Object.assign({}, this.filterForm, {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.milestone ? this.milestone.taskUniqueId : this.taskUniqueId,
        pid: _.get(_.last(this.pathList), 'id', 0),
        isClickQuery: 0
      })
      api
        .getFileList(form)
        .then(res => {
          this.list = res.data
        })
        .finally(() => (this.loading = false))
    },
    submit() {
      this.$emit('change', this.selectedList)
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
.el-tabs /deep/ .el-tabs__header {
  margin-bottom: 0;
}
</style>
