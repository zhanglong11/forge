<!--
 * @Description: 外部协作
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-03-15 20:59:05
 * @LastEditTime: 2020-04-14 15:08:05
 * 修改代码：a标签新页面打开、文件管理-按照起止时间查询-重置-再选择时间时出错
 -->

<template>
  <div>
    <el-form ref="pageQuery" :model="pageQuery" label-width="80px" class="search-form">
      <el-row :gutter="4">
        <el-col :span="6">
          <el-form-item label="文件名称" prop="name">
            <el-input v-model="pageQuery.name" placeholder="文件名称" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="起止时间">
            <el-date-picker
              v-model="time"
              style="width:100%"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-refresh-right" @click="reset">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <!-- <button class="btn" @click="copy('test')">
      Copy to clipboard
    </button> -->
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
    >
      <el-table-column label="名称" prop="name" align="center"></el-table-column>
      <el-table-column label="创建人名称" prop="creatorName" align="center"></el-table-column>
      <el-table-column label="有效期（天）" prop="indate" align="center"></el-table-column>
      <el-table-column label="失效时间" prop="loseEfficacyTime" align="center"></el-table-column>
      <!-- 写在data中不能复制 -->
      <el-table-column label="提取码" prop="password" align="center">
        <template slot-scope="scope">
          <a href="javascript:;" class="tag" @click="copy(scope.row.password)">{{ scope.row.password }}</a>
        </template>
      </el-table-column>
      <!--
      * @任务编号: 1173 || 新页面打开
      * @开发人员:申豪强
      * @日期:2020-03-16
      * @bug类型: 需求调整
      -->
      <el-table-column label="分享链接" prop="url" align="center">
        <template slot-scope="{ row }">
          <a :href="row.url" title="点击复制" target="_blank">{{ row.url }}</a>
        </template>
      </el-table-column>
    </Table>
    <!--
      * @任务编号: 2795 || 分享链接支持延期。加上“编辑”按钮，可重新调整名称、有效期等
      * @开发人员:申豪强
      * @日期:2020-04-02
      * @代码类型: 需求调整
      -->
    <!-- 外部协作弹框 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="editVisible" title="编辑" @close="editClose">
      <el-form ref="editForm" :model="editForm" label-width="120px" :rules="editFormRules">
        <el-form-item label="分享题目" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="有效期(天)" prop="indate">
          <el-input-number v-model="editForm.indate" :min="1" :precision="0" :controls="false"></el-input-number>
        </el-form-item> -->
        <el-form-item label="有效期至" prop="indate">
          <el-input v-model="editForm.indate" style="display:none"></el-input>
          <!-- task#2795 等待后台修改参数,将有效期修改为日期 -->
          <el-date-picker
            v-model="editForm.indate"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder="选择日期时间"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editSureJudge">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import PageMixin from '@/mixins/pageMixin'
