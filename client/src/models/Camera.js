import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default class Camera {
  constructor(id, position, azimuth, fov, radius, color, zIndex) {
    this.id = id;
    this.position = position;
    this.azimuth = azimuth || 0;  // in degrees
    this.fov = fov || 45;  // in degrees
    this.radius = radius || 100;
    this.color = color || '#5aaeb8';
    this.zIndex = zIndex || 1;
  }

  toFeature() {
    return new Feature({
      geometry: new Point(this.position),
      // feature custom properties
      id: this.id,
      azimuth: this.azimuth,
      fov: this.fov,
      radius: this.radius,
      color: this.color,
      zIndex: this.zIndex,
    });
  }
}
