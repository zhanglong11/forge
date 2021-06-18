import toFlat from './toFlat'
/**
 任务名称：2868/添加3月注释
 开发人员：李建敏
 日期：2020-3月-5日
 任务类型：2、复制修改代码 （3行）
 **/
export default function(newList, oldList) {
  newList = toFlat(newList)
  oldList = toFlat(oldList)
  let intersection = _.intersectionBy(newList, oldList, 'taskUniqueId')
  let addTaskList = _.differenceBy(newList, oldList, 'taskUniqueId')
  let deleteIds = _.differenceBy(oldList, newList, 'taskUniqueId').map(e => e.id)
  let updateTaskList = intersection.filter(
    e => !_.isEqual(_.find(newList, { id: e.id }), _.find(oldList, { id: e.id }))
  )
  return {
    addTaskList,
    deleteIds,
    updateTaskList
  }
}
