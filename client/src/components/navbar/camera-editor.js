import './camera-editor.css';
import { mapAPI } from '../map/map';
import { removeFromDOM } from '../../utils';
import InputKnob from 'input-knob';
import Memory from '../../models/Memory';
import { Translate } from 'ol/interaction';
import { Collection } from 'ol';

// able to drag a feature if not null
let translateInteraction = null;
// id of the feature being edited
let editingFeature = -1;

// show editing menus when clicking a feature
mapAPI.onMapClick((event) => {
  const features = mapAPI.getFeaturesAtPixel(event.pixel);
  if (features.length > 0) {
    const feature = features[0];
    // design choice: using feature coordinates looks fairly different than using event.coordinate (click pos)
    const featureCoordinate = feature.getGeometry().getCoordinates();
    const pixel = mapAPI.getPixelFromCoordinate(featureCoordinate);

    if (feature.get('id') != editingFeature) {
      if (editingFeature != -1) unselect(feature);
      select(feature, featureCoordinate, pixel);
    }
  } else {
    // hide editing menus when clicking on an empty map area
    mapAPI.removeInteraction(translateInteraction);
    translateInteraction = null;

    unselect(undefined);
  }
});
function showTooltipMenu(feature, featureCoordinate, pixel) {
  const menu = document.createElement('div');
  menu.className = 'tooltip-menu';
  menu.innerHTML = `
    <div class="menu-actions">
      <label class="drag-toggle-button">
        <input type="checkbox" id="drag-toggle" />
        <div class="icon-container" title="Arrastrar">
          <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="24" height="24" baseProfile="tiny" version="1.2" viewBox="0 0 24 24">
            <path d="M17.707 8.293a.999.999 0 1 0-1.414 1.414L17.586 11H13V6.414l1.293 1.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L12 2.586 8.293 6.293a.999.999 0 1 0 1.414 1.414L11 6.414V11H6.414l1.293-1.293a.999.999 0 1 0-1.414-1.414L2.586 12l3.707 3.707a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L6.414 13H11v4.586l-1.293-1.293a.999.999 0 1 0-1.414 1.414L12 21.414l3.707-3.707a.999.999 0 1 0-1.414-1.414L13 17.586V13h4.586l-1.293 1.293a.999.999 0 1 0 1.414 1.414L21.414 12l-3.707-3.707z" fill="currentColor" />
          </svg>
        </div>
      </label>
    
      <button id="delete-button" class="action-button" title="Eliminar">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z" fill="currentColor" />
          </svg>
        </div>
      </button>
    </div>

    <label>
      <span>Azimuth (°)</span>
      <div class="knob-container">
        <input-knob value="${feature.get('azimuth')}" scale="360" min="0" max="360">
          <div class="mark">▲</div>
        </input-knob>
      </div>
    </label>
    <br>
    <label>
      <span>FOV (°):</span>
      <input type="range" value="${feature.get('fov')}" id="fov" min="0" max="360" step="1">
    </label>
    <br>
    <label>
      <span>Radio (mts):</span>
      <input type="number" value="${feature.get('radius')}" id="radius" step="1">
    </label>
    <br>
    <label>
      <span>Z-index:</span>
      <input type="number" value="${feature.get('zIndex')}" id="zIndex">
    </label>
    <br>
    <label>
      <span>Color:</span>
      <div class="color-buttons">
        <button data-color="#ffaa00" style="background:#ffaa00;"></button>
        <button data-color="#fff" style="background:#fff;"></button>
        <button data-color="#2a77db" style="background:#2a77db;"></button>
        <input type="color" id="customColor">
      </div>
    </label>
  `;
  document.body.appendChild(menu);

  // modify menu's position, 10 is an offset
  let x = pixel[0] + 10;
  let y = pixel[1] + 10;
  // extra movement when tooltip tries to open near an edge
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;
  if (x + menuWidth > vw) x = vw - menuWidth - 5;
  if (y + menuHeight > vh) y = vh - menuHeight - 5;
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.backgroundColor = `${feature.get('color')}`;


  // knob input patch, ~it does not work well when the position is variable
  // Author: an LLM
  const knob = menu.querySelector('input-knob');
  if (knob) {
    knob._rotationStart = function () {
      window.oncontextmenu = () => false;

      const rect = this.getBoundingClientRect();
      this._centerX = rect.left + rect.width / 2;
      this._centerY = rect.top + rect.height / 2;

      this._initialAngle = this._angle;
      this._attemptedAngle = this._angle;
      this._attemptedRotations = this._rotations;
      this._initialTouchAngle = Math.atan2(
        this._touchY - this._centerY,
        this._touchX - this._centerX
      );

      const evt = new Event('knob-move-start', { bubbles: true });
      this.dispatchEvent(evt);
    };
  }

  const camera = Memory.getInstance().getById(feature.get('id'));

  // tooltip input's events, update memory and feature
  const dragToggle = menu.querySelector('#drag-toggle');
  dragToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      if (!translateInteraction) {
        translateInteraction = new Translate({
          features: new Collection([feature]),
        });
        mapAPI.addInteraction(translateInteraction);
      }
    } else {
      if (translateInteraction) {
        mapAPI.removeInteraction(translateInteraction);
        translateInteraction = null;
      }
    }
    if (translateInteraction) {
      translateInteraction.on('translateend', (event) => {
        const newPos = event.features.getArray()[0].getGeometry().getCoordinates();
        const camera = Memory.getInstance().getById(editingFeature);
        camera.position = newPos;
        feature.changed();
      });
    }
  });
  const deleteButton = menu.querySelector('#delete-button');
  deleteButton.addEventListener('click', () => {
    unselect();
    Memory.getInstance().remove(feature.get('id'));
    mapAPI.removeFeature(feature);
  });

  const azimuthInput = menu.querySelector('input-knob');
  azimuthInput.addEventListener('knob-move-change', (e) => {
    const newAzimuth = Math.trunc(Number.parseFloat(azimuthInput.value));
    camera.azimuth = newAzimuth;
    feature.set('azimuth', newAzimuth);
    feature.changed();
  });
  const fovInput = menu.querySelector('#fov');
  fovInput.addEventListener('input', (e) => {
    const newFOV = Math.trunc(parseFloat(e.target.value));
    camera.fov = newFOV;
    feature.set('fov', newFOV);
    feature.changed();
  });
  const radiusInput = menu.querySelector('#radius');
  radiusInput.addEventListener('input', (e) => {
    let newRadius = Math.trunc(parseFloat(e.target.value));
    // when the camera no longer has a fov polygon, it cannot be clicked
    if (newRadius <= 0) newRadius = 1;
    camera.radius = newRadius;
    feature.set('radius', newRadius);
    feature.changed();
  });
  const zIndexInput = menu.querySelector('#zIndex');
  zIndexInput.addEventListener('input', (e) => {
    const newZIndex = parseInt(e.target.value, 10);
    camera.zIndex = newZIndex;
    feature.set('zIndex', newZIndex);
    feature.changed();
  });
  const colorButtons = menu.querySelectorAll('.color-buttons button');
  colorButtons.forEach(button => {
    button.addEventListener('click', () => {
      const color = button.getAttribute('data-color');
      updateColor(color);
    });
  });
  const customColorInput = menu.querySelector('#customColor');
  customColorInput.addEventListener('input', (e) => {
    updateColor(e.target.value);
  });
  function updateColor(color) {
    camera.color = color;
    feature.set('color', color);
    menu.style.backgroundColor = color;
    feature.changed();
  }

}

// select/unselect a feature for edition, delete-all-button, Memory also use unselect
function select(feature, featureCoordinate, pixel) {
  // add highlight
  feature.set('highlight', true);

  // show tooltip-menu
  showTooltipMenu(feature, featureCoordinate, pixel);
  // update editingFeature to feature's id
  editingFeature = feature.get('id');
}
export function unselect() {
  // remove highlight
  if (editingFeature != -1) {  // avoid creating an extra feature when there's none selected
    const feature = getFeatureById(editingFeature);

    feature.set('highlight', false);
  }

  // hide tooltip-menu
  removeFromDOM('.tooltip-menu');
  // update editingFeature to -1
  editingFeature = -1;
}
// *this linear search might be optimized by using a data structure
function getFeatureById(id) {
  let res = null;
  const source = mapAPI.getVectorLayer().getSource();
  source.forEachFeature((feature) => {
    const featureId = feature.get('id');
    if (featureId === id) {
      res = feature;
      return false;
    }
  });

  return res;
}
