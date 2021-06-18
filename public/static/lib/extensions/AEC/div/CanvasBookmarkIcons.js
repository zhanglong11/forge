
/***/ "./extensions/AEC/CanvasBookmark/CanvasBookmark.js":
/*!*********************************************************!*\
  !*** ./extensions/AEC/CanvasBookmark/CanvasBookmark.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return CanvasBookmarkExtension; });
/* harmony import */ var _CanvasBookmarkIcons_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CanvasBookmarkIcons.js */ "./extensions/AEC/CanvasBookmark/CanvasBookmarkIcons.js");
/* harmony import */ var _CreateFrustumShape_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CreateFrustumShape.js */ "./extensions/AEC/CanvasBookmark/CreateFrustumShape.js");
/* harmony import */ var _HCluster_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./HCluster.js */ "./extensions/AEC/CanvasBookmark/HCluster.js");
  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); } function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); } function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); } function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; } function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); } function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  var av = Bimfish.Viewing, avp = av.Private, avu = Bimfish.Viewing.UI;
  var namespace = BimfishNamespace('Bimfish.AEC');
  var myExtensionName = 'Bimfish.AEC.CanvasBookmarkExtension';

  var LEVEL_EXT = 'Bimfish.AEC.LevelsExtension';





  var VISIBILITY_PROP = 'canvasBookmarks';

  // Name of the overlay scene that we use graphics overlays (frustum shapes)
  var OverlayName = 'CanvasBookmark_Extension_Overlay';
  var CutPlaneSetName = 'CanvasBookmark_CutPlanes';

  // Interpolate between two given Matrix4 transforms. Note that this requires the transforms
  // to be invertible combinations of pos/rotate/scale.
  var lerpTransforms = function () {
    var startPos = new THREE.Vector3();
    var endPos = new THREE.Vector3();
    var startScale = new THREE.Vector3();
    var endScale = new THREE.Vector3();
    var startRotate = new THREE.Quaternion();
    var endRotate = new THREE.Quaternion();

    var pos = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var rotate = new THREE.Quaternion();

    return function (startMatrix, endMatrix, t, dstTransform) {
      startMatrix.decompose(startPos, startRotate, startScale);
      endMatrix.decompose(endPos, endRotate, endScale);

      pos.lerpVectors(startPos, endPos, t);
      scale.lerpVectors(startScale, endScale, t);
      THREE.Quaternion.slerp(startRotate, endRotate, rotate, t);

      dstTransform.compose(pos, rotate, scale);

      return dstTransform;
    };
  }();

  // Interpolates between two bboxes. t is in [0,1]
  var lerpBoxes = function lerpBoxes(startBox, endBox, t, dstBox) {
    dstBox.min.lerpVectors(startBox.min, endBox.min, t);
    dstBox.max.lerpVectors(startBox.max, endBox.max, t);
    lerpTransforms(startBox.transform, endBox.transform, t, dstBox.transform);
  };

  // Clone Box3 with attached transform
  var cloneBox = function cloneBox(srcBox) {
    var box = srcBox.clone();
    box.transform = srcBox.transform ? srcBox.transform.clone() : new THREE.Matrix4();
    return box;
  };

  var setButtonVisible = function setButtonVisible(button, value) {

    // Make it detectable if this button is going to change on next anim frame.
    button.visiblityChangePending = true;

    // Delay class change to next anim frame - otherwise css transitions don't work sometimes.
    requestAnimationFrame(function () {
      if (value) {
        button.container.classList.add('visible');
      } else {
        button.container.classList.remove('visible');
      }
      button.visiblityChangePending = false;
    });
  }; var


    CanvasBookmarkExtension = /*#__PURE__*/function (_av$Extension) {
      _inherits(CanvasBookmarkExtension, _av$Extension);
      function CanvasBookmarkExtension(viewer, options) {
        var _this; _classCallCheck(this, CanvasBookmarkExtension);
        _this = _possibleConstructorReturn(this, _getPrototypeOf(CanvasBookmarkExtension).call(this, viewer, options));

        _this.viewer = viewer;

        _this.bookmarks = [];
        _this.clusteredBookmarks = [];

        _this.camera = _this.viewer.navigation.getCamera();
        _this.cameraMovedCB = _this.onCameraMoved.bind(_assertThisInitialized(_this));
        _this.onVisibilityChangedCB = _this.onVisibilityChanged.bind(_assertThisInitialized(_this));

        // SectionBox animations
        _this.sectionBox = null; // SectionBox as defined by currently hovered bookmark (not changed during anims)
        _this.activeSectionBox = null; // Latest applied SectionBox
        _this.animStartSectionBox = null; // Used only during cutplane animations
        _this.animEndSectionBox = null; // Usually equal to this.sectionBox, but this.sectionBox may be null while animEndSectionBox is always valid during an animation
        _this.sectionBoxAnim = null; // AnimControl - only existing during animations

        // bookmarks visibility logic
        _this.changeBookmarksVisibility = _this.changeBookmarksVisibility.bind(_assertThisInitialized(_this));
        _this.changeBookmarksVisibilityTimeout = null;

        _this._clusteringEnabled = _this.options.clusterfck !== undefined;
        _this._clusteringThreshold = _this.options.clusteringThreshold || 110; // threshold is (icon_width * 5), depends on "THREE.Vector3.distanceTo()"

        // bookmarks clustering
        if (_this._clusteringEnabled) {
          _this.hcluster = new _HCluster_js__WEBPACK_IMPORTED_MODULE_2__["default"](
            _this.options.clusterfck,
            function (b1, b2) {
              var _b1 = new THREE.Vector2(b1.currentPosProjected.x, b1.currentPosProjected.y);
              var _b2 = new THREE.Vector2(b2.currentPosProjected.x, b2.currentPosProjected.y);
              return _b2.distanceTo(_b1);
            },
            _this._clusteringThreshold);

        }

        _this._filterOutInvisibleBookmark = _this._filterOutInvisibleBookmark.bind(_assertThisInitialized(_this));

        _this.levelChangedCB = _this.onLevelChanged.bind(_assertThisInitialized(_this));

        _this.extensionLoadedCB = _this.onExtensionLoaded.bind(_assertThisInitialized(_this));

        // Indicates if any frustumShape is currently fading for hover effects.
        _this.isFrustumFading = false;

        // For testing: Callbacks that will be notified once as soon as Minimap has reached stable state
        _this.waitingCallbacks = []; return _this;
      } _createClass(CanvasBookmarkExtension, [{
        key: "setBookmarksVisible", value: function setBookmarksVisible(

          visible) {
          this.bookmarks.forEach(function (b) { return setButtonVisible(b.marker, visible); });
          this.clusteredBookmarks.forEach(function (b) { return setButtonVisible(b.marker, visible); });
          if (!visible) {
            this.stopGhosting();
          }
        }
      }, {
        key: "onVisibilityChanged", value: function onVisibilityChanged(

          visible) {
          if (this.viewer.prefs) {
            this.viewer.prefs.set(VISIBILITY_PROP, visible);
          }

          this.setBookmarksVisible(visible);

          if (visible) {
            this.updateBookmarkPositions();
          }
        }
      }, {
        key: "isVisible", value: function isVisible() {
          return this.viewer.prefs && this.viewer.prefs.get(VISIBILITY_PROP);
        }
      }, {
        key: "onCameraMoved", value: function onCameraMoved() {
          this.setBookmarksVisible(false);
          this.debounceBookmarksVisibility();
        }
      }, {
        key: "createTooltip", value: function createTooltip(

          button, geomNode) {
          button.setToolTip(geomNode.name());
          button._toolTipElement.innerHTML = "<b>".concat(geomNode.name(), "</b>");
        }
      }, {
        key: "flyToBookmark", value: function flyToBookmark(

          bookmark) {
          var dstView = {
            position: bookmark.pos,
            target: bookmark.target,
            up: bookmark.up
          };

          this.anim = avp.flyToView(this.viewer, dstView, 1.0);
        }

        // geomNode is a BubbleNode of type GEOMETRY_NODE
      }, {
        key: "createBookmark", value: function createBookmark(geomNode) {
          var _this2 = this;

          // extract camera data (TODO: Add generic utility function to BubbleNode to read camera)
          var camera = geomNode.extractCamera();
          if (!camera) {
            return;
          }

          var pos = camera.position;
          var target = camera.target;

          // Consider refPointTransform:
          //    cameras are in local Revit coordinates. To support georeferencing, we apply the refPointTransform
          //    from aecModelData and finally subtract the viewer geoOffset
          var root = geomNode.getRootNode();
          var tfMatrix = root.extractRefPointTransform();

          if (this.options.globalOffset && tfMatrix) {

            // apply refPointTransform and globalOffset to pos and target
            pos.applyMatrix4(tfMatrix);
            pos.sub(this.options.globalOffset);
            target.applyMatrix4(tfMatrix);
            target.sub(this.options.globalOffset);
          }

          var dir = new THREE.Vector3(target.x - pos.x, target.y - pos.y, target.z - pos.z).normalize();
          var up = new THREE.Vector3(0, 0, 1);

          // IDs cannot start with numbers and have whitespaces
          var button = new Bimfish.Viewing.UI.Button("b-".concat(geomNode.name().replace(/\s/g, '')));

          // Configure style (TODO: Should move to css class or specified by client app)
          button.container.classList.add('canvas-bookmark');
          button.container.innerHTML = Object(_CanvasBookmarkIcons_js__WEBPACK_IMPORTED_MODULE_0__["createCameraIcon"])();
          setButtonVisible(button, this.isVisible());

          this.createTooltip(button, geomNode);

          this.viewer.container.appendChild(button.container);

          var buttonSize = button.getDimensions();

          var sectionBox = this.findSectionBox(geomNode, geomNode.name());
          var sectionBoxCenter = sectionBox ? sectionBox.center().applyMatrix4(sectionBox.transform) : null;

          var bookmark = {
            marker: button,
            pos: sectionBox ? sectionBoxCenter : pos,
            cameraPos: pos,
            dir: dir,
            up: up,
            target: target,
            name: geomNode.name(),

            // position within the marker that should be centered
            anchorX: buttonSize.width / 2,
            anchorY: buttonSize.height / 2,

            fadeValue: 0.0,
            hovered: false,
            bubbleNode: geomNode,

            clustered: false
          };


          button.container.addEventListener('mouseenter', function () { _this2.onBookmarkMouseEnter(bookmark); });
          button.container.addEventListener('mouseleave', function () { _this2.onBookmarkMouseLeave(bookmark); });

          button.addEventListener(avu.Button.Event.CLICK, function () {
            // pass to custom handler
            if (_this2.options && _this2.options.onBookmark) {
              _this2.options.onBookmark(bookmark.bubbleNode, camera);
            }
          });

          return bookmark;
        }
      }, {
        key: "createClusteredBookmark", value: function createClusteredBookmark(

          flattenCluster, id, visible) {
            var _this3 = this;
          var button = new Bimfish.Viewing.UI.Button(id);

          button.container.classList.add('clustered-canvas-bookmark');
          button.container.innerHTML = Object(_CanvasBookmarkIcons_js__WEBPACK_IMPORTED_MODULE_0__["createClusteredCameraIcon"])();

          setButtonVisible(button, this.isVisible() && visible);

          this.viewer.container.appendChild(button.container);

          var res = _HCluster_js__WEBPACK_IMPORTED_MODULE_2__["default"].ComputeMeanValueForFlattenCluster(flattenCluster);

          var bookmark = {
            marker: button,
            name: id,

            pos: res.center3D,
            currentPosProjected: res.center2D,

            cluster: flattenCluster,

            fadeValue: 0.0,
            hovered: false,

            folded: true
          };


          button.container.addEventListener('mouseenter', function () { _this3.onClusteredBookmarkMouseEnter(bookmark); });
          button.container.addEventListener('mouseleave', function () { _this3.onClusteredBookmarkMouseLeave(bookmark); });
          button.addEventListener(avu.Button.Event.CLICK, function () { _this3.onClusteredBookmarkClicked(bookmark); });

          bookmark.marker.container.style.transform = "translate(".concat(res.center2D.x, "px, ").concat(res.center2D.y, "px)");
          this.clusteredBookmarks.push(bookmark);
        }
      }, {
        key: "deleteBookmark", value: function deleteBookmark(

          bookmark) {
          this.viewer.container.removeChild(bookmark.marker.container);
          this.hideFrustumShape(bookmark);
        }
      }, {
        key: "clearBookmarks", value: function clearBookmarks() {
          var _this4 = this;
          // Cancel any outdated anims or cutplanes
          this.stopSectionBoxAnim();
          this.applySectionBox();

          this.bookmarks.forEach(function (bm) {
            _this4.deleteBookmark(bm);
          });
          this.bookmarks = [];

          this.clusteredBookmarks.forEach(function (bm) {
            _this4.deleteBookmark(bm);
          });
          this.clusteredBookmarks = [];
        }
      }, {
        key: "resetBookmarks", value: function resetBookmarks(

          geomNodes) {
            var _this5 = this;

          this.clearBookmarks();
          if (!geomNodes) {
            return;
          }

          //The bookmarks make use of AECModelData, so we have to make sure we have that loaded.
          av.Document.getAecModelData(geomNodes).then(function () {

            for (var i = 0; i < geomNodes.length; i++) {
              var geomNode = geomNodes[i];
              var bookmark = _this5.createBookmark(geomNode);
              if (bookmark) {
                _this5.bookmarks.push(bookmark);
              }
            }

            _this5.bookmarkData = geomNodes;

            _this5.updateBookmarkPositions();
          });
        }

        // Create bookmarks with correct positions for the current geoOffset
      }, {
        key: "resetGlobalOffset", value: function resetGlobalOffset(globalOffset) {
          this.options.globalOffset = globalOffset;
          this.resetBookmarks(this.bookmarkData);
        }
      }, {
        key: "showFrustumShape", value: function showFrustumShape(

          bookmark) {
          if (bookmark.frustumShape) {
            return;
          }

          bookmark.frustumShape = Object(_CreateFrustumShape_js__WEBPACK_IMPORTED_MODULE_1__["createFrustumShape"])(bookmark.cameraPos, bookmark.dir);
          this.viewer.impl.addOverlay(OverlayName, bookmark.frustumShape);

          bookmark.frustumShape.name = bookmark.bubbleNode.name();

          // Make LMV recompute near/far plane, so that the frustum shape is considered
          // TODO: It would be easier if LMV would do that automatically, but it
          //       updates the camera only when rendering the scene.
          //       => Clarify if we can generally change that.
          this.viewer.impl.updateCameraMatrices();
        }
      }, {
        key: "hideFrustumShape", value: function hideFrustumShape(

          bookmark) {
          if (!bookmark.frustumShape) {
            return;
          }

          this.viewer.impl.removeOverlay(OverlayName, bookmark.frustumShape);
          bookmark.frustumShape = null;
        }

        // Controls the frustum fading. fadeValue is in [0,1]
      }, {
        key: "setFrustumFadeValue", value: function setFrustumFadeValue(bookmark, fadeValue) {
          bookmark.fadeValue = fadeValue;
          if (bookmark.frustumShape) {
            bookmark.frustumShape.setFadeValue(fadeValue);
          }
        }

        // Update fading of the frustum shape based on elpased time in ms.
      }, {
        key: "updateFrustumShapeFading", value: function updateFrustumShapeFading(bookmark, elapsed) {
          var FadeInDurationMs = 500;
          var FadeOutDurationMs = 500;

          var fadingIn = bookmark.hovered && bookmark.fadeValue < 1.0;
          var fadingOut = !bookmark.hovered && bookmark.fadeValue > 0.0;

          if (!fadingIn && !fadingOut) {
            return false;
          }

          // compute amount of fading change (1.0 = full fade)
          var fadeInDelta = elapsed / FadeInDurationMs;
          var fadeOutDelta = elapsed / FadeOutDurationMs;
          var newValue = bookmark.fadeValue + (fadingIn ? fadeInDelta : -fadeOutDelta);

          newValue = THREE.Math.clamp(newValue, 0, 1);
          this.setFrustumFadeValue(bookmark, newValue);

          // HACK: Use css fade instead
          if (bookmark.marker && bookmark.marker._toolTipElement) {
            bookmark.marker._toolTipElement.style.opacity = Math.min(1, 3 * newValue);
          }

          // remove frustums if not used anymore
          if (!bookmark.hovered && bookmark.fadeValue === 0) {
            this.hideFrustumShape(bookmark);
          }

          this.viewer.impl.invalidate(false, false, true);

          return true;
        }
      }, {
        key: "requestTimer", value: function requestTimer() {
          var _this6 = this;
          var _window = this.getWindow();
          this.timerId = _window.requestAnimationFrame(function () { return _this6.onTimer(); });
        }
      }, {
        key: "onTimer", value: function onTimer() {
          var _this7 = this;
          // get elapsed time in ms
          var curTime = performance.now();
          var elapsed = curTime - this.lastTime;
          this.lastTime = curTime;

          // Track whether any frustum-shape fading is going on
          this.isFrustumFading = false;

          this.bookmarks.forEach(function (bookmark) {
            var fading = _this7.updateFrustumShapeFading(bookmark, elapsed);
            _this7.isFrustumFading = _this7.isFrustumFading || fading;
          });

          // Trigger notification if fading stuff is finished
          if (this.isAllDone()) {
            this.waitingCallbacks.forEach(function (p) { return p(); });
            this.waitingCallbacks.length = 0;
          }

          this.requestTimer();
        }

        // Returns an oriented box (THREE.Box3() + attached Matrix4 box.transform)
      }, {
        key: "findSectionBox", value: function findSectionBox(bubbleNode, name) {
          var viewNode = bubbleNode.search({ type: 'view' });

          if (!viewNode.length || viewNode[0].data.name !== name)
            return null;

          var sb = viewNode[0].data.sectionBox;
          var sbt = viewNode[0].data.sectionBoxTransform;

          if (!sb || !sbt)
            return null;

          var sbTransformMatrix = new THREE.Matrix4().fromArray([
            sbt[0], sbt[1], sbt[2], sbt[3],
            sbt[4], sbt[5], sbt[6], sbt[7],
            sbt[8], sbt[9], sbt[10], sbt[11],
            sbt[12], sbt[13], sbt[14], sbt[15]]);


          var box = new THREE.Box3();
          box.min.set(sb[0], sb[1], sb[2]);
          box.max.set(sb[3], sb[4], sb[5]);
          box.transform = new THREE.Matrix4();

          var tf = bubbleNode.getRootNode().getAecModelData().refPointTransformation;
          if (this.options.globalOffset && tf) {
            var offset = this.options.globalOffset;

            var geoTransformMatrix = av.BubbleNode.readMatrixFromArray12(tf);

            // Apply sectionBox rotation (if any), geoRefTransform, and finally the viewer offset.
            // Note that matrices must be multiplied in reverse order.
            box.transform.makeTranslation(-offset.x, -offset.y, -offset.z);
            box.transform.multiply(geoTransformMatrix);
            box.transform.multiply(sbTransformMatrix);
          }

          return box;
        }

        // The overlay scene contains the frustum shapes and is always visible by default. We only hide it temporarily
        // when baking an image for showin ghost floors
      }, {
        key: "setOverlaySceneVisible", value: function setOverlaySceneVisible(visible) {
          // Overlay may be null if this is currently unloaded
          var overlay = this.viewer.impl.overlayScenes[OverlayName];
          var scene = overlay && overlay.scene;
          if (scene) {
            scene.visible = visible;
          }
        }
      }, {
        key: "getFadeExtension", value: function getFadeExtension() {
          return this.viewer.getExtension('Bimfish.CrossFadeEffects');
        }

        // Render models without SectionBox into fading target
      }, {
        key: "showGhosting", value: function showGhosting() {
          var _this8 = this;
          // Ghosting is an optional effect that requires the CrossFade extension. If we don't have it,
          // we omit ghosting, i.e., only apply the cutplanes for SectionBox previous.
          var fadeExt = this.getFadeExtension();
          if (!fadeExt) {
            return;
          }

          // Take control over CrossFade effect. Purpose is to avoid conflicts with other effects based on CrossFade. E.g., if we are
          // still showing ghost-floors from LevelsExtension, LevelsExtension will properly clean them up first.
          fadeExt.acquireControl('CanvasBookmarks', function () { return _this8.stopGhosting(); });

          // If possible, reuse baked ghosting image from previous bookmark
          if (!this.ghostingActive) {
            this.viewer.impl.setCutPlaneSet(CutPlaneSetName); // disable current SectionBox
            this.setOverlaySceneVisible(false); // make sure that we don't bake Frustum shapes into the screenshot
            fadeExt.renderFadingImage(0); // render snapshot into fading target
            this.applySectionBox(this.activeSectionBox); // recover current SectionBox
            this.setOverlaySceneVisible(true); // show overlay scene again (We don't hide it anywhere else, otherwise we would need to save/restore visibility state)
            this.ghostingActive = true;
          } else {
            // Reuse ghosting from before - just make sure that no fadeOut anim is in-progress
            this.stopGhostFadeOut();
          }
          fadeExt.setCrossFadeOpacity(0, 0.3); // overlay full model with ghost opacity
        }
      }, {
        key: "stopGhosting", value: function stopGhosting() {
          if (this.ghostingActive) {
            this.stopGhostFadeOut();
            var fadeExt = this.getFadeExtension();
            fadeExt && fadeExt.releaseFadingImage(0);
            this.ghostingActive = false;
          }
        }
      }, {
        key: "stopGhostFadeOut", value: function stopGhostFadeOut() {
          // skip fade-out animation if in progress
          if (this.ghostFadeAnim) {
            this.ghostFadeAnim.skip();
            this.ghostFadeAnim = null;
          }
        }

        // Fade-out cross-fade target containing the ghosted environment
      }, {
        key: "fadeOutGhosting", value: function fadeOutGhosting() {
          var fadeExt = this.getFadeExtension();
          if (!this.ghostingActive || !fadeExt) {
            // No ghosting active => nothing to do
            return;
          }

          var ghostAlpha = fadeExt.getCrossFadeOpacity(0);
          this.ghostFadeAnim = avp.fadeValue(ghostAlpha, 0.0, 0.5, function (t) { return fadeExt.setCrossFadeOpacity(0, t); });
        }
      }, {
        key: "onBookmarkMouseEnter", value: function onBookmarkMouseEnter(

          bookmark) {
          var sectionBox = this.findSectionBox(bookmark.bubbleNode, bookmark.name);
          if (sectionBox) {
            this.showGhosting();
            this.animateToSectionBox(sectionBox);
          }

          this.showFrustumShape(bookmark);
          bookmark.hovered = true;
        }
      }, {
        key: "onBookmarkMouseLeave", value: function onBookmarkMouseLeave(

          bookmark) {
          this.animateToSectionBox(null);
          this.fadeOutGhosting();
          bookmark.hovered = false;
        }
      }, {
        key: "onClusteredBookmarkMouseEnter", value: function onClusteredBookmarkMouseEnter(

          bookmark) {
          bookmark.hovered = true;
        }
      }, {
        key: "onClusteredBookmarkMouseLeave", value: function onClusteredBookmarkMouseLeave(

          bookmark) {
          bookmark.hovered = false;
        }
      }, {
        key: "onClusteredBookmarkClicked", value: function onClusteredBookmarkClicked(

          bookmark) {
          // TODO:
          //   - Zoom + zoom level computation
          //   - "Too many" clustered bookmarks -> (n+1) icon should be "..."

          if (bookmark.folded) {
            var _rotate = function _rotate(vector, center, angle) {
              var c = Math.cos(angle);
              var s = Math.sin(angle);

              var x = vector.x - center.x;
              var y = vector.y - center.y;

              vector.x = x * c - y * s + center.x;
              vector.y = x * s + y * c + center.y;
            };

            var n = bookmark.cluster.length;
            var alpha = Math.round(360.0 / n);

            var center = new THREE.Vector2(bookmark.currentPosProjected.x, bookmark.currentPosProjected.y);

            var start = new THREE.Vector2(center.x, center.y + 35);

            for (var i = 0; i < n; ++i) {
              var bm = bookmark.cluster[i];

              var current = start.clone();
              _rotate(current, center, i * alpha * Math.PI / 180.0);

              bm.currentPosProjected.x = current.x;
              bm.currentPosProjected.y = current.y;

              bm.marker.container.style.transform = "translate(".concat(current.x, "px, ").concat(current.y, "px)");
              setButtonVisible(bm.marker, true);
            }

            bookmark.marker.container.classList.add('declustered-canvas-bookmark');
          } else {
            bookmark.cluster.forEach(function (bm) {
              setButtonVisible(bm.marker, false);
            });

            bookmark.marker.container.classList.remove('declustered-canvas-bookmark');
          }

          bookmark.folded = !bookmark.folded;
        }
      }, {
        key: "debounceBookmarksVisibility", value: function debounceBookmarksVisibility() {
          if (this.changeBookmarksVisibilityTimeout) {
            clearTimeout(this.changeBookmarksVisibilityTimeout);
          }

          this.changeBookmarksVisibilityTimeout = setTimeout(this.changeBookmarksVisibility, 100);
        }
      }, {
        key: "changeBookmarksVisibility", value: function changeBookmarksVisibility() {
          this.updateBookmarkPositions();
        }
      }, {
        key: "updateBookmarkPositions", value: function updateBookmarkPositions() {
          var _this9 = this;
          if (!this.isVisible()) {
            return;
          }

          this.bookmarks.forEach(function (bookmark) {
            // Use cropBox center (if available) or camera position to choose label position
            var sBox = bookmark.bubbleNode.sectionBox;
            var pos3D = sBox ? sBox.center() : bookmark.pos;

            bookmark.currentPos3D = pos3D;

            // In-canvas coordinates
            var pos2D = _this9.project(pos3D);
            pos2D.x -= bookmark.anchorX;
            pos2D.y -= bookmark.anchorY;

            bookmark.currentPosProjected = new THREE.Vector3(pos2D.x, pos2D.y, pos2D.z);
            bookmark.marker.container.style.transform = "translate(".concat(pos2D.x, "px, ").concat(pos2D.y, "px)");
          });

          var clusters = this._clusteringEnabled ? this.hcluster.createClusters(this.bookmarks) : [];
          this.updateClusteredBookmarks(clusters);
        }
      }, {
        key: "updateClusteredBookmarks", value: function updateClusteredBookmarks(

          clusters) {
            var _this10 = this;
          // delete all "cluster" bookmarks since we create them all the time (by design), hiding will not really work
          this.clusteredBookmarks.forEach(function (bookmark) {
            _this10.deleteBookmark(bookmark);
          });
          this.clusteredBookmarks = [];

          // hide all bookmarks and reset "clustered" state
          this.bookmarks.forEach(function (bookmark) {
            setButtonVisible(bookmark.marker, false);
          });

          var floorSelector = this._getFloorSelector();
          var currentLevel = floorSelector && floorSelector.currentFloor;
          if (currentLevel !== undefined) {
            return;
          }

          var visibleBookamrks = this.bookmarks.filter(this._filterOutInvisibleBookmark);
          visibleBookamrks.forEach(function (bookmark) {
            bookmark.clustered = false;
            setButtonVisible(bookmark.marker, true);
          });

          for (var i = 0; i < clusters.length; i++) {
            var c = clusters[i];

            if (c.size > 1) {
              (function () {
                var flCluster = _HCluster_js__WEBPACK_IMPORTED_MODULE_2__["default"].FlattenCluster(c);

                var clusterBmVisible = false;
                flCluster.forEach(function (bookmark) {
                  bookmark.clustered = true;
                  if (!clusterBmVisible && bookmark.marker.isVisible()) {
                    // if one of the included bookmarks is visible, mark the cluster bookmark as visible one
                    clusterBmVisible = true;
                  }
                  // now, mark the included bookmark as invisible one
                  setButtonVisible(bookmark.marker, false);
                });

                // IDs cannot start with some number
                _this10.createClusteredBookmark(flCluster, "c-".concat(flCluster[0].bubbleNode.data.viewableID), clusterBmVisible);
              })();
            }
          }
        }
      }, {
        key: "project", value: function project(

          position) {
          var containerBounds = this.viewer.navigation.getScreenViewport();
          var p = new THREE.Vector3().copy(position);

          var matrix = new THREE.Matrix4();
          matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

          p.applyProjection(matrix);

          return new THREE.Vector3(
            Math.round((p.x + 1) / 2 * containerBounds.width),
            Math.round((-p.y + 1) / 2 * containerBounds.height),
            p.z);

        }
      }, {
        key: "load", value: function load() {
          
          this.viewer.prefs.add(VISIBILITY_PROP, true);

          this.viewer.addEventListener(av.CAMERA_CHANGE_EVENT, this.cameraMovedCB);

          var floorSelector = this._getFloorSelector();
          if (floorSelector) {
            floorSelector.addEventListener(Bimfish.AEC.FloorSelector.CURRENT_FLOOR_CHANGED, this.levelChangedCB);
          }

          this.viewer.addEventListener(av.EXTENSION_LOADED_EVENT, this.extensionLoadedCB);

          // handle the case when this extension is loaded after LevelsExtension is loaded,
          // without making this extension known to LevelsExtension
          this.updateBookmarkPositions();

          this.viewer.impl.createOverlayScene(OverlayName);

          // trigger timer-calls for fading animations
          this.lastTime = performance.now();
          this.requestTimer();

          if (!this.updateSettingsPanel) {
            //We need to connect this to an event that happens after the settings panel has been
            //create by the load sequence. The toolbar created event is serving that purpose.
            this.updateSettingsPanel = this.configureSettings.bind(this);
            this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.updateSettingsPanel);
          }

          return true;
        }
      }, {
        key: "unload", value: function unload() {
          this.clearBookmarks();

          this.viewer.impl.removeOverlayScene(OverlayName);

          this.viewer.removeEventListener(av.CAMERA_CHANGE_EVENT, this.cameraMovedCB);

          var floorSelector = this._getFloorSelector();
          if (floorSelector) {
            floorSelector.removeEventListener(Bimfish.AEC.FloorSelector.CURRENT_FLOOR_CHANGED, this.levelChangedCB);
          }

          this.viewer.removeEventListener(av.EXTENSION_LOADED_EVENT, this.extensionLoadedCB);

          // Stop timer for position updates
          if (this.timerId) {
            var _window = this.getWindow();
            _window.cancelAnimationFrame(this.timerId);
            this.timerId = null;
          }

          if (this.updateSettingsPanel) {
            this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.updateSettingsPanel);
            this.updateSettingsPanel = null;
          }

          return true;
        }
      }, {
        key: "applySectionBox", value: function applySectionBox(

          box) {
          this.activeSectionBox = box;

          // No box => clear cutplanes
          if (!box) {
            this.viewer.impl.setCutPlaneSet(CutPlaneSetName);
            return;
          }

          var planes = avp.SceneMath.box2CutPlanes(box, box.transform);
          this.viewer.impl.setCutPlaneSet(CutPlaneSetName, planes);
        }

        // get bbox of all visible models
      }, {
        key: "getModelBox", value: function getModelBox() {
          var mq = this.viewer.impl.modelQueue();
          var models = mq.getModels();

          var box = new THREE.Box3();
          for (var i = 0; i < models.length; i++) {
            box.union(models[i].getBoundingBox());
          }

          return box;
        }
      }, {
        key: "stopSectionBoxAnim", value: function stopSectionBoxAnim() {
          if (this.sectionBoxAnim) {
            this.sectionBoxAnim.stop();
            this.sectionBoxAnim = null;
          }
        }
      }, {
        key: "animateToSectionBox", value: function animateToSectionBox(

          newBox) {
            var _this11 = this;
          // Nothing to animate
          if (!newBox && !this.activeSectionBox) {
            return;
          }

          // Don't allow overlapping animations
          this.stopSectionBoxAnim();

          var CutPlaneAnimInSeconds = 0.5;

          // Start at latest SectionBox state or with the whole model
          this.animStartBox = this.activeSectionBox ? cloneBox(this.activeSectionBox) : cloneBox(this.getModelBox());
          this.animEndBox = newBox ? cloneBox(newBox) : cloneBox(this.getModelBox());

          // Set target box
          this.sectionBox = newBox;

          // interpolated box used during anim
          var tmpBox = new THREE.Box3();
          tmpBox.transform = new THREE.Matrix4();

          var onUpdate = function onUpdate(t) {
            t = avp.smootherStep(t);
            lerpBoxes(_this11.animStartBox, _this11.animEndBox, t, tmpBox);
            _this11.applySectionBox(tmpBox);
          };

          var onFinished = function onFinished() {
            _this11.applySectionBox(_this11.sectionBox);
            _this11.sectionBoxAnim = null;
          };

          this.sectionBoxAnim = avp.fadeValue(0, 1, CutPlaneAnimInSeconds, onUpdate, onFinished);
        }
      }, {
        key: "enableClustering", value: function enableClustering(

          value) {
          if (this._clusteringEnabled !== value) {
            this._clusteringEnabled = value;
            this.updateClusteredBookmarks([]);
          }
        }
      }, {
        key: "setClusteringThreshold", value: function setClusteringThreshold(

          value) {
          if (this._clusteringThreshold !== value) {
            this._clusteringThreshold = value;
            this.hcluster.setThreshold(value);
            this.updateClusteredBookmarks([]);
          }
        }

        // Returns true if there are no active transitions, i.e., state is stable and doesn't vary based on timing anymore.    
      }, {
        key: "isAllDone", value: function isAllDone() {
          // Note: Some aspects are not considered yet, e.g., css-based fading and debounced visibility. For
          //       now, we only address everything that would introduce test instabilities otherwise.
          var sectionBoxAnimActive = this.sectionBoxAnim && this.sectionBoxAnim.isRunning;
          var visChangePending = this.bookmarks.some(function (b) { return b.marker && b.marker.visiblityChangePending; });
          return !sectionBoxAnimActive && !this.isFrustumFading && !visChangePending;
        }

        // Returns a promise that resolves as soon as isAllDone() returns true.
      }, {
        key: "waitForAllDone", value: function waitForAllDone() {
          var _this12 = this;

          // Update frustum-fading to check whether there are any changes to process
          this.onTimer();

          if (this.isAllDone()) {
            return Promise.resolve();
          }

          return new Promise(function (resolve) {
            _this12.waitingCallbacks.push(resolve);
          });
        }
      }, {
        key: "_filterOutInvisibleBookmark", value: function _filterOutInvisibleBookmark(

          bm) {
          var vp = this.viewer.navigation.getScreenViewport();

          if (bm.currentPosProjected.x < 0 || bm.currentPosProjected.x > vp.width) {
            return false;
          }

          if (bm.currentPosProjected.y < 0 || bm.currentPosProjected.y > vp.height) {
            return false;
          }

          var viewingDirection = this.camera.target.clone().sub(this.camera.position);
          var bookmarkDirection = bm.pos.clone().sub(this.camera.position);
          return viewingDirection.dot(bookmarkDirection) > 0;
        }
      }, {
        key: "onLevelChanged", value: function onLevelChanged()

/*event*/ {
          this.updateBookmarkPositions();
        }
      }, {
        key: "onExtensionLoaded", value: function onExtensionLoaded(

          event) {
          if (event.extensionId === LEVEL_EXT) {
            this.updateBookmarkPositions();
          }
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
          panel.addLabel(navTab, "Location Icons");

          // add toggle to the hypermodeling tab of the viewer settings
          if (panel && !panel.showLocationIconsChkBoxId) {
            panel.showLocationIconsChkBoxId = panel.addCheckbox(
              navTab,
              "Show location icons",
              "Toggles availability of the location icons when looking at the project model",
              true,
              this.onVisibilityChangedCB,
              VISIBILITY_PROP);

          }
        }
      }, {
        key: "_getFloorSelector", value: function _getFloorSelector() {
          var levelExt = this.viewer.getExtension(LEVEL_EXT);
          return levelExt && levelExt.floorSelector;
        }
      }]); return CanvasBookmarkExtension;
    }(av.Extension);


  namespace.CanvasBookmarkExtension = CanvasBookmarkExtension;

  Bimfish.Viewing.theExtensionManager.registerExtension(myExtensionName, CanvasBookmarkExtension);

  /***/
}),