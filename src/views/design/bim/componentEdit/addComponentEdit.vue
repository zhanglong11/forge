<!--
 * @Description: 新增构件编辑
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 11:40:16
 * @LastEditTime: 2020-05-26 14:26:44
 -->
<template>
  <div v-if="visible" class="modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="model-content">
      <div class="model-form">
        <div class="model-content-close">
          <span class="model-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <header class="flex-base">
          <span>{{ editId ? targetName : name }}</span>
        </header>
        <hr class="m-10" />
        <section style="margin-bottom:5px">
          <span>选择构件：</span>
          <el-button type="primary" style="margin-left:8px" @click="selectAll">点选</el-button>
        </section>
        <!-- <header class="rule-model-content-header" style="margin-bottom:5px">
          <span>构件个数：</span>
          <el-input v-model="selectguidsNum" style="width:50%; margin-left:8px"></el-input>
        </header> -->
        <ul style="height:140px">
          <li>
            <span>坐标(mm):</span>
            <el-input-number v-model="form.x" :controls="false" placeholder="x"></el-input-number>
            <el-input-number v-model="form.y" :controls="false" placeholder="y"></el-input-number>
            <el-input-number v-model="form.z" :controls="false" placeholder="z"></el-input-number>
            <el-button icon="el-icon-refresh" type="text" @click="reset('coordinate')"></el-button>
          </li>
          <li>
            <span>角度(℃):</span>
            <el-input-number
              v-model="rotateForm.rxCopy"
              :controls="false"
              placeholder="rx"
              @change="rotateChange"
            ></el-input-number>
            <el-input-number
              v-model="rotateForm.ryCopy"
              :controls="false"
              placeholder="ry"
              @change="rotateChange"
            ></el-input-number>
            <el-input-number
              v-model="rotateForm.rzCopy"
              :controls="false"
              placeholder="rz"
              @change="rotateChange"
            ></el-input-number>
            <el-button icon="el-icon-refresh" type="text" @click="reset('angle')"></el-button>
          </li>
          <!-- <li>
            <span>缩放(倍):</span>
            <el-input-number v-model="form.sx" :controls="false" placeholder="sx"></el-input-number>
            <el-input-number v-model="form.sy" :controls="false" placeholder="sy"></el-input-number>
            <el-input-number v-model="form.sz" :controls="false" placeholder="sz"></el-input-number>
            <el-button icon="el-icon-refresh" type="text" @click="reset('zoom')"></el-button>
          </li> -->
        </ul>
        <section style="margin-bottom:5px">
          <span>预览构件：</span>
          <el-button type="primary" style="margin-left:8px" @click="previews">预览</el-button>
          <el-button type="primary" style="margin-left:8px" @click="plays">恢复</el-button>
        </section>
        <hr class="m-10" />
        <div class="w-100">
          <el-button type="primary" :disabled="disabled" @click="saveJudge">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/bimComponentEdit'
