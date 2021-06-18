<!--
 * @Description: 构件旋转
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-15 09:07:46
 * @LastEditTime: 2020-05-26 10:43:44
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
        <section class="form-content">
          <ul>
            <li class="flex-base">
              <span>路径名称：</span>
              <el-input v-model="form.name" class="w-70"></el-input>
            </li>
            <li class="flex-base">
              <span>旋转方式:</span>
              <el-select v-model="form.rotationWay" placeholder="请选择" style="width:230px">
                <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </li>
            <li class="flex-bases">
              <span>选择旋转轴: </span>
              <el-button type="primary" class="flex-bases-btn" style="margin-left:18px" @click="modification"
                >选择旋转轴</el-button
              >
              <span style="font-size:14px;margin-left:10px">[非必选]</span>
            </li>
            <li class="flex-bases">
              <span>选择构件:</span>
              <el-button type="primary" class="flex-bases-btn" @click="selectAll">点选</el-button>
            </li>
            <li class="flex-base">
              <span>旋转角度(°)：</span>
              <el-input-number
                v-model="form.rotationAngle"
                class="w-70"
                :controls="false"
                :disabled="disabled"
                @change="inputChange"
              >
              </el-input-number>
            </li>
            <li class="flex-base">
              <span>旋转速度(度/s)：</span>
              <el-input-number v-model="form.rotationSpeed" class="w-70" :controls="false" @change="inputChange">
              </el-input-number>
            </li>
          </ul>
        </section>
        <div class="save-btn flex-base">
          <el-button type="primary" @click="preview(true, routataState)">预览</el-button>
          <el-button type="success" @click="saveJudge">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 问题：rotationAngle和rotationSpeed应该为数字类型
