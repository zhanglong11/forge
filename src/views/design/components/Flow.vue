<template>
  <div style="position:relative">
    <!-- 图例 -->
    <div class="legend">
      <el-row :gutter="4">
        <el-col :span="8">
          <ul>
            <li class="not-started dot">未开始</li>
            <li class="ing dot">进行中</li>
            <li class="finished dot">已完成</li>
          </ul>
        </el-col>
        <el-col :span="8">
          <p class="center project-title">
            {{ !activeMilestoneId ? '里程碑任务列表' : activeMilestone.name }}
          </p>
        </el-col>
        <el-col v-show="activeMilestoneId" :span="8" class="center">
          <el-button type="primary" @click="goBack">回到主线</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="flow-canvas" :style="{ minHeight: height + 'px' }">
      <div v-show="activeMilestoneId" class="flow-canvas-arrows-left" style="z-index:5">
        <i v-show="activeMilestoneIndex !== 0" class="el-icon-arrow-left" @click="prev"></i>
      </div>
      <div v-show="activeMilestoneId" class="flow-canvas-arrows-right" style="z-index:5">
        <i
          v-show="activeMilestoneIndex !== list.filter(e => !e.parentTaskUniqueId).length - 1"
          class="el-icon-arrow-right"
          @click="next"
        ></i>
      </div>
      <div style="position: relative;">
        <div :id="idSelect" class="flow-canvas-content"></div>
      </div>
    </div>
  </div>
