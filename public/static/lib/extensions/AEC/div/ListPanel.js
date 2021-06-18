

/***/ "./extensions/AEC/ui/ListPanel.js":
/*!****************************************!*\
  !*** ./extensions/AEC/ui/ListPanel.js ***!
  \****************************************/
/*! exports provided: ListPanelEvents, ListPanel */
/***/ (function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  __webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListPanelEvents", function () { return ListPanelEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListPanel", function () { return ListPanel; });

  var av = Bimfish.Viewing;
  var avu = Bimfish.Viewing.UI;


  var ListPanelEvents = {

    /**
                                  * Fired when clicking on an item. (not fired when setting current item per code)
                                  *  @property {Object} item  - data item being selected.
                                  */
    ITEM_SELECT: 'itemSelect',

    /**
                                * @property {Object} item - data item being selected.
                                */
    ITEM_MOUSE_ENTER: 'itemMouseEnter',
    ITEM_MOUSE_LEAVE: 'itemMouseLeave'
  };


  function ListPanel(parentContainer, id, title, options) {

    avu.DockingPanel.call(this, parentContainer, id, title, options);

    av.EventDispatcher.prototype.apply(this);

    this.container.classList.add('list-panel');
    this.container.dockRight = true;
    this.createScrollContainer({ left: false, heightAdjustment: 65, marginTop: 0 });
  }

  ListPanel.prototype = Object.create(avu.DockingPanel.prototype);

  // @param {Object[]} items - Array order defines display order top-down.
  ListPanel.prototype.setItems = function (items) {

    this.buttons = [];
    this.items = items;

    // remove old list
    if (this.listDiv) {
      this.scrollContainer.removeChild(this.listDiv);
    }
    var _document = this.getDocument();
    this.listDiv = _document.createElement('div');
    this.listDiv.classList.add('itemList');

    this.scrollContainer.appendChild(this.listDiv);

    var scope = this;

    var createButton = function createButton(item) {

      var itemText = scope._getItemText ? scope._getItemText(item) : '<no item text>';

      var button = _document.createElement('div');
      button.classList.add('listItem');
      button.item = item;
      button.setAttribute('title', itemText);

      button.addEventListener('click', function () {
        scope.fireEvent({
          type: ListPanelEvents.ITEM_SELECT,
          item: item
        });

      });
      button.addEventListener('mouseenter', function () {
        scope.fireEvent({
          type: ListPanelEvents.ITEM_MOUSE_ENTER,
          item: item
        });

      });
      button.addEventListener('mouseleave', function () {
        scope.fireEvent({
          type: ListPanelEvents.ITEM_MOUSE_LEAVE,
          item: item
        });

      });

      var textSpan = _document.createElement('span');
      textSpan.innerHTML = itemText;
      textSpan.classList.add("text");

      // This container DIV is required to enable proper text fade-out for long texts.
      var textContainerDiv = _document.createElement('div');
      textContainerDiv.classList.add("textContainer");
      textContainerDiv.appendChild(textSpan);
      button.appendChild(textContainerDiv);

      var warnSpan = _document.createElement('span');
      warnSpan.classList.add("list-panel-item-warning");
      button.appendChild(warnSpan);
      button.warnSpan = warnSpan;

      var checkSpan = _document.createElement('span');
      checkSpan.classList.add("icon");
      button.appendChild(checkSpan);

      return button;
    };

    for (var index = 0; index < items.length; index++) {

      var item = items[index];
      var button = createButton(item);

      this.listDiv.appendChild(button);
      this.buttons.push(button);
    }

    this.updateItemStates();
  };

  ListPanel.prototype.updateItemStates = function () {

    if (!this.buttons) {
      return;
    }
    for (var i = 0; i < this.buttons.length; i++) {

      // set/unset checkmark
      var button = this.buttons[i];
      button.classList.remove("selected");
      if (this._isSelected && this._isSelected(button.item)) {
        button.classList.add("selected");
      }

      // set/unset warning symbol
      var warnText = this._getWarningText && this._getWarningText(button.item);
      button.warnSpan.style.visibility = warnText ? 'visible' : 'hidden';
      button.warnSpan.setAttribute('title', warnText || '');
    }
  };

  // Set functions to define how to handle each item
  //  @param {function(item)} isSelected       - takes a list item (see setItems) and returns true for 'selected state'
  //  @param {function(item)} getItemText      - returns the text to be displayed
  //  @param {function(item)} [getWarningText] - Optional: Display a warning symbol. Function defines tooltip text.
  ListPanel.prototype.setItemHandlers = function (isSelected, getItemText, getWarningText) {
    this._isSelected = isSelected;
    this._getItemText = getItemText;
    this._getWarningText = getWarningText;
    this.updateItemStates();
  };

  avu.ListPanelEvents = ListPanelEvents;
  avu.ListPanel = ListPanel;

  /***/
}),