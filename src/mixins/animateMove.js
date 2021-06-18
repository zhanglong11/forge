/*
 * @Description:视觉效果-构件移动,记得要在mix中引入bimfish变量
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-21 18:03:50
 * @LastEditTime: 2020-05-26 10:15:40
 */
export default {
  methods: {
    async positionChange(model, fragIdsArray, pos) {
      fragIdsArray.forEach(fragId => {
        this.transformFragProxy(pos, model, fragId)
      })
    },
    transformFragProxy(pos, model, fragId) {
      const fragProxy = this.bimfishApp.viewer.impl.getFragmentProxy(model, fragId)
      fragProxy.getAnimTransform()
      fragProxy.position.x = pos.x
      fragProxy.position.y = pos.y
      fragProxy.position.z = pos.z
      fragProxy.updateAnimTransform()
      this.bimfishApp.viewer.impl.invalidate(true, true, true)
    },
    getTargetTransform(fragId, model) {
      return this.getFragmentTransform(fragId, model)
    },
    getFragmentTransform(fragId, model) {
      const fragProxy = this.bimfishApp.viewer.impl.getFragmentProxy(model, fragId)
      fragProxy.getAnimTransform()
      return {
        translation: {
          x: fragProxy.position.x,
          y: fragProxy.position.y,
          z: fragProxy.position.z
        }
      }
    }
  }
}
