<template>
  <div>
    <el-dialog
      class="beauty"
      el-dialog
      title="上传分析文件"
      :visible="visible"
      width="450px"
      :close-on-click-modal="false"
      @close="close"
    >
      <el-form
        ref="form"
        :model="form"
        style="width: 350px; margin-top: 10px; margin-left: 10px"
        label-width="150px"
        :rules="rules"
      >
        <el-form-item ref="file" label="分析文件" prop="file">
          <Upload v-model="form.file" raw isOnlyButton class="upload-demo" name="file" :limit="1" accept=".xml">
            <el-button size="small" type="primary">导入分析文件</el-button>
          </Upload>
        </el-form-item>
      </el-form>
      <footer slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="btnSubmit">确定</el-button>
      </footer>
    </el-dialog>
  </div>
</template>
<script>
import api from '@/api/bim/statistics'
export default {
  name: 'CrashAnalyzeDialog',
  props: {
    // 弹窗是否显示
    visible: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      form: {
        file: null
      },
      viewId: this.$store.state.bim.bim3DArr[0].id,
      btnLoading: false,
      rules: {
        file: [{ required: true, message: '必选' }]
      }
    }
  },
  created() {},
  methods: {
    async btnSubmit() {
      try {
        this.btnLoading = true
        await this.$refs.form.validate()
        const formData = new FormData()
        formData.append('file', this.form.file)
        formData.append('viewId', this.viewId)
        await api.getCrashAnalyzeImport(formData).then(res => {
          this.btnLoading = false
          if (res.code === 200) {
            this.$message.success('上传成功')
            this.close()
            this.$parent.refresh()
          } else {
            this.$message.error('上传失败')
          }
        })
      } catch (e) {
        this.btnLoading = false
      }
    },
    // 关闭弹窗
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
      this.form = {}
    }
  }
}
</script>
