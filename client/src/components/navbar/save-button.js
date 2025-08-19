import Memory from "../../models/Memory";
import { saveAs } from "file-saver";

export default class SaveButton {
  constructor() { }

  render() {
    return `
      <div id="save-button" class="navbar-icon navbar-icon-size2">
        <svg class="navbar-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
          <path fill-rule="evenodd" d="M14 0H2a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V4l-4-4ZM9 16c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3Zm3-10H2V2h10v4Z"/>
        </svg>
      </div>
    `;
  }
  addBehaviour() {
    const el = document.getElementById('save-button');
    el.addEventListener('click', () => {
      const str = Memory.getInstance().toGeoJSON();
      const blob = new Blob([str], {
        type: "application/geo+json;charset=utf-8"
      });
      saveAs(blob, "cameras.geojson");
    });
  }
}
