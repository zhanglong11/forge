<template>
  <div class="container">
    <vxe-grid
      ref="vxeTable"
      :max-height="maxHeight"
      :max-width="maxWidth"
      align="center"
      highlight-hover-row
      :resizable="resizable"
      :data="tableData"
      :columns="columns"
      :row-id="rowId"
      @select-change="selectionChange"
      @select-all="selectionChange"
      @radio-change="radioChange"
    />
    <!--分页栏-->
    <div v-if="pageShow" class="toolbar">
      <div class="num">
        共 {{ total }} 条记录 第 {{ pageQuery.page }} / {{ Math.ceil(total / pageQuery.rows) }} 页
        <el-button type="text primary" class="el-icon-refresh" @click="update"></el-button>
      </div>
      <el-pagination
        :page-sizes="pageSizes"
        class="pagination"
        background
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
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'SrmTable',
  props: {
    // 是否显示page组件
    pageShow: {
      type: Boolean,
      default: true
    },
    //是否可拖拽
    resizable: {
      type: Boolean,
      default: false
    },
    // table主键
    rowId: {},
    // 列表数据
    tableData: {
      type: Array,
      required: true
    },
    // 数据总数
    total: {
      type: Number,
      default: 0
    },
    // 定义列
    columns: {
      type: Array,
      required: true
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 是否可选择行
    selectVisible: {
      type: Boolean,
      default: true
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
      default: () => [10, 20, 30, 40]
    },
    // 最大高度
    maxHeight: {},
    maxWidth: {}
  },
  data() {
    return {
      downloadLoading: false,
      // 当前选择项的集合
      selections: []
    }
  },
  computed: {
    layout() {
      const layout = ['prev', 'pager', 'next', 'sizes', 'jumper']

      return layout.join(', ')
    }
  },
  watch: {
    tableData: function(val) {
      scrollTo(0, 0)
    }
  },
  methods: {
    setSelection(rows, checked) {
      this.$refs.vxeTable.setSelection(rows, checked)
    },
    setAllSelection(flag) {
      this.$refs.vxeTable.setAllSelection(flag)
    },
    // 已选项
    selectionChange(selections) {
      this.selections = selections
      this.$emit('selectionChange', selections.selection)
    },
    //单选
    radioChange(table) {
      this.$emit('radioChange', table.row)
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
    },
    update() {
      this.$emit('getList')
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  padding: 0 15px;
}
.table-img {
  cursor: pointer;
}
.toolbar {
  margin-top: 15px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  .num {
    font-size: 13px;
    color: #606266;
    // width: 30%;
  }
  .pagination {
    // width: 70%;
  }
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
<style>
.el-pagination__jump {
  margin-left: 0;
}
</style>
