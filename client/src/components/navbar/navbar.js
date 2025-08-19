import './navbar.css';
import './navbar-icons.css';
import CameraButton from './camera-button';
import SaveButton from './save-button';
import LoadButton from './load-button';
import DeleteAllButton from './delete-all-button';

export default class Navbar {
  // constructor must take a selector which finds the element to insert the component in
  constructor(selector) {
    this.element = document.querySelector(selector);
    if (this.element) {
      this.render();
      this.addBehaviour();
    }
  }

  render() {
    let cameraButton = new CameraButton();
    let saveButton = new SaveButton();
    let loadButton = new LoadButton();
    let deleteAllButton = new DeleteAllButton();

    this.element.innerHTML = `
      <div class="navbar-content">
        <div class="navbar-main">
          ${cameraButton.render()}
          <div class="navbar-verticalline"></div>
          ${saveButton.render()}
          ${loadButton.render()}
          ${deleteAllButton.render()}
        </div>
      </div>
    `;
    cameraButton.addBehaviour();
    saveButton.addBehaviour();
    loadButton.addBehaviour();
    deleteAllButton.addBehaviour();
  }
  addBehaviour() { }
}
