<!--
 * @Description: task# 新增动画方案
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-08 16:04:22
 * @LastEditTime: 2020-05-26 17:32:32
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
          <ul class="animation-ul">
            <li class="flex-base">
              <span>方案名称：</span>
              <el-input v-model="form.name" class="w-70"></el-input>
            </li>
            <li v-for="(item, index) in form.bimCartoonDetailDTOList" :key="index" class="scheme-item ">
              <!-- <div class="scheme-item-select flex-base">
                <span class="scheme-item-select-child">{{ item.name }}：</span>

              </div> -->
              <div class="flex-base">
                <span>{{ item.name + (index + 1) }}</span>
                <span v-show="index === 0"><i class="el-icon-plus cursor" @click="addNewBimCartoon"></i></span>
                <span v-show="index !== 0"><i class="el-icon-minus cursor" @click="reduceBimCartoon(index)"></i></span>
              </div>
              <div class="flex-base">
                <span>类型：</span>
                <el-select
                  v-model="item.type"
                  placeholder="请选择类型"
                  class="scheme-item-select-child"
                  @change="
                    e => {
                      typeChange(e, item)
                    }
                  "
                >
                  <el-option v-for="type in typeList" :key="type.value" :label="type.label" :value="type.value">
                  </el-option>
                </el-select>
              </div>
              <div class="flex-base">
                <span>方案：</span>
                <el-select v-model="item.dataId" placeholder="请选择方案" class="scheme-item-select-child">
                  <el-option
                    v-for="scheme in item.schemeList"
                    :key="scheme.id"
                    :label="scheme.name"
                    :value="scheme.id"
                  />
                </el-select>
              </div>
              <div class="scheme-item-time flex-base">
                <span>起始时间(s)：</span>
                <el-inputNumber v-model="item.startTime" :precision="0" :controls="false" class="time"></el-inputNumber>
                <span> ~ </span>
                <el-inputNumber v-model="item.endTime" :precision="0" :controls="false" class="time"></el-inputNumber>
              </div>
              <hr class="hr-split" />
            </li>
          </ul>
        </section>
        <div class="save-btn flex-base">
          <el-button
            type="primary"
            @click="
              e => {
                modelPreview()
              }
            "
            >预览</el-button
          >
          <el-button type="success" @click="save">保存</el-button>
          <el-button v-if="form.id" type="danger" @click="deleteAnimation">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/bim/visualEffect'
