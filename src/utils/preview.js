/*
 * @Description:预览方法
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-01 09:29:03
 * @LastEditTime: 2020-05-25 15:41:32
 */
/*
 * @任务编号: 2748 | 普通文件的在线预览
 * @开发人员:申豪强
 * @日期:2020-04-01
 * @代码类型：新功能
 */
// 预览
import indexApi from '@/api/design/index'
async function preview(row) {
  const imgReg = /(.*)\.(jpg|png|jepg|gif|webp)$/
  // 一般预览链接
  if (row.name ? row.name.indexOf('.pdf') > -1 : row.fileName.indexOf('.pdf') > -1 || imgReg.test(row.name)) {
    let res = await indexApi.getFileDetails(row.commonFileId || row.id)
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(res.data)
    link.target = '_blank'
    link.click()
  } else {
    let res = await indexApi.previewOss(row.commonFileId || row.id)
    if (res.data) {
      const a = document.createElement('a')
      a.target = '_blank'
      a.href = res.data.fileUrl
      a.click()
    }
  }
}
export default preview
