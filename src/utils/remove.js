import { MessageBox, Message } from 'element-ui'
import axios from '@/utils/axios'
/**
 *
 * @param {Array} rows 选中行
 * @param {Function | String} delApi  api删除接口函数
 * @param {String} name 展示key
 * @param {Function} getList callback
 * @param {String} tipContent 提示语
 * @returns {Promise}
 */
export default (delApi, rows, name = null, getList = null, tipContent = '确定要删除') => {
  if (!rows.length) {
    Message.info('您当前没有选中')
    return Promise.reject('您当前没有选中')
  }
  let content = rows
    .slice(0, 3)
    .map(e => (e[name] ? e[name] : e.name || e.title))
    .map(text => `<span style='color:red;padding:4px;'>${text}</span>`)

  let length = rows.length > 3 ? `等${rows.length}项吗` : `吗`
  let msg = `<p><span>${tipContent}</span>${content}${length} ？</>`

  return MessageBox.confirm(msg, '提示', { dangerouslyUseHTMLString: true, type: 'warning' })
    .then(() =>
      _.isString(delApi)
        ? axios.post(
            delApi,
            rows.map(e => e.id)
          )
        : delApi(rows.map(e => e.id))
    )
    .then(() => {
      Message.success('删除成功')
      getList && getList()
    })
    .catch(() => {
      //取消
    })
}
