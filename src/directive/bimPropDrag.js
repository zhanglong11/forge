/*
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-22
@任务类型: 复制修改代码，添加左侧属性面板拖拽功能
*/

import Vue from 'vue'
Vue.directive('bimPropDrag', {
  inserted: function(el) {
    let panel = el.parentNode.parentNode // 获取被拖动的元素
    el.onmousedown = e => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - panel.offsetLeft
      const disY = e.clientY - panel.offsetTop

      const screenWidth = document.body.clientWidth // body当前宽度
      const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = panel.offsetWidth // 被拖动的元素宽度
      const dragDomHeight = panel.offsetHeight // 被拖动的元素高度

      const minDragDomLeft = 0
      const maxDragDomLeft = screenWidth - dragDomWidth

      const minDragDomTop = 0
      const maxDragDomTop = screenHeight - dragDomHeight

      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        //console.log(left, top)
        if (left <= minDragDomLeft) {
          left = minDragDomLeft
        } else if (left >= maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (top <= minDragDomTop) {
          top = minDragDomTop
        } else if (top >= maxDragDomTop) {
          top = maxDragDomTop
        }

        panel.style.left = left + 'px'
        panel.style.top = top + 'px'
      }

      document.onmouseup = e => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
})
