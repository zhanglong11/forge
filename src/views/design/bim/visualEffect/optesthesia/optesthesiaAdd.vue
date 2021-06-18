<!--
 * @Description: task# 新增视觉效果
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-08 16:04:22
 * @LastEditTime: 2020-05-25 17:56:20
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
          <ul class="optes-ul">
            <li>
              <span>方案名称：</span>
              <el-input v-model="form.name" class="w-70"></el-input>
            </li>
            <li>
              <span>选择构件：</span>
              <el-button type="primary" @click="selectAll">点选</el-button>
            </li>
            <li>
              <span>构件数量：</span>
              <el-input v-model="selectNum" class="w-70" disabled></el-input>
            </li>
            <li>
              <span>隐藏</span>
              <!-- 后台1表示隐藏…… -->
              <el-switch v-model="form.isHidden" :active-value="0" :inactive-value="1"> </el-switch>
            </li>
            <li>
              <span>颜色</span>
              <el-color-picker v-model="form.colorOpacity" show-alpha></el-color-picker>
            </li>
            <li class="chartlet">
              <span class="chartlet-text">贴图</span>
              <el-upload
                ref="upload"
                :action="action"
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :class="{
                  'chartlet-upload': true,
                  'no-upload': !showUpload
                }"
                :file-list="fileList"
                :on-success="handleSuccess"
                :auto-upload="false"
                accept="image/*"
                :on-change="onChange"
                :headers="headers"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
