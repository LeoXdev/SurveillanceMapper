// misc. identifiers not worth enough for a component
import './utils.css';
import Style from 'ol/style/Style';
import Polygon from 'ol/geom/Polygon';
import Icon from 'ol/style/Icon';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Memory from './models/Memory';
import Camera from './models/Camera';
import hexRgb from 'hex-rgb';

// --- ---
// creation of a camera feature, used at camera-button and Memory
const cameraIconSVG = () => 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 505">
    <circle cx="32" cy="41" r="3"/>
    <path d="M32 30a11 11 0 1 0 11 11 11.01 11.01 0 0 0-11-11Zm3.13 3.57a1 1 0 1 1 .37 1.37 1 1 0 0 1-.37-1.37ZM32 32a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm-4.5 1.2a1 1 0 1 1-.37 1.37 1 1 0 0 1 .37-1.36ZM23 41a1 1 0 1 1 1 1 1 1 0 0 1-1-1Zm2.57 4.87a1 1 0 1 1 .37-1.37 1 1 0 0 1-.37 1.37Zm.37-8.37a1 1 0 1 1-.37-1.37 1 1 0 0 1 .37 1.37Zm2.93 10.93a1 1 0 1 1-.37-1.37 1 1 0 0 1 .37 1.37ZM32 50a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm4.5-1.2a1 1 0 1 1 .37-1.37 1 1 0 0 1-.37 1.36ZM32 46a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm7.8-.5a1 1 0 1 1-.37-1.37 1 1 0 0 1 .36 1.37ZM41 41a1 1 0 1 1-1-1 1 1 0 0 1 1 1Zm-1.57-3.13a1 1 0 1 1 .36-1.37 1 1 0 0 1-.36 1.37Z"/>
    <path d="M47 41a15 15 0 0 0-30 0v10.68A20.9 20.9 0 0 0 31.97 58h.06A20.9 20.9 0 0 0 47 51.68ZM32 54a13 13 0 1 1 13-13 13.01 13.01 0 0 1-13 13Z"/>
    <path d="M11 22v15.02a20.84 20.84 0 0 0 4 12.28V41a17 17 0 1 1 34 0v8.3a20.84 20.84 0 0 0 4-12.28V22ZM60 14V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v7ZM4.59 16l3.7 3.7A1 1 0 0 0 9 20h46a1 1 0 0 0 .7-.3l3.71-3.7Z"/>
  </svg>
`);
// custom polygon, OpenLayers does not have a native circle sector geometry
function createCircleSectorPolygon(center, radius, startAngle, endAngle, segments = 32) {
  const coords = [];
  coords.push(center);

  let startRad = (startAngle - 270) * (Math.PI / 180);
  let endRad = (endAngle - 270) * (Math.PI / 180);
  if (endRad < startRad) endRad += 2 * Math.PI;

  const jump = (endRad - startRad) / segments;
  for (let i = 0; i <= segments; i++) {
    const angle = startRad + i * jump;
    const x = center[0] + radius * Math.cos(angle);
    const y = center[1] + radius * Math.sin(angle);
    coords.push([x, y]);
  }
  coords.push(center);  // The first and last point of a polygon must be the same

  return new Polygon([coords]);
}
export const createCameraFeature = (attributes) => {
  const memory = Memory.getInstance();
  const camera = new Camera(
    attributes.id || memory.generateId(),  // camera-editor uses atts.id, camera-button uses me.generateId()
    attributes.position,
    attributes.azimuth,
    attributes.fov,
    attributes.radius,
    attributes.color,
    attributes.zIndex,
  );
  memory.add(camera);

  const cameraFeature = camera.toFeature();
  const iconSVG = cameraIconSVG();
  // function to define styles dynamically, it gets called on each zoom or map movement
  const styleFunction = function(feature, resolution) {
    const iconScale = 0.1 * (1 / resolution);

    let highlighted = feature.get('highlight');

    const fovPolygon = createCircleSectorPolygon(
      camera.position,
      camera.radius,
      camera.azimuth - (camera.fov / 2),
      camera.azimuth + (camera.fov / 2),
    );

    // design choice: zIndex of FOVs will always be even and greater than icon's zIndex by one
    const iconStyle = new Style({
      zIndex: camera.zIndex,
      image: new Icon({
        src: iconSVG,
        scale: highlighted ? iconScale * 1.2 : iconScale,
      })
    });
    const fovStyle = new Style({
      zIndex: 2 * camera.zIndex + 1,
      geometry: fovPolygon,
      fill: new Fill({
        color: hexRgb(camera.color, {alpha: 0.3, format: 'css'}),
      }),
      stroke: new Stroke({
        color: hexRgb(camera.color, {alpha: 1, format: 'css'}),
        width: highlighted ? 4 : 2,
      })
    });

    return [iconStyle, fovStyle];
  };

  cameraFeature.setStyle(styleFunction);
  return cameraFeature;
}


// --- ---
// show popup with variable message and confirmation callback
export function showConfirmPopup(message, callback) {
  const popup = document.createElement('div');
  popup.className = 'confirm-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <p class="popup-message">${message}</p>
        <div class="popup-actions">
          <button id="confirm-button" class="action-button">Continue</button>
          <button id="cancel-button" class="action-button">Cancel</button>
        </div>
    </div>
  `;
  document.body.appendChild(popup);

  const confirm = popup.querySelector('#confirm-button');
  const cancel = popup.querySelector('#cancel-button');
  confirm.addEventListener('click', () => {
    callback();
    popup.remove();
  });
  cancel.addEventListener('click', () => {
    popup.remove();
  });
}


// --- ---
export function removeFromDOM(selector) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}
