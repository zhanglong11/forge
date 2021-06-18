<!--
 * @Description: 拖拽盒子
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-22 11:02:28
 * @LastEditTime: 2020-05-19 15:45:07

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-22
@任务类型: 修改代码，修改左侧属性面板样式，添加拖拽指令功能，修改比例(1%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-23
@任务类型: 修改代码，左侧属性面板添加透明效果，修改比例(5%)
 -->
<template>
  <!--<div class="drag-box clearfix" :style="'width:' + width">-->
  <div class="drag-box clearfix">
    <header class="drag-box-title">
      <!--<header v-bim-prop-drag  class="drag-box-title">-->
      <p class="title">{{ title }}</p>
      <p class="drag-btn-box">
        <i v-if="addFlag" class="el-icon-circle-plus add" @click="add"></i>
        <!--<i class="el-icon-close close" @click="close"></i>-->
      </p>
    </header>
    <div class="drag-box-content">
      <slot></slot>
    </div>
    <div class="masking"></div>
  </div>
</template>

<script>
export default {
  name: 'Drag',
  props: {
    // width: {
    //   default: '420px'
    // },
    // 标题
    title: {
      type: String
    },
    // 是否有新增按钮
    addFlag: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    close() {
      this.$emit('close')
    },
    add() {
      this.$emit('add')
    }
  }
}
</script>
<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-24
@任务类型: 修改代码，左侧属性面板添加高度控制，修改比例(2%)
-->
<style lang="less" scoped>
.drag-btn-box {
  /*width: 12%;*/
  text-align: right;
  height: 30px;
  line-height: 30px;
}
.drag-box {
  width: 100%;
  height: 100%;
  // float: right;
  &-title {
    display: flex;
    justify-content: space-between;
    height: 60px;
    padding: 10px;
    cursor: move;
    background: #fff;
    align-items: center;
    .title {
      font-size: 18px;
    }
    .add {
      color: #5085bf;
      font-size: 22px;
      margin-top: 4px;
    }
    .close {
      cursor: pointer;
    }
  }
  &-content {
    height: calc(100% - 56px);
    padding: 10px;
    overflow: auto;
  }
  .add {
    cursor: pointer;
  }
  .margin-right {
    margin-right: 6px;
  }
  .masking {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: #ccc;
    opacity: 0.5;
    z-index: -1;
  }
}
</style>
