goog.provide('gmf.backgroundlayerselector.component');

goog.require('gmf'); // nowebpack
goog.require('gmf.theme.Themes');
goog.require('ngeo.map.BackgroundLayerMgr');
goog.require('ol.events');


/**
 * @type {!angular.Module}
 */
gmf.backgroundlayerselector.component = angular.module('gmfBackgroundlayerselector', [
  gmf.theme.Themes.module.name,
  ngeo.map.BackgroundLayerMgr.module.name,
]);


gmf.backgroundlayerselector.component.value('gmfBackgroundlayerselectorTemplateUrl',
  /**
   * @param {!angular.JQLite} $element Element.
   * @param {!angular.Attributes} $attrs Attributes.
   * @return {string} Template URL.
   */
  ($element, $attrs) => {
    const templateUrl = $attrs['gmfBackgroundlayerselectorTemplateurl'];
    return templateUrl !== undefined ? templateUrl :
      `${gmf.baseModuleTemplateUrl}/backgroundlayerselector/component.html`; // nowebpack
    // webpack: 'gmf/backgroundlayerselector';
  }
);


// webpack: exports.run(/* @ngInject */ ($templateCache) => {
// webpack:   $templateCache.put('gmf/backgroundlayerselector', require('./component.html'));
// webpack: })


/**
 * @param {!angular.JQLite} $element Element.
 * @param {!angular.Attributes} $attrs Attributes.
 * @param {!function(!angular.JQLite, !angular.Attributes): string} gmfBackgroundlayerselectorTemplateUrl Template function.
 * @return {string} Template URL.
 * @ngInject
 */
function gmfBackgroundlayerselectorTemplateUrl($element, $attrs, gmfBackgroundlayerselectorTemplateUrl) {
  return gmfBackgroundlayerselectorTemplateUrl($element, $attrs);
}


/**
 * Provide a "background layer selector" component.
 *
 * Example:
 *
 *      <gmf-backgroundlayerselector
 *        gmf-backgroundlayerselector-map="::ctrl.map"
 *        gmf-backgroundlayer-opacity-options="::ctrl.bgOpacityOptions"
 *        gmf-backgroundlayerselector-select="onBackgroundSelected()">
 *      </gmf-backgroundlayerselector>
 *
 * Used UI metadata:
 *
 *  * thumbnail: The URL used for the icon.
 *
 * @htmlAttribute {ol.Map=} gmf-backgroundlayerselector-map The map.
 * @htmlAttribute {string} gmf-backgroundlayer-opacity-options The opacity slider options.
 * @htmlAttribute {Function} gmf-backgroundlayerselector-select Function called
 *     when a layer was selected by the user.
 *
 * @ngdoc component
 * @ngname gmfBackgroundlayerselector
 */
gmf.backgroundlayerselector.component.component_ = {
  controller: 'GmfBackgroundlayerselectorController as ctrl',
  bindings: {
    'map': '=gmfBackgroundlayerselectorMap',
    'opacityOptions': '=gmfBackgroundlayerOpacityOptions',
    'select': '&?gmfBackgroundlayerselectorSelect'
  },
  templateUrl: gmfBackgroundlayerselectorTemplateUrl
};


gmf.backgroundlayerselector.component.component('gmfBackgroundlayerselector',
  gmf.backgroundlayerselector.component.component_);


/**
 * @constructor
 * @private
 * @struct
 * @param {!angular.Scope} $scope Angular scope.
 * @param {!ngeo.map.BackgroundLayerMgr} ngeoBackgroundLayerMgr Background layer manager.
 * @param {!gmf.theme.Themes} gmfThemes Themes service.
 * @ngInject
 * @ngdoc controller
 * @ngname GmfBackgroundlayerselectorController
 */
