<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-24
@任务类型: 全新代码，添加批注列表组件、批注编辑表单、批注面板样式调整

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-26
@任务类型: 修改代码，绑定批注列表数据，修改比例(15%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，对接批注删除接口，修改用户头像变量，修改比例(5%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，对接批注编辑接口，添加批注创建时间，修改比例(8%)
-->
<!--
  @任务名称: 3098 批注模块接口对接
  @开发人员: 申豪强
  @修改日期: 2020-05-18
-->
<template>
  <div class="annotation-item">
    <header class="flex-base">
      <div class="user-info flex-base">
        <div>
          <img :src="item.headPhotoUrl ? item.headPhotoUrl : defaultImg" />
          <span v-if="!item.editStatus">{{ item.name }}</span>
        </div>
        <el-input v-if="item.editStatus" v-model="item.name" />
      </div>

      <el-button v-if="!item.editStatus" type="text" @click="handleEdit(item.id)">编辑</el-button>
    </header>
    <div class="item-textarea">
      <div v-if="!item.editStatus">{{ item.content }}</div>
      <el-input v-if="item.editStatus" v-model="item.content" type="textarea" :rows="3" resize="none" />
    </div>
    <div class="item-image">
      <img :src="item.img" @click="setView(item)" />
    </div>

    <div v-if="!item.editStatus" class="item-bottom">
      <el-button type="text" icon="el-icon-s-promotion" @click="sendMessage">发送</el-button>
      <el-button type="text" icon="el-icon-chat-dot-square" @click="showLeaveForm">留言</el-button>
      <el-button type="text" icon="el-icon-delete" @click="deleteAnnotation(item.id)">删除</el-button>
    </div>
    <div v-show="item.sendFlag">
      <SelectUser v-model="selectUser" />
      <div class="flex-base send-user">
        <el-button @click="sendCancel">取消</el-button>
        <el-button type="primary" @click="sendSure">发送</el-button>
      </div>
    </div>

    <div class="leave-list">
      <div v-for="message in item.messageList" :key="message.id" class="leave-item">
        <div class="leave-top">
          <div>
            <img :src="message.headPhotoUrl ? message.headPhotoUrl : defaultImg" />
            <span>{{ message.creatorName }} 留言：</span>
          </div>
          <div>{{ message.createTime }}</div>
        </div>
        <div class="leave-content">{{ message.content }}</div>
        <div v-if="userInfo.id === message.creator" class="leave-bottom">
          <el-button type="text" @click="deleteBimPostilMessage(message.id)">删除</el-button>
        </div>
      </div>
    </div>
    <div v-if="visibleLeaveForm" class="leave-form">
      <el-input v-model="leaveText" type="textarea" resize="none" :rows="4" />
      <div>
        <el-button type="primary" @click="addBimPostilMessage">发送留言</el-button>
        <el-button @click="closeLeaveForm">取消</el-button>
      </div>
    </div>
    <div v-if="item.editStatus" class="btn-box">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script>
import SelectUser from '_c/SelectUser/index'
import defaultImg from '../../../../assets/defaultImg/default.png'
import api from '@/api/bim/postil'
import { getParams } from '@/utils/index'
export default {
  components: {
    SelectUser
  },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      id: '',
      textName: '',
      content: '',
      editStatus: false,
      // 留言内容
      leaveText: '',
      visibleLeaveForm: false,
      defaultImg: defaultImg,
      selectUser: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    },
    userInfo() {
      return this.$store.state.user.userInfo
    }
  },
  methods: {
    // 发送留言
    sendMessage() {
      this.$set(this.item, 'sendFlag', true)
    },
    sendCancel() {
      this.$set(this.item, 'sendFlag', false)
    },
    async sendSure() {
      if (this.selectUser.length === 0) return this.$message.success('请选择接收人')
      let receiverIdsArr = this.selectUser.map(item => item.id)
      let form = {
        postilId: this.item.id,
        receiverIdsArr: receiverIdsArr
      }
      let res = await api.sendMessage(form)
      this.$message.success('发送成功')
      this.sendCancel()
    },
    // 取消
    cancel() {
      this.item.editStatus = false
    },
    // /添加留言
    async addBimPostilMessage() {
      let form = {
        postilId: this.item.id,
        content: this.leaveText
      }
      let res = await api.addBimPostilMessage(form)
      // 添加成功
      this.closeLeaveForm()
      this.$emit('refresh')
      this.$message.success('添加成功')
    },
    // 删除留言
    async deleteBimPostilMessage(id) {
      let res = await api.deleteBimPostilMessage(id)
      this.$message.success('删除成功')
      this.$emit('refresh')
    },
    // 编辑操作
    handleEdit(id) {
      this.$set(this.item, 'editStatus', true)
      this.id = id
    },
    // 显示留言表单
    showLeaveForm() {
      this.visibleLeaveForm = true
    },
    // 隐藏留言表单
    closeLeaveForm() {
      this.visibleLeaveForm = false
      this.leaveText = ''
    },
    // 保存修改
    handleSave() {
      if (!this.item.name) {
        this.$message.error('请输入批注名称')
        return
      }
      if (this.item.id) {
        api.updateBimPostil(this.item).then(res => {
          this.$message.success('编辑成功')
          this.item.editStatus = false
          this.$emit('refresh')
        })
      } else {
        let form = {
          batchCode: this.$store.state.bim.batchCode,
          content: this.item.content,
          name: this.item.name,
          img: this.item.img,
          projectFileId: getParams('fileId'),
          projectId: localStorage.getItem('projectId'),
          version: this.$store.state.bim.versionInfo.version,
          state: this.item.state
        }
        api.addBimPostil(form).then(res => {
          this.$message.success('新增成功成功')
          this.item.editStatus = false
          this.$emit('refresh')
        })
      }
    },
    // 设置视点
    setView(item) {
      this.bimfishApp.viewer.restoreState(JSON.parse(item.state))
      this.$emit('showBigImg', item.img)
    },
    // 删除批注
    deleteAnnotation(id) {
      this.$confirm('确定要删除此批注吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.deleteBimPostil(id).then(res => {
            this.$message.success('删除成功')
            this.$emit('refresh')
          })
        })
        .catch(() => {
          console.log('取消')
        })
    }
  }
}
</script>