// import Upload from '_c/UploadStorage/index'
import api from '@/api/bim/visualEffect'
import { getParams } from '@/utils/index'
import axios from '@/utils/axios'
export default {
  name: 'OptesthesiaAdd',
  components: {
    // Upload
  },
  props: {
    action: {
      type: String,
      default: axios.design.defaults.baseURL + '/basic/commonFile/common/upload'
    },
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
      selectNum: 0,
      // 上传文件
      fileList: [],
      headers: {
        'x-access-token': getToken()
      },
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      form: {
        // batchCode: this.$store.state.bim.batchCode,
        colorOpacity: '',
        componentGuids: '',
        imgUrl: '',
        isHidden: 0,
        isWireframe: 0,
        name: '',
        viewId: this.$store.state.bim.bim3DArr[0].id
      },
      // 是否展示上传按钮
      showUpload: true,
      selectionGuidArr: [],
      title: '',
      m: [],
      guidList: [], //全局guids
      endGuidList: []
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    editForm: {
      immediate: true,
      handler: function() {
        if (_.isEmpty(this.editForm)) {
          this.form = {
            colorOpacity: '',
            componentGuids: '',
            imgUrl: '',
            isHidden: 1,
            isWireframe: 0,
            name: ''
          }
          this.title = '新增视觉方案'
          this.fileList = []
          this.endGuidList = []
          this.showUpload = true
          return
        }
        this.title = '编辑视觉方案'
        // 选中
        this.form = _.cloneDeep(this.editForm)
        this.dialogImageUrl = this.form.imgUrl
        this.guidList = this.form.componentGuids.split(',')
        if (this.form.imgUrl) {
          this.fileList = [
            {
              url: this.form.imgUrl
            }
          ]
          this.showUpload = false
          //this.modelPreview([this.form.componentGuids])
        }
      }
    },
    visible(val) {
      if (!val) {
        this.clearAll()
      }
    },
    'form.isHidden'(e) {
      this.form.isHidden = e
      if (this.form.isHidden === 0) {
        this.bimfishApp.viewer.impl.createOverlayScene(this.guidList, '')
        this.bimfishApp.hide(this.guidList)
        this.bimfishApp.clearThemingColorByGUID(this.guidList)
        this.bimfishApp.select(this.guidList, true)
        return
      } else {
        this.bimfishApp.show(this.guidList)
        // this.bimfishApp.select(this.guidList, true)
        //this.modelPreview(this.guidList)
      }
    }
  },
  mounted() {
    this.listenSelection()
  },
  destroyed() {
    this.bimfishApp.viewer.removeEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
    this.bimfishApp.viewer.disableSelection(true) //关闭场景
  },
  methods: {
    async selectAll() {
      this.bimfishApp.viewer.disableSelection(false) //场景开启
    },
    //监听选中事件
    listenSelection() {
      if (!this.bimfishApp) return
      this.bimfishApp.viewer.addEventListener(Bimfish.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.getAttribute)
    },
    getAttribute(e) {
      this.getAttributePost()
    },
    async getAttributePost() {
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (this.endGuidList.length > 0) return
      this.selectNum = res.selectionGuidArr.length
      this.guidList = res.selectionGuidArr
    },
    addTexMaterial(texture, guid) {
      let tex = THREE.ImageUtils.loadTexture(texture)
      tex.needsUpdate = true //渲染对象自动更新。
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
    // 模型预览
    async modelPreview(guids) {
      this.endGuidList = this.guidList
      if (guids) {
        this.guidList = guids
        this.endGuidList.length = 0
      } else {
        let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
        this.guidList = res.selectionGuidArr
      }
      //判断是否隐藏
      if (this.form.isHidden === 0) {
        this.bimfishApp.viewer.impl.createOverlayScene(this.guidList, '')
        this.bimfishApp.hide(this.guidList)
        return
      } else {
        //进入上色或贴图方法
        if (this.guidList.length > 0) {
          // 上色
          if (this.form.colorOpacity) {
            if (guids === undefined) {
              this.bimfishApp.clearSelect()
            }
            // let target = this.form.color.match(/rgba(\((.+)\))/)[2]
            let target = this.form.colorOpacity
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
            this.bimfishApp.setThemingColor(this.guidList, ...target)
          }
          // 贴图
          if (this.dialogImageUrl) {
            this.bimfishApp.select(guids, true)
            setTimeout(() => {
              let selectionList = this.bimfishApp.viewer.getAggregateSelection()
              let index = 0
              for (let item of selectionList) {
                let imgName = this.addTexMaterial(this.dialogImageUrl, this.guidList[index])
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
            }, 1000)
          }
        } else {
          this.$message.error('请选择构件')
        }
      }
    },
    // 清除还原
    clearAll() {
      this.form = {
        colorOpacity: '',
        componentGuids: '',
        imgUrl: '',
        isHidden: 0,
        isWireframe: 0,
        name: ''
      }
      this.$refs.upload.clearFiles()
      this.showUpload = true
      this.dialogImageUrl = ''
      this.fileList = []
      this.endGuidList.length = 0
      this.dialogVisible = false
      this.disabled = false
      this.selectNum = 0
      this.bimfishApp.show(this.guidList)
      // 清楚颜色
      this.clearThemeColor()
      // 清除贴图
    },
    // 清除颜色
    async clearThemeColor() {
      let guids = this.guidList
      this.bimfishApp.clearThemingColorByGUID(guids)
      this.bimfishApp.viewer.impl.createOverlayScene(guids, '') // 清除贴图
      this.bimfishApp.viewer.impl.invalidate(true)
      setTimeout(() => {
        this.bimfishApp.clearSelect()
      }, 10)
      this.guidList = []
      console.log(this.guidList)
    },
    onChange(e, f) {
      this.dialogImageUrl = e.url
      if (f.length > 0) {
        this.showUpload = false
      }
    },
    // 上传成功
    handleSuccess(e) {
      if (e.code === 200) {
        this.form.imgUrl = e.data
      }
      this.saveJudge()
    },
    // 移除
    handleRemove(file) {
      console.log(file)
      this.dialogImageUrl = ''
      this.fileList = []
      setTimeout(() => {
        this.showUpload = true
      }, 400)
    },
    // 图片预览
    handlePictureCardPreview(file) {
      window.open(file.url)
    },
    handleDownload(file) {
      console.log(file)
    },
    // 关闭当前model
    close() {
      this.endGuidList.length = 0
      this.$emit('close')
      this.bimfishApp.viewer.disableSelection(true)
    },
    closealert() {
      this.$message.warning('请先关闭弹出框')
    },
    // 保存
    async save() {
      // 有图则上传图片
      if (!this.form.name) return this.$message.error('请填写名称')
      //let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      if (this.guidList.length === 0) return this.$message.error('请选择构件')
      this.selectionGuidArr = this.guidList
      if (this.dialogImageUrl && this.dialogImageUrl.indexOf('blob:http') !== -1) {
        this.$refs.upload.submit()
      } else {
        this.saveJudge()
      }
    },
    // /保存确认
    saveJudge() {
      let form = {}
      if (this.form.id) {
        Object.assign(form, {
          id: this.form.id,
          colorOpacity: this.form.colorOpacity,
          componentGuids: this.selectionGuidArr.join(','),
          isHidden: this.form.isHidden,
          name: this.form.name
        })
        if (!this.dialogImageUrl) {
          Object.assign(form, { imgUrl: '' })
        } else if (this.dialogImageUrl) {
          Object.assign(form, { imgUrl: this.form.imgUrl })
        }
      } else {
        Object.assign(form, {
          colorOpacity: this.form.colorOpacity,
          componentGuids: this.selectionGuidArr.join(','),
          imgUrl: this.form.imgUrl,
          isHidden: this.form.isHidden,
          name: this.form.name,
          viewId: this.$store.state.bim.bim3DArr[0].id
        })
      }
      if (this.form.id) {
        this.editSure(form)
      } else {
        this.saveSure(form)
      }
    },
    async saveSure(form) {
      let res = await api.addBimOptesthesiaProgram(form)
      this.$message.success('新增成功')
      this.$emit('updateBimOptesthesiaProgram')
    },
    async editSure(form) {
      let res = await api.editBimOptesthesiaProgram(form)
      this.$message.success('编辑成功')
      this.$emit('updateBimOptesthesiaProgram')
    }
  }
}
</script>

<style lang="less" scoped>
.optes-ul {
  height: 200px;
  overflow-y: auto;
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
  }
  @media (min-height: 320px) {
    .model-form {
      max-height: 293px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 768px) {
    .model-form {
      max-height: 293px;
      // overflow-y: auto;
    }
  }
  @media (min-height: 965px) {
    .model-form {
      max-height: 306px;
      // overflow-y: auto;
    }
  }
}
.form-content {
  li {
    .flex-base;
    padding-bottom: 6px;
  }
  .chartlet {
    justify-content: start;
    &-upload {
      width: 40%;
      /deep/ .el-upload-dragger {
        height: 100%;
      }
    }
    .chartlet-upload {
      /deep/.el-upload--picture-card {
        height: 82px;
        line-height: 82px;
      }
    }
    /deep/.el-upload-list--picture-card .el-upload-list__item {
      height: 82px;
    }
  }
  .chartlet-text {
    padding-right: 20px;
  }
  .no-upload {
    /deep/ .el-upload {
      display: none;
    }
  }
}
</style>
