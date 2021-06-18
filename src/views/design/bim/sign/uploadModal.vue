<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-25
@任务类型: 全新代码，添加标记上传图片和文件模态框组件
-->
<template>
  <el-dialog title="附件" :visible="visible" :append-to-body="true" @close="closeUploadModal">
    <div class="image-upload">
      <el-upload
        action="/cim6d-design/file/commonFile/upload"
        list-type="picture-card"
        :on-remove="handleRemoveImage"
        style="display: flex;"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
    </div>
    <div class="file-upload">
      <el-upload
        class="upload-demo"
        action="/cim6d-design/file/commonFile/upload"
        :on-remove="handleRemoveFile"
        :before-remove="beforeRemoveFile"
        multiple
        :limit="3"
        :on-exceed="handleExceedFile"
        :file-list="fileList"
      >
        <el-button size="small" type="primary" icon="el-icon-plus">添加文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传非图片文件</div>
      </el-upload>
    </div>

    <div class="upload-btn">
      <el-button @click="closeUploadModal">取消</el-button>
      <el-button type="primary" @click="handleEnter">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: Boolean
  },
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    closeUploadModal() {
      this.$emit('update:visible', false)
    },
    handleRemoveImage(file, fileList) {
      console.log(file, fileList)
    },
    handleRemoveFile(file, fileList) {
      console.log(file, fileList)
    },
    beforeRemoveFile(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleExceedFile(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`
      )
    },
    handleEnter() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="less" scoped>
.image-upload {
  /deep/ .el-upload {
    width: 148px;
  }
}
.file-upload {
  /deep/ .el-upload--text {
    margin-top: 10px;
    text-align: left;
  }
}
.upload-btn {
  margin-top: 10px;
  text-align: right;
}
</style>
