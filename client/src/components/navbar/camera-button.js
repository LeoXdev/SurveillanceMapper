import { mapAPI } from '../map/map';
import { createCameraFeature } from '../../utils';
import interact from 'interactjs';

export default class CameraButton {
  constructor() {}
  
  render() {
    return `
      <div id="camera-button" class="navbar-icon navbar-icon-size1">
        <svg class="navbar-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <circle cx="32" cy="41" r="3"/>
          <path d="M32 30a11 11 0 1 0 11 11 11.01 11.01 0 0 0-11-11Zm3.13 3.57a1 1 0 1 1 .37 1.37 1 1 0 0 1-.37-1.37ZM32 32a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm-4.5 1.2a1 1 0 1 1-.37 1.37 1 1 0 0 1 .37-1.36ZM23 41a1 1 0 1 1 1 1 1 1 0 0 1-1-1Zm2.57 4.87a1 1 0 1 1 .37-1.37 1 1 0 0 1-.37 1.37Zm.37-8.37a1 1 0 1 1-.37-1.37 1 1 0 0 1 .37 1.37Zm2.93 10.93a1 1 0 1 1-.37-1.37 1 1 0 0 1 .37 1.37ZM32 50a1 1 0 1 1 1-1 1 1 0 0 1-1 1Zm4.5-1.2a1 1 0 1 1 .37-1.37 1 1 0 0 1-.37 1.36ZM32 46a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm7.8-.5a1 1 0 1 1-.37-1.37 1 1 0 0 1 .36 1.37ZM41 41a1 1 0 1 1-1-1 1 1 0 0 1 1 1Zm-1.57-3.13a1 1 0 1 1 .36-1.37 1 1 0 0 1-.36 1.37Z"/>
          <path d="M47 41a15 15 0 0 0-30 0v10.68A20.9 20.9 0 0 0 31.97 58h.06A20.9 20.9 0 0 0 47 51.68ZM32 54a13 13 0 1 1 13-13 13.01 13.01 0 0 1-13 13Z"/>
          <path d="M11 22v15.02a20.84 20.84 0 0 0 4 12.28V41a17 17 0 1 1 34 0v8.3a20.84 20.84 0 0 0 4-12.28V22ZM60 14V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v7ZM4.59 16l3.7 3.7A1 1 0 0 0 9 20h46a1 1 0 0 0 .7-.3l3.71-3.7Z"/>
        </svg>
      </div>
    `;
  }
  addBehaviour() {
    let el = document.getElementById('camera-button');

    interact(el).draggable({
      listeners: {
        start(event) {
          // clone to make a ghost
          const ghost = event.target.cloneNode(true);
          ghost.id = "drag-ghost";
          ghost.style.position = "absolute";
          ghost.style.opacity = 0.55;
          ghost.style.pointerEvents = "none";
          ghost.style.zIndex = "9999";
          document.body.appendChild(ghost);
          event.interaction.ghost = ghost;
        },
        move(event) {
          if (event.interaction.ghost) {
            event.interaction.ghost.style.left = event.pageX - 32 + "px";
            event.interaction.ghost.style.top = event.pageY - 32 + "px";
          }
        },
        end(event) {
          if (event.interaction.ghost) event.interaction.ghost.remove();
        }
      }
    });
    const mapElement = mapAPI.getTargetElement();
    interact(`#${mapElement.id}`).dropzone({
      ondrop: function(event) {
        const mapRect = mapElement.getBoundingClientRect();

        const dropPixel = [
          event.dragEvent.clientX - mapRect.left,
          event.dragEvent.clientY - mapRect.top
        ];

        const mapCoordinate = mapAPI.getCoordinateFromPixel(dropPixel);

        if (mapCoordinate && !isNaN(mapCoordinate[0]) && !isNaN(mapCoordinate[1])) {
          const cameraFeature = createCameraFeature({
            id: undefined,
            position: mapCoordinate,
            azimuth: undefined,
            fov: undefined,
            radius: undefined,
            color: undefined,
            zIndex: undefined,
          });
          mapAPI.addFeature(cameraFeature);
        }
      }
    });
  }
}
