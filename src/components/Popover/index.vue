<!--
 * @Description: 弹窗框，暂不定slot
 * @Author:
 * @Date: 2020-01-11 14:04:55
 -->
<template>
  <div>
    <transition name="fade">
      <div v-show="true" class="text-box" :style="{ left: popoverLeft, bottom: popoverTop }">
        <!-- 文字内容区 -->
        <div class="text-box-content">
          <slot />
        </div>
        <!-- 三角 -->
        <div class="text-box-triangle"></div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Popover',
  props: {
    showText: {
      default: false
    },
    popoverLeft: {
      default: 0
    },
    popoverTop: {
      default: 0
    }
  }
}
</script>

<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.text-box {
  margin-bottom: 12px;
  background: #fff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  color: #606266;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  word-break: break-all;
  padding: 14px 16px;
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 1000;
  &-triangle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -12px;
    width: 0;
    height: 0;
    border-width: 6px;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
  }
}
</style>
