<!--
/*
 弹框的改进：2512
 任务描述 目前弹框不可移动，会遮挡页面内容不太方便。需要进行修改：
 1、弹框可移动。
 2、遮挡的页面支持鼠标滚轮上下移动。
 开发人员：李建敏
 日期：2020-3月-16日
 任务类型：2、复制修改代码 1行
*/
-->
<!--
/**
任务名称：2936/设计模块审批功能添加文件列表
开发人员：李建敏
日期：2020-4月-13日
任务类型：2.修改代码(5行)
**/
-->

<template>
  <span>
    <a v-if="type !== 'other'" :class="{ disabled: type === 'other' || !file }" @click="visible = true">
      <slot>预览</slot>
    </a>
    <el-tooltip v-else class="item" effect="dark" content="暂不支持预览" placement="right">
      <a :class="{ disabled: type === 'other' || !file }">
        <slot>预览</slot>
      </a>
    </el-tooltip>
    <el-dialog
      v-if="file"
      v-dialogDrag
      :lock-scroll="false"
      width="1000px"
      top="30px"
      destroy-on-close
      :visible.sync="visible"
      :append-to-body="appendToBody"
    >
      <img v-if="type === 'img'" class="preview-image" :src="file.fileUrl" alt="" />
      <video v-if="type === 'video'" autoplay class="preview-video" width="100%" controls :src="file.fileUrl" alt="" />
      <iframe v-if="type === 'office'" ref="iframe" width="100%" style="height: calc(100vh - 120px)"></iframe>
    </el-dialog>
  </span>
</template>

<script>
const imgReg = /(.*)\.(jpg|png|jepg|gif|webp)$/
const videoReg = /(.*)\.(mp4|mkv|ogg|webm)$/
const officeReg = /(.*)\.(doc|xls|xlsx|docx|ppt|pptx|pdf|txt)$/
export default {
  name: 'Preview',
  props: {
    file: {
      type: Object, // should be {fileUrl:'',id:'',type:''}
      required: true
    },
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    type() {
      if (!this.file) return 'other'
      if (imgReg.test(this.file.fileUrl)) {
        return 'img'
      } else if (videoReg.test(this.file.fileUrl)) {
        return 'video'
      } else if (officeReg.test(this.file.fileUrl)) {
        return 'office'
      } else {
        return 'other'
      }
    }
  },
  watch: {
    visible(val) {
      if (val && this.type === 'office') {
        this.axios
          .post(
            '/colliery-file/api/file/onlinePreview',
            {},
            { params: { url: this.file.fileUrl }, baseURL: '', responseType: 'arraybuffer', timeout: 20000 }
          )
          .then(res => {
            const blob = new Blob([res.data], { type: 'application/pdf' })
            this.$refs.iframe.src = URL.createObjectURL(blob)
          })
      }
    }
  }
}
</script>

<style scoped lang="less">
.preview-image {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}
.disabled {
  color: #333;
  cursor: not-allowed;
}
</style>
