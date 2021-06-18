
/***/ "./extensions/AEC/Minimap3D/Minimap3D.js":
/*!***********************************************!*\
  !*** ./extensions/AEC/Minimap3D/Minimap3D.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return Minimap3DExtension; });
/* harmony import */ var _MinimapTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimapTool.js */ "./extensions/AEC/Minimap3D/MinimapTool.js");
/* harmony import */ var _SheetMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SheetMap.js */ "./extensions/AEC/Minimap3D/SheetMap.js");
/* harmony import */ var _MinimapToolbar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MinimapToolbar.js */ "./extensions/AEC/Minimap3D/MinimapToolbar.js");
/* harmony import */ var _FuzzyBox_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./FuzzyBox.js */ "./extensions/AEC/Minimap3D/FuzzyBox.js");
/* harmony import */ var _SheetMapTransition_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./SheetMapTransition.js */ "./extensions/AEC/Minimap3D/SheetMapTransition.js");
/* harmony import */ var _MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MinimapMath.js */ "./extensions/AEC/Minimap3D/MinimapMath.js");
/* harmony import */ var _Minimap3D_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Minimap3D.css */ "./extensions/AEC/Minimap3D/Minimap3D.css");
/* harmony import */ var _Minimap3D_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_Minimap3D_css__WEBPACK_IMPORTED_MODULE_6__);
  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); } function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); } function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); } function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; } function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); } function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }








  // eslint-disable-next-line no-unused-vars
  // IMPORTANT!!

  var av = Bimfish.Viewing;
  var avp = Bimfish.Viewing.Private;
  var namespace = BimfishNamespace('Bimfish.AEC');
  var myExtensionName = 'Bimfish.AEC.Minimap3DExtension';

  var LEVEL_EXT = 'Bimfish.AEC.LevelsExtension';
  var BIMWALK_EXT = 'Bimfish.BimWalk';

  var VISIBILITY_PROP = 'miniMap3D';

  // index must be a valid FloorIndex
  var getZRange = function getZRange(viewer, index) {

    // Check if we can get floor data
    var LevelExt = viewer.getExtension(LEVEL_EXT);
    var floor = LevelExt && LevelExt.floorSelector && LevelExt.floorSelector.floorData[index];

    // Cut everything above zMid of current floor
    var zMax = floor.zMin + 0.5 * (floor.zMax - floor.zMin);

    // Cut everything below zMid of the floor below
    // (Cutting below zMin keeps stairs to lower floors visible)
    var floorBelow = LevelExt.floorSelector.floorData[index - 1];
    var zMin = floorBelow ? 0.5 * (floorBelow.zMin + floorBelow.zMax) : floor.zMin;

    return { zMin: zMin, zMax: zMax };
  };

  // int value to string, e.g. 50 => "50px" - to used for style assignments.
  var toPixels = function toPixels(val) {
    return val.toString() + 'px';
  };

  var toPercent = function toPercent(val) {
    return val.toString() + '%';
  }; var

    Minimap3DExtension = /*#__PURE__*/function (_av$Extension) {
      _inherits(Minimap3DExtension, _av$Extension);
      function Minimap3DExtension(viewer) {
        
        var _this; var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}; _classCallCheck(this, Minimap3DExtension);
        _this = _possibleConstructorReturn(this, _getPrototypeOf(Minimap3DExtension).call(this, viewer, options));
        _this.viewer = viewer;
        _this.camera = _this.viewer.navigation.getCamera();

        _this.trackUsage = options.trackUsage;
        _this.sideBySideOptions = options.sideBySideOptions || {};

        _this.cameraMovedCB = _this.onCameraMoved.bind(_assertThisInitialized(_this));
        _this.toolChangedCB = _this.onToolChanged.bind(_assertThisInitialized(_this));
        _this.geomLoadedCB = _this.onGeomLoaded.bind(_assertThisInitialized(_this));
        _this.onVisibilityChangedCB = _this.onVisibilityChanged.bind(_assertThisInitialized(_this));
        _this.viewerResizedCB = _this.onResize.bind(_assertThisInitialized(_this));
        _this.loadProgressCB = _this.onLoadProgress.bind(_assertThisInitialized(_this));
        _this.extensionLoadCB = _this.onExtensionLoaded.bind(_assertThisInitialized(_this));

        _this.levelChangedCB = _this.update.bind(_assertThisInitialized(_this)); // Level selection may change the current level
        _this.levelChangeListenerRegistered = false;

        _this.onTimerCB = _this.onTimer.bind(_assertThisInitialized(_this));

        // Used to sync mapModel with visible model. Not used if client sets the map model (options.useCustomModel)
        _this.visibleModelsChanged = _this.setDefaultMapModel.bind(_assertThisInitialized(_this));

        _this.draggingPlayerPosition = false;

        // The actual map resolution is chosen based on model bbox size in meters.
        _this.minMapImageSize = options.minMapImageSize || 300;
        _this.maxMapImageSize = options.maxMapImageSize || 2048;

        // Used to determine required map resolution
        _this.pixelsPerMeter = 10;

        // Map widget size
        _this.mapWidgetWidth = 300;
        _this.mapWidgetHeight = 300;

        // Map image size (may exceed mapWidget)
        _this.mapImageWidth = 300;
        _this.mapImageHeight = 300;

        // Map image size after applyign zoomScale
        _this.scaledImageWidth = 0;
        _this.scaledImageHeight = 0;

        // Params for choosing mapWidget size based on canvas size
        _this.relMapWidgetSizeLongEdge = 0.20; // Restrict to max 20% of the canvas along the longer axis with
        _this.relMapWidgetSizeShortEdge = 0.25; // Restrict to max 30% of the canvas along the shorter axis (more tolerance here, to keep map useful for widescreen)
        _this.minMapWidgetSize = 100; // if the map gets too small, we hide it.

        // Scale-factor in [minScale,1] for zoom-out. Auto-updated based on zoomLevel
        //  - Default: 1.0 (= full map resolution).
        //  - minScale is the smallest scale necessary to fit the whole map into the mapWidget
        _this.zoomScale = 1.0;

        // zoomLevel:
        //  0 = full resolution
        //  1 = Half resolution
        //  ...
        _this.targetZoomLevel = 0; // the one that we set directly
        _this.zoomLevel = 0; // animated to trace targetZoomLevel

        // params for smoothing zoom
        _this.zoomSpeed = 6.0; // zoom-levels per second
        _this.zoomAcc = 16.0; // zoom-levels per second^2
        _this.lastZoomSpeed = 0;

        // The visible section of the full map image is defined by
        //   min=(scrollPos.x, scrollXPos.y)
        //   max=(scrollPos.x + mapWidgetWidth, scrollPos.y + mapWidgetHeight)
        //
        // scroll positions are defined within the scaled mapImage, i.e. after scaling by zoomScale.
        _this.scrollPos = new THREE.Vector2();

        // The scrolling follows the player position and tries to bring it to the center. But it is filtered
        // by maxSpeed - otherwise it would suddenly jump after moving the playerposition.
        _this.targetScrollPos = new THREE.Vector2();

        _this.maxScrollSpeed = 500; // Maximum allowed scrollspeed in pixels per second
        _this.maxScrollAcc = 900; // Maximum allowed acceleration/deceleration in pixels/s^2

        // Track last applied scroll-speed (in ms) to restrict the acceleration.
        _this.lastScrollSpeed = 0;

        // Matrix to convert 3D model positions to relative coords on minimap (in [-1, 1]).
        // Will be set on minimap creation.
        _this.mapMatrix = new THREE.Matrix4();
        _this.mapMatrixInverse = new THREE.Matrix4();

        // guid of the level for which the current map is valid
        _this.currentLevelIndex = undefined;

        // flag to indicate if an (async) map update is in progress
        _this.updatingMap = false;

        // Indicates if widget is setup with a valid map
        _this.mapValid = false;

        // Map from levelIndex to LevelMap. A LevelMap contains...
        // { 
        //     imageUrl,
        //     width,
        //     height, 
        //     mapMatrix // Matrix4 from model to normalized map coords in [-1,1]^2
        // }
        _this.mapCache = {};

        _this.tool = new _MinimapTool_js__WEBPACK_IMPORTED_MODULE_0__["default"](_assertThisInitialized(_this), _this.trackUsage);

        // player-position in map-pixels. independent of scrolling
        _this.playerPos = new THREE.Vector2();
        _this.playerAngle = 0.0; // Clockwise rotation angle of view frustum div in radians (0 = up)
        _this.mapCenter = _this.playerPos; // Center target of the minimap. By default it's the player position. Can be changed when dragging the map.
        _this.lastCameraPos = _this.camera.position.clone();

        // The models from which we compute the map. By default, we use all visible ones
        _this.mapModels = null;

        // Used to suppress auto-scroll while we are dragging the player avatar on the map
        _this.autoScrollLocked = false;

        // Cache the fuzzy-box per model id
        _this.modelIdToFuzzyBox = [];

        // Only used for map updates
        _this.mapModelBox = new THREE.Box3();

        // Indicates that mapModels have been specified, but we are waiting for them to finish loading.
        _this.isLoading = false;

        // Display sheets using an own viewer instance
        _this.sheetMap = new _SheetMap_js__WEBPACK_IMPORTED_MODULE_1__["default"](_assertThisInitialized(_this));

        // Controls transitions to rotate/zoom when changing from main map to sheet overlay
        _this.sheetMapTransition = new _SheetMapTransition_js__WEBPACK_IMPORTED_MODULE_4__["default"](_assertThisInitialized(_this));

        _this.visible = false;

        // Toggles between auto-generated map image (false) and using a sheet as map
        _this.useSheet = false;

        // Toggle between..
        //  - Small map on top-right of the screen (false)
        //  - Large map that fills left half of the screen (true)
        _this.sideBySideEnabled = _this.sideBySideOptions.sideBySideDefault || false;

        // Indicates if layout is currently configured for side-by-side view
        // (always false when map is hidden, because viewer needs to be resized to full width then)
        _this.sideBySide = false;

        // Percent of viewer width that we reserve for minimap in side-by-side mode. 
        // E.g. 40 => Minimap gets 40%, Main canvas gets 60%
        _this.sideBySideSplit = _this.sideBySideOptions.sideBySideSplit || 40;

        // Used to track when all fading anims are finished
        _this.fadingWidgets = 0;

        // Clockwise map rotation angle in radians
        _this.mapRotationAngle = 0;

        // Indicates whether we are currently displaying the SheetMap as an overlay
        _this.sheetMapActive = false;

        _this.initWidgets();

        // For testing: Callbacks that will be notified once as soon as Minimap has reached stable state
        _this.waitingCallbacks = [];

        // If true, a UI animation is running that morphs from/to side-by-side mode
        _this.slidingInProgress = false; return _this;
      } _createClass(Minimap3DExtension, [{
        key: "setMinimapVisible", value: function setMinimapVisible(visible) {
            var _this2 = this;

          this.visible = visible;

          // If the minimap widget is just showing a progress bar, we don't show the player avatar
          var isProgress = this.mapWidget.mapImage === this.placeholderDiv;

          // Trigger css anim. Note that doing this synchronously would skip the animation.
          var _window = this.getWindow();
          _window.requestAnimationFrame(function () {
            if (visible) {
              _this2.mapWidgetRoot.classList.add('visible');
              _this2.viewer.getExtension("Bimfish.ViewCubeUi", function (ext) {
                ext.displayViewCube(false, false);
              });
            } else {
              _this2.mapWidgetRoot.classList.remove('visible');
            }

            // Show player widget only if an actual map is displayed
            if (visible && !isProgress) {
              _this2.playerPositionWidget.classList.add('visible');
            } else {
              _this2.playerPositionWidget.classList.remove('visible');
            }
          });

          // Make sure that we reserve space for the minimap as soon as we start fade-in
          this.updateBimWalkInfoButtonPos();

          // Apply side-by-side layout immediately when starting to fade in. On fade-out, we
          // delay this until the fade-out transition is done (see transitionend-handler in initWidgets)
          if (visible) {
            this.updateSideBySide();
          }
        }

        // Check if minimap is enabled in viewer config. Note that this does not necessarily mean that it is visible,
        // e.g., BIMWalk may not be active.
      }, {
        key: "isEnabled", value: function isEnabled() {
          return this.viewer.prefs && this.viewer.prefs.get(VISIBILITY_PROP);
        }
      }, {
        key: "onVisibilityChanged", value: function onVisibilityChanged(

          visible) {
          if (this.viewer.prefs) {
            this.viewer.prefs.set(VISIBILITY_PROP, visible);
          }
          this.update();
        }

        // Placeholder widget is displayed when a map computation is in progress. It contains a text "Computing map for.." and a progress bar.
      }, {
        key: "initPlaceholderWidget", value: function initPlaceholderWidget() {

          var _document = this.getDocument();
          // Placeholder widget used if map computation is in progress
          this.placeholderDiv = _document.createElement('div');
          this.placeholderDiv.className = 'minimap-placeholder';
          this.placeholderDiv.style.width = toPixels(this.mapWidgetWidth);
          this.placeholderDiv.style.height = toPixels(this.mapWidgetHeight);

          // Vertically centered placeholder child containing text and progress bar
          var progressParent = _document.createElement('div');
          progressParent.className = 'minimap-progressWidget';
          this.placeholderDiv.appendChild(progressParent);

          // add progress text
          this.progressText = _document.createElement('div');
          this.progressText.className = 'minimap-progressText';
          progressParent.appendChild(this.progressText);

          // add progress bar
          this.progressDiv = _document.createElement('progress');
          this.progressDiv.className = 'minimap-progress';
          this.progressDiv.setAttribute('max', 100);
          progressParent.appendChild(this.progressDiv);
        }
      }, {
        key: "initWidgets", value: function initWidgets() {
          var _this3 = this;

          var _document = this.getDocument();

          // Root div for the minimap. This is only used for the toolbar: Since it is left outside the Minimap bounds, it cannot be inside the mapWidget directly,
          // because the mapWidget uses overflow:hidden to implement scrolling.
          this.mapWidgetRoot = _document.createElement('div');
          this.mapWidgetRoot.style.width = toPixels(this.mapWidgetWidth);
          this.mapWidgetRoot.style.height = toPixels(this.mapWidgetHeight);
          this.mapWidgetRoot.className = 'minimap3D';

          // Div showing the minimap
          this.mapWidget = _document.createElement('div');
          this.mapWidget.className = 'minimapScrollArea';
          this.mapWidgetRoot.appendChild(this.mapWidget);

          // Child-Div of MapWidget to represent current camera position and view direction on minimap (child of Minimap div)
          this.playerPositionWidget = _document.createElement('div');
          this.playerPositionWidget.className = 'player-widget';

          // It would be a bit simpler to add the player position widget to the mapImage - instead of the root mapWidget.
          // In this way, it would already inherit scrolling and map rotation.
          // 
          // But: We cannot do this due to the stacking order: We want to display the LMV instance (for sheet overlays)
          // between mapImage and playerWidget. 
          this.mapWidget.appendChild(this.playerPositionWidget);

          // Sub-widget to represent view direction in minimap
          this.playerFrustumWidget = _document.createElement('div');
          this.playerFrustumWidget.className = 'player-frustum';
          this.playerPositionWidget.appendChild(this.playerFrustumWidget);

          // By default, setting left/top to posX/posY would move the top-left corner of the frustum
          // widget to that position. We want to have the tip of the camera there.
          // Note that the offset may change depending on the border sizes in player-frustum css class.
          this.playerPositionWidget.anchorX = 20; // =.player-frustum.border-left
          this.playerPositionWidget.anchorY = 40; // =.player-frustum.border-top

          // Filled circle at camera position
          var filledCircle = _document.createElement('div');
          filledCircle.className = 'player-position-fill';
          this.playerPositionWidget.appendChild(filledCircle);
          this.playerPositionWidget.posCircle = filledCircle;

          // Hit area of the player position.
          var playerPositionHitArea = _document.createElement('div');
          playerPositionHitArea.className = 'player-position-hitarea';
          this.playerPositionWidget.posCircle.appendChild(playerPositionHitArea);
          this.playerPositionWidget.playerPositionHitArea = playerPositionHitArea;

          if (Bimfish.Viewing.isTouchDevice()) {
            playerPositionHitArea.classList.add('touch');
            this.playerFrustumWidget.classList.add('touch');
            this.playerPositionWidget.posCircle.classList.add('touch');
            this.playerPositionWidget.anchorX = 40; // =.player-frustum.border-left
            this.playerPositionWidget.anchorY = 80; // =.player-frustum.border-top
          }

          this.toolbar = new _MinimapToolbar_js__WEBPACK_IMPORTED_MODULE_2__["default"](this);

          this.initPlaceholderWidget();

          // hidden until level map is set
          this.setMinimapVisible(false);

          // Whenver the mapWidget finished fading in or out, we might need to re-adjust
          // the position of the annoying Info button of BimWalk to avoid overlapping.
          // TAG: 这个事件啥时候触发的
          this.mapWidget.addEventListener('transitionend', function () {
            _this3.updateBimWalkInfoButtonPos();
            _this3.updateSideBySide();
          });

          this.initialized = true;
        }
      }, {
        key: "load", value: function load() {
          this.loaded = true;
          
          // 专门给mini3d用的profile/  用好这个profile 事半功倍
          this.viewer.prefs.add(VISIBILITY_PROP, true);

          // choose widget size based on current canvas size
          this.updateMapSize();

          this.viewer.container.appendChild(this.mapWidgetRoot);

          var cache = this.getCache();

          // Note: Creating a viewer instance requires a parent widget with actual extents >0. Therefore, we must append mapWidget to
          //       viewer container first before we can init the sheet viewer.
          cache.viewer = this.sheetMap.initMapViewer(this.mapWidget, cache.viewer);
          this.tool.activate();

          // 线索
          this.viewer.addEventListener(av.CAMERA_CHANGE_EVENT, this.cameraMovedCB);
          this.viewer.addEventListener(av.TOOL_CHANGE_EVENT, this.toolChangedCB);
          this.viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, this.geomLoadedCB);
          this.viewer.addEventListener(av.VIEWER_RESIZE_EVENT, this.viewerResizedCB);
          this.viewer.addEventListener(av.PROGRESS_UPDATE_EVENT, this.loadProgressCB);
          this.viewer.addEventListener(av.EXTENSION_LOADED_EVENT, this.extensionLoadCB);
          
          // 设置楼层
          this.updateFloorSelectHandler();

          // Always compute the map from "current model" - unless the client app specifies the mapModel explicitly.
          // 计算模型/采集图片
          if (!this.options.useCustomModel) {

            // If a 3D model added before loading the extension, use it right now.
            this.setDefaultMapModel();

            this.viewer.addEventListener(av.MODEL_ADDED_EVENT, this.visibleModelsChanged);
            this.viewer.addEventListener(av.MODEL_REMOVED_EVENT, this.visibleModelsChanged);
          }

          if (!this.updateSettingsPanel) {
            //We need to connect this to an event that happens after the settings panel has been
            //create by the load sequence. The toolbar created event is serving that purpose.
            this.updateSettingsPanel = this.configureSettings.bind(this);
            this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.updateSettingsPanel);
          }

          // Update scrolling on timer
          this.requestTimer();

          return true;
        }
      }, {
        key: "unload", value: function unload() {
          this.loaded = false;

          // Avoid crash in case the client app hijacked the mapWidget to add it somewhere else
          if (this.viewer.container.contains(this.mapWidgetRoot)) {
            this.viewer.container.removeChild(this.mapWidgetRoot);
          }

          this.tool.deactivate();

          this.viewer.removeEventListener(av.CAMERA_CHANGE_EVENT, this.cameraMovedCB);
          this.viewer.removeEventListener(av.TOOL_CHANGE_EVENT, this.toolChangedCB);
          this.viewer.removeEventListener(av.GEOMETRY_LOADED_EVENT, this.geomLoadedCB);
          this.viewer.removeEventListener(av.VIEWER_RESIZE_EVENT, this.viewerResizedCB);
          this.viewer.removeEventListener(av.PROGRESS_UPDATE_EVENT, this.loadProgressCB);
          this.viewer.removeEventListener(av.EXTENSION_LOADED_EVENT, this.extensionLoadCB);

          this.updateFloorSelectHandler();

          if (!this.options.useCustomModel) {
            this.viewer.removeEventListener(av.MODEL_ADDED_EVENT, this.visibleModelsChanged);
            this.viewer.removeEventListener(av.MODEL_REMOVED_EVENT, this.visibleModelsChanged);
          }

          if (this.updateSettingsPanel) {
            this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.updateSettingsPanel);
            this.updateSettingsPanel = null;
          }

          // Stop scrolling timer interrupts
          this.cancelTimer();

          // Make sure that we don't leak models
          return true;
        }
      }, {
        key: "onExtensionLoaded", value: function onExtensionLoaded(

          e) {
          if (e.extensionId === LEVEL_EXT) {
            this.updateFloorSelectHandler();
          }
        }

        // Make sure that we detect Floor-select events as long as Minimap and LevelsExt are both loaded.
      }, {
        key: "updateFloorSelectHandler", value: function updateFloorSelectHandler() {

          var levelExt = this.viewer.getExtension(LEVEL_EXT);
          if (!levelExt) {
            // We will try again later on extension load
            return;
          }
          var registered = this.levelChangeListenerRegistered;
          if (!registered && this.loaded) {
            levelExt.floorSelector.addEventListener(Bimfish.AEC.FloorSelector.CURRENT_FLOOR_CHANGED, this.levelChangedCB);
            this.levelChangeListenerRegistered = true;
          } else if (registered && !this.loaded) {
            levelExt.floorSelector.removeEventListener(Bimfish.AEC.FloorSelector.CURRENT_FLOOR_CHANGED, this.levelChangedCB);
            this.levelChangeListenerRegistered = false;
          }
        }

        // Move/Rotate player-position widget according to player position and angle.
      }, {
        key: "updatePlayerWidget", value: function updatePlayerWidget() {

          // get position in pixels within the map widget
          var pos = this.playerPos.clone();
          this.mapPixelsToWidget(pos);

          var style = this.playerPositionWidget.style;
          style.left = toPixels(pos.x - this.playerPositionWidget.anchorX);
          style.top = toPixels(pos.y - this.playerPositionWidget.anchorY);

          // rotate frustum shape (+ consider map rotation)
          this.playerFrustumWidget.style.transform = "rotate(".concat(this.playerAngle + this.mapRotationAngle, "rad)");
        }

        // Adjust target scroll-position based on current player position
      }, {
        key: "computeTargetScrollPosition", value: function computeTargetScrollPosition() {

          // compute player position within scaled map
          var px = this.mapCenter.x * this.zoomScale;
          var py = this.mapCenter.y * this.zoomScale;

          // Try to scroll player into map center
          this.targetScrollPos.x = px - 0.5 * this.mapWidgetWidth;
          this.targetScrollPos.y = py - 0.5 * this.mapWidgetHeight;
        }

        // recompute this.playerPos and this.playerAngle according to current 3D camera
      }, {
        key: "computePlayerPosition", value: function computePlayerPosition() {

          // If this call happens during async map update, don't set player position.
          // Otherwise, it would just reflect the camera pos during map update.
          if (this.updatingMap) {
            return;
          }

          // convert camera pos to miniMap pix coords
          var pos3D = this.viewer.impl.camera.position;
          var pos2D = this.worldToMapPixels(pos3D);

          // convert camera target to miniMap
          var target3D = this.viewer.impl.camera.target;
          var target2D = this.worldToMapPixels(target3D);

          this.playerPos.copy(pos2D);
          this.playerAngle = this.computeAngle(pos2D, target2D);
        }

        // Apply scrolling using css
      }, {
        key: "applyScrolling", value: function applyScrolling() {
          // Note that mapImage may also exist, but just be the placeholder - which should not be scrolled.
          if (this.mapValid) {
            // set image size based on map resolution and zoomScale
            var style = this.mapWidget.mapImage.style;
            style.width = toPixels(this.scaledImageWidth);
            style.height = toPixels(this.scaledImageHeight);

            // set scroll position
            this.mapWidget.mapImage.style.left = toPixels(-this.scrollPos.x);
            this.mapWidget.mapImage.style.top = toPixels(-this.scrollPos.y);
          }

          // If we use a sheetmap, update camera accordingly
          if (this.sheetMap.ready) {
            this.sheetMap.syncCameraToMainMap();
          }
          this.updateRotation();
        }

        // Immediately set scrolling to target position (based on player pos)
      }, {
        key: "resetScrolling", value: function resetScrolling() {
          this.zoomLevel = this.targetZoomLevel; // skip any ongoing zoom-motion
          this.computeTargetScrollPosition();
          this.scrollPos.copy(this.targetScrollPos);
          this.applyScrolling();
        }

        // Adjust scrolling and player position widget based on current 3D camera
        //  @param {number} elapsed - elapsed time in seconds
      }, {
        key: "updateScrolling", value: function updateScrolling(elapsed) {

          // Compute scroll position to follow the player
          if (this.autoScrollLocked) {
            return;
          }

          this.computeTargetScrollPosition();

          // get vector and distance towards targetPos
          var delta = this.targetScrollPos.clone().sub(this.scrollPos);
          var dist = delta.length();

          if (this.scrollPos.equals(this.targetScrollPos)) {
            // Nothing to do
            return;
          }

          // If distance is below a pixel, don't waste time with invisible epsilon-scrolls.
          // Instead, just jump to exact target position. This faciliates testing and avoids unnecessary style updates.
          if (dist < 0.5) {

            // Make values match exactly when we stop scrolling.
            this.scrollPos.copy(this.targetScrollPos);

          } else {

            // apply scroll-speed limit
            var newDist = Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["motionSmoothing"])(dist, elapsed, this.maxScrollSpeed, this.lastScrollSpeed, this.maxScrollAcc);
            delta.multiplyScalar(newDist / dist);

            // move player pos
            this.scrollPos.add(delta);

            // track applied scroll speed
            if (elapsed) {
              this.lastScrollSpeed = newDist / elapsed;
            }
          }

          // Update player avatar (based on player pos + scroll position)
          this.updatePlayerWidget();
          this.applyScrolling();
        }

        // Returns true if all mapModels are ready for map rendering
      }, {
        key: "mapModelsReady", value: function mapModelsReady() {
          if (!this.mapModels) {
            return false;
          }

          for (var i = 0; i < this.mapModels.length; i++) {
            var model = this.mapModels[i];
            if (!model.isLoadDone()) {
              // We need to wait until model finished loading
              return false;
            }
          }
          return true;
        }

        // Returns a floor object {index, name}
      }, {
        key: "getCurrentLevel", value: function getCurrentLevel() {
          var levelExt = this.viewer.getExtension(LEVEL_EXT);
          if (!levelExt) {
            return;
          }

          // If a level is selected, use that one and ignore camera z
          var fs = levelExt.floorSelector;
          var level = fs.floorData[fs.currentFloor];
          if (level) {
            return level;
          }

          // No floor selected => determine based on camera z
          return levelExt._mapCameraToLevel();
        }

        // Make sure that sheetMap viewer instance shows the right sheet for the current level (if possible)
      }, {
        key: "updateSheetMap", value: function updateSheetMap() {
          var _this4 = this;

          // Don't animate between different maps as long as we are dragging the player-pos around.
          if (this.autoScrollLocked) {
            return;
          }

          // Choose for which level we want to display the map
          var level = this.getCurrentLevel();
          if (!level) {
            return;
          }

          // We need a main map first. Otherwise, we don't have the list of available sheetmaps 
          var mainMap = this.mapCache[level.index];
          if (!mainMap) {
            return;
          }

          // As long as no main map is shown, we cannot show an embedded sheet either.
          if (!this.mapValid) {
            return;
          }

          // get current camera pos. We use it to evaluate which map is suitable to keep it visible on the map.
          var pos3D = this.viewer.impl.camera.position;

          // Check if there is an active sheetmap for this floor.
          var sheetMapUsable = this.sheetMap.isUsable(pos3D, level.guid);
          var useCurrentSheetMap = this.useSheet && sheetMapUsable;

          // If sheetmap is wanted and not active yet, activate it.
          if (!this.sheetMapActive && useCurrentSheetMap) {
            this.sheetMapTransition.enterSheet();
            this.sheetMapActive = true;
            return;
          }

          // Deactivate sheetMap if outdated: E.g., if sheets were switched off or camera left the area supported by the sheet
          if (this.sheetMapActive && !useCurrentSheetMap) {
            this.sheetMapTransition.exitSheet();
            this.sheetMapActive = false;

            // Don't return here: we may still have to initialize another sheetmap
          }

          // If sheetMap is active and up-to-date, we are done
          if (useCurrentSheetMap && this.sheetMapActive) {
            return;
          }

          // If sheetMap neither wanted nor shown, we are done
          if (!this.useSheet && !this.sheetMapActive) {
            return;
          }

          // If sheetmap is already loading, wait for it to finish.
          // The loading sheet might be an outdated one. We could optimize this by making the loading interruptable.
          if (this.sheetMap.loading) {
            return;
          }

          // Current sheetmap cannot be used. Check if we find one.
          var newConfig = mainMap.sheetMaps.find(function (cfg) { return cfg.isUsable(pos3D, level.guid); });
          if (!newConfig) {
            // There is no sheetMap that we can use.
            return;
          }

          // Make sure that we don't let the thumbnail in the middle of a transition
          this.sheetMapTransition.onSheetWillChange();

          // Initialize new sheetMap and activate it when ready
          var onLoaded = function onLoaded() {
            _this4.update();
          };

          this.sheetMap.initMap(newConfig, onLoaded);
        }

        // Makes sure that map shows an image of the current level.
      }, {
        key: "updateMapImage", value: function updateMapImage() {
          debugger
          // Avoid mapUpdate if another one is in progress, extension was unloaded, or model is not ready
          if (this.updatingMap || !this.loaded || !this.mapModelsReady()) {
            return;
          }

          // Choose for which level we want to display the map
          var level = this.getCurrentLevel();
          if (!level) {
            return;
          }

          // We can skip the update if the level didn't change (unless we are currently just showing a placeholder)
          var index = level.index;
          if (this.currentLevelIndex === index && this.mapValid) {
            // no map update needed
            return;
          }

          if (Number.isInteger(index)) {
            // set index only if defined
            this.currentLevelIndex = index;
          }

          // Create or activate map for that level
          var levelMap = this.mapCache[this.currentLevelIndex];
          if (levelMap) {
            // We visited that level before => reuse map image
            this.activateMap(levelMap, level.name);
          } else {
            this.createMinimap(this.currentLevelIndex, level.name, level.guid);
          }
        }
      }, {
        key: "bimWalkActive", value: function bimWalkActive() {
          // Minimap is only shown in first-person mode
          var bimWalk = this.viewer.getExtension(BIMWALK_EXT);
          return bimWalk && bimWalk.tool && bimWalk.tool.active;
        }
      }, {
        key: "updateMapCenter", value: function updateMapCenter() {
          if (this.updatingMap) {
            return;
          }

          // In case camera position has changed, update mapCenter in order to focus on the player again.
          // If the camera is outside the map range, always zoom out to full map
          if (this.widgetSizeChanged || this.lastCameraPos.distanceTo(this.camera.position) !== 0) {
            this.lastCameraPos = this.camera.position.clone();
            this.widgetSizeChanged = false;

            if (this.isOutside()) {
              this.setZoomLevel(this.getMinZoomLevel());
              this.mapCenter = this.playerPos.clone();
              this.mapCenter.x = 0.5 * this.mapWidgetWidth / this.zoomScale;
              this.mapCenter.y = 0.5 * this.mapWidgetHeight / this.zoomScale;
            } else {
              this.mapCenter = this.playerPos;
            }
          }
        }
      }, {
        key: "onCameraMoved", value: function onCameraMoved() {
          this.update();
        }
      }, {
        key: "update", value: function update() {
          
          var _this5 = this;
          if (this.slidingInProgress) {
            return;
          }

          var wasVisible = this.visible;

          if (!this.isEnabled() || !this.bimWalkActive()) {
            if (this.sideBySide) {
              var sideBySideSplitBackup = this.sideBySideSplit;
              this.slidingInProgress = true;

              this.setSideBySideSplit(0, function () {
                // Restore original sideBySideSplit value.
                _this5.sideBySideSplit = sideBySideSplitBackup;
                _this5.setMinimapVisible(false);

                // Wait until the camera is moved before setting slidingInProgress to false.
                // Otherwise, setSideBySideSplit will be called an unnecessary extra time.
                _this5.viewer.addEventListener(av.CAMERA_CHANGE_EVENT, function () {
                  _this5.slidingInProgress = false;
                }, { once: true });

              });
            } else {
              this.setMinimapVisible(false);
            }

            return;
          }

          if (this.isEnabled() && this.bimWalkActive() && !this.visible && this.sideBySideEnabled) {
            this.slidingInProgress = true;
            var _sideBySideSplitBackup = this.sideBySideSplit;
            this.sideBySideSplit = 0;

            this.setSideBySideSplit(_sideBySideSplitBackup, function () {
              _this5.slidingInProgress = false;
            });
          }

          // MapModels are required before we can show anything
          if (!this.mapModels) {
            this.setMinimapVisible(false);
            return;
          }

          // Generating the default map requires all models to be loaded first.
          // If geom is not loaded, wait until update() is triggered again by the geomLoad event
          if (!this.mapModelsReady()) {
            // We are waiting for models to load => show load progress.
            this.showLoadProgress();
            return;
          }

          this.updateMapImage();

          // Make sure that sheetMap is enabled/disabled and properly configured for current state
          // This must happen after updateMapImage(): Since sheetMaps are embedded into the main map,
          // clearing/changing the main map will remove the sheetMap again. So, we must make sure thtat the main map 
          // state is up-to-date first.
          this.updateSheetMap();

          this.updateMaxFloorTextWidth();

          // If we get here, we are not waiting for any model loading anymore.
          this.isLoading = false;

          this.updateMapCenter();
          this.setMinimapVisible(true);
          this.computePlayerPosition();
          this.updatePlayerWidget();
          this.applyScrolling();
          this.toolbar.update();

          // In theory, this happens in onTimer() later anyway. But it's cleaner and better testable to keep the rule
          // that after calling update(), the full state is updated. Without this, isAllDone() would sometimes miss that we are about to scroll,
          // just because the subsequent timer-event didn't happen yet.
          this.computeTargetScrollPosition();

          if (!wasVisible) {
            this.resetScrolling();
          }
        }
      }, {
        key: "onToolChanged", value: function onToolChanged(

          tool) {
            var _this6 = this;

          // we temporarily disable/enable BimWalk ourselves during map update
          if (this.updatingMap) {
            return;
          }

          if (!tool.toolName === 'bimwalk') {
            return;
          }

          // Note: Activating the map might trigger a map update. If this starts synchronously right now,
          //       some BIMWalk code after this event would affect the camera and switch it back to perspective.
          // TODO: Think about if there is a cleaner way to avoid tools from affecting the snapshots (without having to switch BIMWalk off)
          setTimeout(function () { return _this6.update(); }, 10);
        }
      }, {
        key: "onGeomLoaded", value: function onGeomLoaded(

          e) {
          // If the mapModel just finished loading and minimap is wanted, make sure that we create & show it
          this.update();
        }

        // Sets the progress widget as current map
      }, {
        key: "showProgressWidget", value: function showProgressWidget() {

          // Do nothing if already visible
          var isShown = this.mapWidget.mapImage === this.placeholderDiv;
          if (isShown) {
            return;
          }

          // Remember previous mapImage (if any)
          this.clearMapImage();

          // Show placeholder
          this.mapWidget.appendChild(this.placeholderDiv);

          // fade-in placeholder
          this.placeholderDiv.style.opacity = 0.0;
          this.fadeWidgetOpacity(this.placeholderDiv, 1.0);
          this.updateProgressWidget(0);

          // Make placeholder the new mapImage - so that it will be replaced and faded once
          // the map image is ready
          this.mapWidget.mapImage = this.placeholderDiv;

          this.setMinimapVisible(true);
        }
      }, {
        key: "setProgressText", value: function setProgressText(

          text) {
          this.progressText.innerHTML = text;
        }
      }, {
        key: "updateProgressWidget", value: function updateProgressWidget(

          percent) {
          this.progressDiv.setAttribute('value', percent);
        }

        // Called if mapModels have been specified, but are still loading
      }, {
        key: "showLoadProgress", value: function showLoadProgress() {
          this.showProgressWidget();

          if (this.useSheet && this.sheetMap.loading) {

            // We display a sheet as soon as the root is loaded. For this step, there is
            // no progress tracking, but it usually shouldn't take long
            this.progressDiv.removeAttribute("value");
            this.setProgressText(Bimfish.Viewing.i18n.translate('Loading sheet...'));
          } else {
            // Setup determinate progress bar and initialize with current model load progress
            this.onLoadProgress();
            this.setProgressText(Bimfish.Viewing.i18n.translate('Loading models...'));
          }

          this.setMinimapVisible(true);
          this.isLoading = true;
        }

        // Compute percent of loaded fragments for all models that we are waiting for to compute the map
      }, {
        key: "getLoadProgress", value: function getLoadProgress() {
          var loaded = 0;
          var total = 0;
          var numModels = this.mapModels ? this.mapModels.length : 0;
          for (var i = 0; i < numModels; i++) {
            var model = this.mapModels[i];

            // Note: Progress tracking other formats would require some extra work here.
            if (!model.isOTG()) {
              continue;
            }

            var data = model.getData();
            loaded += data.fragsLoaded;
            total += data.metadata.stats.num_fragments;
          }
          return total ? Math.floor(100 * loaded / total) : 0;
        }
      }, {
        key: "onLoadProgress", value: function onLoadProgress() {
          // Progress events are only relevant while waiting for model load. 
          // Note sheet maps can be displayed without waiting for the model geometry.
          var canUseSheets = this.useSheet && this.sheetMap.initialized();
          if (!this.isLoading || canUseSheets) {
            return;
          }

          var progress = this.getLoadProgress();
          this.updateProgressWidget(progress);
        }

        // Fade out floor-label and remove it after fading
      }, {
        key: "clearFloorLabel", value: function clearFloorLabel() {
          var _this7 = this;
          var oldLabel = this.mapWidget.floorLabel;
          if (!oldLabel) {
            return;
          }

          this.mapWidget.floorLabel = null;

          this.fadeWidgetOpacity(oldLabel, 0.0, function () {
            _this7.mapWidget.removeChild(oldLabel);
          });
        }

        // Fade-out current map image (+ label) and removes it after fading
      }, {
        key: "clearMapImage", value: function clearMapImage() {
          var _this8 = this;

          // Hide sheetmap as well if a main map changes
          this.sheetMap.setVisible(false);
          this.sheetMapActive = false; // Remember that sheetMap was switched off so that it gets reactivated when needed next time

          this.clearFloorLabel();

          var oldImage = this.mapWidget.mapImage;
          if (!oldImage) {
            return;
          }

          this.mapWidget.mapImage = null;

          // Make sure that mapImage is removed after fadeout (if still not in use)
          var onFadeDone = function onFadeDone() {
            // Note: oldImage may be reused meanwhile (happens for placeholderDiv).
            // Adding the same child a second time has no effect, but we must not remove it in that case.
            var isActive = _this8.mapWidget.mapImage === oldImage;
            if (!isActive && _this8.mapWidget.contains(oldImage)) {
              _this8.mapWidget.removeChild(oldImage);
            }
          };

          // invoke fade-out
          this.fadeWidgetOpacity(oldImage, 0.0, onFadeDone);

          // update state flags: there is nothing to display
          this.mapValid = false;
        }
      }, {
        key: "fadeWidgetOpacity", value: function fadeWidgetOpacity(

          widget, targetValue, onFadeDone) {
            var _this9 = this;

          var FadeDuration = 0.7;

          if (widget.fadeAnim) {
            widget.fadeAnim.skip();
            widget.fadeAnim = null;
          }

          var startVal = widget.style.opacity;

          var onTimer = function onTimer(t) {
            t = avp.smootherStep(t);
            widget.style.opacity = avp.lerp(startVal, targetValue, t);
          };

          var onFadeEnd = function onFadeEnd() {
            _this9.fadingWidgets--;
            widget.fadeAnim = null;
            onFadeDone && onFadeDone();
          };

          // Indicate that fade-animation is active until anim ends
          this.fadingWidgets++;

          widget.fadeAnim = avp.fadeValue(0, 1, FadeDuration, onTimer, onFadeEnd);
        }

        // Create and show label to display floorName.
      }, {
        key: "createFloorLabel", value: function createFloorLabel(levelName) {
          if (this.options.hideFloorsLabel) {
            return;
          }

          var _document = this.getDocument();

          // attach floor name label to mapWidget
          var floorLabel = _document.createElement('div');
          floorLabel.className = 'floorNameLabel';
          this.mapWidget.appendChild(floorLabel);
          this.mapWidget.floorLabel = floorLabel;

          // add text to label
          var floorText = _document.createElement('div');
          floorText.className = 'floorText';
          floorText.textContent = levelName;
          floorLabel.appendChild(floorText);
          this.mapWidget.floorText = floorText;

          this.updateMaxFloorTextWidth();

          if (this.options.theme) {
            floorLabel.classList.add(this.options.theme);
            floorText.classList.add(this.options.theme);
          }
        }

        // @param {LevelMap} levelMap - Contains {imageUrl, width, height, mapMatrix} 
        // @param {string}   levelName
      }, {
        key: "activateMap", value: function activateMap(levelMap, levelName) {
          var _this10 = this;
          
          // Remove outdated image
          this.clearMapImage();

          // Set mapImageWidth/Height to available image resolution
          this.mapImageWidth = levelMap.width;
          this.mapImageHeight = levelMap.height;
          this.scaledImageWidth = this.zoomScale * this.mapImageWidth;
          this.scaledImageHeight = this.zoomScale * this.mapImageHeight;

          // Update mapMatrix for scrolling and player position
          this.mapMatrix.copy(levelMap.mapMatrix);
          this.mapMatrixInverse.getInverse(this.mapMatrix);

          // Create new div with map
          var _document = this.getDocument();
          this.mapWidget.mapImage = _document.createElement('div');
          this.mapWidget.mapImage.className = 'mapContainer';
          this.mapWidget.mapImage.innerHTML = "<img class=\"mapImage\" src=\"".concat(levelMap.imageUrl, "\">");
          this.mapWidget.mapImage.style.width = toPixels(this.scaledImageWidth);
          this.mapWidget.mapImage.style.height = toPixels(this.scaledImageHeight);
          this.mapWidget.appendChild(this.mapWidget.mapImage);

          // Get imageElement defined in innerHTML above.
          // It would be a bit easier to avoid the parent element and create mapWidget as image directly,
          // but this always failed to load the blobl url (not sure why).
          this.mapWidget.mapImage.imageElement = this.mapWidget.mapImage.children[0];

          // Adjust image-size to container element size, so that we can apply zoomScale on mapImage div
          this.mapWidget.mapImage.imageElement.style.width = '100%';
          this.mapWidget.mapImage.imageElement.style.height = '100%';

          // Create label for this map and show it
          this.createFloorLabel(levelName);

          // Fade-in new map image
          this.mapWidget.mapImage.style.opacity = 0;
          this.fadeWidgetOpacity(this.mapWidget.mapImage, 1.0);

          if (this.mapWidget.floorLabel) {
            this.fadeWidgetOpacity(this.mapWidget.floorLabel, 1.0);
          }

          this.mapValid = true;

          this.computePlayerPosition();
          this.resetScrolling();
          this.updatePlayerWidget();
          this.setMinimapVisible(true);

          // Add sheetmap thumbnails to mapImage div
          levelMap.sheetMaps.forEach(function (map) { return _this10.mapWidget.mapImage.appendChild(map.thumbnail.div); });
        }
      }, {
        key: "cancelMapUpdate", value: function cancelMapUpdate() {
          if (this.screenShotInProgress) {
            this.screenShotInProgress.stop();
            this.updatingMap = false;
          }
        }
      }, {
        key: "getFuzzyBox", value: function getFuzzyBox() {

          this.mapModelBox.makeEmpty();
          if (!this.mapModels) {
            return;
          }

          // sum up fuzzy boxes of all map models
          for (var i = 0; i < this.mapModels.length; i++) {

            var model = this.mapModels[i];

            // get bbox from cache if possible
            var bbox = this.modelIdToFuzzyBox[model.id];
            if (!bbox) {
              // compute fuzzybox and add it to cache
              bbox = Object(_FuzzyBox_js__WEBPACK_IMPORTED_MODULE_3__["default"])(model);
              this.modelIdToFuzzyBox[model.id] = bbox;
            }

            this.mapModelBox.union(bbox);
          }
          return this.mapModelBox;
        }

        // Create a map based on a (valid) level index from FloorSelector
      }, {
        key: "createMinimap", value: function createMinimap(levelIndex, levelName, levelGuid) {
          var _this11 = this;

          // Replace current map by progress widget
          this.showProgressWidget();
          this.setProgressText('Creating map for:<br><b>' + levelName);

          // Compute bbox of the region to be captured in the minimap
          var bbox = this.getFuzzyBox();

          // If there is nothing useful to show, just hide the minimap widget
          if (bbox.empty()) {
            this.setMinimapVisible(false);
            return;
          }

          var diag = bbox.size();

          // If multiple models are shown together, they must have identical unit scale. Therefore, we can get the scale from any model.
          var unitToMeter = this.mapModels[0].getUnitScale();

          // Expand map scope by a few meters of margin
          var marginInMeters = 1;
          var offset = 2 * marginInMeters / unitToMeter;
          diag.x += offset;
          diag.y += offset;

          // compute required resolution
          var resX = diag.x * unitToMeter * this.pixelsPerMeter;
          var resY = diag.y * unitToMeter * this.pixelsPerMeter;

          // Orthoscale must be set to the full world-space height that we want to capture.
          var orthoScale = diag.y;

          // If both width and height are below minMapSize, scale down to fill the mapWidget
          if (resX < this.minMapImageSize && resY < this.minMapImageSize) {
            var smallerSide = Math.min(resX, resY);
            var factor = this.minMapImageSize / smallerSide;
            resX *= factor;
            resY *= factor;
          }

          // If any of the sides exceeds max mapImageSize, scale down to keep them within
          var maxXY = Math.max(resX, resY);
          if (maxXY > this.maxMapImageSize) {
            var _factor = this.maxMapImageSize / maxXY;
            resX *= _factor;
            resY *= _factor;
          }

          // After the steps above, we know for sure that width and height are both within maxImageSize and
          // at least one (width or height) is >= minImageSize.
          // If only one of the two is too small, we have to change the aspect ratio and extend the world-space
          // map scope.
          if (resX < this.minMapImageSize) {
            // Adding pixels will also change the camera's aspect ratio => mapped scope will extended in x automatically
            resX = this.minMapImageSize;
          } else if (this.mapImageHeight < this.minMapImageSize) {
            // To extend mapped scope in y, we have to "zoom out" a bit. Just increasing image-height would increase the mapping
            // scale, so that we wouldn't capture the full x-extend of the map scope anymore.
            var oldHeight = this.mapImageHeight;
            resY = this.minMapImageSize;

            // This increases the camera frustum y-extend in world-space. Effect is:
            //  - Increase frustum along y-direction
            //  - Keep x-extent of camera frustum unaffected by modified camera aspect
            orthoScale *= resY / oldHeight;
          }

          // create new top-view camera
          var cam = new av.UnifiedCamera(resX, resY);
          //var zRange = getZRange(this.viewer, levelIndex);
          //tag: 自己改了一份
          var zRange = { zMin: 0, zMax: 100 };
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["setTopView"])(cam, bbox, zRange.zMin, zRange.zMax, orthoScale);

          // Remember transform from model to map and back
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["compute3DTo2DMatrix"])(cam, this.mapMatrix);
          this.mapMatrixInverse.getInverse(this.mapMatrix);

          // Keep a copy of the mapMatrix to add to the cache when screenshot is done
          // Note that the actual map matrix might have changed until then.
          var mapMatrix = this.mapMatrix.clone();

          this.updatingMap = true;

          var onScreenshotDone = function onScreenshotDone(imageUrl) {

            _this11.updatingMap = false;
            _this11.screenShotInProgress = null;

            // Create sheetmap thumbnails to be embedded into the minimap
            var sheetMaps = _SheetMap_js__WEBPACK_IMPORTED_MODULE_1__["default"].createSheetMapConfigs(_this11.mapModels, levelGuid, _this11.mapMatrix, resX, resY);

            // add LevelMap to cache for later reuse
            _this11.mapCache[levelIndex] = {
              imageUrl: imageUrl,
              width: resX,
              height: resY,
              mapMatrix: mapMatrix, // Note that mapMatrix is always the right one - while this.mapMatrix might have changed meanwhile.
              sheetMaps: sheetMaps
            };


            // activate the new map (unless the user changed to another floor or to a sheet map meanwhile)
            _this11.update();

            // make sure that new sheetmap thumbnails are visible/hidden depending on whether sheetmaps are enabled
            _this11.updateThumbnailVisiblity();
          };

          // Use another polygon offset setting for the snapshot. Otherwise, edges are mostly missing in
          // ortho-vies exactly from above.
          //
          // TODO: It's some performance waste to do that back-and-forth change on all materials. It would be nice
          //       if we could find a more elegant solution here. E.g., setting polygonOffset on the lines instead - but
          //       this didn't seem to work.
          var mats = this.viewer.impl.getMaterials();
          var poEnabled;
          var poFactor;
          var poUnits;
          var applyCustomPolygonOffset = function applyCustomPolygonOffset() {
            // remember main polygonOffset settings
            poEnabled = mats.getPolygonOffsetOn();
            poFactor = mats.getPolygonOffsetFactor();
            poUnits = mats.getPolygonOffsetUnits();

            // apply custom polygon offset
            mats.togglePolygonOffset(true, 1.0, 5.0);
          };
          var revertCustomPolygonOffset = function revertCustomPolygonOffset() {
            // revert main-canvas polygonOffset
            mats.togglePolygonOffset(poEnabled, poFactor, poUnits);
          };

          // make empty map-space transparent
          var renderConfig = this.viewer.impl.renderer().getConfig();
          renderConfig.clearAlpha = 0.0;

          // Make sure that Minimap creation is not affected by current fragment modifications in main view (e.g. setting frags off or ghosted)
          var fragOptions = {
            isFragVisible: function isFragVisible() { return true; }, // force fragment ghosting off
            isFragOff: function isFragOff() { return false; } // avoid frags to be excluded
          };

          var options = {
            camera: cam, // 这里作为静默的根源
            onProgress: function onProgress(percent) { return _this11.updateProgressWidget(percent); },
            beforeRender: applyCustomPolygonOffset,
            afterRender: revertCustomPolygonOffset,
            renderConfig: renderConfig,
            models: this.mapModels,
            fragOptions: fragOptions,
            excludeCutPlanes: true, // Make map content independent of current cutplane states, e.g. FloorSelector or SectionTool
            excludeThemingColors: true
          };

          this.screenShotInProgress = this.viewer.impl.getScreenShotProgressive(resX, resY, onScreenshotDone, options);
        }

        // Transform 3D model position to pixel-space position on full MiniMap. Indepdent of scroll-position.
      }, {
        key: "worldToMapPixels", value: function worldToMapPixels(pos3D) {
          return Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["worldToMapPixels"])(pos3D, this.mapMatrix, this.mapImageWidth, this.mapImageHeight);
        }

        // Convert minimap pixel coords (+ world-z) to 3D world position. Minimap pixels are absolute, i.e. not affected by scrolling.
      }, {
        key: "mapPixelsToWorld", value: function mapPixelsToWorld(posX, posY, zWorld) {
          return Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["mapPixelsToWorld"])(posX, posY, zWorld, this.mapMatrixInverse, this.mapImageWidth, this.mapImageHeight);
        }

        // Compute rotation angle for camera view-cone on map.
        //  @param {THREE.Vector2} pos    - camera position     in minimap pixel space
        //  @param {THREE.Vector2} target - camera target point in minimap pixel space
        //  @returns {number}  Rotation angle in radians to transform a originally up-facing div located
        //                     in a way that it points towards (p2-p1).
      }, {
        key: "computeAngle", value: function computeAngle(pos, target) {
          var dx = target.x - pos.x;
          var dy = target.y - pos.y;
          var angle = Math.atan2(dy, dx);

          // atan measures the angle to the x-axis, but we want it to work for divs originally aligned with +y.
          angle += Math.PI / 2;

          return angle;
        }

        // Default behavior: Use the (first) visible 3D model for the map
      }, {
        key: "setDefaultMapModel", value: function setDefaultMapModel() {

          var models = this.viewer.getVisibleModels();
          var is3d = function is3d(m) { return m.is3d(); };
          if (models && models.every(is3d)) {
            this.setMapModels(models);
          } else {
            this.setMapModels(null);
          }
        }

        // Set/Change model for which we generate the map
      }, {
        key: "setMapModels", value: function setMapModels(models) {
          var _this12 = this;

          // If the models are the same, there is nothing to do
          if (!models && !this.mapModels) {
            return;
          }

          // Model count is usually small enough, otherwise we would need to avoid O(modelCount^2) here.
          var modelKnown = function modelKnown(m) { return _this12.mapModels.indexOf(m) >= 0; };
          if (models && this.mapModels && models.length === this.mapModels.length && models.every(modelKnown)) {
            return;
          }

          // We don't want to distinguish null and empty array, so we always set null if there is no model.
          // Note that we better copy the array than sharing them - to make sure that they are not changed outside our control.
          this.mapModels = models && models.length ? models.slice() : null;

          // Cancel any running map creation if the model changed
          this.cancelMapUpdate();

          // Clear cached maps and invalidate current one
          this.mapCache = {};
          this.sheetMap.clearSheetCache();
          this.mapValid = false;
          this.update();
        }
      }, {
        key: "configureSettings", value: function configureSettings() {

          //Is it a GUI viewer or not?
          if (!this.viewer.getSettingsPanel)
            return;

          var panel = this.viewer.getSettingsPanel(true);

          if (!panel.is3dMode)
            return;

          var navTab = av.Extensions.ViewerSettingTab.Navigation;
          panel.addLabel(navTab, "3D Mini-map");

          // add toggle to the hypermodeling tab of the viewer settings
          if (!panel.showMinimapChkBoxId) {
            panel.showMinimapChkBoxId = panel.addCheckbox(
              navTab,
              "Show 3D mini-map",
              "Toggles availability of the 3D mini-map when using first person mode",
              true,
              this.onVisibilityChangedCB,
              VISIBILITY_PROP);

          }
        }
      }, {
        key: "requestTimer", value: function requestTimer() {
          var _window = this.getWindow();
          this.animTimerId = _window.requestAnimationFrame(this.onTimerCB);
        }
      }, {
        key: "cancelTimer", value: function cancelTimer() {
          var _window = this.getWindow();
          _window.cancelAnimationFrame(this.animTimerId);
        }
      }, {
        key: "onTimer", value: function onTimer() {
          // get elapsed time in seconds
          var curTime = performance.now();
          var elapsed = curTime - this.lastTimer;
          this.lastTimer = curTime;

          // get time in seconds and restrict it (if we got no events for a while)
          elapsed = Math.min(elapsed || 0, 1000);
          elapsed /= 1000;

          this.updateZoomScale(elapsed);
          this.updateScrolling(elapsed);

          this.requestTimer();

          // Trigger notification if target scrollPos is reached and all other time-dependent stuff is finished.
          if (this.isAllDone()) {
            this.waitingCallbacks.forEach(function (p) { return p(); });
            this.waitingCallbacks.length = 0;
          }
        }
      }, {
        key: "setZoomScale", value: function setZoomScale(

          scale) {

          // Compute scroll position to follow the player
          if (this.autoScrollLocked) {
            return;
          }

          var oldScale = this.zoomScale;
          this.zoomScale = scale;

          // update scaled image size
          this.scaledImageWidth = this.mapImageWidth * this.zoomScale;
          this.scaledImageHeight = this.mapImageHeight * this.zoomScale;

          // recompute target scroll position based on player position
          this.computeTargetScrollPosition();

          var zoomOut = scale < oldScale;
          if (zoomOut) {
            var focusX = this.mapCenter.x;
            var focusY = this.mapCenter.y;

            // compute previous player position relative to widget
            var px = focusX * oldScale - this.scrollPos.x;
            var py = focusY * oldScale - this.scrollPos.y;

            // compute new scroll position in a way that the relative player-widget position keeps the same
            this.scrollPos.x = focusX * this.zoomScale - px;
            this.scrollPos.y = focusY * this.zoomScale - py;
          } else {
            // zoom-in: We choose a sub-region of the currently visible map region. We choose it in a way that
            // it gets as close to the targetScrollPos as possible.

            // compute region within the zoomed-in map that corresponds to the previously visible one.
            var rescale = scale / oldScale;
            var regionMinX = this.scrollPos.x * rescale;
            var regionMinY = this.scrollPos.y * rescale;
            var regionWidth = this.mapWidgetWidth * rescale;
            var regionHeight = this.mapWidgetHeight * rescale;

            // compute max-scroll position to keep within that region
            var maxScrollX = regionMinX + regionWidth - this.mapWidgetWidth;
            var maxScrollY = regionMinY + regionHeight - this.mapWidgetHeight;

            // Zoom directly to target position - but clamp against the region above
            this.scrollPos.copy(this.targetScrollPos);
            this.scrollPos.x = THREE.Math.clamp(this.scrollPos.x, regionMinX, maxScrollX);
            this.scrollPos.y = THREE.Math.clamp(this.scrollPos.y, regionMinY, maxScrollY);
          }

          // update affected widgets
          this.updatePlayerWidget();
          this.applyScrolling();
        }

        // compute min zoomScale so that we stop zoom-out when whole mapImage fits into the widget
      }, {
        key: "getMinZoomLevel", value: function getMinZoomLevel() {
          var minScaleX = this.mapWidgetWidth / this.mapImageWidth;
          var minScaleY = this.mapWidgetHeight / this.mapImageHeight;
          return Math.log2(Math.min(minScaleX, minScaleY));
        }
      }, {
        key: "getMaxZoomLevel", value: function getMaxZoomLevel() {
          // zoomLevel of 0 corresponds to zoomScale 2^0 = 1 => maximum available map resolution.
          // Allow 8x more zoom if we are within a sheetMap. These are vector graphics, so we don't care for resolution.
          // Note: We could make this smarter by using the 2D/3D transform to determine some maximum sheet-pixel per world-meter value
          return this.sheetMapActive ? 3 : 0;
        }
      }, {
        key: "setZoomLevel", value: function setZoomLevel(

          value, useTransition) {
          this.targetZoomLevel = value;

          // By default, we will smoothly move towards the target zoomlevel. If this is not
          // wanted, we apply the target value immediately.
          if (!useTransition) {
            this.zoomLevel = this.targetZoomLevel;

            // Stop immediately and avoid smoothing from producing NAN values due to infinite speed
            this.lastZoomSpeed = 0;

            // Apply scale immediately
            this.setZoomScale(Math.pow(2, this.zoomLevel));
          }
        }

        // animate zoom-scale to smoothly follow current targetZoomLevel
      }, {
        key: "updateZoomScale", value: function updateZoomScale(elapsed) {

          var delta = this.targetZoomLevel - this.zoomLevel;

          // Skip if there is no change needed
          if (delta === 0) {
            return;
          }

          // remember zoom-direction
          var zoomOut = delta > 0;

          // Temporarily drop sign, so that we can assume positive values for smoothing
          delta = Math.abs(delta);

          // If difference between zoomLevel and targetZoomLevel is hardly noticeable, stop
          // zooming and set value exactly, so that the result is more deterministic.
          if (delta < 0.001) {
            this.zoomLevel = this.targetZoomLevel;
          } else {
            // apply smoothing
            delta = Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["motionSmoothing"])(delta, elapsed, this.zoomSpeed, this.lastZoomSpeed, this.zoomAcc);

            if (elapsed) {
              this.lastZoomSpeed = delta / elapsed;
            }

            // apply delta to zoomLevel
            this.zoomLevel += delta * (zoomOut ? 1 : -1);
          }

          // update zoomScale accordingly
          this.setZoomScale(Math.pow(2, this.zoomLevel));
        }
      }, {
        key: "updateMaxFloorTextWidth", value: function updateMaxFloorTextWidth() {
          if (this.mapWidget.floorText) {
            var padding = this.sideBySide ? 130 : 50;
            this.mapWidget.floorText.style.maxWidth = "".concat(parseInt(this.mapWidget.style.width) - padding, "px");
          }
        }
      }, {
        key: "setWidgetSize", value: function setWidgetSize(

          w, h) {
          this.mapWidgetWidth = w;
          this.mapWidgetHeight = h;

          var wStr = toPixels(w);
          var hStr = toPixels(h);
          this.placeholderDiv.style.width = wStr;
          this.placeholderDiv.style.height = hStr;
          this.mapWidgetRoot.style.width = wStr;
          this.mapWidgetRoot.style.height = hStr;

          // Make sure that the LMV instance for sheet maps is kept in sync
          this.sheetMap.onResize();
          this.widgetSizeChanged = true;
          this.update();
        }

        // Update mapWidget size based on canvas size
      }, {
        key: "updateMapSize", value: function updateMapSize() {
          var canvasWidth = this.viewer.container.clientWidth;
          var canvasHeight = this.viewer.container.clientHeight;

          var width, height;
          if (this.sideBySide) {
            // Fill x percent of the parent widget (x = sideBySideSplit)
            if (this.verticalSideBySide) {
              width = canvasWidth;
              height = canvasHeight * (this.sideBySideSplit / (100 - this.sideBySideSplit));
            } else {
              width = canvasWidth * (this.sideBySideSplit / (100 - this.sideBySideSplit));
              height = canvasHeight;
            }
          } else {
            // Default mode: Small map on top-right of the screen
            var longEdge = Math.max(canvasWidth, canvasHeight);
            var shortEdge = Math.min(canvasWidth, canvasHeight);

            // Restrict mapSize to not exceed a certain percentage of canvas width/height
            width = Math.min(this.relMapWidgetSizeLongEdge * longEdge, this.relMapWidgetSizeShortEdge * shortEdge);
            height = width;
          }
          this.setWidgetSize(width, height);
        }
      }, {
        key: "onResize", value: function onResize() {
          if (this.sideBySide) {
            var containerBounds = this.viewer.container.parentElement.getBoundingClientRect();

            if (!this.lastContainerBounds || this.lastContainerBounds.width !== containerBounds.width && this.lastContainerBounds.height !== containerBounds.height) {
              this.lastContainerBounds = containerBounds;
              this.updateSideBySide(true);

              return;
            }
          }

          this.updateMapSize();
        }

        // Relocate BimWalk info button to avoid overlap with Map widget
      }, {
        // TAG:更新bimwal信息图标的位置 - 讲究
        key: "updateBimWalkInfoButtonPos", value: function updateBimWalkInfoButtonPos() {
          var bimWalk = this.viewer.getExtension(BIMWALK_EXT);
          var button = bimWalk && bimWalk.getInfoButton();
          if (!button) {
            return;
          }

          // If the infor icon is hidden, we don't need all the mess. Hopefully this will get the default
          // state if others remove the info button as well
          if (bimWalk.options.disableBimWalkInfoIcon) {
            return;
          }

          // Force buttons within the map - otherwise they would overlap with the info button.
          this.toolbar.mapButtonBar.style.right = '0px';
          this.toolbar.mapButtonBar.style.marginTop = '4px'; // within the map, we always need the margin, even in side-by-side

          // Only reserve space minimap is visible or about to fade in.
          var _window = this.getWindow();
          var style = _window.getComputedStyle(this.mapWidget);
          var visible = this.visible || style.opacity > 0;
          var reservedWidth = visible ? this.mapWidgetWidth : 0;

          // Shifting the info button is not needed in side-by-side mode,
          // because the map widget is outside the viewer canvas in this case.
          if (this.sideBySide) {
            reservedWidth = 0;
          }

          // Includes space between InfoButton and MapWidget + Space between MapWidget and right canvas boundary
          var Margin = 20;
          var right = reservedWidth + Margin;
          button.style.right = toPixels(right);
        }
      }, {
        key: "isOutside", value: function isOutside() {
          return !this.mapPixelValid(this.playerPos.x, this.playerPos.y);
        }
      }, {
        key: "mapPixelValid", value: function mapPixelValid(

          x, y) {
          return x >= 0 && y >= 0 && x < this.mapImageWidth && y < this.mapImageHeight;
        }

        // Toggle between auto-generated map image and sheets. Note that sheets may not be available for a level.
        // In this case, we fall back to the default map.
      }, {
        key: "setSheetMapEnabled", value: function setSheetMapEnabled(enabled) {
          this.useSheet = enabled;
          this.update();
          this.updateThumbnailVisiblity();
        }
      }, {
        key: "setSideBySideEnabled", value: function setSideBySideEnabled(

          enabled) {
          this.sideBySideEnabled = enabled;
          this.updateSideBySide();
        }

        // Makes sure that all sheetmap thumbnails are visible/hidden depending on whether sheetmaps are enabled
      }, {
        key: "updateThumbnailVisiblity", value: function updateThumbnailVisiblity() {
          for (var key in this.mapCache) {
            var map = this.mapCache[key];
            var sheetMaps = map.sheetMaps;
            for (var i = 0; i < sheetMaps.length; i++) {
              var sheetMap = sheetMaps[i];
              var opacity = this.useSheet ? _SheetMap_js__WEBPACK_IMPORTED_MODULE_1__["default"].OverlayOpacity : 0.0;
              this.fadeWidgetOpacity(sheetMap.thumbnail.div, opacity);
            }
          }
        }
      }, {
        key: "setSideBySideSplit", value: function setSideBySideSplit(

          value, onDone) {
            var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !this.sideBySideOptions.animateSideBySideMode;
          if (immediate) {
            this.sideBySideSplit = value;
            this.updateSideBySide(true);
            this.updateBimWalkInfoButtonPos();
            onDone && onDone();
          } else {
            this.animateSideBySideSplit(value, onDone);
          }
        }
      }, {
        key: "animateSideBySideSplit", value: function animateSideBySideSplit(

          targetValue, onSlideDone) {
            var _this13 = this;
          var FadeDuration = 0.2;

          var startVal = this.sideBySideSplit;

          var onTimer = function onTimer(t) {
            t = avp.smootherStep(t);
            _this13.sideBySideSplit = avp.lerp(startVal, targetValue, t);
            _this13.updateSideBySide(true);
            _this13.updateBimWalkInfoButtonPos();
          };

          var onSlideEnd = function onSlideEnd() {
            onSlideDone && onSlideDone();
          };

          avp.fadeValue(0, 1, FadeDuration, onTimer, onSlideEnd);
        }

        // Make sure that side-by-side layout is activated if and only if minimap is visible
      }, {
        key: "updateSideBySide", value: function updateSideBySide(force) {

          var wasSideBySide = this.sideBySide;
          this.sideBySide = this.visible && this.sideBySideEnabled;
          if (!force && wasSideBySide === this.sideBySide) {
            return;
          }

          if (this.sideBySide) {
            var containerBounds = this.viewer.container.parentElement.getBoundingClientRect();

            // Insert widget into parent of main viewer (this also removes it from viewer.container)
            var parent = this.viewer.container.parentElement;
            parent.appendChild(this.mapWidgetRoot);

            this.mapWidgetRoot.classList.add('side-by-side');

            if (containerBounds.width >= containerBounds.height) {
              // reduce width of main viewer to leave space for minimap on the right
              this.viewer.container.style.width = (100 - this.sideBySideSplit).toString() + "%";
              this.viewer.container.style.height = '100%';

              if (this.sideBySideOptions.left2DView) {
                this.viewer.container.style.left = this.sideBySideSplit.toString() + "%";
              } else {
                this.viewer.container.style.right = this.sideBySideSplit.toString() + "%";
              }

              this.viewer.container.style.top = '0px';

              if (this.sideBySideOptions.left2DView) {
                this.mapWidgetRoot.classList.add('left-2d-view');
              }

              this.verticalSideBySide = false;
              this.setRotation(0);
            } else {
              this.viewer.container.style.width = '100%';
              this.viewer.container.style.height = (100 - this.sideBySideSplit).toString() + "%";
              this.viewer.container.style.top = this.sideBySideSplit.toString() + "%";
              this.viewer.container.style.left = '0px';
              this.viewer.container.style.right = 'initial';

              this.verticalSideBySide = true;
              this.setRotation(Math.PI / 2);
            }

            if (this.sideBySideOptions.onSideBySideUpdated) {
              this.sideBySideOptions.onSideBySideUpdated(this.sideBySideSplit);
            }
          } else {

            // Move minimap back into viewer container (as overlay)
            this.viewer.container.appendChild(this.mapWidgetRoot);

            // resize main viewer back to 100% and move it back to the left
            this.viewer.container.style.width = "100%";
            this.viewer.container.style.height = "100%";
            this.viewer.container.style.left = "0%";
            this.viewer.container.style.top = "0%";

            this.mapWidgetRoot.classList.remove('side-by-side');
            this.mapWidgetRoot.classList.remove('left-2d-view');

            this.setRotation(0);
          }

          // keep canvas/camera in-sync, because we changed container size
          this.viewer.resize();

          this.updateMapSize();
          this.resetScrolling();
        }

        // Check if a sheetmap is available for current level
      }, {
        key: "sheetMapsAvailable", value: function sheetMapsAvailable() {
          var level = this.getCurrentLevel();
          var map = level && this.mapCache[level.index];
          return map && map.sheetMaps && map.sheetMaps.length;
        }
      }, {
        key: "animationActive", value: function animationActive() {
          var zooming = Math.abs(this.zoomLevel - this.targetZoomLevel) > 1.e-9;
          var delta = this.targetScrollPos.clone().sub(this.scrollPos);
          var dist = delta.length();
          var scrolling = dist >= 0.5;
          var fading = this.fadingWidgets > 0;
          var sheetAnim = this.sheetMapTransition.isRunning();
          return zooming || scrolling || fading || sheetAnim;
        }

        // Set rotation angle (clockwise in radians)
      }, {
        key: "setRotation", value: function setRotation(angle) {
          this.mapRotationAngle = angle;
          this.updateRotation();
        }
      }, {
        key: "updateRotation", value: function updateRotation() {

          var mapImage = this.mapWidget.mapImage;
          if (!mapImage || !this.mapValid) {
            // If mapValid is false, mapImage is just the placeholder to show load progress - which shouldn't be rotated.
            return;
          }

          // get widget center point within the unrotated main map
          var px = this.scrollPos.x + 0.5 * this.mapWidgetWidth;
          var py = this.scrollPos.y + 0.5 * this.mapWidgetHeight;

          // convert to percent values relative to mapImage. Note px is in scaled mapPixels, i.e.
          // after applying zoomScale.
          px *= 100 / this.scaledImageWidth;
          py *= 100 / this.scaledImageHeight;

          // Use player position as location center
          mapImage.style.transformOrigin = toPercent(px) + ' ' + toPercent(py);

          // apply rotation angle
          var rotString = 'rotate(' + this.mapRotationAngle.toString() + 'rad)';
          mapImage.style.transform = rotString;
        }

        // Compute widget center point - which we use as map rotation center.
      }, {
        key: "getWidgetCenter", value: function getWidgetCenter() {
          return new THREE.Vector2(
            (this.scrollPos.x + 0.5 * this.mapWidgetWidth) / this.zoomScale,
            (this.scrollPos.y + 0.5 * this.mapWidgetHeight) / this.zoomScale);

        }

        // @param {Vector2} p - transformed in-place from widget pixels to map image pixels
        //                      widget pixel origin is at top-left, i.e., y-axis points down (compatible to mouse events)
      }, {
        key: "widgetToMapPixels", value: function widgetToMapPixels(p) {

          // revert scroll-position offset
          p.x += this.scrollPos.x;
          p.y += this.scrollPos.y;

          // revert zoom-scale, so that result is in full-resolution map pixels
          p.x /= this.zoomScale;
          p.y /= this.zoomScale;

          // If the map is not rotated, (x,y) are now valid mapImage pixels coords

          // rotate p around widget center
          //
          // Since the map is clockwise rotated by mapRotationAngle, the visible area inside this
          // map has counterclockwise rotated by this angle.
          var widgetCenter = this.getWidgetCenter();
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["rotateAround"])(p, widgetCenter, -this.mapRotationAngle);
        }

        // @param {Vector2} p - point in map-pixel space:             Value range is [0, 0] x [mapImageWidth, mapImageHeight]
        // Converts p to a relative pixel-position in the map widget: Value range is [0, 0] x [mapWidgetWidth, mapWidgetHeight]
      }, {
        key: "mapPixelsToWidget", value: function mapPixelsToWidget(p) {

          var widgetCenter = this.getWidgetCenter();
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_5__["rotateAround"])(p, widgetCenter, this.mapRotationAngle);

          // apply zoom-scale
          p.x *= this.zoomScale;
          p.y *= this.zoomScale;

          // apply scrolling
          p.x -= this.scrollPos.x;
          p.y -= this.scrollPos.y;
        }

        // Returns true if minimap is in a stable state for the current camera.
        // This means that all models are loaded, the map image is created,
        // no animation is in progress, sheetmap loaded etc.
      }, {
        key: "isAllDone", value: function isAllDone() {

          // Are we about to switch the map to another level?
          var pendingLevelChange = this.currentLevelIndex === this.getCurrentLevel();

          // Did we reach the desired scroll position already?
          var isScrolling = !this.scrollPos.equals(this.targetScrollPos);

          // Zooming may happen based on mouse-wheel or due to automatic zoom in/out for sheetMaps
          var isZooming = this.zoomLevel !== this.targetZoomLevel || this.sheetMapTransition.isRunning();

          // TODO: We do not consider widget fading yet. In case we are going to use UI snapshots, this
          //       will be needed as well. By adding a waitFor() to AnimControl and use fadeWidget also for the main widget.

          return (
            this.mapModelsReady() && // ...not waiting for models to load
            !this.updatingMap && // ...not rendering a map image
            !this.sheetMap.loading && // ...not waiting for a sheetMap to load
            !pendingLevelChange && // ...displaying the right level already
            !this.slidingInProgress && // ...not within a UI transition from/to side-by-side
            !this.tool.flyToAnimRunning() && // ...not within a fly-to animation due to a dblClick
            !isScrolling && !isZooming);

        }

        // Returns a promise that resolves as soon as isAllDone() returns true.
      }, {
        key: "waitForAllDone", value: function waitForAllDone() {
          var _this14 = this;

          // Make sure that minimap is aware of latest changes, e.g., if BimWalk has switched on/off since last update.
          this.update();

          if (this.isAllDone()) {
            return Promise.resolve();
          }
          return new Promise(function (resolve) {
            _this14.waitingCallbacks.push(resolve);
          });
        }
      }]); return Minimap3DExtension;
    }(av.Extension);


  namespace.Minimap3DExtension = Minimap3DExtension;

  Bimfish.Viewing.theExtensionManager.registerExtension(myExtensionName, Minimap3DExtension);

  /***/
}),