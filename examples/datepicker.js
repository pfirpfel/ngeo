goog.provide('app.datepicker');

// webpack: import './datepicker.css';
/** @suppress {extraRequire} */
goog.require('ngeo.misc.datepickerComponent');
goog.require('ngeo.misc.Time');


/** @type {!angular.Module} **/
app.datepicker.module = angular.module('app', [
  'gettext',
  ngeo.misc.datepickerComponent.name,
  ngeo.misc.Time.module.name,
]);


/**
 * @constructor
 * @param {!ngeo.misc.Time} ngeoTime time service.
 * @ngInject
 */
app.datepicker.MainController = function(ngeoTime) {

  /**
   * @type {ngeo.misc.Time}
   * @private
   */
  this.ngeoTime_ = ngeoTime;

  /**
   * @type {ngeox.TimeProperty}
   * @export
   */
  this.timeRangeMode = {
    widget: /** @type {ngeox.TimePropertyWidgetEnum} */ ('datepicker'),
    maxValue: '2013-12-31T00:00:00Z',
    minValue: '2006-01-01T00:00:00Z',
    maxDefValue: null,
    minDefValue: null,
    mode: /** @type {ngeox.TimePropertyModeEnum} */ ('range'),
    interval: [0, 1, 0, 0]
  };

  /**
   * @type {ngeox.TimeProperty}
   * @export
   */
  this.timeValueMode = {
    widget: /** @type {ngeox.TimePropertyWidgetEnum} */ ('datepicker'),
    maxValue: '2015-12-31T00:00:00Z',
    minValue: '2014-01-01T00:00:00Z',
    maxDefValue: null,
    minDefValue: null,
    mode: /** @type {ngeox.TimePropertyModeEnum} */ ('value'),
    interval: [0, 1, 0, 0]
  };

  /**
   * @type {string}
   * @export
   */
  this.value;

  /**
   * @type {string}
   * @export
   */
  this.rangeValue;

  this.onDateSelected = function(date) {
    this.value = date;
  };

  this.onDateRangeSelected = function(date) {
    this.rangeValue = date;
  };

};


app.datepicker.module.controller('MainController', app.datepicker.MainController);
