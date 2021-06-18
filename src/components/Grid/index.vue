<template>
  <div class="container">
    <vxe-grid
      ref="xTable"
      v-loading="loading"
      :highlightCurrentRow="highlightCurrentRow"
      tree-config
      :align="align"
      :data="tableData || list"
      row-id="id"
      :checkbox-change="data => $emit('checkboxChange', data)"
      @current-change="(obj, event) => $emit('current-change', obj, event)"
    >
      <slot />
    </vxe-grid>
    <div v-if="pagination" class="page-wrap">
      <span>
        共 {{ total }} 条记录 第 {{ pageOption.page }} / {{ Math.ceil(total / pageOption.rows) }} 页
        <el-button type="text primary" class="el-icon-refresh" @click="() => refresh()"></el-button>
      </span>
      <el-pagination
        :total="total"
        :page-size.sync="pageOption.rows"
        :current-page.sync="pageOption.page"
        layout="prev, pager, next, jumper, sizes"
        @current-change="refresh"
        @size-change="refresh"
      />
    </div>
  </div>
</template>
<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Grid',
  props: {
    align: {
      type: String,
      default: 'center'
    },
    //是否分页
    pagination: {
      type: Boolean,
      default: true
    },
    tableData: {
      type: [Boolean, Array],
      default: false
    },
    // 是否立即刷新列表
    immediate: {
      type: Boolean,
      default: true
    },
    request: Function,
    filterForm: {
      type: Object,
      default() {
        return {}
      }
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      pageOption: {
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    if (this.request && this.immediate) {
      this.initFilterForm = _.cloneDeep(this.filterForm)
      this.refresh()
    }
  },
  methods: {
    refresh() {
      this.loading = true
      if (!_.isEqual(this.prevFilterForm, this.filterForm)) {
        this.pageOption.page = 1
      }
      this.prevFilterForm = _.cloneDeep(this.filterForm)
      let body = _.cloneDeep(this.filterForm)
      if (this.pagination) Object.assign(body, this.pageOption)
      return this.request(body)
        .then(res => {
          if (this.pagination) {
            const { total, records, list } = res
            this.total = total
            this.list = records || list
          } else {
            this.list = res
            this.total = res.length
          }
          this.$emit('change', this.list)
        })
        .finally(() => (this.loading = false))
    },
    async reset() {
      this.$emit('update:filterForm', _.cloneDeep(this.initFilterForm))
      this.pageOption.page = 1
      await this.$nextTick()
      this.refresh()
    }
  }
}
</script>
<style lang="less" scoped>
.page-wrap {
  display: flex;
  justify-content: space-between;
  align-content: center;
  margin-top: 12px;

  .el-button {
    padding-top: 0;
    padding-bottom: 0;
  }
  > span {
    color: #888;
    font-size: 14px;

    .el-button {
      margin-left: 5px;
      transform: scale(1.4);
    }
  }
}

.el-pagination {
  padding-right: 0;
  text-align: right;
  > span {
    color: #888;
    font-size: 14px;

    .el-button {
      margin-left: 5px;
      transform: scale(1.5);
    }
  }
  /deep/ .el-pagination__sizes {
    margin-right: 0;
    margin-left: 10px;
  }
  /deep/ .el-select .el-input {
    margin-right: 0;
  }
}
</style>
