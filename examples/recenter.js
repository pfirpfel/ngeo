goog.provide('app.recenter');

// webpack: import './recenter.css';
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');
goog.require('ngeo.map.module');


/** @type {!angular.Module} **/
const appmodule = angular.module('app', [
  'gettext',
  ngeo.map.module.name
]);


/**
 * @constructor
 * @ngInject
 */
app.recenter.MainController = function() {

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


appmodule.controller('MainController', app.recenter.MainController);
