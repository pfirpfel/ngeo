goog.provide('ngeo.message.displaywindowComponent');

goog.require('ngeo'); // nowebpack
// webpack: import 'jquery-ui/ui/widgets/resizable.js';
// webpack: import 'angular-sanitize';


/**
 * @type {!angular.Module}
 */
ngeo.message.displaywindowComponent = angular.module('ngeoMessageDisplaywindowComponent', [
  'ngSanitize',
]);


// webpack: exports.run(/* @ngInject */ ($templateCache) => {
// webpack:   $templateCache.put('ngeo/message/displaywindowComponent', require('./displaywindowComponent.html'));
// webpack: });


ngeo.message.displaywindowComponent.value('ngeoMessageDisplaywindowTemplateUrl',
  /**
   * @param {!angular.Attributes} $attrs Attributes.
   * @return {string} The template url.
   */
  ($attrs) => {
    const templateUrl = $attrs['ngeoMessageDisplaywindowTemplateUrl'];
    return templateUrl !== undefined ? templateUrl :
      `${ngeo.baseModuleTemplateUrl}/message/displaywindowComponent.html`; // nowebpack
    // webpack: 'ngeo/message/displaywindowComponent';
  });

/**
 * @param {!angular.Attributes} $attrs Attributes.
 * @param {!function(!angular.Attributes): string} ngeoMessageDisplaywindowTemplateUrl Template function.
 * @return {string} Template URL.
 * @ngInject
 */
function ngeoMessageDisplaywindowTemplateUrl($attrs, ngeoMessageDisplaywindowTemplateUrl) {
  return ngeoMessageDisplaywindowTemplateUrl($attrs);
}


/**
 * @private
 */
ngeo.message.displaywindowComponent.Controller_ = class {

  /**
   * The `ngeo-displaywindow` component is an alternative to the `ngeo.message.Popup`.
   * What they have in common:
   *
   * - support title
   * - support url to be shown in an iframe
   * - support plain HTML content
   * - support sizing, i.e. height and width.
   * - support being opened/closed
   *
   * The differences with the `ngeo.message.Popup` are:
   *
   * - it supports being dragged
   * - it supports being resized
   *
   * @param {!angular.Scope} $scope Scope.
   * @param {!jQuery} $element Element.
   * @param {angular.$compile} $compile The compile provider.
   * @param {!angular.$sce} $sce Angular sce service.
   * @param {angular.$interpolate} $interpolate
   * @private
   * @struct
   * @ngInject
   * @ngdoc controller
   * @ngname ngeoDisplaywindowComponentController
   */
  constructor($scope, $element, $compile, $sce, $interpolate) {

    // === Binding Properties ===

    /**
     * @type {boolean}
     * @export
     */
    this.clearOnClose;

    /**
     * @type {?string}
     * @export
     */
    this.content;

    /**
     * @type {?string}
     * @export
     */
    this.contentTemplate;

    /**
     * @type {?angular.Scope}
     */
    this.contentScope;

    /**
     * @type {boolean}
     * @export
     */
    this.draggable;

    /**
     * @type {Element|string}
     * @export
     */
    this.draggableContainment;

    /**
     * @type {boolean}
     * @export
     */
    this.desktop;

    /**
     * @type {?string}
     * @export
     */
    this.height;

    /**
     * @type {boolean}
     * @export
     */
    this.open;

    /**
     * @type {boolean}
     * @export
     */
    this.resizable;

    /**
     * @type {?string}
     * @export
     */
    this.title;

    /**
     * @type {?string}
     * @export
     */
    this.url;

    /**
     * @type {?string}
     * @export
     */
    this.width;


    // === Injected Properties ===

    /**
     * @type {angular.Scope}
     * @private
     */
    this.$scope_ = $scope;

    /**
     * @type {!jQuery}
     * @private
     */
    this.element_ = $element;

    /**
     * @type {angular.$compile}
     * @private
     */
    this.$compile_ = $compile;

    /**
     * @type {!angular.$sce}
     * @private
     */
    this.sce_ = $sce;

    /**
     * @type {angular.$interpolate}
     * @private
     */
    this.$interpolate_ = $interpolate;
  }

  /**
   * Called on initialization of the component.
   */
  $onInit() {

    // Initialize binding properties
    this.clearOnClose = this.clearOnClose !== false;
    this.content = this.content || null;
    this.contentTemplate = this.contentTemplate || null;
    this.contentScope = this.contentScope || null;
    this.desktop = this.desktop !== false;
    this.draggableContainment = this.draggableContainment || 'document';
    this.height = this.height || null;
    this.open = this.open === true;
    this.title = this.title || null;
    this.url = this.url || null;
    this.width = this.width || null;

    this.draggable = this.draggable !== undefined ?
      this.draggable : this.desktop;
    this.resizable = this.resizable !== undefined ?
      this.resizable : this.desktop;

    // Draggable
    if (this.draggable) {
      this.element_.find('.ngeo-displaywindow .windowcontainer').draggable({
        'containment': this.draggableContainment
      });
    }

    // Resizable
    if (this.resizable) {
      this.element_.find('.ngeo-displaywindow .windowcontainer').resizable({
        'minHeight': 240,
        'minWidth': 240
      });
    }

    if (this.contentTemplate) {
      const scope = this.contentScope || this.$scope_;
      const compiled = this.$compile_(this.contentTemplate)(scope);
      //const compiled = this.$interpolate_(this.contentTemplate)(scope);
      const popupWindow = this.element_.find('.ngeo-displaywindow .windowcontainer .animation-container');
      popupWindow.append(compiled);
    }
  }

  /**
   * @export
   */
  close() {
    this.open = false;
    if (this.clearOnClose) {
      this.clear_();
    }
  }

  /**
   * @return {!Object.<string, string>} CSS style when using width/height
   * @export
   */
  get style() {
    return {
      'height': this.height || '240px',
      'width': this.height || '240px'
    };
  }

  /**
   * @return {string|undefined} Trusted url.
   * @export
   */
  get urlTrusted() {
    if (this.url !== null) {
      return /** @type {string} */ (this.sce_.trustAsResourceUrl(this.url));
    }
  }

  /**
   * @export
   */
  clear_() {
    this.content = null;
    this.height = null;
    this.title = null;
    this.url = null;
    this.width = null;
  }
};


ngeo.message.displaywindowComponent.component('ngeoDisplaywindow', {
  bindings: {
    'clearOnClose': '<',
    'content': '=',
    'contentTemplate': '<',
    'contentScope': '<',
    'desktop': '<',
    'draggable': '<',
    'draggableContainment': '<',
    'height': '=',
    'open': '=',
    'resizable': '<',
    'title': '=',
    'url': '=',
    'width': '='
  },
  controller: ngeo.message.displaywindowComponent.Controller_,
  templateUrl: ngeoMessageDisplaywindowTemplateUrl
});
