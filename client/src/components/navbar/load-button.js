import Memory from "../../models/memory";

export default class LoadButton {
  constructor() { }

  render() {
    return `
      <div id="load-button" class="navbar-icon navbar-icon-size2">
        <svg class="navbar-icon-svg" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 18 18">
	        <path d="M3.6 2.5H8c.4 0 .8.2 1.1.6l.8 1.5c.1.3.3.4.5.4h10c.7 0 1.2.5 1.2 1.2v1.1H2.4V3.7c0-.6.6-1.2 1.2-1.2zm17.8 18.4c0 .3-.3.6-.6.6H3.2c-.3 0-.6-.2-.6-.5L1 9c0-.2 0-.4.2-.5.1-.1.3-.2.5-.2h20.7c.2 0 .4.1.5.2 0 .2.1.4.1.6l-1.6 11.8z"/>
        </svg>
        <input type="file" id="geoJSON-upload" accept=".geojson,application/geo+json" style="display: none">
      </div>
    `;
  }
  addBehaviour() {
    const el = document.getElementById('load-button');
    const input = document.getElementById('geoJSON-upload');
    el.addEventListener('click', () => {
      input.click();
    });
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const geoJSON = event.target.result;
        
        Memory.getInstance().fromGeoJSON(geoJSON);
      };
      reader.readAsText(file);
      input.value = '';  // without this, the app cannot load the same file in a row
    });
  }
}
