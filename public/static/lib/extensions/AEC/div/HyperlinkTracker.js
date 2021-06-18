/***/ "./extensions/AEC/hyperlinks/HyperlinkTracker.js":
/*!*******************************************************!*\
  !*** ./extensions/AEC/hyperlinks/HyperlinkTracker.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return HyperlinkTracker; });

  //A tool that:
  //Implements heuristically derived hyperlinks from text geometries in F2D drawings (and mouse hover support for hyperlinks)
  //Taken from Fluent POC:
  // https://git.Bimfish.com/fluent/lmv-ui/blob/master/app/scripts/tools/mouse-tracker.js#L273
  // https://git.Bimfish.com/fluent/lmv-ui/blob/master/app/scripts/tools/mouse-tracker.js#L171




  var av = Bimfish.Viewing,
    avp = Bimfish.Viewing.Private;

  function HyperlinkTracker(viewer, rootBubbleNode, loadViewableCb, hyperlinksAddedCb) {
    av.ToolInterface.call(this);
    this.names = ['hyperlink-tracker'];
    viewer.toolController.registerTool(this);

    var _viewer = viewer;
    var _loadViewableCb = loadViewableCb;
    var _hyperlinksAddedCb = hyperlinksAddedCb;
    var _idRead = [0, 0];
    var _linkMaps = {};
    var _dbId = 0;
    var _lastX, _lastY;
    var _mouseMoved = false;
    var _isDragging = false;

    this.update = function () {
      if (!_isDragging) {
        if (_mouseMoved) {
          var vp = _viewer.impl.clientToViewport(_lastX, _lastY);
          _dbId = _viewer.impl.renderer().idAtPixel(vp.x, vp.y, _idRead);
          _mouseMoved = false;
        }
      } else {
        _dbId = 0;
      }
      return false;
    };

    function getCurrentModel() {
      var mq = _viewer.impl.modelQueue();
      var visibleModels = mq.getModels();

      return visibleModels.length === 1 ? visibleModels[0] : undefined;
    }

    function getCurrentLinkMap() {
      var linkMap = _linkMaps[_idRead[1]];

      //Fallback for when a single model is loaded and the Model ID buffer is not working
      if (!linkMap) {
        var cm = getCurrentModel();
        if (cm) {
          linkMap = _linkMaps[cm.id];
        }
      }

      return linkMap;
    }

    function isLinkMapValid(map) {
      return map && Object.keys(map).length > 0;
    }

    this.handleSingleClick = function () {
      if (!_viewer.model || !_viewer.model.is2d())
        return;

      var vp = _viewer.impl.clientToViewport(_lastX, _lastY);
      _dbId = _viewer.impl.renderer().idAtPixel(vp.x, vp.y, _idRead);

      var linkMap = getCurrentLinkMap();

      var linkNode = isLinkMapValid(linkMap) ? linkMap[_dbId] : null;

      if (linkNode) {
        _loadViewableCb(linkNode, linkMap.numHyperlinks);
        return true;
      }

      return false;
    };

    this.handleButtonDown = function (event) {
      _isDragging = true;
      _lastX = event.canvasX;
      _lastY = event.canvasY;
      return false;
    };

    this.handleButtonUp = function () {
      _isDragging = false;
      return false;
    };

    this.handleMouseMove = function (event) {
      _lastX = event.canvasX;
      _lastY = event.canvasY;
      _mouseMoved = true;
      return false;
    };

    function addRenderBox(vbb, f2d, stringIndex, modelScale) {
      var i4 = 4 * stringIndex;

      var miny = f2d.stringBoxes[i4 + 1];
      var maxy = f2d.stringBoxes[i4 + 3];
      var border = (maxy - miny) * 0.2;
      miny = miny - border;
      maxy = maxy + border;
      var minx = f2d.stringBoxes[i4] - border;
      var maxx = f2d.stringBoxes[i4 + 2] + border;

      var dbId = f2d.stringDbIds[stringIndex];
      var vbase = vbb.vcount;

      var linkFillColor = 0x77bfbb3f;
      vbb.addVertexPolytriangle(minx, miny, linkFillColor, dbId, 0, 0);
      vbb.addVertexPolytriangle(maxx, miny, linkFillColor, dbId, 0, 0);
      vbb.addVertexPolytriangle(maxx, maxy, linkFillColor, dbId, 0, 0);
      vbb.addVertexPolytriangle(minx, maxy, linkFillColor, dbId, 0, 0);

      vbb.addIndices([0, 1, 2, 0, 2, 3], vbase);

      vbb.addSegment(minx, miny, maxx, miny, 0, -2 * modelScale, linkFillColor | 0xff000000, dbId, 0, 0, 0);
      vbb.addSegment(maxx, miny, maxx, maxy, 0, -2 * modelScale, linkFillColor | 0xff000000, dbId, 0, 0, 0);
      vbb.addSegment(maxx, maxy, minx, maxy, 0, -2 * modelScale, linkFillColor | 0xff000000, dbId, 0, 0, 0);
      vbb.addSegment(minx, maxy, minx, miny, 0, -2 * modelScale, linkFillColor | 0xff000000, dbId, 0, 0, 0);
    }

    function addLinkBoxMesh(model, vbb) {
      var fragId = model.getFragmentList().vizmeshes.length;
      var mdata = { mesh: vbb.toMesh(), is2d: true, packId: '0', meshIndex: fragId };
      avp.BufferGeometryUtils.meshToGeometry(mdata);

      var matman = _viewer.impl.matman();
      var materialId = matman.create2DMaterial(model, {});
      var m = _viewer.impl.setupMesh(model, mdata.geometry, materialId, model.getData().loadOptions.placementTransform);
      model.activateFragment(fragId, m);
      return fragId;
    }

    function removeLinkBoxMesh(model, fragId) {
      // get link box mesh
      var fragList = model.getFragmentList();
      var mesh = fragList.vizmeshes[fragId];

      // Dispose geometry. MaterialManager will take care of the material dispose on model unload. 
      // We don't dispose material here because it may be shared with other fragments of the model.
      mesh.geometry.dispose();

      delete fragList.vizmeshes[fragId];
    }

    function initializeHyperlinks(model) {
      if (!model || !model.is2d()) {
        return;
      }

      // Check if this model has been initialized already
      var linkMap = _linkMaps[model.id];
      if (linkMap) {
        return;
      }

      // find all sheets of the same document
      var node = model.getDocumentNode();
      var root = node && node.getRootNode();
      var sheets = root && root.search({ role: '2d', type: 'geometry' });
      if (!sheets || !sheets.length) {
        return;
      }

      linkMap = _linkMaps[model.id] = {};

      var currentSheetBasePath = '';
      if (model.myData) {
        currentSheetBasePath = model.myData.basePath;
      }

      var getSheetUrn = function getSheetUrn(sheet) {
        var resourceType = 'resource';
        if (sheet.children) {
          var _iteratorNormalCompletion = true; var _didIteratorError = false; var _iteratorError = undefined; try {
            for (var _iterator = sheet.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var child = _step.value;
              if (child.type() === resourceType) {
                var urn = child.urn();
                if (urn) {
                  // We remove the primaryGraphics.f2d part from the urn
                  var elements = urn.split('/');
                  elements.pop();
                  return elements.join('/');
                }
              }
            }
          } catch (err) { _didIteratorError = true; _iteratorError = err; } finally { try { if (!_iteratorNormalCompletion && _iterator["return"] != null) { _iterator["return"](); } } finally { if (_didIteratorError) { throw _iteratorError; } } }
        }
        return null;
      };

      var sheetIds = sheets.map(function (s) {
        var sheetUrn = getSheetUrn(s);
        //exclude current sheet, i. e. no links to self
        if (currentSheetBasePath.indexOf(sheetUrn) === -1) {
          var split = s.name().split(' ');
          var sheetName = split[0];
          if (sheetName.length > 2) {
            return sheetName;
          }
        }
        return '';
      });

      //while finding hyperlink strings, we will also
      //create a geometry buffer containing all their bboxes
      //so we can render with their IDs.
      linkMap.numHyperlinks = 0;
      var vbb = new avp.VertexBufferBuilder();
      var modelScale = 1.0 / (model.getData().loadOptions.modelScale || 1);
      var f2d = model.getData();
      for (var i = 0; i < f2d.strings.length; i++) {

        var idx = sheetIds.indexOf(f2d.strings[i]);

        if (idx >= 0) {
          linkMap[f2d.stringDbIds[i]] = sheets[idx];

          addRenderBox(vbb, f2d, i, modelScale);
          linkMap.numHyperlinks++;
        }
      }

      linkMap.boxFragId = addLinkBoxMesh(model, vbb);

      if (_hyperlinksAddedCb) {
        _hyperlinksAddedCb(e.model.id, linkMap.numHyperlinks);
      }
    }

    function onGeomLoaded(e) {
      initializeHyperlinks(e.model);
    }

    // Execute cb for all sheets that are (completely) in memory
    function forAllSheetsInMemory(cb) {
      var allModels = _viewer.getVisibleModels().concat(_viewer.getHiddenModels());
      for (var i = 0; i < allModels.length; i++) {
        var model = allModels[i];
        if (model.is2d() && model.isLoadDone()) {
          cb(model);
        }
      }
    }

    function removeHyperlinks() {

      // Keep _linkMaps consistent with models: We don't want to leak dead box meshes in the models.
      // Therefore, we remove them from all models in memory
      forAllSheetsInMemory(function (model) {
        var linkMap = _linkMaps[model.id];
        if (linkMap) {
          removeLinkBoxMesh(model, linkMap.boxFragId);
        }
      });

      _linkMaps = {};

      // make sure that removed hyperlink quads are not visible anymore
      _viewer.impl.invalidate(true, true);
    }

    this.activate = function () {

      // Make sure that we don't forget to init hyperlinks if the geom-load event has already happened
      forAllSheetsInMemory(function (model) {
        initializeHyperlinks(model);
      });

      _viewer.addEventListener(av.GEOMETRY_LOADED_EVENT, onGeomLoaded);

      // make sure that added hyperlink quads appear instantly
      _viewer.impl.invalidate(true, true);
    };

    this.deactivate = function () {
      _viewer.removeEventListener(av.GEOMETRY_LOADED_EVENT, onGeomLoaded);
      removeHyperlinks();
    };

    // Show a hand cursor, if the cursor is close to a hyperlink
    this.getCursor = function () {
      var linkMap = getCurrentLinkMap();

      if (_dbId < -1 && isLinkMapValid(linkMap) && linkMap[_dbId]) {
        return 'pointer';
      }

      return null;
    };
  }

  var namespace = BimfishNamespace('Bimfish.AEC');
  namespace.HyperlinkTracker = HyperlinkTracker;

  /***/
}),
