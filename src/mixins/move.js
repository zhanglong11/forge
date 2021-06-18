/*
 * @Description:构件移动
 * @Version:
 * @Autor: 申豪强
 * @Date: 2020-05-14 14:20:22
 * @LastEditTime: 2020-05-20 16:12:18
 */
export default {
  data() {
    return {
      // 选中的构件
      selection: [],
      // 模型对象
      model: null
    }
  },
  methods: {
    async onInputChanged(form, type) {
      console.log('onInputChanged')
      let res = await this.bimfishApp.getSelectionGuidAndNoSelection()
      let selections = res.selections
      for (let item of selections) {
        let model = item.model
        let fragList = model.getFragmentList()
        let fragbBox = new THREE.Box3()
        let nodebBox = new THREE.Box3()
        item.fragIdsArray.forEach(fragId => {
          fragList.getWorldBounds(fragId, fragbBox)
          nodebBox.union(fragbBox)
          let transform = this.getTargetTransform(fragId, model)
          console.log('原始transform', transform)
          if (type === 'angle') {
            console.log('旋转前中心点', nodebBox.center())
            this.testRota(item.fragIdsArray, nodebBox.center(), model, form)
            let transform4 = this.getTargetTransform(fragId, model)
            console.log('旋转transform4', transform4)
            console.log('旋转后中心点', nodebBox.center())
          }
          if (type === 'coordinate') {
            //坐标
            transform.translation.x = form.x
            transform.translation.y = form.y
            transform.translation.z = form.z
            console.log('坐标前中心点', nodebBox.center())
            this.applyTransform(transform, model, fragId)
            let transform2 = this.getTargetTransform(fragId, model)
            console.log('坐标transform2', transform2)
            let fragbBox2 = new THREE.Box3()
            let nodebBox2 = new THREE.Box3()
            fragList.getWorldBounds(fragId, fragbBox2)
            nodebBox2.union(fragbBox2)
            console.log('坐标后中心点', nodebBox2.center())
          }
          if (type === 'zoom') {
            transform.scale.x = form.sx
            transform.scale.y = form.sy
            transform.scale.z = form.sz
            console.log('缩放前中心点', nodebBox.center())
            this.applyTransform(transform, model, fragId)
            let transform3 = this.getTargetTransform(fragId, model)
            console.log('缩放transform3', transform3)
          }
        })
      }
    },
    // 只用于旋转
    testRota(fragIds, center, model, form) {
      // 计算弧度
      // let form = JSON.parse(JSON.stringify(this.form))
      console.log('testRota', form)
      let radianX = (Number(form.rx) * Math.PI) / 180
      let radianY = (Number(form.ry) * Math.PI) / 180
      let radianZ = (Number(form.rz) * Math.PI) / 180
      this.rotateComponent(model, fragIds, center, {
        x: radianX,
        y: radianY,
        z: radianZ
      })
    },
    // 旋转
    rotateComponent(model, fragIds, center, transform) {
      model = model || this.bimfishApp.viewer.model
      // 四元数
      var quaternion = new THREE.Quaternion()
      // 绕某个轴旋转
      // quaternion.setFromAxisAngle(axis, angle)
      // 分别绕xyz轴进行移动
      let euler = new THREE.Euler(transform.x, transform.y, transform.z, 'XYZ')
      quaternion.setFromEuler(euler)
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
    },
    applyTransform(transform, model, fragId) {
      let fragTransform = {
        translation: transform.translation,
        scale: transform.scale
      }
      this.transformFragProxy(model, Number(fragId), fragTransform)
    },
    // 监听选中事件:初始化model和selection
    onSelectionChanged(e) {
      const selection = e.selections.length ? e.selections[0] : null
      this.selection = selection
      this.model = e.selections.length ? e.selections[0].model : this.bimfishApp.viewer.model
    },
    // 返回欧拉对象
    getFragmentTransform(fragId, model) {
      const fragProxy = this.bimfishApp.viewer.impl.getFragmentProxy(model, fragId)
      fragProxy.getAnimTransform()
      const quaternion = new THREE.Quaternion(
        fragProxy.quaternion._x,
        fragProxy.quaternion._y,
        fragProxy.quaternion._z,
        fragProxy.quaternion._w
      )
      const euler = new THREE.Euler()
      euler.setFromQuaternion(quaternion, 'XYZ')
      return {
        translation: {
          x: fragProxy.position.x,
          y: fragProxy.position.y,
          z: fragProxy.position.z
        },
        scale: {
          x: fragProxy.scale.x,
          y: fragProxy.scale.y,
          z: fragProxy.scale.z
        }
      }
    },
    getTargetTransform(fragId, model) {
      return this.getFragmentTransform(fragId, model)
    },
    toFloat(value) {
      const floatValue = parseFloat(value)
      return isNaN(floatValue) ? 0 : floatValue
    },
    transformFragProxy(model, fragId, transform) {
      const fragProxy = this.bimfishApp.viewer.impl.getFragmentProxy(model, fragId)
      fragProxy.getAnimTransform()
      console.log('fragProxy', fragProxy)
      console.log('fragProxytransform', transform)
      if (transform.translation) {
        fragProxy.position = transform.translation
      }
      if (transform.scale) {
        fragProxy.scale = transform.scale
      }
      fragProxy.updateAnimTransform()
      this.bimfishApp.viewer.impl.invalidate(true, true, true)
    }
  }
}
