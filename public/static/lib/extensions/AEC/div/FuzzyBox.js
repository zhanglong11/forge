
/***/ "./extensions/AEC/Minimap3D/FuzzyBox.js":
/*!**********************************************!*\
  !*** ./extensions/AEC/Minimap3D/FuzzyBox.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return fuzzyBox; });

  // Sum of all fragment bbox centers, each weighted by bbox size
  function centerOfMass(model) {

    var frags = model.getFragmentList();

    var box = new THREE.Box3();
    var center = new THREE.Vector3();
    var size = new THREE.Vector3();
    var total = new THREE.Vector3();
    var mass = 0;

    function processOneFragment(f) {

      // get bbox center
      frags.getWorldBounds(f, box);
      box.center(center);

      // sum centers weighted by bbox size
      var weight = box.size(size).length();
      total.add(center.multiplyScalar(weight));

      mass += weight;
    }

    for (var i = 0; i < frags.getCount(); i++) {
      processOneFragment(i);
    }

    total.multiplyScalar(1 / mass);
    return total;
  }

  // Computes bbox of all fragments, but excluding outliers.
  function fuzzyBox(model, center, quantil) {

    center = center || centerOfMass(model);
    quantil = quantil || 0.75;

    var frags = model.getFragmentList();
    var fragBox = new THREE.Box3();

    // Compute distances of each frag bbox from center
    var fragInfos = [];
    for (var i = 0; i < frags.getCount(); i++) {

      // Skip any empty boxes
      frags.getWorldBounds(i, fragBox);
      if (fragBox.empty()) {
        continue;
      }

      // get fragBox->center distance
      var dist = fragBox.distanceToPoint(center);

      // If fragBox contains the center, use fragBox center.
      if (dist == 0) {
        dist = center.distanceTo(fragBox.center());
      }

      fragInfos.push({
        fragId: i,
        distance: dist
      });

    }

    // sort by increasing order    
    fragInfos.sort(function (a, b) {
      return a.distance - b.distance;
    });

    // union of all fragBoxes, excluding the ones with largest distance to center
    var box = new THREE.Box3();
    for (var i = 0; i < fragInfos.length * quantil; i++) {
      var fi = fragInfos[i];
      frags.getWorldBounds(fi.fragId, fragBox);
      box.union(fragBox);
    }
    return box;
  }

  /***/
}),