import { getParams } from '@/utils/index'
import animateMove from '@/mixins/animateMove'
import animateRotate from '@/mixins/animateRotate'
import SegmentsRunner, { MovingLineSegmentsGroup } from '../../../../../../public/static/lib/facilities/segmentsRunner'
export default {
  name: 'AddAnimation',
  mixins: [animateMove, animateRotate],
  props: {
    visible: Boolean,
    // 编辑form
    editId: {
      type: String,
      default: ''
    },
    title: String
  },
  data() {
    return {
      dialogVisible: false,
      disabled: false,
      form: {
        bimCartoonDetailDTOList: []
      },
      // 类型列表
      typeList: [
        {
          label: '视觉方案',
          value: 1
        },
        {
          label: '火焰',
          value: 2
        },
        {
          label: '构件移动',
          value: 3
        },
        {
          label: '构件旋转',
          value: 4
        }
      ],
      // 方案列表
      schemeList: [],
      // 视觉方案列表
      bimOptesthesiaProgramList: [],
      // 火焰列表
      fireList: [],
      // 构件移动列表
      componentMoveList: [],
      // 构件旋转列表
      componentRotateList: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.clearAll()
      } else {
        this.getBimOptesthesiaProgramList()
        this.getFireList()
        this.getRotateList()
        this.getBimComponentMoveList()
        if (!this.editId) {
          this.form = {
            bimCartoonDetailDTOList: [
              {
                name: '动画',
                type: '',
                schemeList: []
              }
            ]
          }
          return
        }
        this.getDetails()
      }
    }
  },
  methods: {
    async moveBegainComponent(arr, f) {
      let movePath = []
      for (let i = 0; i < arr.length; i++) {
        let nowItem = arr[i]
        let nextItem = arr[i + 1]
        if (nextItem) {
          let s = JSON.parse(nowItem.position)
          let e = JSON.parse(nextItem.position)
          movePath.push({
            start: new THREE.Vector3(s.x, s.y, s.z),
            end: new THREE.Vector3(e.x, e.y, e.z),
            speed: f * 10
          })
        }
      }
      console.log(movePath)
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let selection = res.selections[0]
      let initPosition = JSON.parse(arr[0].position)
      let dbids = selection.dbIdArray
      const fragList = selection.model.getFragmentList()
      let FragIdToDbid = fragList.fragments.fragId2dbId
      for (let dbid of dbids) {
        let fragIds = []
        for (let frag in FragIdToDbid) {
          if (FragIdToDbid[frag] === dbid) {
            fragIds.push(frag)
          }
        }
        // setTimeout(() => {
        //   this.moveBegain(movePath, selection.model, fragIds, movePath[movePath.length - 1].end)
        // }, 10)
        let center = null
        if (f === false) {
          console.log(movePath)
          //this.bimfishApp.clearSelect()
          movePath[0].speed = 0 //关闭速度设置为0
          console.log(movePath)
        }
        this.bimfishApp.getComponentCenter(dbid, selection.model, e => {
          let pos = {
            x: initPosition.x - e.x,
            y: initPosition.y - e.y,
            z: initPosition.z - e.z
          }
          center = e
          this.positionChange(selection.model, fragIds, pos)
          setTimeout(() => {
            console.log(center)
            this.moveBegain(movePath, selection.model, fragIds, center, f)
          }, 10)
        })
      }
    },
    moveBegain(movePath, model, fragIdsArray, center, f) {
      let runner = new SegmentsRunner()
      let taskControl = runner.runWith(
        movePath,
        pos => {
          let position = {
            x: pos.x - center.x,
            y: pos.y - center.y,
            z: pos.z - center.z
          }
          this.positionChange(model, fragIdsArray, position)
        },
        dir => {
          console.log('dir change:', dir)
        },
        () => {
          console.log('done')
        }
      )
    },
    // 获取构件移动列表
    async getBimComponentMoveList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimComponentMoveList(form)
      this.componentMoveList = res.data
    },
    // 获取旋转构件列表
    async getRotateList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimComponentRotationList(form)
      this.componentRotateList = res.data
    },
    // 这个方法传进来guid数组和图片，即可删除壁纸
    clearBi() {
      this.bimfishApp.select([
        'cdba488d-b9a4-44b7-95ac-472b2888a03c-0006d1dc',
        'cdba488d-b9a4-44b7-95ac-472b2888a03c-0006d2a6'
      ])
      this.addTexMaterial(
        'https://design-collaboration.oss-cn-beijing.aliyuncs.com/source-file/c9d4558617204087ab6d5352375912bd.jpg',
        'cdba488d-b9a4-44b7-95ac-472b2888a03c-0006d1dc'
      )
    },
    addTexMaterial(texture, guid) {
      let tex = THREE.ImageUtils.loadTexture(texture)

      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping

      let material = new THREE.MeshPhongMaterial({
        map: tex
      })

      let materialName = guid

      this.bimfishApp.viewer.impl.createOverlayScene(materialName, material)

      return materialName
    },
    setMaterialOverlay(renderProxy, materialName) {
      let meshProxy = new THREE.Mesh(renderProxy.geometry, renderProxy.material)

      meshProxy.matrix.copy(renderProxy.matrixWorld)
      meshProxy.matrixWorldNeedsUpdate = true
      meshProxy.matrixAutoUpdate = false
      meshProxy.frustumCulled = false

      this.bimfishApp.viewer.impl.addOverlay(materialName, meshProxy)

      this.bimfishApp.viewer.impl.invalidate(true)
    },
    // 方案1：一进来加载所有下拉（4个）

    // 新增动画
    addNewBimCartoon() {
      this.form.bimCartoonDetailDTOList.push({ name: '动画', type: '' })
    },
    // 去除动画
    reduceBimCartoon(index) {
      this.form.bimCartoonDetailDTOList = this.form.bimCartoonDetailDTOList.filter((item, i) => i !== index)
    },
    async getDetails() {
      let res = await api.getBimCartoonDetails(this.editId)
      this.form = res.data
      for (let item of res.data.bimCartoonDetailDTOList) {
        this.initType(item.type, item)
      }
    },
    // 删除动画
    async deleteAnimation() {
      let res = await api.deleteBimCartoon(this.form.id)
      this.$message.success('删除成功')
      this.$emit('updateBimCartoon')
    },
    initType(e, item) {
      switch (e) {
        case 1:
          // 视觉方案
          this.$set(item, 'schemeList', this.bimOptesthesiaProgramList)
          // item.schemeList = this.bimOptesthesiaProgramList
          break
        case 2:
          // 火焰
          this.$set(item, 'schemeList', this.fireList)
          // item.schemeList = this.fireList
          break
        case 3:
          // 构件移动
          this.$set(item, 'schemeList', this.componentMoveList)
          break
        case 4:
          // 构件旋转
          this.$set(item, 'schemeList', this.componentRotateList)
          break
        default:
          break
      }
    },
    typeChange(e, item) {
      this.$set(item, 'dataId', null)
      this.initType(e, item)
    },
    // 将各列表赋值给schemeList
    // schemeListChange(){
    //   this.schemeList=
    // },

    // 获取视觉方案list
    async getBimOptesthesiaProgramList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getBimOptesthesiaProgram(form)
      console.log(res)
      this.bimOptesthesiaProgramList = res.data
    },
    // 获取火焰方案
    async getFireList() {
      let form = {
        viewId: this.$store.state.bim.bim3DArr[0].id
      }
      let res = await api.getFireList(form)
      this.fireList = res.data
    },

    // 清除还原
    clearAll() {
      this.form = {
        name: ''
      }
      this.bimfishApp.clearSelect()
    },
    // 关闭当前model
    close() {
      this.$emit('close')
      this.bimfishApp.viewer.disableSelection(true)
      //this.clearAll()
    },
    closealert() {
      this.$message.warning('请先关闭弹出框')
    },
    // 保存
    async save() {
      if (!this.form.name) return this.$message.error('请填写名称')
      if (this.form.bimCartoonDetailDTOList.some(item => item.endTime <= 0 || item.startTime <= 0))
        return this.$message.error('开始时间或结束时间不能小于等于0s')
      if (this.form.bimCartoonDetailDTOList.some(item => item.startTime >= item.endTime))
        return this.$message.error('开始时间不能大于或等于结束时间')

      if (
        this.form.bimCartoonDetailDTOList.some(item => !item.type || !item.dataId || !item.startTime || !item.endTime)
      )
        return this.$message.error('请将动画填写完整')
      this.saveJudge()
    },
    // /保存确认
    saveJudge() {
      let form = {
        id: this.form.id,
        batchCode: this.$store.state.bim.batchCode,
        name: this.form.name,
        // projectFileId: getParams('fileId'),
        // projectId: localStorage.getItem('projectId'),
        // version: this.$store.state.bim.versionInfo.version,
        isActive: 0,
        viewId: this.$store.state.bim.bim3DArr[0].id,
        bimCartoonDetailDTOList: this.form.bimCartoonDetailDTOList
      }
      if (form.id) {
        this.editSure(form)
      } else {
        this.saveSure(form)
      }
    },
    async saveSure(form) {
      let res = await api.addBimCartoon(form)
      this.$message.success('新增成功')
      this.$emit('updateBimCartoon')
    },
    async editSure(form) {
      let res = await api.bimCartoonUpdate(form)
      this.$message.success('编辑成功')
      this.$emit('updateBimCartoon')
    },
    // 动画判断
    animationJudge() {
      if (!this.form.name) return this.$message.error('请填写方案名')
      if (
        this.form.bimCartoonDetailDTOList.some(item => !item.type || !item.dataId || !item.startTime || !item.endTime)
      )
        return this.$message.error('请将动画信息填写完整')
      if (this.form.bimCartoonDetailDTOList.some(item => Number(item.startTime) > Number(item.endTime)))
        return this.$message.error('结束时间不能大于开始时间')
      return true
    },
    // 视觉方案预览
    async viewPreview(target, guids) {
      if (guids.length > 0) {
        // 上色
        if (target.colorOpacity) {
          console.log('上色')
          let colors = target.colorOpacity
            .split('(')[1]
            .split(')')[0]
            .split(',')
            .map((color, index) => {
              let number = null
              if (index !== 3) {
                number = (Number(color) / 255).toFixed(2)
              } else {
                number = color
              }
              return number
            })
          this.bimfishApp.setThemingColor(guids, ...colors)
        }
        // 贴图
        if (target.imgUrl) {
          this.renderImg(target, guids)
        }
      }
    },
    renderImg(target, guids) {
      setTimeout(() => {
        let selectionList = this.bimfishApp.viewer.getAggregateSelection()
        let index = 0
        for (let item of selectionList) {
          let imgName = this.addTexMaterial(target.imgUrl, guids[index])
          let dbids = item.selection
          const fragTarget = item.model.getFragmentList()
          let FragIdToDbid = fragTarget.fragments.fragId2dbId
          let fragList = []
          for (let frage in FragIdToDbid) {
            if (dbids.indexOf(FragIdToDbid[frage]) > -1) {
              fragList.push(frage)
            }
          }
          for (let fragId of fragList) {
            let renderProxy = this.bimfishApp.viewer.impl.getRenderProxy(item.model, fragId)
            this.setMaterialOverlay(renderProxy, imgName)
          }
          index += 1
        }
      }, 1)
    },
    // 构件旋转
    async componentRotateBegain(form, f) {
      console.log(form)
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let selection = res.selections[0]
      if (!selection) return
      let axis = new THREE.Vector3(1, 0, 0)
      if (form.axleStart && form.axleEnd) {
        // axis初始化
      }

      // 总时长：s
      let time = Math.floor(Number(form.rotationAngle) / Number(form.rotationSpeed))
      if (f <= time) {
        time = f
      }
      let index = 0
      if (f === false) {
        this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(-form.rotationAngle), axis)
        return
      }
      let timer = setInterval(() => {
        index += 1
        this.rotatePositionChange(selection.model, selection.fragIdsArray, Number(form.rotationSpeed), axis)
        if (index === time) clearInterval(timer)
      }, 1000)
      // 剩余角度
      let residueAngle = Number(form.rotationAngle) % Number(form.rotationSpeed)
      console.log(residueAngle)
      setTimeout(() => {
        this.rotatePositionChange(selection.model, selection.fragIdsArray, residueAngle, axis)
      }, time * 1000 + 1000)
    },
    // 预览
    async modelPreview(flag = false) {
      if (flag || this.animationJudge() === true) {
        console.log(this.form.bimCartoonDetailDTOList)
        // 开始动画
        for (let item of this.form.bimCartoonDetailDTOList) {
          let target = item.schemeList.filter(scheme => item.dataId === scheme.id)[0]
          console.log(target)
          let timer = null
          //临时加
          if (target) {
            switch (item.type) {
              case 1:
                // 视觉方案
                timer = null
                setTimeout(() => {
                  //this.bimfishApp.select(target.componentGuids.split(','))
                  timer = this.viewPreview(target, target.componentGuids.split(','))
                }, item.startTime * 1000)
                setTimeout(() => {
                  clearTimeout(timer)
                  this.bimfishApp.clearThemingColorByGUID(target.componentGuids.split(','))
                }, item.endTime * 1000)
                break
              case 2:
                // 火焰
                timer = null
                setTimeout(() => {
                  timer = this.bimfishApp.addFirePoint(target.id, JSON.parse(target.position), {
                    width: (Number(target.height) * 10).toFixed(1),
                    height: (Number(target.height) * 10).toFixed(1)
                  })
                }, item.startTime * 1000)
                setTimeout(() => {
                  clearTimeout(timer)
                  this.bimfishApp.removeFirePoint(target.id)
                }, item.endTime * 1000)

                break
              case 3:
                // 构件移动
                timer = null
                this.bimfishApp.clearSelect()
                this.bimfishApp.select(target.componentGuids.split(','), true)
                setTimeout(() => {
                  timer = this.moveBegainComponent(target.bimComponentMoveDetaiEntityList, item.endTime)
                }, item.startTime * 1000)
                setTimeout(() => {
                  clearTimeout(timer)
                  //this.bimfishApp.clearSelect()
                  this.moveBegainComponent(target.bimComponentMoveDetaiEntityList, false)
                }, item.endTime * 1000)
                break
              case 4:
                // 构件旋转
                timer = null
                this.bimfishApp.clearSelect()
                this.bimfishApp.select(target.componentGuids.split(','), true)
                setTimeout(() => {
                  timer = this.componentRotateBegain(target, item.endTime)
                }, item.startTime * 1000)
                setTimeout(() => {
                  clearTimeout(timer)
                  setTimeout(() => {
                    this.componentRotateBegain(target, false)
                  }, 100)
                }, item.endTime * 1000)
              default:
                break
            }
          }
        }
      }
    }
    //
  }
}
</script>

<style lang="less" scoped>
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
    position: relative;
    z-index: 100;
    max-height: 265px;
    // overflow-y: auto;
    .animation-ul {
      height: 185px;
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
