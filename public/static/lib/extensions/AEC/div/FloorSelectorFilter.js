
/***/ "./extensions/AEC/levels/FloorSelectorFilter.js":
/*!******************************************************!*\
  !*** ./extensions/AEC/levels/FloorSelectorFilter.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return FloorSelectorFilter; });
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var namespace = BimfishNamespace('Bimfish.AEC');

  // The FloorSelectorFilter provides functionality to additionally apply object filtering
  // by dbIds on level selection.
  //
  var
    FloorSelectorFilter = /*#__PURE__*/function () {

      // @param {Viewer3D} viewer
      function FloorSelectorFilter(viewer) {
        _classCallCheck(this, FloorSelectorFilter);
        this._viewer = viewer;
        // Contains all dbIds per model used to un-hide the objects whenever another level gets selected.
        this._dbIdsToUnhide = new Map();
        this._cache = {};
      }

      // Filter all elements by dbIds on level selection.
      //  @param {Object}   floorFilterData   - A floor filter data object containing all dbIds per model and an optional level height factor.
      //  @param {Object}   floor             - A floor.
      _createClass(FloorSelectorFilter, [{
        key: "filter", value: function filter(floorFilterData, floor) {
          var _this = this;
          if (!floorFilterData) {
            throw new Error('floorFilterData cannot be undefined.');
          }
          if (!(floorFilterData.modelsDbIds instanceof Map)) {
            throw new Error('floorFilterData.modelsDbIds has to be a Map.');
          }
          if (!floor) {
            throw new Error('floor cannot be undefined.');
          }

          // Get the level height factor and also do some basic number checks.
          var levelHeightFactor = this._getLevelHeightFactor(floorFilterData.levelHeightFactor);

          // All Floor and Ceiling db ids per model to hide.
          var modelsDbIds = floorFilterData.modelsDbIds;

          // Do nothing in case no db ids are set.
          if (!this._hasModelDbIds(modelsDbIds)) {
            return;
          }

          var minZ = floor.zMin;
          var maxZ = floor.zMax;

          // Calculate the new minZ/maxZ values of the level boundary used to spatially filter the Floor and
          // Ceiling elements.
          // 1. The lower boundary value (zMin) is moved up by the factor of the level height, because the Ceiling
          //    elements we want to filter are located in the upper part of the level.
          // 2. The upper boundary value (zMax) is moved up by 10% of the level height, because in some models
          //    this helps to also remove floors which would be still shown otherwise.
          var newMinZ = minZ + (maxZ - minZ) * levelHeightFactor;
          var newMaxZ = maxZ + (maxZ - minZ) * 0.1;

          // Setup cache for each floor.
          if (!this._cache[floor.name]) {
            this._cache[floor.name] = {};
          }

          var modelQueue = this._viewer.impl.modelQueue();
          var models = modelQueue.getModels(); var _loop2 = function _loop2(

            m, l) {
            var model = models[m];

            if (!model.visibilityManager) {
              console.warn("The VisibilityManager of the model with ID = ".concat(model.id, " is not yet initialized."));
              return "break";
            }

            // Try to get the db ids for a specific level and model from the cache.
            if (_this._cache[floor.name][model.id]) {
              var cachedDbIds = _this._cache[floor.name][model.id];
              if (cachedDbIds.size > 0) {
                _this.hideDbIds(model, cachedDbIds);
              }
              return "continue";
            }

            var instanceTree = model.getInstanceTree();
            if (!instanceTree) {
              console.warn("The instanceTree of the model with ID = ".concat(model.id, " is not yet initialized."));
              return "continue";
            }

            var dbIdsToHide = new Set();
            var dbIds = modelsDbIds.get(model.id);
            if (!dbIds) {
              return "continue";
            }

            dbIds.forEach(function (dbId) {
              var nodeBox = new Float32Array(6);
              instanceTree.getNodeBox(dbId, nodeBox);

              var nodeBoxMinZ = nodeBox[2];
              var nodeBoxMaxZ = nodeBox[5];

              if (nodeBoxMinZ >= newMinZ && nodeBoxMinZ <= newMaxZ ||
                nodeBoxMaxZ >= newMinZ && nodeBoxMaxZ <= newMaxZ ||
                nodeBoxMinZ <= newMinZ && nodeBoxMaxZ >= newMaxZ) {
                dbIdsToHide.add(dbId);
              }
            });

            if (dbIdsToHide.size > 0) {
              _this.hideDbIds(model, dbIdsToHide);
            }

            _this._cache[floor.name][model.id] = dbIdsToHide;
          }; _loop: for (var m = 0, l = models.length; m < l; m++) {
            var _ret = _loop2(m, l); switch (_ret) { case "break": break _loop; case "continue": continue; }
          }
        }
      }, {
        key: "hideDbIds", value: function hideDbIds(

          model, dbIds) {
          if (!model.visibilityManager) {
            return;
          }

          dbIds.forEach(function (id) {
            model.visibilityManager.setNodeOff(id, true);
          });

          // Collect all dbIds per model, so we can un-hide them later on again.
          if (this._dbIdsToUnhide.has(model)) {
            var _dbIds = this._dbIdsToUnhide.get(model); var _iteratorNormalCompletion = true; var _didIteratorError = false; var _iteratorError = undefined; try {
              for (var _iterator = _dbIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var dbId = _step.value;
                _dbIds.add(dbId);
              }
            } catch (err) { _didIteratorError = true; _iteratorError = err; } finally { try { if (!_iteratorNormalCompletion && _iterator["return"] != null) { _iterator["return"](); } } finally { if (_didIteratorError) { throw _iteratorError; } } }
          } else {
            this._dbIdsToUnhide.set(model, dbIds);
          }
        }

        // Un-hides all objects (using the dbId) per model.
      }, {
        key: "clearFilter", value: function clearFilter() {
          if (this._dbIdsToUnhide.size === 0) {
            return;
          }

          this._dbIdsToUnhide.forEach(function (dbIds, model) {
            // Handles the case when the model is not visible and the level isolation is deactivated.
            if (!model.visibilityManager) {
              return;
            }

            dbIds.forEach(function (id) {
              model.visibilityManager.setNodeOff(id, false);
            });

            // Only remove the model dbIds if they are successfully set to visible.
            this._dbIdsToUnhide["delete"](model);
          }.bind(this));
        }

        // Un-hides only one model. It's all we can do, as the model.visibilityManager is null,
        // that is we can not call setNodeOff function again
      }, {
        key: "unhideModel", value: function unhideModel(model) {
          this._dbIdsToUnhide["delete"](model);
        }
      }, {
        key: "_hasModelDbIds", value: function _hasModelDbIds(

          modelsDbIds) {

          if (modelsDbIds.size === 0) {
            return false;
          } var _iteratorNormalCompletion2 = true; var _didIteratorError2 = false; var _iteratorError2 = undefined; try {

            for (var _iterator2 = modelsDbIds.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var dbIds = _step2.value;
              if (dbIds && dbIds.length > 0) {
                return true;
              }
            }
          } catch (err) { _didIteratorError2 = true; _iteratorError2 = err; } finally { try { if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) { _iterator2["return"](); } } finally { if (_didIteratorError2) { throw _iteratorError2; } } }

          return false;
        }
      }, {
        key: "_getLevelHeightFactor", value: function _getLevelHeightFactor(

          levelHeightFactor) {
          if (levelHeightFactor === undefined) {
            // Return default factor.
            return 0.5;
          }

          if (typeof levelHeightFactor !== 'number') {
            throw new Error('floorFilterData.levelHeightFactor has to be a number');
          }
          if (levelHeightFactor < 0 || levelHeightFactor >= 1) {
            throw new Error('floorFilterData.levelHeightFactor has to be a number between 0-1.');
          }

          return levelHeightFactor;
        }

        // Hides all dbIds in a model that are currently expected to be hidden. 
      }, {
        key: "reApplyFilter", value: function reApplyFilter(model) {
          var dbIds = this._dbIdsToUnhide.get(model);
          var visMan = model.visibilityManager;
          if (!dbIds || !visMan) {
            return;
          }

          dbIds.forEach(function (id) {
            visMan.setNodeOff(id, true);
          });
        }
      }, {
        key: "isVisible", value: function isVisible(

          model, dbId) {
          var dbIds = this._dbIdsToUnhide.get(model);
          return !dbIds || !dbIds.has(dbId);
        }
      }]); return FloorSelectorFilter;
    }();


  namespace.FloorSelectorFilter = FloorSelectorFilter;

  /***/
}),