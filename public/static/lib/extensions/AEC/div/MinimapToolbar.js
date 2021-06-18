


/***/ "./extensions/AEC/Minimap3D/MinimapToolbar.js":
/*!****************************************************!*\
  !*** ./extensions/AEC/Minimap3D/MinimapToolbar.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return MinimapToolbar; });
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  var av = Bimfish.Viewing;
  var avu = av.UI;

  var GlobalManagerMixin = av.GlobalManagerMixin; var

    MinimapToolbar = /*#__PURE__*/function () {

      function MinimapToolbar(parent) {
        _classCallCheck(this, MinimapToolbar);

        this.parent = parent;
        this.setGlobalManager(parent.globalManager);

        var _document = this.getDocument();
        // Create container element with vertically aligned buttons
        this.mapButtonBar = _document.createElement('div');
        this.mapButtonBar.classList.add('map-button-bar');
        parent.mapWidgetRoot.appendChild(this.mapButtonBar);

        // This is necessary to keep buttons working in side-by-side mode. 
        // E.g., button hover border color is specified in theme styles.
        this.mapButtonBar.classList.add('adsk-viewing-viewer');
        this.mapButtonBar.classList.add(parent.viewer.theme);

        // Create toggle to switch between small map and side-by-side map
        this.sideBySideButton = new avu.Button("Minimap_SideBySide");
        this.sideBySideButton.setGlobalManager(this.globalManager);
        this.sideBySideButton.onClick = function () { return parent.setSideBySideEnabled(!parent.sideBySideEnabled); };
        this.sideBySideButton.icon.innerHTML = createMapExpandIcon();
        this.mapButtonBar.appendChild(this.sideBySideButton.container);

        // Create alternative icon that we show in expanded mode
        this.shrinkIcon = _document.createElement('div');
        this.shrinkIcon.innerHTML = createMapShrinkIcon();
        this.sideBySideButton.container.appendChild(this.shrinkIcon);

        // Create toggle to switch between default map and sheets 
        this.sheetModeButton = new avu.Button("Minimap_SheetMode");
        this.sheetModeButton.setGlobalManager(this.globalManager);
        this.sheetModeButton.onClick = function () { return parent.setSheetMapEnabled(!parent.useSheet); };
        this.sheetModeButton.icon.innerHTML = createSheetMapIcon();
        this.mapButtonBar.appendChild(this.sheetModeButton.container);

        // Some customizations for LMV buttons
        var adjustButtonStyle = function adjustButtonStyle(button) {

          //Default LMV buttons are too large for the minimap 
          button.container.style.width = '17px';
          button.container.style.height = '17px';

          // The icon class adds a top-padding of 3 which broke the centering of the button.
          button.icon.classList.remove('adsk-button-icon');

          // Show tooltips left of the buttons and vertically centered. 
          // The default behavior would place the tooltip outside of canvas and minimap, 
          // so that they would not be visible.
          button.setToolTip(""); // Init tooltip element
          var tts = button._toolTipElement.style;
          tts.bottom = '6.5px';
          tts.top = 'auto';
          tts.left = 'auto';
          tts.right = '130%';
          tts.zIndex = 3;
        };

        adjustButtonStyle(this.sideBySideButton);
        adjustButtonStyle(this.sheetModeButton);

        // Hide toolbar by default - unless activated by feature flag
        if (!this.parent.options.enableSheetMapAndSideBySide) {
          this.mapButtonBar.style.display = "none";
        }

        this.sheetModeButton.icon.style.display = "inline";
        // Set icons and tooltips
        this.update();
      } _createClass(MinimapToolbar, [{
        key: "setSideBySideButtonDisabled", value: function setSideBySideButtonDisabled(

          disable) {
          this.parent.options.sideBySideButtonDisabled = disable;
        }
      }, {
        key: "update", value: function update() {
          // Show expand/collapse icon depending on current state
          this.shrinkIcon.style.display = this.parent.sideBySideEnabled ? "inline" : "none";
          this.sideBySideButton.icon.style.display = this.parent.sideBySideEnabled ? "none" : "inline";

          // Disable sheetNode button if no sheet is available
          var sheetAvailable = this.parent.sheetMapsAvailable();
          var state = sheetAvailable ? this.parent.useSheet ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE : avu.Button.State.DISABLED;
          this.sheetModeButton.setState(state);
          this.sideBySideButton.setState(this.parent.options.sideBySideButtonDisabled ? avu.Button.State.DISABLED : avu.Button.State.INACTIVE);

          // Set tooltips based on current states
          var Expand = Bimfish.Viewing.i18n.translate('Show large map');
          var Shrink = Bimfish.Viewing.i18n.translate('Show small map');
          var ShowSheets = Bimfish.Viewing.i18n.translate('Show sheet');
          var NoSheets = Bimfish.Viewing.i18n.translate('No sheets available');

          this.sideBySideButton.setToolTip(this.parent.sideBySideEnabled ? Shrink : Expand);
          this.sheetModeButton.setToolTip(sheetAvailable ? ShowSheets : NoSheets);

          if (this.parent.sideBySideEnabled) {
            this.mapButtonBar.classList.add('side-by-side');

            if (this.parent.sideBySideOptions.left2DView) {
              this.mapButtonBar.classList.add('left-2d-view');
            }
          } else {
            this.mapButtonBar.classList.remove('side-by-side');
          }
        }
      }]); return MinimapToolbar;
    }();


  GlobalManagerMixin.call(MinimapToolbar.prototype);

  var createSheetMapIcon = function createSheetMapIcon() {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 70 61">',
      '<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">',
      '<rect id="Rectangle" stroke="#000000" stroke-width="3" x="51.5" y="41.5" width="1" height="7"></rect>',
      '<rect id="Rectangle-Copy" stroke="#000000" stroke-width="3" x="51.5" y="28.5" width="1" height="7"></rect>',
      '<rect id="Rectangle-Copy-2" stroke="#000000" stroke-width="3" x="51.5" y="11.5" width="1" height="10"></rect>',
      '<rect id="Rectangle-Copy-3" stroke="#000000" stroke-width="3" x="58.5" y="11.5" width="1" height="17"></rect>',
      '<rect id="Rectangle-Copy-4" stroke="#000000" stroke-width="3" x="58.5" y="35.5" width="1" height="3"></rect>',
      '<rect id="Rectangle-Copy-5" stroke="#000000" stroke-width="3" x="58.5" y="45.5" width="1" height="3"></rect>',
      '<path d="M11.5,11.5 L11.5,28.5 L29.5,28.5 L29.5,48.5 L44.5,48.5 L44.5,11.5 L11.5,11.5 Z" id="Path-3" stroke="#000000" stroke-width="3"></path>',
      '<path d="M11.5,35.5 L11.5,45.5 L23.5,45.5 L23.5,35.5 L11.5,35.5 Z" id="Path-3" stroke="#000000" stroke-width="3"></path>',
      '<path d="M3,3 L3,57 L67,57 L67,3 L3,3 Z" id="Path-3" stroke="#000000" stroke-width="6"></path>',
      '</g>',
      '</svg>'].
      join('');
  };

  var createMapExpandIcon = function createMapExpandIcon() {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">',
      '<g fill-rule="evenodd">',
      '<polygon points="9.013 5.28 21.779 5.28 21.779 0 0 0 0 21.779 5.28 21.779 5.28 9.013 23.363 27.097 27.097 23.363"/>',
      '<polygon points="27.097 46.637 23.363 42.903 5.28 60.987 5.28 48.221 0 48.221 0 70 21.779 70 21.779 64.72 9.013 64.72"/>',
      '<polygon points="48.221 0 48.221 5.28 60.987 5.28 42.903 23.363 46.637 27.097 64.72 9.013 64.72 21.779 70 21.779 70 0"/>',
      '<polygon points="64.72 48.221 64.72 60.987 46.637 42.903 42.903 46.637 60.987 64.72 48.221 64.72 48.221 70 70 70 70 48.221"/>',
      '</g>',
      '</svg>'].
      join('');
  };

  var createMapShrinkIcon = function createMapShrinkIcon() {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">',
      '<g fill-rule="evenodd">',
      '<polygon points="9.013 5.28 21.779 5.28 21.779 0 0 0 0 21.779 5.28 21.779 5.28 9.013 23.363 27.097 27.097 23.363" transform="rotate(180 13.548 13.548)"/>',
      '<polygon points="27.097 46.637 23.363 42.903 5.28 60.987 5.28 48.221 0 48.221 0 70 21.779 70 21.779 64.72 9.013 64.72" transform="rotate(180 13.548 56.452)"/>',
      '<polygon points="48.221 0 48.221 5.28 60.987 5.28 42.903 23.363 46.637 27.097 64.72 9.013 64.72 21.779 70 21.779 70 0" transform="rotate(180 56.452 13.548)"/>',
      '<polygon points="64.72 48.221 64.72 60.987 46.637 42.903 42.903 46.637 60.987 64.72 48.221 64.72 48.221 70 70 70 70 48.221" transform="rotate(180 56.452 56.452)"/>',
      '</g>',
      '</svg>'].
      join('');
  };

  /***/
}),
