
/***/ "./extensions/AEC/DropMe/ViewPortOverlay.js":
/*!**************************************************!*\
  !*** ./extensions/AEC/DropMe/ViewPortOverlay.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return ViewPortOverlay; });
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var av = Bimfish.Viewing, avp = av.Private; var

    ViewPortOverlay = /*#__PURE__*/function () {
      function ViewPortOverlay(viewer) {
        _classCallCheck(this, ViewPortOverlay);
        this.viewer = viewer;
        this.overlayName = 'DropMeViewPortOverlay';
      } _createClass(ViewPortOverlay, [{
        key: "addOverlay", value: function addOverlay(

          xMin, yMin, xMax, yMax) {
          this.viewer.impl.createOverlayScene(this.overlayName);

          var mesh = this._createMesh(xMin, yMin, xMax, yMax);
          this.viewer.impl.addOverlay(this.overlayName, mesh);
        }
      }, {
        key: "removeOverlay", value: function removeOverlay() {
          this.viewer.impl.removeOverlayScene(this.overlayName);
        }
      }, {
        key: "_createMesh", value: function _createMesh(

          xMin, yMin, xMax, yMax) {
          var vpId = 0;
          var dbId = -1;
          var layer = 0;
          var borderColor = 0x99d79606;
          var lineWidth = 0.1;
          var totalDist = 0;

          var vbb = new avp.VertexBufferBuilder(false, undefined, 4);

          // add border
          vbb.addSegment(xMin, yMin, xMax, yMin, totalDist, lineWidth, borderColor, dbId, layer, vpId);
          vbb.addSegment(xMax, yMin, xMax, yMax, totalDist, lineWidth, borderColor, dbId, layer, vpId);
          vbb.addSegment(xMax, yMax, xMin, yMax, totalDist, lineWidth, borderColor, dbId, layer, vpId);
          vbb.addSegment(xMin, yMax, xMin, yMin, totalDist, lineWidth, borderColor, dbId, layer, vpId);

          var meshData = vbb.toMesh();
          var mdata = {
            mesh: meshData,
            is2d: true,
            packId: '0',
            meshIndex: 1
          };


          avp.BufferGeometryUtils.meshToGeometry(mdata);
          var geom = mdata.geometry;

          var materialParams = {
            skipEllipticals: true,
            skipCircles: true,
            skipTriangleGeoms: true,
            useInstancing: false
          };


          var matman = this.viewer.impl.matman();
          var matName = matman.create2DMaterial(this.viewer.impl.model, materialParams);
          var material = matman.findMaterial(this.viewer.impl.model, matName);

          var mesh = new THREE.Mesh(geom, material);
          return mesh;
        }
      }]); return ViewPortOverlay;
    }();

  /***/
}),