import { getParams } from '@/utils/index'
import api from '@/api/bim/visualEffect'
import animateRotate from '@/mixins/animateRotate'
export default {
  name: 'AddRotate',
  components: {},
  mixins: [animateRotate],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editForm: {},
    title: String,
    nameIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      disabled: false,
      promveTrue: '',
      geometry: null,
      form: {
        name: '',
        rotationSpeed: '10',
        rotationAngle: '',
        rotationWay: 1
      },
      types: [
        {
          value: 1,
          label: '圆周运动'
        },
        {
          value: 2,
          label: '始终旋转'
        }
      ],
      points: [],
      timerForver: null,
      timerClick: 0, //计时器
      saveClick: 0, //是否点击保存
      routataState: 1 //预览初始状态
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    editForm() {
      if (_.isEmpty(this.editForm)) return this.clearAll()
      this.form = _.cloneDeep(this.editForm)
      console.log(this.form)
      this.clickState = false
      this.form.rotationWay = this.form.rotationWay
      if (this.form.axleStart && this.form.axleEnd) {
        this.points = [JSON.parse(this.form.axleStart), JSON.parse(this.form.axleEnd)]
        console.log(this.points)
        this.creatLine(this.points)
      }
    },
    visible(e) {
      if (e) {
        if (_.isEmpty(this.editForm)) {
          this.form.name = ''
        }
      }
    },
    'form.rotationWay'(e) {
      this.disabled = e === 2 ? true : false
    }
  },
  mounted() {
    //console.log(this)
  },
  methods: {
    // 修改旋转轴：画条线
    modification() {
      if (this.points.length === 2) this.points = []
      this.bimfishApp.pickPosition(e => {
        if (e) {
          this.points.push(e.point)
          console.log('加点')
          if (this.points.length === 2) {
            this.creatLine(this.points)
            this.offAddMark()
          }
        }
      })
    },
    selectAll() {
      this.bimfishApp.viewer.disableSelection(false)
    },
    creatLine(arr) {
      console.log(arr)
      const geometry = new THREE.Geometry()
      geometry.vertices.push(...arr)
      // geometry.vertices.push(new THREE.Vector3(10, 10, 10))
      var linesMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0xff0000),
        transparent: true,
        depthWrite: false,
        depthTest: true,
        linewidth: 10,
        opacity: 1.0
      })
      var lines = new THREE.Line(geometry, linesMaterial)
      let viewer = this.bimfishApp.viewer
      viewer.impl.createOverlayScene('testLine', linesMaterial)
      viewer.impl.addOverlay('testLine', lines)
      viewer.impl.invalidate(true, true, true)
    },
    offAddMark() {
      if (this.bimfishApp.eventTool) {
        this.bimfishApp.closePickPosition()
        this.bimfishApp.eventTool.off('singleclick', () => {})
      }
    },
    async preview(f, g) {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      //预览验证
      if (this.saveClick === 0) {
        console.log('jin')
        if (!this.form.name) return this.$message.error('路径名称必填')
        if (this.form.rotationWay === 1) {
          if (!this.form.rotationAngle) return this.$message.error('旋转角度必填')
        }
        if (res.selectionGuidArr.length === 0) return this.$message.error('请选择构件')
        if (!this.form.rotationSpeed || Number(this.form.rotationSpeed) <= 0)
          return this.$message.error('旋转速度必填且要大于0')
      }

      this.saveClick = 2
      if (f === true) {
        this.routataState = 0
      }
      let selection = res.selections[0]
      console.log(selection)
      if (!selection) return
      // 轴
      let axis = new THREE.Vector3(1, 0, 0) //默认轴
      if (this.points.length === 2) {
        //自定义轴
        axis = new THREE.Vector3(
          this.points[1].x - this.points[0].x,
          this.points[1].y - this.points[0].x,
          this.points[1].z - this.points[0].x
        ).normalize()
        // axis = this.points[0].sub(this.points[1]).normalize()
      }
      console.log(axis)
      if (this.form.rotationWay === 1) {
        // 总时长：s
        if (!this.form.rotationAngle) return this.$message.error('旋转角度必填')
        let time = Math.abs(Math.floor(Number(this.form.rotationAngle) / Number(this.form.rotationSpeed)))
        let index = 0
        //逆向还原
        if (f === false && g === 0) {
          this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(-this.form.rotationAngle), axis)
          this.clearAll()
          return
        } else if (f === false && this.routataState === 1) {
          this.clearAll()
          return
        }
        //逆向还原end
        let timer = setInterval(() => {
          index += 1
          this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(this.form.rotationAngle), axis)
          if (index === time) clearInterval(timer)
        }, 1000)
        // 剩余角度
        let residueAngle = Number(this.form.rotationAngle) % Number(this.form.rotationSpeed)
        setTimeout(() => {
          this.rotatePositionChange(selection.model, selection.fragIdsArray, residueAngle, axis)
        }, time * 1000 + 1000)
      } else if (this.form.rotationWay === 2) {
        //恢复旋转角度
        if (g === 0) {
          switch (this.timerClick) {
            case 1:
              this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(-90), axis)
              clearInterval(this.timerForver)
              break
            case 2:
              this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(-90 * 2), axis)
              clearInterval(this.timerForver)
              break
            case 3:
              this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(90), axis)
              clearInterval(this.timerForver)
              break
            case 4:
              clearInterval(this.timerForver)
              break
            default:
              clearInterval(this.timerForver)
              break
          }
          this.clearAll()
        } else {
          this.noRotate(selection.model, selection.fragIdsArray, Number(90), axis) //默认始终旋转 90
        }
      }
    },
    noRotate(model, fragIdsArray, speed, axis) {
      this.timerForver = setInterval(() => {
        this.timerClick += 1
        this.rotatePositionChange(model, fragIdsArray, speed, axis)
        if (this.timerClick >= 4) return (this.timerClick = 0)
      }, 1000)
    },
    inputChange(e) {
      console.log(e)
    },
    // 清除还原
    clearAll() {
      this.form = {
        name: '',
        rotationSpeed: '10',
        rotationAngle: '',
        rotationWay: 1
      }
      this.bimfishApp.clearSelect()
      this.points = []
      this.creatLine(this.points)
      this.timerClick = 0
      this.routataState = 1
      this.saveClick = 0
      this.clickState = false
    },
    // 关闭当前model
    close() {
      if (this.saveClick === 1 || this.saveClick === 0) return this.$emit('close')
      this.closeRest()
      this.$emit('close')
    },
    //保存修改成功复原
    closeRest() {
      if (this.form.rotationWay === 2) {
        this.routataState = 0
        this.preview(true, this.routataState)
      } else if (this.form.rotationWay === 1) {
        this.preview(false, this.routataState)
      }
    },
    closealert() {
      this.$message.warning('请先关闭弹出框')
    },
    // 保存
    async saveJudge() {
      if (!this.form.name) return this.$message.error('路径名称必填')
      if (this.form.rotationWay === 1) {
        if (!this.form.rotationAngle) return this.$message.error('旋转角度必填')
      }
      // if (!this.form.rotationSpeed) return this.$message.error('旋转速度必填')
      if (!this.form.rotationSpeed || Number(this.form.rotationSpeed) <= 0)
        return this.$message.error('旋转速度必填且要大于0')
      if (!this.form.rotationWay) return this.$message.error('旋转方式必填')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (res.selectionGuidArr.length === 0) return this.$message.error('请选择构件')
      let axleEnd = ''
      let axleStart = ''
      console.log(this.points.length)
      let form = {
        axleEnd: axleEnd || JSON.stringify(this.points[1]),
        axleStart: axleStart || JSON.stringify(this.points[0]),
        batchCode: this.$store.state.bim.batchCode,
        componentGuids: res.selectionGuidArr.join(','),
        name: this.form.name,
        rotationAngle: this.form.rotationAngle || 0,
        rotationSpeed: this.form.rotationSpeed,
        rotationWay: this.form.rotationWay,
        id: this.form.id
      }
      console.log(form)
      if (form.id) {
        this.updateBimComponentRotation(form)
      } else {
        Object.assign(form, {
          isActive: 0,
          viewId: this.$store.state.bim.bim3DArr[0].id
        })
        this.addNewBimComponentRotation(form)
      }
    },
    // 更新旋转
    async updateBimComponentRotation(form) {
      let res = await api.updateBimComponentRotation(form)
      this.$message.success('编辑成功')
      this.saveClick = 1
      this.$emit('update')
      setTimeout(() => {
        this.closeRest()
        this.close()
      }, 100)
    },
    // 新增旋转
    async addNewBimComponentRotation(form) {
      let res = await api.addNewBimComponentRotation(form)
      this.$message.success('新增成功')
      this.saveClick = 1
      this.$emit('update')
      setTimeout(() => {
        this.closeRest()
        this.close()
      }, 100)
    }
  }
}
</script>

<style lang="less" scoped>
/deep/.el-input-number .el-input {
  width: 230px;
}
.save-btn {
  button {
    width: 100%;
  }
}
.hr-split {
  margin-bottom: 4px;
}
.w-70 {
  width: 70%;
}
.m-10 {
  margin: 10px 0;
}
.flex-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}
.flex-bases {
  display: flex;
  padding-bottom: 4px;
  .flex-bases-btn {
    margin-left: 33px;
  }
}
.form-content {
  li {
    padding-bottom: 6px;
  }
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
      font-size: 24px;
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
  }
  @media (min-height: 320px) {
    .model-form {
      max-height: 120px;
      overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 120px;
      overflow-y: auto;
    }
  }
  @media (min-height: 920px) {
    .model-form {
      max-height: 350px;
      overflow-y: auto;
    }
  }
}
.scheme-item {
  &-select {
    &-child {
      width: 70%;
    }
  }
}
.time {
  width: 30%;
}
</style>
