<template>
  <div>
    <el-upload
      ref="upload"
      class="upload"
      :data="data"
      :drag="!isOnlyButton"
      :action="action"
      :headers="headers"
      :value="value"
      name="file"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :show-file-list="showFileList"
      :list-type="listType"
      :auto-upload="autoUpload && !raw"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-change="changeUpload"
      :on-success="handleSuccess"
      :multiple="multiple"
      :accept="accept"
      :on-progress="progress"
      v-bind="$attrs"
    >
      <template v-if="!isOnlyButton">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </template>
      <template v-if="isOnlyButton">
        <div style="text-align:left">
          <el-button slot="trigger" size="small" type="primary">{{ btnText }}</el-button>
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from '@/utils/axios'
export default {
  name: 'Upload',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    // 额外参数
    data: {
      type: Object
    },
    // 上传地址
    action: {
      type: String,
      default: axios.design.defaults.baseURL + `/file/commonFile/upload`
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    value: [Object, Array, File],
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
    },
    listType: {
      type: String,
      default: 'text'
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
      deep: true,
      handler() {
        if (this.raw) {
          let raw = this.fileList.length > 0 ? this.fileList[0].raw : ''
          this.$emit('input', this.multiple ? this.fileList.map(e => e.raw) : raw)
          if (this.elFormItem?.validate) {
            this.elFormItem.validate()
          }
        } else {
          const val = this.fileList
            .filter(e => e?.response?.data || e.id)
            .map(e => e.id || e.response.data)
            .join(',')
          this.$emit('input', val)
          if (this.elFormItem?.validate) {
            this.elFormItem.validate()
          }
        }
      }
    },
    value() {
      if (Object.prototype.toString.call(this.value) === '[object Object]') {
        //对象
        this.fileList = [this.value]
      }
      if (Object.prototype.toString.call(this.value) === '[object Array]') {
        //数组
        this.fileList = this.value
      }
    }
  },
  methods: {
    // 选择文件
    changeUpload(file, fileList) {
      // 由于raw模式会让过beforeUpload验证，所以在此处验证文件格式
      if (this.raw && this.accept) {
        fileList = fileList.filter(e => {
          if (!_.some(this.accept.split(','), string => e.name.toLowerCase().includes(string.toLowerCase()))) {
            this.$message.error('文件格式错误，只允许' + this.accept)
            return false
          }
          return true
        })
      }
      // 如果限制上传一个，则再次上传，会覆盖旧的，如果限制上传一个以上，则会进行提示
      if (this.limit === 1) {
        this.fileList = [_.last(fileList)]
      } else if (this.limit < fileList.length) {
        this.$message.error(`最多上传${this.limit}个`)
        this.fileList = fileList.slice(0, this.limit)
      } else {
        this.fileList = fileList
      }
    },
    progress(e, file, fileList) {
      console.log(e)
      console.log(file)
      console.log(fileList)
    },
    handleChange(file, fileList) {
      this.fileList = this.multiple ? fileList : [file]
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
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
        }
        return false
      }
    },
    handleError(error) {
      this.$message.error(error.status + '：' + error.message)
    },
    handleSuccess(res, file, fileList) {
      if (!this.raw) {
        file.id = file.response.data
      }
      if (this.multiple) {
        this.fileList = fileList
      } else {
        this.fileList = [file]
      }
    },
    submit() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style scoped lang="less"></style>
