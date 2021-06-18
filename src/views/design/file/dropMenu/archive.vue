<!--
 * @Description: 存档区
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-02-21 09:18:49
 * @LastEditTime: 2020-04-23 09:48:10
 * 修改时间bug、文件管理-按照起止时间查询-重置-再选择时间时出错
 -->
<template>
  <div class="drop-table">
    <el-form ref="pageQuery" :model="pageQuery" label-width="80px" style="padding-top:10px">
      <el-row :gutter="4">
        <el-col :span="6">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="pageQuery.keyword" placeholder="文件名称/标签/上传人" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="起止时间" prop="time">
            <el-date-picker
              v-model="pageQuery.time"
              style="width:100%"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="操作">
            <el-select v-model="operation" clearable placeholder="操作" style="width:100%" @change="handleChange">
              <el-option
                v-for="e in operationList"
                :key="e.value"
                :label="e.label"
                :value="e.value"
                :disabled="!$access(e.powerkey)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="分享">
            <el-select v-model="share" clearable placeholder="分享" style="width:100%" @change="shareChange">
              <el-option v-for="e in shareList" :key="e.value" :label="e.label" :value="e.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item style="text-align:right" label-width="10px">
            <el-button type="primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
            <el-button icon="el-icon-refresh-right" @click="reset">重置</el-button>
            <!-- task#2795 存档区自建文件夹隐藏，暂时只做会议存档。 申豪强 2020-04-02 -->
            <!-- <el-button  type="primary" @click="creatFolder"
              >新建文件夹</el-button
            >-->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 面包屑 -->
    <Breadcrumb
      ref="breadcrumb"
      :taskTitle="taskTitle"
      :departmentId="departmentId"
      :taskUniqueId="taskUniqueId"
      :module="module"
      :targetObj="targetObj"
      @updateTable="updateTableReset"
    />

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
    <!-- 新建文件夹+更改文件名 -->
    <AddNew ref="addNew" @updateTable="getList" @updateTree="updateTree" />
    <!-- 内部分享操作 -->
    <Share
      ref="share"
      :module="module"
      :taskUniqueId="taskUniqueId"
      :departmentId="departmentId"
      :selectedList="selectedList"
      @success="share = null"
    />
    <!-- 复制、移动 -->
    <Move
      ref="move"
      :selectedList="selectedList"
      :taskUniqueId="taskUniqueId"
      :module="module"
      :departmentId="departmentId"
      @success="operation = null"
    />
  </div>
