import './map.css';
import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import ScaleLine from 'ol/control/ScaleLine';

const config = await (await fetch('./config.json')).json();
const tileServerUrl = config.tileServerUrl;

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM({
        attributions: null,
        // example of local use with tileserver-gl which serves .mbtiles, there might be other alternatives
        //url: 'http://localhost:8080/styles/osm-bright/{z}/{x}/{y}.png',
        //url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        url: tileServerUrl,
      }),
    }),
  ],
  view: new View({
    // EPSG:3857 is the projection used by Google Maps, Bing...
    projection: 'EPSG:3857',
    // fromLonLat adjusts coordinates for mercator projection distortion [y, x]
    center: fromLonLat([-98.48519662470083, 29.422832263731376]),
    zoom: 18,
  }),
});
map.addControl(new ScaleLine({
  units: 'metric',
  bar: false,
  minWidth: 100,
}));

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  renderBuffer: 1750,  // by default, features outside the viewport will not be rendered, this attribute adds a margin to render (in pixels)
});
map.addLayer(vectorLayer);


// --- ---
// mapAPI to avoid exporting the map variable; all map interactions will go through here
export const mapAPI = {
  addFeature: (feature) => vectorSource.addFeature(feature),
  removeFeature: (feature) => vectorSource.removeFeature(feature),
  addInteraction: (interaction) => map.addInteraction(interaction),
  removeInteraction: (interaction) => map.removeInteraction(interaction),
  getVectorLayer: () => { return vectorLayer },
  getFeaturesAtPixel: (pixel) => {
    const features = [];
    map.forEachFeatureAtPixel(pixel, (feature) => { features.push(feature); });
    return features.sort((a, b) => {
      const aZ = a.get('zIndex');
      const bZ = b.get('zIndex');
      return bZ - aZ;
    });

    //return features;
  },
  getPixelFromCoordinate: (coordinate) => map.getPixelFromCoordinate(coordinate),
  getCoordinateFromPixel: (pixel) => map.getCoordinateFromPixel(pixel),
  
  getTargetElement: () => map.getTargetElement(),

  // register a callback for a click event
  onMapClick: (callback) => map.on('click', callback),
}
// import feature editor after map is ready
import('../navbar/camera-editor');
