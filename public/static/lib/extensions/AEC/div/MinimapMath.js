

/***/ "./extensions/AEC/Minimap3D/MinimapMath.js":
/*!*************************************************!*\
  !*** ./extensions/AEC/Minimap3D/MinimapMath.js ***!
  \*************************************************/
/*! exports provided: worldToMapPixels, mapPixelsToWorld, posIsInsideMap, setCameraFromFrustumCorners, setTopView, compute3DTo2DMatrix, motionSmoothing, rotateAround, expandToSquare, boundsToUnitQuad */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "worldToMapPixels", function () { return worldToMapPixels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapPixelsToWorld", function () { return mapPixelsToWorld; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "posIsInsideMap", function () { return posIsInsideMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCameraFromFrustumCorners", function () { return setCameraFromFrustumCorners; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setTopView", function () { return setTopView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compute3DTo2DMatrix", function () { return compute3DTo2DMatrix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "motionSmoothing", function () { return motionSmoothing; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateAround", function () { return rotateAround; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandToSquare", function () { return expandToSquare; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "boundsToUnitQuad", function () { return boundsToUnitQuad; });
  // Utility functions used by Minimap


  // Transform 3D model position to pixel-space position on full MiniMap. Indepdent of scroll-position.
  var worldToMapPixels = function worldToMapPixels(pos3D, mapMatrix, mapWidth, mapHeight) {
    var p = pos3D.clone().applyProjection(mapMatrix);
    var res = new THREE.Vector2(
      (p.x + 1) / 2 * mapWidth,
      (-p.y + 1) / 2 * mapHeight);

    return res;
  };

  var mapPixelsToWorld = function mapPixelsToWorld(posX, posY, zWorld, mapMatrixInv, mapWidth, mapHeight) {
    // convert pixels to normalized viewport coords in [-1,1]
    var vx = 2 * (posX / mapWidth) - 1.0;
    var vy = 2 * (posY / mapHeight) - 1.0;

    // Beware of the annoying y-flip
    var p = new THREE.Vector3(vx, -vy, 0.0).applyProjection(mapMatrixInv);
    p.z = zWorld;
    return p;
  };

  // Checks whether the given 3D position would appear inside the map for the given mapMatrix.
  //  @param {Vector3} pos3D
  //  @param {Matrix4} mapMatrix
  //  @returns {bool}
  var _tmpVec = null;
  var posIsInsideMap = function posIsInsideMap(pos3D, mapMatrix) {

    _tmpVec = _tmpVec || new THREE.Vector3();

    // Compute position in map space [-1, 1] that we would get when using this map
    var mapPos = _tmpVec.copy(pos3D).applyProjection(mapMatrix);

    // Check if camera position is inside
    return Math.abs(mapPos.x) < 1.0 && Math.abs(mapPos.y) < 1.0;
  };

  // Configures the ortho-camera from given 3 points, so that:
  //  p0: appears at lower-left corner
  //  p1: appears at lower-right corner
  //  p2: appears at upper-left corner
  //
  // We assume that camera target.z is already set and on the sheet-plane level
  var setCameraFromFrustumCorners = function setCameraFromFrustumCorners(camera, p0, p1, p2) {

    // up-vector: p2-p0
    camera.up.x = p2.x - p0.x;
    camera.up.y = p2.y - p0.y;

    // position
    camera.position.x = 0.5 * (p1.x + p2.x);
    camera.position.y = 0.5 * (p1.y + p2.y);

    var frustumHeight = camera.up.length();

    // normalize up-vector
    camera.up.multiplyScalar(1.0 / frustumHeight);

    // For LMV ortho-cameras...
    // - The vertical frustum height is identical with the orthoScale 
    // - The orthoScale is determined by the distance between position and target
    // - For sheets, the view direction is always -z and zoom is manipulated by changing pos.z while having a constant target.z
    // Therefore, we obtain the desired frustum height by:
    var targetDist = frustumHeight;
    camera.position.z = camera.target.z + targetDist;

    // keep horizontal target position in sync
    camera.target.x = camera.position.x;
    camera.target.y = camera.position.y;

    // This updates the camera quaternion. Without this, modifying the up-vector would not have any effect.
    Bimfish.Viewing.Navigation.prototype.orient(camera, camera.target, camera.position, camera.up);
  };

  var setTopView = function setTopView(camera, bbox, zMin, zMax, orthoScale) {

    var center = THREE.Box3.prototype.center.call(bbox);

    // set camera pos to upper face center
    camera.position.copy(center);
    camera.position.z = zMax;

    // target distance defines orthoScale, which finally
    // defines the height of the orthoCam frustum in world-space
    camera.target.copy(camera.position);
    camera.target.z -= orthoScale;
    camera.isPerspective = false;

    // set up-vector for view from top
    camera.up.set(0, 1, 0);
    camera.worldup.set(0, 1, 0);

    // Configure near/far to see only zMin/zMax range
    camera.near = 0;
    camera.far = zMax - zMin;

    // This makes sure that compute3DTo2DMatrix() produces always the same resuts, no matter whether we do it before or after rendering.
    camera.updateCameraMatrices();
  };

  // Computes a Matrix4 that transforms from 3D model position to
  // normalized viewport coords ([-1,1]^2) on the minimap.
  var compute3DTo2DMatrix = function compute3DTo2DMatrix(camera, dstMatrix) {
    dstMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  };

  // Helper function to smoothen movement of scroll position and zoomScale.
  //  @param {number} dist      - distance to move to reach target directly. Must be >=0.
  //  @param {number} elapsed   - elapsed time in seconds
  //  @param {number} maxSpeed  - maximum allowed distance units per second
  //  @param {number} lastSpeed - motion speed according to last cycle (delta / elapsed)
  //  @param {number} acc       - acceleration speed (in distance units per s^2)
  //  @returns {number} Result is a distance <=dist, which is slowed down if needed for smoother movement.
  var motionSmoothing = function motionSmoothing(dist, elapsed, maxSpeed, lastSpeed, acc) {

    // Limit max scroll speed and avoid too sudden acceleration compared to last cycle
    var speed = Math.min(maxSpeed, lastSpeed + acc * elapsed);

    // Slow down with constant deceleration when approaching the target position:
    //
    //   With a constant acceleration a for a time of t seconds, we have:
    //     speed    = t*a
    //     distance = 0.5 * a * t^2
    //
    // To scroll a given distance d with constant acceleration a, the time needed is:
    //   t = sqrt(2*d / a)
    //
    // The speed reached at that point is:
    //   s = a * sqrt(2*d / a)
    //
    // Therefore, s as given above gives us the speed that we must have if distance d
    // to the target if we want to stop at the target given a constant deceleration of a.
    var slowDownSpeed = acc * Math.sqrt(2 * dist / acc);
    speed = Math.min(slowDownSpeed, speed);

    // restrict distance based on computed speed limit
    var maxDist = speed * elapsed;
    return Math.min(dist, maxDist);
  };

  // Rotates p around the center point. Works for Vector3 in xy too.
  //  @param {Vector2} p
  //  @param {Vector2} center
  //  @param {number}  angle  - counterclockwise angle in radians
  var rotateAround = function rotateAround(p, center, angle) {

    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var x = p.x - center.x;
    var y = p.y - center.y;

    p.x = x * c - y * s + center.x;
    p.y = x * s + y * c + center.y;
  };

  // Expands rect in-place by expanding the smallest axis around the center.
  //  @param {Box2} rect
  var expandToSquare = function expandToSquare(rect) {

    // determine scale factor from max-axis of sheet bounds
    var diag = rect.size();
    var center = rect.center();

    var radius = 0.5 * Math.max(diag.x, diag.y);

    rect.min.set(center.x - radius, center.y - radius);
    rect.max.set(center.x + radius, center.y + radius);
  };

  // Rescales a point p within srcBounds to [0.1]^2. Works in-place.
  //  @param {Vector2} p
  //  @param {Box2} srcBounds
  var boundsToUnitQuad = function boundsToUnitQuad(p, srcBounds) {
    var diagX = srcBounds.max.x - srcBounds.min.x;
    var diagY = srcBounds.max.y - srcBounds.min.y;

    p.x -= srcBounds.min.x;
    p.y -= srcBounds.min.y;

    p.x /= diagX;
    p.y /= diagY;
  };



  /***/
}),
