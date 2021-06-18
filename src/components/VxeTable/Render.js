/*
 * @Description: 为table专门设置的render函数
 * @Author: shen
 * @Date: 2019-12-17 17:17:39
 */
export default {
  functional: true,
  props: {
    row: Object,
    render: Function
  },
  render: (h, ctx) => {
    // h是createElement函数，ctx是指当前实例
    let params = {
      row: ctx.props.row
    }
    return ctx.props.render(h, params)
  }
}
