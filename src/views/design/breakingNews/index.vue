<!--
 * @Description: 大事记富文本
 * @Author: 
 * @Date: 2020-01-19 18:17:16
 -->
<template>
  <div>
    <el-form ref="breakingNewForm" :model="content" :rules="rules" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="content.title"></el-input>
      </el-form-item>
      <el-form-item label="事件时间" prop="occurTime">
        <el-date-picker
          v-model="content.occurTime"
          value-format="yyyy-MM-dd hh:mm:ss"
          type="date"
          placeholder="选择日期"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="内容" required class="conetnt">
        <div id="editor"></div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import wangeditor from 'wangeditor'
import { getToken } from '@/utils/auth' // get token from cookie
import api from '@/api/design/dynamic'
export default {
  name: 'BreakingNew',
  data() {
    return {
      content: {
        title: '',
        projectId: localStorage.getItem('projectId'),
        content: '',
        occurTime: ''
      },
      rules: {
        title: { required: true, message: '标题必填', trigger: 'blur' },
        occurTime: { required: true, message: '时间必填', trigger: 'blur' }
      },
      editor: null
    }
  },
  mounted() {
    this.initeditor()
    if (this.$route.query.id) {
      this.getDetails()
    }
  },
  methods: {
    async getDetails() {
      let res = await api.breakingNewsDetails(this.$route.query.id)
      this.editor.txt.html(res.data.content)
      this.content = res.data
    },
    save() {
      let html = this.editor.txt.html()
      if (!html) {
        return this.$message.error('请填写内容')
      }
      this.content.content = html
      this.$refs['breakingNewForm'].validate(valid => {
        if (valid) {
          if (this.$route.query.id) {
            this.editSave()
          } else {
            this.saveSure()
          }
        }
      })
    },
    async saveSure() {
      let res = await api.addBreakingNews(this.content)
      this.$message.success('保存成功')
      this.$router.push({ name: 'Dynamic' })
    },
    async editSave() {
      this.content.id = this.$route.query.id
      let res = await api.editBreakingNews(this.content)
      this.$message.success('保存成功')
      this.$router.push({ name: 'Dynamic' })
    },
    // 初始化富文本编辑器
    initeditor() {
      let g = this
      g.editor = new wangeditor('#editor')
      g.editor.customConfig = {
        onchange: function(html) {},
        menus: [
          'head', // 标题
          'bold', // 粗体
          'fontSize', // 字号
          'fontName', // 字体
          'italic', // 斜体
          'underline', // 下划线
          'strikeThrough', // 删除线
          'foreColor', // 文字颜色
          'backColor', // 背景颜色
          'link', // 插入链接
          'list', // 列表
          'justify', // 对齐方式
          'quote', // 引用
          'emoticon', // 表情
          'image', // 插入图片
          'table', // 表格
          'video', // 插入视频
          'code', // 插入代码
          'undo', // 撤销
          'redo', // 重复
          'fullscreen' // 全屏
        ],
        showLinkImg: true,
        uploadImgShowBase64: false,
        uploadImgServer: '/colliery-file/api/file/localUpload/1',
        // 上传文件名key
        uploadFileName: 'file',
        uploadImgParams: {
          'x-access-token': getToken()
        },
        uploadImgHooks: {
          // before: function(xhr, editor, files) {
          //   console.log(xhr)
          //   console.log(editor)
          //   console.log(files)
          // },
          // success: function(xhr, editor, result) {
          //   console.log('上传成功')
          // },
          // fail: function(xhr, editor, result) {
          //   console.log('上传失败,原因是' + result)
          // },
          // error: function(xhr, editor) {
          //   console.log('上传出错')
          // },
          // timeout: function(xhr, editor) {
          //   console.log('上传超时')
          // },
          customInsert: function(insertImg, result, editor) {
            insertImg(result.data.url)
          }
        }
      }
      g.editor.create()
    }
  }
}
</script>
<style lang="less" scoped>
.conetnt {
  /deep/ .el-form-item__content {
    z-index: 100;
  }
}
</style>
