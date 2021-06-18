
/***/ "./extensions/AEC/levels/LevelUtils.js":
/*!*********************************************!*\
  !*** ./extensions/AEC/levels/LevelUtils.js ***!
  \*********************************************/
/*! exports provided: transformLevelsByMatrix, transformLevels, modelToLevels, aecModelDataToLevels, chooseMainModel, modelDataOccluders */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformLevelsByMatrix", function () { return transformLevelsByMatrix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformLevels", function () { return transformLevels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "modelToLevels", function () { return modelToLevels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "aecModelDataToLevels", function () { return aecModelDataToLevels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "chooseMainModel", function () { return chooseMainModel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "modelDataOccluders", function () { return modelDataOccluders; });

  function getProjectElevation(level) {
    var ext = level.extension;

    if (ext && ext.hasOwnProperty('projectElevation'))
      return ext.projectElevation;

    return level.elevation;
  }

  function transformLevelsByMatrix(levels, refPointTransformation) {

    var v = new THREE.Vector3();
    var transformByMatrix = function transformByMatrix(value) {
      v.set(0, 0, value);
      v.applyMatrix4(refPointTransformation);
      return v.z;
    };

    levels.forEach(function (currentLevel) {
      currentLevel.zMin = transformByMatrix(currentLevel.zMin);
      currentLevel.zMax = transformByMatrix(currentLevel.zMax);
    });
  }


  // transform is given as 12 floats
  function transformLevels(levels, refPointTransformation) {
    if (!refPointTransformation)
      return;

    // get transform as THREE.Matrix4
    var matrix = Bimfish.Viewing.BubbleNode.readMatrixFromArray12(refPointTransformation);
    transformLevelsByMatrix(levels, matrix);
  }

  function modelToLevels(model) {

    var bubbleNode = model.getDocumentNode();
    var modelData = bubbleNode.getAecModelData();

    if (!modelData || !modelData.levels || !modelData.levels.length) {
      return [];
    }

    return aecModelDataToLevels(modelData);
  }

  function aecModelDataToLevels(aecModelData, placementTf) {
    // levels are sorted ascending

    // we have to handle the building story flag of a Revit level
    // filter out all Revit levels which do not have building story set to true
    var filteredLevels = aecModelData.levels.filter(function (l) {
      var ext = l.extension;

      if (!ext)
        return true;

      //So.... if it has no buildingStory property, it's a building story...
      if (!ext.hasOwnProperty('buildingStory'))
        return true;

      return ext.buildingStory;
    });

    var levels = [];

    var count = filteredLevels.length;
    filteredLevels.forEach(function (currentLevel, index) {

      var nextElevation = undefined;
      if (index + 1 < count) {
        nextElevation = getProjectElevation(filteredLevels[index + 1]);
      } else {
        // for the topmost floor, we must use its height to determine the next boundary
        var topLevel = filteredLevels[filteredLevels.length - 1];
        var topLevelElevation = getProjectElevation(topLevel);
        nextElevation = topLevelElevation + topLevel.height;
      }

      //Explanation from design-collaboration repo:
      // Hint: the idea to move the level zMin value an inch down is to make sure that the
      // end-user can also see the bottom floor. Otherwise in some cases the floor would just
      // be cut-away by the floor selection. This value was defined after experimenting with
      // several models and maybe needs adjustment in the future.
      var zOffsetHack = 1 / 12;

      levels.push({
        index: levels.length,
        name: currentLevel.name,
        zMin: getProjectElevation(currentLevel) - zOffsetHack,
        zMax: nextElevation,
        guid: currentLevel.guid
      });

    });

    // If the model is known, use its attached transform. This variant works with any loadOptions. 
    if (placementTf) {
      transformLevelsByMatrix(levels, placementTf);
    } else {
      // If the model is not known, we assume that no zOffset is applied. This is only
      // true when using applyRefPoint=true and a gobalOffset with z=0.
      transformLevels(levels, aecModelData.refPointTransformation);
    }
    return levels;
  }

  function chooseMainModel(viewer) {

    var models = viewer.impl.modelQueue().getModels();
    var mainModel = null;
    var mainModelSize = -1;
    models.forEach(function (model) {

      if (model.is2d())
        return;

      var bubbleNode = model.getDocumentNode();

      if (!bubbleNode)
        return;

      var aecModelData = bubbleNode.getAecModelData();

      if (!aecModelData)
        return;

      if (bubbleNode.data.size > mainModelSize) {
        mainModel = model;
        mainModelSize = bubbleNode.data.size;
      } else if (!bubbleNode.data.size && mainModelSize === -1) {
        mainModel = model;
        mainModelSize = 0;
      }
    });
    return mainModel;
  }

  function modelDataOccluders(viewer) {

    var models = viewer.impl.modelQueue().getModels();

    var occludersPerModel = new Map();

    models.forEach(function (model) {

      if (model.is2d())
        return;

      var bubbleNode = model.getDocumentNode();
      if (!bubbleNode)
        return;
      var aecModelData = bubbleNode.getAecModelData();
      if (!aecModelData)
        return;

      occludersPerModel.set(model.id, aecModelData.levelOccluderIds);
    });

    return { modelsDbIds: occludersPerModel };
  }

  /***/
}),
