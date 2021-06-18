/*
 * @Description:按照id查找path，用于文件管理的当前位置；
 * @Version:
 * @Autor:
 * @Date: 2020-02-15 21:52:04
 * @LastEditTime: 2020-02-21 17:36:36
 */
//按id查找路径
function treeFindPath(tree, func, path = []) {
  if (!tree) return []
  for (const data of tree) {
    path.push({ name: data.title, id: data.id, pid: data.pid })
    if (func(data)) return path
    if (data.children) {
      const findChildren = treeFindPath(data.children, func, path)
      if (findChildren.length) return findChildren
    }
    path.pop()
  }
  return []
}
export default treeFindPath
