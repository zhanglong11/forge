<!--
 * @Description: 项目大事记
 * @Author:
 * @Date: 2020-01-19 08:58:04
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
  <div>
    <div class="form">
      <el-form ref="pageQuery" :model="pageQuery" label-width="100px">
        <el-row :gutter="3">
          <el-col :span="6">
            <el-form-item label="标题" prop="title">
              <el-input v-model="pageQuery.title"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
              <el-button icon="el-icon-refresh-right" @click="reset">重置</el-button>
              <el-button v-if="$access('BreakingNew')" type="primary" @click="add">新建大事记</el-button>
              <el-button v-if="$access('BreakingNewPreview')" type="primary" @click="preview">大事记预览</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <Table
      ref="table"
      v-loading="tableLoading"
      :tableData="tableData"
      :pageQuery="pageQuery"
      :total="total"
      rowId="id"
      :columns="tableColumn"
      @selectionChange="selectionChange"
      @getList="getList"
      @pageChange="pageChange"
      @sizeChange="sizeChange"
    />
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="newsVisible" width="60%">
      <p class="news-title">{{ newsContent.title }}</p>
      <div class="news-content" v-html="newsContent.content"></div>
    </el-dialog>
  </div>
</template>
<script>
import PageMixin from '@/mixins/pageMixin'
import api from '@/api/design/dynamic'
export default {
  mixins: [PageMixin],
  data() {
    return {
      pageQuery: { projectId: localStorage.getItem('projectId'), title: '' },
      tableColumn: [
        { prop: 'createTime', label: '时间' },
        { prop: 'creatorName', label: '发布人' },
        { prop: 'title', label: '标题' },
        {
          prop: 'handle',
          label: '操作',
          render: (h, { row }) => {
            return h('div', [
              this.$access('NewsDetail')
                ? h(
                    'el-button',
                    {
                      props: {
                        type: 'text'
                      },
                      on: {
                        click: e => {
                          e.stopPropagation()
                          this.getDetails(row.id)
                        }
                      }
                    },
                    '详情'
                  )
                : null,
              this.$access('NewsEdit')
                ? h(
                    'el-button',
                    {
                      props: {
                        type: 'text'
                      },
                      on: {
                        click: e => {
                          e.stopPropagation()
                          this.edit(row.id)
                        }
                      }
                    },
                    '编辑'
                  )
                : null,
              this.$access('NewsDelete')
                ? h(
                    'el-button',
                    {
                      props: {
                        type: 'text'
                      },
                      on: {
                        click: e => {
                          e.stopPropagation()
                          this.$confirm('是否要删除此大事记', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                          }).then(() => {
                            this.deleteSure(row.id)
                          })
                        }
                      }
                    },
                    '删除'
                  )
                : null
            ])
          }
        }
      ],
      request: api.getBreakList,
      newsContent: {},
      newsVisible: false
    }
  },
  methods: {
    preview() {
      if (this.tableData.length === 0) return this.$message.error('尚没有大事记')
      this.$router.push({ name: 'BreakingNewPreview' })
    },
    add() {
      this.$router.push({ name: 'BreakingNew' })
    },
    async getDetails(id) {
      let res = await api.breakingNewsDetails(id)
      this.newsContent = res.data
      this.newsVisible = true
    },
    edit(id) {
      this.$router.push({
        name: 'BreakingNew',
        query: {
          id: id
        }
      })
    },
    async deleteSure(id) {
      let res = await api.deleteBreak(id)
      this.$message.success('删除成功')
      this.getList()
    }
  }
}
</script>
<style lang="less" scoped>
.news-title {
  text-align: center;
  font-size: 23px;
  font-weight: 800;
}
.news-content {
  max-height: 400px;
}
</style>
