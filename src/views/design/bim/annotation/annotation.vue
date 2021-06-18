<!--
@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-23
@任务类型: 全新代码，添加批注属性面板组件

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-23
@任务类型: 修改代码，添加canvas截图功能，修改比例(98%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-24
@任务类型: 修改代码，添加批注筛选组件、批注新增表单、引入批注列表组件、批注面板样式调整，修改比例(60%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-26
@任务类型: 修改代码，对接批注列表查询接口，批注新增接口，修改比例(60%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，修改用户头像变量，修改比例(3%)

@任务名称: 3004/批注功能和标记功能
@开发人员: 董渊海
@修改日期: 2020-04-27
@任务类型: 修改代码，添加批注名称验证，添加批注创建时间，修改比例(3%)
-->
<!--
  @任务名称: 3098 批注模块接口对接
  @开发人员: 申豪强
  @修改日期: 2020-05-18
-->
<template>
  <div class="annotation right-content">
    <Drag title="批注" :addFlag="true" @close="close" @add="addNew">
      <VersionFilter :dataList="listCopy" @selectChange="selectChange" @userChange="userChange" />
      <div v-show="list.length === 0" class="no-res">
        暂无数据
      </div>
      <div class="annotation-panel">
        <div class="annotation-content">
          <AnnotationItem
            v-for="(item, index) in list"
            :key="index"
            :item="item"
            @refresh="getAnnotationList"
            @showBigImg="showBigImg"
          />
        </div>
      </div>
    </Drag>
    <img v-show="showImg" :src="bigImgUrl" class="showImg" @click="hideImg" />
  </div>
</template>

<script>
import VersionFilter from '../component/versionFilter'
import Drag from '../component/Drag'
import AnnotationItem from './annotationItem'
import api from '@/api/bim/postil'
import kscreenshot from 'kscreenshot'
export default {
  components: { Drag, AnnotationItem, VersionFilter },
  data() {
    return {
      userList: [],
      version: '',
      projectFileId: '',
      projectId: '',
      creator: '',
      headImage: '',
      visibleAddForm: false,
      textName: '',
      content: '',
      url: '',
      fileId: '',
      photoPath: '',
      list: [],
      // 备份，勿动
      listCopy: [],
      ksObj: null,
      // 展示大图
      showImg: false,
      // 大图地址
      bigImgUrl: ''
    }
  },
  computed: {
    bimfishApp() {
      return this.$store.state.bim.bimfishApp
    }
  },
  watch: {
    version(v) {
      this.getAnnotationList()
    }
  },
  mounted() {
    // 获取用户头像
    this.headImage = this.$store.state.user.userInfo.headImage
      ? this.$store.state.user.userInfo.headImage
      : '/static/assets/img/avatar.png'

    this.ksObj = new kscreenshot({
      key: 65,
      endCB: base64 => {
        console.log('成功回调')
        this.url = base64
        let blob = this.dataURLtoBlob(base64)
        let file = this.blobToFile(blob, new Date().getTime() + '.png')
        let formData = new FormData()
        formData.append('file', file, file.name)
        this.axios.design.post('/file/commonFile/common/upload', formData).then(
          res => {
            this.list.push({
              img: res.data,
              state: JSON.stringify(this.bimfishApp.viewer.getState()),
              editStatus: true
            })
            console.log(this.list)
          },
          err => {
            this.$message.error('图片上传失败，请联系管理员')
          }
        )
      },
      cancelCB: e => {
        console.log('取消')
      }
    })
  },
  methods: {
    showBigImg(url) {
      this.bigImgUrl = url
      this.showImg = true
    },
    hideImg() {
      this.showImg = false
    },
    selectChange(info) {
      this.version = info.version
      this.projectFileId = info.projectFileId
      this.projectId = info.projectId
    },
    userChange(e) {
      this.list = e
    },
    // 使用截图插件，开始截图方法
    addNew() {
      this.ksObj.startScreenShot()
    },
    // 将base64转换为blob
    dataURLtoBlob(dataurl) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    // 将blob转换为file
    blobToFile(theBlob, fileName) {
      theBlob.lastModifiedDate = new Date()
      theBlob.name = fileName
      return theBlob
    },
    // 批注列表查询
    async getAnnotationList() {
      let form = {
        batchCode: this.$store.state.bim.batchCode,
        creatorName: this.creator,
        projectFileId: this.projectFileId,
        projectId: this.projectId,
        version: this.version
      }
      let res = await api.getBimPostilList(form)
      this.list = res.data.reverse()
      this.listCopy = JSON.parse(JSON.stringify(res.data))
    },
    getCurrentTime() {
      return moment().format('YYYY-MM-DD HH:mm:ss')
    },
    close() {
      this.$emit('navigationChange')
    }
  }
}
</script>

<style lang="less" scoped>
.showImg {
  position: fixed;
  z-index: 900;
  top: 58px;
  left: 0;
  /* right: 420px; */
  bottom: 0;
  width: calc(100% - 420px);
  height: calc(100% - 58px);
  display: block;
}
.no-res {
  margin-top: 10px;
}
.annotation {
  .annotation-panel {
    position: relative;
    .add {
      position: absolute;
      top: -56px;
      right: 20px;
    }

    .search-bar {
      display: flex;
      > div {
        flex: 1;
      }
    }

    .annotation-content {
      margin-top: 8px;
      height: calc(100% - 38px);
      overflow: auto;

      .annotation-item {
        /deep/ .el-input--mini .el-input__inner {
          height: 22px;
          line-height: 22px;
          width: 120px;
        }
      }
    }
  }
}
</style>
