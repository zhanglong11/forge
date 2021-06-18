

/***/ "./extensions/AEC/levels/LevelsExtension.js":
/*!**************************************************!*\
  !*** ./extensions/AEC/levels/LevelsExtension.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return LevelsExtension; });
/* harmony import */ var _FloorSelector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FloorSelector */ "./extensions/AEC/levels/FloorSelector.js");
/* harmony import */ var _LevelUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LevelUtils */ "./extensions/AEC/levels/LevelUtils.js");
/* harmony import */ var _ui_ListPanel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ui/ListPanel */ "./extensions/AEC/ui/ListPanel.js");
  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); } function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); } function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); } function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; } function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); } function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  var av = Bimfish.Viewing, avu = av.UI;
  var namespace = BimfishNamespace('Bimfish.AEC');
  var myExtensionName = 'Bimfish.AEC.LevelsExtension';





  // Options:
  //   @param {bool} [autoDetectAecModelData = true]
  //         Level selection requires data about existing floors. By default (true), these are extracted automatically:
  //          - For a single model, we get them by calling getAecModelData() on the document node.
  //          - If multiple models with aecModelData are visible, we choose the largest one to define the levels.
  //
  //         If set to false, an application can (and has to) call setAecModelData() explicitly instead.
  var LevelsExtension = /*#__PURE__*/function (_av$Extension) {
    _inherits(LevelsExtension, _av$Extension);
    function LevelsExtension(viewer, options) {
      var _this; _classCallCheck(this, LevelsExtension);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(LevelsExtension).call(this, viewer, options));

      _this.container = _this.options.panelUIContainers && _this.options.panelUIContainers.levelsPanel;

      _this._onCameraMoved = _this._onCameraMoved.bind(_assertThisInitialized(_this));
      _this._onMove = undefined;

      _this._subscribedForLocationUpdates = false;
      _this._currentLevel = undefined; return _this;
    } _createClass(LevelsExtension, [{
      key: "setOnCameraMove", value: function setOnCameraMove(

        func) {
        if (!this._subscribedForLocationUpdates && func) {
          this.viewer.addEventListener(av.CAMERA_CHANGE_EVENT, this._onCameraMoved);
          this._subscribedForLocationUpdates = true;
          this._onMove = func;
        } else if (!func) {
          this.viewer.removeEventListener(av.CAMERA_CHANGE_EVENT, this._onCameraMoved);
          this._subscribedForLocationUpdates = false;
          this._onMove = null;
          this._currentLevel = null;
        }
      }
    }, {
      key: "_onCameraMoved", value: function _onCameraMoved() {
        if (!this._onMove) {
          return;
        }
        var currentLevel = this._mapCameraToLevel();

        if (!currentLevel)
          return;

        if (!this._currentLevel || currentLevel.guid !== this._currentLevel.guid) {
          this._currentLevel = currentLevel;
          this._onMove(currentLevel);
        }
      }
    }, {
      key: "_mapCameraToLevel", value: function _mapCameraToLevel() {
        var floors = this.floorSelector.floorData;
        if (!floors.length) {
          return;
        }

        var currentElevation = this.viewer.impl.camera.position.z;

        if (currentElevation < floors[0].zMin) {
          return floors[0];
        } else
          if (currentElevation > floors[floors.length - 1].zMax) {
            return floors[floors.length - 1];
          } else {
            return floors.find(function (f) { return f.zMin <= currentElevation && f.zMax >= currentElevation; });
          }
      }
    }, {
      key: "onToolbarCreated", value: function onToolbarCreated() {

        if (this.container) {
          //Add our button to the toolbar if host app did not ask to render UI in some other place
          return;
        }

        // Add levelsButton to modelTools. 
        // We can safely assume toolbar to exis, because onToolbarCreated() is only called if 
        // 1. GuiViewer is used and 2. the toolbar is ready.
        var toolbar = this.viewer.getToolbar();
        var modelTools = toolbar.getControl(av.TOOLBAR.MODELTOOLSID);
        if (modelTools) {
          modelTools.addControl(this.levelsButton);
        }
      }
    }, {
      key: "_createUI", value: function _createUI() {
        var _this2 = this;

        this.levelsButton = new avu.Button("toolbar-levelsTool");
        this.levelsButton.setToolTip('Levels');
        this.levelsButton.icon.innerHTML = createLevelsIcon();

        this.levelsPanel = new _ui_ListPanel__WEBPACK_IMPORTED_MODULE_2__["ListPanel"](this.container || this.viewer.container, 'LevelsPanel-' + this.viewer.id, 'Levels');
        this.levelsPanel.setGlobalManager(this.globalManager);

        if (!this.container) {
          // This ensures that the Panel keeps visible within the viewer canvas on resize.
          this.viewer.addPanel && this.viewer.addPanel(this.levelsPanel);
        }


        // Keep button-state consistent when pressing panel close
        this.levelsPanel.addVisibilityListener(function (visible) {
          _this2.levelsButton.setState(visible ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE);
        });

        // allow client app to be notified on panel close
        this.levelsPanel.closer.addEventListener('click', function () {
          if (_this2.onPanelVisibilityToggled) {
            _this2.onPanelVisibilityToggled(false);
          }
        });

        this.levelsPanel.addEventListener(_ui_ListPanel__WEBPACK_IMPORTED_MODULE_2__["ListPanelEvents"].ITEM_MOUSE_ENTER, function (event) {

          var levelIndex = event.item.index;

          // Selecting an already selected level again will unselect => i.e. all Floors will be shown.
          // Correspondingly, we trigger rollover highlighting for all floors when hovering over the selected level.
          if (levelIndex === _this2.floorSelector.currentFloor) {
            levelIndex = _FloorSelector__WEBPACK_IMPORTED_MODULE_0__["default"].AllFloors;
          }

          _this2.floorSelector.rollOverFloor(levelIndex);
          _this2.hoveredFloor = levelIndex;
        });

        this.levelsPanel.addEventListener(_ui_ListPanel__WEBPACK_IMPORTED_MODULE_2__["ListPanelEvents"].ITEM_MOUSE_LEAVE, function (event) {
          if (_this2.hoveredFloor === event.item.index) {
            _this2.hoveredFloor = undefined;
            _this2.floorSelector.rollOverFloor(_FloorSelector__WEBPACK_IMPORTED_MODULE_0__["default"].NoFloor);
          }
        });

        this.levelsPanel.addEventListener(_ui_ListPanel__WEBPACK_IMPORTED_MODULE_2__["ListPanelEvents"].ITEM_SELECT, function (event) {
          // on item selected
          var levelIndex = event.item.index !== _this2.floorSelector.currentFloor ? event.item.index : undefined;
          _this2.floorSelector.selectFloor(levelIndex, true);
        });

        // Handle hovering over panel
        this.levelsPanel.container.addEventListener("mouseenter", function () { return _this2.floorSelector.enterHoverMode(); });
        this.levelsPanel.container.addEventListener("mouseleave", function () { return _this2.floorSelector.exitHoverMode(); });

        // Keep selected item in-sync with selected Floor
        this.floorSelector.addEventListener(
          _FloorSelector__WEBPACK_IMPORTED_MODULE_0__["default"].CURRENT_FLOOR_CHANGED,
          function () { return _this2.levelsPanel.updateItemStates(); });


        this.levelsPanel.setItemHandlers(
          function (item) { return item.index === _this2.floorSelector.currentFloor; },
          function (item) { return item.text; });


        // Connect levelsButton
        this.levelsButton.onClick = function () {
          var visible = !_this2.levelsPanel.isVisible();
          _this2.levelsPanel.setVisible(visible);

          // allow client app to be notified
          if (_this2.onPanelVisibilityToggled) {
            _this2.onPanelVisibilityToggled(visible);
          }
        };
      }

      // If placementTf is undefined, we use the refPointTransform of aecModelData.
      // Note that this is correct when using applyRefPoint=true and a globalOffset with z=0
      // for the model load options.
    }, {
      key: "setAecModelData", value: function setAecModelData(aecModelData, placementTf) {

        if (aecModelData !== this.aecModelData) {

          this.aecModelData = aecModelData;

          if (aecModelData) {
            // init level data
            this.floorSelector.floorData = Object(_LevelUtils__WEBPACK_IMPORTED_MODULE_1__["aecModelDataToLevels"])(aecModelData, placementTf);
          } else {
            this.floorSelector.floorData = [];
          }

          var levels = this.floorSelector.floorData;
          var items = [];
          for (var i = 0; i < levels.length; i++) {
            var level = levels[i];
            items.push({
              text: level.name,
              index: i
            });

          }

          // list items in reverse order, because aecModelData levels are sorted by increasing z
          items.reverse();
          this.levelsPanel.setItems(items);

          this._updateOccluderData();
        }
      }
    }, {
      key: "_updateOccluderData", value: function _updateOccluderData() {
        // Make sure that occluder data is known if a main model is specified
        var occludersPerModel = this.aecModelData ? Object(_LevelUtils__WEBPACK_IMPORTED_MODULE_1__["modelDataOccluders"])(this.viewer) : undefined;
        this.floorSelector.floorFilterData = occludersPerModel;
      }
    }, {
      key: "load", value: function load() {
        debugger
        
        var _this3 = this;
        this.floorSelector = new _FloorSelector__WEBPACK_IMPORTED_MODULE_0__["default"](this.viewer);

        this.updateFloorSelector = function () {
          // auto-detect main model if not disabled
          var autoDetect = _this3.options.autoDetectAecModelData !== false;
          if (autoDetect) {
            var model = Object(_LevelUtils__WEBPACK_IMPORTED_MODULE_1__["chooseMainModel"])(_this3.viewer);
            var bubbleNode = model && model.getDocumentNode();
            var aecModelData = bubbleNode && bubbleNode.getAecModelData();

            // provde placement matrix as well.
            var placementTf = model && model.myData.placementWithOffset;
            _this3.setAecModelData(aecModelData, placementTf);
          }

          _this3._updateOccluderData();

          // Make sure that cutplanes are disabled when in 2d views and reactivated in 3d
          // Todo: Check if we can move the MODEL_ADDED event at the end of addModel, so that we could simply use viewer.is2d here.
          var is3d = _this3.viewer.getVisibleModels().some(function (model) { return model.is3d(); });
          _this3.floorSelector.setEnabled(is3d);
        };

        this.viewer.addEventListener(av.MODEL_ROOT_LOADED_EVENT, this.updateFloorSelector);
        this.viewer.addEventListener(av.MODEL_UNLOADED_EVENT, this.updateFloorSelector);
        this.viewer.addEventListener(av.MODEL_ADDED_EVENT, this.updateFloorSelector);

        this._createUI();
        this.updateFloorSelector();

        return true;
      }
    }, {
      key: "unload", value: function unload() {
        if (!this.container) {
          this.viewer.removePanel && this.viewer.removePanel(this.levelsPanel);
        }
        this.floorSelector.selectFloor(undefined, false);
        this.levelsPanel = null;

        if (this.updateFloorSelector) {
          this.viewer.removeEventListener(av.MODEL_ROOT_LOADED_EVENT, this.updateFloorSelector);
          this.viewer.removeEventListener(av.MODEL_UNLOADED_EVENT, this.updateFloorSelector);
          this.viewer.removeEventListener(av.MODEL_ADDED_EVENT, this.updateFloorSelector);
          this.updateFloorSelector = null;
        }

        if (this._subscribedForLocationUpdates) {
          this.viewer.removeEventListener(av.CAMERA_CHANGE_EVENT, this._onCameraMoved);
          this._onMove = null;
          this._currentLevel = null;
        }

        this.floorSelector = null;

        return true;
      }

/**
   * Gets the extension state as a plain object. Invoked automatically by viewer.getState()
   * @param {object} viewerState - Object to inject extension values.
   */ }, {
      key: "getState", value: function getState(
        viewerState) {
        if (!this.viewer.model || this.viewer.model.is2d()) {
          return;
        }

        var floor = this.floorSelector.currentFloor;
        viewerState.floorGuid = floor ? this.floorSelector.floorData[floor].guid : null;
      }
    }, {
      key: "restoreState",

/**
                             * Restores the extension state from a given object. Invoked automatically by viewer.restoreState()
                             * @param {object} viewerState - Viewer state.
                             * @param {boolean} immediate - Whether the new view is applied with (true) or without transition (false).
                             * @returns {boolean} True if restore operation was successful.
                             */value: function restoreState(
        viewerState, immediate) {
        if (viewerState.floorGuid) {
          var floor = this.floorSelector.floorData.find(function (data) { return data.guid === viewerState.floorGuid; });

          if (floor) {
            this.floorSelector.selectFloor(floor.index, false);
          }
        } else {
          this.floorSelector.selectFloor(_FloorSelector__WEBPACK_IMPORTED_MODULE_0__["default"].NoFloor, false);
        }

        return true;
      }
    }]); return LevelsExtension;
  }(av.Extension);


  var createLevelsIcon = function createLevelsIcon() {
    return [
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
      '<g stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="M4 8 L12 3 L 20 8 L12 13Z"/>',
      '<path d="M4 12 L12 17 L 20 12"/>',
      '<path d="M4 16 L12 21 L 20 16"/>Ä',
      '</g>',
      '</svg>'].
      join('');
  };

  namespace.LevelsExtension = LevelsExtension; // Makes it easier to get e.g. the version

  // Register the extension with the extension manager.
  Bimfish.Viewing.theExtensionManager.registerExtension(myExtensionName, LevelsExtension);

  /***/
}),