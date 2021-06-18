/***/ "./extensions/AEC/hyperlinks/HyperlinkExtension.js":
/*!*********************************************************!*\
  !*** ./extensions/AEC/hyperlinks/HyperlinkExtension.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function () { return HyperlinkExtension; });
/* harmony import */ var _HyperlinkTracker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HyperlinkTracker */ "./extensions/AEC/hyperlinks/HyperlinkTracker.js");
  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); } function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; } function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); } function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; } function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); } function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); } function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  var av = Bimfish.Viewing;
  var namespace = BimfishNamespace('Bimfish.AEC');
  var myExtensionName = 'Bimfish.AEC.HyperlinkExtension';


  // Hyperlink extension which will display hyperlinks in 2D sheets to other sheets
  //  @param {Number} options.rootBubbleNode Root bubble node of model
  //  @callback options.loadViewableCb Will be called in case a hyperlink is clicked with bubble node of the sheet and
  //      the total number of hyperlinks present in the sheet
  //  @callback options.hyperlinksAddedCb Will be called each time hyperlinks have been added to a sheet with the id of
  //      the model and the total number of hyperlinks present in the sheet
  var HyperlinkExtension = /*#__PURE__*/function (_av$Extension) {
    _inherits(HyperlinkExtension, _av$Extension);
    function HyperlinkExtension(viewer, options) {
      var _this; _classCallCheck(this, HyperlinkExtension);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(HyperlinkExtension).call(this, viewer, options));

      _this.hyperlinkTracker = new _HyperlinkTracker__WEBPACK_IMPORTED_MODULE_0__["default"](_this.viewer, _this.options.rootBubbleNode,
        _this.options.loadViewableCb, _this.options.hyperlinksAddedCb); return _this;
    } _createClass(HyperlinkExtension, [{
      key: "load", value: function load() {
        this.viewer.toolController.activateTool('hyperlink-tracker');
        return true;
      }
    }, {
      key: "unload", value: function unload() {
        this.viewer.toolController.deactivateTool('hyperlink-tracker');
        return true;
      }
    }]); return HyperlinkExtension;
  }(av.Extension);


  namespace.HyperlinkExtension = HyperlinkExtension;
  Bimfish.Viewing.theExtensionManager.registerExtension(myExtensionName, HyperlinkExtension);

  /***/
}),
