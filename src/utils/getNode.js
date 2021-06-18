/*
 * @Description:处理任务节点;arr是数组；areaName是连接点数组，有前后之分;nodes是节点，edges是线的集合
 * @Author:
 * @Date: 2020-01-11 17:01:41
 */
import status from '@/lib/projectStatus'
function filterNode(arr, childrenName = 'children', areaName = 'preTaskArea', nodes = [], edges = []) {
  arr = JSON.parse(JSON.stringify(arr))
  for (let item of arr) {
    let color = status.find(statusItem => item.status === statusItem.value)
      ? status.find(statusItem => item.status === statusItem.value).color
      : 'lightgray'
    nodes.push({
      label: `${item.name}`,
      status: item.status,
      actualStartTime: item.actualStartTime,
      actualEndTime: item.actualEndTime,
      planStartTime: item.planStartTime,
      planEndTime: item.planEndTime,
      shape: 'rect',
      id: item.taskUniqueId.toString(),
      anchorPoints: [
        [0, 0.5],
        [1, 0.5]
      ],
      style: {
        x: -40,
        y: -25,
        width: 80,
        height: 50,
        radius: 10,
        stroke: color,
        fill: color,
        lineWidth: 3
      },
      labelCfg: {
        fill: '#fff'
      }
    })
    if (item[areaName] && item[areaName].length > 0) {
      for (let areaItem of item[areaName]) {
        let a = {
          source: areaItem.source.toString(),
          target: areaItem.target.toString()
        }
        edges.push(a)
      }
    }

    if (item[childrenName] && item[childrenName].length > 0) {
      filterNode(item[childrenName], childrenName, areaName, nodes, edges)
    }
  }
  return {
    nodes: nodes,
    edges: edges
  }
}
export default filterNode
