<!--
 * @Description: 新增合模
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 11:40:16
 * @LastEditTime: 2020-05-25 15:44:08
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
          <span>{{ name }}</span>
          <!--          <span>单位：mm</span>-->
        </header>
        <ul>
          <li>
            <span>坐标(mm):</span>
            <el-input-number
              v-model="form.x"
              :controls="false"
              placeholder="x"
              @change="
                e => {
                  onInputChanged(form, 'coordinate')
                }
              "
            ></el-input-number>
            <el-input-number
              v-model="form.y"
              :controls="false"
              placeholder="y"
              @change="
                e => {
                  onInputChanged(form, 'coordinate')
                }
              "
            ></el-input-number>
            <el-input-number
              v-model="form.z"
              :controls="false"
              placeholder="z"
              @change="
                e => {
                  onInputChanged(form, 'coordinate')
                }
              "
            ></el-input-number>
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
          <li>
            <span>缩放(倍):</span>
            <el-input-number
              v-model="form.sx"
              :controls="false"
              placeholder="sx"
              @change="
                e => {
                  onInputChanged(form, 'zoom')
                }
              "
            ></el-input-number>
            <el-input-number
              v-model="form.sy"
              :controls="false"
              placeholder="sy"
              @change="
                e => {
                  onInputChanged(form, 'zoom')
                }
              "
            ></el-input-number>
            <el-input-number
              v-model="form.sz"
              :controls="false"
              placeholder="sz"
              @change="
                e => {
                  onInputChanged(form, 'zoom')
                }
              "
            ></el-input-number>
            <el-button icon="el-icon-refresh" type="text" @click="reset('zoom')"></el-button>
          </li>
        </ul>
        <div>
          <el-button type="primary" @click="saveJudge">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/bimCombineModel'
import move from '@/mixins/move'
import { getParams } from '@/utils/index'
export default {
  mixins: [move],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 编辑id
    editForm: {},
    name: {},
    title: String
  },
  data() {
    return {
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
      fileIds: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    visible(e) {
      if (e && this.editForm.id) {
        let coordinate = this.editForm.coordinate ? this.editForm.coordinate.split(',') : [0, 0, 0]
        let angle = this.editForm.angle ? this.editForm.angle.split(',') : [0, 0, 0]
        let zoom = this.editForm.zoom ? this.editForm.zoom.split(',') : [1, 1, 1]
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
      } else {
        this.clearAll()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.listenSelection()
    })
  },
  methods: {
    rotateChange() {
      // 计算差值
      let targetX = this.rotateForm.rxCopy - this.rotateForm.rxLast
      let targetY = this.rotateForm.ryCopy - this.rotateForm.ryLast
      let targetZ = this.rotateForm.rzCopy - this.rotateForm.rzLast
      // 保存当前值为上次值
      this.rotateForm.rxLast = this.rotateForm.rxCopy
      this.rotateForm.ryLast = this.rotateForm.ryCopy
      this.rotateForm.rzLast = this.rotateForm.rzCopy
      // 传入插件中的为差值
      this.form.rx = targetX
      this.form.ry = targetY
      this.form.rz = targetZ
      this.onInputChanged(this.form, 'angle')
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
          setTimeout(() => {
            this.rotateForm.rxLast = 0
            this.rotateForm.ryLast = 0
            this.rotateForm.rzLast = 0
            this.form.rx = 0
            this.form.ry = 0
            this.form.rz = 0
          }, 100)
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
      console.log(guids)
      if (guids.length === 0) return this.$message.error('请选择构件')
      let form = JSON.parse(JSON.stringify(this.editForm))

      form.coordinate = `${this.form.x},${this.form.y},${this.form.z}`
      form.angle = `${this.form.rx},${this.form.ry},${this.form.rz}`
      form.zoom = `${this.form.sx},${this.form.sy},${this.form.sz}`

      this.$emit('save', form)
    },
    close() {
      this.bimfishApp.viewer.removeEventListener('selection', this.selectionListen, false)
      this.$emit('close')
    },
    closealert() {
      this.$message.warning('请先关闭弹框')
    },
    selectionListen(evt) {
      console.log('jainting ;le ')
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
      this.reset('angle')
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      // this.bimfishApp.viewer.addEventListener('selection', this.selectionListen, false)
    }
  }
}
</script>

<style lang="less" scoped>
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
      max-height: 150px;
      overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 150px;
      overflow-y: auto;
    }
  }
  @media (min-height: 920px) {
    .model-form {
      max-height: 200px;
      overflow-y: auto;
    }
  }
}
</style>
