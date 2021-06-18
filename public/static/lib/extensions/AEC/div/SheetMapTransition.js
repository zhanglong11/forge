/***/ "./extensions/AEC/Minimap3D/SheetMapTransition.js":
/*!********************************************************!*\
  !*** ./extensions/AEC/Minimap3D/SheetMapTransition.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return SheetMapTransition; });
/* harmony import */ var _SheetMap_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SheetMap.js */ "./extensions/AEC/Minimap3D/SheetMap.js");
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


  var av = Bimfish.Viewing;
  var avp = av.Private;

  var GlobalManagerMixin = av.GlobalManagerMixin;

  var readOpacity = function readOpacity(div) {
    // Note that just using div.style.opacity may be "", i.e., is not always helpful.
    var _document = div.ownerDocument;
    var _window = _document.defaultView || _document.parentWindow;
    var style = _window.getComputedStyle(div);
    return parseFloat(style.opacity);
  };

  // A SheetMapTransition morphs smoothly from main map of a level to a single sheetmap.
  var SheetMapTransition = /*#__PURE__*/function () {

    function SheetMapTransition(minimap) {
      _classCallCheck(this, SheetMapTransition);

      this.setGlobalManager(minimap.globalManager);
      this.minimap = minimap;
      this.sheetMap = minimap.sheetMap;

      // Start/End values for all params controlled by this transition. They are set on anim start.
      this.angleStart = undefined;
      this.angleEnd = undefined;
      this.zoomLevelStart = undefined;
      this.zoomLevelEnd = undefined;
      this.viewerOpacityStart = undefined;
      this.viewerOpacityEnd = undefined;
      this.thumbnailOpacityStart = undefined;
      this.thumbnailOpacityEnd = undefined;

      // If transition is running, this flag determines whether we are zooming into sheet or back to the main map
      this.zoomingIn = false;

      // Time for a transition in seconds
      this.animTime = 2;
    }

    // Stops running transition (if any). Note that all values (rotation etc.) will remain in the current intermediate state.
    _createClass(SheetMapTransition, [{
      key: "stop", value: function stop() {
        if (this.anim) {
          this.anim.stop();
        }
      }
    }, {
      key: "isRunning", value: function isRunning() {
        return this.anim && this.anim.isRunning;
      }

      // Returns true if a zoomIn is in progress
    }, {
      key: "isZoomingIn", value: function isZoomingIn() {
        return this.zoomingIn && this.anim && this.anim.isRunning;
      }

      // Returns true if a zoomOut is in progres
    }, {
      key: "isZoomingOut", value: function isZoomingOut() {
        return !this.zoomingIn && this.anim && this.anim.isRunning;
      }
    }, {
      key: "enterSheet", value: function enterSheet() {
        var _this = this;
        // If we are already zooming in, do nothing
        if (this.isZoomingIn()) {
          return;
        }
        // Make sure that we don't overlap with a previous zoomOut
        this.stop();

        this.zoomIn = true;

        // At the end of the transition, we want to align the map so that the sheet is aligned with the mapWidget.
        // Therefore, we apply the inverse rotation to the whole map.
        this.startAngle = this.minimap.mapRotationAngle;
        this.endAngle = -this.minimap.sheetMap.config.thumbnail.angle;

        // Zoom-in to see full sheet height
        this.zoomLevelStart = this.minimap.zoomLevel;
        this.zoomLevelEnd = this.getTargetZoomLevel();

        // Fade-in viewer
        this.viewerOpacityStart = readOpacity(this.minimap.sheetMap.mapViewer.container);
        this.viewerOpacityEnd = _SheetMap_js__WEBPACK_IMPORTED_MODULE_0__["default"].OverlayOpacity;

        // Fade-out thumbnail
        this.thumbnailOpacityStart = readOpacity(this.minimap.sheetMap.config.thumbnail.div);
        this.thumbnailOpacityEnd = 0;

        this.anim = avp.fadeValue(0, 1, this.animTime, function (t) { return _this.update(t); });

        this.sheetMap.setVisible(true);
      }
    }, {
      key: "exitSheet", value: function exitSheet() {
        var _this2 = this;
        // If we are already zooming out, do nothing
        if (this.isZoomingOut()) {
          return;
        }

        // Make sure that we don't overlap with a previous zoomIn
        this.stop();

        this.zoomIn = false;

        // Rotate back to main-map default orientation
        this.startAngle = this.minimap.mapRotationAngle;
        this.endAngle = 0;

        // Zoom-out to see a bit more of the surrounding main map
        this.zoomLevelStart = this.minimap.zoomLevel;
        this.zoomLevelEnd = 0.5 * this.minimap.zoomLevel;

        // Fade-out viewer
        this.viewerOpacityStart = readOpacity(this.sheetMap.mapViewer.container);
        this.viewerOpacityEnd = 0;

        // Fade-out thumbnail
        this.thumbnailOpacityStart = readOpacity(this.sheetMap.config.thumbnail.div);
        this.thumbnailOpacityEnd = _SheetMap_js__WEBPACK_IMPORTED_MODULE_0__["default"].OverlayOpacity;

        var onFinished = function onFinished() {
          _this2.sheetMap.setVisible(false);
        };

        this.anim = avp.fadeValue(0, 1, this.animTime, function (t) { return _this2.update(t); }, onFinished);
      }

      // Computes the zoomLevel that we use when "zooming into" this sheet thumbnail.
      // After zooming into a sheet, the map is aligned in a way that...
      //  - player widget is at the center
      //  - full vertical extent of the sheet is visible
      // @returns {number}
    }, {
      key: "getTargetZoomLevel", value: function getTargetZoomLevel() {

        var pos3D = this.minimap.viewer.impl.camera.position;

        // get sheetmap matrix
        var sheetMapMatrix = this.sheetMap.config.mapMatrix;
        var sheetMapMatrixInv = this.sheetMap.config.mapMatrixInv;

        // wdiget height
        var mapWidgetHeight = this.minimap.mapWidgetHeight;

        // Compute playerPos in sheetmap space
        var p = pos3D.clone().applyMatrix4(sheetMapMatrix);

        // Compute distance of p from upper and lower edge - and their max value dMax
        var d1 = Math.abs(p.y);
        var d2 = Math.abs(1.0 - p.y);
        var dMax = Math.max(d1, d2);

        // Compute points on sheetmap that we want to project to top center and bottom center of the widget
        var pBottom = p.clone();
        var pTop = p.clone();
        pBottom.y -= dMax;
        pTop.y += dMax;

        // Project both points to main map pixel coords
        pBottom.applyMatrix4(sheetMapMatrixInv);
        pTop.applyMatrix4(sheetMapMatrixInv);
        pBottom = this.minimap.worldToMapPixels(pBottom);
        pTop = this.minimap.worldToMapPixels(pTop);

        // Compute distance between pTop and pBottom in main map pixel-space.
        var dist = pBottom.distanceTo(pTop);

        // Compute zoomScale for which 'dist' is scaled to the widget height
        var zoomScale = mapWidgetHeight / dist;
        var zoomLevel = Math.log2(zoomScale);
        return zoomLevel;
      }

      // Update animation state while transition is running.
      //  @param {number} t - given in unit time (0=start, 1=end)
    }, {
      key: "update", value: function update(t) {

        t = avp.smootherStep(t);

        var angle = avp.lerp(this.startAngle, this.endAngle, t);
        var zoomLevel = avp.lerp(this.zoomLevelStart, this.zoomLevelEnd, t);

        // apply zoomLevel
        this.minimap.setZoomLevel(zoomLevel);
        this.minimap.setRotation(angle);

        // Keep sheet camera in-sync. This would usually happen on next timer-event.
        // But it makes it easier to test if the camera keeps consistent.
        this.sheetMap.syncCameraToMainMap();

        var viewerOpacity = avp.lerp(this.viewerOpacityStart, this.viewerOpacityEnd, t);
        var thumbnailOpacity = avp.lerp(this.thumbnailOpacityStart, this.thumbnailOpacityEnd, t);

        // Fade thumbnail to actual viewer instance
        this.sheetMap.mapViewer.container.style.opacity = viewerOpacity;

        // If sheets were disabled meanwhile, just continue zoom-out, but don't fade-in thumbnail opacity anymore.
        // Otherwise, it would conflict with fading all thumbnails out when switching sheets off.
        if (this.minimap.useSheet) {
          this.sheetMap.config.thumbnail.div.style.opacity = thumbnailOpacity;
        }
      }

      // When changing from one sheet directly into another one, we have to make sure that
      // the sheet thumbnail of the previous one gets full opacity again.
    }, {
      key: "onSheetWillChange", value: function onSheetWillChange() {
        this.stop();
        if (this.minimap.useSheet && this.sheetMap.config) {
          this.sheetMap.config.thumbnail.div.style.opacity = _SheetMap_js__WEBPACK_IMPORTED_MODULE_0__["default"].OverlayOpacity;
        }
      }
    }]); return SheetMapTransition;
  }();


  GlobalManagerMixin.call(SheetMapTransition.prototype);

  /***/
}),