<style lang="less">
.send-user {
  margin-top: 10px;
  button {
    width: 40%;
  }
}
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-box {
  padding-top: 4px;
  display: flex;
  justify-content: space-between;
  button {
    width: 40%;
  }
}
.user-info {
  width: 60%;
  justify-content: flex-start;
  img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    overflow: hidden;
    background: #f5f5f5;
    // display: block;
    vertical-align: middle;
    margin-right: 10px;
  }
}
.annotation-item {
  background: #fff;
  border-radius: 4px;
  border: solid 1px #e5e5e5;
  margin-bottom: 8px;
  padding: 4px;
  .item-textarea {
    margin-top: 4px;
    > div {
      font-size: 14px;
    }
  }
  .item-image {
    margin-top: 4px;
    font-size: 0px;
    cursor: pointer;
    img {
      width: 100%;
      height: 200px;
      border-radius: 4px;
      overflow: hidden;
      background: #f5f5f5;
    }
  }
  .item-bottom {
    margin-top: 4px;
    border-top: solid 1px #e5e5e5;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 4px 15px;
  }
  .leave-form {
    > div {
      padding-top: 10px;
      // display: flex;
      // justify-content: space-between;
      text-align: right;
    }
  }
  .leave-list {
    .leave-item {
      margin-top: 4px;
      border: solid 1px #e5e5e5;
      border-radius: 4px;
      padding: 4px;
      .leave-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        border-bottom: dashed 1px #e5e5e5;
        padding-bottom: 4px;
        > div:nth-child(1) {
          font-size: 0px;
          display: flex;
          align-items: center;
          img {
            width: 28px;
            height: 28px;
          }
          span {
            font-size: 12px;
            padding-left: 4px;
          }
        }
      }
      .leave-content {
        font-size: 12px;
        padding: 4px;
      }
      .leave-bottom {
        text-align: right;
      }
    }
  }
}
</style>
