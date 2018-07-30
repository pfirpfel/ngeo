goog.provide('ngeo.infra3dComponent');

goog.require('ol.Feature');
goog.require('ol.Observable');
goog.require('ol.geom.Point');
goog.require('ol.style.Style');
goog.require('ol.style.Text');
goog.require('ol.style.Fill');
goog.require('ngeo');
goog.require('ngeo.FeatureOverlayMgr');


/**
 * @private
 */
ngeo.Infra3dController = class {

  /**
   * @param {!angular.Scope} $scope Scope.
   * @param {!ngeo.FeatureOverlayMgr} ngeoFeatureOverlayMgr Ngeo FeatureOverlay
   *     manager.
   * @private
   * @ngInject
   * @ngdoc controller
   * @ngname NgeoInfra3dController
   */
  constructor($scope, ngeoFeatureOverlayMgr) {

    // Binding properties

    /**
     * @type {boolean}
     * @export
     */
    this.active;

    $scope.$watch(
      () => this.active,
      this.handleActiveChange_.bind(this)
    );

    /**
     * @type {ol.style.Text}
     */
    this.textStyle_ = new ol.style.Text({
      fill: new ol.style.Fill({color: '#279B61'}),
      font: 'normal 30px FontAwesome',
      rotation: (-Math.PI) / 4, // rotation in radians
      stroke: new ol.style.Stroke({color: '#ffffff', width: 3}),
      text: '\uf124'
    });

    /**
     * Style for the feature.
     * @type {ol.style.Style|Array.<ol.style.Style>|
     *     ol.FeatureStyleFunction|ol.StyleFunction|undefined}
     * @export
     */
    this.featureStyle = new ol.style.Style({
      text: this.textStyle_
    });

    /**
     * @type {!ol.Map}
     */
    this.map;

    /**
     * URL of Infra3D client.
     * @type {string}
     * @see https://www.infra3d.ch/api/apidoc/Reference/#init
     */
    this.infra3dClient;


    // Injected properties

    /**
     * @type {!angular.Scope}
     * @private
     */
    this.scope_ = $scope;


    // Inner properties

    /**
     * @type {!ol.Feature}
     * @private
     */
    this.feature_ = new ol.Feature();

    /**
     * @type {!ngeo.FeatureOverlay}
     * @private
     */
    this.featureOverlay_ = goog.asserts.assert(
      ngeoFeatureOverlayMgr.getFeatureOverlay()
    );

    /**
     * @type {Array.<!ol.EventsKey>}
     * @private
     */
    this.listenerKeys_ = [];

    /**
     * The current location in the OpenLayers' map view projection.
     * @type {?ol.Coordinate}
     * @private
     */
    this.location = null;

    /**
     * @type {ol.geom.Point}
     * @private
     */
    this.point_ = new ol.geom.Point([0, 0]);

    this.feature_.setGeometry(this.point_);
  }

  /**
   * Called on initialization of the controller.
   */
  $onInit() {
    // Initialize location with current center of map.
    this.location = this.map.getView().getCenter();

    // Init Infra3D iframe
    const divId = 'infra3d';
    window.infra3d.init(divId, this.infra3dClient, {
      'easting': this.location[0],
      'northing': this.location[1],
      'epsg': 21781,
      'map': false,
      'layer': false,
      'navigation': false
    });

    // === Watchers ===

    // (1) Watch for any change in the location
    this.scope_.$watch(
      () => this.location,
      this.handleLocationChange_.bind(this)
    );

    // (2) Watch for both the active and location. When we have both, the
    //     state is considered 'ready'.
    this.scope_.$watch(
      () => {
        const isActive = this.active;
        const hasLocation = this.location !== null;
        return isActive && hasLocation;
      },
      this.handleReadyChange_.bind(this)
    );

    this.feature_.setStyle(this.featureStyle);

  }

  /**
   * Called when the 'active' property of this component changes.
   * @param {boolean} active Active.
   * @private
   */
  handleActiveChange_(active) {

    const keys = this.listenerKeys_;

    if (active) {
      keys.push(
        ol.events.listen(
          this.map,
          ol.events.EventType.CLICK,
          this.handleMapClick_,
          this
        )
      );
    } else {
      ol.Observable.unByKey(keys);
      keys.length = 0;
    }
  }

  /**
   * Called when the 'location' property of this component changes.
   * @param {?ol.Coordinate} location Location, in OL map view projection.
   * @param {?ol.Coordinate} oldLocation The previous location.
   * @private
   */
  handleLocationChange_(location, oldLocation) {

    // (1) No need to do anything if the old value equals the new value
    if (location === oldLocation || (
      Array.isArray(location) && Array.isArray(oldLocation) &&
        ol.array.equals(location, oldLocation)
    )) {
      return;
    }

    // (2) Update point coordinates
    this.point_.setCoordinates(location);


    // (3) Update Infra3D position
    window.infra3d.lookAt2DPosition(location[0], location[1]);
  }

  /**
   * Called when the map is clicked while this component is active. Update the
   * location accordingly.
   * @param {ol.MapBrowserEvent} evt The map browser event being fired.
   * @private
   */
  handleMapClick_(evt) {
    this.location = evt.coordinate;
    this.scope_.$apply();
    // send location to infra3d
    window.infra3d.loadAtPosition(this.location[0], this.location[1], {
      'epsg': 21781
    });
  }

  /**
   * Called when the component 'virtual ready' state changes.
   *
   * When ready:
   *  - add the feature to the overlay
   *
   * When not ready:
   *  - remove the feature from the overlay
   *
   * @param {boolean} ready Whether the component is ready or not.
   * @param {boolean} oldReady Previous ready value.
   * @private
   */
  handleReadyChange_(ready, oldReady) {

    if (ready === oldReady) {
      return;
    }

    if (ready) {
      this.featureOverlay_.addFeature(this.feature_);
      $('.gmf-app-tools .gmf-app-tools-content').addClass('infra3Dopen');
      window.infra3d.setOnPositionChanged(this.handleInfra3DOnPositionChanged, this);
    } else {
      this.featureOverlay_.removeFeature(this.feature_);
      $('.gmf-app-tools .gmf-app-tools-content').removeClass('infra3Dopen');
      window.infra3d.unsetOnPositionChanged();
    }
  }

  /**
   * Event called by the Infra3D-API when a position gets updated.
   *
   * Note: There are eleven parameters, but we only use the first two.
   * @param {number} easting Coordinate of the current position.
   * @param {number} northing Coordinate of the current position.
   * @param {number} height Coordinate of the current position.
   * @param {number} epsg Epsg-code for the coordinates of the current position.
   * @param {number} orientation Horizontal orientation of the camera (Azimuth).
   * @see https://www.infra3d.ch/api/apidoc/Reference/#onpositionchanged
   */
  handleInfra3DOnPositionChanged(easting, northing, height, epsg, orientation) {
    // set icon location
    this.location = /** @type{ol.Coordinate} */ ([easting, northing]);

    // set icon orientation
    let rotation = orientation - 45; // icon image offset
    rotation = ((rotation % 360) + 360) % 360; // modulo 360 to enforce positive result
    rotation *= Math.PI / 180; // convert to radians
    this.textStyle_.setRotation(rotation);
  }
};


ngeo.module.component('ngeoInfra3d', {
  bindings: {
    'active': '<',
    'map': '<',
    'infra3dClient': '<'
  },
  controller: ngeo.Infra3dController,
  templateUrl: () => `${ngeo.baseTemplateUrl}/infra3d.html`
});