</template>
<script>
import Move from '../components/Move'
import AddNew from '../components/AddNew'
import filesize from 'filesize'
import api from '@/api/design/file'
import TypeList from '@/lib/fileTypeList'
import PageMixin from '@/mixins/pageMixin'
import treeFilter from '@/utils/treeFilter'
import treeFindPath from '@/utils/treeFindPath'
import contentDisposition from 'content-disposition'
import Breadcrumb from '../components/Breadcrumb'
import Share from '../components/Share'
import indexApi from '@/api/design/index'
import preview from '@/utils/preview'
export default {
  components: {
    Breadcrumb,
    AddNew,
    Share,
    Move
  },
  mixins: [PageMixin],
  props: {
    // 一级单位id
    departmentId: {},
    // 里程碑id
    taskUniqueId: {},
    module: {},
    // 里程碑标题
    taskTitle: {},
    // 当前位置name
    targetObj: {}
  },
  data() {
    return {
      // 分享form
      shareForm: {
        fileIds: [],
        folderIds: [],
        indate: null,
        name: null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId,
        url: window.location.origin + '/share'
      },
      shareFormRules: {
        indate: [{ required: true, message: '请输入', trigger: 'blur' }],
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      shareVisible: false,
      // 这是本单位节点树
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 复制、移动、内部分享参数
      moveProps: {
        fileIdList: [],
        folderIdList: [],
        operateType: '',
        targetFolderId: ''
      },
      operation: '',
      share: '',
      // 上传文件id
      commonFileId: '',

      inputVisible: false,
      inputValue: '',
      requestFlag: false,
      // tag列表
      dynamicTags: [],
      // 新增文件夹
      creatFolderForm: {
        departmentId: null, //一级id
        fileTag: '',
        id: '',
        name: '',
        pid: '',
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: '' //里程碑id
      },
      typeList: TypeList,
      operationList: [
        {
          label: '复制到',
          value: 1,
          powerkey: 'PigeonholeCopy'
        }
      ],
      shareList: [
        {
          label: '内部共享',
          value: 1,
          access: 'in-share'
        },
        {
          label: '外部协作',
          value: 2,
          access: 'out-share'
        }
      ],
      time: null,
      // 查询参数
      pageQuery: {
        time: null,
        // 是否是通过查询按钮搜索的
        isClickQuery: 0,
        type: null,
        startDate: '',
        endDate: '',
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: '',
        departmentId: null,
        pid: '',
        module: '',
        keyword: ''
      },
      // 权限
      accessList: [
        {
          name: '存档区',
          value: 'design-file-archived-'
        },
        {
          name: '自定义区',
          value: 'design-file-defined-'
        },
        {
          name: '内部共享',
          value: 'design-file-share-'
        },
        {
          name: '外部协作',
          value: 'design-file-cooperation-'
        }
      ],
      // 需要自己做分页
      tableDataAll: [],
      tableData: [],
      // 表格表头
      tableColumn: [
        { type: 'selection', width: 50 },
        {
          prop: 'name',
          label: '文件名称',
          width: 80,
          render: (h, params) => {
            if (params.row.type === 1) {
              return h(
                'a',
                {
                  props: {
                    href: 'javascript:;'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation()
                      this.pageQuery.isClickQuery = 0
                      this.$refs.breadcrumb.getHistoryPath(params.row.id, params.row.name)
                      this.updateTable(params.row.id)
                    }
                  }
                },
                params.row.name
              )
            } else if (params.row.name.indexOf('.rvt') > -1 || params.row.name.indexOf('.dwg') > -1) {
              return h(
                'a',
                {
                  props: {
                    href: 'javascript:;'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation()
                      if (row.dexpStatus === 0 || _.isNull(row.dexpStatus)) {
                        return this.$message.error('文件还未轻量化，点击操作区轻量化按钮进行操作')
                      } else if (row.dexpStatus === 3) {
                        return this.$message.error('文件轻量化失败，点击操作区轻量化按钮尝试重新操作')
                      }
                      this.lightWeight(params.row)
                    }
                  }
                },
                params.row.name
              )
            } else {
              return h(
                'a',
                {
                  props: {
                    href: 'javascript:;'
                  },

                  on: {
                    click: e => {
                      e.stopPropagation()
                      this.preview(params.row)
                    }
                  }
                },
                params.row.name
              )
            }
          }
        },
        { prop: 'fileTag', label: '标签' },
        {
          prop: 'fileSize',
          label: '大小',
          render: (h, { row }) => {
            if (row.type === 1) {
              return h('div', {}, '-')
            } else {
              return h('div', {}, filesize(row.fileSize))
            }
          }
        },
        { prop: 'createName', label: '上传人' },
        { prop: 'createTime', label: '上传时间' },
        {
          prop: '',
          label: '操作',
          render: (h, { row }) => {
            let downLoad = this.$access('PigeonholeDownload')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.downLoad(row.commonFileId)
                      }
                    }
                  },
                  '下载'
                )
              : null
            let deleteBtn = this.$access('PigeonholeDelete')
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
                            this.deleteSure(row.id, row.type)
                          })
                          .catch(() => {
                            //几点取消的提示
                          })
                      }
                    }
                  },
                  '删除'
                )
              : null
            let goFloder = this.$access('PigeonholeGoFoloder')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.goFloder(row)
                      }
                    }
                  },
                  '定位'
                )
              : null
            // 轻量化
            let lightWeight = this.$access('PigeonholeLightWeight')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.lightWeight(row)
                      }
                    }
                  },
                  '轻量化'
                )
              : null
            // row.type===1代表文件夹
            // targetObj自定义区+存档区+内部共享区
            return h('div', [
              row.type !== 1 ? downLoad : null,
              deleteBtn,
              row.type !== 1 && this.pageQuery.isClickQuery ? goFloder : null,
              row.type !== 1 && (row.name.indexOf('.rvt') > -1 || row.name.indexOf('.dwg') > -1) ? lightWeight : null
            ])
          }
        }
      ],
      request: api.getFileList,
      // 文件夹id
      pid: '0',
      shareTree: [],
      shareTreeShow: false,
      // 路径树
      pathTree: []
    }
  },
  watch: {
    pid() {
      this.pageQuery.isClickQuery = 0
    },
    'pageQuery.time'(val) {
      if (val && val[0] !== null) {
        this.pageQuery.startDate = moment(val[0]).format('YYYY-MM-DD HH:MM:SS')
        this.pageQuery.endDate = moment(val[1]).format('YYYY-MM-DD HH:MM:SS')
      } else {
        this.pageQuery.startDate = ''
        this.pageQuery.endDate = ''
      }
    },
    // 一级菜单更改，清除搜索条件，激活查询接口
    departmentId: {
      handler: function(o, n) {
        this.resetAndGet()
        this.operation = ''
      },
      immediate: true
    },
    // 里程碑id更改，同样请求
    taskUniqueId: {
      handler: function(o, n) {
        this.resetAndGet()
      },
      immediate: true
    }
  },
  methods: {
    // 新增或者改名之后都要重新请求树结构 申豪强 2020-04-23
    updateTree() {
      this.$refs.breadcrumb.getTreeData()
    },
    // bug#1153 回跳其他菜单，取消查询状态
    updateTableReset(pid) {
      this.pageQuery.isClickQuery = 0
      this.setAllSelection()
      if (this.$refs.pageQuery) {
        this.$refs.pageQuery.resetFields()
      }
      this.pageQuery.time = null
      this.updateTable(pid)
    },
    /*
     * @任务编号: 2748 | 普通文件的在线预览
     * @开发人员:申豪强
     * @日期:2020-04-01
     * @代码类型：新功能
     */
    // 预览
    preview(row) {
      preview(row)
    },
    // 轻量化
    async lightWeight(row) {
      if (row.dexpStatus === 0 || row.dexpStatus === 3 || _.isNull(row.dexpStatus)) {
        //尚未轻量化
        let res = await api.changeConvertRecordByFileId(row.commonFileId, localStorage.getItem('projectId'))
        this.reset()
        return this.$message.success('轻量化转换中……')
      } else if (row.dexpStatus === 1) {
        return this.$message.warning('轻量化处理中')
      } else {
        let res = await api.getConvertRecordByFileId(row.commonFileId)
        const a = document.createElement('a')
        a.href = res.data.viewLink
        a.target = '_blank'
        a.click()
      }
    },
    // 定位之后，退出定位状态
    goFloder(row) {
      this.pid = row.pid
      this.$refs.breadcrumb.getHistoryPath(row.pid)
      this.pageQuery.isClickQuery = 0
      this.updateTable(row.pid)
    },
    btnSearch() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.pageQuery.isClickQuery = 1
      this.search()
    },
    // 查询
    search() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.pageQuery.page = 1
      this.getList()
    },
    reset() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.setAllSelection()
      this.pageQuery.isClickQuery = 0
      if (this.$refs.pageQuery) {
        this.$refs.pageQuery.resetFields()
      }
      this.pageQuery.time = null

      this.search()
    },

    // 审核进度
    async getHistoryList(id) {
      let res = await api.getHistoryList(id)
      if (res.data.length === 0) return this.$message.error('暂无数据')
      this.$refs.history.show(res.data)
    },

    // 更新table
    updateTable(pid) {
      this.pid = pid
      this.getList()
    },
    async showVisit(id) {
      this.$refs.visit.show(id)
    },
    resetAndGet() {
      if (!this.taskUniqueId) {
        this.queryResetFields()
        this.tableData = []
        this.tableDataAll = []
      }
      if (this.departmentId && this.taskUniqueId) {
        this.queryResetFields()
        this.getList()
      }
    },
    // 操作更改
    handleChange(e, f) {
      if (this.selectedList.length === 0) {
        this.operation = null
        this.$message.error('请选择文件/文件夹')
        return
      }
      this.$refs.move.show('copy')
    },
    // 分享操作
    shareChange(e) {
      if (this.selectedList.length === 0) {
        this.share = null
        return this.$message.error('请选择文件/文件夹')
      }
      if (e === 2) {
        //外部协作
        this.shareVisible = true
      } else {
        //内部共享
        this.$refs.share.show('internal_share')
      }
    },
    // 删除确认
    async deleteSure(id, type) {
      let res = await api.deleteFile({
        id: id,
        type: type
      })
      this.$message.success('删除成功')
      this.getList()
    },
    // 父级调用重置pid
    resetPid() {
      this.pid = '0'
    },
    downLoad(id) {
      const a = document.createElement('a')
      api.download(id).then(res => {
        a.href = URL.createObjectURL(res.data)
        a.download = contentDisposition.parse(res.headers['content-disposition']).parameters.filename
        a.click()
      })
    },
    // 上传
    uploadHandle() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      if (this.pid === '0') {
        return this.$message.error('根目录不允许上传文件')
      }
      this.$refs.uploadFile.show()
    },

    // 查询form清除
    queryResetFields() {
      if (this.$refs.pageQuery) {
        this.$refs.pageQuery.resetFields()
      }

      this.pageQuery.pid = ''
      this.time = null
    },
    // 发起审核
    examineHandle() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      if (this.selectedList.length === 0) return this.$message.error('请选择文件')
      if (this.selectedList.some(item => item.type === 1)) return this.$message.error('只能选择文件')
      this.$refs.examineForm.show(this.selectedList)
    },
    async getList() {
      try {
        this.pageQuery.module = this.module
        this.tableLoading = true
        this.pageQuery.departmentId = this.departmentId
        this.pageQuery.taskUniqueId = this.taskUniqueId
        this.pageQuery.pid = this.pid
        let res = await api.getFileList(this.pageQuery)
        this.tableLoading = false
        this.tableDataAll = res.data ? res.data : []
        this.tableData = _.chunk(res.data, this.pageQuery.rows)[this.pageQuery.page - 1]
        this.total = this.tableDataAll.length
      } catch (error) {
        this.tableLoading = false
      }
    },
    pageChange(e) {
      this.pageQuery.page = e
      this.tableData = _.chunk(this.tableDataAll, this.pageQuery.rows)[e - 1]
    },
    // 新建文件夹
    creatFolder() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      let form = {
        departmentId: this.departmentId,
        taskUniqueId: this.taskUniqueId,
        pid: this.pid,
        module: this.module
      }
      this.$refs.addNew.show(form)
    }
  }
}
</script>
<style lang="less" scoped>
.hide {
  display: none;
}
.point {
  cursor: pointer;
  color: #409eff;
}
.drop-table {
  /deep/ .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
.sensor-search-form {
  padding: 10px 0;
  .search-flex {
    display: flex;
    justify-content: space-between;
  }

  /deep/ .el-form-item {
    flex: 1;
    display: flex;
    margin-bottom: 8px;
    .el-form-item__label {
      width: 150px;
      text-align: right;
    }
    .el-form-item__content {
      flex: 1 1 100%;
      text-align: left;
      .el-select {
        width: 100%;
      }
    }
  }
  /deep/ .flex-end {
    .el-form-item__content {
      text-align: right;
    }
  }
}
</style>