import move from '@/mixins/move'
import US from '_c/UploadStorage/index'
import { getParams } from '@/utils/index'
import preview from '@/utils/preview'
export default {
  components: {},
  mixins: [move],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 编辑id
    editId: {},
    name: {},
    title: String
  },
  data() {
    return {
      disabled: true,
      targetName: '',
      rotateForm: {
        rxLast: 0,
        ryLast: 0,
        rzLast: 0,
        rxCopy: 0,
        ryCopy: 0,
        rzCopy: 0
      },
      form: {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1
      },
      fileIds: '',
      tableData: [],
      resData: [],
      selectguidsNum: 0,
      proverState: 0,
      proState: 0
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    visible(e) {
      if (e && this.editId) {
        // alert('进')
        this.getDetails()
      } else {
        this.clearAll()
      }
    },
    'rotateForm.rxCopy'(e) {
      this.form.rx = e || 0
      this.rotateForm.rxCopy = e || 0
    },
    'rotateForm.ryCopy'(e) {
      this.form.ry = e || 0
      this.rotateForm.ryCopy = e || 0
    },
    'rotateForm.rzCopy'(e) {
      this.form.rz = e || 0
      this.rotateForm.rzCopy = e || 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.listenSelection()
    })
  },
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.resetForm)
  },
  methods: {
    //预览按钮
    async previews() {
      this.proverState = 1
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let guids = res.selectionGuidArr.join(',')
      if (!guids) {
        return this.$message.error('请选择构建')
      }
      console.log(this.form)
      this.onInputChanged(this.form, 'coordinate')
      this.onInputChanged(this.form, 'angle')
      this.onInputChanged(this.form, 'zoom')
    },
    //预览恢复
    plays() {
      //是否预览
      if (this.proverState === 1) {
        let tempForm = {
          rx: -this.form.rx,
          ry: -this.form.ry,
          rz: -this.form.rz
        }
        this.onInputChanged(tempForm, 'angle')
      }
      let form = {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1
      }
      this.onInputChanged(form, 'coordinate')
      this.onInputChanged(form, 'zoom')
      this.disabled = false
      this.proverState = 0
    },
    selectAll() {
      this.bimfishApp.viewer.disableSelection(false) //场景开启
    },
    preview(row) {
      preview(row)
    },
    remove(index, data) {
      data.splice(index, 1)
    },
    setLastRotateForm(form) {
      this.rotateForm.rxLast = form.rxLast
      this.rotateForm.ryLast = form.ryLast
      this.rotateForm.rzLast = form.rzLast
    },
    rotateChange() {
      console.log('有没有计算？')
      // 计算差值
      //if (this.rotateForm.rxCopy === 0 && this.rotateForm.ryCopy === 0 && this.rotateForm.rzCopy === 0) return
      let targetX = this.rotateForm.rxCopy - this.rotateForm.rxLast
      let targetY = this.rotateForm.ryCopy - this.rotateForm.ryLast
      let targetZ = this.rotateForm.rzCopy - this.rotateForm.rzLast
      // 保存当前值为上次值
      this.rotateForm.rxLast = this.rotateForm.rxCopy
      this.rotateForm.ryLast = this.rotateForm.ryCopy
      this.rotateForm.rzLast = this.rotateForm.rzCopy
      // 传入插件中的为差值
      let tempForm = {
        rx: targetX,
        ry: targetY,
        rz: targetZ,
        sx: this.form.sx,
        sy: this.form.sy,
        sz: this.form.sz,
        x: this.form.x,
        y: this.form.y,
        z: this.form.z
      }
      if (targetX < 0 || targetY < 0 || targetZ < 0) {
        this.onInputChanged(tempForm, 'angle')
        this.onInputChanged(tempForm, 'coordinate')
        this.onInputChanged(tempForm, 'zoom')
      }

      this.form.rx = targetX
      this.form.ry = targetY
      this.form.rz = targetZ
      // this.onInputChanged(this.form, 'angle')
    },
    clearAll() {
      this.rotateForm = {
        rxLast: 0,
        ryLast: 0,
        rzLast: 0,
        rxCopy: 0,
        ryCopy: 0,
        rzCopy: 0
      }
      this.form = {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1
      }
      this.reset('coordinate')
      this.reset('angle')
      this.reset('zoom')
      this.tableData = []
      this.resData = []
      this.proverState = 0
      this.disabled = true
      this.bimfishApp.clearSelect()
    },
    // 重新初始化各值
    reset(flag) {
      switch (flag) {
        case 'coordinate':
          this.form.x = 0
          this.form.y = 0
          this.form.z = 0
          break
        case 'angle':
          this.rotateForm.rxCopy = 0
          this.rotateForm.ryCopy = 0
          this.rotateForm.rzCopy = 0
          this.rotateChange()
          this.$nextTick(() => {
            this.rotateForm.rxLast = 0
            this.rotateForm.ryLast = 0
            this.rotateForm.rzLast = 0
            this.form.rx = 0
            this.form.ry = 0
            this.form.rz = 0
          })
          return
        case 'zoom':
          this.form.sx = 1
          this.form.sy = 1
          this.form.sz = 1
          break

        default:
          break
      }
      this.onInputChanged(this.form, flag)
    },
    async saveJudge() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let guids = res.selectionGuidArr.join(',')
      if (!guids) {
        return this.$message.error('请选择构建')
      }
      this.form.rx = this.rotateForm.rxCopy
      this.form.ry = this.rotateForm.ryCopy
      this.form.rz = this.rotateForm.rzCopy
      // return
      let form = {
        coordinate: `${this.form.x},${this.form.y},${this.form.z}`,
        angle: `${this.form.rx},${this.form.ry},${this.form.rz}`,
        zoom: `${this.form.sx},${this.form.sy},${this.form.sz}`,
        componentGuids: guids,
        fileIds: this.tableData.map(item => item.id).join(','),
        id: this.editId,
        name: this.editId ? this.targetName : this.name,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      if (form.id) {
        this.editSure(form)
      } else {
        this.saveSure(form)
      }
      this.proverState = 0
    },
    // 新增确定
    async saveSure(form) {
      let res = await api.addBimComponentEdit(form)
      this.$message.success('新增成功')
      this.$emit('update')
      // this.close()
    },
    // 编辑确定
    async editSure(form) {
      let res = await api.updateBimComponentEdit(form)
      this.$message.success('编辑成功')
      this.$emit('update')
      this.getDetails()
      // this.close()
    },
    // /上传附件
    uploadSuccess(e) {
      this.tableData.push(...e)
    },
    async getDetails() {
      let res = await api.getBimComponentEditDetails(this.editId)
      this.resData = res
      console.log(res)
      this.targetName = res.name
      let coordinate = res.data.coordinate.split(',')
      let angle = res.data.angle.split(',')
      let zoom = res.data.zoom.split(',')
      this.form = {
        x: coordinate[0],
        y: coordinate[1],
        z: coordinate[2],
        rx: angle[0],
        ry: angle[1],
        rz: angle[2],
        sx: zoom[0],
        sy: zoom[1],
        sz: zoom[2]
      }
      this.rotateForm = {
        rxCopy: angle[0],
        ryCopy: angle[1],
        rzCopy: angle[2]
      }
      this.tableData = res.data.commonFileList
    },
    close() {
      //是否预览
      console.log(this.proverState)
      if (this.proverState === 1) {
        let tempForm = {
          rx: -this.form.rx,
          ry: -this.form.ry,
          rz: -this.form.rz
        }
        this.onInputChanged(tempForm, 'angle')
      }
      this.reset('coordinate')
      this.reset('zoom')
      setTimeout(() => {
        this.$emit('close')
      }, 100)
      this.clearAll()
    },
    closealert() {
      this.$message.warning('请先关闭弹框')
    },
    resetForm() {
      this.form = {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        sx: 1,
        sy: 1,
        sz: 1
      }
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.resetForm)
    }
  }
}
</script>

<style lang="less" scoped>
.m-10 {
  margin: 10px 0;
}
.w-100 {
  button {
    width: 100%;
  }
}
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  .mask {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: transparent;
    /*opacity: 0.5;*/
    z-index: 90;
  }

  .model-content {
    padding: 6px 10px;
    width: 360px;
    position: absolute;
    bottom: 0px;
    right: 0;
    z-index: 100;
    &-close {
      /*position: absolute;*/
      /*right: 1px;*/
      /*top: -12px;*/
      font-size: 22px;
      overflow: hidden;
      margin-bottom: 10px;
      .model-tit {
        float: left;
        font-size: 14px;
        font-weight: bold;
      }
      i {
        cursor: pointer;
        color: #2e79cc;
        float: right;
      }
    }
  }
  .model-form {
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    padding-top: 10px;
    li {
      span {
        width: 78px;
      }
      .flex-base;
    }
    /deep/ .el-input-number {
      width: 20%;
    }
  }

  @media (min-height: 320px) {
    .model-form {
      max-height: 200px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 200px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 920px) {
    .model-form {
      max-height: 421px;
      // overflow-y: auto;
    }
  }
}
</style>
