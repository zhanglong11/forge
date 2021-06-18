<!--
 * @Description: 重写上传组件 bug#1335 为了解决多文件上传造成的bug 
 * @Version: 
 * @Autor: 申豪强
 * @Date: 2020-04-01 17:57:54
 * @LastEditTime: 2020-05-14 18:30:37
 -->

<template>
  <div>
    <el-upload
      ref="upload"
      class="upload"
      :data="data"
      :drag="!isOnlyButton"
      :action="action"
      :headers="headers"
      :list-type="listType"
      name="file"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :show-file-list="!isOnlyButton"
      :auto-upload="autoUpload"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :multiple="multiple"
      :accept="accept"
    >
      <template v-if="!isOnlyButton && !breviary">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </template>
      <template v-if="isOnlyButton && !breviary">
        <div style="text-align:left">
          <el-button slot="trigger" size="small" type="primary">{{ btnText }}</el-button>
        </div>
      </template>
      <slot />
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  name: 'US',
  props: {
    // 文件列表类型
    listType: {
      type: String,
      default: 'text'
    },
    // 缩略
    breviary: {
      type: Boolean,
      default: false
    },
    // 已上传文件ids
    ids: {},
    // 额外参数
    data: {
      type: Object
    },
    // 上传地址
    action: {
      type: String,
      default: `/cim6d-design${process.env.VUE_APP_BASE_API}/file/commonFile/upload`
    },
    // 多选
    multiple: {
      type: Boolean,
      default: false
    },
    type: {
      //  文件模块类型
      type: Number
    },
    // 验证
    raw: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    name: {
      type: String
    },
    isOnlyButton: {
      type: Boolean,
      default: false
    },
    // 接受上传的文件类型（thumbnail-mode 模式下此参数无效）
    accept: {
      type: String,
      default: ''
    },
    btnText: {
      type: String,
      default: '选取文件'
    },
    // 最大允许上传个数
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      fileList: [],
      headers: {
        'x-access-token': getToken()
      }
    }
  },
  watch: {
    fileList: {
      handler: function(n, o) {
        console.log(n)
      }
    },
    ids: {
      handler: function(n, e) {
        if (typeof n === 'string') {
          this.getFileList()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 进度条
    progress(e, file, fileList) {
      this.fileList.forEach(item => {
        if (item.percentage === 100) {
        } else {
          item.progressFlag = true
          item.progressPercent = Math.abs(item.percentage.toFixed(0))
        }
      })
    },
    // 文件查询接口:等待接口完善
    async getFileList() {
      return
      let arr = this.ids ? this.ids.split(',') : []
      if (arr.length === 0) {
        this.fileList = []
        return
      }
      let res = await api.getFileList(arr)
      this.fileList = res.data.map(item => {
        let obj = {
          name: item.fileName,
          id: item.id,
          commonFileId: item.commonFileId
        }
        return obj
      })
    },
    handleRemove(file, fileList) {
      if (file?.status === 'success') {
        this.fileList = this.fileList.filter(item => item.id !== file.id)
        this.$emit('input', this.fileList)
      }
    },
    beforeUpload(file) {
      if (this.raw) {
        if (this.accept) {
          if (!_.some(this.accept.split(','), string => file.name.includes(string))) {
            this.$message.error('文件格式错误，只允许' + this.accept)
            this.fileList.splice(-1, 1)
            return false
          } else {
            this.$emit('input', file)
          }
        } else {
          this.$emit('input', file)
          console.log(file)
        }
        return false
      }
    },
    handleError(error) {
      this.$message.error(error.status + '：' + error.message)
    },
    // 解决上传bug
    handleSuccess(res, file, fileList) {
      let list = []
      if (res.code === 200) {
        if (this.multiple) {
          if (fileList.some(item => typeof item.response === 'undefined')) return
          this.fileList = []
          list = fileList.map(item => {
            let obj = {
              name: item.name,
              id: item.id ? item.id : item.response.data
            }
            return obj
          })
        } else {
          this.fileList = []
          list = [{ name: file.name, id: res.data }]
        }
        console.log(this.fileList)
        this.$emit('input', list)
      }
    },
    submit() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style scoped lang="less"></style>
