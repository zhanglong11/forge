
/***/ "./extensions/AEC/DropMe/DropMeTool.js":
/*!*********************************************!*\
  !*** ./extensions/AEC/DropMe/DropMeTool.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return DropMeTool; });
/* harmony import */ var _ViewPortOverlay_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ViewPortOverlay.js */ "./extensions/AEC/DropMe/ViewPortOverlay.js");
/* harmony import */ var _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/AecModelData.js */ "./extensions/AEC/common/AecModelData.js");
  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); } function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); } function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); } function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; } function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); } function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




  var av = Bimfish.Viewing, avp = av.Private;
  var GlobalManagerMixin = av.GlobalManagerMixin;

  var DROPME_MODE = { auto: 'Auto', manual: 'Manual' }; var

    DropMeTool = /*#__PURE__*/function (_av$ToolInterface) {
      _inherits(DropMeTool, _av$ToolInterface);
      function DropMeTool(viewer, onDrop, options) {
        var _this; _classCallCheck(this, DropMeTool);
        _this = _possibleConstructorReturn(this, _getPrototypeOf(DropMeTool).call(this));

        _this.names = ['drop-me'];
        _this.viewer = viewer;
        _this.setGlobalManager(_this.viewer.globalManager);
        _this.options = options;
        if (_this.options.teleportOnRelease === undefined) {
          _this.options.teleportOnRelease = true; // Set true by default
        }
        _this.viewer.toolController.registerTool(_assertThisInitialized(_this));
        _this.onDrop = onDrop;
        _this.active = false;
        _this._movedSinceFirstClick = false;
        _this.init();

        _this.cameraSelectionState = {
          pending: false,
          pos: null,
          target: null,
          inViewport: false,
          initialVp: null
        };


        _this.teleportationInProgress = 0;

        // 'False' indicates if the user has clicked a first time alredy to choose position, so that the
        // next click will determine view-direction and instantly invoke the transition.
        _this.isFirstClick = true;

        _this.viewPortOverlay = new _ViewPortOverlay_js__WEBPACK_IMPORTED_MODULE_0__["default"](_this.viewer);
        _this.escapeHotkeyId = 'Bimfish.AEC.DropMeToolEsc'; return _this;
      } _createClass(DropMeTool, [{
        key: "init", value: function init() {
          var _this2 = this;

          this.activate = function () {
            var gestureHandler = _this2.viewer.toolController.getTool("gestures");
            if (gestureHandler) {
              gestureHandler.setGestureParameter('drag', 'threshold', 0);
            }

            var hotkeys = [{
              keycodes: [
                Bimfish.Viewing.KeyCode.ESCAPE],

              onRelease: function onRelease() { return _this2.options.triggerDeactivate && _this2.options.triggerDeactivate(); }
            }];

            _this2.viewer.getHotkeyManager().pushHotkeys(_this2.escapeHotkeyId, hotkeys);
            _this2.viewer.addEventListener(av.MODEL_ADDED_EVENT, _this2.options.triggerDeactivate);
            _this2.viewer.impl.pauseHighlight(true);
            _this2.active = true;
          };

          this.deactivate = function () {
            var gestureHandler = _this2.viewer.toolController.getTool("gestures");
            if (gestureHandler) {
              gestureHandler.restoreGestureParameterDefault('drag', 'threshold');
            }

            _this2.viewer.getHotkeyManager().popHotkeys(_this2.escapeHotkeyId);
            _this2._cancelTeleportation();
            _this2._destroyCameraSelectorUi();
            _this2.viewer.removeEventListener(av.MODEL_ADDED_EVENT, _this2.options.triggerDeactivate);
            _this2.viewer.impl.pauseHighlight(false);
            _this2.active = false;
            _this2._movedSinceFirstClick = false;
          };

          this.handleButtonDown = function (event) {
            return true;
          };

          this.handleButtonUp = function (event) {
            if (!this._movedSinceFirstClick || this.isFirstClick) {
              return false;
            }
            return true;
          };

          this.handleSingleClick = function (e, isTouch) {
            if (_this2.isFirstClick) {
              var tmpres = _this2._get3DCameraPositionAndVp(e.canvasX, e.canvasY);
              if (tmpres && tmpres.pos) {
                _this2.cameraSelectionState.pos = { x: e.canvasX, y: e.canvasY };
                _this2.cameraSelectionState.pending = true;
                _this2.cameraSelectionState.initialVp = tmpres.vp;

                _this2._createCameraSelectorUi(_this2.cameraSelectionState.pos);

                requestAnimationFrame(function () {
                  // We should only trigger animation if mouse has not been moved since the first click.
                  if (!_this2._movedSinceFirstClick)
                    _this2.cameraSelectorPosition.classList.add('camera-selector-position--teleporting');
                });

                if (tmpres.vp.viewType !== 'Section' && !isTouch) {
                  // while teleportation is pending this.handleMouseMove will move camera frustum
                  _this2._scheduleTeleportation();

                  // needed only for scheduled teleportation
                  _this2.isFirstClick = false;
                  _this2.cursor = 'none';
                  _this2.getCursor();
                } else {
                  _this2._runTeleportation(DROPME_MODE.auto);
                }
              }
            } else {
              if (_this2.options.teleportOnRelease) {
                _this2.teleport();
              }
            }

            // As expectation of single click is a teleportation to another view, we simply consume event and do not propogate it further
            return true;
          };

          this.teleport = function () {
            _this2.cameraSelectionState.target = { x: _this2.lastX, y: _this2.lastY };
            _this2._runTeleportation(DROPME_MODE.manual);
            _this2.isFirstClick = _this2.options.teleportOnRelease;
            _this2._movedSinceFirstClick = false;
            _this2._recoverCursor();
          };

          this.handleMouseMove = function (e) {
            if (!_this2.isFirstClick && !_this2._movedSinceFirstClick)
              _this2._movedSinceFirstClick = true;

            if (_this2.cursor)
              _this2._recoverCursor();

            var tmpres = _this2._get3DCameraPositionAndVp(e.canvasX, e.canvasY);

            if (_this2.cameraSelectionState.initialVp && !_this2.isFirstClick) {
              _this2._addVpOverlay(_this2.cameraSelectionState.initialVp);
            } else
              if (tmpres && tmpres.pos) {
                _this2._addVpOverlay(tmpres.vp);
              } else {
                _this2.viewPortOverlay.removeOverlay();
              }

            _this2.cameraSelectionState.inViewport = _this2.isFirstClick && tmpres && tmpres.pos || !_this2.isFirstClick;
            _this2.getCursor();

            if (!_this2.cameraSelectionState.pending) {
              return;
            }

            if (_this2.teleportationInProgress) {
              // cancel position animation
              _this2.cameraSelectorPosition.classList.remove('camera-selector-position--teleporting');
              clearTimeout(_this2.teleportationInProgress);
              _this2.teleportationInProgress = 0;
            }

            _this2.lastX = e.canvasX;
            _this2.lastY = e.canvasY;
            var dx = e.canvasX - _this2.cameraSelectionState.pos.x;
            var dy = e.canvasY - _this2.cameraSelectionState.pos.y;
            var angle = Math.atan2(dy, dx) * 180 / Math.PI;

            // In case the mouse moved:
            if (dx !== 0 || dy !== 0) {
              // atan measures the angle to the x-axis, but the frustum gizmo is originally aligned with y.
              angle += 90;
            }

            _this2.cameraSelector.style.transform = "rotate(".concat(angle, "deg)");

            if (!_this2.options.teleportOnRelease) {
              _this2.teleport();
            }

            //console.log(angle);
            return true;
          };

          this.handleSingleTap = function (event) {
            return this.handleSingleClick(event, true);
          };

          this.handleResize = function () {
            // As teleportation is going to be rather short interaction with a short-living UI, we just do not handle screen resize at all for now, but deactivate tool instead.
            _this2.options.triggerDeactivate && _this2.options.triggerDeactivate();
          };

          this.handleSingleTap = function (event, button) {
            if (_this2.isFirstClick) {
              _this2.handleSingleClick(event);
            } else {
              _this2.handleMouseMove(event);
            }
          };

          this.handleGesture = function (event) {
            switch (event.type) {
              case 'dragstart':
                break;
              case 'dragmove':
                return _this2.handleMouseMove(event, 0);
              case 'dragend':
                return true;
              case 'panmove':
              case 'panstart':
              case 'panend':
              case 'pinchmove':
              case 'pinchstart':
              case 'pinchend':
                return true;
              default:
                break;
            }


            return false;
          };
        }
      }, {
        key: "_recoverCursor", value: function _recoverCursor() {
          this.cursor = null;
          this.getCursor();
        }
      }, {
        key: "getCursor", value: function getCursor() {
          if (this.cursor)
            return this.cursor;
          return this.cameraSelectionState.inViewport ? 'cell' : 'default';
        }
      }, {
        key: "_addVpOverlay", value: function _addVpOverlay(

          vp) {
          this.viewPortOverlay.removeOverlay();
          var vpRect = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_1__["default"].getViewportBounds(vp, this.viewer.model.getUnitScale());
          var min = vpRect.min;
          var max = vpRect.max;
          this.viewPortOverlay.addOverlay(min.x, min.y, max.x, max.y);
        }

        // mode is only required for analytics purposes
      }, {
        key: "_runTeleportation", value: function _runTeleportation(mode) {
          this._mapToCameraPositionIn3D(mode);
          this._cancelTeleportation();
        }
      }, {
        key: "_scheduleTeleportation", value: function _scheduleTeleportation() {
          var _this3 = this;
          this.teleportationInProgress = setTimeout(function () {
            _this3._runTeleportation(DROPME_MODE.auto);
          }, 3000); // this timeout is alligned with coresponding rule of camera-selector-position css class
        }
      }, {
        key: "_cancelTeleportation", value: function _cancelTeleportation() {
          if (this.teleportationInProgress) {
            clearTimeout(this.teleportationInProgress);
            this.teleportationInProgress = 0;
          }
        }
      }, {
        key: "_createCameraSelectorUi", value: function _createCameraSelectorUi(

          pos) {
          //console.log(`camera position at ${pos.x}, ${pos.y}`);
          var _document = this.getDocument();
          this.cameraSelectorBackground = _document.createElement('div');
          this.cameraSelectorBackground.className = 'camera-selector-background';
          this.viewer.container.appendChild(this.cameraSelectorBackground);
          this.cameraSelectorBackground.style.top = "".concat(pos.y, "px");
          this.cameraSelectorBackground.style.left = "".concat(pos.x, "px");

          this.cameraSelectorPosition = _document.createElement('div');
          this.cameraSelectorPosition.className = 'camera-selector-position';
          this.viewer.container.appendChild(this.cameraSelectorPosition);
          this.cameraSelectorPosition.style.top = "".concat(pos.y - 10, "px");
          this.cameraSelectorPosition.style.left = "".concat(pos.x - 10, "px");

          this.cameraSelector = _document.createElement('div');
          this.cameraSelector.className = 'camera-selector';
          this.viewer.container.appendChild(this.cameraSelector);
          this.cameraSelector.style.top = "".concat(pos.y - 100, "px");
          this.cameraSelector.style.left = "".concat(pos.x - 50, "px");
        }
      }, {
        key: "_destroyCameraSelectorUi", value: function _destroyCameraSelectorUi() {
          if (this.viewer.container.contains(this.cameraSelector)) {
            this.viewer.container.removeChild(this.cameraSelector);
          }

          if (this.viewer.container.contains(this.cameraSelectorBackground)) {
            this.viewer.container.removeChild(this.cameraSelectorBackground);
          }

          if (this.viewer.container.contains(this.cameraSelectorPosition)) {
            this.viewer.container.removeChild(this.cameraSelectorPosition);
          }

          this.cameraSelectionState = {
            pending: false,
            pos: null,
            target: null,
            inViewport: false,
            initialVp: null
          };


          this.isFirstClick = true;

          this.viewPortOverlay.removeOverlay();
        }

        // Given F2D world coords (Vec3), this function returns the viewport that was hit.
      }, {
        key: "_findViewport", value: function _findViewport(f2dWorldPos) {
          var p2d = new THREE.Vector2(f2dWorldPos.x, f2dWorldPos.y);
          var sheet = this.viewer.model;
          return _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_1__["default"].findViewportAtPoint(sheet, p2d, this.options.isSupportedViewport);
        }
      }, {
        key: "_mapToCameraPositionIn3DForFloorplan", value: function _mapToCameraPositionIn3DForFloorplan(

          pos, mode) {
          var posGeorefed = this._applyGeoRefTransform(pos);

          var dir = new THREE.Vector3(0.0, 1.0, 0.0);

          // in the case of not specified target, use north direction
          if (this.cameraSelectionState.target) {
            var x = this.cameraSelectionState.target.x;
            var y = this.cameraSelectionState.target.y;

            var resTarget = this._get3DCameraPositionAndVp(x, y, true);
            if (resTarget && resTarget.pos) {
              var targetGeorefed = this._applyGeoRefTransform(resTarget.pos);

              var dirX = targetGeorefed.x - posGeorefed.x;
              var dirY = targetGeorefed.y - posGeorefed.y;

              if (dirX !== 0 || dirY !== 0) {
                dir.setX(dirX).setY(dirY);
                dir.normalize();
              }
            }
          }

          // mimic natural looking direction which is not really parallel to the ground
          var rotAxis = new THREE.Vector3(-dir.y, dir.x, 0.0);
          dir.applyAxisAngle(rotAxis, Math.PI / 18.0); // 10 degrees

          this.onDrop(posGeorefed, dir, mode);
        }
      }, {
        key: "_mapToCameraPositionIn3DForSection", value: function _mapToCameraPositionIn3DForSection(

          pos, mode) {
          var posGeorefed = this._applyGeoRefTransform(pos);

          // by default we are looking into the north direction, in this case "into the screen"
          var dir = new THREE.Vector3(0.0, 1.0, 0.0);

          // mimic natural looking direction which is not really parallel to the ground
          var rotAxis = new THREE.Vector3(-dir.y, dir.x, 0.0);
          dir.applyAxisAngle(rotAxis, Math.PI / 18.0); // 10 degrees

          this.onDrop(posGeorefed, dir, mode);
        }

        // if we will come up with a good visualization widget for dir selection for "Section" views
        // the two methods "_mapToCameraPositionIn3DForFloorplan()" and "_mapToCameraPositionIn3DForSection()"
        // could be unified. we will still have two cases in "if (resTarget && resTarget.pos) {...}" code path
        //   1. FloorPlan: x,y - change, z - constant
        //   2. Section:   x - changes, y,z - constant
      }, {
        key: "_mapToCameraPositionIn3D", value: function _mapToCameraPositionIn3D() {
          var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DROPME_MODE.manual;
          var x = this.cameraSelectionState.pos.x;
          var y = this.cameraSelectionState.pos.y;
          var resPos = this._get3DCameraPositionAndVp(x, y);

          if (resPos && resPos.pos && resPos.vp) {
            if (resPos.vp.viewType === 'FloorPlan' || resPos.vp.viewType === 'EngineeringPlan' || resPos.vp.viewType === 'CeilingPlan') {
              this._mapToCameraPositionIn3DForFloorplan(resPos.pos, mode);
            } else
              if (resPos.vp.viewType === 'Section') {
                this._mapToCameraPositionIn3DForSection(resPos.pos, DROPME_MODE.auto);
              }
          }
        }
      }, {
        key: "_get3DCameraPositionAndVp", value: function _get3DCameraPositionAndVp(

          x, y) {
            var useInitialVp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          var vpVec = this.viewer.impl.clientToViewport(x, y);
          var point = this.viewer.impl.intersectGroundViewport(vpVec);

          // if no viewport can be found for the current mouse position on a second click, try to use initial viewport
          var hitViewport = this._findViewport(point) || useInitialVp && this.cameraSelectionState.initialVp;
          if (!hitViewport) {
            // Clicked outside of the viewport
            // DropMe tool remains active and allows user to pick another point
            return null;
          }

          // Get aecData and unitScale for current sheet
          var model = this.viewer.model;
          var aec = model.getDocumentNode().getAecModelData();
          var sheetUnitScale = this.viewer.model.getUnitScale();

          // Apply 2D->3D transform to get 3D world coords
          var vpTransform = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_1__["default"].get2DTo3DMatrix(hitViewport, sheetUnitScale);
          var pWorld = point.clone().applyMatrix4(vpTransform);

          // Derive z from level metadata
          if (hitViewport.viewType === 'FloorPlan') {
            var level = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_1__["default"].findLevelForViewport(aec, hitViewport);
            if (level) {
              var avatarHeight = 5.74147; // 1.75m
              pWorld.z = level.elevation + avatarHeight;
              //console.log(pWorld.z);
            }
          }

          return {
            pos: pWorld,
            vp: hitViewport
          };

        }
      }, {
        key: "_applyGeoRefTransform", value: function _applyGeoRefTransform(

          pos) {
          var vec = pos.clone();

          // Skip refPoint transform if wanted
          if (this.options.useLocalModelCoords) {
            return vec;
          }
          // This extension requires AEC model data, so there should always be a refPoint tranform
          var root = this.viewer.model.getDocumentNode().getRootNode();
          var matrix = root.extractRefPointTransform();
          vec.applyMatrix4(matrix);

          return vec;
        }
      }]); return DropMeTool;
    }(av.ToolInterface);


  GlobalManagerMixin.call(DropMeTool.prototype);

  /***/
}),
