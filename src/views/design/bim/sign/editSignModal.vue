<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-25
@任务类型: 全新代码，添加标记新增(编辑)模态框组件

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，引入接收人组件、截止时间组件、调整标记模态框样式细节，修改比例(6%)
-->
<template>
  <div v-if="visible" class="sign-modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="sign-form-content">
      <div class="sign-form">
        <div class="form-top">
          <span class="sign_tit">{{ title }}</span>
          <el-button type="text" @click="closeSignModal">关闭</el-button>
        </div>
        <div class="form-head">
          <div>
            <div @click="catchsign"><img src="/static/bim/u179.png" style="width: 44px; height: 44px;" /></div>
            <div><el-input v-model="form.stampName" size="mini" style="width:100%;" placeholder="标记名称" /></div>
          </div>
          <div>
            <el-radio-group v-model="status" @change="radioChange">
              <el-radio :label="1" border class="not-sure">未确认</el-radio>
              <el-radio :label="2" border class="has-sure">已确认</el-radio>
              <el-radio :label="3" border class="has-solve">已解决</el-radio>
              <el-radio :label="4" border class="has-close">已关闭</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div style="padding: 8px;">
          <el-input v-model="form.description" type="textarea" :rows="2" resize="none" />
        </div>
        <div class="form-item">
          <div>严重级别</div>
          <div class="severity">
            <el-select v-model="form.level" size="mini" style="width:100%;">
              <el-option label="紧急" :value="5"></el-option>
              <el-option label="一般" :value="6"></el-option>
            </el-select>
          </div>
        </div>
        <div class="form-item">
          <div>截止时间</div>
          <div class="dateinput">
            <el-date-picker
              v-model="form.expirationDate"
              type="date"
              size="mini"
              style="width:100%;"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </div>
        </div>
        <div class="form-item">
          <div>接收人</div>
          <div class="recipient"><SelectUser v-model="recipient"></SelectUser></div>
        </div>
        <div class="form-item">
          <div>上传附件</div>
          <div>
            <UploadModal :isOnlyButton="true" @input="fileChange" />
          </div>
        </div>
        <div class="form-upload">
          <el-table :data="tableData" style="width: 100%" max-height="250" header-align="center">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="name" label="文件列表" align="center">
              <template slot-scope="{ row }">
                <el-button type="text" size="small">{{ row.name }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" @click="remove(scope.$index, tableData)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="form-save">
          <el-button style="width: 100%;" type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UploadModal from '_c/UploadStorage/index'
import moment from 'moment'
import fileApi from '@/api/design/file'
import { getParams } from '@/utils/index'
import preview from '@/utils/preview'
export default {
  components: { UploadModal },
  props: {
    visible: Boolean,
    editForm: {},
    // 阶段名
    stageName: {},
    // 位置信息
    position: {},
    title: String
  },
  data() {
    return {
      form: {},
      status: 1,
      signName: '',
      radio: undefined,
      content: '',
      level: undefined,
      deadline: undefined,
      recipient: undefined,
      visibleUpload: false,
      // 文件信息
      tableData: []
    }
  },
  watch: {
    editForm: {
      immediate: true,
      handler: function(e) {
        this.form = JSON.parse(JSON.stringify(this.editForm))
        if (this.editForm) {
          // 接收人
          if (this.editForm.receivedPerson && this.editForm.receivedPersonName) {
            let participant = []
            let ids = this.editForm.receivedPerson.split(',')
            let names = this.editForm.receivedPersonName.split(',')
            for (let i = 0; i < this.editForm.receivedPerson.split(',').length; i++) {
              let item = {
                id: ids[i],
                name: names[i],
                label: names[i]
              }
              participant.push(item)
            }
            this.recipient = participant
          }
          if (this.editForm.commonFileList) {
            this.tableData = this.editForm.commonFileList.map(item => {
              return {
                id: item.id,
                name: item.fileName
              }
            })
          }
        }
      }
    }
  },
  methods: {
    radioChange(val) {
      this.status = val
    },
    fileChange(e) {
      this.tableData.push(...e)
    },
    // 预览
    async preview(row) {
      preview(row)
    },
    // 移除
    remove(index, rows) {
      rows.splice(index, 1)
    },
    closeSignModal() {
      this.recipient = []
      this.form = {}
      this.tableData = []
      this.$emit('closeSignModal')
    },
    closealert() {
      this.$message.warning('请先关闭弹框')
    },
    showUpload() {
      this.visibleUpload = true
    },
    catchsign() {},
    handleSave() {
      console.log(this.recipient)
      if (!this.form.status) return this.$message.error('状态必选')
      if (!this.form.stampName) return this.$message.error('标记名称必填')
      if (!this.recipient) return this.$message.error('接收人必选')
      if (!this.form.id && !this.position) return this.$message.error('请添加标记')
      let form = {
        batchCode: this.$store.state.bim.batchCode,
        description: this.form.description,
        expirationDate: this.form.expirationDate,
        fileIds: this.tableData.map(item => item.id).join(','),
        level: this.form.level,
        projectFileId: this.form.projectFileId ? this.form.projectFileId : getParams('fileId'),
        projectId: this.form.projectId ? this.form.projectId : localStorage.getItem('projectId'),
        receivedPerson: this.recipient ? this.recipient.map(item => item.id).join(',') : '',
        receivedPersonName: this.recipient ? this.recipient.map(item => item.name).join(',') : '',
        stageName: this.form.stageName ? this.form.stageName : this.stageName,
        stampName: this.form.stampName,
        status: this.form.status,
        version: this.form.version ? this.form.version : this.$store.state.bim.versionInfo.version,
        position: this.form.position ? this.form.position : JSON.stringify(this.position),
        id: this.form.id
      }
      // return
      this.$emit('saveMark', form)
    }
  }
}
</script>

<style lang="less" scoped>
@notSure: red;
@hasSure: rgb(254, 148, 0);
@hasSolve: rgb(85, 202, 134);
@hasclose: rgb(153, 153, 153);
.sign-modal {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  // 未确认
  /deep/ .not-sure.is-bordered.is-checked {
    border-color: @notSure;
  }
  /deep/ .not-sure.is-checked {
    .el-radio__label {
      color: @notSure;
    }
    .el-radio__inner {
      border-color: @notSure;
      background: @notSure;
    }
  }
  // 已确认
  /deep/ .has-sure.is-bordered.is-checked {
    border-color: @hasSure;
  }
  /deep/ .has-sure.is-checked {
    .el-radio__label {
      color: @hasSure;
    }
    .el-radio__inner {
      border-color: @hasSure;
      background: @hasSure;
    }
  }
  // 已解决
  /deep/ .has-solve.is-bordered.is-checked {
    border-color: @hasSolve;
  }
  /deep/ .has-solve.is-checked {
    .el-radio__label {
      color: @hasSolve;
    }
    .el-radio__inner {
      border-color: @hasSolve;
      background: @hasSolve;
    }
  }
  // 已关闭
  /deep/ .has-close.is-bordered.is-checked {
    border-color: @hasclose;
  }
  /deep/ .has-close.is-checked {
    .el-radio__label {
      color: @hasclose;
    }
    .el-radio__inner {
      border-color: @hasclose;
      background: @hasclose;
    }
  }
  .mask {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: transparent;
    /*opacity: 0.5;*/
  }
  .sign-form-content {
    padding: 6px 10px;
    width: 360px;
    //height: 400px;
    position: absolute;
    bottom: 0px;
    right: 0;
    .sign-form {
      background: #fff;
      //height: 100%;
      border-radius: 4px;
      .form-top {
        text-align: right;
        padding-right: 10px;
        margin-bottom: 10px;
        height: 30px;
        .sign_tit {
          float: left;
          font-size: 14px;
          padding-left: 10px;
          line-height: 30px;
          font-weight: bold;
        }
      }
      .form-head {
        /*display: flex;*/
        /*justify-content: space-between;*/
        > div:nth-child(1) {
          display: block;
          width: 100%;
          overflow: hidden;
          /*align-items: center;*/
          > div {
            float: left;
          }
          > div:nth-child(1) {
            margin-left: 10px;
          }
          > div:nth-child(2) {
            width: calc(100% - 75px);
            margin-left: 10px;
            position: relative;
            top: 8px;
          }
        }
        > div:nth-child(2) {
          /*display: flex;*/
          /*align-items: center;*/
          /*padding-left: 20px;*/
          width: 100%;
          overflow: hidden;
          /deep/ .el-radio-group {
            float: left;
            label {
              margin: 5px 7px;
            }
            /deep/.el-radio--small.is-bordered {
              padding: 8px 5px 0;
            }
          }
        }
      }
      .form-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 8px;
        align-items: center;
        font-size: 14px;
        .severity {
          width: calc(100% - 65px);
          /deep/ input {
            padding-left: 10px;
          }
        }
        .dateinput {
          width: calc(100% - 65px);
        }
        .recipient {
          width: calc(100% - 65px);
          /deep/ .vue-treeselect {
            width: 100%;
            .vue-treeselect__control {
              height: 28px;
              .vue-treeselect__placeholder {
                line-height: 28px;
                font-size: 12px;
              }
            }
          }
        }
      }
      .pin {
        margin: 0px 8px;
        padding: 4px;
        //border-bottom: solid 1px #ccc;
        img {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }
      .form-upload {
        .form-img {
          display: flex;
          margin: 0px 4px;
          border-top: solid 1px #e5e5e5;
          > div {
            padding: 4px;
            border: solid 4px #e5e5e5;
            width: 40px;
            height: 40px;
            margin: 8px 4px 4px 4px;
            img {
              width: 100%;
            }
          }
        }
        .form-file {
          margin: 0px 8px;
          font-size: 12px;
        }
      }
      .form-save {
        padding: 4px 8px;
      }
    }
    @media (min-height: 320px) {
      .sign-form {
        max-height: 200px;
        overflow-y: auto;
      }
    }
    @media (min-height: 768px) {
      .sign-form {
        max-height: 200px;
        overflow-y: auto;
      }
    }
    @media (min-height: 920px) {
      .sign-form {
        max-height: 360px;
        overflow-y: auto;
      }
    }
  }
}
</style>