</template>
<script>
import G6 from '@antv/g6'
import status from '@/views/design/lib/taskStatus'
import treeForEach from '@/utils/treeForEach'
import toTree from '@/utils/toTree'
import toFlat from '@/utils/toFlat'
import TreeFind from '@/utils/treeFind'
export default {
  name: 'Flow',
  props: {
    // 容器id
    idSelect: {
      default: 'container'
    },
    height: {
      default: 500
    },
    propList: {
      type: [Array, Boolean],
      default: false
    }
  },
  data() {
    return {
      list: [],
      // 节点弹出相关参数
      showText: false,
      popoverLeft: 0,
      popoverTop: 0,
      infoList: [],
      // g6实例
      graph: null,
      title: '',
      // 里程碑id
      taskUniqueId: '',
      // 支线id
      activeMilestoneId: null
    }
  },
  computed: {
    computedFlowData() {
      let that = this
      let list = toTree(this.list, 'parentTaskUniqueId', null, 'taskUniqueId')
      treeForEach(list, e => (e.taskUniqueId = '' + e.taskUniqueId))
      let nodes = []
      let edges = []
      if (this.activeMilestoneId) {
        // 支线
        let activeMilestone = _.find(list, { taskUniqueId: this.activeMilestoneId })
        convertToNodes(toFlat(activeMilestone.children))
        // 里程碑节点
        let template = {
          status: activeMilestone.status,
          actualStartTime: activeMilestone.actualStartTime,
          actualEndTime: activeMilestone.actualEndTime,
          planStartTime: activeMilestone.planStartTime,
          planEndTime: activeMilestone.planEndTime,
          type: 'ellipse'
        }
        // lightgray：未开始
        // #FF8D27：进行中
        // #409eff：已完成
        /*
         * @bug编号: 1161 | 新增开始会议、结束会议状态、id，根据这些进行状态的判定
         * @开发人员:申豪强
         * @日期:2020-04-09
         * @代码类型：系统bug
         */
        let start = Object.assign({}, template, {
          id: activeMilestone.taskUniqueId,
          label: `${activeMilestone.name} 开始`,
          style: {
            stroke: activeMilestone.beginMeetingId
              ? activeMilestone.beginMeetingStatus === 2
                ? '#409eff'
                : '#FF8D27'
              : 'lightgray',
            fill: activeMilestone.beginMeetingId
              ? activeMilestone.beginMeetingStatus === 2
                ? '#409eff'
                : '#FF8D27'
              : 'lightgray',
            lineWidth: 3
          },
          labelCfg: {
            style: {
              fill: '#fff'
            }
          }
        })
        let end = Object.assign({}, template, {
          id: activeMilestone.taskUniqueId + 's',
          label: `${activeMilestone.name} 结束`,
          style: {
            stroke: activeMilestone.endMeetingId
              ? activeMilestone.endMeetingStatus === 2
                ? '#409eff'
                : '#FF8D27'
              : 'lightgray',
            fill: activeMilestone.endMeetingId
              ? activeMilestone.endMeetingStatus === 2
                ? '#409eff'
                : '#FF8D27'
              : 'lightgray',
            lineWidth: 3
          },
          labelCfg: {
            style: {
              fill: '#fff'
            }
          }
        })
        let nodeIds = nodes.map(e => e.id).concat(start.id)
        let sourceIds = edges.map(e => e.source)
        let lastIds = _.difference(nodeIds, sourceIds)
        nodes.push(start)
        nodes.push(end)
        lastIds.forEach(id => {
          edges.push({
            source: id,
            target: end.id
          })
        })
      } else {
        convertToNodes(list.filter(e => !e.parentTaskUniqueId))
      }
      function convertToNodes(data) {
        data.forEach(item => {
          const color = _.get(_.find(status, { value: item.status }), 'color', 'lightgray')
          let len = that.calcStrLen(item.name)
          let label = ''
          if (len > 16) {
            label = item.name.slice(0, 16) + '\n' + item.name.slice(16)
          } else {
            label = item.name
          }
          nodes.push({
            label: label,
            labelCfg: {
              style: {
                fill: '#fff',
                fontWeight: 900,
                fontSize: item.type === 2 ? 14 : 12
              }
            },
            status: item.status,
            actualStartTime: item.actualStartTime,
            actualEndTime: item.actualEndTime,
            planStartTime: item.planStartTime,
            planEndTime: item.planEndTime,
            type: item.type === 2 ? 'ellipse' : 'rect',
            id: item.taskUniqueId,
            anchorPoints: [
              [0, 0.5],
              [1, 0.5]
            ],
            style: {
              stroke: color,
              fill: color,
              lineWidth: 0,
              radius: 6,
              shadowColor: 'lightgray',
              shadowBlur: 4
            }
          })
          if (item.preTaskId) {
            item.preTaskId.split(',').forEach(e => {
              edges.push({
                source: e,
                target: item.taskUniqueId
              })
            })
          }
        })
      }
      return { nodes, edges }
    },
    activeMilestoneIndex() {
      return _.findIndex(
        this.list.filter(e => !e.parentTaskUniqueId),
        { taskUniqueId: +this.activeMilestoneId }
      )
    },
    activeMilestone() {
      return _.find(this.list, { taskUniqueId: +this.activeMilestoneId })
    }
  },
  watch: {
    propList(val) {
      this.list = val || []
    },
    computedFlowData() {
      if (!this.graph) this.initG6()
      this.graph.read(this.computedFlowData)
    },
    // 里程碑id更新
    activeMilestoneId(val) {
      this.$emit('taskUniqueIdChange', val, this.activeMilestone?.name)
    }
  },
  created() {
    !this.propList && this.refresh()
  },
  methods: {
    /**
     * 计算字符串的长度
     * @param {string} str 指定的字符串
     * @return {number} 字符串长度
     */
    calcStrLen(str) {
      let len = 0
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
          len++
        } else {
          len += 2
        }
      }
      return len
    },
    async refresh() {
      this.list = await this.axios.schedule
        .get('schedule/task/treeList/' + localStorage.getItem('projectId'))
        .then(res => {
          console.log(res)
          return res.data || []
        })
    },
    goBack() {
      this.activeMilestoneId = null
    },
    prev() {
      this.activeMilestoneId =
        '' + this.list.filter(e => !e.parentTaskUniqueId)[this.activeMilestoneIndex - 1].taskUniqueId
    },
    next() {
      this.activeMilestoneId =
        '' + this.list.filter(e => !e.parentTaskUniqueId)[this.activeMilestoneIndex + 1].taskUniqueId
    },
    initG6() {
      // 自定义节点
      G6.registerNode(
        'sql',
        {
          drawShape(cfg, group) {
            const rect = group.addShape('rect', {
              attrs: {
                // x、y确定中心点，要取width、height的一半
                x: -75,
                y: -25,
                width: 150,
                height: 50,
                radius: 10,
                stroke: '#5B8FF9',
                fill: '#C6E5FF',
                lineWidth: 3
              }
            })

            return rect
          }
        },
        'single-shape'
      )
      // 自定义节点:椭圆
      G6.registerNode(
        'ellipse-self',
        {
          drawShape(cfg, group) {
            const rect = group.addShape('dom', {
              attrs: {
                html: `<div style="width: 250px;height: 150px;margin: 50px;background: #FFD900;border-radius: 50% / 50%;">测试节点</div>`
              }
            })

            return rect
          }
        },
        'single-shape'
      )
      const width = this.width ? this.width : document.getElementById(this.idSelect).scrollWidth
      this.graph = new G6.Graph({
        container: this.idSelect,
        width: width,
        height: this.height,
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'UR',
          nodesepFunc: d => {
            return 50
          },
          ranksep: 70
        },
        pixelRatio: 2,
        // defaultNode: {
        //   shape: 'ellipse-self'
        // },
        // 不同状态下样式
        // 默认线
        defaultEdge: {
          type: 'polyline',
          style: {
            radius: 20,
            offset: 10,
            lineWidth: 1,
            endArrow: true, //是否显示终点箭头
            stroke: '#70cffc'
          },
          lineJoin: 'bevel'
        },
        // 交互模式
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            'click-select',
            {
              type: 'tooltip',
              formatText: function formatText(model) {
                return `
                 <p class="time">
                <span class="time-label">计划起止时间：</span>
                <span class="time-details">${moment(model.planStartTime).format('YYYY-MM-DD')}  ~  ${moment(
                  model.planEndTime
                ).format('YYYY-MM-DD')} </span>
              </p>
              <p class="time">
                <span class="time-label">实际起止时间：</span>
                <span class="time-details"> ${
                  model.actualStartTime && model.actualEndTime
                    ? moment(model.actualStartTime).format('YYYY-MM-DD') +
                      ' ~ ' +
                      moment(model.actualEndTime).format('YYYY-MM-DD')
                    : '未设置'
                } </span>
              </p>`
              }
            }
          ]
        },
        // 各种事件样式
        nodeStateStyles: {
          hover: {}
        },
        fitView: true
      })
      this.graph.read(this.computedFlowData || { nodes: [], edges: [] })
      this.graph.on('node:click', e => {
        // 获取节点详情
        if (!this.activeMilestoneId) {
          let { item } = e
          let { defaultCfg } = item
          this.activeMilestoneId = defaultCfg.id
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
div {
  /deep/ .g6-tooltip {
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    color: #606266;
    line-height: 1.4;
    font-size: 14px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  /deep/ .time {
    font-size: 14px;
    &-details {
      color: #409eff;
    }
  }
}
.legend {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  ul {
    padding-left: 60px;
  }
}
.title {
  color: #303133;
  font-size: 16px;
}
.center {
  text-align: center;
}
.project-title {
  font-size: 30px;
}
.flow-canvas {
  position: relative;
  &-arrows-left,
  &-arrows-right {
    font-size: 60px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
  &-arrows-left {
    left: 0;
  }
  &-arrows-right {
    right: 0;
  }

  &-content-wrap {
    width: 90%;
  }
}
</style>
