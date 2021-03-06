/**
 * Application entry point.
 *
 * This file includes `goog.require`'s for all the components/directives used
 * by the HTML page and the controller to provide the configuration.
 */
goog.provide('app.oeedit.Controller');

goog.require('app');
goog.require('gmf.controllers.AbstractDesktopController');
goog.require('gmf.objectediting.module');
goog.require('ngeo.misc.ToolActivate');
goog.require('ngeo.proj.EPSG2056');
goog.require('ngeo.proj.EPSG21781');
goog.require('ol');
goog.require('ol.Collection');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');

app.oeedit.module = angular.module('AppOEEdit', [
  app.module.name,
  gmf.controllers.AbstractDesktopController.module.name,
  gmf.objectediting.module.name,
]);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$injector} $injector Main injector.
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @extends {gmf.controllers.AbstractDesktopController}
 * @ngInject
 * @export
 */
app.oeedit.Controller = function($scope, $injector, $timeout) {

  /**
   * @type {boolean}
   * @export
   */
  this.oeEditActive = false;

  gmf.controllers.AbstractDesktopController.call(this, {
    srid: 21781,
    mapViewConfig: {
      center: [632464, 185457],
      zoom: 3,
      resolutions: [250, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05]
    }
  }, $scope, $injector);

  /**
   * The ngeo ToolActivate manager service.
   * @type {ngeo.misc.ToolActivateMgr}
   */
  const ngeoToolActivateMgr = $injector.get('ngeoToolActivateMgr');

  ngeoToolActivateMgr.unregisterGroup('mapTools');

  const oeEditToolActivate = new ngeo.misc.ToolActivate(this, 'oeEditActive');
  ngeoToolActivateMgr.registerTool('mapTools', oeEditToolActivate, true);

  const queryToolActivate = new ngeo.misc.ToolActivate(this, 'queryActive');
  ngeoToolActivateMgr.registerTool('mapTools', queryToolActivate, false);

  // Set edit tool as default active one
  $timeout(() => {
    this.oeEditActive = true;
  });

  /**
   * @type {ol.source.Vector}
   * @private
   */
  this.vectorSource_ = new ol.source.Vector({
    wrapX: false
  });

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.vectorLayer_ = new ol.layer.Vector({
    source: this.vectorSource_
  });

  /**
   * @type {ol.Collection.<ol.Feature>}
   * @export
   */
  this.sketchFeatures = new ol.Collection();

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.sketchLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: this.sketchFeatures,
      wrapX: false
    })
  });

  /**
   * @type {gmf.theme.Themes} gmfObjectEditingManager The gmf theme service
   */
  const gmfThemes = $injector.get('gmfThemes');

  gmfThemes.getThemesObject().then((themes) => {
    if (themes) {
      // Add layer vector after
      this.map.addLayer(this.vectorLayer_);
      this.map.addLayer(this.sketchLayer_);
    }
  });

  /**
   * @type {gmf.objectediting.Manager} gmfObjectEditingManager The gmf
   *     ObjectEditing manager service.
   */
  const gmfObjectEditingManager = $injector.get('gmfObjectEditingManager');

  /**
   * @type {string|undefined}
   * @export
   */
  this.oeGeomType = gmfObjectEditingManager.getGeomType();

  /**
   * @type {number|undefined}
   * @export
   */
  this.oeLayerNodeId = gmfObjectEditingManager.getLayerNodeId();

  /**
   * @type {?ol.Feature}
   * @export
   */
  this.oeFeature = null;

  gmfObjectEditingManager.getFeature().then((feature) => {
    this.oeFeature = feature;
    if (feature) {
      this.vectorSource_.addFeature(feature);
    }
  });

  /**
   * @type {Array.<string>}
   * @export
   */
  this.searchCoordinatesProjections = [ngeo.proj.EPSG21781, ngeo.proj.EPSG2056, 'EPSG:4326'];

  /**
   * @type {!Array.<number>}
   * @export
   */
  this.scaleSelectorValues = [250000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 250, 100, 50];

  /**
   * @type {Array.<string>}
   * @export
   */
  this.elevationLayers = ['aster', 'srtm'];

  /**
   * @type {string}
   * @export
   */
  this.selectedElevationLayer = this.elevationLayers[0];

  /**
   * @type {Object.<string, gmfx.ProfileLineConfiguration>}
   * @export
   */
  this.profileLinesconfiguration = {
    'aster': {color: '#0000A0'},
    'srtm': {color: '#00A000'}
  };

  /**
   * @type {Array.<gmfx.MousePositionProjection>}
   * @export
   */
  this.mousePositionProjections = [{
    code: ngeo.proj.EPSG2056,
    label: 'CH1903+ / LV95',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: ngeo.proj.EPSG21781,
    label: 'CH1903 / LV03',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: 'EPSG:4326',
    label: 'WGS84',
    filter: 'ngeoDMSCoordinates:2'
  }];

  // Allow angular-gettext-tools to collect the strings to translate
  /** @type {angularGettext.Catalog} */
  const gettextCatalog = $injector.get('gettextCatalog');
  gettextCatalog.getString('Add a theme');
  gettextCatalog.getString('Add a sub theme');
  gettextCatalog.getString('Add a layer');
};
ol.inherits(app.oeedit.Controller, gmf.controllers.AbstractDesktopController);


app.oeedit.module.controller('OEEditController', app.oeedit.Controller);
