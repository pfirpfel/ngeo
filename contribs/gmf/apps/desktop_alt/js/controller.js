/**
 * Application entry point.
 *
 * This file includes `goog.require`'s for all the components/directives used
 * by the HTML page and the controller to provide the configuration.
 */
goog.provide('app.desktop_alt.Controller');

goog.require('app');
goog.require('gmf.controllers.AbstractDesktopController');
goog.require('gmf.import.module');
goog.require('ngeo.googlestreetview.module');
goog.require('ngeo.statemanager.WfsPermalink');
goog.require('ngeo.routing.module');
goog.require('ngeo.proj.EPSG2056');
goog.require('ngeo.proj.EPSG21781');
goog.require('ol');


app.desktop_alt.module = angular.module('AppDesktopAlt', [
  app.module.name,
  gmf.controllers.AbstractDesktopController.module.name,
  gmf.import.module.name,
  ngeo.routing.module.name,
  ngeo.googlestreetview.module.name,
  ngeo.statemanager.WfsPermalink.module.name,
]);


app.desktop_alt.module.value('ngeoQueryOptions', {
  'limit': 20,
  'queryCountFirst': true,
  'cursorHover': true
});

app.desktop_alt.module.value('gmfExternalOGCServers', [{
  'name': 'Swiss Topo WMS',
  'type': 'WMS',
  'url': 'https://wms.geo.admin.ch/?lang=fr'
}, {
  'name': 'ASIT VD',
  'type': 'WMTS',
  'url': 'https://ows.asitvd.ch/wmts/1.0.0/WMTSCapabilities.xml'
}, {
  'name': 'Swiss Topo WMTS',
  'type': 'WMTS',
  'url': 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml?lang=fr'
}]);

app.desktop_alt.module.value('gmfPrintOptions', {
  'scaleInput': true
});

app.desktop_alt.module.value('ngeoMeasurePrecision', 6);
app.desktop_alt.module.value('ngeoMeasureDecimals', 2);


/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$injector} $injector Main injector.
 * @param {ngeo.misc.File} ngeoFile The file service.
 * @param {gettext} gettext The gettext service
 * @param {angular.$q} $q Angular $q.
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @extends {gmf.controllers.AbstractDesktopController}
 * @ngInject
 * @export
 */
app.desktop_alt.Controller = function($scope, $injector, ngeoFile, gettext, $q, $timeout) {
  gmf.controllers.AbstractDesktopController.call(this, {
    srid: 21781,
    mapViewConfig: {
      center: [632464, 185457],
      zoom: 3,
      resolutions: [250, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05]
    }
  }, $scope, $injector);

  /**
   * @type {Array.<string>}
   * @export
   */
  this.searchCoordinatesProjections = [ngeo.proj.EPSG21781, ngeo.proj.EPSG2056, 'EPSG:4326'];

  /**
   * @type {number}
   * @export
   */
  this.searchDelay = 500;

  /**
   * @type {boolean}
   * @export
   */
  this.showInfobar = true;

  /**
   * @type {!Array.<number>}
   * @export
   */
  this.scaleSelectorValues = [250000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 250, 100, 50];

  /**
   * @type {Array.<string>}
   * @export
   */
  this.elevationLayers = ['srtm'];

  /**
   * @type {Object.<string, gmfx.ProfileLineConfiguration>}
   * @export
   */
  this.profileLinesconfiguration = {
    'srtm': {}
  };

  /**
   * @type {Array.<gmfx.MousePositionProjection>}
   * @export
   */
  this.mousePositionProjections = [{
    code: 'EPSG:2056',
    label: 'CH1903+ / LV95',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: 'EPSG:21781',
    label: 'CH1903 / LV03',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: 'EPSG:4326',
    label: 'WGS84',
    filter: 'ngeoDMSCoordinates:2'
  }];

  /**
   * @type {gmfx.GridMergeTabs}
   * @export
   */
  this.gridMergeTabs = {
    'OSM_time_merged': ['osm_time', 'osm_time2'],
    'transport (merged)': ['fuel', 'parking'],
    'Learning [merged]': ['information', 'bus_stop']
  };

  // Allow angular-gettext-tools to collect the strings to translate
  /** @type {angularGettext.Catalog} */
  const gettextCatalog = $injector.get('gettextCatalog');
  gettextCatalog.getString('OSM_time_merged');
  gettextCatalog.getString('OSM_time (merged)');
  gettextCatalog.getString('Learning [merged]');
  gettextCatalog.getString('Add a theme');
  gettextCatalog.getString('Add a sub theme');
  gettextCatalog.getString('Add a layer');

  /**
   * @type {string}
   * @export
   */
  this.bgOpacityOptions = 'Test aus Olten';

  /**
   * @export
   * @type {boolean}
   */
  this.falseValue = false
  this.displaywindowDraggable = false;

  this.displaywindowTemplateScope = $scope;
  this.displaywindowTemplateContent = `
    <div class="details">{{mainCtrl.bgOpacityOptions}}</div>
    <div class="details" ng-if="!mainCtrl.falseValue">should appear</div>
    <div class="details" ng-show="mainCtrl.falseValue">should not be visible</div>
    <input type="text" ng-model="mainCtrl.bgOpacityOptions" />
`;
  $timeout(() => {
    window.gmfx.openPopup_('popup test');
  }, 2000);
};
ol.inherits(app.desktop_alt.Controller, gmf.controllers.AbstractDesktopController);


/**
 * @param {jQuery.Event} event keydown event.
 * @export
 */
app.desktop_alt.Controller.prototype.onKeydown = function(event) {
  if (event.ctrlKey && event.key === 'p') {
    this.printPanelActive = true;
    event.preventDefault();
  }
};

app.desktop_alt.module.controller('AlternativeDesktopController', app.desktop_alt.Controller);
