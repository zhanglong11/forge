export default function(treeData, fn) {
  let result = null
  c(treeData)
  function c(list) {
    for (let item of list) {
      if (result) return false
      if (fn(item)) result = item
      if (item.children) {
        c(item.children)
      }
    }
  }
  return result
}
