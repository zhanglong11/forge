<!--
 * @Description: bim组件
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-04-22 17:47:57
 * @LastEditTime: 2020-05-20 11:22:45
 -->
<!--
  @任务名称: 3006/版本管理，二三维对比；合并模型，版本对比
  @开发人员: 申豪强
  @修改日期: 2020-04-23
-->
<template>
  <div class="all">
    <div id="lo-viewer" class="lo-viewer"></div>
  </div>
</template>

<script>
import axios from '@/utils/axios'
export default {
  name: 'BimModel',
  data() {
    return {
      bimfishApp: null
    }
  },
  mounted() {
    //测试模型
    this.load3dviewer([
      {
        id: 'be9c85c2d78d4236be373a8a61a8bab8',
        // modelUrl:
        //   'cim6d-bim-light-dev-zsl/noToken/basic/commonFile/get/fdht/bim_c5fc3c9bc81647d3913e84760b81db02/3d.svf'
        modelUrl:
          axios.design.defaults.baseURL.replace('/', '') +
          '/noToken/basic/commonFile/get/fdht/bim_be9c85c2d78d4236be373a8a61a8bab8/3d.svf'
      }
    ])
  },
  methods: {
    // 模型初始化
    modelInit() {
      // 文件地址
      let modelUrl = this.getParams('modelUrl')
      // 模型id，文件id，任务id，部门id，projectId
    },
    // 获取地址栏参数
    getParams(name) {
      console.log(name)
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      // let r = window.location.search.substr(1).match(reg)
      if (!window.location.href.split('?')[1]) return null
      let r = window.location.href.split('?')[1].match(reg)
      if (r !== null) {
        return unescape(r[2])
      }
      return null
    },
    // 加载3D视图
    load3dviewer(arr, callBack) {
      this.$store.commit('bim/save3DViewer', arr)
      this.modelArr = arr
      let key = '465758F8f2B54E72b6956A8ba3625a73'
      let secret = '5De5712e99b0435AB47a41673B2B1F97faf51014C47041fB97cc12c1bEb7b185'
      this.bimfishApp = new BimfishApp('lo-viewer', key, secret)
      this.$store.commit('bim/initBimfishApp', this.bimfishApp)

      this.bimfishApp.init(() => {
        this.bimfishApp.showModel(arr, callBack)
        let that = this

        this.bimfishApp.viewer.addEventListener('geometryLoaded', (e, f) => {
          that.$emit('loadFish', e.model)
        })
        this.bimfishApp.viewer.disableSelection(true)
      })
    },
    /**
     * @description: 根据坐标添加标记
     * @param {string} id 区别每个标注，保证唯一性即可
     * @param {string} icon 图片地址
     * @param {Object} pos x、y、z坐标，如：{ x: -52.10022736554026,y: 198.79972297698254,z: -33.95395402589435}
     * @param {Function} callback 回调函数
     * @author: 申豪强
     */
    addDrawableIconMarkerByPos(id, icon, pos, callback) {
      this.bimfishApp.addDrawableIconMarkerByPos(id, icon, pos, callback)
    },
    // 传guid，对应构件高亮,可用于标记定位
    fitViewByGUID(guid) {
      this.bimfishApp.fitViewByGUID(guid)
    },
    /*
     *转换视角，查看视点，可用于批注
     *参数为视点信息
     *获取方法：json.string(this.bimfish.viewer.getState())
     */
    watchPoint(viewInfo) {
      this.bimfishApp.viewer.restoreState(JSON.parse(viewInfo))
    }
  }
}
</script>

<style lang="less" scoped>
#lo-viewer {
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 800;
}
.all {
  height: 100%;
  /*height: calc(100% - 60px);*/
  width: 100%;
}
</style>
