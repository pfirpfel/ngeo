goog.provide('app.search');

// webpack: import './search.css';
goog.require('goog.asserts');
goog.require('ngeo.map.module');
const EPSG21781 = goog.require('ngeo.proj.EPSG21781');
goog.require('ngeo.search.module');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.proj');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');


/** @type {!angular.Module} **/
app.search.module = angular.module('app', [
  'gettext',
  ngeo.map.module.name,
  ngeo.search.module.name
]);


/**
 * @type {!angular.Component}
 */
app.search.searchComponent = {
  bndings: {
    'map': '=appSearchMap'
  },
  controller: 'AppSearchController',
  template:
      '<input type="text" placeholder="search…" ' +
      'ngeo-search="$ctrl.options" ' +
      'ngeo-search-datasets="$ctrl.datasets" ' +
      'ngeo-search-listeners="$ctrl.listeners">'
};


app.search.module.component('appSearch', app.search.searchComponent);


/**
 * @constructor
 * @param {angular.JQLite} $element Element.
 * @param {angular.Scope} $rootScope Angular root scope.
 * @param {angular.$compile} $compile Angular compile service.
 * @param {ngeo.search.createGeoJSONBloodhound.Function} ngeoSearchCreateGeoJSONBloodhound The ngeo
 *     create GeoJSON Bloodhound service.
 * @ngInject
 */
app.search.SearchController = function($element, $rootScope, $compile, ngeoSearchCreateGeoJSONBloodhound) {
  /**
   * @private
   * @type {angular.JQLite}
   */
  this.$element = $element;


  /**
   * @type {ol.Map}
   * @export
   */
  this.map;

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.vectorLayer_ = this.createVectorLayer_();

  /** @type {Bloodhound} */
  const bloodhoundEngine = this.createAndInitBloodhound_(
    ngeoSearchCreateGeoJSONBloodhound);

  /**
   * @type {TypeaheadOptions}
   * @export
   */
  this.options = /** @type {TypeaheadOptions} */ ({
    highlight: true,
    hint: undefined,
    minLength: undefined
  });

  /**
   * @type {Array.<TypeaheadDataset>}
   * @export
   */
  this.datasets = [{
    source: bloodhoundEngine.ttAdapter(),
    display: (suggestion) => {
      const feature = /** @type {ol.Feature} */ (suggestion);
      return feature.get('label');
    },
    templates: {
      header: () => '<div class="ngeo-header">Addresses</div>',
      suggestion: (suggestion) => {
        const feature = /** @type {ol.Feature} */ (suggestion);

        // A scope for the ng-click on the suggestion's « i » button.
        const scope = $rootScope.$new(true);
        scope['feature'] = feature;
        scope['click'] = function(event) {
          window.alert(feature.get('label'));
          event.stopPropagation();
        };

        const html = `<p>${feature.get('label')
        }<button ng-click="click($event)">i</button></p>`;
        return $compile(html)(scope);
      }
    }
  }];

  /**
   * @type {ngeox.SearchDirectiveListeners}
   * @export
   */
  this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
    select: app.search.SearchController.select_.bind(this)
  });
};


/**
 * @export
 */
app.search.SearchController.prototype.$onInit = function() {
  // Empty the search field on focus and blur.
  const input = this.$element.find('input');
  input.on('focus blur', () => {
    input.val('');
  });
};


/**
 * @return {ol.layer.Vector} The vector layer.
 * @private
 */
app.search.SearchController.prototype.createVectorLayer_ = function() {
  const vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
  });
  // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
  // makes the vector layer "unmanaged", meaning that it is always on top.
  vectorLayer.setMap(this.map);
  return vectorLayer;
};


/**
 * @param {ngeo.search.createGeoJSONBloodhound.Function} ngeoSearchCreateGeoJSONBloodhound The ngeo
 *     create GeoJSON Bloodhound service.
 * @return {Bloodhound} The bloodhound engine.
 * @private
 */
app.search.SearchController.prototype.createAndInitBloodhound_ = function(ngeoSearchCreateGeoJSONBloodhound) {
  const url = 'https://geomapfish-demo.camptocamp.net/2.2/wsgi/fulltextsearch?query=%QUERY';
  const bloodhound = ngeoSearchCreateGeoJSONBloodhound(url, undefined, ol.proj.get('EPSG:3857'), EPSG21781);
  bloodhound.initialize();
  return bloodhound;
};


/**
 * @param {jQuery.Event} event Event.
 * @param {Object} suggestion Suggestion.
 * @param {TypeaheadDataset} dataset Dataset.
 * @this {app.search.SearchController}
 * @private
 */
app.search.SearchController.select_ = function(event, suggestion, dataset) {
  const feature = /** @type {ol.Feature} */ (suggestion);
  const featureGeometry = /** @type {ol.geom.SimpleGeometry} */
      (feature.getGeometry());
  const size = this.map.getSize();
  goog.asserts.assert(size !== undefined);
  const source = this.vectorLayer_.getSource();
  source.clear(true);
  source.addFeature(feature);
  this.map.getView().fit(featureGeometry, {
    size: size,
    maxZoom: 16
  });
};


app.search.module.controller('AppSearchController', app.search.SearchController);


/**
 * @constructor
 * @ngInject
 */
app.search.MainController = function() {
  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 4
    })
  });

};


app.search.module.controller('MainController', app.search.MainController);
