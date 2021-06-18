

/***/ "./extensions/AEC/Minimap3D/MinimapTool.js":
/*!*************************************************!*\
  !*** ./extensions/AEC/Minimap3D/MinimapTool.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return MinimapTool; });
/* harmony import */ var _MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimapMath.js */ "./extensions/AEC/Minimap3D/MinimapMath.js");
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



  var GlobalManagerMixin = Bimfish.Viewing.GlobalManagerMixin;

  var zAxis = new THREE.Vector3(0, 0, 1);


  // Implements interaction to move player position and view direction in the Minimap
  var MinimapTool = /*#__PURE__*/function () {
    function MinimapTool(parent) {
      var trackUsage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined; _classCallCheck(this, MinimapTool);
      this.parent = parent;
      this.setGlobalManager(this.parent.globalManager);

      this.trackUsage = trackUsage;
      this.avatarInteractionTracked = false;
      this.zoomTracked = false;

      this.dragDirectionStart = this.dragDirectionStart.bind(this);
      this.dragDirectionMove = this.dragDirectionMove.bind(this);
      this.dragDirectionEnd = this.dragDirectionEnd.bind(this);

      this.dragPositionStart = this.dragPositionStart.bind(this);
      this.dragPositionMove = this.dragPositionMove.bind(this);
      this.dragPositionEnd = this.dragPositionEnd.bind(this);

      this.dragMapStart = this.dragMapStart.bind(this);
      this.dragMapMove = this.dragMapMove.bind(this);
      this.dragMapEnd = this.dragMapEnd.bind(this);

      this.onWheel = this.onWheel.bind(this);
      this.onDblClick = this.onDblClick.bind(this);

      this.handleGesture = this.handleGesture.bind(this);

      // when dragging view direction, we lastAngle stores the angle between +y and the line from playerPos to last mouse position.
      this.lastAngle = undefined;

      // Zoom-factor change per mouse-wheel delta
      this.zoomSensitivity = 0.05;

      // In order to prevent multiple navigation events simultaneously, on each event-start dragLock should be set.
      // At most cased event.stopPropagation would be enough, but because we mix DOM events and Hammer.js - it's not stopping the propagation entirely.
      this.dragLock = false;

      // Time in seconds for flyTo animations used on dblClick.
      this.flyToTime = 1.0;
      this.flyToAnim = null; // {AnimControl}
    } _createClass(MinimapTool, [{
      key: "onWheel", value: function onWheel(

        e) {
        if (this.parent.animationActive()) {
          return;
        }

        // TODO: Use ToolController or consider annoying browser differences
        var delta = e.wheelDelta / 40;

        // modify zoomScale
        var zoomLevelNew = this.parent.targetZoomLevel + delta * this.zoomSensitivity;

        // zoomLevel of 0 corresponds to zoomScale 2^0 = 1 => maximum available map resolution.
        var zoomLevelMax = this.parent.getMaxZoomLevel();

        // clamp against valid zoom range
        var zoomLevelMin = this.parent.getMinZoomLevel();
        zoomLevelNew = THREE.Math.clamp(zoomLevelNew, zoomLevelMin, zoomLevelMax);

        // Stop here if there is no change. (e.g., when trying to zoomIn more when already at maxZoon)
        if (zoomLevelNew === this.parent.targetZoomLevel) {
          return;
        }

        // Get map position under mouse (before changing zoom)
        var zoomTargetPosBefore = this.getMapPosition(e);

        this.parent.setZoomLevel(zoomLevelNew, false);

        if (!this.dragLock) {

          // Goal here is that zoomTargetPos keeps under mouse after zoom as well.
          // For this, we adjust the mapCenter of the Minimap.

          // Apply position immediately.
          this.parent.resetScrolling();

          // Get map position under mouse (after changing zoom)
          var zoomTargetPosAfter = this.getMapPosition(e);

          // Compute correction offset: How far do we have to shift the map to move it back to zoomTargetPosBefore
          var offset = zoomTargetPosBefore.clone().sub(zoomTargetPosAfter);

          // Shift the map center accordingly. This shifts the position under mouse by the same amount.
          this.parent.mapCenter = this.parent.mapCenter.clone().add(offset);

          // We just shifted the map center, so we have to reset scrolling again.
          this.parent.resetScrolling();
        }

        if (!this.zoomTracked) {
          this.zoomTracked = true;
          this.trackUsage && this.trackUsage({
            zoom_tracked: true
          });

        }

        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      key: "activate", value: function activate() {
        this.parent.playerPositionWidget.playerPositionHitArea.addEventListener('mousedown', this.dragPositionStart);
        this.parent.playerPositionWidget.playerPositionHitArea.addEventListener('touchstart', this.dragPositionStart);
        this.parent.playerPositionWidget.addEventListener('mousedown', this.dragDirectionStart);
        this.parent.playerPositionWidget.addEventListener('touchstart', this.dragDirectionStart);
        this.parent.mapWidget.addEventListener('mousedown', this.dragMapStart);
        this.parent.mapWidget.addEventListener('wheel', this.onWheel);
        this.parent.mapWidget.addEventListener('dblclick', this.onDblClick);

        if (Bimfish.Viewing.isTouchDevice()) {
          this.hammer = new Bimfish.Viewing.Hammer.Manager(this.parent.mapWidget, {
            recognizers: [
              Bimfish.Viewing.GestureRecognizers.drag,
              Bimfish.Viewing.GestureRecognizers.doubletap,
              Bimfish.Viewing.GestureRecognizers.pinch],

            handlePointerEventMouse: false,
            inputClass: Bimfish.Viewing.isIE11 ? Bimfish.Viewing.Hammer.PointerEventInput : Bimfish.Viewing.Hammer.TouchInput
          });


          this.hammer.get('pinch').recognizeWith([this.hammer.get('drag')]);
          this.hammer.on('pinchstart pinchmove pinchend', this.handleGesture);
          this.hammer.on('dragstart dragmove dragend', this.handleGesture);
          this.hammer.on('doubletap', this.onDblClick);
        }
      }
    }, {
      key: "deactivate", value: function deactivate() {
        this.parent.playerPositionWidget.playerPositionHitArea.removeEventListener('mousedown', this.dragPositionStart);
        this.parent.playerPositionWidget.playerPositionHitArea.removeEventListener('touchend', this.dragPositionStart);
        this.parent.playerPositionWidget.removeEventListener('mousedown', this.dragDirectionStart);
        this.parent.playerPositionWidget.removeEventListener('touchstart', this.dragDirectionStart);
        this.parent.mapWidget.removeEventListener('mousedown', this.dragMapStart);
        this.parent.mapWidget.removeEventListener('wheel', this.onWheel);
        this.parent.mapWidget.removeEventListener('dblclick', this.onDblClick);

        this.hammer && this.hammer.destroy();

        this.dragPositionEnd();
        this.dragDirectionEnd();
        this.dragMapEnd();
      }

      // Get the distance between the two fingers, relative to the map's size.
      // Used in order to measure how much we want to zoom - based on the pinch length and the map's dimensions.
    }, {
      key: "getNormalizedPointersDistance", value: function getNormalizedPointersDistance(event) {
        if (event.pointers[0] && event.pointers[1]) {
          var dx = (event.pointers[1].clientX - event.pointers[0].clientX) / this.parent.mapWidgetWidth;
          var dy = (event.pointers[1].clientY - event.pointers[0].clientY) / this.parent.mapWidgetHeight;
          return Math.sqrt(dx * dx + dy * dy);
        }

        return 0;
      }
    }, {
      key: "setMeanPoint", value: function setMeanPoint(

        event) {
        if (event.pointers[0] && event.pointers[1]) {
          event.clientX = (event.pointers[1].clientX + event.pointers[0].clientX) / 2;
          event.clientY = (event.pointers[1].clientY + event.pointers[0].clientY) / 2;
        }
      }
    }, {
      key: "handleGesture", value: function handleGesture(

        e) {
        if (this.dragLock && this.dragType !== 'map') {
          return;
        }

        this.convertEventHammerToMouse(e);
        this.setMeanPoint(e);

        var dist = this.getNormalizedPointersDistance(e) * 3000;
        e.wheelDelta = dist - (this.lastPinchDistance || 0);
        this.lastPinchDistance = dist;

        switch (e.type) {
          case 'dragstart':
            this.dragMapStart(e);
            break;
          case 'dragmove':
            this.dragMapMove(e);
            break;
          case 'dragend':
            this.dragMapEnd(e);
            break;
          case 'pinchstart':
            this.lastDragMapPoint = null;
            this.dragMapStart(e);
            this.lastDragMapPoint = this.getMapPosition(e, true);
            break;
          case 'pinchmove':
            this.dragMapMove(e);
            this.onWheel(e);
            this.lastDragMapPoint = this.getMapPosition(e, true);
            break;
          case 'pinchend':
            this.dragMapEnd(e);
            this.onWheel(e);
            break;
          default:
            break;
        }

      }

      // Convert event client coords to absolute (=zoom and scroll-independent) pixel-coords on the map.
    }, {
      key: "getMapPosition", value: function getMapPosition(e, ignoreScrollPos) {
        // get minimap pixel coords
        var clientRect = this.parent.mapWidget.getBoundingClientRect();

        if (e.type.contains('touch')) {
          e.clientX = e.touches[0].pageX;
          e.clientY = e.touches[0].pageY;
        }

        // get position within map widget
        var p = new THREE.Vector2(e.clientX - clientRect.left, e.clientY - clientRect.top);

        // transform point to mapImage pixels
        if (ignoreScrollPos) {
          p.x /= this.parent.zoomScale;
          p.y /= this.parent.zoomScale;
        } else {
          this.parent.widgetToMapPixels(p);
        }

        return p;
      }
    }, {
      key: "dragMapStart", value: function dragMapStart(

        e) {
        if (this.dragLock) {
          return;
        }

        if (this.parent.animationActive()) {
          return;
        }

        this.dragType = 'map';

        this.addWindowEventListener('mousemove', this.dragMapMove);
        this.addWindowEventListener('mouseup', this.dragMapEnd);

        this.lastDragMapPoint = this.getMapPosition(e, true);
        this.parent.mapCenter = this.parent.mapCenter.clone();

        this.dragLock = true;
        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      key: "dragMapMove", value: function dragMapMove(

        e) {
        if (this.dragLock && this.dragType !== 'map') {
          return;
        }

        var currentPoint = this.getMapPosition(e, true);

        if (this.lastDragMapPoint) {
          var p = this.lastDragMapPoint.sub(currentPoint);
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["rotateAround"])(p, { x: 0, y: 0 }, -this.parent.mapRotationAngle);
          this.parent.mapCenter.add(p);
        }

        this.lastDragMapPoint = currentPoint;

        // Apply dragging immediately.
        this.parent.resetScrolling();

        this.parent.update();

        e.stopPropagation();
      }
    }, {
      key: "dragMapEnd", value: function dragMapEnd(

        e) {
        if (this.dragLock && this.dragType !== 'map') {
          return;
        }

        this.removeWindowEventListener('mousemove', this.dragMapMove);
        this.removeWindowEventListener('mouseup', this.dragMapEnd);

        this.lastDragMapPoint = null;

        this.parent.update();

        this.dragLock = false;
        e && e.stopPropagation();
      }
    }, {
      key: "dragPositionStart", value: function dragPositionStart(

        e) {
        if (this.dragLock) {
          return;
        }

        this.dragType = 'position';

        this.addWindowEventListener('mousemove', this.dragPositionMove);
        this.addWindowEventListener('mouseup', this.dragPositionEnd);
        this.addWindowEventListener('touchmove', this.dragPositionMove);
        this.addWindowEventListener('touchend', this.dragPositionEnd);

        // Make sure that map doesn't scroll/follow while we are moving the avatar
        this.parent.autoScrollLocked = true;

        this.dragLock = true;
        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      key: "dragPositionMove", value: function dragPositionMove(

        e) {
        if (this.dragLock && this.dragType !== 'position') {
          return;
        }

        // get minimap pixel coords
        var _this$getMapPosition = this.getMapPosition(e), x = _this$getMapPosition.x, y = _this$getMapPosition.y;

        // clamp x/y to map extent => avoid dragging out of the map
        x = THREE.Math.clamp(x, 0, this.parent.mapImageWidth);
        y = THREE.Math.clamp(y, 0, this.parent.mapImageHeight);

        var camera = this.parent.viewer.impl.camera;

        // keep z the same as before
        var zWorld = camera.position.z;

        // save current pos
        var oldPosition = camera.position.clone();

        var pos3D = this.parent.mapPixelsToWorld(x, y, zWorld);

        // move camera to new 3D position
        camera.position.copy(pos3D);

        // apply delta to the target vector
        var delta = camera.position.clone().sub(oldPosition);

        camera.target.add(delta);
        camera.target.z = zWorld;

        this.parent.viewer.impl.invalidate(true, true, true);
        this.parent.viewer.dispatchEvent({ type: Bimfish.Viewing.CAMERA_CHANGE_EVENT, camera: camera });

        e.stopPropagation();
      }
    }, {
      key: "dragPositionEnd", value: function dragPositionEnd(

        e) {
        if (this.dragLock && this.dragType !== 'position') {
          return;
        }

        this.parent.autoScrollLocked = false;

        this.removeWindowEventListener('mousemove', this.dragPositionMove);
        this.removeWindowEventListener('mouseup', this.dragPositionEnd);
        this.removeWindowEventListener('touchmove', this.dragPositionMove);
        this.removeWindowEventListener('touchend', this.dragPositionEnd);

        if (!this.avatarInteractionTracked) {
          this.avatarInteractionTracked = true;
          this.trackUsage && this.trackUsage({
            avatar_interaction_tracked: true
          });

        }

        // If we dragged onto a sheet, we can now trigger the transtion to it.
        this.parent.update();

        this.dragLock = false;

        e && e.stopPropagation();
      }
    }, {
      key: "dragDirectionStart", value: function dragDirectionStart(

        e) {
        if (this.dragLock) {
          return;
        }

        this.dragType = 'direction';

        // remember angle between north and (playerPos, mousePos) at dragStart
        var p1 = this.parent.playerPos;
        var p2 = this.getMapPosition(e);
        this.lastAngle = this.parent.computeAngle(p1, p2);

        this.addWindowEventListener('mousemove', this.dragDirectionMove);
        this.addWindowEventListener('mouseup', this.dragDirectionEnd);
        this.addWindowEventListener('touchmove', this.dragDirectionMove);
        this.addWindowEventListener('touchend', this.dragDirectionEnd);

        this.dragLock = true;
        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      key: "dragDirectionMove", value: function dragDirectionMove(

        e) {
        if (this.dragLock && this.dragType !== 'direction') {
          return;
        }

        // compute current angle
        var p1 = this.parent.playerPos;
        var p2 = this.getMapPosition(e);
        var newAngle = this.parent.computeAngle(p1, p2);
        var delta = this.lastAngle - newAngle;

        // apply delta to view direction
        var camera = this.parent.viewer.impl.camera;
        var viewVec = camera.target.clone().sub(camera.position);
        viewVec.applyAxisAngle(zAxis, delta);
        viewVec.add(camera.position);
        camera.target.copy(viewVec);

        // Rotate up-vector as well.
        camera.up.applyAxisAngle(zAxis, delta);

        this.parent.viewer.impl.syncCamera();
        this.parent.viewer.dispatchEvent({ type: Bimfish.Viewing.CAMERA_CHANGE_EVENT, camera: camera });

        this.lastAngle = newAngle;

        e.stopPropagation();
      }
    }, {
      key: "dragDirectionEnd", value: function dragDirectionEnd(

        e) {
        if (this.dragLock && this.dragType !== 'direction') {
          return;
        }

        this.removeWindowEventListener('mousemove', this.dragDirectionMove);
        this.removeWindowEventListener('mouseup', this.dragDirectionEnd);
        this.removeWindowEventListener('touchmove', this.dragDirectionMove);
        this.removeWindowEventListener('touch', this.dragDirectionEnd);

        this.dragLock = false;
        e && e.stopPropagation();
      }
    }, {
      key: "onDblClick", value: function onDblClick(

        e) {
        this.convertEventHammerToMouse(e);

        // get minimap pixel coords
        var _this$getMapPosition2 = this.getMapPosition(e), x = _this$getMapPosition2.x, y = _this$getMapPosition2.y;

        // Only do something if either image map or sheet map is shown
        var mapShown = this.parent.mapValid || this.parent.useSheet && this.parent.sheetMap.ready;
        if (!mapShown || !this.parent.mapPixelValid(x, y)) {
          return;
        }

        // preserve camera-direction
        var camera = this.parent.viewer.impl.camera;
        var dir = camera.getWorldDirection();

        // when coming from an overview perspective, we don't want to just see the ground afterwards
        dir.z = Math.max(dir.z, 0.0);

        // choose z based on current level
        var level = this.parent.getCurrentLevel();
        var model = this.parent.mapModels && this.parent.mapModels[0];
        if (!level || !model) {
          return;
        }

        // determine avatar height - considering model unit scale (visible models must always have compatible units)
        // TODO: We should unify avatar height code in PlaceMe, Minimap, and BimWalk
        var avatarHeight = 1.7 / model.getUnitScale(); // 1.7m
        var zWorld = level.zMin + avatarHeight;

        // Should usually not happen unless level data is weird for some reason
        if (!isFinite(zWorld)) {
          return;
        }

        // Compute new camera position
        var pos3D = this.parent.mapPixelsToWorld(x, y, zWorld);
        var target = pos3D.clone().add(dir);
        var dstView = {
          position: pos3D,
          target: target,
          up: camera.up
        };


        var wasOutside = this.parent.isOutside();
        if (wasOutside) {
          // Immediately move to target position. When coming from outside (e.g. overview perspective),
          // a transition would need to fly very fast and potentially through several walls.
          // So, it would need some extra work to make it look good. Since the minimap already gives
          // a clue on where you are, we just jump there directly for this case.
          camera.position.copy(pos3D);
          camera.target.copy(pos3D).add(dir);
          this.parent.viewer.impl.invalidate(true, true, true);
          this.parent.viewer.dispatchEvent({ type: Bimfish.Viewing.CAMERA_CHANGE_EVENT, camera: camera });

          // zoom-in map to target position
          this.parent.targetZoomLevel = 0;
        } else {
          // Use flight transition to new position
          this.flyToAnim = Bimfish.Viewing.Private.flyToView(this.parent.viewer, dstView, this.flyToTime);
        }

        e.stopPropagation();
        e.preventDefault();
      }
    }, {
      key: "flyToAnimRunning", value: function flyToAnimRunning() {
        return this.flyToAnim && this.flyToAnim.isRunning;
      }
    }, {
      key: "convertEventHammerToMouse", value: function convertEventHammerToMouse(

        event) {
        if (event.pointers) {
          event.clientX = event.pointers[0].clientX;
          event.clientY = event.pointers[0].clientY;
        }
      }
    }]); return MinimapTool;
  }();


  GlobalManagerMixin.call(MinimapTool.prototype);

  /***/
}),