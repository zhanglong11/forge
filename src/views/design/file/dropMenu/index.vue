<!--
 * @Description:自定义+存档区+内部共享
 * @Author:申豪强
 * @Date: 2020-01-15 15:21:18
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
  <div class="drop-table">
    <el-form ref="pageQuery" :model="pageQuery" label-width="80px" style="padding-top:10px">
      <el-row :gutter="4">
        <el-col :span="6">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="pageQuery.keyword" placeholder="文件名称/标签/上传人" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="文件类型" prop="type">
            <el-select v-model="pageQuery.type" clearable placeholder="文件类型" style="width:100%">
              <el-option v-for="e in typeList" :key="e.value" :label="e.label" :value="e.value" />
            </el-select>
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
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="操作">
            <el-select
              v-if="targetObj.name !== '内部共享' && targetObj.name !== '存档区'"
              v-model="operation"
              clearable
              placeholder="操作"
              style="width:100%"
              @change="handleChange"
            >
              <el-option
                v-for="e in operationList"
                :key="e.value"
                :label="e.label"
                :value="e.value"
                :disabled="!!accessFilter(accessValue + e.access)"
              />
            </el-select>
            <el-select
              v-else
              v-model="operation"
              clearable
              placeholder="操作"
              style="width:100%"
              @change="handleChange"
            >
              <el-option
                v-for="e in operationListCopy"
                :key="e.value"
                :label="e.label"
                :value="e.value"
                :disabled="!!accessFilter(accessValue + e.access)"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 只有自定义区+存档区才可以有 -->
        <el-col v-if="targetObj.name !== '内部共享'" :span="6">
          <el-form-item label="分享">
            <el-select v-model="share" clearable placeholder="分享" style="width:100%" @change="shareChange">
              <el-option v-for="e in shareList" :key="e.value" :label="e.label" :value="e.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item class="flex-end" label-width="10px">
            <el-button
              :class="accessFilter(accessValue + 'search')"
              type="primary"
              icon="el-icon-search"
              @click="search"
              >查询</el-button
            >
            <el-button :class="accessFilter(accessValue + 'search')" icon="el-icon-refresh-right" @click="reset"
              >重置</el-button
            >
            <el-button :class="accessFilter(accessValue + 'created')" type="primary" @click="creatFolder"
              >新建文件夹</el-button
            >
            <el-button
              v-if="targetObj.name !== '存档区' && targetObj.name !== '内部共享'"
              :class="accessFilter(accessValue + 'upload')"
              type="primary"
              @click="uploadHandle"
              >上传文件</el-button
            >
            <el-button
              v-if="targetObj.name !== '存档区' && targetObj.name !== '内部共享'"
              :class="accessFilter(accessValue + 'examine')"
              type="primary"
              @click="examineHandle"
              >发起审批</el-button
            >
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="flex">
      <span>当前位置：</span>
      <el-breadcrumb>
        <el-breadcrumb-item v-for="(item, index) in nowLocation" :key="index">
          <span v-if="index !== 0" class="point" @click.capture="breadcrumbClick(item, index)">{{ item.name }}</span>
          <span v-else>{{ item.name }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
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
    <!-- 新增账号 -->
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      :title="creatFolderForm.id ? '重命名' : '新建文件夹'"
      :visible.sync="creatFolderFlag"
      width="500"
      @close="creatFolderClose"
    >
      <el-form ref="creatFolder" :model="creatFolderForm" label-width="120px" :rules="creatFolderRules">
        <el-form-item label="文件夹名称" prop="name">
          <el-input v-model="creatFolderForm.name"></el-input>
        </el-form-item>
        <el-form-item v-if="!creatFolderForm.id" label="标签" prop="fileTag">
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
            >{{ tag }}</el-tag
          >
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增标签</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="creatFolderFlag = false">取 消</el-button>
        <el-button type="primary" @click="creatFolderSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 上传 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="uploadVisible" @close="uploadClose">
      <el-form label-width="80px">
        <el-form-item label="标签">
          <div>
            <el-tag
              v-for="tag in dynamicTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
              >{{ tag }}</el-tag
            >
            <el-input
              v-if="inputVisible"
              ref="saveTagInput"
              v-model="inputValue"
              class="input-new-tag"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增标签</el-button>
          </div>
        </el-form-item>
        <el-form-item label="上传文件">
          <Upload @input="handleUpload" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadSure">确 定</el-button>
      </span>
    </el-dialog>
    <ExamineForm ref="examineForm" />
    <!-- 移动、复制、内部分享 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="moveVisible" @close="moveClose">
      <div style="max-height:400px;overflow-y: scroll;">
        <el-tree
          :data="shareTreeShow ? shareTree : treeData"
          :props="defaultProps"
          default-expand-all
          @node-click="handleNodeClick"
        ></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moveVisible = false">取 消</el-button>
        <el-button type="primary" @click="moveSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 外部协作 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="shareVisible" title="分享文件" @close="shareClose">
      <el-form ref="shareForm" :model="shareForm" label-width="120px" :rules="shareFormRules">
        <el-form-item label="分享题目" prop="name">
          <el-input v-model="shareForm.name"></el-input>
        </el-form-item>
        <el-form-item label="有效期(天)" prop="indate">
          <el-input-number v-model="shareForm.indate" :min="1" :precision="0" :controls="false"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareVisible = false">取 消</el-button>
        <el-button type="primary" @click="shareJudge">确 定</el-button>
      </span>
    </el-dialog>
    <History ref="history" />
    <Visit
      ref="visit"
      :userList="userList"
      :departmentId="departmentId"
      :taskUniqueId="taskUniqueId"
      :module="module"
    />
  </div>
</template>
<script>
import filesize from 'filesize'
import Visit from '../components/Visit'
import api from '@/api/design/file'
import TypeList from '@/lib/fileTypeList'
import PageMixin from '@/mixins/pageMixin'
import ExamineForm from '../components/ExamineForm.vue'
import treeFilter from '@/utils/treeFilter'
import History from '../components/History'
import treeFindPath from '@/utils/treeFindPath'
import contentDisposition from 'content-disposition'
export default {
  components: {
    ExamineForm,
    History,
    Visit
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
    targetObj: {},
    userList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      accessValue: 'design-file-defined-',
      // 当前位置
      nowLocation: [],
      // 当前位置copy，禁止修改
      nowLocationCopy: [],
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
      // 上传
      uploadVisible: false,
      inputVisible: false,
      inputValue: '',
      requestFlag: false,
      creatFolderFlag: false,
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
      creatFolderRules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      typeList: TypeList,
      operationList: [
        {
          label: '复制到',
          value: 1,
          access: 'copy'
        },
        {
          label: '移动到',
          value: 2,
          access: 'move'
        }
      ],
      operationListCopy: [
        {
          label: '复制到',
          value: 1,
          access: 'copy'
        }
      ],
      moveVisible: false,
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
                'el-button',
                {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation()
                      this.updateTable(params.row.id, params.row.name)
                    }
                  }
                },
                params.row.name
              )
            } else {
              return h('div', params.row.name)
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
            let downLoad = h(
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
            let rename = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                on: {
                  click: e => {
                    e.stopPropagation()
                    this.creatFolderFlag = true
                    this.creatFolderForm.name = row.name
                    this.creatFolderForm.id = row.id
                    this.creatFolderForm.type = row.type
                  }
                }
              },
              '重命名'
            )
            let visit = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                directives: [
                  {
                    name: 'access',
                    value: this.accessValue + 'visit'
                  }
                ],
                on: {
                  click: e => {
                    e.stopPropagation()
                    this.showVisit(row.id)
                  }
                }
              },
              '授权管理'
            )
            let schedule = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                on: {
                  click: e => {
                    e.stopPropagation()
                    this.getHistoryList(row.id)
                  }
                }
              },
              '审核进度'
            )
            let deleteBtn = h(
              'el-button',
              {
                props: {
                  type: 'text'
                },
                directives: [
                  {
                    name: 'access',
                    value: this.accessValue + 'delete'
                  }
                ],
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
            let downLoadIndex = row.accessList ? row.accessList.findIndex(item => item === 'download') : -1
            let renameIndex = row.accessList ? row.accessList.findIndex(item => item === 'rename') : -1
            let scheduleIndex = row.accessList ? row.accessList.findIndex(item => item === 'select_audit') : -1
            let deleteIndex = row.accessList ? row.accessList.findIndex(item => item === 'delete') : -1
            // row.type===1代表文件夹
            // targetObj自定义区+存档区+内部共享区
            return h('div', [
              row.type !== 1 && (downLoadIndex >= 0 || !this.accessFilter(this.accessValue + 'downLoad'))
                ? downLoad
                : null,
              this.targetObj.name !== '存档区' && this.targetObj.name !== '内部共享' && renameIndex >= 0
                ? rename
                : null,
              this.targetObj.name !== '存档区' && this.targetObj.name !== '内部共享' && row.type === 1 ? visit : null,
              this.targetObj.name !== '存档区' &&
              this.targetObj.name !== '内部共享' &&
              row.type !== 1 &&
              scheduleIndex >= 0
                ? schedule
                : null,
              deleteIndex >= 0 || !this.accessFilter(this.accessValue + 'delete') ? deleteBtn : null
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
    time(val) {
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
        this.resetLoaction()
      },
      immediate: true
    },
    targetObj: {
      deep: true,
      handler: 'resetLoaction'
    }
  },
  methods: {
    // 查询
    search() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.pageQuery.page = 1
      this.getList()
    },
    reset() {
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      this.setAllSelection()
      this.$refs.pageQuery.resetFields()
      this.search()
    },
    accessFilter(val) {
      let node = _.find(this.$store.state.app.accessList, { powerKey: val })
      return node ? '' : 'hide'
    },
    // 审核进度
    async getHistoryList(id) {
      let res = await api.getHistoryList(id)
      if (res.data.length === 0) return this.$message.error('暂无数据')
      this.$refs.history.show(res.data)
    },
    // 更新位置
    updateLocation(id) {
      let data = treeFindPath(this.pathTree, e => e.id === id)
      if (data.length > 0) {
        let arr = this.nowLocation.slice(0, 1)
        this.nowLocation = [...arr, ...data]
      } else {
      }
    },
    // 更新table
    updateTable(id, index) {
      if (index === 1) {
        this.pid = '0'
      } else {
        this.pid = id
      }
      this.getList()
      this.updateLocation(id)
    },
    // 面包屑点击
    breadcrumbClick(e, index) {
      this.updateTable(e.id, index)
    },
    async showVisit(id) {
      this.$refs.visit.show(id)
    },
    // 重置/初始化位置
    resetLoaction() {
      // 更新权限
      if (this.targetObj) {
        this.accessValue = this.accessList.find(item => item.name === this.targetObj.name)
          ? this.accessList.find(item => item.name === this.targetObj.name).value
          : 'design-file-defined-'
      }
      // 更新位置
      this.nowLocationCopy = [
        {
          name: this.taskTitle,
          id: ''
        },
        {
          name: this.targetObj.name,
          id: this.targetObj.id
        }
      ]
      this.nowLocation = JSON.parse(JSON.stringify(this.nowLocationCopy))
    },
    resetAndGet() {
      if (this.departmentId && this.taskUniqueId) {
        this.queryResetFields()
        this.getList()
        this.getTreeData()
      }
    },
    // 获取内部分享树结构
    async getTreeShare() {
      let obj = {
        departmentId: '',
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId,
        module: 'share'
      }
      let res = await api.getSelectShareTree(obj)
      this.shareTree = res.data
    },
    // 获取树结构
    async getTreeData() {
      let obj = {
        departmentId: this.departmentId && this.departmentId.length > 3 ? this.departmentId : null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId
      }
      if (this.targetObj.module) {
        //内部共享
        obj.module = this.targetObj.module
        let res = await api.getSelectShareTree(obj)
        this.pathTree = res.data
      } else {
        let res = await api.getTree(obj)
        this.treeData = res.data
        this.pathTree = JSON.parse(JSON.stringify(res.data))
      }
      console.log(this.treeData)
    },
    // 移动、复制、内部分享modal弹框关闭
    moveClose() {
      this.shareTreeShow = false
      this.moveVisible = false
      this.operation = null
      this.share = null
      this.$nextTick(() => {
        this.moveProps = {
          fileIdList: [],
          folderIdList: [],
          operateType: '',
          targetFolderId: ''
        }
      })
    },
    // 节点点击
    handleNodeClick(e) {
      this.moveProps.targetFolderId = e.id
    },
    // 复制、移动确认
    async moveSure(e) {
      if (this.moveProps.targetFolderId) {
        let res = await api.copyMoveFile(this.moveProps)
        this.$message.success('操作成功')
        this.moveVisible = false
      } else {
        this.$message.error('请选择文件夹')
      }
    },
    // 外部协作确认
    async shareJudge(e) {
      this.$refs.shareForm.validate(valid => {
        if (valid) {
          this.shareSure()
        }
      })
    },
    async shareSure() {
      let obj = JSON.parse(JSON.stringify(this.shareForm))
      obj.fileIds = this.selectedList.filter(item => item.type === 2).map(item => item.id)
      obj.folderIds = this.selectedList.filter(item => item.type === 1).map(item => item.id)
      obj.taskUniqueId = this.taskUniqueId
      let res = await api.handleExternalCollaboration(obj)
      this.shareVisible = false
    },
    shareClose() {
      this.shareVisible = false
      this.share = null
      this.$nextTick(() => {
        this.shareForm = {}
      })
    },
    // 操作更改
    handleChange(e, f) {
      if (this.selectedList.length === 0) {
        this.operation = null
        this.$message.error('请选择文件/文件夹')
        return
      }
      this.moveProps.fileIdList = this.selectedList.filter(item => item.type === 2).map(item => item.id)
      this.moveProps.folderIdList = this.selectedList.filter(item => item.type === 1).map(item => item.id)
      if (e === 1) {
        this.moveProps.operateType = 'copy'
      } else {
        this.moveProps.operateType = 'move'
      }
      this.moveVisible = true
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
        this.moveVisible = true
        this.shareTreeShow = true
        this.moveProps.fileIdList = this.selectedList.filter(item => item.type === 2).map(item => item.id)
        this.moveProps.folderIdList = this.selectedList.filter(item => item.type === 1).map(item => item.id)
        this.moveProps.operateType = 'internal_share'
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
        console.log(res)
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
      this.uploadVisible = true
    },
    // 上传成功操作
    handleUpload(e) {
      if (e.code === 200) {
        this.commonFileId = e.data
      }
    },
    // 上传成功保存
    async uploadSure() {
      let fileTag = this.dynamicTags.join(',')
      let obj = {
        commonFileId: this.commonFileId,
        fileTag: fileTag,
        folderId: this.pid,
        id: '',
        module: this.module,
        projectId: localStorage.getItem('projectId')
      }
      let res = await api.saveFile(obj)
      this.uploadClose()
    },
    // 上传modal关闭
    uploadClose() {
      this.dynamicTags = []
      this.commonFileId = ''
      this.uploadVisible = false
      this.getList()
    },
    // 查询form清除
    queryResetFields() {
      this.$refs.pageQuery.resetFields()
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
      this.creatFolderFlag = true
    },
    // tag新增
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    // 新增文件modal close
    creatFolderClose() {
      this.creatFolderFlag = false
      this.$refs.creatFolder.resetFields()
      this.dynamicTags = []
      this.creatFolderForm.fileTag = ''
    },
    // 新增+重命名点击确认
    creatFolderSure() {
      this.$refs.creatFolder.validate(valid => {
        if (valid) {
          if (this.creatFolderForm.id) {
            //重命名
            this.rename()
          } else {
            //新增
            this.addFolderSubmit()
          }
        }
      })
    },
    // 新增确认
    async addFolderSubmit() {
      let fileTag = this.dynamicTags.join(',')
      this.creatFolderForm.departmentId = this.departmentId
      this.creatFolderForm.taskUniqueId = this.taskUniqueId
      this.creatFolderForm.folderTag = fileTag
      this.creatFolderForm.pid = this.pid
      this.creatFolderForm.module = this.module
      let res = await api.addFolder(this.creatFolderForm)
      this.addFolderSuccess()
    },
    async rename() {
      let obj = {
        id: this.creatFolderForm.id,
        name: this.creatFolderForm.name,
        type: this.creatFolderForm.type
      }
      let res = await api.rename(obj)
      this.addFolderSuccess()
    },
    // 成功后操作
    addFolderSuccess() {
      this.creatFolderForm.id = null
      this.creatFolderForm.type = null
      this.creatFolderFlag = false
      this.$refs.creatFolder.resetFields()
      this.getList()
    },
    // 新增标签
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 新增标签
    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
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
  .flex {
    padding: 0 0 10px 0;
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #909399;
    /deep/ .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      color: #909399;
    }
    /deep/ .el-breadcrumb__inner {
      color: #909399;
    }
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
