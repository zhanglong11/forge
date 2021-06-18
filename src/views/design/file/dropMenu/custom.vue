<!--
 * @Description: 自定义区
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-02-17 09:09:38
 * @LastEditTime: 2020-04-26 18:18:58
 * 修改：件移动到其他文件夹，提示操作成功后，该文件不应该再显示在这里了
 -->
<!--
 * @任务编号: 1169||文件管理-授权管理-只给了员工浏览权限，没有上传权限时，该员工在此文件夹下点击上传文件时，需要给出提示
 * @开发人员:申豪强
 * @日期:2020-03-16
 * @bug类型: 测试人员提出的系统性BUG
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
        <!-- <el-col :span="6">
          <el-form-item label="文件类型" prop="type">
            <el-select v-model="pageQuery.type" clearable placeholder="文件类型" style="width:100%">
              <el-option v-for="e in typeList" :key="e.value" :label="e.label" :value="e.value" />
            </el-select>
          </el-form-item>
        </el-col>-->
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
                :disabled="!$access(e.powerKey)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="分享">
            <el-select v-model="share" clearable placeholder="分享" style="width:100%" @change="shareChange">
              <el-option
                v-for="e in shareList"
                :key="e.value"
                :label="e.label"
                :value="e.value"
                :disabled="!$access(e.powerKey)"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="18">
          <el-form-item style="text-align:right" label-width="10px">
            <el-button type="primary" icon="el-icon-search" @click="btnSearch">查询 </el-button>
            <el-button icon="el-icon-refresh-right" @click="reset">重置 </el-button>
            <el-button v-if="pid === '0' && $access('CompanyFileCreateFolder')" type="primary" @click="creatFolder"
              >新建文件夹
            </el-button>
            <el-button v-if="pid !== '0' && $access('CompanyFileCreateFolder')" type="primary" @click="creatFolder"
              >新建文件夹</el-button
            >
            <el-button v-if="pid !== '0' && $access('CompanyFileUpload')" type="primary" @click="uploadHandle"
              >上传文件</el-button
            >
            <el-button v-if="pid !== '0' && $access('CompanyFileExamine')" type="primary" @click="examineHandle"
              >发起审批
            </el-button>
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
    <!-- 发起审批 -->
    <ExamineForm ref="examineForm" />
    <!-- 外部协作 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="shareVisible" title="分享文件" @close="shareClose">
      <el-form ref="shareForm" :model="shareForm" label-width="120px" :rules="shareFormRules">
        <el-form-item label="分享题目" prop="name">
          <el-input v-model="shareForm.name"></el-input>
        </el-form-item>
        <el-form-item label="有效期至" prop="indate">
          <el-input-number v-model="shareForm.indate" :min="1" :precision="0" :controls="false"></el-input-number>
          <!-- <el-input v-model="shareForm.indate" style="display:none"></el-input> -->
          <!-- task#2795 等待后台修改参数,将有效期修改为日期 -->
          <!-- <el-date-picker
            v-model="shareForm.indate"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder="选择日期时间"
          >
          </el-date-picker> -->
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="shareVisible = false">取 消</el-button>
        <el-button type="primary" @click="shareJudge">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 审核进度 -->
    <History ref="history" />
    <!-- 授权管理 -->
    <Visit
      ref="visit"
      :userList="userList"
      :departmentId="departmentId"
      :taskUniqueId="taskUniqueId"
      :module="module"
    />
    <!-- 新建文件夹+更改文件名 -->
    <AddNew ref="addNew" @updateTable="getList" @updateTree="updateTree" />
    <!-- 上传文件 -->
    <UploadFile ref="uploadFile" :pid="pid" :module="module" @updateTable="getList" />
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
      @success="handleSuccess"
    />
  </div>
