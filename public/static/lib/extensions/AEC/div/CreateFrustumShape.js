/***/ "./extensions/AEC/CanvasBookmark/CreateFrustumShape.js":
/*!*************************************************************!*\
  !*** ./extensions/AEC/CanvasBookmark/CreateFrustumShape.js ***!
  \*************************************************************/
/*! exports provided: createFrustumShape */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFrustumShape", function () { return createFrustumShape; });


  // Returns a THREE.Scene to represent the camera frustum
  function createFrustumShape(pos, dir) {
    // The frustum shape is a symbol to explain pos and dir - not the exact frustum.
    var FovVert = 17;
    var FovHor = 17;

    // Frustum shape/outline opacity when fully faded in
    var FrustumOpacity = 0.05;
    var LineOpacity = 1.0;

    var radians = THREE.Math.degToRad;
    var dx = Math.sin(radians(FovHor));
    var dy = Math.sin(radians(FovVert));

    // compute z in a way that the results are normalized
    var dz = Math.sqrt(1 - dx * dx - dy * dy);

    // compute directions for the 4 frustum-corners
    var bottomLeft = new THREE.Vector3(-dx, -dy, dz);

    var bottomRight = new THREE.Vector3(dx, -dy, dz);
    var topLeft = new THREE.Vector3(-dx, dy, dz);
    var topRight = new THREE.Vector3(dx, dy, dz);

    // create mesh vertices: 4 corners + origin
    var vertices = new Float32Array([
      bottomLeft.x, bottomLeft.y, bottomLeft.z,
      bottomRight.x, bottomRight.y, bottomRight.z,
      topLeft.x, topLeft.y, topLeft.z,
      topRight.x, topRight.y, topRight.z,
      0, 0, 0]);


    var bl = 0;
    var br = 1;
    var tl = 2;
    var tr = 3;
    var p0 = 4; // index of camera position vertex

    var indices = new Uint32Array([
      p0, br, bl, // bottom face
      p0, tr, br, // right face
      p0, tl, tr, // top face
      p0, bl, tl, // left face
      bl, br, tr, // far face lower tri
      bl, tr, tl // face face upper tri
    ]);

    // Extract vertices to non-indexed, so that we can compute face-normals
    var vertsNonIndexed = new Float32Array(3 * indices.length);
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      vertsNonIndexed[3 * i] = vertices[3 * index];
      vertsNonIndexed[3 * i + 1] = vertices[3 * index + 1];
      vertsNonIndexed[3 * i + 2] = vertices[3 * index + 2];
    }

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertsNonIndexed, 3));

    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({
      color: 0x5050FF,
      transparent: true,
      opacity: 0.0, // will change with fade-in
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending
    });


    var mesh = new THREE.Mesh(geometry, material);

    // create frustum lines
    var lineIndices = new Uint32Array([
      p0, bl,
      p0, br,
      p0, tr,
      p0, tl,
      bl, br,
      br, tr,
      tr, tl,
      tl, bl]);


    var lineGeom = new THREE.BufferGeometry();
    lineGeom.addAttribute('index', new THREE.BufferAttribute(lineIndices, 1));
    lineGeom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    lineGeom.isLines = true;

    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0.0, // will change with fade-in
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending // NOTE: Overlay target is blended anyway. So, using blend here would blend with black.
    });

    var lineMesh = new THREE.Mesh(lineGeom, lineMaterial);

    // Create THREE Scene and add meshes
    var scene = new THREE.Scene();
    scene.add(mesh);
    scene.add(lineMesh);

    // Workaround: Tag geometry as visible - otherwise it is skipped by computeObjectBounds (see Viewer3DImpl).
    // TODO: My guess is that this is a bug in LMV. Once we know for sure that it doesn't break anything
    //       we should change it in LMV instead and don't need to set this manually anymore.
    geometry.visible = true;
    lineGeom.visible = true;

    // Makes it more debugger-friendly (allow you to recognize this shape within LMV)
    mesh.name = 'FrustumGizmo';

    // Set frustum shape size
    // TODO: Consider smarter way to determine size, e.g. consider model units or model box
    var size = 50;
    scene.scale.set(size, size, size);

    // move tip of the frustum to camera position
    scene.position.copy(pos);

    // orient frustum shape to look towards camera direction
    var origin = new THREE.Vector3(0, 0, 0);
    var up = new THREE.Vector3(0, 0, 1);
    var invDir = new THREE.Vector3(-dir.x, -dir.y, -dir.z); // lookat directions in THREE are defined 'towards' an object
    var rotationMatrix = new THREE.Matrix4().lookAt(origin, invDir, up);
    scene.rotation.setFromRotationMatrix(rotationMatrix);

    // Just disable culling - it's not worth to care about computing BoundingSpheres etc.
    scene.frustumCulled = false;
    mesh.frustumCulled = false;
    lineMesh.frustumCulled = false;

    // Attach function to control overall opacity (fadeValue is in [0,1])
    scene.setFadeValue = function (fadeValue) {
      material.opacity = FrustumOpacity * fadeValue;
      lineMaterial.opacity = LineOpacity * fadeValue;
    };

    return scene;
  }

  /***/
}),
