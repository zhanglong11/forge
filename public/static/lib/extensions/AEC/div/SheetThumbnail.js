
/***/ "./extensions/AEC/Minimap3D/SheetThumbnail.js":
/*!****************************************************!*\
  !*** ./extensions/AEC/Minimap3D/SheetThumbnail.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return SheetMapThumbnail; });
/* harmony import */ var _MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MinimapMath.js */ "./extensions/AEC/Minimap3D/MinimapMath.js");
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


  var av = Bimfish.Viewing;

  // Convert number to css percent-value.
  // E.g. 30 => "30 percent"
  var toPercent = function toPercent(val) {
    return val.toString() + '%';
  };

  var getThumbnailCropRegion = function getThumbnailCropRegion(sheetNode, viewport) {

    // Actually, we shouldn't care about sheetUnitScale here. We only
    // need it because Revit extractor gives us viewport bounds and sheet bounds in different coordinate systems. 
    // Unfortunately, we have to guess the sheetUnitScale here, because we cannot load all sheets first just to get the unitScale.
    //
    // TODO: If we provide the viewport boundary in sheet coordinates in Revit extractor, we don't need this hack anymore.
    var sheetUnitScale = 0.0254;

    // get viewport bounds in sheet coords (usually inches)    
    var viewportBounds = Bimfish.AEC.AecModelData.getViewportBounds(viewport, sheetUnitScale);

    // get sheet bounds 
    var viewNode = sheetNode.search({ type: 'view' })[0];

    if (!viewNode) {
      return null;
    }

    var viewBoxValues = viewNode.getViewBox();
    var sheetBox = new THREE.Box2();
    sheetBox.min.set(viewBoxValues[0], viewBoxValues[1]);
    sheetBox.max.set(viewBoxValues[2], viewBoxValues[3]);

    // Thumbnails are squared and contain empty pixels to expand the rectangle to a square.
    // Therefore, the are whole thumbnail image does not match the sheet bounds exactly,
    // but actually corresponds to the square containing it.
    Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["expandToSquare"])(sheetBox);

    // map from sheetBox to thumbnail pixels
    Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["boundsToUnitQuad"])(viewportBounds.min, sheetBox);
    Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["boundsToUnitQuad"])(viewportBounds.max, sheetBox);

    return viewportBounds;
  };


  // Transforms a given div in a way that...
  //  - Lower-left  corner is mapped to p0
  //  - Lower-Right corner is mapped to p1
  //  - Upper-left  corner is mapped to p2
  //
  // @param {Object}        div                       - div element to be placed within its parent div
  // @param {THREE.Vector2} p0, p1, p2                - Points within parent div. All coords are in pixels with pixel-origin at lower left.
  // @param {number}        parentWidth, parentHeight - Extents of parent widget (used to finally convert pixels to percent)
  // @returns {float} angle                           - clockwise rotation angle in radians.
  var transformQuad = function transformQuad(div, p0, p1, p2, parentWidth, parentHeight) {

    // Note: It's important to work in pixels (not percent) here. Otherwise, we would introduce a distortion depending on aspect ratio.
    var width = p1.distanceTo(p0);
    var height = p2.distanceTo(p0);
    var left = p0.x;
    var bottom = p0.y;

    // Compute rotation angle. Note that we must take the negative, 
    // because css rotate() rotates clockwise
    var angle = -Math.atan2(p1.y - p0.y, p1.x - p0.x);

    // configure pos and scale
    div.style.width = toPercent(width * 100 / parentWidth);
    div.style.height = toPercent(height * 100 / parentHeight);
    div.style.left = toPercent(left * 100 / parentWidth);
    div.style.bottom = toPercent(bottom * 100 / parentHeight);

    // rotate around lower-left corner.
    div.style.transformOrigin = '0% 100%';
    div.style.transform = 'rotate(' + angle.toString() + 'rad)';

    return angle;
  };

  // Creates a div containing the thumbnail of a given sheet node as an image element.
  //  @param {av.BubbleNode} sheetNode
  //  @returns {Object|undefined} An div element containing the thumnbail image
  var createThumbnail = function createThumbnail(sheetNode) {

    var _document = av.getGlobal().document;
    var thumbnail = _document.createElement('div');

    // Use the largest we can get from DS
    var width = 400;
    var height = 400;

    // get thumbnail url
    var root = sheetNode.getRootNode();
    var doc = root.getDocument();
    var url = doc.getThumbnailPath(sheetNode.data, width, height);

    // add thumbnail image
    if (Bimfish.Viewing.endpoint.getUseCookie()) {

      // Create image element. The second image is a placeholder that will receive the refined thumbnail generated after loading the sheet.
      thumbnail.innerHTML = "<img class=\"mapImage\" src=\"".concat(url, "\" crossOrigin=\"use-credentials\">");
    } else {
      // When not using a cookie for credentials, we have to request the thumbnails using ViewingService.

      // Create empty image element
      var _image = _document.createElement('image');
      _image.classList.add('mapImage');
      thumbnail.appendChild(_image);

      var options = doc.getThumbnailOptions(sheetNode.data, width, height);

      // As soon as we get the image, assign its blobUrl as image src
      var onReceive = function onReceive(error, blob) {

        // Display a warning if overlay thumbnail will not show up
        if (error) {
          console.warn("Failed to load sheet thumbnail. Error: ".concat(error, ", Urn: ").concat(options.urn, ", SheetName: ").concat(sheetNode.name()));
          return;
        }

        // assign imageUrl 
        var blobUrl = av.getGlobal().URL.createObjectURL(blob);
        _image.src = blobUrl;
      };

      // Request thumbnail from DS
      Bimfish.Viewing.Document.requestThumbnailWithSecurity(options, onReceive);
    }

    // Append second image that will receive the high-res thumbnail when we loaded the sheet later
    var image = _document.createElement('image');
    image.classList.add('mapImage');
    image.style.opacity = 0.0; // will fade-in once generated
    thumbnail.appendChild(image);

    // make image element accessable
    thumbnail.preImage = thumbnail.children[0]; // low-res thumbnail that we use until we have something better
    thumbnail.image = image; // high-res thumbnail that we create ourselves

    thumbnail.className = 'sheetmap-thumbnail';
    return thumbnail;
  };

  // Applies css styling on image element, so that the given cropRegion fits the parent div
  //
  // @param {Box2}  cropRegion - in [0,1]^2, relative to the full image
  // @param {Image} image      - html image element
  var cropImage = function cropImage(image, cropRegion) {

    // compute size of crop region (relative to full image)
    var cropWidth = cropRegion.max.x - cropRegion.min.x;
    var cropHeight = cropRegion.max.y - cropRegion.min.y;

    // Compute shift to bring upper-left corner of the cropRegion to (0,0).
    // Values are relative to the parent div - whose size is adjusted to the 
    // cropRegion
    var left = -cropRegion.min.x / cropWidth;
    var top = (cropRegion.max.y - 1) / cropHeight;

    // Compute image size relative to parent div: The image must be larger than 
    // the parent div (which corresponds to size 1.0 here)
    // We want to achieve parentDivWidth = cropWidth * imageWidth.
    var width = 1.0 / cropWidth;
    var height = 1.0 / cropHeight;

    // Apply all values in percent
    image.style.left = toPercent(100 * left);
    image.style.top = toPercent(100 * top);
    image.style.width = toPercent(100 * width);
    image.style.height = toPercent(100 * height);
  };

  // Sheetmap thumbnails are embedded in the minimap to display for which regions inside the minimap a sheetmap is available. 
  // A sheetmap thumbnail is a sheet thumbnail that is cropped down to a single viewport and embedded into the main map.
  var SheetMapThumbnail = /*#__PURE__*/function () {

    // @param {av.BubbleNode} sheetNode
    // @param {SheetMapConfig} sheetMapConfig - Config object for the sheet to be represented by this thumbnail
    // @param {Matrix4}        mainMapMatrix  - transforms from 3D world coords to main map coords in [-1,1]^2
    // @param {number}         mainMapWidth, mainMapHeight - Resolution of main map image
    function SheetMapThumbnail(sheetMapConfig, mainMapMatrix, mainMapWidth, mainMapHeight) {
      _classCallCheck(this, SheetMapThumbnail);

      // create div containing the thumbnail image
      this.div = createThumbnail(sheetMapConfig.sheetNode); var

        sheetNode = sheetMapConfig.sheetNode, viewport = sheetMapConfig.viewport, mapMatrixInv = sheetMapConfig.mapMatrixInv;

      // Crop thumbnail to the viewport we want to display. 
      // Crop region is relative to image size, i.e., in [0,1]^2
      var cropRegion = getThumbnailCropRegion(sheetNode, viewport);
      cropImage(this.div.preImage, cropRegion);
      cropImage(this.div.image, cropRegion);

      // Compute positions of the 3 corners of the sheetmap in 3D world coords
      var p0 = new THREE.Vector3(-1, -1, 0).applyMatrix4(mapMatrixInv);
      var p1 = new THREE.Vector3(1, -1, 0).applyMatrix4(mapMatrixInv);
      var p2 = new THREE.Vector3(-1, 1, 0).applyMatrix4(mapMatrixInv);

      // Convert points to main map-pixel coords
      p0 = Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["worldToMapPixels"])(p0, mainMapMatrix, mainMapWidth, mainMapHeight);
      p1 = Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["worldToMapPixels"])(p1, mainMapMatrix, mainMapWidth, mainMapHeight);
      p2 = Object(_MinimapMath_js__WEBPACK_IMPORTED_MODULE_0__["worldToMapPixels"])(p2, mainMapMatrix, mainMapWidth, mainMapHeight);

      // In map-pixel space, the y-axis points down. For configuring the div,
      // we want to have the y-axis point up.
      p0.y = mainMapHeight - p0.y;
      p1.y = mainMapHeight - p1.y;
      p2.y = mainMapHeight - p2.y;

      // Place/Scale/Rotate thumbnail in a way that..
      //  - lower-left  is mapped to p0
      //  - lower-right is mapped to p1
      //  - upper-left  is mapeed to p2
      // Returns the clockwise rotation angle in radians
      this.angle = transformQuad(this.div, p0, p1, p2, mainMapWidth, mainMapHeight);
    }

    // Update thumbnail image as soon as we have a screenshot with better resolution
    _createClass(SheetMapThumbnail, [{
      key: "refineImage", value: function refineImage(url) {
        var _this = this;
        this.div.image.src = url;

        // Fade-in refined image on top of the other one. Note that the thumbnail opacity is controlled on the parent div,
        // so there is no conflict and we can simply set opacity 1.0 when done.
        var setOpacity = function setOpacity(t) { return _this.div.image.style.opacity = t; };

        // Remove low-res image when done
        var onDone = function onDone() { return _this.div.removeChild(_this.div.preImage); };

        Bimfish.Viewing.Private.fadeValue(0, 1, 1.0, setOpacity, onDone);
      }
    }]); return SheetMapThumbnail;
  }();

  /***/
}),