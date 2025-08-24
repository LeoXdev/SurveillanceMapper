import { createCameraFeature } from "../utils";
import { mapAPI } from "../components/map/map";
import { unselect } from "../components/navbar/camera-editor";

let instance = null;
export default class Memory {
  constructor() {
    instance = this;

    this.items = [];
  }
  static getInstance() {
    if (!instance) new Memory();
    return instance;
  }

  add(camera) {
    this.items.push(camera);
  }
  clear() {
    this.items = [];
  }
  getById(id, camera) {
    // binsearch to get a camera/index on memory by its id
    let a = this.items;
    let l = 0;
    let r = a.length - 1;
    while (l <= r) {
      let m = Math.trunc(l + (r - l) / 2);
       if (a[m] && a[m].id == id) {
        if (camera) return a[m];
        else return m;
      }
       if (a[m] && a[m].id > id) {
        r = m - 1;
      } else {
        l = m + 1;
      }
    }
    return -1;
  }
  remove(id) {
    delete(this.items[id]);
  }
  fromGeoJSON(str) {
    const data = JSON.parse(str);
    const features = data.type === 'FeatureCollection' ? data.features : [data];

    unselect();
    this.clear();
    mapAPI.getVectorLayer().getSource().clear();
    features.forEach(feature => {
      if (feature) {
        const coordinates = feature.geometry.coordinates;
        const properties = feature.properties || {};
        const mapCoordinate = [coordinates[0], coordinates[1]];
 
        const cameraFeature = createCameraFeature({
            id: properties.id,
            position: mapCoordinate,
            azimuth: properties.azimuth,
            fov: properties.fov,
            radius: properties.radius,
            color: properties.color,
            zIndex: properties.zIndex,
          },
          false
        );
        mapAPI.addFeature(cameraFeature);
      }
    });
  }
  toGeoJSON() {
    const features = this.items.map(camera => {
      // check for undefined entries left by delete()
      if (camera) {
        return {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": camera.position,
          },
          "properties": {
            "id": camera.id,
            "azimuth": camera.azimuth,
            "fov": camera.fov,
            "radius": camera.radius,
            "color": camera.color,
            "zIndex": camera.zIndex,
          }
        };
      }
    });
    const data = {
      "type": "FeatureCollection",
      "features": features
    };
    return JSON.stringify(data, null, 2);
  }
  generateId() {
    if (this.items.length == 0) return 1;

    // this.remove(id) leaves elements in array as undefined,
    // this method safely returns the last id
    let last = -1;
    let a = this.items;
    for (let i = a.length - 1; i >= 0; i--) {
      if (a[i]) {
        last = a[i].id;
        break;
      }
    }

    if (last == -1) return 1;
    return last + 1;
  }
}
