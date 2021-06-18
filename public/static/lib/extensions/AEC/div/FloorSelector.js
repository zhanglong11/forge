
/***/ "./extensions/AEC/levels/FloorSelector.js":
/*!************************************************!*\
  !*** ./extensions/AEC/levels/FloorSelector.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return FloorSelector; });
/* harmony import */ var _FloorSelectorFilter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FloorSelectorFilter.js */ "./extensions/AEC/levels/FloorSelectorFilter.js");
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var av = Bimfish.Viewing;
  var avp = Bimfish.Viewing.Private;
  var namespace = BimfishNamespace('Bimfish.AEC');


  // FloorSelector provides graphics effects to be used by UI for floor selection.
  //
  // This includes:
  //
  //  - Setting cutplanes accordingly when a floor is selected.
  //
  //  - Animated transitions if the selected floor changes.
  //
  //  - Applying mouse-over highlighting of floors - to be used when hovering over a floor button
  //
  //  - "Ghost-Floors": By default, we render selected floors only. If the mouse enters the floor panel, we
  //     also fade-in the other floors, but with strongly reduced opacity. (+ fade-out on mouse leave)
  //
  //
  // How to use it:
  //
  //  1. Create a FloorSelector by passing the viewer to the ctor.
  //
  //  2. Before using the FloorSelector, you have to provide floor data that you get from the Revit metadata
  //     json file. (see setFloorData comment)
  //
  //  3. Connect events for hovering over floor selector UI panel:
  //     - Connect mouseover  to floorSelector.enterHoverMode()
  //     - Connect mouseleave to floorSelector.existHoverMode()
  //
  //  4. Connect events for hovering over floor selection buttons: For each floor button...
  //     - Connect mouseover  to floorSelector.rollOverFloor(floorIndex) - floorIndex must be the index into the floor array (see setFloorData)
  //     - Connect mouseleave to floorSelector.rollOverFloor()
  //
  //  5. Connect floor selection button: For each floor button,
  //     connect button mousedown to floorSelector.selectFloor(floorIndex, true)
  //
  //  6. If the set of visible models has changed
  //
  //  7. When discarding the FloorSelector (while keeping the Viewer alive), call FloorSelector dtor.
  //
  // How to enable the optional filtering of objects by dbIds per model provided by the AECModelData.json on level selection?
  //
  //  1. You have to provide floor filter data containing a Map of dbIds per model. The key has to be the model version URN (see setFloorFilterData).
  //
  //     Example on how to set the floor filter data:
  //
  //     const modelsDbIds = new Map();
  //     modelsDbIds.set(model, [1, 2, 3, 4]);
  //     var floorFilterData = {
  //         modelsDbIds: modelsDbIds
  //     };
  //
  //     floorSelector.setFloorFilterData(floorFilterData);
  //
  // How to control the calculated lower level boundary value by defining the levelHeightFactor factor? The factor is multiplied with the level height
  // and added to the level minZ value. This newly calculated minZ value defines the lower level boundary used to filter the Floor and Ceiling elements.
  //
  //     Example on how to set the floor filter data with a levelHeightFactor:
  //
  //     const modelsDbIds = new Map();
  //     modelsDbIds.set(model, [1, 2, 3, 4]);
  //     var floorFilterData = {
  //         modelsDbIds: modelsDbIds,
  //         levelHeightFactor: 0.6 // Allowed values have to be within 0-1.
  //     };
  //
  //     floorSelector.setFloorFilterData(floorFilterData);
  //
  // Technical requirements/restrictions to be aware of:
  //
  //  - Cross-Fading Support: FloorSelector uses LMV render target fading for some effects. For this, it activates
  //    cross-fading support in LMV (if not active already). This requires 2 extra color targets, i.e.
  //    consumes some additional GPU-side memory.
  //
  //  - Camera Movement: The camera should not be moving while using the floor selector.
  //    This is because we partially use static images for the fading effects.
  //    If the user moves the camera, we instantly switch off the ghost floors.
  //
  //  - SAO opacity: FloorSelector needs to temporarily hide SAO. For this, we have to overwrite SAO opacity
  //    and recover it later. This requires that the SAO opacity is not changed in the meantime
  //    while using the FloorSelector. Otherwise, it will cause a warning and may cause visual
  //    artifacts.



  // Time in seconds to fade in/out ghosted floors when hovering over the floor selector panel
  var GhostFloorFadingTime = 0.5;

  // Opacity for ghost floors when fade-in is finished.
  var MaxGhostFloorOpacity = 0.2;

  // These should actually be infinity and -infinity, but since the values are passed to a shader,
  // we have to use large finite values instead. Setting as cutplane elevations actually corresponds to
  // switching cutplanes off. But, changes the number of cutplanes triggers expesnive shader recompiles.
  var MaxZLimit = 1e20;
  var MinZLimit = -MaxZLimit;

  // Internally used enum values for state management
  var FloorRenderMode = {

    // mouse is hovering over a floor button
    Hovering: 0,

    // new floor has been selected and anim is running
    Transition: 1,

    // default rendering
    Off: 2
  };


  // Reserved floor-index constant to select all floors at once.
  var AllFloors = -1;
  var NoFloor = undefined;

  // Used for setCutPlane calls to lmv. This ensures that FloorSelector controls its own cutplanes,
  // which is independent of other cutplane changes like from SectionTool.
  var CutPlaneSetName = 'Bimfish.AEC.FloorSelector'; var

    FloorSelector = /*#__PURE__*/function () {

      // @param {Viewer3D} viewer
      function FloorSelector(viewer) {
        _classCallCheck(this, FloorSelector);

        av.EventDispatcher.prototype.apply(this);

        this._viewer = viewer;
        this._renderer = viewer.impl.renderer();

        // Make sure that ghost-floors are switched off as soon as the user starts navigating.
        // This is needed because the selected floor is just a static image when ghost-floors are shown.
        this._cameraMovedCB = this._interruptFading.bind(this);
        viewer.addEventListener(av.CAMERA_CHANGE_EVENT, this._cameraMovedCB);

        // Stop panel-hover effect on viewer-resize: Ghost-floors use a static image overlay that becomes unusable
        // if the target size changes.
        this._viewerResizeCB = this._onViewerResized.bind(this);
        viewer.addEventListener(av.VIEWER_RESIZE_EVENT, this._viewerResizeCB);

        // If SAO is switched off, we have to switch off roll-over highlighting too.
        this._renderOptionsChangedCB = this._onRenderOptionsChanged.bind(this);
        viewer.addEventListener(av.RENDER_OPTION_CHANGED_EVENT, this._renderOptionsChangedCB);

        // callback for the floor selection filtering
        this._floorSelectionFilterToBeUpdated = this._runFloorSelectorFilterEventHandler.bind(this);
        viewer.addEventListener(av.MODEL_ADDED_EVENT, this._floorSelectionFilterToBeUpdated);
        viewer.addEventListener(av.OBJECT_TREE_CREATED_EVENT, this._floorSelectionFilterToBeUpdated);

        // callback for the unloading of disabled models
        this._modelUnloadingCB = this._runModelUnloadingEventHandler.bind(this);
        viewer.addEventListener(av.MODEL_UNLOADED_EVENT, this._modelUnloadingCB);

        // {Object[]} Contains the floor data. see setFloorData() comment.
        this._floors = [];

        // current state (hover/transition/off)
        this._currentMode = FloorRenderMode.Off;
        this._hovering = false; // used to track hovering state while in transition mode

        // current floor section (if cutplanes are active)
        this._floorSectionMin = undefined;
        this._floorSectionMax = undefined;

        // Determine z-range for "all-floors"
        // We determine that dynamically from the currently visible models.
        // Note that we need this value also for cutplane transitions - so we cannot
        // simply choose something arbitrarily far outside.
        this._zMinAllModels = undefined;
        this._zMaxAllModels = undefined;

        // {AnimControl} Needed to interrupt a running cutplane animation (see moveFloors)
        this._floorAnim = null;

        // {AnimControl} Needed to interrupt a runnign fade-in/out anim for ghost-floors
        this._fadeAnim = null;

        // Opacity of the render target that shows floors that are currently not selected ("ghost floors")
        // Always 0.0 if the extra target for ghost floors is not used.
        this._ghostFloorOpacity = 0.0;

        this._currentMode = FloorRenderMode.Off;

        // {number|undefined} index of selected floor (or undefined if no floor is selected)
        this._currentFloor = undefined;

        // We render ghost-floors without AO, because AO cannot be smoothly faded out with them.
        // To activate AO, we need to 'backup' the current AO opacity and recover it later.
        this._aoVisible = true;
        this._aoOpacity = undefined; // if ao is blocked, we store the original ao opacity here to recover it later.

        this._floorSelectorFilter = new _FloorSelectorFilter_js__WEBPACK_IMPORTED_MODULE_0__["default"](this._viewer);
        this._floorFilterData = undefined;

        // Indicates if we are currently using mouse-over highlighting for a floor.
        this._floorRollOverActive = false;

        // If disabled, make sure that cutplanes keep unset. This is needed to avoid side-effects on 2D views.
        this.enabled = true;

        // Maximum time in ms that we allow for rendering offline images for fading effects.
        // By default (undefined), we use the frameBudget of regular rendering.
        this.offscreenRenderBudget = undefined;
      } _createClass(FloorSelector, [{
        key: "dtor", value: function dtor() {
          if (this._viewer) {
            this._viewer.removeEventListener(av.CAMERA_CHANGE_EVENT, this._cameraMovedCB);
            this._viewer.removeEventListener(av.VIEWER_RESIZE_EVENT, this._viewerResizeCB);
            this._viewer.removeEventListener(av.RENDER_OPTION_CHANGED_EVENT, this._renderOptionsChangedCB);
            this._viewer.removeEventListener(av.OBJECT_TREE_CREATED_EVENT, this._floorSelectionFilterToBeUpdated);
            this._viewer.removeEventListener(av.MODEL_ADDED_EVENT, this._floorSelectionFilterToBeUpdated);
            this._viewer.removeEventListener(av.MODEL_UNLOADED_EVENT, this._modelUnloadingCB);
            this._viewer = null;
          }
        }

        // -----------------
        // --- Main API ----
        // -----------------

        // Before selecting any floors, setFloorData() must be called to provide the elevation ranges
        // of all available floors.
        //  @param {Object[]} floors - data about available floors, each item f must contain two finite floats f.zMin < f.zMax
      }, {
        key: "resetState",









        // sets back level isolation, selection filter and the floors.
        value: function resetState() {
          // we have to clear the settings
          this._floors = [];
          this._selectFloor(NoFloor);
          this._clearFloorSection();
          this._floorSelectorFilter.clearFilter();
        }

        // Before any objects can be filtered using the FloorSelectorFilter, setFloorFilterData() must be called to
        // provide the array of Floor and Ceiling dbIds per model.
        //  @param {Object[]} floorFilterData - A floor filter data object containing an array of dbIds per model.
      }, {
        key: "enterHoverMode",







        // Fades in the ghost-floors.
        // Triggered when floor selection begins, i.e., mouse is entering floor selector panel.
        value: function enterHoverMode() {

          // make sure that the ghosted floors are in a static image,
          // so that we can move the solid floor
          if (this._currentMode !== FloorRenderMode.Transition) {
            this._setMode(FloorRenderMode.Hovering);
          }

          // track hovering state - so that we can recover it after transitions
          this._hovering = true;
        }

        // Fades out the ghost floors.
        // Triggered when floor selection ends, i.e., mouse is leaving the floor selector panel.
      }, {
        key: "exitHoverMode", value: function exitHoverMode() {

          // If a floor-transition is running, we only track the hover state and
          // set the mode when the transition has finished.
          if (this._currentMode !== FloorRenderMode.Transition) {
            this._setMode(FloorRenderMode.Off);
          }
          this._hovering = false;

          // make sure that no spatial filter for mouse-over highlight is set anymore, so that we don't
          // have side-effects on subsequent object selection.
          this._setSpatialFilterForRollOver();
        }
      }, {
        key: "_getFadeExtension", value: function _getFadeExtension() {
          return this._viewer.getExtension('Bimfish.CrossFadeEffects');
        }

        // Ghosted display of inactive floors on panel hover is only supported if CrossFadeEffects extension is loaded
      }, {
        key: "_ghostFloorsEnabled", value: function _ghostFloorsEnabled() {
          return Boolean(this._getFadeExtension());
        }

        // Select for which floor rollOver highlighting is shown.
        //   @param {number} [floorIndex] must be either
        //                                a) a valid index into this.floors
        //                                b) a reserved constant (FloorSelector.AllFloors or FloorSelector.NoFloor)
      }, {
        key: "rollOverFloor", value: function rollOverFloor(floorIndex) {

          // If we don't show ghost-floors, roll-over highlighting does not make much sense if only 1 floor is visible anyway.
          // It just looks confusing, because occasionally it would only be visible for the selected floor and some parts of others
          // that overlap the z-range a bit.
          var enabled = this._ghostFloorsEnabled() || this._currentFloor === NoFloor;

          // rollOver highlight is only possible if SAO is enabled and supported.
          var supported = this._renderer.spatialFilterForRollOverSupported();
          if (floorIndex === undefined || !supported || !enabled) {

            // switch off floor highlight
            this._setSpatialFilterForRollOver();
            this._renderer.rolloverObjectId(0);
            return;
          }

          // Activate roll-over highlighting for all objects
          this._renderer.rolloverObjectId(1);

          // restrict highlighting to floor range unless all floors are selected.
          this._setSpatialFilterForRollOver(floorIndex);

          // TODO: Clarify why this call is needed. It should actually not required to re-render here.
          this._viewer.impl.invalidate(false, true, true);
        }

        // Sets the currently visible floor.
        //  @param {number}   [floorIndex]    A valid index into the floor data array (see setFloors) selects a single floor.
        //                                    FloorSelector.NoFloor discards the floor selection => all floors visible.
        //  @param {bool}     [useTransition] If true, a short animation is used to morph between previous and new floor
        //  returns false in case no selection cannot be performed
      }, {
        key: "selectFloor", value: function selectFloor(floorIndex, useTransition) {

          if (!this.floorSelectionValid(floorIndex)) {
            return;
          }

          if (useTransition) {
            this._moveToFloor(floorIndex);
          } else {
            this._selectFloor(floorIndex);
          }

          this._runFloorSelectorFilter();

          // If no ghosting is used, we disable rollOver highlighting if only a single floor is visible.
          if (!this._ghostFloorsEnabled()) {
            this.rollOverFloor();
          }

          this.fireEvent({ type: FloorSelector.CURRENT_FLOOR_CHANGED, levelIndex: floorIndex });
        }

        // Gets the index of the current selected floor or FloorSelector.NoFloor
      }, {
        key: "floorSelectionValid",



        // Returns whether a floorSelection can be performed with the specified floor
        // checks for valid value, whether floorData is available, the floor is already selected
        // and whether the floor is within the expected range.
        value: function floorSelectionValid() {
          var newFloor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NoFloor;
          // force boolean
          return !!((Number.isInteger(newFloor) || newFloor === NoFloor) && // not a valid value
            this.floorData && this.floorData.length !== 0 // has no floor data
            && this.currentFloor !== newFloor // newFloor floor is not selected
            && (newFloor === NoFloor ||
              newFloor >= 0 || this.floorData.length > newFloor)); // new floor is in range;
        }

        // returns true if a dbId is either hidden by FloorSelectorFilter or fully outside the cutplanes
      }, {
        key: "isVisible", value: function isVisible(model, dbId) {

          // reused tmp variable
          if (!this._tmpNodeBox) {
            this._tmpNodeBox = new Float32Array(6);
          }

          // Determine zMin/zMax to ceck against. We could use _floorSectionMin/Max. But this would
          // make this function depending on current animation state. Since we don't want to do permanent
          // filter-updates during animations, we use currentFloor instead, which represents the target state - independent of animations.
          var floor = this._floors[this._currentFloor];
          if (floor === NoFloor) {
            // No floor selected => Nothing hidden
            return true;
          }

          var instanceTree = model.getInstanceTree();
          if (!instanceTree) {
            // If there is not instance tree, FloorSelectorFilter would have warned already if a floor was selected.
            return true;
          }

          // get zMin/zMax for this node
          var nodeBox = this._tmpNodeBox;
          instanceTree.getNodeBox(dbId, nodeBox);
          var nodeBoxZMin = nodeBox[2];
          var nodeBoxZMax = nodeBox[5];

          // Node is hidden if...
          //  a) outside the level's cutplanes, or
          //  b) hidden by levels filter
          var outsideCutplane = nodeBoxZMin > floor.zMax || nodeBoxZMax < floor.zMin;
          return !outsideCutplane && this._floorSelectorFilter.isVisible(model, dbId);
        }
      }, {
        key: "setEnabled", value: function setEnabled(

          enabled) {
          this.enabled = enabled;
          this._applySelectedFloorSection();
        }

        // ------------------------
        // --- Internal methods ---
        // ------------------------
      }, {
        key: "_stopFloorAnim", value: function _stopFloorAnim() {
          if (this._floorAnim) {
            this._floorAnim.stop();
            this._floorAnim = null;
          }
        }
      }, {
        key: "_stopFadeAnim", value: function _stopFadeAnim() {
          if (this._fadeAnim) {
            this._fadeAnim.stop();
            this._fadeAnim = null;
          }
        }
      }, {
        key: "_leaveHoverMode", value: function _leaveHoverMode() {

          var fadeExt = this._getFadeExtension();
          if (!fadeExt) {
            // Nothing todo if ghosting effect is not used.
            return;
          }

          // release any baked images
          fadeExt.releaseFadingImage(0);
          fadeExt.releaseFadingImage(1);

          // make sure that model is rendered into default color target
          fadeExt.setModelTargetIndexForAll(undefined);

          // apply cutplanes according to currently selected floor
          this._applySelectedFloorSection();

          // we are now rendering real floors again,
          // so that we can switch SAO on again.
          this._setAOVisible(true);
        }

        // When rendering ghost-floors, the static part is always a static image.
        // Therefore, we have to skip the fading if the user moves the camera.
      }, {
        key: "_interruptFading", value: function _interruptFading() {

          // If we just left hover-mode, but the floors did not finish to fade out yet,
          // stop the anim and finish it immediately.
          if (!this._hovering && this._fadeAnim && this._fadeAnim.isRunning) {
            this._stopFadeAnim();
            this._leaveHoverMode();
          }
        }
      }, {
        key: "_onViewerResized", value: function _onViewerResized() {
          // Stop any image-based hovering effects immedately, because the baked ghost-floor image has incorrect size now.
          this._stopFadeAnim();
          this._leaveHoverMode();

          // Restart hovering effect if mouse is still on the panel. Now using the new render target size.
          if (this._hovering) {
            this.enterHoverMode();
          }
        }
      }, {
        key: "_onRenderOptionsChanged", value: function _onRenderOptionsChanged() {
          // Make sure that we stop using roll-over-floor highlight if the depth
          // target is not available anymore.
          if (this._floorRollOverActive && !this._renderer.spatialFilterForRollOverSupported()) {
            this.rollOverFloor();
          }
        }

        // Get array of all visible models
      }, {
        key: "_getVisibleModels", value: function _getVisibleModels() {
          var mq = this._viewer.impl.modelQueue();
          return mq.getModels();
        }

        // Updates min/max limits for cutplane z-level, based on the bboxes of all visible models
      }, {
        key: "_updateZLimits", value: function _updateZLimits() {
          var models = this._getVisibleModels();

          this._zMinAllModels = MaxZLimit;
          this._zMaxAllModels = MinZLimit;
          for (var i = 0; i < models.length; i++) {
            var model = models[i];
            var box = model.getBoundingBox();

            this._zMinAllModels = Math.min(box.min.z, this._zMinAllModels);
            this._zMaxAllModels = Math.max(box.max.z, this._zMaxAllModels);
          }

          // make sure the range is valid also when no models are available
          if (this._zMinAllModels > this._zMaxAllModels) {
            this._zMinAllModels = MinZLimit;
            this._zMaxAllModels = MaxZLimit;
          }
        }
      }, {
        key: "_setAOVisible", value: function _setAOVisible(

          visible) {
          if (visible === this._aoVisible) {
            return;
          }
          this._aoVisible = visible;

          var blendPass = this._renderer.getBlendPass();

          var newOpacity = 0.0;
          if (!visible) {
            // ao switched off => backup original ao opacity
            this._aoOpacity = blendPass.uniforms['aoOpacity'].value;
          } else {

            // Opacity should be 0. Any other value indicates that it has been changed from
            // outside while ao was hidden by floor selector.
            var curOpacity = blendPass.uniforms['aoOpacity'].value;
            if (curOpacity !== 0.0) {
              console.warn('ao opacity should not be changed while FloorSelector is in use.');
            }

            // ao switched on => recover original ao opacity
            newOpacity = this._aoOpacity;
          }

          this._renderer.setAOOptions(this._renderer.getAORadius(), this._renderer.getAOIntensity(), newOpacity);
        }

        // @param {number} val - float in [0,1]
      }, {
        key: "_setGhostFloorOpactiy", value: function _setGhostFloorOpactiy(val) {

          // ghost-floors are always rendered into extra target 1
          var fadeExt = this._getFadeExtension();
          fadeExt && fadeExt.setCrossFadeOpacity(1, this._ghostFloorOpacity);

          this._ghostFloorOpacity = val;

        }

        // Apply/Remove spatial filter that restricts rollOver highlighting to a single floor
        //  @param {number} If floorIndex is a valid index into this.floors, highlighting is restricted to that floor.
        //                  Otherwise, the spatial filter is switched off.
      }, {
        key: "_setSpatialFilterForRollOver", value: function _setSpatialFilterForRollOver(floorIndex) {

          var filter = undefined;
          var floor = this._floors[floorIndex];

          var createSpatialFilter = function createSpatialFilter(zMin, zMax) {
            // Define filter to restrict rollOver highlighting to floor elevation range
            return 'bool spatialFilter(vec3 worldPos) { return (worldPos.z >= float(' + zMin + ') && worldPos.z <= float(' + zMax + ')); }';
          };

          if (floor) {
            filter = createSpatialFilter(floor.zMin, floor.zMax);
          } else if (floorIndex === FloorSelector.AllFloors) {
            filter = createSpatialFilter(this._zMinAllModels, this._zMaxAllModels);
          }

          this._renderer.setSpatialFilterForRollOver(filter);

          // If spatial filter is defined, make sure that ghost floors are always rendered to depth target.
          // Otherwise, the spatial filter for roll-over highlighting does not work.
          var fadeExt = this._getFadeExtension();
          fadeExt && fadeExt.crossFade.setSaoHeuristicEnabled(!filter);

          this._floorRollOverActive = !!filter;
        }
      }, {
        key: "_applyFloorSection", value: function _applyFloorSection(

          zMin, zMax) {

          // Do not allow any cutplane when disabled
          if (!this.enabled) {
            this._viewer.impl.setCutPlaneSet(CutPlaneSetName, planes);
            return;
          }

          // reset the defined z values to the minimum in case the value is not specified
          if (!Number.isFinite(zMin)) {
            zMin = MinZLimit;
          }
          if (!Number.isFinite(zMax)) {
            zMax = MaxZLimit;
          }


          var planes = [new THREE.Vector4(0, 0, -1, zMin), new THREE.Vector4(0, 0, 1, -zMax)];
          this._viewer.impl.setCutPlaneSet(CutPlaneSetName, planes);
        }

        // Set cut plane according to currently selected floor
      }, {
        key: "_applySelectedFloorSection", value: function _applySelectedFloorSection() {

          // If no floor section is active, set cutplanes to maximum range.
          // Doing this instead of clearing them avoids the repeated shader recompile
          var zMin = this._floorSectionMin !== undefined ? this._floorSectionMin : MinZLimit;
          var zMax = this._floorSectionMax !== undefined ? this._floorSectionMax : MaxZLimit;
          this._applyFloorSection(zMin, zMax);
        }
      }, {
        key: "_setFloorSection", value: function _setFloorSection(

          minElev, maxElev) {
          this._floorSectionMin = isNaN(minElev) ? undefined : minElev;
          this._floorSectionMax = isNaN(maxElev) ? undefined : maxElev;
          this._applySelectedFloorSection();
        }

        // Temporarily disable floor section cut planes. This is needed to render ghost floors.
      }, {
        key: "_clearFloorSection", value: function _clearFloorSection() {
          // Changing the number of cutplanes would cause a shader recompile.
          // To avoid that, we set dummy cutplanes instead.
          this._updateZLimits();
          this._applyFloorSection();
        }
      }, {
        key: "_setMode", value: function _setMode(

          mode) {
            var _this = this;

          if (mode === this._currentMode) {
            return;
          }
          this._currentMode = mode;

          if (mode === FloorRenderMode.Hovering) {

            var fadeExt = this._getFadeExtension();
            if (fadeExt) {

              // Take control over CrossFade effect.
              // NOTE: As long as the mouse is hovering over the LevelsPanel, we assume that no one else overtakes the crossFade effect. If the mouse leaves the LevelsPanel
              //       the ghost-floors a fading out. If the fading is needed for something else at that time, we skip the fading and drop the ghost floors immediately.
              fadeExt.acquireControl('FloorSelector', function () { return _this._interruptFading(); });

              // Render snapshot of selected floors into target 0
              fadeExt.setModelTargetIndexForAll(undefined); // render to main target
              this._applySelectedFloorSection(); // set cutplanes according to selected floor
              this._renderer.rolloverObjectId(0); // keep mouse-over highlighting out of the snapshot
              this._setAOVisible(true); // Make sure that the selected floors are rendered with AO
              fadeExt.renderFadingImage(0, this.offscreenRenderBudget); // render static snapshot of selected floors into extra target 0

              // show this snapshot at full opacity
              fadeExt.setCrossFadeOpacity(0, 1.0);

              // Render remaining floors...
              this._clearFloorSection();

              // ..into target 1
              fadeExt.setModelTargetIndexForAll(1);

              // before starting to fade-in the ghost-floors,
              // hide SAO. Otherwise, SAO of the ghost
              // floors would pop in at fade start.
              this._setAOVisible(false);

              // stop any prior fade-anim
              this._stopFadeAnim();

              // fade-in ghost floors (starting at the prior opacity)
              var onTimer = this._setGhostFloorOpactiy.bind(this);
              this._fadeAnim = avp.fadeValue(this._ghostFloorOpacity, MaxGhostFloorOpacity, GhostFloorFadingTime, onTimer);
            }
          } else if (mode === FloorRenderMode.Transition) {

            // protect ghost floors from clear
            var _fadeExt = this._getFadeExtension();
            if (_fadeExt) {
              _fadeExt.setClearEnabled(1, false);

              // render into target 0 again
              _fadeExt.setClearEnabled(0, true);
              _fadeExt.setModelTargetIndexForAll(0);

              // make sure that target 0 has full opacity to make sure that floor keeps visible after moving to target 0
              _fadeExt.setCrossFadeOpacity(0, 1.0);
            }

            // reactivate AO
            this._setAOVisible(true);

            // Render selected/moving floor...
            this._applySelectedFloorSection();

          } else if (mode === FloorRenderMode.Off) {

            // stop any prior fade-anim
            this._stopFadeAnim();

            // fade-out ghost floors (starting at current opacity)
            var _onTimer = this._setGhostFloorOpactiy.bind(this);
            var onFinished = this._leaveHoverMode.bind(this);
            this._fadeAnim = avp.fadeValue(this._ghostFloorOpacity, 0.0, GhostFloorFadingTime, _onTimer, onFinished);
          }
        }
      }, {
        key: "_moveToFloor", value: function _moveToFloor(

          floorIndex) {
            var _this2 = this;

          this._currentFloor = floorIndex;

          this._setMode(FloorRenderMode.Transition);

          var floor = this._floors[floorIndex];

          this._updateZLimits();

          var minElevStart = this._floorSectionMin === undefined ? this._zMinAllModels : this._floorSectionMin;
          var maxElevStart = this._floorSectionMax === undefined ? this._zMaxAllModels : this._floorSectionMax;
          var minElevEnd = floor ? floor.zMin : this._zMinAllModels;
          var maxElevEnd = floor ? floor.zMax : this._zMaxAllModels;

          var updateCutPlanes = function updateCutPlanes(unitTime) {
            var t = avp.smootherStep(unitTime);
            var minElev = avp.lerp(minElevStart, minElevEnd, t);
            var maxElev = avp.lerp(maxElevStart, maxElevEnd, t);

            _this2._setFloorSection(minElev, maxElev);

            // fade-out mouse over while animating
            var blendPass = _this2._renderer.getBlendPass();
            var uniform = blendPass.uniforms['highlightIntensity'];
            uniform.value = Math.min(uniform.value, 1.0 - t);
          };

          var onAnimEnd = function onAnimEnd() {
            // leave transition mode to hovering or off
            var mode = _this2._hovering ? FloorRenderMode.Hovering : FloorRenderMode.Off;
            _this2._setMode(mode);
          };

          // If another floor anim is in running, stop it first.
          this._stopFloorAnim();

          this._floorAnim = avp.fadeValue(0.0, 1.0, 0.5, updateCutPlanes, onAnimEnd);
        }
      }, {
        key: "_selectFloor", value: function _selectFloor(

          floorIndex) {

          // Make sure that a previous anim does not overwrite the cutplanes again.
          this._stopFloorAnim();

          this._currentFloor = floorIndex;

          // Note that zMin/zMax may also be undefined if no floor is selected
          var floor = this._floors[floorIndex];

          // Set min/maxElev from floor or set both to undefined (for 'no floor selected')
          var minElev = floor ? floor.zMin : undefined;
          var maxElev = floor ? floor.zMax : undefined;

          this._setFloorSection(minElev, maxElev);
        }
      }, {
        key: "_runFloorSelectorFilter", value: function _runFloorSelectorFilter() {
          // Make sure all previously hidden objects are set to visible again.
          this._floorSelectorFilter.clearFilter();

          if (this._floorFilterData && this._currentFloor !== undefined) {
            var floor = this._floors[this._currentFloor];
            this._floorSelectorFilter.filter(this._floorFilterData, floor);
          }
        }
      }, {
        key: "_runFloorSelectorFilterEventHandler", value: function _runFloorSelectorFilterEventHandler(

          event) {
          var model = event.model;

          if (!model.isObjectTreeLoaded()) {
            return;
          }
          if (!(this._floorFilterData && this._currentFloor !== undefined)) {
            // Handles the case when a level was deactivated while the model was not visible.
            // When activating again the model, we need to make sure that the previously
            // filtered elements are set to visible again.
            this._floorSelectorFilter.clearFilter();
            return;
          }
          this._runFloorSelectorFilter();
        }
      }, {
        key: "_runModelUnloadingEventHandler", value: function _runModelUnloadingEventHandler(

          event) {
          if (this._floorFilterData && this._currentFloor !== undefined) {
            this._floorSelectorFilter.unhideModel(event.model);
          }
        }
      }, {
        key: "floorData", get: function get() { return this._floors; }, set: function set(floors) {// always reset the floor selector when floors data changes to avoid inconstancy
          this.resetState(); this._floors = Array.isArray(floors) ? floors : [];
        }
      }, { key: "floorFilterData", get: function get() { return this._floorFilterData; }, set: function set(floorFilterData) { this._floorFilterData = floorFilterData; } }, { key: "currentFloor", get: function get() { return this._currentFloor; } }]); return FloorSelector;
    }();


  FloorSelector.AllFloors = AllFloors;
  FloorSelector.NoFloor = NoFloor;

  FloorSelector.CURRENT_FLOOR_CHANGED = "currentFloorChanged";

  namespace.FloorSelector = FloorSelector;

  /***/
}),