import api from '@/api/design/file'
import Clipboard from 'clipboard'
export default {
  mixins: [PageMixin],
  props: {
    // 里程碑id
    taskUniqueId: {}
  },
  data() {
    return {
      // 编辑弹框标志
      editVisible: false,
      // 编辑
      editForm: {
        fileIds: [],
        folderIds: [],
        indate: null,
        name: null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId,
        indateDate: null
      },
      // 规则
      editFormRules: {
        indate: [{ required: true, message: '请输入', trigger: 'blur' }],
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      time: null,
      copyContent: '',
      clipOptions: {
        copyContent: this,
        value: '',
        success: e => {
          this.$message.success('复制成功')
        },
        error: () => {
          this.$message.error('复制失败')
        }
      },
      tableColumn: [
        // { prop: 'name', label: '名称' },
        // {
        //   prop: 'createTime',
        //   label: '创建时间'
        // },
        // {
        //   prop: 'creatorName',
        //   label: '创建人名称'
        // },
        // {
        //   prop: 'indate',
        //   label: '有效期（天）'
        // },
        // {
        //   prop: 'loseEfficacyTime',
        //   label: '失效时间'
        // },
        // {
        //   prop: 'password',
        //   label: '提取码',
        //   render: (h, { row }) => {
        //     return h(
        //       'a',
        //       {
        //         props: {},
        //         attrs: {
        //           href: 'JavaScript:;',
        //           title: '点击复制',
        //           'data-clipboard-text': row.password
        //         },

        //         on: {
        //           click: e => {
        //             e.stopPropagation()
        //             this.copyContent = row.password
        //             this.copy(row.password)
        //           }
        //         }
        //         // directives: [
        //         //   {
        //         //     name: 'copy',
        //         //     value: this.clipOptions
        //         //   }
        //         // ]
        //       },
        //       row.password
        //     )
        //   }
        // },
        // {
        //   prop: 'url',
        //   label: '分享链接',
        //   render: (h, { row }) => {
        //     return h(
        //       'a',
        //       {
        //         props: {},
        //         attrs: {
        //           href: row.url,
        //           target: '_blank'
        //         },
        //         on: {
        //           click: e => {
        //             e.stopPropagation()
        //             // window.location.href = row.url
        //           }
        //         }
        //       },
        //       row.url
        //     )
        //   }
        // },
        {
          label: '操作',
          render: (h, { row }) => {
            return h('div', [
              this.$access('CollaborationDelete')
                ? h(
                    'el-button',
                    {
                      props: {
                        type: 'text'
                      },
                      on: {
                        click: e => {
                          e.stopPropagation()
                          this.$confirm('是否要删除此文件/文件夹', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                          })
                            .then(() => {
                              this.deleteOut(row.id)
                            })
                            .catch(() => {
                              //几点取消的提示
                            })
                        }
                      }
                    },
                    '删除'
                  )
                : null,
              /*
               * @任务编号: 2795 || 分享链接支持延期。加上“编辑”按钮，可重新调整名称、有效期等
               * @开发人员:申豪强
               * @日期:2020-04-02
               * @代码类型: 需求调整
               */
              this.$access('CollaborationEdit')
                ? h(
                    'el-button',
                    {
                      props: {
                        type: 'text'
                      },
                      on: {
                        click: e => {
                          e.stopPropagation()
                          this.editVisible = true
                          let copy = JSON.parse(JSON.stringify(row))
                          this.editForm.indate = copy.indate
                          this.editForm.name = copy.name
                        }
                      }
                    },
                    '编辑'
                  )
                : NULL
            ])
          }
        }
      ],
      request: api.externalCollaborationList,
      pageQuery: {
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: null
      },
      requestFlag: false
    }
  },
  watch: {
    taskUniqueId(val) {
      this.pageQuery.taskUniqueId = this.taskUniqueId
      this.getList()
    },

    time(val) {
      if (val && val[0] !== null) {
        this.pageQuery.startDate = moment(val[0]).format('YYYY-MM-DD HH:MM:SS') || ''
        this.pageQuery.endDate = moment(val[1]).format('YYYY-MM-DD HH:MM:SS') || ''
      } else {
        this.pageQuery.startDate = ''
        this.pageQuery.endDate = ''
      }
    }
  },
  methods: {
    /*
     * @任务编号: 2795 || 分享链接支持延期。加上“编辑”按钮，可重新调整名称、有效期等
     * @开发人员:申豪强
     * @日期:2020-04-02
     * @代码类型: 需求调整
     */
    editClose() {
      this.editVisible = false
      this.$nextTick(() => {
        this.editForm = {
          fileIds: [],
          folderIds: [],
          indate: null,
          name: null,
          projectId: localStorage.getItem('projectId'),
          taskUniqueId: this.taskUniqueId
        }
      })
    },
    async editSureJudge() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.editSureSubmit()
        }
      })
    },
    editSureSubmit() {},
    reset() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.pageQuery.isClickQuery = 0
      this.time = null
      this.setAllSelection()
      if (this.$refs.pageQuery) {
        this.$refs.pageQuery.resetFields()
      }
      this.search()
    },
    copy(e) {
      let clipboard = new Clipboard('.tag', {
        text: function() {
          return e
        }
      })
      clipboard.on('success', e => {
        this.$message({ message: '复制成功', showClose: true, type: 'success' })
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        this.$message({ message: '复制失败,', showClose: true, type: 'error' })
        clipboard.destroy()
      })
    },
    async deleteOut(id) {
      let res = await api.deleteOut(id)
      this.$message.success('删除成功')
      this.getList()
    },
    getList() {
      this.pageQuery.taskUniqueId = this.taskUniqueId
      if (!this.taskUniqueId) return
      this.tableLoading = true
      this.request(this.pageQuery)
        .then(res => {
          // 基于接口统一处理
          this.tableLoading = false
          this.tableData = res.data.list ? res.data.list : res.data.records ? res.data.records : []
          //每个数据新增页码标志：便于对比
          this.tableData.forEach(e => {
            e.page = this.pageQuery.page
          })
          this.total = res.data.total ? res.data.total : 0
        })
        .catch(error => {
          this.tableLoading = false
        })
    }
  }
}
</script>
<style lang="less" scoped>
.search-form {
  padding-top: 20px;
}
</style>