</template>
<script>
import Move from '../components/Move'
import UploadFile from '../components/UploadFile'
import AddNew from '../components/AddNew'
import filesize from 'filesize'
import Visit from '../components/Visit'
import api from '@/api/design/file'
import TypeList from '@/lib/fileTypeList'
import PageMixin from '@/mixins/pageMixin'
import ExamineForm from '../components/ExamineForm.vue'
import treeFilter from '@/utils/treeFilter'
import History from '../components/History'
import contentDisposition from 'content-disposition'
import Breadcrumb from '../components/Breadcrumb'
import Share from '../components/Share'
import treeFind from '@/utils/treeFind'
import preview from '@/utils/preview'

export default {
  components: {
    ExamineForm,
    History,
    Visit,
    Breadcrumb,
    AddNew,
    UploadFile,
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
      // 父级权限
      parentAccess: [],
      accessValue: 'design-file-defined-',
      // 分享form
      shareForm: {
        fileIds: [],
        folderIds: [],
        indate: null,
        name: null,
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: this.taskUniqueId,
        url: window.location.origin + '#/share'
      },
      shareFormRules: {
        indate: [{ required: true, message: '请输入', trigger: 'blur' }],
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      shareVisible: false,
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
      typeList: TypeList,
      operationList: [
        {
          label: '复制到',
          value: 1,
          powerKey: 'CompanyFileCopy'
        },
        {
          label: '移动到',
          value: 2,
          powerKey: 'CompanyFildMove'
        }
      ],
      shareList: [
        {
          label: '内部共享',
          value: 1,
          powerKey: 'CompanyFileInShare'
        },
        {
          label: '外部协作',
          value: 2,
          powerKey: 'CompanyFileOutShare'
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
          minWidth: 80,
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
                      this.updateTable(params.row.id, params.row)
                    }
                  }
                },
                params.row.name
              )
            } else if (
              params.row.name &&
              (params.row.name.indexOf('.rvt') > -1 ||
                params.row.name.indexOf('.dwg') > -1 ||
                params.row.name.indexOf('.p3d') > -1 ||
                params.row.name.indexOf('.stp') > -1 ||
                params.row.name.indexOf('.rfa') > -1)
            ) {
              // 测试数据start
              const hash = {
                '暖通-2016.rvt': '/model/heat/3d.svf',
                '1-PE-001-v1.dwg': '/model/1-PE-001/1-PE-001-v1/3d.svf',
                '1-PE-001-v2.dwg': '/model/1-PE-001/1-PE-001-v2/3d.svf',
                'BP1607-A01 装配体500-400A二象限导出.stp': '/model/BP1607-A01/3d.svf',
                'GW型管道排污泵.rfa': '/model/GW/3d.svf',
                '建筑-2016.rvt': '/model/building/3d/3d.svf',
                '潜污泵.rfa': '/model/pump/3d.svf',
                '一体机3300V导出.stp': '/model/3300V/3d.svf'
              }
              return h(
                hash[params.row.name] ? 'a' : 'span',
                {
                  props: {
                    href: 'javascript:;'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation()
                      if (hash[params.row.name] && params.row.name !== '建筑-2016.rvt') {
                        const bimUrl = hash[params.row.name]
                        window.open(
                          window.location.origin +
                            `#/lightWeight2?taskUniqueId=${this.taskUniqueId}&departmentId=${this.departmentId}&fileId=${params.row.id}&bimUrl=${bimUrl}`
                        )
                      } else {
                        window.open(
                          window.location.origin +
                            `#/lightWeight?taskUniqueId=${this.taskUniqueId}&departmentId=${this.departmentId}&fileId=${params.row.id}`
                        )
                      }
                      return
                      if (params.row.dexpStatus === 0 || _.isNull(params.row.dexpStatus)) {
                        return this.$message.error('文件还未轻量化，点击操作区轻量化按钮进行操作')
                      } else if (params.row.dexpStatus === 3) {
                        return this.$message.error('文件轻量化失败，点击操作区轻量化按钮尝试重新操作')
                      }
                      this.lightWeight(params.row)
                    }
                  }
                },
                params.row.name
              )
              // 测试数据end
              // return h(
              //   'a',
              //   {
              //     props: {
              //       href: 'javascript:;'
              //     },
              //     on: {
              //       click: e => {
              //         e.stopPropagation()
              //         window.open(
              //           window.location.origin +
              //             `#/lightWeight2?taskUniqueId=${this.taskUniqueId}&departmentId=${this.departmentId}&fileId=${params.row.id}`
              //         )
              //         return
              //         if (params.row.dexpStatus === 0 || _.isNull(params.row.dexpStatus)) {
              //           return this.$message.error('文件还未轻量化，点击操作区轻量化按钮进行操作')
              //         } else if (params.row.dexpStatus === 3) {
              //           return this.$message.error('文件轻量化失败，点击操作区轻量化按钮尝试重新操作')
              //         }
              //         this.lightWeight(params.row)
              //       }
              //     }
              //   },
              //   params.row.name
              // )
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
            let downLoad = this.$access('companyFileDownload')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.downLoad(row.commonFileId, row.name)
                      }
                    }
                  },
                  '下载'
                )
              : null
            let rename = this.$access('companyFileRename')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        /*
                         * @任务编号: 2795 | 重命名新增标签更改
                         * @开发人员:申豪强
                         * @日期:2020-04-02
                         * @代码类型：功能调整
                         */
                        e.stopPropagation()
                        let obj = {
                          name: row.name,
                          id: row.id,
                          type: row.type,
                          fileTag: row.fileTag
                        }
                        this.$refs.addNew.show(obj)
                      }
                    }
                  },
                  '重命名'
                )
              : null
            let access = this.$access('companyFileVisit')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.showVisit(row.id, row.accessList)
                      }
                    }
                  },
                  '授权管理'
                )
              : NULL
            let schedule = this.$access('companyFileExamineSchedule')
              ? h(
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
              : NULL
            let deleteBtn = this.$access('companyFileDelete')
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
            let goFloder = this.$access('companyFileGoFloder')
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
            let lightWeight = this.$access('companyFileLightWeight')
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
              : NULL
            let downLoadIndex = row.accessList ? row.accessList.findIndex(item => item === 'download') : -1
            let renameIndex = row.accessList ? row.accessList.findIndex(item => item === 'rename') : -1
            let deleteIndex = row.accessList ? row.accessList.findIndex(item => item === 'delete') : -1
            // console.log('index', downLoadIndex, renameIndex, deleteIndex)
            /*
             * @任务编号: 2795 | 去除权限管理的限制,所有人都能看到权限
             * @开发人员:申豪强
             * @日期:2020-04-02
             * @代码类型：功能调整
             */
            // let accessIndex = row.accessList ? row.accessList.findIndex(item => item === 'access') : -1
            // row.type===1代表文件夹
            return h('div', [
              row.type !== 1 && (downLoadIndex >= 0 || this.userInfo.companyAdminFlag) ? downLoad : null,
              renameIndex >= 0 || this.userInfo.companyAdminFlag ? rename : null,
              row.type === 1 ? access : null,
              row.type !== 1 ? schedule : null,
              deleteIndex >= 0 || this.userInfo.companyAdminFlag ? deleteBtn : null,
              row.type !== 1 && this.pageQuery.isClickQuery ? goFloder : null,
              row.type !== 1 && row.name && (row.name.indexOf('.rvt') > -1 || row.name.indexOf('.dwg') > -1)
                ? lightWeight
                : null
            ])
          }
        }
      ],
      request: api.getFileList,
      // 文件夹id
      pid: '0'
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  watch: {
    pid(val) {
      this.pageQuery.isClickQuery = 0
    },
    userInfo(val) {
      console.log(val)
    },
    'pageQuery.time'(val) {
      if (val && val[0] !== null) {
        this.pageQuery.startDate = moment(val[0]).format('YYYY-MM-DD HH:MM:SS') || ''
        this.pageQuery.endDate = moment(val[1]).format('YYYY-MM-DD HH:MM:SS') || ''
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
        this.pid = '0'
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
    handleSuccess() {
      this.operation = null
      this.updateTable(this.pid)
    },
    // 无任务编号 配合后台进行调试 申豪强 2020-04-08
    // 轻量化
    async lightWeight(row) {
      if (row.dexpStatus === 0 || row.dexpStatus === 3 || _.isNull(row.dexpStatus)) {
        //尚未轻量化
        let res = await api.changeConvertRecordByFileId(row.commonFileId, localStorage.getItem('projectId'))
        // let res = await this.axios.get(
        //   `http://172.16.10.21:11360/file/commonFile/convertSubmit/${row.commonFileId}/d6e6122cf84d4331b1921597fd2951d5`
        // )
        this.reset()
        return this.$message.success('轻量化转换中……')
      } else if (row.dexpStatus === 1) {
        return this.$message.warning('轻量化处理中')
      } else {
        // let res = await this.axios.get(`http://172.16.10.21:55555/bimfish/getConvertRecordByFileId/${row.commonFileId}`)
        let res = await api.getConvertRecordByFileId(row.commonFileId)
        const a = document.createElement('a')
        a.href = res.data.viewLink
        a.target = '_blank'
        a.click()
      }
    },
    goFloder(row) {
      this.pid = row.pid
      this.$refs.breadcrumb.getHistoryPath(row.pid)
      // bug#1153 申豪强 定位当前位置的文件后，回到文件列表状态
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
      this.pageQuery.isClickQuery = 0
      this.setAllSelection()
      if (this.$refs.pageQuery) {
        this.$refs.pageQuery.resetFields()
      }
      this.pageQuery.time = null
      this.search()
    },
    // accessFilter(val) {
    //   let node = _.find(this.$store.state.app.accessList, { powerKey: val })
    //   return node ? '' : 'hide'
    // },
    // 审核进度
    async getHistoryList(id) {
      let res = await api.getHistoryList(id)
      if (res.data.length === 0) return this.$message.error('暂无数据')
      // this.historyFlag = true
      // this.historyObj = res.data[0]
      this.$refs.history.show(res.data)
    },

    // 更新table
    updateTable(pid) {
      this.pid = pid
      /*
       * @任务编号: 1169||获取父级的权限，后台修改接口中，暂关闭
       * @开发人员:申豪强
       * @日期:2020-03-16
       * @bug类型: 测试人员提出的系统性BUG
       */
      api
        .getFolderAccess({
          folderId: pid,
          projectId: localStorage.getItem('projectId'),
          taskUniqueId: this.taskUniqueId,
          module: 'unit',
          departmentId: this.departmentId
        })
        .then(res => {
          this.parentAccess = res.data
        })
      this.getList()
    },
    async showVisit(id, accessList) {
      this.$refs.visit.show(id, accessList)
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
        this.shareForm = {
          fileIds: [],
          folderIds: [],
          indate: null,
          name: null,
          projectId: localStorage.getItem('projectId'),
          taskUniqueId: this.taskUniqueId,
          url: window.location.origin + '/share'
        }
      })
    },
    // 操作更改
    handleChange(e, f) {
      if (this.selectedList.length === 0) {
        this.operation = null
        this.$message.error('请选择文件/文件夹')
        return
      }
      if (e === 1) {
        this.$refs.move.show('copy')
      } else {
        this.$refs.move.show('move')
      }
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
    downLoad(id, name) {
      const a = document.createElement('a')
      api.download(id).then(res => {
        a.href = URL.createObjectURL(res.data)
        a.download = name
        a.click()
      })
    },
    // 上传
    uploadHandle() {
      //请求接口查看是否拥有权限
      if (!this.taskUniqueId) return this.$message.error('请先选择里程碑任务')
      if (this.pid === '0') {
        return this.$message.error('根目录不允许上传文件')
      }
      /*
       * @bug编号: 1169||获取父级的权限
       * @开发人员:申豪强
       * @日期:2020-03-31
       * @bug类型: 测试人员提出的系统性BUG，后台接口完善
       */
      if (this.parentAccess.some(item => item === 'upload')) {
        this.$refs.uploadFile.show()
      } else {
        this.$message.error('暂无权限')
      }
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
        console.log(this.pageQuery)
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

  .flex-end {
    text-align: right;
  }
}
</style>
