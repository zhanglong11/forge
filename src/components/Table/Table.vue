<template>
  <div class="container">
    <el-table
      ref="elTable"
      v-loading="loading"
      :data="tableData"
      :row-key="rowKey"
      style="width: 100%"
      @selection-change="selectionChange"
      @row-click="rowClick"
    >
      <el-table-column v-if="seq" align="center" width="60px" label="序号">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <slot />
      <template v-for="(column, index) in columns">
        <el-table-column
          v-if="column.render"
          :key="column.prop"
          :label="column.label"
          :width="column.width"
          align="center"
        >
          <template slot-scope="scope">
            <Render :row="scope.row" :index="index" :render="column.render" />
          </template>
        </el-table-column>
        <slot v-else-if="column.slot" :name="column.slot" />
        <el-table-column v-else :key="column.prop" v-bind="setAttrs(column)" />
      </template>
    </el-table>
    <!--分页栏-->
    <div class="toolbar">
      <el-pagination
        v-if="!request"
        v-show="total > pageQuery.rows"
        :page-sizes="pageSizes"
        class="pagination"
        :layout="layout"
        :total="total"
        :page-size="pageQuery.rows"
        :current-page.sync="pageQuery.page"
        @current-change="pageChange"
        @size-change="sizeChange"
      />
    </div>
  </div>
</template>
<script>
import Render from './Render'
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Table',
  components: {
    Render
  },
  props: {
    align: {
      type: String,
      default: 'center'
    },
    // 是否显示序号
    seq: {
      type: Boolean,
      default: false
    },
    // table主键
    rowKey: {
      type: String,
      default: 'id'
    },
    // 列表数据
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    // 数据总数
    total: {
      type: Number,
      default: 0
    },
    // 定义列
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 分页查询参数
    pageQuery: {
      type: Object,
      default: () => ({
        page: 1,
        rows: 10
      })
    },
    // 每页条数选择器
    pageSizes: {
      type: Array,
      default: () => []
    },

    request: Function
  },
  data() {
    return {
      downloadLoading: false
    }
  },
  computed: {
    layout() {
      const layout = ['total', 'prev', 'pager', 'next']
      if (this.pageSizes.length) {
        layout.push('sizes')
      }
      return layout.join(', ')
    }
  },
  watch: {
    tableData: function() {
      scrollTo(0, 0)
    }
  },
  created() {
    if (this.request) {
      this.refresh()
    }
  },
  methods: {
    rowClick(row, column) {
      let target = this.tableData.findIndex(item => item.id === row.id)
      this.$refs.elTable.toggleRowSelection(this.tableData[target])
    },
    // 取消全部选择内容
    setAllSelection(flag) {
      this.$nextTick(() => {
        this.$refs.elTable.clearSelection()
      })
    },
    // 多选切换单行选中状态
    setSelection(row, checked, id) {
      this.$nextTick(() => {
        let target = this.tableData.findIndex(item => item.id === id)
        this.$refs.elTable.toggleRowSelection(this.tableData[target], checked)
      })
    },
    // 已选项
    selectionChange(selections) {
      this.$emit('selectionChange', selections)
    },
    // 切换页面
    pageChange(page) {
      this.$emit('pageChange', page)
    },
    sizeChange(size) {
      this.$emit('sizeChange', size)
    },
    setAttrs(params) {
      // eslint-disable-next-line
      const { slot, ...options } = params
      if (!options.align) {
        options.align = 'center'
      }
      return { ...options }
    }
  }
}
</script>
<style lang="scss" scoped>
.table-img {
  cursor: pointer;
}
.toolbar {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  .handle-wrap {
    position: absolute;
    left: 0;
  }
}
.handle-wrap {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 15px;
}
* + .table-export_btn {
  margin-left: 15px;
}
</style>
