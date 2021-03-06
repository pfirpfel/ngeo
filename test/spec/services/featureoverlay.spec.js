goog.require('ol.Map');
goog.require('ol.Collection');
goog.require('ol.Feature');
goog.require('ol.style.Style');

describe('ngeo.map.FeatureOverlayMgr', () => {
  let ngeoFeatureOverlayMgr;
  let map;
  let layer;

  beforeEach(() => {
    map = new ol.Map({});

    angular.mock.inject((_ngeoFeatureOverlayMgr_) => {
      ngeoFeatureOverlayMgr = _ngeoFeatureOverlayMgr_;
      ngeoFeatureOverlayMgr.init(map);
      layer = ngeoFeatureOverlayMgr.getLayer();
    });
  });

  it('creates an unmanaged layer', () => {
    expect(map.getLayers().getLength()).toBe(0);
    expect(layer).toBeDefined();
  });

  it('adds and removes features', () => {
    const overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const feature = new ol.Feature();
    overlay.addFeature(feature);
    expect(layer.getSource().getFeatures().length).toBe(1);

    overlay.removeFeature(feature);
    expect(layer.getSource().getFeatures().length).toBe(0);
  });

  it('removes all the features', () => {
    const overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const feature = new ol.Feature();
    overlay.addFeature(feature);
    overlay.clear();
    expect(layer.getSource().getFeatures().length).toBe(0);
  });

  it('doesn\'t remove features from other overlays', () => {
    const overlay1 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const feature1 = new ol.Feature();
    overlay1.addFeature(feature1);

    const overlay2 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const feature2 = new ol.Feature();
    overlay2.addFeature(feature2);

    expect(layer.getSource().getFeatures().length).toBe(2);

    overlay2.clear();

    expect(layer.getSource().getFeatures().length).toBe(1);
  });

  it('correctly sets styles', () => {
    const overlay1 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const style1 = new ol.style.Style();
    overlay1.setStyle(style1);

    const overlay2 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    const style2 = new ol.style.Style();
    overlay2.setStyle(style2);

    const feature1 = new ol.Feature();
    overlay1.addFeature(feature1);

    const feature2 = new ol.Feature();
    overlay2.addFeature(feature2);

    const styleFunction = ngeoFeatureOverlayMgr.getLayer().getStyleFunction();

    const resolution = 1;
    let styles;

    styles = styleFunction(feature1, resolution);
    expect(styles.length).toEqual(1);
    expect(styles[0]).toBe(style1);

    styles = styleFunction(feature2, resolution);
    expect(styles.length).toEqual(1);
    expect(styles[0]).toBe(style2);
  });

  describe('feature overlay configured with a feature collection', () => {
    let overlay, features;

    beforeEach(() => {
      overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
      const feature1 = new ol.Feature();
      const feature2 = new ol.Feature();
      features = new ol.Collection([feature1, feature2]);
      overlay.setFeatures(features);
    });

    it('adds features to the overlay', () => {
      expect(layer.getSource().getFeatures().length).toBe(2);
    });

    describe('add features to the collection', () => {
      it('adds features to the overlay', () => {
        features.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(3);
      });
    });

    describe('remove features from the collection', () => {
      it('removes features from the overlay', () => {
        features.clear();
        expect(layer.getSource().getFeatures().length).toBe(0);
      });
    });

    describe('remove the collection', () => {
      it('removes the features from the collection', () => {
        overlay.setFeatures(null);
        expect(layer.getSource().getFeatures().length).toBe(0);
      });
    });

    describe('replace the collection by another one', () => {
      it('uses the new collection and ignores the old one', () => {
        const newFeatures = new ol.Collection();
        overlay.setFeatures(newFeatures);
        expect(layer.getSource().getFeatures().length).toBe(0);
        newFeatures.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(1);
        features.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(1);
      });
    });

  });

});
