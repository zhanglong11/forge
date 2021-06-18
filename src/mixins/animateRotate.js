/*
 * @Description:视觉效果-构件移动,记得要在mix中引入bimfish变量
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-24 11:45:56
 * @LastEditTime: 2020-05-24 17:35:10
 */
export default {
  methods: {
    async rotatePositionChange(model, fragIdsArray, angle, axis = new THREE.Vector3(1, 0, 0)) {
      let fragList = model.getFragmentList()
      let fragbBox = new THREE.Box3()
      let nodebBox = new THREE.Box3()
      fragIdsArray.forEach(fragId => {
        fragList.getWorldBounds(fragId, fragbBox)
        nodebBox.union(fragbBox)
      })
      let radian = (angle * Math.PI) / 180
      this.testRota(fragIdsArray, nodebBox.center(), model, radian, axis)
    },
    // 只用于旋转
    testRota(fragIds, center, model, radian, axis) {
      this.rotateComponent(model, fragIds, center, radian, axis)
    },
    // 旋转
    rotateComponent(model, fragIds, center, radian, axis) {
      model = model || this.bimfishApp.viewer.model
      // 四元数
      var quaternion = new THREE.Quaternion()
      // 绕某个轴旋转
      quaternion.setFromAxisAngle(axis, radian)
      // 分别绕xyz轴进行移动
      // let euler = new THREE.Euler(transform.x, transform.y, transform.z, 'XYZ')
      // quaternion.setFromEuler(euler)
      fragIds.forEach(fragId => {
        // 这是three.js中的网格对象
        const fragProxy = this.bimfishApp.viewer.impl.getFragmentProxy(model, fragId)
        fragProxy.getAnimTransform()
        // 这一步的目的是将模型的中心挪到原点，在原点上进行旋转等操作
        var position = new THREE.Vector3(
          fragProxy.position.x - center.x,
          fragProxy.position.y - center.y,
          fragProxy.position.z - center.z
        )
        // 通过四元数旋转构件
        position.applyQuaternion(quaternion)
        // position坐标加上中心点的坐标（上一步的补偿）
        position.add(center)
        fragProxy.position = position
        // 重新设置四元组
        fragProxy.quaternion.multiplyQuaternions(quaternion, fragProxy.quaternion)
        fragProxy.updateAnimTransform()
        // model.setVisibility(fragId, true)
      })
      this.bimfishApp.viewer.impl.invalidate(true, true, true)
    }
  }
}