gmf.backgroundlayerselector.component.Controller_ = function($scope, ngeoBackgroundLayerMgr, gmfThemes) {

  /**
   * @type {?ol.Map}
   * @export
   */
  this.map;

  /**
   * @type {!string|undefined}
   * @export
   */
  this.opacityOptions;

  /**
   * Function called when a layer was selected by the user.
   * @type {?Function}
   * @export
   */
  this.select;

  /**
   * @type {?ol.layer.Base}
   * @export
   */
  this.bgLayer;

  /**
   * @type {?Array.<!ol.layer.Base>}
   * @export
   */
  this.bgLayers;

  /**
   * @type {ol.layer.Base}
   * @export
   */
  this.opacityLayer;

  /**
   * @type {!gmf.theme.Themes}
   * @private
   */
  this.gmfThemes_ = gmfThemes;

  /**
   * @type {!Array.<!ol.EventsKey>}
   * @private
   */
  this.listenerKeys_ = [];

  this.listenerKeys_.push(ol.events.listen(gmfThemes, 'change', this.handleThemesChange_, this));

  /**
   * @type {!ngeo.map.BackgroundLayerMgr}
   * @private
   */
  this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;

  this.listenerKeys_.push(ol.events.listen(this.backgroundLayerMgr_, 'change',
    /**
     * @param {!ngeox.BackgroundEvent} event Event.
     */
    (event) => {
      this.bgLayer = event.detail.current;
    }));

  $scope.$on('$destroy', this.handleDestroy_.bind(this));
};


/**
 * Initialise the controller.
 */
gmf.backgroundlayerselector.component.Controller_.prototype.$onInit = function() {
  this.handleThemesChange_();
};


/**
 * Called when the themes changes. Set (or reset) the backround layers.
 * @private
 */
gmf.backgroundlayerselector.component.Controller_.prototype.handleThemesChange_ = function() {
  this.gmfThemes_.getBgLayers().then((layers) => {
    this.bgLayers = layers;

    if (this.opacityOptions !== undefined) {
      const opacityLayer = layers.find(layer => layer.get('label') === this.opacityOptions);
      if (opacityLayer !== undefined) {
        this.setOpacityBgLayer(opacityLayer);
        this.opacityLayer = opacityLayer;

        // Reorder for the UI the bgArray copy with the opacity layer at the end
        this.bgLayers = this.bgLayers.slice();
        const indexOpa = this.bgLayers.findIndex(layer => layer === this.opacityLayer);
        this.bgLayers.splice(indexOpa, 1);
        this.bgLayers.push(opacityLayer);
      }
    }
  });
};

/**
 * Getter/setter for background layer overlay, used by opacity slider.
 * @param {?number} val The opacity.
 * @returns {number} The background layer opacity.
 */
gmf.backgroundlayerselector.component.Controller_.prototype.getSetBgLayerOpacity = function(val) {
  if (val) {
    this.opacityLayer.setOpacity(val);
  }
  return this.opacityLayer.getOpacity();
};

/**
 * @param {ol.layer.Base} layer Layer.
 * @param {boolean=} opt_silent Do not notify listeners.
 * @export
 */
gmf.backgroundlayerselector.component.Controller_.prototype.setLayer = function(layer, opt_silent) {
  this.bgLayer = layer;
  this.backgroundLayerMgr_.set(this.map, layer);
  if (!opt_silent && this.select) {
    this.select();
  }
};

/**
 * Set a background layer overlay, used by the opacity slider.
 * @param {ol.layer.Base} layer The opacity background layer.
 */
gmf.backgroundlayerselector.component.Controller_.prototype.setOpacityBgLayer = function(layer) {
  this.backgroundLayerMgr_.setOpacityBgLayer(this.map, layer);
};

/**
 * @private
 */
gmf.backgroundlayerselector.component.Controller_.prototype.handleDestroy_ = function() {
  this.listenerKeys_.forEach(ol.events.unlistenByKey);
  this.listenerKeys_.length = 0;
};


gmf.backgroundlayerselector.component.controller('GmfBackgroundlayerselectorController',
  gmf.backgroundlayerselector.component.Controller_);
