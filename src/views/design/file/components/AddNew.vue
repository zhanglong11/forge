<!--
 * @Description: 新增文件
 * @Version:
 * @Autor:
 * @Date: 2020-02-21 16:26:56
 * @LastEditTime: 2020-04-23 09:39:32
 -->

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

<template>
  <div>
    <!-- 新增账号 -->
    <el-dialog
      v-dialogDrag
      :lock-scroll="false"
      :title="creatFolderForm.id ? '重命名' : '新建文件夹'"
      :visible.sync="creatFolderFlag"
      width="500"
      @close="creatFolderClose"
    >
      <el-form ref="creatFolder" :model="creatFolderForm" label-width="120px" :rules="creatFolderRules">
        <el-form-item label="文件夹名称" prop="name">
          <el-input v-model="creatFolderForm.name"></el-input>
        </el-form-item>
        <el-form-item label="标签" prop="fileTag">
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
            >{{ tag }}</el-tag
          >
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增标签</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="creatFolderFlag = false">取 消</el-button>
        <el-button type="primary" @click="creatFolderSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api/design/file'
export default {
  data() {
    return {
      inputValue: null,
      creatFolderFlag: false,
      inputVisible: false,
      creatFolderForm: {
        departmentId: null, //一级id
        fileTag: '',
        id: '',
        name: '',
        pid: '',
        projectId: localStorage.getItem('projectId'),
        taskUniqueId: '' //里程碑id
      },
      dynamicTags: [],
      creatFolderRules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      // 传进来的form，禁止修改
      propsForm: {}
    }
  },
  watch: {
    dynamicTags(e) {
      console.log(e)
    }
  },
  methods: {
    show(form) {
      /*
       * @任务编号: 2795 | 重命名新增标签更改
       * @开发人员:申豪强
       * @日期:2020-04-02
       * @代码类型：功能调整
       */
      let copy = JSON.parse(JSON.stringify(form))
      this.propsForm = copy
      if (copy.id) {
        this.creatFolderForm.id = copy.id
        this.creatFolderForm.name = copy.name
        this.creatFolderForm.type = copy.type
        if (copy.fileTag) {
          this.dynamicTags = copy.fileTag.split(',')
        }
      } else {
        this.creatFolderForm.name = null
      }
      this.creatFolderFlag = true
    },
    creatFolderClose() {
      this.propsForm = {}
      this.creatFolderForm.id = null
      this.creatFolderForm.name = null
      this.creatFolderForm.type = null
      this.$nextTick(() => {
        this.$refs.creatFolder.resetFields()
      })
      this.creatFolderFlag = false
      this.dynamicTags = []
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    // 新增标签
    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    // 新增+重命名点击确认
    creatFolderSure() {
      this.$refs.creatFolder.validate(valid => {
        if (valid) {
          if (this.creatFolderForm.id) {
            //重命名
            this.rename()
          } else {
            //新增
            this.addFolderSubmit()
          }
        }
      })
    },
    // 新增确认
    async addFolderSubmit() {
      let fileTag = this.dynamicTags.join(',')
      let copy = JSON.parse(JSON.stringify(this.creatFolderForm))
      copy.departmentId = this.propsForm.departmentId
      copy.taskUniqueId = this.propsForm.taskUniqueId
      copy.folderTag = fileTag
      copy.pid = this.propsForm.pid
      copy.module = this.propsForm.module
      let res = await api.addFolder(copy)
      this.addFolderSuccess()
      this.$emit('updateTree')
    },
    async rename() {
      let obj = {
        id: this.propsForm.id,
        name: this.creatFolderForm.name,
        type: this.propsForm.type
      }
      let res = await api.rename(obj)
      this.addFolderSuccess()
      this.$emit('updateTree')
    },
    // 成功后操作
    addFolderSuccess() {
      this.creatFolderFlag = false
      this.$refs.creatFolder.resetFields()
      this.$emit('updateTable')
    },
    // 新增标签
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
