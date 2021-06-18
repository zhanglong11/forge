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
<!--
/**
任务名称：2936/设计模块审批功能添加文件列表
开发人员：李建敏
日期：2020-4月-13日
任务类型：2.修改代码（1行）
**/
-->
<template>
  <div>
    <div class="tooltips">
      <div>
        <el-button
          v-if="$access('ProcessAdd')"
          type="primary"
          @click="
            () => {
              activeId = null
              editDialogVisible = true
            }
          "
          >新建</el-button
        >
        <el-button v-if="$access('ProcessCategoryAdd')" @click="categoryDialogVisible = true">分类管理</el-button>
      </div>
    </div>
    <Grid ref="table" :immediate="false" :request="request">
      <vxe-table-column title="名称" field="processName"></vxe-table-column>
      <vxe-table-column
        width="180px"
        title="分类"
        field="processGroupId"
        :formatter="
          ({ cellValue }) => _.get(_.find($store.state.design.processGroupList, { id: cellValue }), 'groupName', '未知')
        "
      ></vxe-table-column>
      <vxe-table-column width="80px" title="创建人" field="creatorName"></vxe-table-column>
      <vxe-table-column width="150px" title="创建时间" field="createTime"></vxe-table-column>
      <vxe-table-column width="150px" title="最后修改时间" field="updateTime"></vxe-table-column>
      <vxe-table-column width="120px" title="操作">
        <template slot-scope="{ row }">
          <el-button
            v-if="$access('ProcessEdit')"
            type="text"
            @click="
              () => {
                activeId = row.id
                editDialogVisible = true
              }
            "
            >编辑</el-button
          >
        </template>
      </vxe-table-column>
    </Grid>

    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      destroy-on-close
      title="分类管理"
      width="600px"
      :visible.sync="categoryDialogVisible"
    >
      <Category></Category>
    </el-dialog>

    <Edit :id="activeId" :visible.sync="editDialogVisible"></Edit>
  </div>
</template>

<script>
import Category from './components/Category'
import Edit from './components/Edit'
export default {
  name: 'Process',
  components: { Category, Edit },
  data() {
    return {
      activeId: null,
      categoryDialogVisible: false,
      editDialogVisible: false,
      filterForm: {
        name: '',
        type: 1,
        projectId: localStorage.getItem('projectId')
      },
      request(body) {
        return this.axios.design.post('process/template/list', body).then(res => res.data)
      }
    }
  },
  async created() {
    await this.$store.dispatch('design/getProcessGroup')
    this.refresh()
  },
  methods: {
    refresh() {
      this.$refs.table.refresh()
    }
  }
}
</script>

<style scoped lang="less"></style>
