/***/ "./extensions/AEC/common/AecModelData.js":
/*!***********************************************!*\
  !*** ./extensions/AEC/common/AecModelData.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
  //
  // Utility functions to work with AEC-specific model data. These are stored in a separate JSON file AECModelData.json. 
  // Currently only available for Revit files.
  //

  var namespace = BimfishNamespace('Bimfish.AEC');

  // Computes a Matrix4 that maps the 'from' rectangle to the 'to' rectangle in xy.
  var remapRectangle = function remapRectangle(
    xMinFrom, yMinFrom, xMaxFrom, yMaxFrom,
    xMinTo, yMinTo, xMaxTo, yMaxTo) {
    var scaleX = (xMaxTo - xMinTo) / (xMaxFrom - xMinFrom);
    var scaleY = (yMaxTo - yMinTo) / (yMaxFrom - yMinFrom);

    // Note that the translation component of the matrix works on the scaled values.
    // The scaling alone would map xMinFrom to scaleX * xMinFrom. We want 
    // to map it to xMinTo instead. (analog for y)
    var offsetX = xMinTo - scaleX * xMinFrom;
    var offsetY = yMinTo - scaleY * yMinFrom;

    // Create Matrix4 that applies both
    var matrix = new THREE.Matrix4();
    matrix.elements[0] = scaleX;
    matrix.elements[5] = scaleY;
    matrix.elements[12] = offsetX;
    matrix.elements[13] = offsetY;
    return matrix;
  };

  // Returns the 2D bbox of a viewport on a sheet.
  // 
  // @param {Object} vp             - Viewport data as read from AECModelData
  // @param {number} sheetUnitScale - UnitScale of the sheet containing the viewport, e.g., 0.0254 if the sheet unit is inches. See Model.getUnitScale().
  // @returns {THREE.Box2|null}
  var getViewportBounds = function getViewportBounds(vp, sheetUnitScale) {

    // viewport region in foot as array (6 floats)
    var values = vp.geometryViewportRegion;
    if (!values) {
      return null;
    }

    // Convert from foot to sheet units (usually inches)
    var FootToMeter = 0.3048;
    var MeterToSheetUnits = 1.0 / sheetUnitScale;
    var scale = FootToMeter * MeterToSheetUnits;

    // The viewport region returned by Revit is incorrect. It's enlarged by an offset of 0.01 ft.
    // We remove that offset before scaling. 
    // See https://thebuildingcoder.typepad.com/blog/2010/09/view-location-on-sheet.html (search for 0.01 in that page)
    var boundsCorrection = 0.01;

    var res = new THREE.Box2();
    res.min.x = (values[0] + boundsCorrection) * scale;
    res.min.y = (values[1] + boundsCorrection) * scale;
    res.max.x = (values[3] - boundsCorrection) * scale;
    res.max.y = (values[4] - boundsCorrection) * scale;
    return res;
  };

  // Handle available view rotation modes in Revit
  // If a view was rotated in Revit, this swapped/inverted some viewport axes. We must revert this modification when transforming back to world coords.
  // This function returns a Matrix4 that performs this rotation on an input vector p in normalized viewport coords (in [0,1])
  //
  //  @param {number} viewRotationType - as read from AECModelData. Enum value in {0,1,2}. see Revit API doc:
  //                                     http://www.revitapidocs.com/2018/abd81744-b44a-e578-cb62-3cc40a334acc.htm
  //  @returns {THREE.Vector2/3} Copy of vpCoords with swapped/inverted axes according to viewport rotation
  var getInverseViewportRotation = function getInverseViewportRotation(viewRotationType) {

    var matrix = new THREE.Matrix4();
    switch (viewRotationType) {
      // No rotation => done
      case 0: return matrix;

      // Revit view was rotated by 90 degrees clockwise => Rotate by 90 degrees ccw
      case 1: {
        // Note that a rotation would actually mean result.x = -y. But, we just revert the effect the rotation effect on the
        // viewport axes here. I.e., input and output are in [0,1]. For this, swapping an axis means taking 1.0-value, not just the negative.
        // Therefore, the desired effect of the matrix is:
        //
        //  (x, y) => (1-y, x)
        //
        // Note the memory layout of THREE matrices is column-major.

        // out.x = (1-y)
        matrix.elements[0] = 0; //  0 * in.x
        matrix.elements[4] = -1; // -1 * in.y
        matrix.elements[12] = 1; // + 1

        // out.y = x
        matrix.elements[1] = 1; // 1 * in.x
        matrix.elements[5] = 0; // 0 * in.y

        break;
      }

      // Revit view was rotated 90 degrees counterclockwise => Rotate by 90 degrees cw
      case 2: {
        // Desired transform here is:
        //
        // (x, y) => (y, 1-x)

        // out.x = y
        matrix.elements[0] = 0; // 0 * in.x
        matrix.elements[4] = 1; // 1 * in.y

        // out.y = (1-x)
        matrix.elements[1] = -1; //    -in.x
        matrix.elements[5] = 0; // 0 * in.y
        matrix.elements[13] = 1; // + 1

        break;
      }
      default: console.warn('Unexpected enum value for view rotation: ', viewRotationType);
    }

    return matrix;
  };

  // Compute matrix to convert 2D sheet coords within the given viewport to 3D model coordinates.
  //
  // @param {Object} vp             - Viewport data as read from AECModelData
  // @param {number} sheetUnitScale - UnitScale of the sheet containing the viewport, e.g., 0.0254 if the sheet unit is inches. See Model.getUnitScale().
  //
  // @returns {THREE.Matrix4|null} May return null if a viewport does not support a 2D/3D transform.
  //
  // Note: Not all viewports provide A 2D/3D transform is not provided by all This feature is only available for a subset of  viewports. 
  var get2DTo3DMatrix = function get2DTo3DMatrix(vp, sheetUnitScale) {

    // Viewport bbox on sheet (Box2)
    var sheetRegion = getViewportBounds(vp, sheetUnitScale);

    // SectionBox (Box3 + Matrix4): Oriented box in 3D world coords. Represents the volume
    // that is mapped to the sheet.
    var sectionBox = vp.sectionBox;
    var sectionBoxTransform = Bimfish.Viewing.BubbleNode.readMatrixFromArray12(sectionBox.transform);

    // Compute matrix that maps from sheet xy coords to normalized viewport coords in [0,1]^2
    var sheetToViewport = remapRectangle(
      sheetRegion.min.x, sheetRegion.min.y, sheetRegion.max.x, sheetRegion.max.y, // ...from viewport rectangle in sheet coordinates
      0, 0, 1, 1 // ...to [0,1] 
    );

    // Consider Revit viewport rotation. Result keeps within viewport coords ([0,1]^2)
    var vpRotationInv = getInverseViewportRotation(vp.viewportRotation);

    // Compute matrix that maps from sheet xy coords to normalized viewport coords in [0,1]^2
    var viewportToSectionBox = remapRectangle(
      0, 0, 1, 1, // ...from normalized viewport coords
      sectionBox.min.x, sectionBox.min.y, sectionBox.max.x, sectionBox.max.y // ...to the xy-extent of the untransformed SectionBox
    );

    // Finally, apply the sectionBoxTransform to obtain world coords. Note that matrix products must be done in reverse order.
    return sectionBoxTransform.
      multiply(viewportToSectionBox).
      multiply(vpRotationInv).
      multiply(sheetToViewport);
  };

  // Compute matrix to convert 3D model coords to 2D sheet coords within a given viewport. See get2Dto3DMatrix().
  var get3DTo2DMatrix = function get3DTo2DMatrix(vp, sheetUnitScale) {
    var matrix = get2DTo3DMatrix(vp, sheetUnitScale);
    matrix.getInverse(matrix);
    return matrix;
  };

  // Find Sheet BubbleNode containing the given viewport.
  //
  //  @params {av.BubbleNode} root - root node of a manifest in which we search for sheets
  //  @params {Object}        vp   - Viewport as obtained from AecModelData.json file (aecData.viewports)
  //  @returns {av.BubbleNode[]|undefined} BubbleNode of the sheet containing the viewport (if any).
  var findSheetForViewport = function findSheetForViewport(root, vp) {
    var sheetNodes = root.search(Bimfish.Viewing.BubbleNode.SHEET_NODE);
    var linkedByVp = function linkedByVp(node) { return node.guid() === vp.sheetGuid; };
    return sheetNodes.find(linkedByVp);
  };

  // Find all viewports on a given sheet. The sheet can be specified as model or BubbleNode.
  // Note that not all viewports support 2D/3D transform.
  //
  //  @param {av.BubbleNode|av.Model} sheet
  var findViewportsOnSheet = function findViewportsOnSheet(sheet) {

    // get aecModelData from model or node
    var isNode = sheet instanceof Bimfish.Viewing.BubbleNode;
    var sheetNode = isNode ? sheet : sheet.getDocumentNode();
    var aec = sheetNode.getAecModelData();
    if (!aec || !aec.viewports) {
      return [];
    }

    // Find viewports linking the sheet guid
    return aec.viewports.filter(function (vp) { return vp.sheetGuid === sheetNode.guid(); });
  };

  // Given a sheet and a point on that sheet, this function returns the viewport containing it.
  // If multiple viewports overlap, we choose the one where (x,y) is "most inside", i.e., 
  // where the distance from the viewport edges is largest.
  //
  //  @param {av.Model}         sheet
  //  @param {Vector2}          point            - Point in sheet world-coords.
  //  @param {function(Object)} [viewportFilter] - Option to exclude certain viewports
  //
  //  @returns {Object|undefined} 
  var findViewportAtPoint = function findViewportAtPoint(sheet, point) {
    var viewportFilter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    // Find sheets linking this sheet
    var viewports = findViewportsOnSheet(sheet);

    // Apply option filter
    if (viewportFilter) {
      viewports = viewports.filter(viewportFilter);
    }

    // Couple each viewport with viewport bounds 
    viewports = viewports.map(function (vp) {
      return {
        viewport: vp,
        bounds: getViewportBounds(vp, sheet.getUnitScale())
      };

    });

    // Reduce to viewports containing the given point
    var containsPoint = function containsPoint(vp) {
      return vp.bounds && vp.bounds.containsPoint(point);
    };
    viewports = viewports.filter(containsPoint);

    // Point may be outside of all viewports
    if (!viewports.length) {
      return;
    }

    // Viewports may overlap. For this case, we need a heuristic metric
    // to choose the best match. For this, we use the
    // distance to the viewport boundary edges.
    var distanceFromEdge = function distanceFromEdge(box, p) {
      return Math.min(
        Math.min(p.x - box.min.x, box.max.x - p.x),
        Math.min(p.y - box.min.y, box.max.y - p.y));

    };

    // Pick the viewport that minimizes distanceFromEdge
    var getBestMatch = function getBestMatch(vp1, vp2) {
      var d1 = distanceFromEdge(vp1.bounds, point);
      var d2 = distanceFromEdge(vp2.bounds, point);
      return d2 > d1 ? vp2 : vp1;
    };
    return viewports.reduce(getBestMatch).viewport;
  };

  // Get guid of the level shown by a viewport (may be null, e.g. for SectionViews)
  //  @param {Object} vp - viewport object from aecModelData
  //  @returns {string|undefined} levelGuid
  var getLinkedLevel = function getLinkedLevel(vp) {

    // Viewports come directly from aecModelData json and do not always reference a level. 
    // So, we should not crash if anything is null here.
    var viewRange = vp.extensions && vp.extensions.viewRange;
    var cutPlane = viewRange && viewRange.cutPlane;
    return cutPlane && cutPlane.levelGuid;
  };

  // Find all viewports in the document that link the level indicated by levelGuid
  //
  // @param {Object} aecData   - as obtained from AECModelData.json
  // @param {string} levelGuid
  // @retuns {Object[]} Array of viewport data objects
  var findViewportsForLevel = function findViewportsForLevel(aecData, levelGuid) {

    // Find viewports that links this level
    var viewports = aecData.viewports || [];

    var matchesLevel = function matchesLevel(vp) {
      var vpLevelGuid = getLinkedLevel(vp);
      return vpLevelGuid === levelGuid;
    };
    return viewports.filter(matchesLevel);
  };

  // Find level in aecModelData that links the given viewport.
  //
  // @param {Object} aecData - as obtained from AECModelData.json
  // @param {Object} viewport object
  // @retuns {Object|undefined} level object from aecModelData
  var findLevelForViewport = function findLevelForViewport(aecData, viewport) {
    var levelGuid = getLinkedLevel(viewport);

    // Search for a level with this levelGuid
    var hasLevelGuid = function hasLevelGuid(level) { return level.guid === levelGuid; };
    return levelGuid && aecData.levels.find(hasLevelGuid);
  };

  // Checks if a viewport provides all required information to compute a 2D/3D transform.
  //  @param {Object} vp - vieport data object as obtained from AecModelData.json
  var supports2DTo3DTransform = function supports2DTo3DTransform(vp) {

    // Viewport types for which we know that we get valid transform data.
    // For 'Section', it worked for some examples, but wasn't reliably enough to enable it by default yet.
    var supportedTypes = ['FloorPlan', 'CeilingPlan', 'EngineeringPlan'];

    return Boolean(supportedTypes.includes(vp.viewType) &&
      vp.sectionBox &&
      vp.geometryViewportRegion && // We need the viewport outline that corresponds 1:1 with the view sectionBox (excluding labels etc.)
      vp.isCropBoxActive && // If this checkbox is off in Revit, the sectionBox information is not relialbe
      !vp.hasBreaks && // A view in Revit may be split into separate parts using "View breaks". This is not supported yet.
      !vp.extensions.hasRegions); // The 2D/3D transform may actually vary within a single view. We currently don't get the required data to support this.
  };

  var AecModelData = {
    get2DTo3DMatrix: get2DTo3DMatrix,
    get3DTo2DMatrix: get3DTo2DMatrix,
    getViewportBounds: getViewportBounds,
    remapRectangle: remapRectangle,
    findSheetForViewport: findSheetForViewport,
    findViewportsForLevel: findViewportsForLevel,
    supports2DTo3DTransform: supports2DTo3DTransform,
    getLinkedLevel: getLinkedLevel,
    findViewportsOnSheet: findViewportsOnSheet,
    findViewportAtPoint: findViewportAtPoint,
    findLevelForViewport: findLevelForViewport
  };


/* harmony default export */ __webpack_exports__["default"] = (AecModelData);

  namespace.AecModelData = AecModelData;

  /***/
}),