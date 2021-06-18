<!--
 * @Description: 上传文件
 * @Version:
 * @Autor:
 * @Date: 2020-02-21 10:07:40
 * @LastEditTime: 2020-06-12 17:42:24
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
    <!-- 上传 -->
    <el-dialog v-dialogDrag :lock-scroll="false" :visible.sync="uploadVisible" @close="uploadClose">
      <el-form label-width="80px">
        <el-form-item label="标签">
          <div>
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
          </div>
        </el-form-item>
        <el-form-item label="上传文件">
          <!-- 
            任务名称：1143 | 上传文件带出上次上传的，加v-if强制刷新
            开发人员：申豪强
            日期：2020-03-27
            BUG类型：测试人员提出的系统性BUG
          -->
          <!-- <US  v-if="uploadVisible" class="upload-file" :multiple="true"  @input="handleUpload" /> -->
          <Upload v-if="uploadVisible" @input="handleUpload" :multiple="true" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadVisible = false">退 出</el-button>
        <el-button type="primary" @click="uploadSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import US from '_c/UploadStorage/index'
import api from '@/api/design/file'
export default {
  name: 'UploadFile',
  components: {
    // US
  },
  props: {
    pid: {},
    module: {}
  },
  data() {
    return {
      // 上传
      uploadVisible: false,
      // tag列表
      dynamicTags: [],
      inputValue: null,
      // 上传文件id
      commonFileId: [],
      inputVisible: false
    }
  },
  methods: {
    // 新增标签
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 上传成功操作
    handleUpload(e) {
      let arr=[]
      for(let item of e){
        console.log(item)
        if(typeof item ==='string') {
          arr.push(item)
        }else{
          if(typeof item !== 'undefined'&&item.response&&item.response.code===200){
            console.log(item.response.data)
            arr.push(item.response.data)
          }
          
        }
      }
      this.commonFileId=arr
    },
    show() {
      this.uploadVisible = true
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
    // 上传modal关闭
    uploadClose() {
      this.dynamicTags = []
      this.commonFileId = []
      this.uploadVisible = false
      this.$emit('updateTable')
    },
    // 上传成功保存
    async uploadSure() {
      let fileTag = this.dynamicTags.join(',')
      // let obj = {
      //   commonFileId: this.commonFileId,
      //   fileTag: fileTag,
      //   folderId: this.pid,
      //   id: '',
      //   module: this.module,
      //   projectId: localStorage.getItem('projectId')
      // }
      console.log(this.commonFileId)
      if(this.commonFileId.length===0) return this.$message.error("请上传文件")
      let arr=[]
      for(let item of  this.commonFileId){
        arr.push({
          commonFileId: item,
          fileTag: fileTag,
          folderId: this.pid,
          id: '',
          module: this.module,
          projectId: localStorage.getItem('projectId')
        })
      }
      let res = await api.batchSaveFile(arr)
      this.uploadClose()
    }
  }
}
</script>

<style lang="scss" scoped></style>
