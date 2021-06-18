/***/ "./extensions/AEC/Minimap3D/SheetMap.js":
/*!**********************************************!*\
  !*** ./extensions/AEC/Minimap3D/SheetMap.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return SheetMap; });
/* harmony import */ var _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/AecModelData.js */ "./extensions/AEC/common/AecModelData.js");
/* harmony import */ var _MinimapMath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MinimapMath.js */ "./extensions/AEC/Minimap3D/MinimapMath.js");
/* harmony import */ var _SheetThumbnail_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SheetThumbnail.js */ "./extensions/AEC/Minimap3D/SheetThumbnail.js");
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } //
  // SheetMap is used by Minimap in order to display a sheet in an own viewer instance - instead of a pre-rendered image containg the automatically generated map.
  //





  var av = Bimfish.Viewing; var

    SheetMapConfig = /*#__PURE__*/function () {
      function SheetMapConfig(sheetNode, viewport, mapMatrix, levelGuid) {
        _classCallCheck(this, SheetMapConfig);

        // {av.BubbleNode}
        this.sheetNode = sheetNode;

        // {object}: viewport on the sheet, as obtained from AecModelData
        this.viewport = viewport;

        // {Matrix4} transforms from 3D world coords to sheetmap coords in [-1,1]^2
        this.mapMatrix = mapMatrix;
        this.mapMatrixInv = new THREE.Matrix4().getInverse(mapMatrix);

        // {string}
        this.levelGuid = levelGuid;

        // {SheetMapThumbnail}
        this.thumbnail = undefined;
      } _createClass(SheetMapConfig, [{
        key: "isUsable", value: function isUsable(

          pos3D, levelGuid) {
          return this.levelGuid === levelGuid && Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_1__["posIsInsideMap"])(pos3D, this.mapMatrix);
        }
      }]); return SheetMapConfig;
    }();


  // Size large thumbnails that we create from snapshots for transitions
  var ThumbnailSize = 1000; var

    SheetMap = /*#__PURE__*/function () {

      // @param {Minimap} parent
      function SheetMap(parent) {
        _classCallCheck(this, SheetMap);

        // Viewer instance to show render the sheet within the map
        this.mapViewer = null;

        this.sheetRegion = null; // Box2: Rectangular viewport region on the sheet that we use as map content

        // Set to true if a sheet has loaded and prepared for map use
        this.ready = false;

        // Indicates that initMap() has been called, but sheet loading didn't finish yet.
        this.loading = false;

        // levelGuid for which the map is configured
        this.levelGuid = null;

        // All sheets in memory, indexed by sheetNode-id
        this.sheetCache = []; // string -> av.Model

        // Config used for last sheet setup (only valid if a sheet is active)
        this.config = null; // {SheetMapConfig}

        this.visible = false;

        this.tmpMatrix = new THREE.Matrix4();
        this.tmpVec = new THREE.Vector3();

        // {Minimap}
        this.parent = parent;
      } _createClass(SheetMap, [{
        key: "initMapViewer", value: function initMapViewer(

          parentWidget, mapViewer) {
          if (!mapViewer) {
            var _window = av.getGlobal();
            // Keep NOP_VIEWER hack alive: NOP_VIEWER should still point to the main viewer instance
            var mainViewer = _window.NOP_VIEWER;

            mapViewer = new Bimfish.Viewing.Viewer3D(parentWidget, {});
            mapViewer.initialize();

            _window.NOP_VIEWER = mainViewer;

            var style = mapViewer.container.style;
            style.zIndex = 1; // On top of main map, but not occluding the player widget
            style.opacity = 0.0; // Viewer is initally fully transparent, but is faded in during transition
            style.pointerEvents = "none"; // Avoid viewer from capturing events. Otherwise, they wouldn't reach Minimap widget
            style.width = "100%"; // Align with full size of map widget
            style.height = "100%";

          } else {
            // If viewer already exists, we just need to make sure it has the updated client container.
            parentWidget.appendChild(mapViewer.container);
          }

          this.mapViewer = mapViewer;

          // Hide until a map is initialized
          this.setVisible(false);

          return mapViewer;
        }
      }, {
        key: "clearSheetCache", value: function clearSheetCache() {
          if (!this.mapViewer) {
            return;
          }
          this.sheetCache = [];
          this.mapViewer.impl.unloadCurrentModel();
          this.ready = false;
        }
      }, {
        key: "setVisible", value: function setVisible(

          visible) {
          if (this.mapViewer) {
            this.mapViewer.container.style.visibility = visible ? "visible" : "hidden";
            this.visible = visible;
          }
        }

        // Sets 4 cutplanes in sheet viewer that restricts the sheet to the viewport that we are currently using.
      }, {
        key: "cropToViewport", value: function cropToViewport() {

          // A cutplane cp = (nx, ny, nz, c) 
          // excludes all points p with dot(v, n) + c > 0.0.
          // That is...
          //  - the normal points to the excluded half-space.
          //  - For a point (x,y) on the plane, we get the constant
          //    as c = -dot(p, n).
          var lower = new THREE.Vector4(0, -1, 0, this.sheetRegion.min.y);
          var upper = new THREE.Vector4(0, 1, 0, -this.sheetRegion.max.y);
          var left = new THREE.Vector4(-1, 0, 0, this.sheetRegion.min.x);
          var right = new THREE.Vector4(1, 0, 0, -this.sheetRegion.max.x);

          var cutPlanes = [lower, upper, left, right];

          this.mapViewer.impl.setCutPlaneSet("SheetRegion", cutPlanes);
        }
      }, {
        key: "clearCutPlanes", value: function clearCutPlanes() {
          this.mapViewer.impl.setCutPlaneSet("SheetRegion", []);
        }

        // Computes a mapMatrix based on a viewport on a sheet. The matrix transforms from 3D model coordinates to 
        // normalized map coords in [-1,1]^2.
        //  @param {Object} viewport - Viewport data obtained from AECModelData.json    
        //  @param {av.Model} model  - A currently visible 3D model of the Revit document for which we found the sheet.
        //  @param {THREE.Matrix4}   - Optional target to avoid matrix alloc.
        //  @returns THREE.Matrix4
      }, {
        key: "clearMap", value: function clearMap() {
          this.levelGuid = undefined;
          this.loading = false;
          this.ready = false;
          this.config = null;

          this.setVisible(false);
          this.clearCutPlanes();

          // unload current model
          var sheet = this.mapViewer.model;
          if (sheet) {
            this.mapViewer.hideModel(sheet.id);
          } else {
            // TODO: Stop loader if in progress
          }
        }

        // Finds all viewports associated with the given floor.
        //  @param {av.Model[]} mapModels - All models in which we search for sheets
        //  @param {string}     levelGuid
        //  @returns {SheetMapConfig[]} Sheetmap configurations for all viewports found for that floor
      }, {
        key: "findMap",






































        // Given visible models, current floor and camera position in 3D, this function searches for a viewport
        // that contains this position. 
        //  @param {av.Model[]} Currently visible models
        //  @param {string} levelGuid
        //  @returns {Object|undefined } If a suitable viewport is found, it returns
        //                              { 
        //                                  viewport,  // The viewport object from AECModelData
        //                                  sheetNode, // BubbleNode of the sheet containing this viewport
        //                                  mapMatrix  // Transforms from 3D model coords to coords on the map (in [-1,1])
        //                              }.
        value: function findMap(mapModels, levelGuid, pos3D) {

          // {SheetMapConfig[]}
          var maps = SheetMap.findMaps(mapModels, levelGuid);
          var inside = function inside(map) { return Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_1__["posIsInsideMap"])(pos3D, map.mapMatrix); };
          return maps.find(inside);
        }
      }, {
        key: "refineThumbnail", value: function refineThumbnail(

          model, mapConfig) {

          // Make sure that we do the screenshot only once per sheetMap
          if (mapConfig.thumbnailRefined) {
            return;
          }
          mapConfig.thumbnailRefined = true;

          // Align camera to capture the whole sheet
          var box = model.getBoundingBox();

          // We want to create a thumbnail that matches the ones from DerivativeService. To make it harder, the boundingBox is slightly
          // different from the model box, because it is enlarged in x/y by a shadow. Therefore, we must adjust the values using the viewbox
          // values from manifest.
          var node = model.getDocumentNode();
          var view = node.search({ type: "view" })[0];
          var values = view && view.getViewBox();
          if (values) {
            // We cannot use set here, because the box returned by model.getBoundingBox() just contain {x,y,z} objects.
            box.min.x = values[0];
            box.min.y = values[1];
            box.max.x = values[2];
            box.max.y = values[3];
          }

          // Setup camera for the snapshot
          var camera = new Bimfish.Viewing.UnifiedCamera(ThumbnailSize, ThumbnailSize);
          var is2d = true;
          camera.setViewFromBox(box, is2d);

          var onScreenshotDone = function onScreenshotDone(imageUrl) {
            //window.open(imageUrl);

            // Replace low-res thumbnail by higher-resolution snapshot
            mapConfig.thumbnail.refineImage(imageUrl);
          };

          var options = {
            camera: camera
          };

          this.screenShotInProgress = this.mapViewer.impl.getScreenShotProgressive(ThumbnailSize, ThumbnailSize, onScreenshotDone, options);
        }

        // Initialize sheet map for given level.
        //
        //  @param {SheetMapConfig} mapConfig 
        //  @param {function(Matrix4)} onDone    - Called with mapMatrix when sheet is ready
      }, {
        key: "initMap", value: function initMap(mapConfig, onDone) {
          var _this = this;

          // Clear previous sheet (if any)
          this.clearMap();

          this.loading = true;
          this.config = mapConfig;

          // When sheet loading is finished, create snapshot
          var onSheetGeomLoaded = function onSheetGeomLoaded(model) {

            // add sheet to cache 
            _this.sheetCache[mapConfig.sheetNode.id] = model;

            // Don't activate sheet if sheetMap has changed meanwhile
            if (mapConfig !== _this.config) {
              return;
            }

            // Compute viewport rectangle in sheet-coords
            var sheetUnitScale = model.getUnitScale();
            _this.sheetRegion = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].getViewportBounds(mapConfig.viewport, sheetUnitScale);

            // Configure cutplanes, so that mapViewer only shows the viewport that we are actually using
            _this.cropToViewport();

            // It's important to do this 
            _this.refineThumbnail(model, mapConfig);

            // Let minimap know that this SheetMap is ready to use
            _this.loading = false;
            _this.ready = true;
            onDone();
          };

          // For now, we simply use the first (viewport, sheet, model3D) candidate that we find. Finally, we may let the 
          // user decide which one to use - or invent some smarter heuristics.
          this.mapMatrix = mapConfig.mapMatrix;
          this.config = mapConfig;

          // Compute mapMatrix as soon as sheet is loaded
          var onSheetMapReady = function onSheetMapReady(model) {

            // Wait for sheet geometry, so that we can do a screenshot
            if (model.isLoadDone()) {
              onSheetGeomLoaded(model);
            } else {
              // Wait for sheet geometry of this model
              var geomLoadCB = function geomLoadCB(e) {

                if (e.model !== model) {
                  return;
                }

                onSheetGeomLoaded(model);
                _this.mapViewer.removeEventListener(Bimfish.Viewing.GEOMETRY_LOADED_EVENT, geomLoadCB);
              };

              _this.mapViewer.addEventListener(Bimfish.Viewing.GEOMETRY_LOADED_EVENT, geomLoadCB);
            }
          };

          // Check if sheet is already in memory
          var model = this.sheetCache[mapConfig.sheetNode.id];
          if (model) {
            // get sheet from cache
            this.mapViewer.showModel(model.id);
            onSheetMapReady(model);
          } else {
            // Load sheet and activate when available
            var onError = function onError(error) {
              console.error("Failed to load sheet for minimap: ", mapConfig.sheetNode.name(), ": ", error);
            };

            // Load sheet
            var doc = mapConfig.sheetNode.getRootNode().getDocument();
            this.mapViewer.loadDocumentNode(doc, mapConfig.sheetNode)["catch"](
              onError).
              then(onSheetMapReady);
          }
        }

        // Returns true if a sheetmap is ready to use and properly initialized for the given camera position and level
      }, {
        key: "isUsable", value: function isUsable(pos3D, levelGuid) {
          return this.ready && this.config.isUsable(pos3D, levelGuid);
        }
      }, {
        key: "onResize", value: function onResize() {
          if (this.mapViewer) {
            this.mapViewer.resize();
          }
        }

        // Returns width/height aspect of the sheet region. 
        // Only valid if a map has been setup.
      }, {
        key: "getAspectRatio", value: function getAspectRatio() {
          var w = this.sheetRegion.max.x - this.sheetRegion.min.x;
          var h = this.sheetRegion.max.y - this.sheetRegion.min.y;
          return w / h;
        }
      }, {
        key: "initialized", value: function initialized() {
          return this.loading || this.ready;
        }

        // Transforms a point p from widget coords to render coordinates on the current sheet.
        // @param {Vector2} p - in pixels relative to the mapWidget
      }, {
        key: "widgetToSheet", value: function widgetToSheet(p) {

          // Convert to pixel-coords on the main map image
          this.parent.widgetToMapPixels(p);

          // Convert to 3D world coords
          var p3D = this.parent.mapPixelsToWorld(p.x, p.y, 0.0);

          // map to sheetMap coords in [0,1]^2
          p3D.applyMatrix4(this.config.mapMatrix);

          // rescale from [-1,1]^2 to [0,1]^2
          p3D.x = (p3D.x + 1) / 2;
          p3D.y = (p3D.y + 1) / 2;

          // use p3D as viewport coords within sheetRegion
          var srWidth = this.sheetRegion.max.x - this.sheetRegion.min.x;
          var srHeight = this.sheetRegion.max.y - this.sheetRegion.min.y;
          p.x = this.sheetRegion.min.x + srWidth * p3D.x;
          p.y = this.sheetRegion.min.y + srHeight * p3D.y;
        }

        // Sets the LMV camera in a way that the sheet appears to be "embedded" into the main map.
      }, {
        key: "syncCameraToMainMap", value: function syncCameraToMainMap() {

          // widget extents
          var ww = this.parent.mapWidgetWidth;
          var wh = this.parent.mapWidgetHeight;

          // get 3 corner points of the map widget
          var p0 = new THREE.Vector2(0, wh); // lower-left corner 
          var p1 = new THREE.Vector2(ww, wh); // lower-right corner
          var p2 = new THREE.Vector2(0, 0); // upper-left corner 

          // convert them to sheet coords
          this.widgetToSheet(p0);
          this.widgetToSheet(p1);
          this.widgetToSheet(p2);

          // Use them to align sheet camera
          var camera = this.mapViewer.impl.camera;
          Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_1__["setCameraFromFrustumCorners"])(camera, p0, p1, p2);

          this.mapViewer.impl.invalidate(true, true);
        }

        // Creates sheetmap configurations for all sheetMaps that are found on the current floor.
        //  @param {av.Model[]} mapModels - models in which we search for viewports/sheets
        //  @param {string}     levelGuid
        //  @param {Matrix4}    mainMapMatrix - map matrix of the main map showing the whole floor
        //  @param {number}     mainMapWidth, mainMapHeight - Resolution of main map image 
        //  @returns {SheetMapConfig[]} 
      }], [{
        key: "computeMapMatrix", value: function computeMapMatrix(vp, model3D, optionalTarget) {// We map from model coords via sheet coords to finally [-1,1]^2.
          //
          // The functions getViewportBounds() and get3DTo2DMatrix() work in sheet-space, so that they require
          // the sheetUnitScale - which we don't know before loading the sheet.
          //
          // But, since we finally map the viewport to [-1,1] anyway, a uniform scaling of the sheet has no impact on 
          // the final map matrix anyway. So we can assume a dummy unitScale of 1.0 here.
          var DummyUnitScale = 1.0; var sheetRegion = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].getViewportBounds(vp, DummyUnitScale); // Create matrix to map sheetRegion to [-1,1]^2
          var sheetToMap = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].remapRectangle(sheetRegion.min.x, sheetRegion.min.y, sheetRegion.max.x, sheetRegion.max.y, // from: SheetRegion
            -1, -1, 1, 1 // to: [0,1]^2
          ); var modelToSheet = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].get3DTo2DMatrix(vp, DummyUnitScale); var mapMatrix = new THREE.Matrix4().multiplyMatrices(sheetToMap, modelToSheet); // Note that placementWithOffset may be null if globalOffset is (0,0,0) and there is no placement transform
          if (model3D.myData.placementWithOffset) {// The mapMatrix computed so far maps local model coordinates to map coordinates. 
            // Finally, we want to map from local LMV coordinates. Therefore, the final transform
            // must revert any load-time transforms first.
            var lmvToModel = optionalTarget || new THREE.Matrix4(); lmvToModel.getInverse(model3D.myData.placementWithOffset); // The lmvToModel matrix must be applied first. For this, we post-multiply it to the mapMatrix.
            mapMatrix.multiply(lmvToModel);
          } return mapMatrix;
        }
      }, {
        key: "findMaps", value: function findMaps(mapModels, levelGuid) {// Find all viewports that would be suitable as a floor map. 
          var result = []; for (var i = 0; i < mapModels.length; i++) {// Find viewports for levelGuid in the document of mapModel[i]
            var model = mapModels[i]; var aec = model.getDocumentNode().getAecModelData(); var modelViewports = aec && _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].findViewportsForLevel(aec, levelGuid).filter(_common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].supports2DTo3DTransform); if (!modelViewports) {// Skip models that don't provide AecModelData
              continue;
            } // get doc root containing the model
            var root = model.getDocumentNode().getRootNode(); // For each viewport...
            for (var j = 0; j < modelViewports.length; j++) {
              var viewport = modelViewports[j]; // Check if we find a BubbleNode for the sheet containing it
              var sheetNode = _common_AecModelData_js__WEBPACK_IMPORTED_MODULE_0__["default"].findSheetForViewport(root, viewport); if (!sheetNode) { continue; } // Compute mapMatrix for this viewport
              var mapMatrix = SheetMap.computeMapMatrix(viewport, model, this.tmpMatrix); // We found a candidate (viewport, sheet) pair
              result.push(new SheetMapConfig(sheetNode, viewport, mapMatrix, levelGuid));
            }
          } return result;
        }
      }, {
        key: "createSheetMapConfigs", value: function createSheetMapConfigs(mapModels, levelGuid, mainMapMatrix, mainMapWidth, mainMapHeight) {
          
          var maps = SheetMap.findMaps(mapModels, levelGuid); var result = []; for (var i = 0; i < maps.length; i++) {
            var map = maps[i]; // create & attach thumbnail
            // only map configs with a "view" child should be added, otherwise it won't contain a viewbox.
            if (map.sheetNode.search({ type: 'view' }).length > 0) { map.thumbnail = new _SheetThumbnail_js__WEBPACK_IMPORTED_MODULE_2__["default"](map, mainMapMatrix, mainMapWidth, mainMapHeight); result.push(map); }
          } return result;
        }
      }]); return SheetMap;
    }(); // Opacity used for embedded viewer instance and sheetMap thumbnails
  SheetMap.OverlayOpacity = 0.5;

  /***/
}),
