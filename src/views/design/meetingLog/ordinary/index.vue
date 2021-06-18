<!--
 * @Description: 一般会议
 * @Author:
 * @Date: 2020-01-17 16:27:45
//  修改：降序排列
 -->
<template>
  <div>
    <el-form ref="pageQuery" :model="pageQuery" label-width="120px" class="search-form">
      <el-row :gutter="4">
        <el-col :span="7">
          <el-form-item label="会议主题" prop="meetingTheme">
            <el-input v-model="pageQuery.meetingTheme" style="witdh:100%" placeholder="会议主题" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="会议结论" prop="meetingConclusion">
            <el-select v-model="pageQuery.meetingConclusion" style="width:100%" placeholder="请选择">
              <el-option
                v-for="item in conclusions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
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
        <el-col :span="24" style="text-align:right">
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
          <el-button icon="el-icon-refresh-right" @click="reset">重置</el-button>
          <el-button v-if="$access('MeetingSponsor')" type="primary" @click="add">发起会议</el-button>
        </el-col>
      </el-row>
    </el-form>
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
    <AddMeeting :visible.sync="addMeetingDialogVisible" :taskUniqueId="taskUniqueId" @addSuccess="getList"></AddMeeting>
  </div>
</template>
<script>
import AddMeeting from '../components/AddMeeting'
import PageMixin from '@/mixins/pageMixin'
import api from '@/api/design/meeting'
export default {
  name: 'Ordinary',
  components: {
    AddMeeting
  },
  mixins: [PageMixin],
  props: {
    // 里程碑id
    taskUniqueId: {}
  },
  data() {
    return {
      // 新增会议
      addMeetingDialogVisible: false,
      activeMilestone: null,
      tableColumn: [
        // {
        //   prop: 'name',
        //   label: '事项名称'
        // },
        {
          prop: 'taskName',
          label: '关联任务'
        },
        {
          prop: 'meetingTheme',
          label: '会议主题'
        },

        {
          prop: 'creatorName',
          label: '发起人'
        },
        {
          prop: 'meetingTime',
          label: '会议时间'
        },
        {
          prop: 'principalName',
          label: '负责人'
        },
        {
          prop: 'handle',
          label: '操作',
          width: '300',
          render: (h, { row }) => {
            let conclusion = this.$access('MeetingConclusion')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.$emit('showConclusion', 1, row.id)
                      }
                    }
                  },
                  '会议结论'
                )
              : null
            let modification = this.$access('MeetingModification')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.$emit('showModification', 1, row.id)
                      }
                    }
                  },
                  '修改通知'
                )
              : null
            let details = this.$access('MeetingDetails')
              ? h(
                  'el-button',
                  {
                    props: {
                      type: 'text'
                    },
                    on: {
                      click: e => {
                        e.stopPropagation()
                        this.$emit('showDetais', 1, row.id)
                      }
                    }
                  },
                  '会议详情'
                )
              : null
            return h('div', [
              row.status !== 2 ? null : conclusion,
              row.meetingConclusion || row.status === 3 ? null : modification,
              details
            ])
          }
        }
      ],
      conclusions: [
        {
          label: '全部',
          value: ''
        },
        {
          label: '通过',
          value: 1
        },
        {
          label: '不通过',
          value: 2
        }
      ],
      request: api.getMeetingList,
      /**
       任务名称：2868/添加3月注释
       开发人员：李建敏
       日期：2020-3月-4日
       任务类型：2、复制修改代码 （10行）
       **/
      pageQuery: {
        projectId: localStorage.getItem('projectId'),
        taskId: this.taskUniqueId ? this.taskUniqueId : null,
        type: [1],
        meetingTheme: null,
        time: null,
        sortField: 'create_time',
        sortValue: 'desc'
      }
      // requestFlag: false
    }
  },
  watch: {
    taskUniqueId(val) {
      this.pageQuery.taskId = val
      this.getList()
    },
    'pageQuery.time'(val) {
      if (val.length === 1 && val[0] === null) {
        this.pageQuery.meetingBeginTime = ''
        this.pageQuery.meetingEndTime = ''
      } else {
        this.pageQuery.meetingBeginTime = moment(val[0]).format('YYYY-MM-DD HH:MM:SS')
        this.pageQuery.meetingEndTime = moment(val[1]).format('YYYY-MM-DD HH:MM:SS')
      }
    }
  },
  methods: {
    add() {
      this.addMeetingDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.search-form {
  padding-top: 20px;
}
</style>
