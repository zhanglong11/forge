<!--
 * @Description: 选择文件，从文件管理中选择
 * @Version:
 * @Autor: 席阳冰星
 * @Date: 2020-03-15 20:27:55
 * @LastEditTime: 2020-05-22 09:07:35
 -->
<template>
  <div v-if="visible" class="roam-modal">
    <!--    <div class="mask" @click="closealert"></div>-->
    <div class="roam-model-content">
      <div class="roam-model-form">
        <div class="roam-model-content-close">
          <span class="roam-tit">{{ title }}</span>
          <i class="el-icon-circle-close" @click="close"></i>
        </div>
        <header class="roam-model-content-header">
          <el-input v-model="form.name" class="w-70"></el-input>
          <!-- 当toggleFlag为false（和play保持相反）  -->
          <el-button type="text" :disabled="!toggleFlag" @click="addNewRoam">添加漫游点</el-button>
        </header>
        <section class="roam-model-content-section">
          <ul class="roam-ul">
            <li
              v-for="item in form.roamDetailList"
              :key="item.name"
              :class="{
                'roam-info': true,
                'show-btn': showBtnName === item.name
              }"
              @mouseenter="mouseenter(item)"
              @mouseleave="mouseleave(item)"
            >
              <div class="roam-info-name">
                <i class="el-icon-location-outline roam-icon"></i>
                <span>{{ item.name }}</span>
              </div>
              <!-- 按钮区 -->
              <div class="btn-content">
                <el-button type="text" style="padding-bottom: 0;padding-top: 0;" @click="fitView(item)">定位</el-button>
                <el-button type="text" style="padding-bottom: 0;padding-top: 0;" @click="deteleRoam(item)"
                  >删除</el-button
                >
              </div>
            </li>
          </ul>
        </section>
        <section class="flex-base time-content">
          <!-- <span>持续时间(单位:s)：</span> -->
          <div class="w-50">
            <span>持续时间(单位:s)：</span>
            <!-- <el-slider v-model="percentage" disabled :max="timeMax"></el-slider> -->
          </div>
          <div class="w-48">
            <el-select v-model="form.speed" placeholder="请选择" filterable allow-create>
              <el-option v-for="item in timeList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>

          <!-- <el-input v-model="form.speed"></el-input> -->
        </section>
        <hr class="m-10" />
        <section class="play-content">
          <i v-show="toggleFlag" class="el-icon-video-play" @click="play"></i>
          <i v-show="!toggleFlag" class="el-icon-video-pause" @click="stop"></i>
          <i class="el-icon-refresh-right" @click="againReset"></i>
        </section>
        <div class="flex-base w-100">
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/viewpointRoaming'
import { getParams } from '@/utils/index'
export default {
  name: 'AddRoam',
  props: {
    visible: Boolean,
    // 编辑form
    editForm: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      // 新增漫游点等disabled
      addDisabled: false,
      // 百分比
      percentage: 0,
      timeMax: 100,
      timeList: [
        {
          label: '10',
          value: 10
        },
        {
          label: '30',
          value: 30
        },
        {
          label: '60',
          value: 60
        }
      ],
      showBtnName: '',
      form: {
        name: '', //漫游组名称
        // 漫游点数组
        roamDetailList: [],
        speed: 10
      },
      // 暂停还是开始
      toggleFlag: true,
      // stopFlag用于判断动画是否继续，这里和toggleFlag分开，是为了逻辑上便于分别；
      stopFlag: false,
      // 计时器：因为计时放到了bimfish里边，这里也要一个timer以便控制，到达指定时间，结束该方法
      timer: null,
      // 开始计时器
      starDate: null,
      // 毫秒
      ms: 0,
      title: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    visible(val) {
      if (val) {
        if (!_.isEmpty(this.editForm)) {
          this.form = JSON.parse(JSON.stringify(this.editForm))
          this.title = '编辑漫游'
        } else {
          this.title = '新增漫游'
        }
      } else {
      }
    },
    editForm() {
      if (_.isEmpty(this.editForm)) return this.clearAll()
      this.form = this.editForm
    }
  },
  mounted() {
    this.eventTool3d = new BimfishApp.EventTool(this.bimfishApp.viewer)
  },
  destroyed() {
    this.eventTool3d.off('singleclick', event => {
      this.againReset()
    })
  },
  methods: {
    closeListenSelection() {
      this.eventTool3d.off('singleclick', event => {})
    },
    // 百分比计算
    percentageCalculate() {
      let timeNumber = Number(this.form.speed).toFixed(1)
      this.timeMax = timeNumber
      // this.percentage=
      this.timer = setInterval(() => {
        this.percentage += 1
      }, 1000)
    },
    // 进入列表item
    mouseenter(item) {
      if (!this.toggleFlag) {
        this.showBtnName = ''
        return
      }
      this.showBtnName = item.name
    },
    mouseleave(item) {
      this.showBtnName = ''
    },
    // 防抖
    debounce(fn, wait) {
      let timeout = null
      return () => {
        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(fn, wait)
      }
    },
    // 一切还原
    clearAll() {
      this.closeListenSelection()
      // 清除开始时间计时
      clearInterval(this.starDate)
      // 清除倒计时
      clearTimeout(this.timer)
      if (this.form.roamDetailList && this.form.roamDetailList.length > 0) {
        this.againReset()
      }
      this.ms = 0
      this.starDate = null
      this.timer = null
      this.stopFlag = false
      this.toggleFlag = true
      this.percentage = 0
      this.form = {
        name: '', //漫游组名称
        // 漫游点数组
        roamDetailList: [],
        speed: 10
      }
    },
    // 倒计时:参数单位为毫秒
    timeOut(timeNumber) {
      this.timer = setTimeout(() => {
        this.againReset()
      }, timeNumber)
    },
    // 漫游开始
    play() {
      this.listenSelection()
      if (this.form.roamDetailList.length === 0) return this.$message.error('请添加漫游点')
      if (window.isNaN(this.form.speed)) return this.$message.error('请输入正确的数字')
      // 执行倒计时：倒计时结束，执行重置操作
      // 清除开始时间计时
      clearInterval(this.starDate)
      // 清除倒计时
      clearTimeout(this.timer)
      let timeNumber = Number(this.form.speed).toFixed(1)
      this.toggleFlag = false
      if (this.stopFlag) {
        console.log('继续上次动画')
        // this.timeOut(timeNumber * 1000 - this.ms)
        this.starDate = setInterval(() => {
          this.ms += 10
        }, 10) //每10ms
        this.bimfishApp.runAnimation()
        this.stopFlag = false
        return
      }
      // this.starDate = setInterval(() => {
      //   this.ms += 10
      // }, 10) //每10ms
      // console.log(timeNumber)
      // this.timeOut(timeNumber * 1000)
      // 开始漫游下试试
      let list = this.form.roamDetailList.map(item => {
        let viewport = JSON.parse(item.roamState).viewport
        let eye = viewport.eye
        let target = viewport.target
        let up = viewport.up
        return [
          new THREE.Vector3(eye[0], eye[1], eye[2]),
          new THREE.Vector3(target[0], target[1], target[2]),
          new THREE.Vector3(up[0], up[1], up[2])
        ]
      })
      let cameraParamVec = [].concat.apply([], list)
      if (this.form.speed) {
        this.bimfishApp.wanderAnimation(cameraParamVec, timeNumber * 1000).then(res => {
          console.log(res)
          if (res === '成功') {
            // 重新初始化
            let timeNumber = Number(this.form.speed).toFixed(1) * 1000
            clearInterval(this.starDate)
            clearTimeout(this.timer)
            this.toggleFlag = true
            this.stopFlag = false
            let stopId = this.bimfishApp.animId
            window.cancelAnimationFrame(stopId)
          }
        })
      }
    },
    stop() {
      console.log('暂停')
      let timeNumber = Number(this.form.speed).toFixed(1) * 1000
      clearInterval(this.starDate)
      clearTimeout(this.timer)
      this.toggleFlag = true
      this.stopFlag = true
      let stopId = this.bimfishApp.animId
      window.cancelAnimationFrame(stopId)
    },
    //点击图形空间-图形重新开始
    listenSelection() {
      this.eventTool3d.activate()
      this.eventTool3d.on('singleclick', event => {
        this.againReset()
      })
    },
    // 重新开始
    againReset() {
      console.log('重新开始')
      if (this.form.roamDetailList.length === 0) return this.$message.error('请添加漫游点')
      let stopId = this.bimfishApp.animId
      window.cancelAnimationFrame(stopId)
      this.ms = 0
      clearTimeout(this.timer)
      clearInterval(this.starDate)
      this.toggleFlag = true
      this.stopFlag = false
      let roamState = this.form.roamDetailList[0].roamState
      this.bimfishApp.viewer.restoreState(JSON.parse(roamState))
    },
    // 删除漫游
    deteleRoam(item) {
      this.form.roamDetailList = this.form.roamDetailList.filter(e => e.name !== item.name)
    },
    fitView(item) {
      this.bimfishApp.viewer.restoreState(JSON.parse(item.roamState))
    },
    // 新增漫游点
    addNewRoam() {
      let roamState = JSON.stringify(this.bimfishApp.viewer.getState())
      let index = 0
      if (this.form.roamDetailList.length === 0) {
        index = 1
      } else {
        let targte = this.form.roamDetailList[this.form.roamDetailList.length - 1]
        let number = Number(targte.name.replace('漫游', ''))
        index = number + 1
      }
      this.form.roamDetailList.push({
        name: '漫游' + index,
        roamState: roamState,
        roamId: index
      })
    },
    // 关闭当前model
    close() {
      this.clearAll()
      this.toggleFlag = true
      this.$emit('close')
      this.closeListenSelection()
      this.bimfishApp.viewer.disableSelection(true) //
    },
    closealert() {
      this.$message({
        type: 'warning',
        message: '请先关闭弹框',
        duration: 1500,
        offset: 60
      })
    },
    // 保存
    save() {
      if (this.form.roamDetailList.length === 0) return this.$message.error('请添加漫游点')
      if (window.isNaN(this.form.speed)) return this.$message.error('请输入正确的数字')
      if (!this.form.name) return this.$message.error('请输入漫游名称')
      if (this.editForm.id) {
        this.editSure()
      } else {
        this.addSure()
      }
    },
    // 编辑确认
    async editSure() {
      let form = {
        name: this.form.name,
        roamDetailList: this.form.roamDetailList,
        speed: this.form.speed,
        id: this.form.id
      }
      let res = await api.editRoam(form)
      this.$message.success('编辑成功')
      this.$emit('updateRoam')
      this.close()
    },
    // 新增确认
    async addSure() {
      let form = {
        name: this.form.name,
        roamDetailList: this.form.roamDetailList,
        speed: this.form.speed,
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.addRoam(form)
      this.$message.success('新增成功')
      this.$emit('updateRoam')
      this.close()
    }
  }
}
</script>

<style lang="less" scoped>
.roam-icon {
  padding-right: 3px;
}
.time-content {
  padding-top: 4px;
}
.play-content {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  i {
    font-size: 32px;
    cursor: pointer;
  }
}
.w-70 {
  width: 70%;
}
.w-50 {
  width: 50%;
}
.w-48 {
  width: 48%;
}
.w-100 {
  width: 100%;
  button {
    width: 100%;
  }
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

.roam-modal {
  /*position: absolute;*/
  /*top: 0px;*/
  /*left: 0px;*/
  /*right: 0px;*/
  /*bottom: 0px;*/
  width: 100%;
  overflow: hidden;
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
  .roam-ul {
    height: 100px;
    overflow-y: auto;
  }
  .roam-info {
    .flex-base;
    padding: 5px 0;
    .btn-content {
      display: none;
    }
  }
  .show-btn {
    .btn-content {
      display: block;
    }
  }
  .roam-model-content {
    padding: 6px 10px;
    width: 360px;
    position: absolute;
    bottom: 0px;
    z-index: 100;
    right: 0;
    &-close {
      /*position: absolute;*/
      /*right: 1px;*/
      /*top: -12px;*/
      font-size: 22px;
      overflow: hidden;
      margin-bottom: 10px;
      .roam-tit {
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
    &-header {
      .flex-base;
    }
    &-end {
      .flex-base;
    }
  }
  .roam-model-form {
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    padding-top: 10px;
    position: relative;
    z-index: 100;
    /*滚动条样式设置*/
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      background-clip: padding-box;
      border: 3px solid transparent;
      border-radius: 7px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: transparent;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
    &::-webkit-scrollbar-track:hover {
      background: transparent;
    }
  }
  @media (min-height: 320px) {
    .roam-model-form {
      max-height: 128px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 860px) {
    .roam-model-form {
      max-height: 128px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 865px) {
    .roam-model-form {
      max-height: 320px;
      // overflow-y: auto;
    }
  }
}
</style>
